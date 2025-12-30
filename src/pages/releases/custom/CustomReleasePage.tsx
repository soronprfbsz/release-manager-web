import { useState, useEffect } from 'react'

import { Tag, RefreshCw, Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { CustomVersionCreateDialog } from '@/widgets/releases'

import { CustomReleaseTree } from '@/features/releases/custom'
import { VersionDetailPanel } from '@/features/releases/standard'

import { useAllCustomReleaseTree, type VersionNode } from '@/entities/releases/release'

import { getPageIconById } from '@/shared/config/menu-icons'
import { usePermission } from '@/shared/lib/hooks'
import { useProjectStore } from '@/shared/store'

import { getCategoryShortName } from '@/shared/lib/utils/category'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { PageLayout } from '@/shared/ui/page-layout'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface SelectedVersionInfo extends VersionNode {
  customerCode: string
  baseVersion: string | null
}

export function CustomReleasePage() {
  const location = useLocation()
  const projectId = useProjectStore((state) => state.projectId)
  const { canAddVersion } = usePermission()
  const [selectedVersion, setSelectedVersion] = useState<SelectedVersionInfo | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [prevProjectId, setPrevProjectId] = useState(projectId)

  // 프로젝트 변경 시 선택 초기화
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId)
    setSelectedVersion(null)
  }

  // 홈페이지에서 전달된 버전 선택
  useEffect(() => {
    const state = location.state as { selectedVersion?: SelectedVersionInfo } | null
    if (state?.selectedVersion) {
      setSelectedVersion(state.selectedVersion)
    }
  }, [location.state])

  const {
    data: treeData,
    isLoading: isTreeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useAllCustomReleaseTree(projectId)

  // 트리 데이터 변경 시 선택된 버전 동기화 (승인 등으로 인한 상태 변경 반영)
  useEffect(() => {
    if (selectedVersion && treeData?.customers) {
      for (const customer of treeData.customers) {
        for (const group of customer.majorMinorGroups) {
          const updatedVersion = group.versions.find(v => v.versionId === selectedVersion.versionId)
          if (updatedVersion && updatedVersion.isApproved !== selectedVersion.isApproved) {
            setSelectedVersion({
              ...updatedVersion,
              customerCode: customer.customerCode,
              baseVersion: customer.baseVersion,
            })
            return
          }
        }
      }
    }
  }, [treeData, selectedVersion])

  const handleSelectVersion = (version: VersionNode, customerCode: string, baseVersion: string | null) => {
    setSelectedVersion({ ...version, customerCode, baseVersion })
  }

  const handleRefresh = async () => {
    await refetchTree()
  }

  const handleDeleteSuccess = () => {
    setSelectedVersion(null)
    handleRefresh()
  }

  const handleCreateSuccess = () => {
    handleRefresh()
  }

  const getTotalVersionCount = () => {
    if (!treeData?.customers) return 0
    return treeData.customers.reduce((acc, customer) =>
      acc + customer.majorMinorGroups.reduce((groupAcc, group) => groupAcc + group.versions.length, 0), 0
    )
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
      icon={getPageIconById('version_custom')}
      title="버전 관리 (Custom)"
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
                <p>커스텀 릴리즈 생성</p>
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
                커스텀 버전 트리
                {treeData && (
                  <span className="text-xs text-muted-foreground font-normal ml-auto">
                    {getTotalVersionCount()}개 버전
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
                  <CustomReleaseTree
                    customers={treeData?.customers || []}
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
                  baseVersion={selectedVersion?.baseVersion}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <CustomVersionCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </PageLayout>
  )
}
