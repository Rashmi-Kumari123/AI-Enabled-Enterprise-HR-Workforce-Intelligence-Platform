export type NotificationType =
  | 'LEAVE_SUBMITTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'LEAVE_CANCELLED'
  | 'APPROVAL_REMINDER'
  | 'PAYROLL_READY'
  | 'PERFORMANCE_REVIEW'
  | 'SYSTEM'

export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'SMS'
export type DeliveryStatus = 'SENT' | 'FAILED' | 'SKIPPED'
export type ChannelDelivery = {
  channel: DeliveryChannel
  status: DeliveryStatus
  recipient: string | null
}
export type AppNotification = {
  id: number
  title: string
  message: string
  type: NotificationType
  referenceType: string | null
  referenceId: number | null
  read: boolean
  createdAt: string
  deliveries?: ChannelDelivery[]
}
export type NotificationResponse = AppNotification & {
  recipientEmail: string
}
