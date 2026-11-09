import { Request, Response } from 'express'
import { NotificationService } from '../services/notificationService.js'
import { PushNotificationService } from '../services/pushNotificationService.js'
import { sendSuccess, sendError } from '../utils/response.js'

export class NotificationController {
  /**
   * GET /api/v1/notifications
   * List user's notifications
   */
  static async getMyNotifications(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
      }

      const isReadParam = req.query.isRead
      const isRead = isReadParam === 'true' ? true : isReadParam === 'false' ? false : undefined
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15

      const result = await NotificationService.getUserNotifications(user.id, user.tenantId, {
        isRead,
        page,
        limit,
      })

      return sendSuccess(res, result, 'Lấy danh sách thông báo thành công')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi lấy thông báo', error.statusCode || 500)
    }
  }

  /**
   * GET /api/v1/notifications/unread-count
   */
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
      }

      const count = await NotificationService.getUnreadCount(user.id, user.tenantId)
      return sendSuccess(res, { unreadCount: count }, 'Lấy số lượng chưa đọc thành công')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi', error.statusCode || 500)
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark single notification as read
   */
  static async markAsRead(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực', 401, 'UNAUTHORIZED')
      }

      const { id } = req.params
      const notificationId = Array.isArray(id) ? id[0] : id
      const updated = await NotificationService.markAsRead(notificationId, user.id)

      return sendSuccess(res, updated, 'Đã đánh dấu thông báo là đã đọc')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi', error.statusCode || 500)
    }
  }

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark all notifications as read
   */
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực', 401, 'UNAUTHORIZED')
      }

      const result = await NotificationService.markAllAsRead(user.id, user.tenantId)
      return sendSuccess(res, result, 'Đã đánh dấu tất cả là đã đọc')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi', error.statusCode || 500)
    }
  }

  /**
   * DELETE /api/v1/notifications/:id
   */
  static async deleteNotification(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực', 401, 'UNAUTHORIZED')
      }

      const { id } = req.params
      const notificationId = Array.isArray(id) ? id[0] : id
      const result = await NotificationService.deleteNotification(notificationId, user.id)
      return sendSuccess(res, result, 'Đã xóa thông báo')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi', error.statusCode || 500)
    }
  }

  /**
   * GET /api/v1/notifications/push/vapid-public-key
   * Retrieve VAPID Public Key for client push registration
   */
  static async getVapidPublicKey(_req: Request, res: Response) {
    try {
      const publicKey = PushNotificationService.getPublicKey()
      return sendSuccess(res, { publicKey }, 'Lấy VAPID public key thành công')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi lấy VAPID key', error.statusCode || 500)
    }
  }

  /**
   * POST /api/v1/notifications/push/subscribe
   * Register or update user device push subscription
   */
  static async subscribePush(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
      }

      const { subscription } = req.body
      if (!subscription) {
        return sendError(res, 'Thiếu thông tin subscription', 400, 'BAD_REQUEST')
      }

      const result = await PushNotificationService.saveSubscription(user.id, subscription)
      return sendSuccess(res, result, 'Đăng ký Web Push thành công')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi lưu subscription', error.statusCode || 500)
    }
  }

  /**
   * POST /api/v1/notifications/push/unsubscribe
   * Remove user device push subscription
   */
  static async unsubscribePush(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
      }

      const result = await PushNotificationService.removeSubscription(user.id)
      return sendSuccess(res, result, 'Hủy đăng ký Web Push thành công')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi hủy subscription', error.statusCode || 500)
    }
  }
}
