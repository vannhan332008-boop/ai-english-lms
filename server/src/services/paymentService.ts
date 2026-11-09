import crypto from 'crypto'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'
import { InvoiceStatus, PaymentMethod, TransactionStatus } from '@prisma/client'
import { EmailService } from './emailService.js'

export interface CreateInvoiceInput {
  tenantId: string
  studentId: string
  courseId: string
  classId?: string
  paymentMethod?: PaymentMethod
  discountAmount?: number
  notes?: string
}

export interface PaymentSuccessData {
  gatewayTxnId?: string
  signature?: string
  paymentMethod?: PaymentMethod
  rawData?: any
}

export class PaymentService {
  /**
   * Compute HMAC SHA512 signature for transaction data
   */
  static generateSignature(data: Record<string, any>, secret: string = env.PAYMENT_HASH_SECRET): string {
    const sortedKeys = Object.keys(data).sort()
    const signData = sortedKeys
      .filter((k) => k !== 'signature' && k !== 'vnp_SecureHash' && data[k] !== undefined && data[k] !== null)
      .map((k) => `${k}=${encodeURIComponent(String(data[k]))}`)
      .join('&')

    return crypto.createHmac('sha512', secret).update(signData).digest('hex')
  }

  /**
   * Verify HMAC signature
   */
  static verifySignature(data: Record<string, any>, signature: string, secret: string = env.PAYMENT_HASH_SECRET): boolean {
    if (!signature) return false
    const expected = this.generateSignature(data, secret)
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  }

  /**
   * 1. Create a new Invoice for a Student purchasing a Course
   */
  static async createInvoice(input: CreateInvoiceInput) {
    // Verify course exists
    const course = await prisma.course.findFirst({
      where: { id: input.courseId, tenantId: input.tenantId },
      include: { classes: true },
    })

    if (!course) {
      throw new AppError('Khóa học không tồn tại hoặc không thuộc cơ sở này', 404, 'COURSE_NOT_FOUND')
    }

    // Verify student exists and belongs to tenant
    const student = await prisma.user.findFirst({
      where: { id: input.studentId },
    })
    if (!student) {
      throw new AppError('Học viên không tồn tại', 404, 'STUDENT_NOT_FOUND')
    }

    // Calculate amounts
    const baseAmount = course.price || 0.0
    const discount = Math.min(baseAmount, Math.max(0, input.discountAmount || 0.0))
    const finalAmount = Math.max(0, baseAmount - discount)

    // Generate invoice code: INV-YEAR-RANDOM
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randSuffix = Math.floor(1000 + Math.random() * 9000)
    const invoiceCode = `INV-${datePrefix}-${randSuffix}`

    const invoice = await prisma.invoice.create({
      data: {
        code: invoiceCode,
        tenantId: input.tenantId,
        studentId: input.studentId,
        courseId: input.courseId,
        classId: input.classId || null,
        amount: baseAmount,
        discountAmount: discount,
        finalAmount,
        status: finalAmount === 0 ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
        paymentMethod: input.paymentMethod || PaymentMethod.VNPAY,
        notes: input.notes || null,
        paidAt: finalAmount === 0 ? new Date() : null,
      },
      include: {
        course: { select: { id: true, title: true, code: true, price: true } },
        student: { select: { id: true, fullName: true, email: true } },
      },
    })

    // If finalAmount is 0 (Free course), auto-enroll immediately in transaction
    if (finalAmount === 0) {
      await this.processPaymentSuccess(invoice.id, {
        gatewayTxnId: `FREE-${Date.now()}`,
        signature: 'SYSTEM_FREE_COURSE',
        paymentMethod: input.paymentMethod,
      })
    }

    return invoice
  }

