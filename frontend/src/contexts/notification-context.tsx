import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { mockNotifications } from '@/data/mock-ui-data'
import { useAuth } from '@/contexts/auth-context'
import type { AppNotification } from '@/types/notification'

type NotificationContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  connected: boolean
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}
const NotificationContext = createContext<NotificationContextValue | null>(null)

const demoNotifications: AppNotification[] = mockNotifications.map((n, i) => ({
  id: n.id,
  title: n.title,
  message: n.title,
  type: 'SYSTEM' as const,
  referenceType: n.category,
  referenceId: null,
  read: !n.unread,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>(demoNotifications)

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    setNotifications(demoNotifications)
  }, [isAuthenticated])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      connected: isAuthenticated,
      markRead,
      markAllRead,
      refresh,
    }),
    [notifications, unreadCount, isAuthenticated, markRead, markAllRead, refresh],
  )
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
