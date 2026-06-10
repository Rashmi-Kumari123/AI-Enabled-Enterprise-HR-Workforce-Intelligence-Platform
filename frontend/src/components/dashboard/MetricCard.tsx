import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type MetricCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  accent?: 'teal' | 'purple'
  className?: string
}
export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'teal',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'surface-panel p-5 transition-shadow hover:shadow-xl',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground/70">{title}</p>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tracking-tight tabular-nums',
              accent === 'purple' ? 'stat-value-purple' : 'stat-value-teal',
            )}
          >
            {value}
          </p>
          {subtitle ? (
            <p className="mt-1 text-xs font-medium text-foreground/60">{subtitle}</p>
          ) : null}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            accent === 'purple'
              ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
              : 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
      </div>
    </div>
  )
}
