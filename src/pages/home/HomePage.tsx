import {
  Package,
  Building2,
  TrendingUp,
  Info,
  Hammer,
  Rocket,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  useDashboardRecentStandard,
  useDashboardRecentBuild,
  useDashboardRecentPatch,
  useDashboardVersionSites,
  useDashboardMonthlyPatches,
  type RecentBuildVersion,
} from '@/entities/_shared/dashboard'

import { ROUTES } from '@/shared/config/constants'
import { usePermission } from '@/shared/lib/hooks/use-permission'
import { getCategoryShortName } from '@/shared/lib/utils/category'
import { formatDateShort } from '@/shared/lib/utils/date'
import { useProjectStore } from '@/shared/store'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { StackedBarChart, VersionSiteChart } from '@/shared/ui/charts'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyInlineCode, TypographyMuted, TypographyLarge } from '@/shared/ui/typography'

export function HomePage() {
  const projectId = useProjectStore((state) => state.projectId)
  // GUEST 는 /sites 접근이 막혀 있어(AUTHENTICATED_ROLES) 링크를 걸지 않는다.
  const { isGuest } = usePermission()

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

  // 빌드 버전은 백엔드가 보낸 createdAt DESC 순서를 유지 (빌드 라벨이 다른 동일 base 의 최신 순)
  const buildVersions = buildData?.versions || []
  // "최신 버전" 큰 디스플레이 — 백엔드가 보낸 첫 항목 (createdAt DESC)
  const latestStandard = standardData?.versions?.[0]
  const recentPatches = patchData?.patches || []

  // 버전별 사이트 그룹
  const versionSiteGroups = versionSitesData?.versions || []

  // 월별 데이터 - 사이트 목록과 포맷팅된 데이터
  const monthlySites = monthlyPatchesData?.sites || []
  const formattedMonthlyData = (monthlyPatchesData?.monthly || []).map(item => ({
    displayMonth: item.yearMonth.slice(2).replace('-', '.'),
    ...item.siteCounts,  // siteCounts를 최상위로 평탄화
  }))

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
        <div className="flex items-center gap-2 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
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
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDateShort(version.createdAt)}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-7 min-h-full">
      {/* Latest Info Cards */}
      <div>
        <TypographyLarge className="mb-3">Recent</TypographyLarge>
        <div className="grid grid-cols-3 gap-4">
          {/* 마지막 생성 버전 — 큰 디스플레이 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-yellow-500" />
                  최신 버전
                </CardTitle>
                {/* 이 버전이 담고 있는 파일 카테고리 (DB / WEB / ENGINE / ETC) */}
                {latestStandard?.fileCategories && latestStandard.fileCategories.length > 0 && (
                  <div className="flex gap-1 flex-shrink-0">
                    {latestStandard.fileCategories.map((category) => (
                      <Badge
                        key={category}
                        variant={category.toLowerCase() as 'database' | 'web' | 'engine' | 'etc'}
                        className="text-[10px] px-1 py-0 h-4 leading-none"
                      >
                        {getCategoryShortName(category)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[8rem] flex flex-col gap-3">
                {isLoadingStandard ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-10 w-24 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </div>
                ) : latestStandard ? (
                  <>
                    {/* 버전 관리에서 이 버전이 선택된 화면으로 이동.
                        ReleasesPage 가 location.state.selectedVersionId 를 읽는
                        기존 패턴을 따른다. self-start 로 클릭 영역을 숫자 폭에 맞춘다. */}
                    <Link
                      to={ROUTES.RELEASES}
                      state={{ selectedVersionId: latestStandard.releaseVersionId }}
                      className="font-mono text-4xl font-bold tracking-tight leading-none self-start hover:text-primary transition-colors"
                    >
                      {latestStandard.version}
                    </Link>
                    {latestStandard.comment && (
                      <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                        {latestStandard.comment}
                      </p>
                    )}
                  </>
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
                최신 빌드 버전
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
                    {recentPatches.slice(0, 3).map((patch) => {
                      // 이 카드는 "적용 완료 = 패치 관리 목록에서 사라진" 패치만 보여주므로
                      // 패치 관리로 보내면 볼 게 없다. 사이트 관리에서 해당 사이트를 선택시켜
                      // SitePatchHistoryCard(createdAt desc)로 방금 그 패치를 바로 보게 한다.
                      const rowClass =
                        'flex items-center justify-between text-sm -mx-2 px-2 py-1 rounded transition-colors'
                      const row = (
                        <>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {/* 행이 사이트 관리로 링크되므로 메뉴의 사이트 관리 아이콘(building-2)을 쓴다.
                              releaseType(표준/커스텀)은 이 아이콘으로 더 이상 구분되지 않는다. */}
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {/* 사이트명은 고정폭(한글 8자 = 8 × text-xs 0.75rem)으로 두고
                              남는 폭은 패치명이 가져간다. 고정폭이라 행마다 패치명 시작
                              위치가 정렬된다. */}
                          <span className="text-xs text-muted-foreground truncate w-[6rem] flex-shrink-0">
                            {patch.siteName || '-'}
                          </span>
                          <TypographyInlineCode className="bg-transparent truncate font-normal flex-1 min-w-0 block">
                            {patch.patchName}
                          </TypographyInlineCode>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <DiceBearAvatar
                              seed={patch.createdByAvatarSeed || patch.createdByEmail}
                              style={(patch.createdByAvatarStyle as AvatarStyleKey) || 'initials'}
                              name={patch.createdByName}
                              size={20}
                            />
                            <span className="text-xs text-muted-foreground">{patch.createdByName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatDateShort(patch.createdAt)}
                          </span>
                        </div>
                        </>
                      )

                      return !isGuest && patch.siteId != null ? (
                        <Link
                          key={patch.historyId}
                          to={`${ROUTES.SITES}?siteId=${patch.siteId}`}
                          className={`${rowClass} hover:bg-accent`}
                        >
                          {row}
                        </Link>
                      ) : (
                        <div key={patch.historyId} className={rowClass}>
                          {row}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <TypographyMuted>완료된 패치가 없습니다.</TypographyMuted>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics — 남는 세로 공간을 채워 Quick Guide 를 뷰포트 하단으로 밀어낸다 (최소 320px) */}
      <div className="flex-1 min-h-0 flex flex-col">
        <TypographyLarge className="mb-3">Statistics</TypographyLarge>
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-[20rem]">
          {/* 버전별 사이트 현황 (Stacked Horizontal Bar) */}
          <Card className="flex flex-col">
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
          <Card className="flex flex-col">
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
              <div className="p-2 rounded-full bg-primary/20">
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