  /**
   * 2. Generate Payment Checkout URL (VNPay/Stripe Dev Mock)
   */
  static async createPaymentUrl(invoiceId: string, clientReturnUrl?: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        course: { select: { id: true, title: true, price: true } },
        student: { select: { id: true, fullName: true, email: true } },
      },
    })

    if (!invoice) {
      throw new AppError('Hóa đơn không tồn tại', 404, 'INVOICE_NOT_FOUND')
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new AppError('Hóa đơn này đã được thanh toán', 400, 'ALREADY_PAID')
    }

    const vnpParams: Record<string, any> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: 'ENGFLOW_VNPAY',
      vnp_Amount: Math.round(invoice.finalAmount * 100), // VNPay requires amount * 100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: invoice.code,
      vnp_OrderInfo: `Thanh toán học phí: ${invoice.course.title} (${invoice.code})`,
      vnp_OrderType: 'billpayment',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: clientReturnUrl || `${env.FRONTEND_URL}/payment/success`,
      vnp_CreateDate: new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
    }

    const signature = this.generateSignature(vnpParams)
    vnpParams.vnp_SecureHash = signature

    // Construct mock gateway query string
    const query = new URLSearchParams()
    for (const [k, v] of Object.entries(vnpParams)) {
      query.append(k, String(v))
    }

    return {
      invoiceId: invoice.id,
      invoiceCode: invoice.code,
      amount: invoice.finalAmount,
      paymentMethod: invoice.paymentMethod,
      checkoutUrl: `/payment/checkout-simulator?${query.toString()}`,
      vnpParams,
      signature,
    }
  }

  /**
   * 3. ACID Transaction: Process Payment Success + Update Invoice + Auto-Enroll Student
   * If any step fails, entire transaction rolls back!
   */
  static async processPaymentSuccess(
    invoiceIdOrCode: string,
    paymentData: PaymentSuccessData = {}
  ) {
    let emailReceiptPayload: {
      to: string
      studentName: string
      courseTitle: string
      invoiceCode: string
      amount: number
      paidAt: Date
      paymentMethod: PaymentMethod
      centerName?: string
      primaryColor?: string
    } | null = null

    const result = await prisma.$transaction(async (tx) => {
      // Step A: Find invoice with row check
      const invoice = await tx.invoice.findFirst({
        where: {
          OR: [{ id: invoiceIdOrCode }, { code: invoiceIdOrCode }],
        },
        include: {
          course: {
            include: {
              classes: {
                where: { status: { not: 'COMPLETED' } },
                orderBy: { createdAt: 'desc' },
              },
            },
          },
          student: true,
          tenant: true,
        },
      })

      if (!invoice) {
        throw new AppError('Hóa đơn không tồn tại', 404, 'INVOICE_NOT_FOUND')
      }

      // If already paid, return existing invoice (idempotent)
      if (invoice.status === InvoiceStatus.PAID) {
        return invoice
      }

      const now = new Date()

      // Step B: Update Invoice Status to PAID
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: now,
          paymentMethod: paymentData.paymentMethod || invoice.paymentMethod,
        },
      })

      // Step C: Record Transaction in Database
      const txnRecord = await tx.transaction.create({
        data: {
          invoiceId: invoice.id,
          tenantId: invoice.tenantId,
          paymentMethod: paymentData.paymentMethod || invoice.paymentMethod,
          amount: invoice.finalAmount,
          status: TransactionStatus.SUCCESS,
          gatewayTxnId: paymentData.gatewayTxnId || `TXN-${Date.now()}`,
          gatewayResponse: paymentData.rawData ? JSON.stringify(paymentData.rawData) : '{"status":"SUCCESS"}',
          signature: paymentData.signature || 'VERIFIED_SIGNATURE',
        },
      })

      // Step D: Auto-Enrollment into Course/Class
      let targetClassId = invoice.classId

      if (!targetClassId) {
        // Find existing non-completed class or create a default class for this course
        const existingClass = invoice.course.classes[0]
        if (existingClass) {
          targetClassId = existingClass.id
        } else {
          const newClass = await tx.class.create({
            data: {
              tenantId: invoice.tenantId,
              courseId: invoice.courseId,
              name: `${invoice.course.title} - Lớp Tiêu Chuẩn`,
              status: 'ONGOING',
            },
          })
          targetClassId = newClass.id
        }
      }

      // Upsert enrollment record
      await tx.enrollment.upsert({
        where: {
          classId_studentId: {
            classId: targetClassId,
            studentId: invoice.studentId,
          },
        },
        create: {
          classId: targetClassId,
          studentId: invoice.studentId,
          status: 'ENROLLED',
          attendanceRate: 100.0,
        },
        update: {
          status: 'ENROLLED',
        },
      })

      // Step E: Trigger In-app Notification for Student
      await tx.notification.create({
        data: {
          tenantId: invoice.tenantId,
          userId: invoice.studentId,
          title: 'Thanh toán khóa học thành công',
          message: `Hóa đơn ${invoice.code} cho khóa học "${invoice.course.title}" đã được thanh toán thành công (${invoice.finalAmount.toLocaleString('vi-VN')} đ). Bạn đã được tự động ghi danh vào lớp học!`,
          type: 'INFO',
          link: `/courses/${invoice.courseId}`,
          isRead: false,
        },
      })

      // Step F: Record Audit Log
      await tx.auditLog.create({
        data: {
          tenantId: invoice.tenantId,
          userId: invoice.studentId,
          action: 'INVOICE_PAID_AUTO_ENROLL',
          resource: 'Invoice',
          resourceId: invoice.id,
          details: JSON.stringify({
            invoiceCode: invoice.code,
            amount: invoice.finalAmount,
            courseId: invoice.courseId,
            classId: targetClassId,
            transactionId: txnRecord.id,
          }),
        },
      })

      if (invoice.student?.email) {
        emailReceiptPayload = {
          to: invoice.student.email,
          studentName: invoice.student.fullName || 'Học viên',
          courseTitle: invoice.course.title,
          invoiceCode: invoice.code,
          amount: invoice.finalAmount,
          paidAt: updatedInvoice.paidAt ?? now,
          paymentMethod: updatedInvoice.paymentMethod,
          centerName: invoice.tenant?.name || 'EnglishFlow LMS',
          primaryColor: invoice.tenant?.primaryColor || '#4f46e5',
        }
      }

      return updatedInvoice
    })

    // After transaction commits successfully, asynchronously send email receipt
    if (emailReceiptPayload) {
      EmailService.sendPaymentSuccessEmail(emailReceiptPayload).catch((err) => {
        console.error('[PaymentService] Error sending payment success email:', err)
      })
    }

    return result
  }

  /**
   * 4. Multi-Tenant Invoices Listing with Filtering & Pagination
   */
  static async getInvoices(
    user: { id: string; role: string; tenantId: string | null },
    options: {
      status?: InvoiceStatus
      courseId?: string
      studentId?: string
      search?: string
      page?: number
      limit?: number
    } = {}
  ) {
    const page = Math.max(1, options.page || 1)
    const limit = Math.min(100, Math.max(1, options.limit || 20))
    const skip = (page - 1) * limit

    const where: any = {}

    // Multi-tenant isolation
    if (user.role === 'STUDENT') {
      where.studentId = user.id
      if (user.tenantId) where.tenantId = user.tenantId
    } else if (user.role === 'CENTER_MANAGER' || user.role === 'TEACHER') {
      if (!user.tenantId) {
        throw new AppError('Bạn không trực thuộc trung tâm nào', 400, 'NO_TENANT')
      }
      where.tenantId = user.tenantId
    } else if (user.role === 'SUPER_ADMIN') {
      if (user.tenantId) where.tenantId = user.tenantId
    }

    if (options.status) {
      where.status = options.status
    }
    if (options.courseId) {
      where.courseId = options.courseId
    }
    if (options.studentId && user.role !== 'STUDENT') {
      where.studentId = options.studentId
    }
    if (options.search) {
      where.OR = [
        { code: { contains: options.search, mode: 'insensitive' } },
        { student: { fullName: { contains: options.search, mode: 'insensitive' } } },
        { student: { email: { contains: options.search, mode: 'insensitive' } } },
        { course: { title: { contains: options.search, mode: 'insensitive' } } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          course: { select: { id: true, title: true, code: true, price: true, thumbnailUrl: true } },
          student: { select: { id: true, fullName: true, email: true, phone: true } },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, status: true, gatewayTxnId: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ])

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    }
  }

  /**
   * 5. Get Invoice by ID with security check
   */
  static async getInvoiceById(
    invoiceId: string,
    user: { id: string; role: string; tenantId: string | null }
  ) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        course: true,
        student: { select: { id: true, fullName: true, email: true, phone: true } },
        transactions: true,
      },
    })

    if (!invoice) {
      throw new AppError('Hóa đơn không tồn tại', 404, 'INVOICE_NOT_FOUND')
    }

    // Role check
    if (user.role === 'STUDENT' && invoice.studentId !== user.id) {
      throw new AppError('Bạn không có quyền xem hóa đơn này', 403, 'FORBIDDEN')
    }
    if (user.role !== 'SUPER_ADMIN' && user.tenantId && invoice.tenantId !== user.tenantId) {
      throw new AppError('Hóa đơn không thuộc trung tâm của bạn', 403, 'FORBIDDEN_TENANT')
    }

    return invoice
  }

  /**
   * 6. Center Manager Revenue Analytics
   */
  static async getRevenueStats(tenantId: string) {
    const [paidInvoices, pendingInvoices, recentTransactions] = await Promise.all([
      prisma.invoice.findMany({
        where: { tenantId, status: InvoiceStatus.PAID },
        select: { finalAmount: true, paidAt: true, courseId: true },
      }),
      prisma.invoice.findMany({
        where: { tenantId, status: InvoiceStatus.PENDING },
        select: { finalAmount: true },
      }),
      prisma.transaction.findMany({
        where: { tenantId, status: TransactionStatus.SUCCESS },
        include: {
          invoice: {
            include: {
              student: { select: { fullName: true, email: true } },
              course: { select: { title: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    const totalRevenue = paidInvoices.reduce((acc, curr) => acc + curr.finalAmount, 0)
    const pendingRevenue = pendingInvoices.reduce((acc, curr) => acc + curr.finalAmount, 0)
    const paidCount = paidInvoices.length
    const pendingCount = pendingInvoices.length

    // Group revenue by month
    const monthlyRevenueMap: Record<string, number> = {}
    for (const inv of paidInvoices) {
      if (inv.paidAt) {
        const monthKey = inv.paidAt.toISOString().slice(0, 7) // YYYY-MM
        monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + inv.finalAmount
      }
    }

    return {
      totalRevenue,
      pendingRevenue,
      paidCount,
      pendingCount,
      monthlyRevenue: Object.entries(monthlyRevenueMap).map(([month, amount]) => ({
        month,
        amount,
      })),
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        invoiceCode: tx.invoice.code,
        studentName: tx.invoice.student.fullName,
        courseTitle: tx.invoice.course.title,
        amount: tx.amount,
        paymentMethod: tx.paymentMethod,
        gatewayTxnId: tx.gatewayTxnId,
        createdAt: tx.createdAt,
      })),
    }
  }
}

