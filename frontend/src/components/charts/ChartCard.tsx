import type { ReactNode } from 'react'
import { DateRangeFilter } from '@/components/charts/DateRangeFilter'
import type { DateRangePreset } from '@/lib/chart-utils'
import { cn } from '@/lib/utils'
type ChartCardProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
  dateRange?: DateRangePreset
  onDateRangeChange?: (range: DateRangePreset) => void
  drillDownLabel?: string | null
  onClearDrillDown?: () => void
  emptyMessage?: string
  isEmpty?: boolean
}
export function ChartCard({
  title,
  description,
  children,
  className,
  dateRange,
  onDateRangeChange,
  drillDownLabel,
  onClearDrillDown,
  emptyMessage = 'No data for this period.',
  isEmpty = false,
}: ChartCardProps) {
  return (
    <div className={cn('surface-panel flex flex-col p-5', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
          {drillDownLabel ? (
            <p className="mt-1.5 text-xs font-medium text-brand-teal">
              Viewing: {drillDownLabel}
              {onClearDrillDown ? (
                <button
                  type="button"
                  className="ml-2 text-muted-foreground underline-offset-2 hover:underline"
                  onClick={onClearDrillDown}
                >
                  Clear
                </button>
              ) : null}
            </p>
          ) : null}
        </div>
        {dateRange && onDateRangeChange ? (
          <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
        ) : null}
      </div>
      {isEmpty ? (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">{emptyMessage}</div>
      ) : (
        children
      )}
    </div>
  )
}
