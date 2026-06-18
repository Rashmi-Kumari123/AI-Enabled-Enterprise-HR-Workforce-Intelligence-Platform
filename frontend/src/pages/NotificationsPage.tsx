import { Bell } from 'lucide-react'
import { useState } from 'react'
import { DashboardHero } from '@/components/layout/DashboardHero'
import { useNotifications } from '@/contexts/notification-context'
import { cn } from '@/lib/utils'

const categories = ['All', 'LEAVE', 'PAYROLL', 'PERFORMANCE', 'SYSTEM'] as const

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotificationsPage() {
  const { notifications, connected, markRead, refresh } = useNotifications()
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('All')

  const filtered =
    activeCategory === 'All'
      ? notifications
      : notifications.filter(
          (n) =>
            n.type.includes(activeCategory) ||
            (n.referenceType ?? '').toUpperCase().includes(activeCategory),
        )

  return (
    <div>
      <DashboardHero
        eyebrow="Alerts"
        titleHighlight="Notifications &"
        titleRest="Alerts"
        description={connected ? 'Live updates via WebSocket + REST' : 'Loading notifications from notification-service'}
        onRefresh={refresh}
      />
      <div className="space-y-6 p-6 md:p-10">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                activeCategory === cat
                  ? 'bg-gradient-brand text-white shadow-md'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted',
              )}
            >
              {cat === 'All' ? 'All' : cat.replaceAll('_', ' ')}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <div className="relative space-y-0">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" aria-hidden />
            {filtered.map((n) => (
              <article key={n.id} className="relative flex gap-4 pb-8 pl-12">
                <button
                  type="button"
                  className={cn(
                    'absolute left-3 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background',
                    !n.read ? 'bg-brand-teal' : 'bg-muted',
                  )}
                  onClick={() => !n.read && markRead(n.id)}
                  aria-label={n.read ? 'Read' : 'Mark as read'}
                />
                <div className="surface-panel flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">
                        {n.type.replaceAll('_', ' ')}
                      </p>
                      <p className="mt-1 font-medium">{n.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatTime(n.createdAt)}</p>
                    </div>
                    <Bell className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
