import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// 차트 색상
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface HorizontalBarChartProps<T extends object> {
  /** 차트 데이터 */
  data: T[]
  /** Y축에 표시할 데이터 키 (카테고리명) */
  categoryKey: keyof T
  /** 막대 값에 해당하는 데이터 키 */
  valueKey: keyof T
  /** 차트 높이 (기본: 200, 숫자 또는 "100%" 등 퍼센트 문자열) */
  height?: number | `${number}%`
  /** Y축 너비 (기본: 100) */
  yAxisWidth?: number
  /** 툴팁 값 포맷터 */
  tooltipFormatter?: (value: number) => [string, string]
  /** 막대당 고정 높이 (기본: 32) */
  barHeight?: number
}

/**
 * 가로 막대 차트 공통 컴포넌트
 * - 데이터 개수와 관계없이 일정한 막대 크기 유지
 * - maxItems 기준으로 차트 영역 고정
 */
export function HorizontalBarChart<T extends object>({
  data,
  categoryKey,
  valueKey,
  height = 200,
  yAxisWidth = 100,
  tooltipFormatter = (value) => [`${value}`, 'Value'],
  barHeight = 32,
}: HorizontalBarChartProps<T>) {
  const chartHeight = height

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        barSize={barHeight - 8} // 막대 사이 간격을 위해 약간 줄임
      >
        <XAxis type="number" allowDecimals={false} fontSize={12} />
        <YAxis
          type="category"
          dataKey={categoryKey as string}
          width={yAxisWidth}
          fontSize={12}
          tickLine={false}
        />
        <Tooltip
          formatter={tooltipFormatter}
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
        <Bar dataKey={valueKey as string} radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
