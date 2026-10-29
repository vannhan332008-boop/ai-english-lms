export interface SaaSInvoice {
  id: string
  invoiceNumber: string
  centerName: string
  planName: string
  amountVND: number
  billingPeriod: string
  issuedDate: string
  dueDate: string
  status: 'PAID' | 'PENDING' | 'OVERDUE'
  paymentMethod: string
}

export const mockInvoices: SaaSInvoice[] = [
  {
    id: 'inv_01',
    invoiceNumber: 'INV-2026-10-001',
    centerName: 'EnglishFlow Landmark Academy',
    planName: 'Gói Chuyên Nghiệp (Professional)',
    amountVND: 12990000,
    billingPeriod: '01/10/2026 - 31/10/2026',
    issuedDate: '01/10/2026',
    dueDate: '10/10/2026',
    status: 'PAID',
    paymentMethod: 'Chuyển khoản Vietcombank',
  },
  {
    id: 'inv_02',
    invoiceNumber: 'INV-2026-10-002',
    centerName: 'EnglishFlow Ba Đình Campus',
    planName: 'Gói Khởi Nghiệp (Starter)',
    amountVND: 4990000,
    billingPeriod: '01/10/2026 - 31/10/2026',
    issuedDate: '01/10/2026',
    dueDate: '10/10/2026',
    status: 'PAID',
    paymentMethod: 'Cổng thanh toán VNPay',
  },
  {
    id: 'inv_03',
    invoiceNumber: 'INV-2026-10-003',
    centerName: 'EnglishFlow Sông Hàn Academy',
    planName: 'Gói Chuyên Nghiệp (Professional)',
    amountVND: 12990000,
    billingPeriod: '01/10/2026 - 31/10/2026',
    issuedDate: '01/10/2026',
    dueDate: '10/10/2026',
    status: 'PAID',
    paymentMethod: 'Thẻ tín dụng Visa/Master',
  },
  {
    id: 'inv_04',
    invoiceNumber: 'INV-2026-10-004',
    centerName: 'Học viện Anh ngữ IvyPath Hà Nội',
    planName: 'Gói Doanh Nghiệp (Enterprise)',
    amountVND: 29990000,
    billingPeriod: '01/10/2026 - 31/10/2026',
    issuedDate: '01/10/2026',
    dueDate: '15/10/2026',
    status: 'PAID',
    paymentMethod: 'Chuyển khoản Doanh nghiệp Techcombank',
  },
  {
    id: 'inv_05',
    invoiceNumber: 'INV-2026-10-005',
    centerName: 'Apex Language Institute TP.HCM',
    planName: 'Gói Chuyên Nghiệp (Professional)',
    amountVND: 12990000,
    billingPeriod: '15/10/2026 - 15/11/2026',
    issuedDate: '15/10/2026',
    dueDate: '25/10/2026',
    status: 'PENDING',
    paymentMethod: 'Chờ đối soát chuyển khoản',
  },
]
