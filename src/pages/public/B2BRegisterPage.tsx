import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { isValidEmail, isValidPhoneVi, checkPasswordStrength } from '@/utils/validators'

type PlanType = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'

interface PlanOption {
  id: PlanType
  name: string
  tokens: string
  price: string
  badge?: string
  description: string
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'STARTER',
    name: 'Gói Khởi Động',
    tokens: '500.000 Token AI / tháng',
    price: '990.000 ₫/tháng',
    description: 'Tối ưu cho trung tâm quy mô nhỏ dưới 150 học viên.',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Gói Tiêu Chuẩn',
    tokens: '2.000.000 Token AI / tháng',
    price: '2.490.000 ₫/tháng',
    badge: 'Phổ biến nhất',
    description: 'Đầy đủ AI Chấm thi, White-label & không giới hạn giáo viên.',
  },
  {
    id: 'ENTERPRISE',
    name: 'Gói Doanh Nghiệp',
    tokens: '10.000.000 Token AI / tháng',
    price: '6.990.000 ₫/tháng',
    badge: 'Hệ thống chuỗi',
    description: 'Tên miền riêng, Dedicated SLA & hỗ trợ kỹ thuật 24/7.',
  },
]

export const B2BRegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { registerCenter, isLoading, error } = useAuthStore()
  const { success, error: toastError } = useToast()

  const [centerName, setCenterName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Hà Nội')
  const [plan, setPlan] = useState<PlanType>('PROFESSIONAL')
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [formError, setFormError] = useState('')

  // Pre-select plan if passed via URL query ?plan=starter / professional / enterprise
  useEffect(() => {
    const queryPlan = searchParams.get('plan')?.toUpperCase()
    if (queryPlan && (queryPlan === 'STARTER' || queryPlan === 'PROFESSIONAL' || queryPlan === 'ENTERPRISE')) {
      setPlan(queryPlan as PlanType)
    }
  }, [searchParams])

  const passwordStrength = checkPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!centerName.trim()) {
      setFormError('Vui lòng nhập tên trung tâm hoặc học viện của bạn.')
      return
    }
    if (!adminName.trim()) {
      setFormError('Vui lòng nhập họ và tên người quản trị.')
      return
    }
    if (!isValidEmail(email)) {
      setFormError('Địa chỉ email làm việc không đúng định dạng.')
      return
    }
    if (phone && !isValidPhoneVi(phone)) {
      setFormError('Số điện thoại không đúng định dạng (VD: 0912 345 678).')
      return
    }
    if (password.length < 6) {
      setFormError('Mật khẩu quản trị phải có tối thiểu 6 ký tự.')
      return
    }
    if (!agreeTerms) {
      setFormError('Bạn cần đồng ý với Điều khoản dịch vụ SaaS của EnglishFlow.')
      return
    }

    try {
      await registerCenter({
        centerName: centerName.trim(),
        adminName: adminName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        city: city.trim() || 'Hà Nội',
        plan,
      })

      success(
        'Đăng ký trung tâm thành công!',
        `Chào mừng ${adminName} đến với không gian quản trị của ${centerName}.`
      )

      // Immediate redirect to Center Manager Dashboard
      navigate('/center-manager/dashboard')
    } catch (err: any) {
      const msg = err.message || error || 'Đăng ký trung tâm thất bại. Vui lòng thử lại.'
      setFormError(msg)
      toastError('Lỗi đăng ký', msg)
    }
  }

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Banner & Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>B2B SaaS Onboarding • Dành riêng cho Chủ trung tâm & Quản lý</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Khởi tạo LMS Thông minh cho Trung tâm
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Tự động thiết lập trạm chấm thi AI Writing & Speaking chuẩn Barem, kho giáo trình và lớp học trực tuyến mang nhận diện thương hiệu riêng của bạn trong 60 giây.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Thông tin Thiết lập Cơ sở
              </h2>
              <p className="text-xs text-slate-500">
                14 ngày dùng thử miễn phí đầy đủ tính năng. Không yêu cầu thẻ tín dụng.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Free 14-day Trial
            </span>
          </div>

          {(formError || error) && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Center Name */}
            <Input
              label="Tên trung tâm / Học viện ngoại ngữ *"
              placeholder="VD: IELTS Fighter Hà Nội, Anh ngữ Apollo..."
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
              required
            />

            {/* Admin Name */}
            <Input
              label="Họ và tên Quản trị viên (Chủ cơ sở) *"
              placeholder="VD: Nguyễn Thành Nam"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email công việc / Quản trị *"
                type="email"
                placeholder="admin@trungtam.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />
              <Input
                label="Số điện thoại liên hệ"
                type="tel"
                placeholder="0912 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              />
            </div>

            {/* Password & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Mật khẩu tài khoản Quản trị *"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />
                {password && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span>Độ bảo mật:</span>
                    <span
                      className={`font-bold ${
                        passwordStrength.label === 'Mạnh'
                          ? 'text-emerald-500'
                          : passwordStrength.label === 'Trung bình'
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Tỉnh / Thành phố
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Tỉnh khác">Tỉnh / Thành phố khác</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Plan Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Chọn Gói Cước Khởi Đầu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PLAN_OPTIONS.map((item) => {
                  const isSelected = plan === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setPlan(item.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {item.badge && (
                        <span className="absolute -top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                          {item.badge}
                        </span>
                      )}
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-bold text-primary mt-1">
                        {item.price}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                        {item.tokens}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400">
                Tôi đồng ý với <a href="#" className="text-primary underline">Điều khoản dịch vụ SaaS</a> và <a href="#" className="text-primary underline">Cam kết bảo mật dữ liệu học viện</a>.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="shadow-xl shadow-primary/25 mt-4 text-sm font-bold gap-2"
            >
              <Zap className="w-4 h-4" />
              Khởi Tạo Trung Tâm & Vào Dashboard Quản Trị
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Trung tâm của bạn đã đăng ký tài khoản trước đó?{' '}
            <Link to="/auth/login" className="font-bold text-primary hover:underline">
              Đăng nhập Quản trị viên
            </Link>
          </div>
        </div>

        {/* Right Info & Trust Side: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-primary/10 via-slate-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-primary/10 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Tại sao 50+ trung tâm chọn EnglishFlow?
            </h3>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block font-semibold">
                    White-label & Nhận diện riêng
                  </strong>
                  Tùy biến Logo, Tên miền riêng, màu sắc chủ đạo đồng bộ trên cổng học viên và mẫu hóa đơn email.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block font-semibold">
                    AI Chấm thi & Soạn bài tự động
                  </strong>
                  Chấm Writing chuẩn 4 tiêu chí IELTS trong 3s, phân tích ngữ âm phát âm IPA và tự sinh giáo án điện tử.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block font-semibold">
                    Độc lập dữ liệu Tenant an toàn tuyệt đối
                  </strong>
                  Dữ liệu học viên, hóa đơn học phí và điểm thi được cách ly 100% bằng kiến trúc Multi-tenancy ACID.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block font-semibold">
                    Khởi tạo tức thì không cần cài đặt
                  </strong>
                  Đăng ký xong có ngay lớp học khởi đầu và quyền điều hành cơ sở mà không cần setup máy chủ phức tạp.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white">
                Cần tư vấn trực tiếp cho chuỗi cơ sở?
              </div>
              <p className="text-slate-500 text-[11px]">
                Đội ngũ kỹ sư giải pháp sẵn sàng hỗ trợ import dữ liệu học sinh hiện tại và tích hợp tên miền riêng.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-xs">
                Yêu cầu tư vấn 1:1 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default B2BRegisterPage

