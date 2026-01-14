import { useState, useEffect } from 'react'

import { Network, Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { VersionCreateForm } from '@/widgets/releases'

import { usePermission, usePageIcon } from '@/shared/lib/hooks'
import { useProjectStore } from '@/shared/store'

import { ReleaseTree, VersionDetail, type SelectedVersionInfo, type SelectedVersionData } from '@/features/releases/standard'

import { useStandardReleaseTree } from '@/entities/releases/release'

import { findLatestVersionString } from '@/shared/lib/utils/version'
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

export function StandardReleasePage() {
  const location = useLocation()
  const projectId = useProjectStore((state) => state.projectId)
  const { canAddVersion } = usePermission()
  const { icon: pageIcon } = usePageIcon()
  const [selectedState, setSelectedState] = useState<SelectedState | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [prevProjectId, setPrevProjectId] = useState(projectId)

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
    </PageLayout>
  )
}
