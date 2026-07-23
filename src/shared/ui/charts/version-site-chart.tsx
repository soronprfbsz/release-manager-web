import type {
  VersionSiteGroup,
  SiteInfo,
} from '@/entities/_shared/dashboard'

import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted } from '@/shared/ui/typography'


const COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#a855f7', // purple
  '#0ea5e9', // sky
  '#f43f5e', // rose
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#d946ef', // fuchsia
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#ec4899', // pink
]

function siteColor(c: SiteInfo): string {
  const idx = Number(c.siteId) % COLORS.length
  return COLORS[idx]
}

interface VersionSiteChartProps {
  data: VersionSiteGroup[]
  showLegend?: boolean
  /** X축 최소 도메인 (기본 5) — 데이터 max 가 5 미만이어도 5 로 잡아 막대가 가로로 꽉차지 않게 */
  minDomain?: number
}

/**
 * 버전별 사이트 분포 stacked horizontal bar 차트.
 * 각 segment = 1 사이트. 색상은 사이트 고유 식별이며 hover 시 tooltip 으로 사이트명 표시.
 */
export function VersionSiteChart({
  data,
  showLegend = true,
  minDomain = 5,
}: VersionSiteChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <TypographyMuted>데이터가 없습니다.</TypographyMuted>
      </div>
    )
  }

  // 데이터 max 가 minDomain 보다 작으면 minDomain 으로 (꽉찬 막대 방지)
  const domainMax = Math.max(...data.map((d) => d.count), minDomain)

  // 전체 사이트 목록 (범례용 — siteId 중복 제거)
  const allSites = Array.from(
    new Map(
      data.flatMap((g) => g.sites).map((c) => [c.siteId, c]),
    ).values(),
  ).sort((a, b) => a.siteName.localeCompare(b.siteName, 'ko'))

  return (
    <div className="flex flex-col h-full">
      {/* row 컨테이너: 자연 흐름으로 두어 단일 row 일 때도 막대가 stretch 되지 않게 함 */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="space-y-3">
          {data.map((group) => (
            <div key={group.version}>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <code className="font-mono text-foreground">{group.version}</code>
                <span className="text-muted-foreground">{group.count} 사이트</span>
              </div>
              <div
                className="h-6 flex bg-muted/40 rounded overflow-hidden"
                style={{ width: `${(group.count / domainMax) * 100}%` }}
              >
                {group.sites.map((c, idx) => {
                  const color = siteColor(c)
                  return (
                    <Tooltip key={c.siteId}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'flex-1 transition hover:brightness-125',
                            idx > 0 && 'border-l border-background',
                          )}
                          style={{ backgroundColor: color }}
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-popover text-popover-foreground border border-border [&>svg]:fill-popover"
                      >
                        <div className="text-xs">
                          <div className="font-semibold mb-1">{group.version}</div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span>
                              {c.siteName}
                              <span className="text-muted-foreground">({c.siteCode})</span>
                            </span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 pt-3 border-t text-[10px] text-muted-foreground flex-shrink-0">
          {allSites.map((c) => (
            <span key={c.siteId} className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 flex-shrink-0"
                style={{ backgroundColor: siteColor(c) }}
              />
              {c.siteName}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
