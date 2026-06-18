import { DATE_RANGE_OPTIONS, type DateRangePreset } from '@/lib/chart-utils'
import { cn } from '@/lib/utils'
type DateRangeFilterProps = {
  value: DateRangePreset
  onChange: (value: DateRangePreset) => void
  className?: string
}
export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} role="group" aria-label="Date range">
      {DATE_RANGE_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
            value === option.id
              ? 'bg-brand-teal text-white shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
