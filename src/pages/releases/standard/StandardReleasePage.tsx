import { useState, useEffect } from 'react'

import { Tag, RefreshCw, Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { VersionCreateDialog } from '@/widgets/releases'

import { usePermission } from '@/shared/lib/hooks'
import { useProjectStore } from '@/shared/store'

import { ReleaseTree, VersionDetailPanel } from '@/features/releases/standard'

import { useStandardReleaseTree, type VersionNode } from '@/entities/releases/release'

import { getCategoryShortName } from '@/shared/lib/utils/category'
import { isLatestVersion, findLatestVersionString } from '@/shared/lib/utils/version'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { PageLayout } from '@/shared/ui/page-layout'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'




export function StandardReleasePage() {
  const location = useLocation()
  const projectId = useProjectStore((state) => state.projectId)
  const { canAddVersion } = usePermission()
  const [selectedVersion, setSelectedVersion] = useState<VersionNode | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [prevProjectId, setPrevProjectId] = useState(projectId)

  // 프로젝트 변경 시 선택 초기화 (렌더링 중 동기 처리)
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId)
    setSelectedVersion(null)
  }

  const {
    data: treeData,
    isLoading: isTreeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useStandardReleaseTree(projectId)

  // 홈페이지에서 전달된 버전 선택 (selectedVersion 객체 또는 selectedVersionId)
  useEffect(() => {
    const state = location.state as { selectedVersion?: VersionNode; selectedVersionId?: number } | null
    if (state?.selectedVersion) {
      setSelectedVersion(state.selectedVersion)
    } else if (state?.selectedVersionId && treeData?.majorMinorGroups && !selectedVersion) {
      // selectedVersionId로 전달된 경우 트리에서 해당 버전 찾아 선택
      for (const group of treeData.majorMinorGroups) {
        const foundVersion = group.versions.find(v => v.versionId === state.selectedVersionId)
        if (foundVersion) {
          setSelectedVersion(foundVersion)
          break
        }
      }
    }
  }, [location.state, treeData, selectedVersion])

  // 트리 데이터 변경 시 선택된 버전 동기화 (승인 등으로 인한 상태 변경 반영)
  useEffect(() => {
    if (selectedVersion && treeData?.majorMinorGroups) {
      for (const group of treeData.majorMinorGroups) {
        const updatedVersion = group.versions.find(v => v.versionId === selectedVersion.versionId)
        if (updatedVersion && updatedVersion.isApproved !== selectedVersion.isApproved) {
          setSelectedVersion(updatedVersion)
          break
        }
      }
    }
  }, [treeData, selectedVersion])

  const handleSelectVersion = (version: VersionNode) => {
    setSelectedVersion(version)
  }

  // 트리 새로고침
  const handleRefresh = async () => {
    await refetchTree()
  }

  const handleCreateSuccess = () => {
    handleRefresh()
  }

  const handleDeleteSuccess = () => {
    setSelectedVersion(null)
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

  return (
    <PageLayout
      icon={<Tag className="h-5 w-5 text-primary" />}
      title="버전 관리 (Standard)"
      actions={
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleRefresh} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>새로고침</p>
            </TooltipContent>
          </Tooltip>
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

      {/* Content */}
      <div className="grid grid-cols-12 gap-4">
        {/* Tree Panel */}
        <div className="col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                버전 트리
                {treeData && (
                  <span className="text-xs text-muted-foreground font-normal ml-auto">
                    {treeData.majorMinorGroups.reduce((acc, g) => acc + g.versions.length, 0)}개 버전
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-24rem)]">
                {isTreeLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <ReleaseTree
                    majorMinorGroups={treeData?.majorMinorGroups || []}
                    selectedVersionId={selectedVersion?.versionId || null}
                    onSelectVersion={handleSelectVersion}
                  />
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="col-span-9">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                <span>버전 정보</span>
                {selectedVersion && (
                  <>
                    <span>({selectedVersion.version})</span>
                    {treeData?.majorMinorGroups && isLatestVersion(selectedVersion.versionId, treeData.majorMinorGroups) && (
                      <Badge variant="latest" className="text-xs px-2 py-0.5">
                        LATEST
                      </Badge>
                    )}
                    {selectedVersion.fileCategories && selectedVersion.fileCategories.length > 0 && (
                      <>
                        {selectedVersion.fileCategories.map((category) => (
                          <Badge
                            key={category}
                            variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                            className="text-xs px-2 py-0.5"
                          >
                            {getCategoryShortName(category)}
                          </Badge>
                        ))}
                      </>
                    )}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-24rem)]">
                <VersionDetailPanel
                  version={selectedVersion}
                  onDelete={handleDeleteSuccess}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <VersionCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        latestVersion={treeData?.majorMinorGroups ? findLatestVersionString(treeData.majorMinorGroups) ?? undefined : undefined}
      />
    </PageLayout>
  )
}
