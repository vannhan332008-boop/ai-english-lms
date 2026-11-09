import { Router } from 'express'
import { PaymentController } from '../controllers/paymentController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { authorize } from '../middlewares/rbacMiddleware.js'
import { UserRole } from '@prisma/client'

export const paymentRouter = Router()

// Webhook endpoint: Called by Payment Gateway servers (Protected by HMAC signature verification)
paymentRouter.post('/webhook', PaymentController.handleWebhook)
paymentRouter.get('/webhook', PaymentController.handleWebhook) // VNPay also redirects GET to return url

// All other endpoints require authenticated users
paymentRouter.use(authenticate)

paymentRouter.post('/invoices', PaymentController.createInvoice)
paymentRouter.post('/checkout', PaymentController.createCheckoutUrl)
paymentRouter.post('/simulate-success', PaymentController.simulateSuccess)

paymentRouter.get('/invoices', PaymentController.getInvoices)
paymentRouter.get('/invoices/:id', PaymentController.getInvoiceById)

paymentRouter.get(
  '/revenue',
  authorize(UserRole.CENTER_MANAGER, UserRole.SUPER_ADMIN),
  PaymentController.getRevenueStats
)

export default paymentRouter

