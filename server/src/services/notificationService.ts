import { prisma } from '../config/prisma.js'
import { AppError } from '../middlewares/errorHandler.js'
import { PushNotificationService } from './pushNotificationService.js'

export interface CreateNotificationInput {
  tenantId?: string | null
  userId: string
  title: string
  message: string
  type?: 'INFO' | 'ASSIGNMENT' | 'GRADE' | 'SYSTEM' | 'REMINDER'
  link?: string
}

export class NotificationService {
  /**
   * Create an in-app notification
   */
  static async createNotification(input: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        tenantId: input.tenantId || null,
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type || 'INFO',
        link: input.link || null,
        isRead: false,
      },
    })

    // Fire and forget Web Push notification
    PushNotificationService.sendPushNotification(input.userId, {
      title: input.title,
      message: input.message,
      url: input.link || '/',
      tag: `notification-${notification.id}`,
    }).catch((err) => {
      console.warn('[WebPush] Trigger background error:', err)
    })

    return notification
  }

  /**
   * Get notifications for a user with pagination
   */
  static async getUserNotifications(
    userId: string,
    tenantId?: string | null,
    options: { isRead?: boolean; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, options.page || 1)
    const limit = Math.min(50, Math.max(1, options.limit || 15))
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (tenantId) {
      where.tenantId = tenantId
    }
    if (options.isRead !== undefined) {
      where.isRead = options.isRead
    }

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          ...(tenantId ? { tenantId } : {}),
          isRead: false,
        },
      }),
    ])

    return {
      items,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string, tenantId?: string | null): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        ...(tenantId ? { tenantId } : {}),
        isRead: false,
      },
    })
  }

  /**
   * Mark a single notification as read (with user isolation)
   */
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) {
      throw new AppError('Thông báo không tồn tại hoặc bạn không có quyền truy cập', 404, 'NOT_FOUND')
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })
  }

  /**
   * Mark all notifications as read for current user
   */
  static async markAllAsRead(userId: string, tenantId?: string | null) {
    return prisma.notification.updateMany({
      where: {
        userId,
        ...(tenantId ? { tenantId } : {}),
        isRead: false,
      },
      data: { isRead: true },
    })
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) {
      throw new AppError('Thông báo không tồn tại', 404, 'NOT_FOUND')
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    })

    return { success: true }
  }
}

