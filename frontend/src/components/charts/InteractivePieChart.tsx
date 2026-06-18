import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartTooltipContent } from '@/components/charts/ChartTooltipContent'
import { chartPalette } from '@/lib/chart-colors'
import type { ChartPoint } from '@/lib/chart-utils'
import { formatCompactNumber } from '@/lib/chart-utils'
type InteractivePieChartProps = {
  data: ChartPoint[]
  height?: number
  valueKey?: string
  onSliceClick?: (entry: ChartPoint) => void
  activeName?: string | null
}
export function InteractivePieChart({
  data,
  height = 220,
  valueKey = 'value',
  onSliceClick,
  activeName,
}: InteractivePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={activeName ? 74 : 78}
          paddingAngle={2}
          onClick={(_, index) => {
            const entry = data[index]
            if (entry) onSliceClick?.(entry)
          }}
          style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={chartPalette[index % chartPalette.length]}
              opacity={activeName && entry.name !== activeName ? 0.35 : 1}
              stroke={activeName === entry.name ? '#fff' : 'transparent'}
              strokeWidth={activeName === entry.name ? 2 : 0}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            const total = data.reduce((sum, d) => sum + Number(d[valueKey] ?? 0), 0)
            const value = Number(item?.value ?? 0)
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            return (
              <ChartTooltipContent
                title={String(item?.name)}
                rows={[
                  { label: 'Count', value: formatCompactNumber(value), color: String(item?.payload?.fill) },
                  { label: 'Share', value: `${pct}%` },
                ]}
              />
            )
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
