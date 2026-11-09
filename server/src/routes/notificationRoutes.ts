import { Router } from 'express'
import { NotificationController } from '../controllers/notificationController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = Router()

// All notification routes require authentication
router.use(authenticate)

// Push notification endpoints
router.get('/push/vapid-public-key', NotificationController.getVapidPublicKey)
router.post('/push/subscribe', NotificationController.subscribePush)
router.post('/push/unsubscribe', NotificationController.unsubscribePush)

router.get('/', NotificationController.getMyNotifications)
router.get('/unread-count', NotificationController.getUnreadCount)
router.patch('/read-all', NotificationController.markAllAsRead)
router.patch('/:id/read', NotificationController.markAsRead)
router.delete('/:id', NotificationController.deleteNotification)

export default router

