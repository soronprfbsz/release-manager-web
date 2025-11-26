import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Link, useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { ReleaseTree, VersionDetailPanel } from '@/features/releases/standard'
import { releaseApi, type VersionNode, type ReleaseVersionDetail } from '@/entities/release'

export function StandardReleasePage() {
  const location = useLocation()
  const [selectedVersion, setSelectedVersion] = useState<VersionNode | null>(null)

  // 홈페이지에서 전달된 버전 선택
  useEffect(() => {
    const state = location.state as { selectedVersion?: VersionNode } | null
    if (state?.selectedVersion) {
      setSelectedVersion(state.selectedVersion)
    }
  }, [location.state])

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
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['release-version-detail', selectedVersion?.versionId],
    queryFn: () => releaseApi.getVersionById(selectedVersion!.versionId),
    enabled: !!selectedVersion,
  })

  const handleSelectVersion = (version: VersionNode) => {
    setSelectedVersion(version)
  }

  // 트리와 상세 정보 모두 새로고침
  const handleRefresh = async () => {
    await refetchTree()
    if (selectedVersion) {
      await refetchDetail()
    }
  }

  if (treeError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Package className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm mb-4">{(treeError as Error).message}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span>버전 관리</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Standard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Package className="h-5 w-5 text-primary" />}
        title="Standard 버전 관리"
        description="표준 릴리즈 버전 정보를 생성하고 관리합니다."
        actions={
          <Button onClick={handleRefresh} variant="outline" size="icon" title="새로고침">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
        className="mb-4 flex-shrink-0"
      />

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
              <CardTitle className="text-base">
                버전 정보
                {selectedVersion && (
                  <span className="ml-1">
                    ({selectedVersion.version})
                    {selectedVersion.isInstall && (
                      <span className="ml-2 text-xs font-normal bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded align-middle">
                        설치본
                      </span>
                    )}
                  </span>
                )}
              </CardTitle>
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
