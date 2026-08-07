/**
 * Releases Page
 * 버전 관리 통합 페이지 - Standard/Custom 탭으로 구분
 */

import { useState, useEffect } from 'react'

import { Network, Plus } from 'lucide-react'
import { useSearchParams, useLocation } from 'react-router-dom'

import { VersionCreateForm, CustomVersionCreateForm } from '@/widgets/releases'


import {
  CustomReleaseTree,
  type SelectedCustomVersionInfo,
} from '@/features/releases/custom'
import {
  ReleaseTree,
  VersionDetail,
  HotfixCreateForm,
  BuildCreateForm,
  type SelectedVersionInfo,
  type SelectedVersionData,
} from '@/features/releases/standard'

import {
  useStandardReleaseTree,
  useAllCustomReleaseTree,
  useDeleteVersion,
  useApproveVersion,
} from '@/entities/releases/release'

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { usePermission } from '@/shared/lib/hooks'
import { useNavigationBlock } from '@/shared/lib/hooks/use-navigation-block'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { findLatestVersionString } from '@/shared/lib/utils/version'
import { useProjectStore } from '@/shared/store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { ContentSplit } from '@/shared/ui/content-layout'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

type TabType = 'standard' | 'custom'

const TAB_CONFIG = {
  standard: {
    icon: DOMAIN_ICONS.release,
    label: '표준',
    addTooltip: '릴리즈 생성',
    treeTitle: '버전 트리',
  },
  custom: {
    icon: DOMAIN_ICONS.customRelease,
    label: '커스텀',
    addTooltip: '커스텀 릴리즈 생성',
    treeTitle: '커스텀 버전 트리',
  },
} as const

/** Standard 선택 상태 */
interface StandardSelectedState {
  versionId: number
  version: string
  isHotfix: boolean
  /** 빌드 여부 */
  isBuild?: boolean
  /** 빌드 base 버전 (예: 1.1.0) */
  buildBaseVersion?: string
}

/** Custom 선택 상태 */
interface CustomSelectedState {
  versionId: number
  version: string
  isHotfix: boolean
  siteCode: string
  customBaseVersion: string | null
  /** 빌드 여부 */
  isBuild?: boolean
  /** 빌드 base 버전 (예: 1.1.0) */
  buildBaseVersion?: string
}

/** 트리 액션 메뉴용 타겟 정보 */
interface ActionTargetInfo {
  versionId: number
  version: string
  isHotfix: boolean
  siteCode?: string
}

