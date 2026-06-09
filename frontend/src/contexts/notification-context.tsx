import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import * as notificationApi from '@/lib/api/notification-api'
import { apiConfig } from '@/lib/api/config'
import { getAccessToken } from '@/lib/auth/storage'
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
function parseNotification(body: string): AppNotification | null {
  try {
    const parsed = JSON.parse(body) as AppNotification
    if (!parsed.id || !parsed.title) return null
    return parsed
  } catch {
    return null
  }
}
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, hasRole } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const isManager = hasRole('HR') || hasRole('ADMIN') || hasRole('MANAGER')

  const upsertNotification = useCallback((incoming: AppNotification) => {
    setNotifications((prev) => {
      const exists = prev.some((item) => item.id === incoming.id)
      if (!exists && !incoming.read) {
        setUnreadCount((count) => count + 1)
      }
      const withoutDuplicate = prev.filter((item) => item.id !== incoming.id)
      return [incoming, ...withoutDuplicate].slice(0, 20)
    })
  }, [])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const [items, unread] = await Promise.all([
        notificationApi.fetchMyNotifications(),
        notificationApi.fetchUnreadCount(),
      ])
      setNotifications(
        items.map((item) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          type: item.type,
          referenceType: item.referenceType,
          referenceId: item.referenceId,
          read: item.read,
          createdAt: item.createdAt,
          deliveries: item.deliveries,
        })),
      )
      setUnreadCount(unread.unreadCount)
    } catch {
      // Notification service may be offline during local dev
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      setConnected(false)
      clientRef.current?.deactivate()
      clientRef.current = null
      return
    }
    refresh()

    const token = getAccessToken()
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${apiConfig.notifications}/ws-notifications`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/user/queue/notifications', (message: IMessage) => {
          const parsed = parseNotification(message.body)
          if (parsed) upsertNotification(parsed)
        })
        if (isManager) {
          client.subscribe('/topic/managers/notifications', (message: IMessage) => {
            const parsed = parseNotification(message.body)
            if (parsed) upsertNotification({ ...parsed, read: false })
          })
        }
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    })

    clientRef.current = client
    client.activate()

    return () => {
      client.deactivate()
      clientRef.current = null
      setConnected(false)
    }
  }, [isAuthenticated, isManager, refresh, upsertNotification, user?.email])

  const markRead = useCallback(async (id: number) => {
    await notificationApi.markNotificationRead(id)
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    )
    setUnreadCount((count) => Math.max(0, count - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    const result = await notificationApi.markAllNotificationsRead()
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    setUnreadCount(result.unreadCount)
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      connected,
      markRead,
      markAllRead,
      refresh,
    }),
    [notifications, unreadCount, connected, markRead, markAllRead, refresh],
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
