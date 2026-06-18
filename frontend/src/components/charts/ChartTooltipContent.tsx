type TooltipRow = { label: string; value: string; color?: string }
type ChartTooltipContentProps = {
  title?: string
  rows: TooltipRow[]
}
export function ChartTooltipContent({ title, rows }: ChartTooltipContentProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card px-3 py-2 text-xs shadow-lg">
      {title ? <p className="mb-1.5 font-semibold text-foreground">{title}</p> : null}
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {row.color ? (
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
              ) : null}
              {row.label}
            </span>
            <span className="font-semibold text-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
