import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
export type QuickAction = {
  label: string
  icon: LucideIcon
  to: string
  accent?: 'teal' | 'purple'
}
type QuickActionsProps = {
  actions: QuickAction[]
  className?: string
}
export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.to}
          className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-brand-teal/30 hover:shadow-md"
        >
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
              action.accent === 'purple'
                ? 'bg-violet-500/10 text-violet-600 group-hover:bg-violet-500/15 dark:text-violet-400'
                : 'bg-teal-500/10 text-teal-600 group-hover:bg-teal-500/15 dark:text-teal-400',
            )}
          >
            <action.icon className="h-5 w-5" aria-hidden />
          </div>
          <span className="text-sm font-semibold">{action.label}</span>
        </Link>
      ))}
    </div>
  )
}
