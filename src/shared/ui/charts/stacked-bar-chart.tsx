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
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface StackedBarChartProps {
  /** 차트 데이터 */
  data: Record<string, unknown>[]
  /** X축에 표시할 데이터 키 */
  xAxisKey: string
  /** 스택으로 쌓을 키 목록 (고객사명 등) */
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
          formatter={(value: number, name: string) => [tooltipValueFormatter(value), name]}
          labelFormatter={tooltipLabelFormatter}
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            color: 'hsl(var(--popover-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          labelStyle={{
            color: 'hsl(var(--popover-foreground))',
            fontWeight: 600,
          }}
          itemStyle={{
            color: 'hsl(var(--popover-foreground))',
          }}
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
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
