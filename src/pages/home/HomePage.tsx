import {
  Package,
  Building2,
  TrendingUp,
  Info,
  Tag,
  GitBranch,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  useDashboardRecentStandard,
  useDashboardRecentCustom,
  useDashboardRecentPatch,
  useDashboardTopCustomers,
  useDashboardMonthlyPatches,
  type RecentStandardVersion,
  type RecentCustomVersion,
} from '@/entities/_shared/dashboard'

import { ROUTES } from '@/shared/config/constants'
import { getCategoryShortName } from '@/shared/lib/utils/category'
import { useProjectStore } from '@/shared/store'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { HorizontalBarChart, StackedBarChart } from '@/shared/ui/charts'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyInlineCode, TypographyMuted, TypographyLarge } from '@/shared/ui/typography'

export function HomePage() {
  const projectId = useProjectStore((state) => state.projectId)

  // 표준본 최신 릴리즈
  const { data: standardData, isLoading: isLoadingStandard } = useDashboardRecentStandard(projectId)

  // 커스텀본 최신 릴리즈
  const { data: customData, isLoading: isLoadingCustom } = useDashboardRecentCustom(projectId)

  // 최근 생성 패치
  const { data: patchData, isLoading: isLoadingPatch } = useDashboardRecentPatch(projectId)

  // 통계 데이터 쿼리 (기본값 사용: months=6, topN=5)
  const { data: topCustomersData, isLoading: isLoadingTopCustomers } = useDashboardTopCustomers(projectId)

  const { data: monthlyPatchesData, isLoading: isLoadingMonthly } = useDashboardMonthlyPatches(projectId)

  // 데이터 추출
  const standardVersions = standardData?.versions || []
  const customVersions = customData?.versions || []
  const recentPatches = patchData?.patches || []

  // 통계 데이터 추출
  const topCustomers = topCustomersData?.customers || []
  const statisticsMonths = topCustomersData?.months || 6
  const topN = topCustomersData?.topN || 5

  // 월별 데이터 - 고객사 목록과 포맷팅된 데이터
  const monthlyCustomers = monthlyPatchesData?.customers || []
  const formattedMonthlyData = (monthlyPatchesData?.monthly || []).map(item => ({
    displayMonth: item.yearMonth.slice(2).replace('-', '.'),
    ...item.customerCounts,  // customerCounts를 최상위로 평탄화
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

  // 버전 항목 렌더링 헬퍼 (커스텀본)
  const renderCustomVersion = (version: RecentCustomVersion) => (
    <Link
      key={version.releaseVersionId}
      to={`${ROUTES.RELEASES}?tab=custom`}
      state={{ selectedVersionId: version.releaseVersionId }}
      className="flex items-center justify-between text-sm hover:bg-accent -mx-2 px-2 py-1 rounded transition-colors"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground truncate w-16 flex-shrink-0">
              {version.customerName || '-'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{version.customerName || '-'}</p>
          </TooltipContent>
        </Tooltip>
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

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] gap-4">
      {/* Latest Info Cards */}
      <div className="flex-shrink-0">
        <TypographyLarge className="mb-3">Recent</TypographyLarge>
        <div className="grid grid-cols-3 gap-4">
          {/* 표준본 최신 릴리즈 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-500" />
                최신 표준 릴리즈
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[6.5rem]">
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

          {/* 커스텀본 최신 릴리즈 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-purple-500" />
                최신 커스텀 릴리즈
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[6.5rem]">
                {isLoadingCustom ? (
                  <div className="animate-pulse space-y-2 h-full flex flex-col justify-between">
                    {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded" />)}
                  </div>
                ) : customVersions.length > 0 ? (
                  <div className="space-y-2">
                    {customVersions.slice(0, 3).map(renderCustomVersion)}
                  </div>
                ) : (
                  <TypographyMuted>릴리즈가 없습니다.</TypographyMuted>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 최근 생성 패치 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                최근 생성 패치
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[6.5rem]">
                {isLoadingPatch ? (
                  <div className="animate-pulse space-y-2 h-full flex flex-col justify-between">
                    {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded" />)}
                  </div>
                ) : recentPatches.length > 0 ? (
                  <div className="space-y-2">
                    {recentPatches.slice(0, 3).map((patch) => {
                      const content = (
                        <>
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {patch.releaseType === 'STANDARD' ? (
                              <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground truncate w-16 flex-shrink-0">
                                  {patch.customerName || '-'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{patch.customerName || '-'}</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <TypographyInlineCode className="bg-transparent truncate font-normal w-65 block">
                                    {patch.patchName}
                                  </TypographyInlineCode>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{patch.patchName}</p>
                              </TooltipContent>
                            </Tooltip>
                            {patch.fileDeleted && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex-shrink-0 text-destructive">
                                    <X className="h-3.5 w-3.5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>파일 삭제됨</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <DiceBearAvatar
                                  seed={patch.createdByAvatarSeed || patch.createdByEmail}
                                  style={(patch.createdByAvatarStyle as AvatarStyleKey) || 'initials'}
                                  name={patch.createdByName}
                                  size={20}
                                />
                                <span className="text-xs text-muted-foreground">{patch.createdByName}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{patch.createdByEmail}</p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )

                      // 삭제된 파일은 링크 없이 표시
                      if (patch.fileDeleted) {
                        return (
                          <div
                            key={patch.historyId}
                            className="flex items-center justify-between text-sm -mx-2 px-2 py-1 rounded"
                          >
                            {content}
                          </div>
                        )
                      }

                      return (
                        <Link
                          key={patch.historyId}
                          to={`${ROUTES.PATCHES}?tab=${patch.releaseType === 'STANDARD' ? 'standard' : 'custom'}`}
                          className="flex items-center justify-between text-sm hover:bg-accent -mx-2 px-2 py-1 rounded transition-colors"
                        >
                          {content}
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <TypographyMuted>생성된 패치가 없습니다.</TypographyMuted>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics - 남은 공간을 채움 */}
      <div className="flex-1 min-h-0 flex flex-col">
        <TypographyLarge className="mb-3 flex-shrink-0">Statistics</TypographyLarge>
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          {/* 고객사별 패치 통계 (Bar Chart) */}
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                고객사별 패치 현황
              </CardTitle>
              <CardDescription>최근 {statisticsMonths}개월 Top {topN}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
              {isLoadingTopCustomers ? (
                <div className="animate-pulse h-full bg-muted rounded" />
              ) : topCustomers && topCustomers.length > 0 ? (
                <div className="h-full">
                  <HorizontalBarChart
                    data={topCustomers}
                    categoryKey="customerName"
                    valueKey="patchCount"
                    height="100%"
                    tooltipFormatter={(value) => [`${value}건`, '패치 수']}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <TypographyMuted>데이터가 없습니다.</TypographyMuted>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 월별 패치 생성 현황 (Line Chart) */}
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                월별 패치 생성 현황
              </CardTitle>
              <CardDescription>최근 {monthlyPatchesData?.months || 6}개월</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-4">
              {isLoadingMonthly ? (
                <div className="animate-pulse h-full bg-muted rounded" />
              ) : formattedMonthlyData.length > 0 ? (
                <div className="h-full">
                  <StackedBarChart
                    data={formattedMonthlyData}
                    xAxisKey="displayMonth"
                    stackKeys={monthlyCustomers}
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
      <div className="flex-shrink-0">
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
