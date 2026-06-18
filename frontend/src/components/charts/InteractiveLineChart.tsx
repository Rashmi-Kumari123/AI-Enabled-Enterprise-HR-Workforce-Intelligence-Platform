import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { ChartTooltipContent } from '@/components/charts/ChartTooltipContent'
import { chartColors } from '@/lib/chart-colors'
import type { ChartPoint } from '@/lib/chart-utils'
import { formatCompactNumber } from '@/lib/chart-utils'
export type LineSeries = {
  key: string
  label: string
  color?: string
}
type InteractiveLineChartProps = {
  data: ChartPoint[]
  series?: LineSeries[]
  valueKey?: string
  height?: number
  yDomain?: [number | 'auto', number | 'auto']
  valueFormatter?: (value: number) => string
  showLegend?: boolean
}
export function InteractiveLineChart({
  data,
  series,
  valueKey = 'value',
  height = 220,
  yDomain,
  valueFormatter = formatCompactNumber,
  showLegend = false,
}: InteractiveLineChartProps) {
  const lines: LineSeries[] =
    series ?? [{ key: valueKey, label: 'Value', color: chartColors.teal }]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={yDomain}
          className="fill-muted-foreground"
          tickFormatter={(v) => valueFormatter(Number(v))}
        />
        <Tooltip
          cursor={{ stroke: chartColors.teal, strokeWidth: 1, strokeDasharray: '4 4' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <ChartTooltipContent
                title={String(label)}
                rows={payload.map((entry) => ({
                  label: String(entry.name ?? entry.dataKey),
                  value: valueFormatter(Number(entry.value ?? 0)),
                  color: String(entry.color ?? chartColors.teal),
                }))}
              />
            )
          }}
        />
        {showLegend ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color ?? chartColors.teal}
            strokeWidth={2.5}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
