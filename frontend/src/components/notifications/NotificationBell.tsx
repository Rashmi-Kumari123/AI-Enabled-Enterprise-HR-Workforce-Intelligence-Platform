import { Bell, Mail } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'
const PANEL_WIDTH = 320
const PANEL_GAP = 8

export function NotificationBell() {
  const { notifications, unreadCount, connected, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !buttonRef.current) return

    function updatePosition() {
      const rect = buttonRef.current!.getBoundingClientRect()
      let left = rect.right - PANEL_WIDTH
      left = Math.max(PANEL_GAP, Math.min(left, window.innerWidth - PANEL_WIDTH - PANEL_GAP))
      setPanelPosition({ top: rect.bottom + PANEL_GAP, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const panel = open ? (
    <div
      ref={panelRef}
      className="fixed z-[100] w-80 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-black/10"
      style={{ top: panelPosition.top, left: panelPosition.left }}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">
            {connected ? 'Live · Email & in-app' : 'Reconnecting…'}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            className="text-xs font-medium text-brand-teal hover:underline"
            onClick={() => markAllRead()}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </p>
        ) : (
          notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'w-full border-b border-border/40 px-4 py-3 text-left transition-colors hover:bg-muted/40',
                !item.read && 'bg-teal-500/5',
              )}
              onClick={() => {
                if (!item.read) {
                  markRead(item.id)
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                {!item.read ? (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-teal" />
                ) : null}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.message}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {item.type.replaceAll('_', ' ')}
                </p>
                    {item.deliveries?.some((d) => d.channel === 'EMAIL' && d.status === 'SENT') ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        <Mail className="h-3 w-3" />
                        Email
                      </span>
                    ) : null}
                  </div>
            </button>
          ))
        )}
      </div>
    </div>
  ) : null

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        size="icon"
        className="relative rounded-full bg-card"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </Button>

      {panel ? createPortal(panel, document.body) : null}
    </div>
  )
}
