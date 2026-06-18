import { fetchAuthedJson } from '@/lib/api/authenticated'
import { apiConfig } from '@/lib/api/config'
import type { NotificationResponse } from '@/types/notification'
export type DeliveryStats = {
  totalSent: number
  totalFailed: number
  deliveryRatePercent: number
}
export type DispatchNotificationInput = {
  audience: 'USER' | 'MANAGERS'
  recipientEmail?: string
  title: string
  message: string
  type?: 'SYSTEM'
}

export function fetchMyNotifications(): Promise<NotificationResponse[]> {
  return fetchAuthedJson<NotificationResponse[]>(`${apiConfig.notifications}/api/v1/notifications/me`)
}
export function fetchUnreadCount(): Promise<{ unreadCount: number }> {
  return fetchAuthedJson<{ unreadCount: number }>(
    `${apiConfig.notifications}/api/v1/notifications/me/unread-count`,
  )
}
export function markNotificationRead(id: number): Promise<NotificationResponse> {
  return fetchAuthedJson<NotificationResponse>(
    `${apiConfig.notifications}/api/v1/notifications/${id}/read`,
    { method: 'POST' },
  )
}
export function markAllNotificationsRead(): Promise<{ unreadCount: number }> {
  return fetchAuthedJson<{ unreadCount: number }>(
    `${apiConfig.notifications}/api/v1/notifications/me/read-all`,
    { method: 'POST' },
  )
}
export function fetchDeliveryStats(): Promise<DeliveryStats> {
  return fetchAuthedJson<DeliveryStats>(
    `${apiConfig.notifications}/api/v1/notifications/delivery-stats`,
  )
}
export function dispatchNotification(payload: DispatchNotificationInput): Promise<NotificationResponse> {
  return fetchAuthedJson<NotificationResponse>(`${apiConfig.notifications}/api/v1/notifications/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audience: payload.audience,
      recipientEmail: payload.recipientEmail,
      title: payload.title,
      message: payload.message,
      type: payload.type ?? 'SYSTEM',
    }),
  })
}
