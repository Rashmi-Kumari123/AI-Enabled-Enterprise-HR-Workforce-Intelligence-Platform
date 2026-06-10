import { cn } from '@/lib/utils'

type ChartPlaceholderProps = {
  title: string
  values: number[]
  labels?: string[]
  accent?: 'teal' | 'purple'
  className?: string
}

export function ChartPlaceholder({
  title,
  values,
  labels,
  accent = 'teal',
  className,
}: ChartPlaceholderProps) {
  const max = Math.max(...values, 1)
  const barColor = accent === 'purple' ? 'bg-brand-purple' : 'bg-brand-teal'

  return (
    <div className={cn('surface-panel p-5', className)}>
      <p className="mb-4 text-sm font-semibold">{title}</p>
      <div className="flex h-40 items-end gap-2">
        {values.map((value, i) => (
          <div key={labels?.[i] ?? i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={cn('w-full rounded-t-lg opacity-90 transition-all', barColor)}
              style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? '8px' : '2px' }}
              role="img"
              aria-label={`${labels?.[i] ?? `Point ${i + 1}`}: ${value}`}
            />
            {labels?.[i] ? (
              <span className="text-[10px] text-muted-foreground">{labels[i]}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
