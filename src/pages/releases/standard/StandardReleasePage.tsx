import { useState, useEffect } from 'react'

import { Network, Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { VersionCreateForm } from '@/widgets/releases'

import { usePermission, usePageIcon } from '@/shared/lib/hooks'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useProjectStore } from '@/shared/store'

import { ReleaseTree, VersionDetail, HotfixCreateForm, type SelectedVersionInfo, type SelectedVersionData } from '@/features/releases/standard'

import { useStandardReleaseTree, useDeleteVersion } from '@/entities/releases/release'

import { findLatestVersionString } from '@/shared/lib/utils/version'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'




/** 선택된 버전 정보 상태 */
interface SelectedState {
  versionId: number
  version: string
  isHotfix: boolean
}

/** 트리 액션 메뉴용 타겟 정보 */
interface ActionTargetInfo {
  versionId: number
  version: string
  isHotfix: boolean
}

export function StandardReleasePage() {
  const location = useLocation()
  const projectId = useProjectStore((state) => state.projectId)
  const { canAddVersion, canDeleteVersion } = usePermission()
  const { icon: pageIcon } = usePageIcon()
  const { toast } = useToast()
  const [selectedState, setSelectedState] = useState<SelectedState | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [prevProjectId, setPrevProjectId] = useState(projectId)

  // 트리 액션 메뉴용 상태
  const [hotfixTarget, setHotfixTarget] = useState<ActionTargetInfo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ActionTargetInfo | null>(null)

  const deleteMutation = useDeleteVersion()

  // 프로젝트 변경 시 선택 초기화 (렌더링 중 동기 처리)
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId)
    setSelectedState(null)
  }

  const {
    data: treeData,
    isLoading: isTreeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useStandardReleaseTree(projectId)

  // 홈페이지에서 전달된 버전 선택 (selectedVersionId)
  useEffect(() => {
    const state = location.state as { selectedVersionId?: number } | null
    if (state?.selectedVersionId && treeData?.majorMinorGroups && !selectedState) {
      // selectedVersionId로 전달된 경우 트리에서 해당 버전 찾아 선택
      for (const group of treeData.majorMinorGroups) {
        const foundVersion = group.versions.find(v => v.versionId === state.selectedVersionId)
        if (foundVersion) {
          setSelectedState({
            versionId: foundVersion.versionId,
            version: foundVersion.version,
            isHotfix: false
          })
          break
        }
      }
    }
  }, [location.state, treeData, selectedState])

  // 선택된 버전 데이터 (트리에서 찾기)
  const selectedVersion = selectedState && treeData?.majorMinorGroups
    ? (() => {
        // 일반 버전에서 찾기
        for (const group of treeData.majorMinorGroups) {
          const foundVersion = group.versions.find(v => v.versionId === selectedState.versionId)
          if (foundVersion) {
            return foundVersion
          }
          // 핫픽스에서 찾기
          for (const version of group.versions) {
            const foundHotfix = version.hotfixes?.find(h => h.versionId === selectedState.versionId)
            if (foundHotfix) {
              return {
                versionId: foundHotfix.versionId,
                version: foundHotfix.fullVersion,
                createdAt: foundHotfix.createdAt,
                createdByEmail: foundHotfix.createdByEmail || '',
                comment: foundHotfix.comment || '',
                isApproved: foundHotfix.isApproved ?? false,
                approvedBy: foundHotfix.approvedBy ?? null,
                approvedAt: foundHotfix.approvedAt ?? null,
                fileCategories: foundHotfix.fileCategories || []
              } as SelectedVersionData
            }
          }
        }
        return null
      })()
    : null

  const handleSelectVersion = (info: SelectedVersionInfo) => {
    setSelectedState({
      versionId: info.versionId,
      version: info.version,
      isHotfix: info.isHotfix
    })
  }

  // 트리 새로고침
  const handleRefresh = async () => {
    await refetchTree()
  }

  const handleCreateSuccess = () => {
    handleRefresh()
  }

  const handleDeleteSuccess = () => {
    setSelectedState(null)
    handleRefresh()
  }

  // 트리 액션 메뉴 핸들러
  const handleTreeHotfix = (versionId: number, version: string) => {
    setHotfixTarget({ versionId, version, isHotfix: false })
  }

  const handleTreeDelete = (versionId: number, version: string, isHotfix: boolean) => {
    setDeleteTarget({ versionId, version, isHotfix })
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
        // 삭제된 버전이 선택된 버전이면 선택 해제
        if (selectedState?.versionId === deleteTarget.versionId) {
          setSelectedState(null)
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

  if (treeError) {
    return (
      <ErrorDisplay
        title="릴리즈 트리를 불러오는 중 오류가 발생했습니다."
        error={treeError as Error}
        onRetry={handleRefresh}
      />
    )
  }

  // 트리 헤더에 표시할 버전 수
  const versionCount = treeData?.majorMinorGroups.reduce((acc, g) => acc + g.versions.length, 0) || 0

  return (
    <PageLayout
      icon={pageIcon}
      title="버전 관리 (Standard)"
      actions={
        <>
          {canAddVersion && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setCreateDialogOpen(true)} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>릴리즈 생성</p>
              </TooltipContent>
            </Tooltip>
          )}
        </>
      }
    >
      <ContentSplit>
        {/* Tree Panel */}
        <ContentSplit.Tree
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-base font-semibold">
                <Network className="h-4 w-4" />
                버전 트리
              </div>
              {versionCount > 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  {versionCount}개 버전
                </span>
              )}
            </div>
          }
        >
          {isTreeLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <ReleaseTree
              majorMinorGroups={treeData?.majorMinorGroups || []}
              selectedVersionId={selectedState?.versionId || null}
              onSelectVersion={handleSelectVersion}
              onHotfix={handleTreeHotfix}
              onDelete={handleTreeDelete}
              canAddVersion={canAddVersion}
              canDeleteVersion={canDeleteVersion}
            />
          )}
        </ContentSplit.Tree>

        {/* Detail Panel */}
        {selectedVersion ? (
          <VersionDetail.Provider
            version={selectedVersion}
            isHotfix={selectedState?.isHotfix}
            onDelete={handleDeleteSuccess}
          >
            <ContentSplit.Detail
              header={<VersionDetail.Header />}
            >
              <VersionDetail.Content />
            </ContentSplit.Detail>
            <VersionDetail.Dialogs />
          </VersionDetail.Provider>
        ) : (
          <ContentSplit.Detail
            isEmpty={true}
            emptyMessage="버전을 선택해주세요."
          />
        )}
      </ContentSplit>

      <VersionCreateForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        latestVersion={treeData?.majorMinorGroups ? findLatestVersionString(treeData.majorMinorGroups) ?? undefined : undefined}
      />

      {/* 트리 액션 메뉴용 핫픽스 생성 다이얼로그 */}
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

      {/* 트리 액션 메뉴용 삭제 다이얼로그 */}
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
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
