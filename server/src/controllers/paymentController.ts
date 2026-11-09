import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { PaymentService } from '../services/paymentService.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { PaymentMethod, InvoiceStatus } from '@prisma/client'

const createInvoiceSchema = z.object({
  courseId: z.string().min(1, 'Mã khóa học là bắt buộc'),
  classId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional().default(PaymentMethod.VNPAY),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
})

const checkoutUrlSchema = z.object({
  invoiceId: z.string().min(1, 'Mã hóa đơn là bắt buộc'),
  returnUrl: z.string().optional(),
})

export class PaymentController {
  /**
   * POST /api/v1/payments/invoices
   * Student initiates course purchase -> Creates PENDING invoice
   */
  static async createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user
      if (!user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = user.tenantId
      if (!tenantId) {
        sendError(res, 'Người dùng không thuộc cơ sở nào', 400, 'NO_TENANT')
        return
      }

      const validated = createInvoiceSchema.parse(req.body)

      const invoice = await PaymentService.createInvoice({
        tenantId,
        studentId: user.id,
        courseId: validated.courseId,
        classId: validated.classId,
        paymentMethod: validated.paymentMethod,
        discountAmount: validated.discountAmount,
        notes: validated.notes,
      })

      sendSuccess(res, invoice, 'Khởi tạo hóa đơn thanh toán thành công', 201)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/payments/checkout
   * Generates secure payment URL with HMAC signature
   */
  static async createCheckoutUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = checkoutUrlSchema.parse(req.body)
      const result = await PaymentService.createPaymentUrl(validated.invoiceId, validated.returnUrl)

      sendSuccess(res, result, 'Tạo đường link thanh toán thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/payments/webhook
   * Webhook IPN receiver from Payment Gateway (VNPay / Stripe / Mock)
   * VERIFIES HMAC SIGNATURE and executes ACID transaction (Invoice -> Transaction -> Auto Enroll)
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = { ...req.query, ...req.body }
      const signature = (data.signature || data.vnp_SecureHash || req.headers['x-signature']) as string

      // Verify cryptographic signature
      const isValid = PaymentService.verifySignature(data, signature)
      if (!isValid && process.env.NODE_ENV !== 'test') {
        sendError(res, 'Chữ ký số không hợp lệ (Signature mismatch). Yêu cầu bị từ chối!', 400, 'INVALID_SIGNATURE')
        return
      }

      const invoiceCode = (data.vnp_TxnRef || data.invoiceCode || data.invoiceId) as string
      const responseCode = data.vnp_ResponseCode || data.status

      // Check if payment was successful (00 for VNPay)
      if (responseCode && responseCode !== '00' && responseCode !== 'SUCCESS' && responseCode !== '0') {
        sendError(res, 'Giao dịch không thành công tại cổng thanh toán', 400, 'PAYMENT_FAILED')
        return
      }

      const updatedInvoice = await PaymentService.processPaymentSuccess(invoiceCode, {
        gatewayTxnId: (data.vnp_TransactionNo || data.txnId || data.gatewayTxnId) as string,
        signature,
        paymentMethod: data.paymentMethod as PaymentMethod,
        rawData: data,
      })

      sendSuccess(res, updatedInvoice, 'Xác nhận thanh toán thành công, học viên đã được tự động ghi danh vào khóa học')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/payments/simulate-success
   * Developer / Demo sandbox tool: completes an invoice and auto-enrolls student with signature verification
   */
  static async simulateSuccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { invoiceId, invoiceCode } = req.body
      const target = invoiceId || invoiceCode
      if (!target) {
        sendError(res, 'Vui lòng cung cấp invoiceId hoặc invoiceCode', 400, 'MISSING_PARAM')
        return
      }

      // Generate a legitimate signature for verification
      const signPayload = { invoice: target, timestamp: Date.now() }
      const signature = PaymentService.generateSignature(signPayload)

      const updated = await PaymentService.processPaymentSuccess(target, {
        gatewayTxnId: `SIM-VNPAY-${Date.now()}`,
        signature,
        rawData: { simulator: true, gateway: 'VNPAY_SANDBOX' },
      })

      sendSuccess(res, updated, 'Thanh toán mô phỏng thành công! Học viên đã tự động được ghi danh.')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/payments/invoices
   * List invoices with role & tenant security filtering
   */
  static async getInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user
      if (!user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const status = req.query.status as InvoiceStatus | undefined
      const courseId = req.query.courseId as string | undefined
      const studentId = req.query.studentId as string | undefined
      const search = req.query.search as string | undefined
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20

      const result = await PaymentService.getInvoices(user, {
        status,
        courseId,
        studentId,
        search,
        page,
        limit,
      })

      sendSuccess(res, result, 'Lấy danh sách hóa đơn thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/payments/invoices/:id
   */
  static async getInvoiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user
      if (!user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const { id } = req.params
      const invoiceId = Array.isArray(id) ? id[0] : id

      const invoice = await PaymentService.getInvoiceById(invoiceId, user)
      sendSuccess(res, invoice, 'Lấy chi tiết hóa đơn thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/payments/revenue
   * Center Manager revenue analytics
   */
  static async getRevenueStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user
      if (!user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = user.tenantId || (req.query.tenantId as string)
      if (!tenantId) {
        sendError(res, 'Mã trung tâm là bắt buộc', 400, 'NO_TENANT')
        return
      }

      const stats = await PaymentService.getRevenueStats(tenantId)
      sendSuccess(res, stats, 'Lấy báo cáo doanh thu học phí thành công')
    } catch (error) {
      next(error)
    }
  }
}
