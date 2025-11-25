import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Breadcrumb } from '@/shared/ui/breadcrumb'
import { ReleaseTree } from '@/features/releases/standard/ReleaseTree'
import { VersionDetailPanel } from '@/features/releases/standard/VersionDetailPanel'
import { releaseApi } from '@/shared/api/releaseApi'
import type { VersionNode, ReleaseVersionDetail } from '@/shared/api/types'

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
        <Button onClick={() => refetchTree()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb
          items={[
            { label: '릴리즈 관리' },
            { label: '표준 릴리즈' },
          ]}
        />
        <Button onClick={() => refetchTree()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-3rem)]">
        {/* Tree Panel */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
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
            <CardContent className="h-[calc(100%-4rem)]">
              <ScrollArea className="h-full pr-4">
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
              <CardTitle className="text-base">버전 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <VersionDetailPanel
                version={selectedVersion}
                detail={versionDetail as ReleaseVersionDetail | null}
                isLoading={isDetailLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
