import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Layers,
  Building2,
  Mail,
  Lock,
  Phone,
  User,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'

export const RegisterTenantPage: React.FC = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    centerName: '',
    centerCode: '',
    managerName: '',
    email: '',
    phone: '',
    city: 'Hồ Chí Minh',
    plan: 'PROFESSIONAL',
    password: '',
    confirmPassword: '',
  })

  const handleCenterNameChange = (val: string) => {
    // Auto generate code from name
    const code = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    setFormData((prev) => ({
      ...prev,
      centerName: val,
      centerCode: prev.centerCode === '' || prev.centerCode.startsWith('ef-') ? `ef-${code}` : prev.centerCode,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      error('Mật khẩu không khớp!', 'Vui lòng kiểm tra lại mật khẩu xác nhận.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      success(
        'Đăng ký trung tâm thành công!',
        `Cơ sở ${formData.centerName} đã được thiết lập. Hãy đăng nhập để bắt đầu.`
      )
      navigate('/auth/login')
    }, 800)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-md shadow-primary/20">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              EnglishFlow <span className="text-primary font-normal text-sm">LMS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Đăng ký tài khoản Trung tâm mới
          </h2>
          <p className="text-xs text-muted-foreground">
            Thiết lập hệ thống quản lý học tập & khảo thí tích hợp AI cho cơ sở của bạn
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-border shadow-xl">
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2 text-xs text-primary font-medium">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Bao gồm 14 ngày dùng thử miễn phí toàn bộ tính năng AI Writing & Speaking</span>
              </div>

              {/* Center Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tên trung tâm Anh ngữ"
                  placeholder="VD: Anh ngữ Quốc tế StarPath"
                  required
                  value={formData.centerName}
                  onChange={(e) => handleCenterNameChange(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />
                <div className="space-y-1">
                  <Input
                    label="Mã Subdomain định danh"
                    placeholder="ef-starpath"
                    required
                    value={formData.centerCode}
                    onChange={(e) => setFormData({ ...formData, centerCode: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground truncate">
                    Domain: <code className="text-primary font-mono">{formData.centerCode || 'your-center'}.englishflow.vn</code>
                  </p>
                </div>
              </div>

              {/* Manager info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Họ tên Giám đốc / Quản lý"
                  placeholder="VD: Hoàng Minh Trí"
                  required
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Số điện thoại / Zalo"
                  placeholder="0912 345 678"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email công việc"
                  type="email"
                  placeholder="tri.hoang@starpath.edu.vn"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Select
                  label="Tỉnh / Thành phố"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  options={[
                    { value: 'Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
                    { value: 'Hà Nội', label: 'Hà Nội' },
                    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
                    { value: 'Cần Thơ', label: 'Cần Thơ' },
                    { value: 'Hải Phòng', label: 'Hải Phòng' },
                    { value: 'Khác', label: 'Tỉnh thành khác' },
                  ]}
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <Input
                  label="Xác nhận mật khẩu"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              {/* Plan Choice */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-foreground">
                  Gói dịch vụ khởi điểm
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, plan: 'STARTER' })}
                    className={`cursor-pointer p-3 rounded-xl border text-xs transition-all ${
                      formData.plan === 'STARTER'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="font-bold text-foreground">Gói Starter</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Tối đa 150 học viên</div>
                    <div className="text-primary font-bold mt-1">4.99M ₫ / tháng</div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, plan: 'PROFESSIONAL' })}
                    className={`cursor-pointer p-3 rounded-xl border text-xs transition-all ${
                      formData.plan === 'PROFESSIONAL'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-foreground">Gói Professional</div>
                      <Badge variant="default" className="text-[9px] py-0">Hot</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Tối đa 600 học viên</div>
                    <div className="text-primary font-bold mt-1">12.99M ₫ / tháng</div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-xs font-bold shadow-md shadow-primary/25 gap-2"
                >
                  {isLoading ? (
                    'Đang kích hoạt cơ sở...'
                  ) : (
                    <>
                      <span>Hoàn Tất Đăng Ký Cơ Sở</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Đã có tài khoản cơ sở?{' '}
          <Link to="/auth/login" className="font-bold text-primary hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
