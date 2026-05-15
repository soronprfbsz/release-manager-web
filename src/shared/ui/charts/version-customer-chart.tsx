import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted } from '@/shared/ui/typography'
import { cn } from '@/shared/lib/utils'

import type {
  VersionCustomerGroup,
  CustomerInfo,
} from '@/entities/_shared/dashboard'

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

function customerColor(c: CustomerInfo): string {
  const idx = Number(c.customerId) % COLORS.length
  return COLORS[idx]
}

interface VersionCustomerChartProps {
  data: VersionCustomerGroup[]
  showLegend?: boolean
}

/**
 * 버전별 고객사 분포 stacked horizontal bar 차트.
 * 각 segment = 1 고객사. 색상은 고객사 고유 식별이며 hover 시 tooltip 으로 고객사명 표시.
 */
export function VersionCustomerChart({
  data,
  showLegend = true,
}: VersionCustomerChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <TypographyMuted>데이터가 없습니다.</TypographyMuted>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  // 전체 고객사 목록 (범례용 — customerId 중복 제거)
  const allCustomers = Array.from(
    new Map(
      data.flatMap((g) => g.customers).map((c) => [c.customerId, c]),
    ).values(),
  ).sort((a, b) => a.customerName.localeCompare(b.customerName, 'ko'))

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-3 overflow-auto">
        {data.map((group) => (
          <div key={group.version}>
            <div className="flex items-baseline justify-between text-xs mb-1">
              <code className="font-mono text-foreground">{group.version}</code>
              <span className="text-muted-foreground">{group.count} 고객사</span>
            </div>
            <div
              className="h-6 flex bg-muted/40 rounded overflow-hidden"
              style={{ width: `${(group.count / maxCount) * 100}%` }}
            >
              {group.customers.map((c, idx) => (
                <Tooltip key={c.customerId}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'flex-1 cursor-pointer transition hover:brightness-125',
                        idx > 0 && 'border-l border-background',
                      )}
                      style={{ backgroundColor: customerColor(c) }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="text-xs">
                      <div className="font-medium">{c.customerName}</div>
                      <div className="text-muted-foreground">{c.customerCode}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 pt-3 border-t text-[10px] text-muted-foreground">
          {allCustomers.map((c) => (
            <span key={c.customerId} className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: customerColor(c) }}
              />
              {c.customerName}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
