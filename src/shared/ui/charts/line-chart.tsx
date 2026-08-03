import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface SimpleLineChartProps<T extends object> {
  /** 차트 데이터 */
  data: T[]
  /** X축에 표시할 데이터 키 */
  xAxisKey: keyof T
  /** 라인 값에 해당하는 데이터 키 */
  valueKey: keyof T
  /** 차트 높이 (기본: 200) */
  height?: number
  /** 툴팁 값 포맷터 */
  tooltipFormatter?: (value: number) => [string, string]
  /** 툴팁 라벨 포맷터 */
  tooltipLabelFormatter?: (label: string) => string
  /** 라인 색상 (기본: chart-1) */
  lineColor?: string
}

/**
 * 라인 차트 공통 컴포넌트
 */
export function SimpleLineChart<T extends object>({
  data,
  xAxisKey,
  valueKey,
  height = 200,
  tooltipFormatter = (value) => [`${value}`, 'Value'],
  tooltipLabelFormatter,
  lineColor = 'hsl(var(--chart-1))',
}: SimpleLineChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
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
        />
        <Line
          type="monotone"
          dataKey={valueKey as string}
          stroke={lineColor}
          strokeWidth={2}
          dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
