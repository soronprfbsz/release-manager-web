import { useState } from 'react'

import { RefreshCw, Plus } from 'lucide-react'

import { CustomVersionCreateForm } from '@/widgets/releases'

import { CustomReleaseTree, type SelectedCustomVersionInfo } from '@/features/releases/custom'
import { VersionDetailPanel, type SelectedVersionData } from '@/features/releases/standard'

import { useAllCustomReleaseTree } from '@/entities/releases/release'

import { getMenuIcon } from '@/shared/config/menu-icons'
import { usePermission, usePageIcon } from '@/shared/lib/hooks'
import { useProjectStore } from '@/shared/store'

import { getCategoryShortName } from '@/shared/lib/utils/category'
import { isLatestVersionForCustomer } from '@/shared/lib/utils/version'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { PageLayout } from '@/shared/ui/page-layout'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

/** 선택된 버전 정보 상태 */
interface SelectedState {
  versionId: number
  version: string
  isHotfix: boolean
  customerCode: string
  customBaseVersion: string | null
}

export function CustomReleasePage() {
  const projectId = useProjectStore((state) => state.projectId)
  const { canAddVersion } = usePermission()
  const { icon: pageIcon, iconName } = usePageIcon()
  const [selectedState, setSelectedState] = useState<SelectedState | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [prevProjectId, setPrevProjectId] = useState(projectId)

  // 프로젝트 변경 시 선택 초기화
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId)
    setSelectedState(null)
  }

  const {
    data: treeData,
    isLoading: isTreeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useAllCustomReleaseTree(projectId)

  // 선택된 버전 데이터 (트리에서 찾기)
  const selectedVersion = selectedState && treeData?.customers
    ? (() => {
        for (const customer of treeData.customers) {
          for (const group of customer.majorMinorGroups) {
            // 일반 버전에서 찾기
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
                  createdBy: foundHotfix.createdBy || '',
                  comment: foundHotfix.comment || '',
                  isApproved: foundHotfix.isApproved ?? false,
                  approvedBy: foundHotfix.approvedBy ?? null,
                  approvedAt: foundHotfix.approvedAt ?? null,
                  fileCategories: foundHotfix.fileCategories || []
                } as SelectedVersionData
              }
            }
          }
        }
        return null
      })()
    : null

  const handleSelectVersion = (info: SelectedCustomVersionInfo) => {
    setSelectedState({
      versionId: info.versionId,
      version: info.version,
      isHotfix: info.isHotfix,
      customerCode: info.customerCode,
      customBaseVersion: info.customBaseVersion
    })
  }

  const handleRefresh = async () => {
    await refetchTree()
  }

  const handleDeleteSuccess = () => {
    setSelectedState(null)
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
      icon={pageIcon}
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
                {getMenuIcon(iconName, 'h-4 w-4')}
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
                    selectedVersionId={selectedState?.versionId || null}
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
                {selectedState && (
                  <>
                    <span>({selectedState.version})</span>
                    {!selectedState.isHotfix && treeData?.customers && isLatestVersionForCustomer(selectedState.versionId, selectedState.customerCode, treeData.customers) && (
                      <Badge variant="latest" className="text-xs px-2 py-0.5">
                        LATEST
                      </Badge>
                    )}
                    {selectedVersion?.fileCategories && selectedVersion.fileCategories.length > 0 && (
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
                  isHotfix={selectedState?.isHotfix}
                  onDelete={handleDeleteSuccess}
                  baseVersion={selectedState?.customBaseVersion}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <CustomVersionCreateForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </PageLayout>
  )
}
