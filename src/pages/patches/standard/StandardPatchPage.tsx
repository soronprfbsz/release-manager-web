/**
 * Standard Patch Page
 * 표준 패치 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { useProject } from '@/app/providers/ProjectProvider'

import { PatchFileExplorer } from '@/widgets/patch-file-explorer'

import {
  PatchTable,
  PatchCreateForm,
  PatchDeleteDialog,
  type PatchCreateFormData,
  type SortConfig,
  validatePatchForm,
} from '@/features/patch-management'

import { customerApi } from '@/entities/customer'
import { engineerApi } from '@/entities/engineer'
import { patchApi, type CumulativePatch, type CumulativePatchGenerateRequest } from '@/entities/patch'
import { releaseApi, type VersionNode } from '@/entities/release'

import { useToast } from '@/shared/lib/hooks/use-toast'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { PageHeader } from '@/shared/ui/page-header'
import { TypographyMuted } from '@/shared/ui/typography'

interface PaginationState {
  pageIndex: number
  pageSize: number
}

const INITIAL_FORM_DATA: PatchCreateFormData = {
  fromVersion: '',
  toVersion: '',
  customerCode: '',
  engineerId: null,
  description: '',
}

function getVersionsFromTree(
  data: { majorMinorGroups: { versions: VersionNode[] }[] } | undefined
): string[] {
  if (!data) return []
  const versions: string[] = []
  data.majorMinorGroups.forEach((group) => {
    group.versions.forEach((v) => {
      versions.push(v.version)
    })
  })
  return versions.sort((a, b) => {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i]
    }
    return 0
  })
}

export function StandardPatchPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { projectId } = useProject()
  const queryClient = useQueryClient()

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<PatchCreateFormData>(INITIAL_FORM_DATA)

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Sort state
  const [sort, setSort] = useState<SortConfig | null>({
    key: 'createdAt',
    direction: 'desc',
  })

  // File explorer state
  const [fileExplorerOpen, setFileExplorerOpen] = useState(false)
  const [selectedPatch, setSelectedPatch] = useState<CumulativePatch | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patchToDelete, setPatchToDelete] = useState<CumulativePatch | null>(null)

  // Queries
  const {
    data: patchesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cumulative-patches', 'STANDARD', pagination, sort],
    queryFn: () =>
      patchApi.getList({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        releaseType: 'STANDARD',
        sort: sort ? `${sort.key},${sort.direction}` : undefined,
      }),
  })

  const { data: treeData, isLoading: isTreeLoading } = useQuery({
    queryKey: ['standard-release-tree', projectId],
    queryFn: () => releaseApi.getStandardTree(projectId),
    enabled: isFormOpen,
  })

  const { data: customers } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customerApi.getList({ isActive: true, size: 1000 }),
    enabled: isFormOpen,
  })

  const { data: engineers } = useQuery({
    queryKey: ['engineers-all'],
    queryFn: () => engineerApi.getList({ size: 1000 }),
    enabled: isFormOpen,
  })

  const versions = getVersionsFromTree(treeData)

  // Mutations
  const generateMutation = useMutation({
    mutationFn: (request: CumulativePatchGenerateRequest) => patchApi.generate(request),
    onSuccess: (data) => {
      toast({
        title: '패치 생성 완료',
        description: `${data.patchName} 패치가 생성되었습니다.`,
      })
      queryClient.invalidateQueries({ queryKey: ['cumulative-patches'] })
      resetForm()
      setIsFormOpen(false)
    },
    onError: (error: Error) => {
      toast({
        title: '패치 생성 실패',
        description: error.message || '패치 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => patchApi.deleteById(id),
    onSuccess: () => {
      toast({
        title: '패치 삭제 완료',
        description: `${patchToDelete?.patchName} 패치가 삭제되었습니다.`,
      })
      queryClient.invalidateQueries({ queryKey: ['cumulative-patches'] })
      setDeleteDialogOpen(false)
      setPatchToDelete(null)
    },
    onError: (error: Error) => {
      toast({
        title: '패치 삭제 실패',
        description: error.message || '패치 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  // Handlers
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA)
  }

  const handleSort = (key: string) => {
    setSort((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleSubmit = () => {
    const validation = validatePatchForm(formData)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(' ')
      toast({ title: '입력 오류', description: errorMessage, variant: 'destructive' })
      return
    }

    const selectedCustomer = customers?.content.find(
      (c) => c.customerCode === formData.customerCode
    )

    const request: CumulativePatchGenerateRequest = {
      projectId,
      type: 'standard',
      customerId: selectedCustomer?.customerId,
      fromVersion: formData.fromVersion,
      toVersion: formData.toVersion,
      createdBy: user?.email || '',
      engineerId: formData.engineerId || undefined,
      description: formData.description || undefined,
    }

    generateMutation.mutate(request)
  }

  const handleDownload = (patch: CumulativePatch) => {
    const fileName = `${patch.patchName}.zip`
    patchApi.download(patch.patchId, fileName)
  }

  const handleViewFiles = (patch: CumulativePatch) => {
    setSelectedPatch(patch)
    setFileExplorerOpen(true)
  }

  const handleDeleteClick = (patch: CumulativePatch) => {
    setPatchToDelete(patch)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (patchToDelete) {
      deleteMutation.mutate(patchToDelete.patchId)
    }
  }

  const handleFormClose = () => {
    resetForm()
    setIsFormOpen(false)
  }

  const patchList = patchesData?.content || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span>패치 관리</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Standard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Package className="h-5 w-5 text-primary" />}
        title="Standard 패치"
        description="표준 릴리즈 기반 패치를 생성하고 관리합니다."
        actions={
          <>
            <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">
              <Plus className="h-4 w-4" />
              패치 생성
            </Button>
          </>
        }
      />

      {/* Patch List Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              표준 패치 목록
            </div>
            {patchList.length > 0 && (
              <TypographyMuted>총 {patchesData?.totalElements || 0}개</TypographyMuted>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <ErrorDisplay
              title="패치 목록을 불러오는 중 오류가 발생했습니다."
              error={error as Error}
              onRetry={refetch}
            />
          ) : (
            <>
              <PatchTable
                patches={patchList}
                sort={sort}
                isDeleting={deleteMutation.isPending}
                onSort={handleSort}
                onViewFiles={handleViewFiles}
                onDownload={handleDownload}
                onDelete={handleDeleteClick}
              />
              {patchList.length > 0 && (
                <div className="pt-4">
                  <DataTablePagination
                    pageIndex={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    totalElements={patchesData?.totalElements || 0}
                    onPaginationChange={setPagination}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Patch Create Form */}
      <PatchCreateForm
        isOpen={isFormOpen}
        formData={formData}
        versions={versions}
        customers={customers?.content || []}
        engineers={engineers?.content || []}
        isVersionsLoading={isTreeLoading}
        isSubmitting={generateMutation.isPending}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={handleFormClose}
      />

      {/* File Explorer */}
      <PatchFileExplorer
        open={fileExplorerOpen}
        onOpenChange={setFileExplorerOpen}
        patchId={selectedPatch?.patchId || null}
        patchName={selectedPatch?.patchName || ''}
      />

      {/* Delete Dialog */}
      <PatchDeleteDialog
        isOpen={deleteDialogOpen}
        isDeleting={deleteMutation.isPending}
        patchName={patchToDelete?.patchName || ''}
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteDialogOpen(false)
          setPatchToDelete(null)
        }}
      />
    </div>
  )
}
