import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltipContent } from '@/components/charts/ChartTooltipContent'
import { chartColors } from '@/lib/chart-colors'
import type { ChartPoint } from '@/lib/chart-utils'
import { formatCompactNumber } from '@/lib/chart-utils'
type InteractiveAreaChartProps = {
  data: ChartPoint[]
  valueKey?: string
  height?: number
  color?: string
  valueFormatter?: (value: number) => string
}
export function InteractiveAreaChart({
  data,
  valueKey = 'value',
  height = 220,
  color = chartColors.purple,
  valueFormatter = formatCompactNumber,
}: InteractiveAreaChartProps) {
  const gradientId = `area-${valueKey}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <ChartTooltipContent
                title={String(label)}
                rows={[
                  {
                    label: 'Value',
                    value: valueFormatter(Number(payload[0]?.value ?? 0)),
                    color,
                  },
                ]}
              />
            )
          }}
        />
        <Area
          type="monotone"
          dataKey={valueKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
