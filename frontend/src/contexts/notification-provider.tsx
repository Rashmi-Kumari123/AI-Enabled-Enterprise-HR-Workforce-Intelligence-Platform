import { Client, type IMessage } from '@stomp/stompjs'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import SockJS from 'sockjs-client'
import { NotificationContext } from '@/contexts/notification-context'
import { useAuth } from '@/hooks/use-auth'
import * as notificationApi from '@/lib/api/notification-api'
import { apiConfig } from '@/lib/api/config'
import { getAccessToken } from '@/lib/auth/storage'
import type { AppNotification, NotificationResponse } from '@/types/notification'
function toAppNotification(item: NotificationResponse | AppNotification): AppNotification {
  return {
    id: item.id,
    title: item.title,
    message: item.message,
    type: item.type,
    referenceType: item.referenceType,
    referenceId: item.referenceId,
    read: item.read,
    createdAt: item.createdAt,
    deliveries: 'deliveries' in item ? item.deliveries : undefined,
  }
}
function parseStompMessage(message: IMessage): AppNotification | null {
  try {
    return toAppNotification(JSON.parse(message.body) as AppNotification)
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
      return [incoming, ...withoutDuplicate].slice(0, 50)
    })
  }, [])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const [items, unread] = await Promise.all([
        notificationApi.fetchMyNotifications(),
        notificationApi.fetchUnreadCount(),
      ])
      setNotifications(items.map(toAppNotification))
      setUnreadCount(unread.unreadCount)
    } catch {
      // Notification service may be offline — keep existing state
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    const timeoutId = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [isAuthenticated, refresh])

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      clientRef.current?.deactivate()
      clientRef.current = null
      return
    }

    const token = getAccessToken()
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${apiConfig.notifications}/ws-notifications`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/user/queue/notifications', (message) => {
          const incoming = parseStompMessage(message)
          if (incoming) upsertNotification(incoming)
        })
        if (isManager) {
          client.subscribe('/topic/managers/notifications', (message) => {
            const incoming = parseStompMessage(message)
            if (incoming) upsertNotification(incoming)
          })
        }
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    clientRef.current = client
    client.activate()

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [isAuthenticated, user?.email, isManager, upsertNotification])

  const markRead = useCallback(async (id: number) => {
    await notificationApi.markNotificationRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
    setUnreadCount((count) => Math.max(0, count - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    const result = await notificationApi.markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(result.unreadCount)
  }, [])

  const value = useMemo(
    () => ({
      notifications: isAuthenticated ? notifications : [],
      unreadCount: isAuthenticated ? unreadCount : 0,
      connected: isAuthenticated && connected,
      markRead,
      markAllRead,
      refresh,
    }),
    [isAuthenticated, notifications, unreadCount, connected, markRead, markAllRead, refresh],
  )
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
