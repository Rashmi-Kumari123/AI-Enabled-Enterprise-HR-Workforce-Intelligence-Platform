import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  ACTIVE: 'bg-teal-500/15 text-teal-800 dark:text-teal-300',
  PENDING: 'bg-amber-500/15 text-amber-900 dark:text-amber-300',
  APPROVED: 'bg-teal-500/15 text-teal-800 dark:text-teal-300',
  REJECTED: 'bg-red-500/15 text-red-800 dark:text-red-300',
  SUBMITTED: 'bg-violet-500/15 text-violet-800 dark:text-violet-300',
  ACKNOWLEDGED: 'bg-violet-500/15 text-violet-800 dark:text-violet-300',
  GENERATED: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  PAID: 'bg-teal-500/15 text-teal-800 dark:text-teal-300',
  PRESENT: 'bg-teal-500/15 text-teal-800 dark:text-teal-300',
  ABSENT: 'bg-red-500/15 text-red-800 dark:text-red-300',
  LATE: 'bg-amber-500/15 text-amber-900 dark:text-amber-300',
  ON_LEAVE: 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide',
        styles[status] ?? 'bg-muted text-foreground/70',
      )}
    >
      {status}
    </span>
  )
}
