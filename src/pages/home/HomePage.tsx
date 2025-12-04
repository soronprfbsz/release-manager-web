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
  TrendingUp
} from 'lucide-react'
import { HorizontalBarChart, StackedBarChart } from '@/shared/ui/charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { TypographyInlineCode, TypographyMuted, TypographyLarge } from '@/shared/ui/typography'
import { ROUTES } from '@/shared/config/constants'
import { dashboardApi } from '@/entities/dashboard'
import { getCategoryShortName } from '@/shared/lib/utils/category'


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

export function HomePage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: dashboardApi.getRecent,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
  })

  // 통계 데이터 쿼리 (기본값 사용: months=6, topN=5)
  const { data: topCustomersData, isLoading: isLoadingTopCustomers } = useQuery({
    queryKey: ['dashboard-top-customers'],
    queryFn: () => dashboardApi.getTopCustomers(),
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
  })

  const { data: monthlyPatchesData, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['dashboard-monthly-patches'],
    queryFn: () => dashboardApi.getMonthlyPatches(),
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
  })

  const latestInstall = dashboardData?.latestInstall
  const recentVersions = dashboardData?.recentVersions || []
  const recentPatches = dashboardData?.recentPatches || []

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
              {isLoading ? (
                <div className="animate-pulse h-16 bg-muted rounded" />
              ) : latestInstall ? (
                <Link
                  to={ROUTES.RELEASES.STANDARD}
                  state={{ selectedVersionId: latestInstall.releaseVersionId }}
                  className="block hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TypographyInlineCode className="text-2xl bg-transparent">{latestInstall.version}</TypographyInlineCode>
                      {latestInstall.fileCategories && latestInstall.fileCategories.length > 0 && (
                        <>
                          {latestInstall.fileCategories.map((category) => (
                            <Badge
                              key={category}
                              variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                              className="text-xs px-1.5 py-0.5"
                            >
                              {getCategoryShortName(category)}
                            </Badge>
                          ))}
                        </>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded" />)}
                </div>
              ) : recentVersions.length > 0 ? (
                <div className="space-y-2">
                  {recentVersions.map((version) => (
                    <Link
                      key={version.releaseVersionId}
                      to={ROUTES.RELEASES.STANDARD}
                      state={{ selectedVersionId: version.releaseVersionId }}
                      className="flex items-center justify-between text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TypographyInlineCode className="bg-transparent flex-shrink-0">{version.version}</TypographyInlineCode>
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
                      <TypographyMuted className="text-xs flex-shrink-0">{formatDate(version.createdAt)}</TypographyMuted>
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
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-6 bg-muted rounded" />)}
                </div>
              ) : recentPatches.length > 0 ? (
                <div className="space-y-2">
                  {recentPatches.map((patch) => (
                    <Link
                      key={patch.patchId}
                      to={ROUTES.PATCHES.STANDARD}
                      className="flex items-center justify-between text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TypographyInlineCode className="bg-transparent truncate">
                          {patch.patchName}
                        </TypographyInlineCode>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({patch.fromVersion} → {patch.toVersion})
                        </span>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {patch.releaseType === 'STANDARD' ? '표준' : '커스텀'}
                        </Badge>
                      </div>
                      <TypographyMuted className="text-xs flex-shrink-0">{formatDate(patch.createdAt)}</TypographyMuted>
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

      {/* Statistics */}
      <div>
        <TypographyLarge className="mb-3">Statistics</TypographyLarge>
        <div className="grid grid-cols-2 gap-4">
          {/* 고객사별 패치 통계 (Bar Chart) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                고객사별 패치 현황
              </CardTitle>
              <CardDescription>최근 {statisticsMonths}개월 Top {topN}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTopCustomers ? (
                <div className="animate-pulse h-[200px] bg-muted rounded" />
              ) : topCustomers && topCustomers.length > 0 ? (
                <HorizontalBarChart
                  data={topCustomers}
                  categoryKey="customerName"
                  valueKey="patchCount"
                  height={200}
                  tooltipFormatter={(value) => [`${value}건`, '패치 수']}
                />
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <TypographyMuted>데이터가 없습니다.</TypographyMuted>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 월별 패치 생성 현황 (Line Chart) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                월별 패치 생성 현황
              </CardTitle>
              <CardDescription>최근 {monthlyPatchesData?.months || 6}개월</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMonthly ? (
                <div className="animate-pulse h-[200px] bg-muted rounded" />
              ) : formattedMonthlyData.length > 0 ? (
                <StackedBarChart
                  data={formattedMonthlyData}
                  xAxisKey="displayMonth"
                  stackKeys={monthlyCustomers}
                  height={200}
                  tooltipValueFormatter={(value) => `${value}건`}
                  tooltipLabelFormatter={(label) => `20${label.replace('.', '년 ')}월`}
                />
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <TypographyMuted>데이터가 없습니다.</TypographyMuted>
                </div>
              )}
            </CardContent>
          </Card>
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
