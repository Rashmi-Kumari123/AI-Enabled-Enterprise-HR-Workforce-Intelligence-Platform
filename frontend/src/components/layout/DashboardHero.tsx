import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
type DashboardHeroProps = {
  eyebrow: string
  titleHighlight: string
  titleRest: string
  description: string
  onRefresh?: () => void
  refreshing?: boolean
  children?: ReactNode
}
export function DashboardHero({
  eyebrow,
  titleHighlight,
  titleRest,
  description,
  onRefresh,
  refreshing,
  children,
}: DashboardHeroProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden border-b px-6 py-10 md:px-10',
        'border-border/60 bg-card/95 dark:border-border dark:bg-card',
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-500/10" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-500/10" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            <span className="text-gradient-brand">{titleHighlight}</span>{' '}
            <span className="text-foreground">{titleRest}</span>
          </h1>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-foreground/75 md:text-base">
            {description}
          </p>
        </div>
        {onRefresh ? (
          <Button variant="outline" className="rounded-full bg-card" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        ) : null}
      </div>
      {children ? <div className="relative mt-6">{children}</div> : null}
    </div>
  )
}
