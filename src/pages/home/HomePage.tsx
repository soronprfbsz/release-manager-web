import {
  Package,
  Building2,
  TrendingUp,
  Info,
  Tag,
  GitBranch,
  Hammer,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  useDashboardRecentStandard,
  useDashboardRecentBuild,
  useDashboardRecentPatch,
  useDashboardVersionSites,
  useDashboardMonthlyPatches,
  type RecentStandardVersion,
  type RecentBuildVersion,
} from '@/entities/_shared/dashboard'

import { ROUTES } from '@/shared/config/constants'
import { getCategoryShortName } from '@/shared/lib/utils/category'
import { useProjectStore } from '@/shared/store'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { StackedBarChart, VersionSiteChart } from '@/shared/ui/charts'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyInlineCode, TypographyMuted, TypographyLarge } from '@/shared/ui/typography'

/**
 * 버전 문자열을 semver 숫자 segment 로 분해해 내림차순 비교.
 * 표준 (1.1.0) / 빌드 (1.1.0.260511-1) / 커스텀 (1.1.0-siteA.1.0.1) 모두 처리.
 */
function compareVersionDesc(a: string, b: string): number {
  const parts = (v: string) => v.split(/[.-]/).map((s) => parseInt(s, 10) || 0)
  const aParts = parts(a)
  const bParts = parts(b)
  const len = Math.max(aParts.length, bParts.length)
  for (let i = 0; i < len; i++) {
    const ai = aParts[i] ?? 0
    const bi = bParts[i] ?? 0
    if (ai !== bi) return bi - ai
  }
  return 0
}

