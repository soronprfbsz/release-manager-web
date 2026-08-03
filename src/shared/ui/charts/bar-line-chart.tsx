import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface BarLineChartProps<T extends object> {
  /** 차트 데이터 */
  data: T[]
  /** X축에 표시할 데이터 키 */
  xAxisKey: keyof T
  /** 막대/라인 값에 해당하는 데이터 키 */
  valueKey: keyof T
  /** 차트 높이 (기본: 200) */
  height?: number
  /** 툴팁 값 포맷터 */
  tooltipFormatter?: (value: number) => [string, string]
  /** 툴팁 라벨 포맷터 */
  tooltipLabelFormatter?: (label: string) => string
  /** 막대 색상 (기본: chart-2) */
  barColor?: string
  /** 라인 색상 (기본: chart-1) */
  lineColor?: string
  /** 최대 항목 수 (기본: 6) - 막대 너비 계산에 사용 */
  maxItems?: number
}

/**
 * 막대 + 라인 복합 차트 공통 컴포넌트
 * - maxItems 기준으로 막대 너비를 일정하게 유지
 */
export function BarLineChart<T extends object>({
  data,
  xAxisKey,
  valueKey,
  height = 200,
  tooltipFormatter = (value) => [`${value}`, 'Value'],
  tooltipLabelFormatter,
  barColor = 'hsl(var(--chart-2))',
  lineColor = 'hsl(var(--chart-1))',
  maxItems = 6,
}: BarLineChartProps<T>) {
  // maxItems 기준으로 막대 너비를 퍼센트로 계산 (전체를 maxItems로 나눈 후 60% 사용)
  const barCategoryGap = `${Math.floor(100 / maxItems * 0.4)}%`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        barCategoryGap={barCategoryGap}
      >
        <XAxis
          dataKey={xAxisKey as string}
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          fontSize={12}
          tickLine={false}
        />
        {/* 툴팁이 좌상단에서 커서로 미끄러지는 것 방지 — StackedBarChart 주석 참조 */}
        <Tooltip
          isAnimationActive={false}
          formatter={tooltipFormatter}
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
        <Bar
          dataKey={valueKey as string}
          fill={barColor}
          radius={[4, 4, 0, 0]}
          opacity={0.8}
          maxBarSize={50}
        />
        <Line
          type="monotone"
          dataKey={valueKey as string}
          stroke={lineColor}
          strokeWidth={2}
          dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
