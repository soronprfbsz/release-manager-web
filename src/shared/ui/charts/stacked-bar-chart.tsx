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
  /** 스택(고객사 등) 클릭 콜백 — 범례/막대 segment 클릭 시 stackKey 전달 */
  onStackClick?: (stackKey: string) => void
}

/**
 * 누적 막대 차트 공통 컴포넌트
 * - 여러 카테고리를 색상으로 구분하여 누적 표시
 */
export function StackedBarChart({
  data,
  xAxisKey,
  stackKeys,
  height = 200,
  tooltipValueFormatter = (value) => `${value}건`,
  tooltipLabelFormatter,
  showLegend = true,
  onStackClick,
}: StackedBarChartProps) {
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
            wrapperStyle={{ fontSize: '12px', cursor: onStackClick ? 'pointer' : undefined }}
            iconType="rect"
            iconSize={10}
            onClick={
              onStackClick
                ? (entry: { value?: string | number }) => {
                    if (typeof entry.value === 'string') onStackClick(entry.value)
                  }
                : undefined
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
            cursor={onStackClick ? 'pointer' : undefined}
            onClick={onStackClick ? () => onStackClick(key) : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
