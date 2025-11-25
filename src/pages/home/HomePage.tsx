import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  Layers,
  FileCode,
  ArrowRight,
  GitBranch,
  Calendar,
  User,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { ROUTES } from '@/shared/config/constants'
import { releaseApi, type VersionNode } from '@/entities/release'
import { patchApi, type CumulativePatch } from '@/entities/patch'

const features = [
  {
    icon: Package,
    title: 'Standard',
    description: '표준 릴리즈 버전을 트리 구조로 관리하고 파일을 다운로드합니다.',
    href: ROUTES.RELEASES.STANDARD,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: GitBranch,
    title: 'Custom',
    description: '고객별 맞춤 릴리즈 버전을 관리하고 파일을 다운로드합니다.',
    href: ROUTES.RELEASES.CUSTOM,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Layers,
    title: '패치 생성',
    description: '버전 간 누적 패치를 생성하고 이력을 관리합니다.',
    href: ROUTES.PATCHES.GENERATE,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: FileCode,
    title: '백업 스크립트',
    description: '백업 스크립트를 다운로드합니다.',
    href: ROUTES.SCRIPTS.BACKUP,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
]

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getRecentVersions(data: { majorMinorGroups: { versions: VersionNode[] }[] } | undefined, count: number): VersionNode[] {
  if (!data) return []

  const allVersions: VersionNode[] = []
  data.majorMinorGroups.forEach(group => {
    allVersions.push(...group.versions)
  })

  return allVersions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count)
}

export function HomePage() {
  const { data: standardTree, isLoading: isReleaseLoading } = useQuery({
    queryKey: ['standard-release-tree'],
    queryFn: releaseApi.getStandardTree,
  })

  const { data: patchData, isLoading: isPatchLoading } = useQuery({
    queryKey: ['cumulative-patches'],
    queryFn: patchApi.getList,
  })

  const recentVersions = getRecentVersions(standardTree, 5)
  const latestInstall = recentVersions.find(v => v.isInstall)
  const recentPatches: CumulativePatch[] = patchData?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Latest Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Latest Install Version */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              최신 설치본
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isReleaseLoading ? (
              <div className="animate-pulse h-16 bg-muted rounded" />
            ) : latestInstall ? (
              <Link to={ROUTES.RELEASES.STANDARD} className="block hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold">{latestInstall.version}</span>
                    <Badge variant="default" className="ml-2 bg-green-500">설치본</Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {latestInstall.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(latestInstall.createdAt)}
                  </span>
                </div>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">설치본이 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Releases */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              최신 릴리즈 버전
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isReleaseLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded" />)}
              </div>
            ) : recentVersions.length > 0 ? (
              <div className="space-y-2">
                {recentVersions.slice(0, 4).map((version) => (
                  <Link
                    key={version.versionId}
                    to={ROUTES.RELEASES.STANDARD}
                    className="flex items-center justify-between text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{version.version}</span>
                      {version.isInstall && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-500">설치본</Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">{formatDate(version.createdAt)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">릴리즈가 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Patches */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-green-500" />
              최근 생성 패치
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPatchLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded" />)}
              </div>
            ) : recentPatches.length > 0 ? (
              <div className="space-y-2">
                {recentPatches.slice(0, 4).map((patch) => (
                  <Link
                    key={patch.cumulativePatchId}
                    to={ROUTES.PATCHES.HISTORY}
                    className="flex items-center justify-between text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-xs">
                        {patch.fromVersion} → {patch.toVersion}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {patch.releaseType === 'STANDARD' ? '표준' : '커스텀'}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-xs">{formatDate(patch.generatedAt)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">생성된 패치가 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3">주요 기능</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.href}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-base flex items-center justify-between">
                    {feature.title}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Guide */}
      <Card className="bg-muted/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">사용 가이드</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>1. <strong>버전 관리</strong>에서 표준/커스텀 버전의 SQL 파일을 확인하고 다운로드합니다.</p>
                <p>2. <strong>패치 관리</strong>에서 버전 간 누적 패치를 생성하여 배포합니다.</p>
                <p>3. <strong>스크립트 관리</strong>에서 백업/복구용 스크립트를 다운로드합니다.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
