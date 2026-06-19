import { createContext } from 'react'
import type { AppNotification } from '@/types/notification'
export type NotificationContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  connected: boolean
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}
export const NotificationContext = createContext<NotificationContextValue | null>(null)
