import api from './api'

export interface NotificationItem {
  id: string
  tenantId?: string | null
  userId: string
  title: string
  message: string
  type: 'INFO' | 'ASSIGNMENT' | 'GRADE' | 'SYSTEM' | 'REMINDER'
  link?: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationListResponse {
  items: NotificationItem[]
  total: number
  unreadCount: number
  page: number
  totalPages: number
}

export const notificationService = {
  /**
   * Get user's notifications
   */
  async getMyNotifications(params?: {
    isRead?: boolean
    page?: number
    limit?: number
  }): Promise<NotificationListResponse> {
    const res = await api.get('/notifications', { params })
    return res.data.data
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const res = await api.get('/notifications/unread-count')
    return res.data.data?.unreadCount || 0
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<NotificationItem> {
    const res = await api.patch(`/notifications/${id}/read`)
    return res.data.data
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all')
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },

  /**
   * Get VAPID Public Key for Web Push registration
   */
  async getVapidPublicKey(): Promise<string> {
    const res = await api.get('/notifications/push/vapid-public-key')
    return res.data.data?.publicKey
  },

  /**
   * Send push subscription object to backend
   */
  async subscribePush(subscription: PushSubscriptionJSON): Promise<void> {
    await api.post('/notifications/push/subscribe', { subscription })
  },

  /**
   * Remove push subscription on backend
   */
  async unsubscribePush(): Promise<void> {
    await api.post('/notifications/push/unsubscribe')
  },
}

/**
 * Utility to convert VAPID base64 public key string into Uint8Array for PushManager
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default notificationService

