import api from './api'

export interface InvoiceItem {
  id: string
  code: string
  tenantId: string
  studentId: string
  courseId: string
  classId?: string | null
  amount: number
  discountAmount: number
  finalAmount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  paymentMethod: 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'STRIPE' | 'CASH'
  notes?: string | null
  paidAt?: string | null
  createdAt: string
  course: {
    id: string
    title: string
    code: string
    price: number
    thumbnailUrl?: string | null
  }
  student: {
    id: string
    fullName: string
    email: string
    phone?: string | null
  }
  transactions?: {
    id: string
    status: string
    gatewayTxnId?: string | null
    createdAt: string
  }[]
}

export interface InvoicesResponse {
  items: InvoiceItem[]
  total: number
  page: number
  totalPages: number
}

export interface CheckoutResult {
  invoiceId: string
  invoiceCode: string
  amount: number
  paymentMethod: string
  checkoutUrl: string
  vnpParams: Record<string, any>
  signature: string
}

export interface RevenueStats {
  totalRevenue: number
  pendingRevenue: number
  paidCount: number
  pendingCount: number
  monthlyRevenue: { month: string; amount: number }[]
  recentTransactions: {
    id: string
    invoiceCode: string
    studentName: string
    courseTitle: string
    amount: number
    paymentMethod: string
    gatewayTxnId?: string | null
    createdAt: string
  }[]
}

export const paymentService = {
  /**
   * Create a new purchase invoice for student
   */
  async createInvoice(params: {
    courseId: string
    classId?: string
    paymentMethod?: 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'STRIPE' | 'CASH'
    discountAmount?: number
    notes?: string
  }): Promise<InvoiceItem> {
    const res = await api.post('/payments/invoices', params)
    return res.data.data
  },

  /**
   * Create Checkout URL with cryptographic signature
   */
  async createCheckoutUrl(params: {
    invoiceId: string
    returnUrl?: string
  }): Promise<CheckoutResult> {
    const res = await api.post('/payments/checkout', params)
    return res.data.data
  },

  /**
   * Simulate payment success in developer sandbox environment
   */
  async simulateSuccess(params: {
    invoiceId?: string
    invoiceCode?: string
  }): Promise<InvoiceItem> {
    const res = await api.post('/payments/simulate-success', params)
    return res.data.data
  },

  /**
   * List invoices with role and tenant isolation
   */
  async getInvoices(params?: {
    status?: string
    courseId?: string
    studentId?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<InvoicesResponse> {
    const res = await api.get('/payments/invoices', { params })
    return res.data.data
  },

  /**
   * Get single invoice details
   */
  async getInvoiceById(id: string): Promise<InvoiceItem> {
    const res = await api.get(`/payments/invoices/${id}`)
    return res.data.data
  },

  /**
   * Get revenue and tuition statistics for Center Manager
   */
  async getRevenueStats(tenantId?: string): Promise<RevenueStats> {
    const res = await api.get('/payments/revenue', { params: { tenantId } })
    return res.data.data
  },
}

export default paymentService

