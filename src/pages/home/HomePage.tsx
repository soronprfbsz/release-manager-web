import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  Layers,
  ArrowRight,
  Calendar,
  User,
  Clock,
  CheckCircle,
  Building2,
  Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { TypographyInlineCode, TypographyMuted, TypographyLarge } from '@/shared/ui/typography'
import { ROUTES } from '@/shared/config/constants'
import { releaseApi, type VersionNode } from '@/entities/release'
import { patchApi, type CumulativePatch } from '@/entities/patch'

const features = [
  {
    icon: Package,
    title: '버전관리',
    description: '표준 릴리즈 버전을 트리 구조로 관리하고 파일을 다운로드합니다.',
    href: ROUTES.RELEASES.STANDARD,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Layers,
    title: '패치관리',
    description: '표준 버전 간 누적 패치를 생성하고 관리합니다.',
    href: ROUTES.PATCHES.STANDARD,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Building2,
    title: '고객사 관리',
    description: '고객사 정보를 등록하고 관리합니다.',
    href: ROUTES.CUSTOMERS.LIST,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Download,
    title: '다운로드',
    description: 'DB 백업/복원 스크립트를 다운로드합니다.',
    href: ROUTES.DOWNLOADS.SCRIPTS,
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
    queryFn: () => patchApi.getList({ page: 0, size: 5 }),
  })

  const recentVersions = getRecentVersions(standardTree, 5)
  const latestInstall = recentVersions.find(v => v.isInstall)
  const recentPatches: CumulativePatch[] = patchData?.content || []

  return (
    <div className="space-y-6">
      {/* Latest Info Cards */}
      <div>
        <TypographyLarge className="mb-3">Recent</TypographyLarge>
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
              <Link to={ROUTES.RELEASES.STANDARD} state={{ selectedVersion: latestInstall }} className="block hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <TypographyInlineCode className="text-2xl bg-transparent">{latestInstall.version}</TypographyInlineCode>
                    <Badge variant="default" className="ml-2 bg-green-500">설치본</Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <TypographyMuted className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {latestInstall.createdBy}
                  </TypographyMuted>
                  <TypographyMuted className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(latestInstall.createdAt)}
                  </TypographyMuted>
                </div>
              </Link>
            ) : (
              <TypographyMuted>설치본이 없습니다.</TypographyMuted>
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
                    state={{ selectedVersion: version }}
                    className="flex items-center justify-between text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <TypographyInlineCode className="bg-transparent">{version.version}</TypographyInlineCode>
                      {version.isInstall && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-500">설치본</Badge>
                      )}
                    </div>
                    <TypographyMuted className="text-xs">{formatDate(version.createdAt)}</TypographyMuted>
                  </Link>
                ))}
              </div>
            ) : (
              <TypographyMuted>릴리즈가 없습니다.</TypographyMuted>
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
                    key={patch.patchId}
                    to={ROUTES.PATCHES.HISTORY}
                    className="flex items-center justify-between text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <TypographyInlineCode className="text-xs bg-transparent">
                        {patch.fromVersion} → {patch.toVersion}
                      </TypographyInlineCode>
                      <Badge variant="outline" className="text-xs">
                        {patch.releaseType === 'STANDARD' ? '표준' : '커스텀'}
                      </Badge>
                    </div>
                    <TypographyMuted className="text-xs">{formatDate(patch.generatedAt)}</TypographyMuted>
                  </Link>
                ))}
              </div>
            ) : (
              <TypographyMuted>생성된 패치가 없습니다.</TypographyMuted>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Feature Cards */}
      <div>
        <TypographyLarge className="mb-3">Feature</TypographyLarge>
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
      <div>
        <TypographyLarge className="mb-3">Guide</TypographyLarge>
        <Card className="bg-muted/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <TypographyMuted>1. <strong>버전 관리</strong>에서 표준/커스텀 버전의 릴리즈를 생성 및 관리합니다.</TypographyMuted>
                <TypographyMuted>2. <strong>패치 관리</strong>에서 버전 간 누적 패치를 생성하여 배포합니다.</TypographyMuted>
                <TypographyMuted>3. <strong>다운로드</strong>에서 백업/복구용 스크립트를 다운로드합니다.</TypographyMuted>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