export function ReleasesPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabType) || 'standard'

  const projectId = useProjectStore((state) => state.projectId)
  const { canAddVersion, canDeleteVersion, canApproveVersion } = usePermission()
  const { toast } = useToast()

  // Standard 상태
  const [standardSelected, setStandardSelected] = useState<StandardSelectedState | null>(null)
  const [standardCreateOpen, setStandardCreateOpen] = useState(false)

  // Custom 상태
  const [customSelected, setCustomSelected] = useState<CustomSelectedState | null>(null)
  const [customCreateOpen, setCustomCreateOpen] = useState(false)

  // 공통 상태
  const [prevProjectId, setPrevProjectId] = useState(projectId)
  const [hotfixTarget, setHotfixTarget] = useState<ActionTargetInfo | null>(null)
  const [buildTarget, setBuildTarget] = useState<ActionTargetInfo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ActionTargetInfo | null>(null)
  const [approveTarget, setApproveTarget] = useState<ActionTargetInfo | null>(null)

  const deleteMutation = useDeleteVersion()
  const approveMutation = useApproveVersion()

  // 버전/빌드 생성 폼이 열려있는 동안 페이지 이탈 차단
  // (폼 내부에서도 isSubmitting 시 닫기 차단하지만, SPA 라우팅까지 잡으려면 Page 레벨도 필요)
  const isFormOpen = standardCreateOpen || customCreateOpen || !!buildTarget || !!hotfixTarget
  useNavigationBlock(
    isFormOpen,
    '작업이 진행 중이거나 폼이 열려있습니다. 떠나시겠습니까?'
  )

  // 프로젝트 변경 시 선택 초기화
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId)
    setStandardSelected(null)
    setCustomSelected(null)
  }

  // Standard 트리 데이터
  const {
    data: standardTreeData,
    isLoading: isStandardLoading,
    error: standardError,
    refetch: refetchStandardTree,
  } = useStandardReleaseTree(projectId)

  // Custom 트리 데이터
  const {
    data: customTreeData,
    isLoading: isCustomLoading,
    error: customError,
    refetch: refetchCustomTree,
  } = useAllCustomReleaseTree(projectId)

  // 홈페이지에서 전달된 버전 선택 (Standard) — 표준 버전 / 빌드 / 핫픽스 모두 매칭
  useEffect(() => {
    const state = location.state as { selectedVersionId?: number } | null
    if (!(state?.selectedVersionId && standardTreeData?.majorMinorGroups && !standardSelected && currentTab === 'standard')) return

    for (const group of standardTreeData.majorMinorGroups) {
      // 1) 표준 버전
      const foundVersion = group.versions.find(v => v.versionId === state.selectedVersionId)
      if (foundVersion) {
        setStandardSelected({
          versionId: foundVersion.versionId,
          version: foundVersion.version,
          isHotfix: false,
        })
        return
      }
      // 2) 빌드/핫픽스 (부모 표준 버전 아래에 nest)
      for (const version of group.versions) {
        const foundBuild = version.builds?.find(b => b.versionId === state.selectedVersionId)
        if (foundBuild) {
          setStandardSelected({
            versionId: foundBuild.versionId,
            version: foundBuild.fullVersion,
            isHotfix: false,
            isBuild: true,
            buildBaseVersion: version.version,
          })
          return
        }
        const foundHotfix = version.hotfixes?.find(h => h.versionId === state.selectedVersionId)
        if (foundHotfix) {
          setStandardSelected({
            versionId: foundHotfix.versionId,
            version: foundHotfix.fullVersion,
            isHotfix: true,
          })
          return
        }
      }
    }
  }, [location.state, standardTreeData, standardSelected, currentTab])

  // 홈페이지에서 전달된 버전 선택 (Custom) — 표준 버전 / 빌드 / 핫픽스 모두 매칭
  useEffect(() => {
    const state = location.state as { selectedVersionId?: number } | null
    if (!(state?.selectedVersionId && customTreeData?.sites && !customSelected && currentTab === 'custom')) return

    for (const site of customTreeData.sites) {
      for (const group of site.majorMinorGroups) {
        const foundVersion = group.versions.find(v => v.versionId === state.selectedVersionId)
        if (foundVersion) {
          setCustomSelected({
            versionId: foundVersion.versionId,
            version: foundVersion.version,
            isHotfix: false,
            siteCode: site.siteCode,
            customBaseVersion: site.customBaseVersion,
          })
          return
        }
        for (const version of group.versions) {
          const foundBuild = version.builds?.find(b => b.versionId === state.selectedVersionId)
          if (foundBuild) {
            setCustomSelected({
              versionId: foundBuild.versionId,
              version: foundBuild.fullVersion,
              isHotfix: false,
              isBuild: true,
              buildBaseVersion: version.version,
              siteCode: site.siteCode,
              customBaseVersion: site.customBaseVersion,
            })
            return
          }
          const foundHotfix = version.hotfixes?.find(h => h.versionId === state.selectedVersionId)
          if (foundHotfix) {
            setCustomSelected({
              versionId: foundHotfix.versionId,
              version: foundHotfix.fullVersion,
              isHotfix: true,
              siteCode: site.siteCode,
              customBaseVersion: site.customBaseVersion,
            })
            return
          }
        }
      }
    }
  }, [location.state, customTreeData, customSelected, currentTab])

  // Standard 선택된 버전 데이터
  const standardVersion = standardSelected && standardTreeData?.majorMinorGroups
    ? (() => {
      for (const group of standardTreeData.majorMinorGroups) {
        const foundVersion = group.versions.find(v => v.versionId === standardSelected.versionId)
        if (foundVersion) return foundVersion
        for (const version of group.versions) {
          const foundHotfix = version.hotfixes?.find(h => h.versionId === standardSelected.versionId)
          if (foundHotfix) {
            return {
              versionId: foundHotfix.versionId,
              version: foundHotfix.fullVersion,
              createdAt: foundHotfix.createdAt,
              createdByEmail: foundHotfix.createdByEmail || '',
              createdByAvatarStyle: foundHotfix.createdByAvatarStyle,
              createdByAvatarSeed: foundHotfix.createdByAvatarSeed,
              isDeletedCreator: foundHotfix.isDeletedCreator,
              comment: foundHotfix.comment || '',
              isApproved: foundHotfix.isApproved ?? false,
              approvedBy: foundHotfix.approvedBy ?? null,
              approvedByAvatarStyle: foundHotfix.approvedByAvatarStyle,
              approvedByAvatarSeed: foundHotfix.approvedByAvatarSeed,
              isDeletedApprover: foundHotfix.isDeletedApprover,
              approvedAt: foundHotfix.approvedAt ?? null,
              fileCategories: foundHotfix.fileCategories || []
            } as SelectedVersionData
          }
          const foundBuild = version.builds?.find(b => b.versionId === standardSelected.versionId)
          if (foundBuild) {
            return {
              versionId: foundBuild.versionId,
              version: foundBuild.fullVersion,
              createdAt: foundBuild.createdAt,
              createdByEmail: foundBuild.createdByEmail || '',
              createdByName: foundBuild.createdByName,
              createdByAvatarStyle: foundBuild.createdByAvatarStyle,
              createdByAvatarSeed: foundBuild.createdByAvatarSeed,
              isDeletedCreator: foundBuild.isDeletedCreator,
              comment: foundBuild.comment || '',
              isApproved: foundBuild.isApproved,
              approvedBy: null,
              approvedAt: null,
              fileCategories: foundBuild.fileCategories || [],
              buildVersion: foundBuild.buildVersion,
              buildBaseVersion: version.version,
            } as SelectedVersionData
          }
        }
      }
      return null
    })()
    : null

  // Custom 선택된 버전 데이터
  const customVersion = customSelected && customTreeData?.sites
    ? (() => {
      for (const site of customTreeData.sites) {
        for (const group of site.majorMinorGroups) {
          const foundVersion = group.versions.find(v => v.versionId === customSelected.versionId)
          if (foundVersion) return foundVersion
          for (const version of group.versions) {
            const foundHotfix = version.hotfixes?.find(h => h.versionId === customSelected.versionId)
            if (foundHotfix) {
              return {
                versionId: foundHotfix.versionId,
                version: foundHotfix.fullVersion,
                createdAt: foundHotfix.createdAt,
                createdByEmail: foundHotfix.createdByEmail || '',
                createdByAvatarStyle: foundHotfix.createdByAvatarStyle,
                createdByAvatarSeed: foundHotfix.createdByAvatarSeed,
                isDeletedCreator: foundHotfix.isDeletedCreator,
                comment: foundHotfix.comment || '',
                isApproved: foundHotfix.isApproved ?? false,
                approvedBy: foundHotfix.approvedBy ?? null,
                approvedByAvatarStyle: foundHotfix.approvedByAvatarStyle,
                approvedByAvatarSeed: foundHotfix.approvedByAvatarSeed,
                isDeletedApprover: foundHotfix.isDeletedApprover,
                approvedAt: foundHotfix.approvedAt ?? null,
                fileCategories: foundHotfix.fileCategories || []
              } as SelectedVersionData
            }
            const foundBuild = version.builds?.find(b => b.versionId === customSelected.versionId)
            if (foundBuild) {
              return {
                versionId: foundBuild.versionId,
                version: foundBuild.fullVersion,
                createdAt: foundBuild.createdAt,
                createdByEmail: foundBuild.createdByEmail || '',
                createdByName: foundBuild.createdByName,
                createdByAvatarStyle: foundBuild.createdByAvatarStyle,
                createdByAvatarSeed: foundBuild.createdByAvatarSeed,
                isDeletedCreator: foundBuild.isDeletedCreator,
                comment: foundBuild.comment || '',
                isApproved: foundBuild.isApproved,
                approvedBy: null,
                approvedAt: null,
                fileCategories: foundBuild.fileCategories || [],
                buildVersion: foundBuild.buildVersion,
                buildBaseVersion: version.version,
              } as SelectedVersionData
            }
          }
        }
      }
      return null
    })()
    : null

  // 탭 변경
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Standard 핸들러
  const handleStandardSelect = (info: SelectedVersionInfo) => {
    setStandardSelected({
      versionId: info.versionId,
      version: info.version,
      isHotfix: info.isHotfix,
      isBuild: info.isBuild,
      buildBaseVersion: info.buildBaseVersion,
    })
  }

  // Custom 핸들러
  const handleCustomSelect = (info: SelectedCustomVersionInfo) => {
    setCustomSelected({
      versionId: info.versionId,
      version: info.version,
      isHotfix: info.isHotfix,
      siteCode: info.siteCode,
      customBaseVersion: info.customBaseVersion,
      isBuild: info.isBuild,
      buildBaseVersion: info.buildBaseVersion,
    })
  }

  // 트리 새로고침
  const handleRefresh = async () => {
    if (currentTab === 'standard') {
      await refetchStandardTree()
    } else {
      await refetchCustomTree()
    }
  }

  const handleCreateSuccess = () => {
    handleRefresh()
  }

  const handleDeleteSuccess = () => {
    if (currentTab === 'standard') {
      setStandardSelected(null)
    } else {
      setCustomSelected(null)
    }
    handleRefresh()
  }

  // 트리 액션 메뉴 핸들러
  const handleTreeHotfix = (versionId: number, version: string, siteCode?: string) => {
    setHotfixTarget({ versionId, version, isHotfix: false, siteCode })
  }

  const handleTreeBuild = (versionId: number, version: string, siteCode?: string) => {
    setBuildTarget({ versionId, version, isHotfix: false, siteCode })
  }

  const handleTreeDelete = (versionId: number, version: string, isHotfix: boolean) => {
    setDeleteTarget({ versionId, version, isHotfix })
  }

  /** 트리 컨텍스트 메뉴 승인 — 승인은 되돌릴 수 없으므로 확인 다이얼로그를 거친다 */
  const handleTreeApprove = (versionId: number, version: string) => {
    // 승인은 versionId 만 사용하므로 isHotfix 는 의미 없음 (타입 형식상 채움).
    // 핫픽스도 같은 핸들러를 타며 version 에는 fullVersion(예: 1.1.5.1)이 들어온다.
    setApproveTarget({ versionId, version, isHotfix: false })
  }

  const handleTreeApproveConfirm = () => {
    if (!approveTarget) return

    approveMutation.mutate(approveTarget.versionId, {
      onSuccess: () => {
        toast({
          title: '버전 승인 완료',
          description: `버전 ${approveTarget.version}이(가) 승인되었습니다.`,
        })
        setApproveTarget(null)
        // 트리를 다시 읽어 미승인 스타일(흐린 이탤릭)을 해제한다.
        // 상세 패널의 version 은 트리 데이터에서 파생되므로 함께 갱신된다.
        handleRefresh()
      },
      onError: (err) => {
        toast({
          title: '버전 승인 실패',
          description: err instanceof Error ? err.message : '버전 승인 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
        setApproveTarget(null)
      },
    })
  }

  const handleTreeDeleteConfirm = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(deleteTarget.versionId, {
      onSuccess: () => {
        toast({
          title: '버전 삭제 완료',
          description: `버전 ${deleteTarget.version}이(가) 삭제되었습니다.`,
        })
        setDeleteTarget(null)
        const currentSelected = currentTab === 'standard' ? standardSelected : customSelected
        if (currentSelected?.versionId === deleteTarget.versionId) {
          if (currentTab === 'standard') {
            setStandardSelected(null)
          } else {
            setCustomSelected(null)
          }
        }
        handleRefresh()
      },
      onError: (err) => {
        toast({
          title: '버전 삭제 실패',
          description: err instanceof Error ? err.message : '버전 삭제 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      },
    })
  }

  const handleHotfixSuccess = () => {
    setHotfixTarget(null)
    handleRefresh()
  }

  const handleBuildSuccess = () => {
    setBuildTarget(null)
    handleRefresh()
  }

  // 추가 버튼 핸들러
  const handleAdd = () => {
    if (currentTab === 'standard') {
      setStandardCreateOpen(true)
    } else {
      setCustomCreateOpen(true)
    }
  }

  // 버전 수 계산
  const standardVersionCount = standardTreeData?.majorMinorGroups.reduce(
    (acc, g) => acc + g.versions.length, 0
  ) || 0

  const customVersionCount = customTreeData?.sites?.reduce(
    (acc, site) => acc + site.majorMinorGroups.reduce(
      (groupAcc, group) => groupAcc + group.versions.length, 0
    ), 0
  ) || 0

  const currentTabConfig = TAB_CONFIG[currentTab]
  const currentError = currentTab === 'standard' ? standardError : customError

  if (currentError) {
    return (
      <ErrorDisplay
        title="릴리즈 트리를 불러오는 중 오류가 발생했습니다."
        error={currentError as Error}
        onRetry={handleRefresh}
      />
    )
  }

  const versionCount = currentTab === 'standard' ? standardVersionCount : customVersionCount

  return (
    <PageLayout
      fullHeight
      description="표준 및 커스텀 릴리즈 트리. 버전을 선택해 상세, 파일 그리고 핫픽스를 확인하세요."
      actions={
        canAddVersion && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleAdd} size="icon">
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
      {/* 페이지 레벨 탭 — 카드 밖, PageHeader 와 ContentSplit 사이 */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="flex-none">
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
      </Tabs>

      <ContentSplit treeWidth={25} className="flex-1 min-h-0">
        {/* Tree Panel */}
        <ContentSplit.Tree
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-base font-semibold">
                <Network className="h-4 w-4" />
                버전 트리
              </div>
              {versionCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {versionCount}개 버전
                </span>
              )}
            </div>
          }
        >
          {currentTab === 'standard' ? (
            isStandardLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <ReleaseTree
                majorMinorGroups={standardTreeData?.majorMinorGroups || []}
                selectedVersionId={standardSelected?.versionId || null}
                onSelectVersion={handleStandardSelect}
                onHotfix={(versionId, version) => handleTreeHotfix(versionId, version)}
                onBuild={(versionId, version) => handleTreeBuild(versionId, version)}
                onDelete={handleTreeDelete}
                onApprove={handleTreeApprove}
                canAddVersion={canAddVersion}
                canDeleteVersion={canDeleteVersion}
                canApproveVersion={canApproveVersion}
              />
            )
          ) : (
            isCustomLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <CustomReleaseTree
                sites={customTreeData?.sites || []}
                selectedVersionId={customSelected?.versionId || null}
                onSelectVersion={handleCustomSelect}
                onHotfix={(versionId, version, siteCode) => handleTreeHotfix(versionId, version, siteCode)}
                onBuild={(versionId, version, siteCode) => handleTreeBuild(versionId, version, siteCode)}
                onDelete={handleTreeDelete}
                onApprove={handleTreeApprove}
                canAddVersion={canAddVersion}
                canDeleteVersion={canDeleteVersion}
                canApproveVersion={canApproveVersion}
              />
            )
          )}
        </ContentSplit.Tree>

        {/* Detail Panel */}
        {currentTab === 'standard' ? (
          standardVersion ? (
            <VersionDetail.Provider
              version={standardVersion}
              isHotfix={standardSelected?.isHotfix}
              isBuild={standardSelected?.isBuild}
              onDelete={handleDeleteSuccess}
            >
              <ContentSplit.Detail>
                <VersionDetail.Content />
              </ContentSplit.Detail>
              <VersionDetail.Dialogs />
            </VersionDetail.Provider>
          ) : (
            <ContentSplit.Detail isEmpty={true} emptyMessage="버전을 선택해주세요." />
          )
        ) : (
          customVersion ? (
            <VersionDetail.Provider
              version={customVersion}
              isHotfix={customSelected?.isHotfix}
              isBuild={customSelected?.isBuild}
              onDelete={handleDeleteSuccess}
              baseVersion={customSelected?.customBaseVersion}
            >
              <ContentSplit.Detail>
                <VersionDetail.Content />
              </ContentSplit.Detail>
              <VersionDetail.Dialogs />
            </VersionDetail.Provider>
          ) : (
            <ContentSplit.Detail isEmpty={true} emptyMessage="버전을 선택해주세요." />
          )
        )}
      </ContentSplit>

      {/* Standard 버전 생성 폼 */}
      <VersionCreateForm
        open={standardCreateOpen}
        onOpenChange={setStandardCreateOpen}
        onSuccess={handleCreateSuccess}
        latestVersion={standardTreeData?.majorMinorGroups ? findLatestVersionString(standardTreeData.majorMinorGroups) ?? undefined : undefined}
      />

      {/* Custom 버전 생성 폼 */}
      <CustomVersionCreateForm
        open={customCreateOpen}
        onOpenChange={setCustomCreateOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* 핫픽스 생성 다이얼로그 */}
      {hotfixTarget && (
        <HotfixCreateForm
          open={true}
          onOpenChange={(open) => !open && setHotfixTarget(null)}
          projectId={projectId}
          hotfixBaseVersionId={hotfixTarget.versionId}
          hotfixBaseVersion={hotfixTarget.version}
          onSuccess={handleHotfixSuccess}
        />
      )}

      {/* 빌드 생성 다이얼로그 */}
      {buildTarget && (
        <BuildCreateForm
          open={true}
          onOpenChange={(open) => !open && setBuildTarget(null)}
          baseVersionId={buildTarget.versionId}
          baseVersion={buildTarget.version}
          onSuccess={handleBuildSuccess}
        />
      )}

      {/* 삭제 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>버전 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              버전 <strong>{deleteTarget?.version}</strong>을(를) 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없으며, 모든 관련 파일이 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTreeDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/70"
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 승인 다이얼로그 — 승인 취소 기능이 없어 되돌릴 수 없다 */}
      <AlertDialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>버전 승인 확인</AlertDialogTitle>
            <AlertDialogDescription>
              버전 <strong>{approveTarget?.version}</strong>을(를) 승인하시겠습니까?
              <br />
              승인 후에는 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTreeApproveConfirm}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? '승인 중...' : '승인'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
