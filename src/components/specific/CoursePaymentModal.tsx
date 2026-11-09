import React, { useState } from 'react'
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Loader2,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { paymentService, type InvoiceItem } from '@/services/paymentService'
import { useToast } from '@/hooks/useToast'
import { formatVND } from '@/utils/formatters'

export interface CoursePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  course: {
    id: string
    title: string
    price?: number
    targetLevel?: string | null
    thumbnailUrl?: string | null
  } | null
  onSuccess?: (invoice: InvoiceItem) => void
}

export const CoursePaymentModal: React.FC<CoursePaymentModalProps> = ({
  isOpen,
  onClose,
  course,
  onSuccess,
}) => {
  const { success, error: toastError } = useToast()

  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'STRIPE'>('VNPAY')
  const [isProcessing, setIsProcessing] = useState(false)
  const [createdInvoice, setCreatedInvoice] = useState<InvoiceItem | null>(null)
  const [step, setStep] = useState<'CONFIRM' | 'GATEWAY' | 'COMPLETED'>('CONFIRM')

  if (!course) return null

  const coursePrice = course.price ?? 2500000

  // Step 1: Create Invoice
  const handleProceedToPayment = async () => {
    setIsProcessing(true)
    try {
      const invoice = await paymentService.createInvoice({
        courseId: course.id,
        paymentMethod,
      })

      setCreatedInvoice(invoice)

      // If price was 0, it already completed
      if (invoice.status === 'PAID') {
        setStep('COMPLETED')
        success('Ghi danh thành công!', `Bạn đã được ghi danh vào khóa học ${course.title}.`)
        onSuccess?.(invoice)
      } else {
        setStep('GATEWAY')
      }
    } catch (err: any) {
      console.error('Invoice creation failed:', err)
      toastError('Không thể tạo hóa đơn', err.response?.data?.message || err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 2: Simulate Payment Gateway Callback (VNPay IPN with verified HMAC signature)
  const handleSimulatePaymentSuccess = async () => {
    if (!createdInvoice) return
    setIsProcessing(true)
    try {
      const updated = await paymentService.simulateSuccess({
        invoiceId: createdInvoice.id,
      })

      setCreatedInvoice(updated)
      setStep('COMPLETED')
      success(
        'Thanh toán học phí thành công!',
        `Hóa đơn ${updated.code} đã được thanh toán. Bạn đã được ghi danh tự động vào lớp học.`
      )
      onSuccess?.(updated)
    } catch (err: any) {
      console.error('Payment simulation failed:', err)
      toastError('Lỗi xác nhận giao dịch', err.response?.data?.message || err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'COMPLETED' ? 'Thanh Toán Thành Công' : 'Thanh Toán Học Phí Khóa Học'}
      description="Hệ thống thanh toán tự động với cơ chế cấp quyền tức thì (Instant Auto-Enrollment)."
      size="lg"
    >
      {step === 'CONFIRM' && (
        <div className="space-y-5">
          {/* Course Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Thông tin khóa học
              </span>
              <h3 className="text-base font-bold text-foreground truncate mt-0.5">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {course.targetLevel && (
                  <Badge variant="outline" className="text-[10px]">
                    {course.targetLevel}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">Truy cập trọn đời & AI Luyện đề</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-muted-foreground block font-medium">Học phí:</span>
              <span className="text-xl font-black text-primary">
                {coursePrice === 0 ? 'Miễn phí' : formatVND(coursePrice)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-foreground block">
              Chọn phương thức thanh toán an toàn:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'VNPAY',
                  name: 'Cổng thanh toán VNPAY',
                  desc: 'Quét mã QR qua ứng dụng ngân hàng hoặc ví VNPAY',
                  icon: QrCode,
                  recommended: true,
                },
                {
                  id: 'MOMO',
                  name: 'Ví Điện Tử MoMo',
                  desc: 'Xác thực thanh toán 1 chạm qua App MoMo',
                  icon: CreditCard,
                },
                {
                  id: 'BANK_TRANSFER',
                  name: 'Chuyển Khoản 24/7 (Napas)',
                  desc: 'Chuyển khoản trực tiếp qua tài khoản trung tâm',
                  icon: Building,
                },
                {
                  id: 'STRIPE',
                  name: 'Thẻ Quốc Tế Visa / Master',
                  desc: 'Bảo mật chuẩn quốc tế PCI-DSS Level 1',
                  icon: ShieldCheck,
                },
              ].map((m) => {
                const isSelected = paymentMethod === m.id
                const Icon = m.icon
                return (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                        : 'border-border/80 hover:border-primary/40 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-xs font-bold text-foreground">{m.name}</span>
                      </div>
                      {m.recommended && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">
                          Ưu tiên
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Security Guarantee Note */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Giao dịch được bảo vệ bằng mã hóa HMAC SHA512. Tự động ghi danh và kích hoạt tài khoản trong vòng 3 giây sau khi thanh toán.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleProceedToPayment}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang khởi tạo hóa đơn...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Xác nhận & Thanh toán ({coursePrice === 0 ? '0 đ' : formatVND(coursePrice)})
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'GATEWAY' && createdInvoice && (
        <div className="space-y-5">
          {/* Invoice Summary */}
          <div className="p-4 rounded-xl bg-card border border-border/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground block">Mã hóa đơn giao dịch:</span>
              <span className="text-sm font-mono font-bold text-foreground">{createdInvoice.code}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block">Số tiền thanh toán:</span>
              <span className="text-lg font-black text-primary">{formatVND(createdInvoice.finalAmount)}</span>
            </div>
          </div>

          {/* Simulated QR & Gateway Screen */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Thời gian giữ chỗ: 14:59</span>
            </div>

            {/* QR Mockup */}
            <div className="p-4 bg-white rounded-2xl shadow-lg flex flex-col items-center">
              <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden">
                <QrCode className="w-32 h-32 text-slate-800" />
                <div className="absolute inset-0 bg-indigo-500/5 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shadow">
                    VNPay
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 mt-2">
                Quét mã qua App Ngân hàng bất kỳ
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <p>Chủ tài khoản: <strong>CONG TY CO PHAN ENGLISHFLOW LMS</strong></p>
              <p>Ngân hàng: <strong>Vietcombank - Chi nhánh Thăng Long HN</strong></p>
              <p className="font-mono text-amber-300 text-sm mt-1">
                Nội dung CK: <strong>{createdInvoice.code}</strong>
              </p>
            </div>
          </div>

          {/* Sandbox Auto-Confirmation Tool */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Môi trường Thử nghiệm Sandbox (Mô phỏng Webhook IPN)</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Trong môi trường phát triển, bạn có thể bấm nút bên dưới để mô phỏng sự kiện Webhook từ cổng thanh toán VNPay trả về với chữ ký số xác thực hợp lệ.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSimulatePaymentSuccess}
              disabled={isProcessing}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xác thực giao dịch...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Mô phỏng Thanh toán Thành công (VNPay Sandbox)
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep('CONFIRM')} className="text-xs">
              ← Đổi phương thức
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Đóng và thanh toán sau
            </Button>
          </div>
        </div>
      )}

      {step === 'COMPLETED' && (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Giao Dịch Đã Hoàn Tất!</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Hệ thống đã nhận thanh toán thành công. Học viên đã được tự động thêm vào danh sách lớp học và có thể bắt đầu học ngay.
            </p>
          </div>

          {createdInvoice && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1 w-full max-w-sm text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã hóa đơn:</span>
                <span className="font-mono font-bold text-foreground">{createdInvoice.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge variant="primary" className="text-[10px]">ĐÃ THANH TOÁN (PAID)</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ghi danh:</span>
                <span className="text-emerald-600 font-semibold">Tự động kích hoạt (Auto-Enrolled)</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <Button variant="primary" onClick={onClose} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Vào phòng học ngay
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default CoursePaymentModal