export function HomePage() {
  const projectId = useProjectStore((state) => state.projectId)

  // 표준본 최신 릴리즈
  const { data: standardData, isLoading: isLoadingStandard } = useDashboardRecentStandard(projectId)

  // 최신 빌드 버전 (표준 + 커스텀)
  const { data: buildData, isLoading: isLoadingBuild } = useDashboardRecentBuild(projectId)

  // 최근 적용 패치
  const { data: patchData, isLoading: isLoadingPatch } = useDashboardRecentPatch(projectId)

  // 버전별 사이트 분포 (좌측 통계 차트용)
  const { data: versionSitesData, isLoading: isLoadingVersionSites } = useDashboardVersionSites(projectId)

  // 월별 패치 (우측 통계 차트용) - 최근 12개월
  const { data: monthlyPatchesData, isLoading: isLoadingMonthly } = useDashboardMonthlyPatches(projectId, 12)

  // 데이터 추출 — 표준 릴리즈는 semver 내림차순 정렬 (큰 버전 위)
  const standardVersions = [...(standardData?.versions || [])].sort((a, b) =>
    compareVersionDesc(a.version, b.version)
  )
  // 빌드 버전은 백엔드가 보낸 createdAt DESC 순서를 유지 (빌드 라벨이 다른 동일 base 의 최신 순)
  const buildVersions = buildData?.versions || []
  const recentPatches = patchData?.patches || []

  // 버전별 사이트 그룹
  const versionSiteGroups = versionSitesData?.versions || []

  // 월별 데이터 - 사이트 목록과 포맷팅된 데이터
  const monthlySites = monthlyPatchesData?.sites || []
  const formattedMonthlyData = (monthlyPatchesData?.monthly || []).map(item => ({
    displayMonth: item.yearMonth.slice(2).replace('-', '.'),
    ...item.siteCounts,  // siteCounts를 최상위로 평탄화
  }))

  // 버전 항목 렌더링 헬퍼 (표준본)
  const renderStandardVersion = (version: RecentStandardVersion) => (
    <Link
      key={version.releaseVersionId}
      to={ROUTES.RELEASES}
      state={{ selectedVersionId: version.releaseVersionId }}
      className="flex items-center justify-between text-sm hover:bg-accent -mx-2 px-2 py-1 rounded transition-colors"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TypographyInlineCode className="bg-transparent flex-shrink-0 font-normal">{version.version}</TypographyInlineCode>
        {version.fileCategories && version.fileCategories.length > 0 && (
          <div className="flex gap-1 flex-shrink-0">
            {version.fileCategories.map((category) => (
              <Badge
                key={category}
                variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                className="text-[10px] px-1 py-0 h-4 leading-none"
              >
                {getCategoryShortName(category)}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <DiceBearAvatar
              seed={version.createdByAvatarSeed || version.createdByEmail}
              style={(version.createdByAvatarStyle as AvatarStyleKey) || 'initials'}
              name={version.createdByName}
              size={18}
            />
            <span className="text-xs text-muted-foreground">{version.createdByName}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{version.createdByEmail}</p>
        </TooltipContent>
      </Tooltip>
    </Link>
  )

  // 버전 항목 렌더링 헬퍼 (빌드) — 표준 빌드는 표준 릴리즈와 동일한 구조,
  // 커스텀 빌드는 좌측에 사이트명만 truncate 로 표시
  const renderBuildVersion = (version: RecentBuildVersion) => {
    const href = version.releaseType === 'CUSTOM' ? `${ROUTES.RELEASES}?tab=custom` : ROUTES.RELEASES
    return (
      <Link
        key={version.releaseVersionId}
        to={href}
        state={{ selectedVersionId: version.releaseVersionId }}
        className="flex items-center justify-between text-sm hover:bg-accent -mx-2 px-2 py-1 rounded transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {version.siteName && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground truncate w-16 flex-shrink-0">
                  {version.siteName}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{version.siteName}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <TypographyInlineCode className="bg-transparent flex-shrink-0 font-normal truncate">{version.version}</TypographyInlineCode>
          {version.fileCategories && version.fileCategories.length > 0 && (
            <div className="flex gap-1 flex-shrink-0">
              {version.fileCategories.map((category) => (
                <Badge
                  key={category}
                  variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                  className="text-[10px] px-1 py-0 h-4 leading-none"
                >
                  {getCategoryShortName(category)}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <DiceBearAvatar
                seed={version.createdByAvatarSeed || version.createdByEmail}
                style={(version.createdByAvatarStyle as AvatarStyleKey) || 'initials'}
                name={version.createdByName}
                size={18}
              />
              <span className="text-xs text-muted-foreground">{version.createdByName}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{version.createdByEmail}</p>
          </TooltipContent>
        </Tooltip>
      </Link>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-7">
      {/* Latest Info Cards */}
      <div>
        <TypographyLarge className="mb-3">Recent</TypographyLarge>
        <div className="grid grid-cols-4 gap-4">
          {/* 마지막 생성 버전 — 큰 디스플레이 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                최신 버전
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[8rem] flex flex-col gap-2">
                {isLoadingStandard ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-10 w-24 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </div>
                ) : standardData?.versions && standardData.versions.length > 0 ? (
                  <>
                    <div className="font-mono text-5xl font-bold tracking-tight leading-none">
                      {standardData.versions[0].version}
                    </div>
                    {standardData.versions[0].comment && (
                      <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                        {standardData.versions[0].comment}
                      </p>
                    )}
                  </>
                ) : (
                  <TypographyMuted>릴리즈가 없습니다.</TypographyMuted>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 표준본 최신 릴리즈 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-500" />
                최근 생성 버전
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[8rem]">
                {isLoadingStandard ? (
                  <div className="animate-pulse space-y-2 h-full flex flex-col justify-between">
                    {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded" />)}
                  </div>
                ) : standardVersions.length > 0 ? (
                  <div className="space-y-2">
                    {standardVersions.slice(0, 3).map(renderStandardVersion)}
                  </div>
                ) : (
                  <TypographyMuted>릴리즈가 없습니다.</TypographyMuted>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 최신 빌드 버전 (표준 + 커스텀) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Hammer className="h-4 w-4 text-purple-500" />
                최근 생성 빌드 버전
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[8rem]">
                {isLoadingBuild ? (
                  <div className="animate-pulse space-y-2 h-full flex flex-col justify-between">
                    {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded" />)}
                  </div>
                ) : buildVersions.length > 0 ? (
                  <div className="space-y-2">
                    {buildVersions.slice(0, 3).map(renderBuildVersion)}
                  </div>
                ) : (
                  <TypographyMuted>빌드 버전이 없습니다.</TypographyMuted>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 최근 적용 패치 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                최근 적용 패치
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[8rem]">
                {isLoadingPatch ? (
                  <div className="animate-pulse space-y-2 h-full flex flex-col justify-between">
                    {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded" />)}
                  </div>
                ) : recentPatches.length > 0 ? (
                  <div className="space-y-2">
                    {recentPatches.slice(0, 3).map((patch) => (
                      <Link
                        key={patch.historyId}
                        to={`${ROUTES.PATCHES}?tab=${patch.releaseType === 'STANDARD' ? 'standard' : 'custom'}`}
                        className="flex items-center justify-between text-sm hover:bg-accent -mx-2 px-2 py-1 rounded transition-colors"
                      >
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {patch.releaseType === 'STANDARD' ? (
                            <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-xs text-muted-foreground truncate w-16 flex-shrink-0">
                            {patch.siteName || '-'}
                          </span>
                          <TypographyInlineCode className="bg-transparent truncate font-normal w-65 block">
                            {patch.patchName}
                          </TypographyInlineCode>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <DiceBearAvatar
                            seed={patch.createdByAvatarSeed || patch.createdByEmail}
                            style={(patch.createdByAvatarStyle as AvatarStyleKey) || 'initials'}
                            name={patch.createdByName}
                            size={20}
                          />
                          <span className="text-xs text-muted-foreground">{patch.createdByName}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <TypographyMuted>완료된 패치가 없습니다.</TypographyMuted>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics — 카드 자체는 고정 높이 (320px), 차트 영역은 카드 헤더 제외분 차지 */}
      <div>
        <TypographyLarge className="mb-3">Statistics</TypographyLarge>
        <div className="grid grid-cols-2 gap-4">
          {/* 버전별 사이트 현황 (Stacked Horizontal Bar) */}
          <Card className="flex flex-col h-80">
            <CardHeader className="pb-2 flex-none">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                버전별 사이트 수
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
              {isLoadingVersionSites ? (
                <div className="animate-pulse h-full bg-muted rounded" />
              ) : (
                <VersionSiteChart data={versionSiteGroups} />
              )}
            </CardContent>
          </Card>

          {/* 월별 패치 생성 현황 (Line Chart) */}
          <Card className="flex flex-col h-80">
            <CardHeader className="pb-2 flex-none">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                월별 패치 수
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
              {isLoadingMonthly ? (
                <div className="animate-pulse h-full bg-muted rounded" />
              ) : formattedMonthlyData.length > 0 ? (
                <div className="h-full">
                  <StackedBarChart
                    data={formattedMonthlyData}
                    xAxisKey="displayMonth"
                    stackKeys={monthlySites}
                    height="100%"
                    tooltipValueFormatter={(value) => `${value}건`}
                    tooltipLabelFormatter={(label) => `20${label.replace('.', '년 ')}월`}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <TypographyMuted>데이터가 없습니다.</TypographyMuted>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Guide */}
      <div>
        <TypographyLarge className="mb-3">Quick Guide</TypographyLarge>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <TypographyMuted>1. <strong>버전 관리</strong>에서 릴리즈를 생성 및 관리합니다.</TypographyMuted>
                <TypographyMuted>2. <strong>패치 관리</strong>에서 생성 된 릴리즈 버전들을 기반으로 패치를 생성하여 배포합니다.</TypographyMuted>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
