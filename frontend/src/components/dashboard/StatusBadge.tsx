import { cn } from '@/lib/utils'
const styles: Record<string, string> = {
  ACTIVE: 'bg-teal-500/15 text-teal-700',
  PENDING: 'bg-amber-500/15 text-amber-800',
  APPROVED: 'bg-teal-500/15 text-teal-700',
  REJECTED: 'bg-red-500/15 text-red-700',
  SUBMITTED: 'bg-violet-500/15 text-violet-700',
  ACKNOWLEDGED: 'bg-violet-500/15 text-violet-700',
  GENERATED: 'bg-slate-500/10 text-slate-600',
  PAID: 'bg-teal-500/15 text-teal-700',
  PRESENT: 'bg-teal-500/15 text-teal-700',
  ABSENT: 'bg-red-500/15 text-red-700',
  LATE: 'bg-amber-500/15 text-amber-800',
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        styles[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {status}
    </span>
  )
}
