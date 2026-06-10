import { Bell } from 'lucide-react'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { mockNotifications } from '@/data/mock-ui-data'
import { cn } from '@/lib/utils'
const categories = ['All', 'Attendance', 'Payroll', 'Leave Requests', 'Performance Reviews', 'Company Announcements']

export function NotificationsPage() {
  return (
    <div>
      <DashboardHero
        eyebrow="Alerts"
        titleHighlight="Notifications &"
        titleRest="Alerts"
        description="Stay updated on attendance, payroll, leave, performance, and company news"
      />
      <div className="space-y-6 p-6 md:p-10">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <button
              key={cat}
              type="button"
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                i === 0 ? 'bg-gradient-brand text-white shadow-md' : 'bg-muted/50 text-muted-foreground hover:bg-muted',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative space-y-0">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" aria-hidden />
          {mockNotifications.map((n) => (
            <article key={n.id} className="relative flex gap-4 pb-8 pl-12">
              <div
                className={cn(
                  'absolute left-3 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background',
                  n.unread ? 'bg-brand-teal' : 'bg-muted',
                )}
              >
                {n.unread ? <span className="sr-only">Unread</span> : null}
              </div>
              <div className="surface-panel flex-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">{n.category}</p>
                    <p className="mt-1 font-medium">{n.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                  <Bell className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
