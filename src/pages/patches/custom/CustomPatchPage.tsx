/**
 * Custom Patch Page
 * 커스텀 패치 관리 페이지 - Feature 컴포넌트를 조합하여 구성
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
  CustomPatchCreateForm,
  PatchDeleteDialog,
  type CustomPatchCreateFormData,
  type SortConfig,
} from '@/features/patches/patch-management'

import { engineerApi } from '@/entities/operations'
import {
  patchApi,
  usePatches,
  useCustomPatchCustomers,
  useCustomPatchVersions,
  useGenerateCustomPatch,
  useDeletePatch,
  type CumulativePatch,
  type CustomPatchGenerateRequest,
} from '@/entities/patches/patch'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted } from '@/shared/ui/typography'

interface PaginationState {
  pageIndex: number
  pageSize: number
}

const INITIAL_FORM_DATA: CustomPatchCreateFormData = {
  customerId: null,
  fromVersion: '',
  toVersion: '',
  engineerId: null,
  description: '',
  patchName: '',
}

export function CustomPatchPage() {
  const { toast } = useToast()
  const user = useAuthStore((state) => state.user)
  const projectId = useProjectStore((state) => state.projectId)
  const { canAddPatch, canDeletePatch } = usePermission()

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<CustomPatchCreateFormData>(INITIAL_FORM_DATA)

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
    releaseType: 'CUSTOM',
    projectId,
    sort: sort ? `${sort.key},${sort.direction}` : undefined,
  })

  const { data: customers = [], isLoading: isCustomersLoading } = useCustomPatchCustomers(
    projectId,
    { enabled: isFormOpen }
  )

  const { data: versions = [], isLoading: isVersionsLoading } = useCustomPatchVersions(
    formData.customerId,
    projectId,
    { enabled: isFormOpen && !!formData.customerId }
  )

  const { data: engineers } = useQuery({
    queryKey: ['engineers-all'],
    queryFn: () => engineerApi.getList({ size: 1000 }),
    enabled: isFormOpen,
  })

  // Mutations
  const generateMutation = useGenerateCustomPatch()
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
    if (!formData.customerId) {
      toast({ title: '입력 오류', description: '고객사를 선택해주세요.', variant: 'destructive' })
      return
    }

    if (!formData.fromVersion || !formData.toVersion) {
      toast({ title: '입력 오류', description: '버전 범위를 선택해주세요.', variant: 'destructive' })
      return
    }

    const request: CustomPatchGenerateRequest = {
      projectId,
      customerId: formData.customerId,
      fromVersion: formData.fromVersion,
      toVersion: formData.toVersion,
      createdBy: user?.email || '',
      engineerId: formData.engineerId || undefined,
      description: formData.description || undefined,
      patchName: formData.patchName || undefined,
    }

    generateMutation.mutate(request, {
      onSuccess: (data: CumulativePatch) => {
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
    <PageLayout
      icon={getPageIconById('patch_custom')}
      title="패치 관리 (Custom)"
      description="커스텀 릴리즈 기반 패치를 생성하고 관리합니다."
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
    >
      {/* Patch List Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              커스텀 패치 목록
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

      {/* Custom Patch Create Form */}
      <CustomPatchCreateForm
        isOpen={isFormOpen}
        formData={formData}
        customers={customers}
        versions={versions}
        engineers={engineers?.content || []}
        isCustomersLoading={isCustomersLoading}
        isVersionsLoading={isVersionsLoading}
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
    </PageLayout>
  )
}
