import { useState } from 'react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// 차트 색상
/**
 * stackKeys 는 사이트 목록이라 사이트 식별 팔레트(`--site-1` ~ `--site-8`)를 쓴다.
 * chart-1~5 만 순환하면 사이트가 5개를 넘는 순간 색이 겹쳐 범례가 모호해진다
 * (운영 기준 11개 사이트). VersionSiteChart 와 같은 팔레트라 대시보드 안에서
 * 두 차트의 색 언어가 일치한다.
 */
const CHART_COLORS = [
  'hsl(var(--site-1))',
  'hsl(var(--site-2))',
  'hsl(var(--site-3))',
  'hsl(var(--site-4))',
  'hsl(var(--site-5))',
  'hsl(var(--site-6))',
  'hsl(var(--site-7))',
  'hsl(var(--site-8))',
]

/** Recharts 가 커스텀 툴팁 content 에 넘기는 payload 항목 (shared=false 라 항상 1개) */
interface TooltipItem {
  name?: string
  value?: number
  color?: string
  /** hover 한 세그먼트가 속한 데이터 row 전체 */
  payload?: Record<string, unknown>
}

interface SegmentTooltipProps {
  active?: boolean
  payload?: TooltipItem[]
  xAxisKey: string
  /** 범례로 숨기지 않은 key — 총합은 차트에 실제로 그려진 것만 더한다 */
  visibleKeys: string[]
  valueFormatter: (value: number) => string
  labelFormatter?: (label: string) => string
}

/**
 * 세그먼트 단위 툴팁 — hover 한 스택 조각의 값 + 해당 카테고리 총합을 보여준다.
 *
 * 기본 툴팁은 카테고리의 모든 series 를 나열해 사이트가 많아지면 읽기 어렵다.
 * `shared={false}` 로 hover 한 조각만 받고, 총합은 payload 에 함께 실려오는
 * row 에서 계산한다. 이때 Recharts 는 `label` 을 넘겨주지 않으므로
 * row 의 xAxisKey 값을 직접 꺼내 쓴다.
 */
function SegmentTooltip({
  active,
  payload,
  xAxisKey,
  visibleKeys,
  valueFormatter,
  labelFormatter,
}: SegmentTooltipProps) {
  const item = payload?.[0]
  if (!active || !item) return null

  const row = item.payload ?? {}
  const total = visibleKeys.reduce((sum, key) => sum + (Number(row[key]) || 0), 0)
  const label = typeof row[xAxisKey] === 'string' ? (row[xAxisKey] as string) : undefined

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <div className="font-semibold">{label && labelFormatter ? labelFormatter(label) : label}</div>
      <div className="text-muted-foreground">총 {valueFormatter(total)}</div>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className="w-2.5 h-2.5 flex-shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span>{item.name}</span>
        <span className="font-semibold">{valueFormatter(Number(item.value) || 0)}</span>
      </div>
    </div>
  )
}

interface StackedBarChartProps {
  /** 차트 데이터 */
  data: Record<string, unknown>[]
  /** X축에 표시할 데이터 키 */
  xAxisKey: string
  /** 스택으로 쌓을 키 목록 (사이트명 등) */
  stackKeys: string[]
  /** 차트 높이 (기본: 200, 숫자 또는 "100%" 등 퍼센트 문자열) */
  height?: number | `${number}%`
  /** 툴팁 값 포맷터 */
  tooltipValueFormatter?: (value: number) => string
  /** 툴팁 라벨 포맷터 */
  tooltipLabelFormatter?: (label: string) => string
  /** 범례 표시 여부 (기본: true) */
  showLegend?: boolean
}

/**
 * 누적 막대 차트 공통 컴포넌트
 * - 여러 카테고리를 색상으로 구분하여 누적 표시
 * - 범례 클릭 시 해당 series 를 ON/OFF 토글 (차트 라이브러리 표준 동작)
 */
export function StackedBarChart({
  data,
  xAxisKey,
  stackKeys,
  height = 200,
  tooltipValueFormatter = (value) => `${value}건`,
  tooltipLabelFormatter,
  showLegend = true,
}: StackedBarChartProps) {
  // 범례 클릭으로 hide 된 series 집합
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set())

  const handleLegendClick = (entry: { value?: string | number }) => {
    if (typeof entry.value !== 'string') return
    const key = entry.value
    setHiddenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey={xAxisKey}
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          fontSize={12}
          tickLine={false}
        />
        <Tooltip
          shared={false}
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
          content={
            <SegmentTooltip
              xAxisKey={xAxisKey}
              visibleKeys={stackKeys.filter((key) => !hiddenKeys.has(key))}
              valueFormatter={tooltipValueFormatter}
              labelFormatter={tooltipLabelFormatter}
            />
          }
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: '12px', cursor: 'pointer' }}
            iconType="rect"
            iconSize={10}
            onClick={handleLegendClick}
            formatter={(value: string) =>
              hiddenKeys.has(value) ? (
                <span style={{ color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>
                  {value}
                </span>
              ) : (
                value
              )
            }
          />
        )}
        {stackKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="stack"
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            radius={index === stackKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            hide={hiddenKeys.has(key)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
