/**
 * Patches Page
 * 패치 관리 통합 페이지 - Standard/Custom 탭으로 구분
 */

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { GitBranch, Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { PatchFileExplorer } from '@/widgets/patches'

import { usePermission } from '@/shared/lib/hooks'
import { useAuthStore, useProjectStore } from '@/shared/store'

import {
  PatchTable,
  PatchCreateForm,
  CustomPatchCreateForm,
  PatchDeleteModal,
  type PatchCreateFormData,
  type CustomPatchCreateFormData,
  type SortConfig,
  validatePatchForm,
} from '@/features/patches/patch-management'

import { customerApi, accountApi } from '@/entities/operations'
import {
  patchApi,
  usePatches,
  useCustomPatchCustomers,
  useCustomPatchVersions,
  useGenerateStandardPatch,
  useGenerateCustomPatch,
  useDeletePatch,
  type CumulativePatch,
  type CumulativePatchGenerateRequest,
  type CustomPatchGenerateRequest,
} from '@/entities/patches/patch'
import { useStandardReleaseTree, type VersionNode } from '@/entities/releases/release'

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { Button } from '@/shared/ui/button'
import { ContentCard } from '@/shared/ui/content-layout'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

type TabType = 'standard' | 'custom'

const TAB_CONFIG = {
  standard: {
    icon: DOMAIN_ICONS.patch,
    label: '스탠다드',
    addTooltip: '패치 생성',
    description: '표준 릴리즈 기반 패치를 생성하고 관리합니다.',
  },
  custom: {
    icon: DOMAIN_ICONS.customPatch,
    label: '커스텀',
    addTooltip: '커스텀 패치 생성',
    description: '커스텀 릴리즈 기반 패치를 생성하고 관리합니다.',
  },
} as const

interface PaginationState {
  pageIndex: number
  pageSize: number
}

const INITIAL_STANDARD_FORM: PatchCreateFormData = {
  fromVersion: '',
  toVersion: '',
  customerCode: '',
  assigneeId: null,
  description: '',
  includeAllBuildVersions: false,
  patchName: '',
}

const INITIAL_CUSTOM_FORM: CustomPatchCreateFormData = {
  customerId: null,
  fromVersion: '',
  toVersion: '',
  assigneeId: null,
  description: '',
  patchName: '',
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

export function PatchesPage() {
  const { toast } = useToast()
  const { startTransfer, handleProgress, completeTransfer, resetTransfer, transferState } = useFileTransferProgress()
  const user = useAuthStore((state) => state.user)
  const projectId = useProjectStore((state) => state.projectId)
  const { canAddPatch, canDeletePatch } = usePermission()

  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabType) || 'standard'

  // Standard 상태
  const [standardFormOpen, setStandardFormOpen] = useState(false)
  const [standardFormData, setStandardFormData] = useState<PatchCreateFormData>(INITIAL_STANDARD_FORM)
  const [standardPagination, setStandardPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [standardSort, setStandardSort] = useState<SortConfig | null>({
    key: 'createdAt',
    direction: 'desc',
  })

  // Custom 상태
  const [customFormOpen, setCustomFormOpen] = useState(false)
  const [customFormData, setCustomFormData] = useState<CustomPatchCreateFormData>(INITIAL_CUSTOM_FORM)
  const [customPagination, setCustomPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [customSort, setCustomSort] = useState<SortConfig | null>({
    key: 'createdAt',
    direction: 'desc',
  })

  // 공통 상태
  const [fileExplorerOpen, setFileExplorerOpen] = useState(false)
  const [selectedPatch, setSelectedPatch] = useState<CumulativePatch | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patchToDelete, setPatchToDelete] = useState<CumulativePatch | null>(null)
  const [selectedPatchType, setSelectedPatchType] = useState<TabType>('standard')

  // Standard Queries
  const {
    data: standardPatchesData,
    isLoading: isStandardLoading,
    error: standardError,
    refetch: refetchStandard,
  } = usePatches({
    page: standardPagination.pageIndex,
    size: standardPagination.pageSize,
    releaseType: 'STANDARD',
    projectId,
    sort: standardSort ? `${standardSort.key},${standardSort.direction}` : undefined,
  })

  const { data: treeData, isLoading: isTreeLoading } = useStandardReleaseTree(projectId, {
    enabled: standardFormOpen,
  })

  const { data: customers } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customerApi.getList({ isActive: true, size: 1000 }),
    enabled: standardFormOpen,
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts-engineer'],
    queryFn: () => accountApi.getList({ size: 10000, departmentType: 'ENGINEER' }),
    enabled: standardFormOpen || customFormOpen,
  })

  const standardVersions = getVersionsFromTree(treeData)

  // Custom Queries
  const {
    data: customPatchesData,
    isLoading: isCustomLoading,
    error: customError,
    refetch: refetchCustom,
  } = usePatches({
    page: customPagination.pageIndex,
    size: customPagination.pageSize,
    releaseType: 'CUSTOM',
    projectId,
    sort: customSort ? `${customSort.key},${customSort.direction}` : undefined,
  })

  const { data: customCustomers = [], isLoading: isCustomersLoading } = useCustomPatchCustomers(
    projectId,
    { enabled: customFormOpen }
  )

  const { data: customVersions = [], isLoading: isVersionsLoading } = useCustomPatchVersions(
    customFormData.customerId,
    projectId,
    { enabled: customFormOpen && !!customFormData.customerId }
  )

  // Mutations
  const standardGenerateMutation = useGenerateStandardPatch()
  const customGenerateMutation = useGenerateCustomPatch()
  const deleteMutation = useDeletePatch()

  // 탭 변경
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Standard 핸들러
  const handleStandardSort = (key: string) => {
    setStandardSort((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleStandardSubmit = () => {
    const validation = validatePatchForm(standardFormData)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(' ')
      toast({ title: '입력 오류', description: errorMessage, variant: 'destructive' })
      return
    }

    const selectedCustomer = customers?.content.find(
      (c) => c.customerCode === standardFormData.customerCode
    )

    const request: CumulativePatchGenerateRequest = {
      projectId,
      type: 'standard',
      customerId: selectedCustomer?.customerId,
      fromVersion: standardFormData.fromVersion,
      toVersion: standardFormData.toVersion,
      createdByEmail: user?.email || '',
      assigneeId: standardFormData.assigneeId || undefined,
      description: standardFormData.description || undefined,
      includeAllBuildVersions: standardFormData.includeAllBuildVersions || undefined,
      patchName: standardFormData.patchName || undefined,
    }

    standardGenerateMutation.mutate(request, {
      onSuccess: (data: CumulativePatch) => {
        toast({
          title: '패치 생성 완료',
          description: `${data.patchName} 패치가 생성되었습니다.`,
        })
        setStandardFormData(INITIAL_STANDARD_FORM)
        setStandardFormOpen(false)
      },
      onError: createErrorHandler(toast, '패치 생성 실패'),
    })
  }

  // Custom 핸들러
  const handleCustomSort = (key: string) => {
    setCustomSort((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleCustomSubmit = () => {
    if (!customFormData.customerId) {
      toast({ title: '입력 오류', description: '고객사를 선택해주세요.', variant: 'destructive' })
      return
    }

    if (!customFormData.fromVersion || !customFormData.toVersion) {
      toast({ title: '입력 오류', description: '버전 범위를 선택해주세요.', variant: 'destructive' })
      return
    }

    const request: CustomPatchGenerateRequest = {
      projectId,
      customerId: customFormData.customerId,
      fromVersion: customFormData.fromVersion,
      toVersion: customFormData.toVersion,
      createdByEmail: user?.email || '',
      assigneeId: customFormData.assigneeId || undefined,
      description: customFormData.description || undefined,
      patchName: customFormData.patchName || undefined,
    }

    customGenerateMutation.mutate(request, {
      onSuccess: (data: CumulativePatch) => {
        toast({
          title: '패치 생성 완료',
          description: `${data.patchName} 패치가 생성되었습니다.`,
        })
        setCustomFormData(INITIAL_CUSTOM_FORM)
        setCustomFormOpen(false)
      },
      onError: createErrorHandler(toast, '패치 생성 실패'),
    })
  }

  // 공통 핸들러
  const handleDownload = async (patch: CumulativePatch) => {
    if (transferState.isTransferring) return
    const fileName = `${patch.patchName}.zip`

    startTransfer(fileName, 'download')
    try {
      await patchApi.download(patch.patchId, fileName, handleProgress)
      completeTransfer()
    } catch (error) {
      resetTransfer()
      toast({
        title: '다운로드 실패',
        description: error instanceof Error ? error.message : '파일 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleViewFiles = (patch: CumulativePatch, type: TabType) => {
    setSelectedPatch(patch)
    setSelectedPatchType(type)
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

  // 추가 버튼 핸들러
  const handleAdd = () => {
    if (currentTab === 'standard') {
      setStandardFormOpen(true)
    } else {
      setCustomFormOpen(true)
    }
  }

  const currentTabConfig = TAB_CONFIG[currentTab]
  const standardPatchList = standardPatchesData?.content || []
  const customPatchList = customPatchesData?.content || []

  return (
    <PageLayout
      actions={
        canAddPatch && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleAdd} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentTabConfig.addTooltip}</p>
            </TooltipContent>
          </Tooltip>
        )
      }
    >
      <ContentCard noPadding>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          {/* Tab Header */}
          <div className="px-8 pt-2">
            <TabsList variant="line" className="border-0">
              {(Object.keys(TAB_CONFIG) as TabType[]).map((tabKey) => {
                const config = TAB_CONFIG[tabKey]
                const Icon = config.icon
                return (
                  <TabsTrigger key={tabKey} value={tabKey} variant="line">
                    <Icon className="w-4 h-4 mr-2" />
                    {config.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Standard Tab */}
          <TabsContent value="standard" className="px-8 pb-8">
            {isStandardLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : standardError ? (
              <ErrorDisplay
                title="데이터를 불러오는 중 오류가 발생했습니다."
                error={standardError as Error}
                onRetry={refetchStandard}
              />
            ) : (
              <>
                <PatchTable
                  patches={standardPatchList}
                  sort={standardSort}
                  isDeleting={deleteMutation.isPending}
                  showDelete={canDeletePatch}
                  onSort={handleStandardSort}
                  onViewFiles={(patch) => handleViewFiles(patch, 'standard')}
                  onDownload={handleDownload}
                  onDelete={handleDeleteClick}
                  viewportHeight="calc(100vh - 30rem)"
                />
                {standardPatchList.length > 0 && (
                  <div className="pt-6">
                    <DataTablePagination
                      pageIndex={standardPagination.pageIndex}
                      pageSize={standardPagination.pageSize}
                      totalElements={standardPatchesData?.totalElements || 0}
                      onPaginationChange={setStandardPagination}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="px-8 pb-8">
            {isCustomLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : customError ? (
              <ErrorDisplay
                title="데이터를 불러오는 중 오류가 발생했습니다."
                error={customError as Error}
                onRetry={refetchCustom}
              />
            ) : (
              <>
                <PatchTable
                  patches={customPatchList}
                  sort={customSort}
                  isDeleting={deleteMutation.isPending}
                  showDelete={canDeletePatch}
                  onSort={handleCustomSort}
                  onViewFiles={(patch) => handleViewFiles(patch, 'custom')}
                  onDownload={handleDownload}
                  onDelete={handleDeleteClick}
                  viewportHeight="calc(100vh - 30rem)"
                />
                {customPatchList.length > 0 && (
                  <div className="pt-6">
                    <DataTablePagination
                      pageIndex={customPagination.pageIndex}
                      pageSize={customPagination.pageSize}
                      totalElements={customPatchesData?.totalElements || 0}
                      onPaginationChange={setCustomPagination}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </ContentCard>

      {/* Standard Patch Create Form */}
      <PatchCreateForm
        isOpen={standardFormOpen}
        formData={standardFormData}
        versions={standardVersions}
        customers={customers?.content || []}
        accounts={accounts?.content || []}
        isVersionsLoading={isTreeLoading}
        isSubmitting={standardGenerateMutation.isPending}
        onFormDataChange={setStandardFormData}
        onSubmit={handleStandardSubmit}
        onClose={() => {
          setStandardFormData(INITIAL_STANDARD_FORM)
          setStandardFormOpen(false)
        }}
      />

      {/* Custom Patch Create Form */}
      <CustomPatchCreateForm
        isOpen={customFormOpen}
        formData={customFormData}
        customers={customCustomers}
        versions={customVersions}
        accounts={accounts?.content || []}
        isCustomersLoading={isCustomersLoading}
        isVersionsLoading={isVersionsLoading}
        isSubmitting={customGenerateMutation.isPending}
        onFormDataChange={setCustomFormData}
        onSubmit={handleCustomSubmit}
        onClose={() => {
          setCustomFormData(INITIAL_CUSTOM_FORM)
          setCustomFormOpen(false)
        }}
      />

      {/* File Explorer */}
      <PatchFileExplorer
        open={fileExplorerOpen}
        onOpenChange={setFileExplorerOpen}
        patchId={selectedPatch?.patchId || null}
        patchName={selectedPatch?.patchName || ''}
        icon={selectedPatchType === 'custom' ? GitBranch : undefined}
      />

      {/* Delete Modal */}
      <PatchDeleteModal
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
