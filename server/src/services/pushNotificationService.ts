import * as wpModule from 'web-push'
import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'

// Safe resolution for web-push under ESM/Node
const webpush = ((wpModule as any).default || wpModule) as typeof import('web-push')

try {
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY)
} catch (err) {
  console.warn('[WebPush] Failed to initialize VAPID details:', err)
}

export interface WebPushPayload {
  title: string
  message: string
  url?: string
  tag?: string
  badge?: string
  icon?: string
}

export interface PushSubscriptionData {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

export class PushNotificationService {
  /**
   * Get the VAPID Public Key for clients to subscribe
   */
  static getPublicKey(): string {
    return env.VAPID_PUBLIC_KEY
  }

  /**
   * Save or update push subscription for a user
   */
  static async saveSubscription(
    userId: string,
    subscription: PushSubscriptionData
  ): Promise<{ success: boolean }> {
    if (!subscription || !subscription.endpoint) {
      throw new Error('Cấu hình Push Subscription không hợp lệ (thiếu endpoint)')
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        pushSubscription: JSON.stringify(subscription),
      },
    })

    return { success: true }
  }

  /**
   * Remove push subscription for a user
   */
  static async removeSubscription(userId: string): Promise<{ success: boolean }> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        pushSubscription: null,
      },
    })

    return { success: true }
  }

  /**
   * Send a Web Push Notification to a user's registered device
   */
  static async sendPushNotification(userId: string, payload: WebPushPayload): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, pushSubscription: true },
      })

      if (!user || !user.pushSubscription) {
        return false
      }

      let subscription: PushSubscriptionData
      try {
        subscription = JSON.parse(user.pushSubscription)
      } catch (_e) {
        console.warn(`[WebPush] Invalid JSON subscription for user ${userId}`)
        return false
      }

      if (!subscription || !subscription.endpoint) {
        return false
      }

      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.message,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        data: {
          url: payload.url || '/',
          timestamp: Date.now(),
        },
        tag: payload.tag || 'englishflow-notification',
      })

      await webpush.sendNotification(subscription, pushPayload, {
        TTL: 86400, // 24 hours
      })

      return true
    } catch (error: any) {
      // 410 Gone or 404 Not Found indicates subscription expired / unsubscribed
      if (error?.statusCode === 410 || error?.statusCode === 404) {
        console.info(`[WebPush] Subscription expired for user ${userId}, cleaning up...`)
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { pushSubscription: null },
          })
        } catch (_) {}
      } else {
        console.error(`[WebPush] Error sending push to user ${userId}:`, error?.message || error)
      }
      return false
    }
  }
}

