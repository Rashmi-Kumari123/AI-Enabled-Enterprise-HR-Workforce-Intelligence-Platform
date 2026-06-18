import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { ChartTooltipContent } from '@/components/charts/ChartTooltipContent'
import { chartColors, chartPalette } from '@/lib/chart-colors'
import type { ChartPoint } from '@/lib/chart-utils'
import { formatCompactNumber } from '@/lib/chart-utils'
export type BarSeries = {
  key: string
  label: string
  color?: string
}
type InteractiveBarChartProps = {
  data: ChartPoint[]
  series?: BarSeries[]
  valueKey?: string
  height?: number
  stacked?: boolean
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  onBarClick?: (entry: ChartPoint) => void
  activeName?: string | null
  colorByIndex?: boolean
}
export function InteractiveBarChart({
  data,
  series,
  valueKey = 'value',
  height = 220,
  stacked = false,
  valueFormatter = formatCompactNumber,
  showLegend = false,
  onBarClick,
  activeName,
  colorByIndex = true,
}: InteractiveBarChartProps) {
  const bars: BarSeries[] =
    series ?? [{ key: valueKey, label: 'Value', color: chartColors.teal }]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
          className="fill-muted-foreground"
          tickFormatter={(v) => valueFormatter(Number(v))}
        />
        <Tooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
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
        {bars.map((bar, barIndex) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.label}
            stackId={stacked ? 'stack' : undefined}
            fill={bar.color ?? chartColors.teal}
            radius={[6, 6, 0, 0]}
            onClick={(entry) => onBarClick?.(entry as unknown as ChartPoint)}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          >
            {colorByIndex && bars.length === 1
              ? data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      activeName && entry.name !== activeName
                        ? chartColors.slate
                        : chartPalette[index % chartPalette.length]
                    }
                    opacity={activeName && entry.name !== activeName ? 0.45 : 1}
                  />
                ))
              : null}
            {bars.length > 1 ? (
              <Cell fill={bar.color ?? chartPalette[barIndex % chartPalette.length]} />
            ) : null}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
