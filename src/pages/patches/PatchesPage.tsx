/**
 * Patches Page
 * 패치 관리 통합 페이지 - Standard/Custom 탭으로 구분
 */

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { GitBranch, Info, Plus, Trash2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { PatchFileExplorer } from '@/widgets/patches'


import {
  PatchTable,
  PatchCreateForm,
  CustomPatchCreateForm,
  PatchDeleteModal,
  PatchBulkDeleteModal,
  type PatchCreateFormData,
  type CustomPatchCreateFormData,
  type SortConfig,
  type VersionOption,
  validatePatchForm,
} from '@/features/patches/patch-management'

import { customerApi } from '@/entities/operations'
import {
  patchApi,
  usePatches,
  useCustomPatchCustomers,
  useCustomPatchVersions,
  useGenerateStandardPatch,
  useGenerateCustomPatch,
  useDeletePatch,
  useBulkDeletePatches,
  type CumulativePatch,
  type CumulativePatchGenerateRequest,
  type CustomPatchGenerateRequest,
  type GenerateResponse,
} from '@/entities/patches/patch'
import {
  useStandardReleaseTree,
  type VersionNode,
} from '@/entities/releases/release'

import { useServerProgress } from '@/shared/api'
import { generateProgressId } from '@/shared/lib/progress/generateProgressId'
import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { usePermission } from '@/shared/lib/hooks'
import { useNavigationBlock } from '@/shared/lib/hooks/use-navigation-block'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { useAuthStore, useProjectStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import { ContentCard } from '@/shared/ui/content-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

type TabType = 'standard' | 'custom'

const TAB_CONFIG = {
  standard: {
    icon: DOMAIN_ICONS.patch,
    label: '표준',
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
  fromVersionId: null,
  toVersionId: null,
  projectId: '',
  customerCode: '',
  customerId: null,
  assigneeId: null,
  description: '',
  // 빌드 파일 포함 default ON. data 로드 후 PatchCreateForm 의 useEffect 가 자동 preselect.
  buildSelection: { enabled: true, web: null, engines: [] },
  patchName: '',
}

const INITIAL_CUSTOM_FORM: CustomPatchCreateFormData = {
  customerId: null,
  fromVersion: '',
  toVersion: '',
  fromVersionId: null,
  toVersionId: null,
  projectId: '',
  assigneeId: null,
  description: '',
  patchName: '',
  // 빌드 파일 포함 default ON — 표준 흐름과 동일 정책
  buildSelection: { enabled: true, web: null, engines: [] },
}

/**
 * 트리에서 base 버전만 추출합니다.
 * VersionNode 자체는 항상 base (hotfixVersion=0, buildVersion=0) 이며
 * 빌드/핫픽스는 각각 v.builds / v.hotfixes 하위에만 있습니다.
 */
function getVersionsFromTree(
  data: { majorMinorGroups: { versions: VersionNode[] }[] } | undefined
): VersionOption[] {
  if (!data) return []
  const options: VersionOption[] = []
  data.majorMinorGroups.forEach((group) => {
    group.versions.forEach((v) => {
      options.push({ version: v.version, versionId: v.versionId })
    })
  })
  return options.sort((a, b) => {
    const aParts = a.version.split('.').map(Number)
    const bParts = b.version.split('.').map(Number)
    const len = Math.max(aParts.length, bParts.length)
    for (let i = 0; i < len; i++) {
      const ai = aParts[i] ?? 0
      const bi = bParts[i] ?? 0
      if (ai !== bi) return ai - bi
    }
    return 0
  })
}

export function PatchesPage() {
  const { toast } = useToast()
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

  // 일괄 삭제 상태
  const [standardSelectedIds, setStandardSelectedIds] = useState<number[]>([])
  const [customSelectedIds, setCustomSelectedIds] = useState<number[]>([])
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  // 패치 생성 진행도 polling 용 ID — mutation 시작 시 ID 설정, 종료 시 null
  const [activeProgressId, setActiveProgressId] = useState<string | null>(null)

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

  const standardVersionOptions = getVersionsFromTree(treeData)
  const standardVersions = standardVersionOptions.map((o) => o.version)

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
  const bulkDeleteMutation = useBulkDeletePatches()

  // 패치 생성 진행도 polling — activeProgressId 가 set 된 동안 1초 간격 fetch
  const progressQuery = useServerProgress(
    activeProgressId,
    activeProgressId !== null,
  )

  // 패치 생성 진행 중에만 페이지 이탈 차단 (폼 작성 중 상태는 허용)
  const isGenerating =
    standardGenerateMutation.isPending || customGenerateMutation.isPending

  useNavigationBlock(
    isGenerating,
    '패치 생성이 진행 중입니다. 떠나시겠습니까? 진행 중인 작업이 미완료될 수 있습니다.'
  )

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
      patchName: standardFormData.patchName || undefined,
      buildSelection: standardFormData.buildSelection ?? null,
    }

    // 진행도 polling 용 ID — mutation 시작 시점에 고유 ID 생성.
    // crypto.randomUUID 는 secure context (HTTPS) 에서만 동작 → HTTP 운영 환경에서도
    // 작동하도록 timestamp + random fallback 사용. progressId 는 단일 사용자의 단일
    // 패치 생성 매핑 용도라 보안 강도 낮아도 충분.
    const progressId = generateProgressId()
    setActiveProgressId(progressId)

    standardGenerateMutation.mutate({ data: request, progressId }, {
      onSuccess: (data: GenerateResponse) => {
        toast({
          title: '패치 생성 완료',
          description: `${data.patchName} 패치가 생성되었습니다.`,
        })
        if (data.hotfixesInRange.length > 0) {
          toast({
            title: '핫픽스 안내',
            description:
              `이 범위에 핫픽스 ${data.hotfixesInRange.length}건이 있습니다. ` +
              `핫픽스는 버전 관리 화면에서 별도로 다운로드/적용해 주세요. ` +
              `(${data.hotfixesInRange.map((h) => h.fullVersion).join(', ')})`,
          })
        }
        setStandardFormData(INITIAL_STANDARD_FORM)
        setStandardFormOpen(false)
        setActiveProgressId(null)
      },
      onError: (error) => {
        setActiveProgressId(null)
        createErrorHandler(toast, '패치 생성 실패')(error)
      },
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
      buildSelection: customFormData.buildSelection ?? null,
    }

    const progressId = generateProgressId()
    setActiveProgressId(progressId)

    customGenerateMutation.mutate({ data: request, progressId }, {
      onSuccess: (data: CumulativePatch) => {
        toast({
          title: '패치 생성 완료',
          description: `${data.patchName} 패치가 생성되었습니다.`,
        })
        setCustomFormData(INITIAL_CUSTOM_FORM)
        setCustomFormOpen(false)
        setActiveProgressId(null)
      },
      onError: (error) => {
        setActiveProgressId(null)
        createErrorHandler(toast, '패치 생성 실패')(error)
      },
    })
  }

  // 공통 핸들러
  const handleDownload = (patch: CumulativePatch) => {
    patchApi.download(patch.patchId)
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

  // 일괄 삭제 핸들러
  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true)
  }

  const handleBulkDeleteConfirm = () => {
    const selectedIds = currentTab === 'standard' ? standardSelectedIds : customSelectedIds

    bulkDeleteMutation.mutate(selectedIds, {
      onSuccess: () => {
        toast({
          title: '패치 일괄 삭제 완료',
          description: `${selectedIds.length}개의 패치가 삭제되었습니다.`,
        })
        setBulkDeleteDialogOpen(false)
        if (currentTab === 'standard') {
          setStandardSelectedIds([])
        } else {
          setCustomSelectedIds([])
        }
      },
      onError: createErrorHandler(toast, '패치 일괄 삭제 실패'),
    })
  }

  // 추가 버튼 핸들러 — 매번 INITIAL 로 reset 해서 buildSelection default ON 보장.
  // (사용자가 이전 세션에서 토글 OFF 한 채 close 했더라도 다시 열면 default 적용)
  const handleAdd = () => {
    if (currentTab === 'standard') {
      setStandardFormData({ ...INITIAL_STANDARD_FORM, projectId })
      setStandardFormOpen(true)
    } else {
      setCustomFormData({ ...INITIAL_CUSTOM_FORM, projectId })
      setCustomFormOpen(true)
    }
  }

  const currentTabConfig = TAB_CONFIG[currentTab]
  const standardPatchList = standardPatchesData?.content || []
  const customPatchList = customPatchesData?.content || []

  // 현재 탭의 선택된 ID 수
  const currentSelectedCount = currentTab === 'standard' ? standardSelectedIds.length : customSelectedIds.length

  return (
    <PageLayout
      description="릴리즈 범위로 누적 패치를 생성하고 고객사별로 배포하세요."
      actions={
        <div className="flex items-center gap-2">
          {canDeletePatch && currentSelectedCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleBulkDeleteClick}
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentSelectedCount}개 패치 삭제</p>
              </TooltipContent>
            </Tooltip>
          )}
          {canAddPatch && (
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
          )}
        </div>
      }
    >
      {/* 운영 관리 안내 배너 — 생성된 패치 파일 처리 가이드 */}
      <div className="mb-4 p-3 rounded-md border bg-muted/50">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-foreground">패치 관리 안내</p>
            <ul className="mt-1.5 ml-4 list-disc space-y-0.5 text-muted-foreground">
              <li>
                생성된 패치 파일을{' '}
                <strong className="text-foreground">실제 사이트에 적용 후 반드시 “패치 완료” 처리</strong>해 주세요.
              </li>
              <li>
                <strong className="text-foreground">사용 계획이 없는 패치는 “삭제”</strong> 해주세요.
              </li>
              <li>
                생성 후{' '}
                <strong className="text-foreground">30일이 지난 패치 파일은 자동 “삭제”</strong> 됩니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 페이지 레벨 탭 + ContentCard 로 분리 (기존 TabbedContentCard 구조 해체) */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          {(Object.keys(TAB_CONFIG) as TabType[]).map((tabKey) => {
            const config = TAB_CONFIG[tabKey]
            const Icon = config.icon
            return (
              <TabsTrigger key={tabKey} value={tabKey}>
                <Icon className="w-4 h-4 mr-1.5" />
                {config.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="standard">
          <ContentCard>
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
                  selectable={canDeletePatch}
                  selectedIds={standardSelectedIds}
                  onSelectionChange={setStandardSelectedIds}
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
          </ContentCard>
        </TabsContent>

        <TabsContent value="custom">
          <ContentCard>
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
                  selectable={canDeletePatch}
                  selectedIds={customSelectedIds}
                  onSelectionChange={setCustomSelectedIds}
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
          </ContentCard>
        </TabsContent>
      </Tabs>

      {/* Standard Patch Create Form */}
      <PatchCreateForm
        isOpen={standardFormOpen}
        formData={standardFormData}
        versions={standardVersions}
        versionOptions={standardVersionOptions}
        customers={customers?.content || []}
        isVersionsLoading={isTreeLoading}
        isSubmitting={standardGenerateMutation.isPending}
        progress={progressQuery.data ?? null}
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
        isCustomersLoading={isCustomersLoading}
        isVersionsLoading={isVersionsLoading}
        isSubmitting={customGenerateMutation.isPending}
        progress={progressQuery.data ?? null}
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

      {/* Bulk Delete Modal */}
      <PatchBulkDeleteModal
        isOpen={bulkDeleteDialogOpen}
        isDeleting={bulkDeleteMutation.isPending}
        count={currentSelectedCount}
        onConfirm={handleBulkDeleteConfirm}
        onClose={() => setBulkDeleteDialogOpen(false)}
      />
    </PageLayout>
  )
}
