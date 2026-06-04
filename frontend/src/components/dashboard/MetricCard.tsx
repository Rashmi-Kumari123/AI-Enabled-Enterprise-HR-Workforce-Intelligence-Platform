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
        'rounded-2xl border border-white/80 bg-white p-5 shadow-lg shadow-black/[0.04] transition-shadow hover:shadow-xl',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tracking-tight',
              accent === 'purple' ? 'stat-value-purple' : 'stat-value-teal',
            )}
          >
            {value}
          </p>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            accent === 'purple' ? 'bg-violet-500/10 text-violet-600' : 'bg-teal-500/10 text-teal-600',
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </div>
  )
}
