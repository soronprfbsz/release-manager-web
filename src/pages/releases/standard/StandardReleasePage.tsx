import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Breadcrumb } from '@/shared/ui/breadcrumb'
import { ReleaseTree, VersionDetailPanel } from '@/features/releases/standard'
import { releaseApi, type VersionNode, type ReleaseVersionDetail } from '@/entities/release'

export function StandardReleasePage() {
  const [selectedVersion, setSelectedVersion] = useState<VersionNode | null>(null)

  const {
    data: treeData,
    isLoading: isTreeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useQuery({
    queryKey: ['standard-release-tree'],
    queryFn: releaseApi.getStandardTree,
  })

  const {
    data: versionDetail,
    isLoading: isDetailLoading,
  } = useQuery({
    queryKey: ['release-version-detail', selectedVersion?.versionId],
    queryFn: () => releaseApi.getVersionById(selectedVersion!.versionId),
    enabled: !!selectedVersion,
  })

  const handleSelectVersion = (version: VersionNode) => {
    setSelectedVersion(version)
  }

  if (treeError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Package className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm mb-4">{(treeError as Error).message}</p>
        <Button onClick={() => refetchTree()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <Breadcrumb
          items={[
            { label: '버전 관리' },
            { label: 'Standard' },
          ]}
        />
        <Button onClick={() => refetchTree()} variant="outline" size="icon" title="새로고침">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Tree Panel */}
        <div className="col-span-2 min-h-0">
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                버전 트리
                {treeData && (
                  <span className="text-xs text-muted-foreground font-normal ml-auto">
                    {treeData.majorMinorGroups.reduce((acc, g) => acc + g.versions.length, 0)}개 버전
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
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
        <div className="col-span-10 min-h-0">
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-base">버전 정보</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <VersionDetailPanel
                  version={selectedVersion}
                  detail={versionDetail as ReleaseVersionDetail | null}
                  isLoading={isDetailLoading}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
