/**
 * Standard Patch Page
 * 표준 패치 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Plus, RefreshCw, Package } from 'lucide-react'

import { getPageIconById } from '@/shared/config/menu-icons'

import { PatchFileExplorer } from '@/widgets/patches'

import { usePermission } from '@/shared/lib/hooks'
import { useAuthStore, useProjectStore } from '@/shared/store'

import {
  PatchTable,
  PatchCreateForm,
  PatchDeleteDialog,
  type PatchCreateFormData,
  type SortConfig,
  validatePatchForm,
} from '@/features/patches/patch-management'

import { customerApi } from '@/entities/operations'
import { engineerApi } from '@/entities/operations'
import {
  patchApi,
  usePatches,
  useGeneratePatch,
  useDeletePatch,
  type CumulativePatch,
  type CumulativePatchGenerateRequest,
} from '@/entities/patches/patch'
import { useStandardReleaseTree, type VersionNode } from '@/entities/releases/release'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { Button } from '@/shared/ui/button'
import { DynamicBreadcrumb } from '@/shared/ui/dynamic-breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { PageHeader } from '@/shared/ui/page-header'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
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
  const user = useAuthStore((state) => state.user)
  const projectId = useProjectStore((state) => state.projectId)
  const { canAddPatch, canDeletePatch } = usePermission()

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
  } = usePatches({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    releaseType: 'STANDARD',
    projectId,
    sort: sort ? `${sort.key},${sort.direction}` : undefined,
  })

  const { data: treeData, isLoading: isTreeLoading } = useStandardReleaseTree(projectId, {
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
  const generateMutation = useGeneratePatch()
  const deleteMutation = useDeletePatch()

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

    generateMutation.mutate(request, {
      onSuccess: (data) => {
        toast({
          title: '패치 생성 완료',
          description: `${data.patchName} 패치가 생성되었습니다.`,
        })
        resetForm()
        setIsFormOpen(false)
      },
      onError: createErrorHandler(toast, '패치 생성 실패'),
    })
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
      deleteMutation.mutate(patchToDelete.patchId, {
        onSuccess: () => {
          toast({
            title: '패치 삭제 완료',
            description: `${patchToDelete.patchName} 패치가 삭제되었습니다.`,
          })
          setDeleteDialogOpen(false)
          setPatchToDelete(null)
        },
        onError: createErrorHandler(toast, '패치 삭제 실패'),
      })
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
      <DynamicBreadcrumb />

      {/* Page Header */}
      <PageHeader
        icon={getPageIconById('patch_standard')}
        title="패치 관리 (Standard)"
        description="표준 릴리즈 기반 패치를 생성하고 관리합니다."
        actions={
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => refetch()} variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>새로고침</p>
              </TooltipContent>
            </Tooltip>
            {canAddPatch && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setIsFormOpen(true)} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>패치 생성</p>
                </TooltipContent>
              </Tooltip>
            )}
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
                showDelete={canDeletePatch}
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
