import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Layers,
  Mail,
  Lock,
  KeyRound,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { success, info } = useToast()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
      setOtp('888999')
      info('Đã gửi mã xác minh!', 'Mã OTP thử nghiệm là 888999 (đã được điền sẵn).')
    }, 600)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setStep(3)
      success('Xác minh thành công!', 'Vui lòng thiết lập mật khẩu mới.')
    }, 500)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu không khớp!')
      return
    }
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      success('Khôi phục mật khẩu thành công!', 'Bạn có thể đăng nhập bằng mật khẩu mới.')
      navigate('/auth/login')
    }, 600)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
            Khôi phục mật khẩu
          </h2>
          <p className="text-xs text-muted-foreground">
            {step === 1 && 'Nhập email đã đăng ký để nhận mã OTP'}
            {step === 2 && 'Nhập mã 6 chữ số đã gửi về hòm thư của bạn'}
            {step === 3 && 'Tạo mật khẩu mới có độ bảo mật cao'}
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-border shadow-xl">
          <CardContent className="p-8 space-y-6">
            {/* Step 1: Input Email */}
            {step === 1 && (
              <form onSubmit={handleSendEmail} className="space-y-4 text-left">
                <Input
                  label="Email đã đăng ký"
                  type="email"
                  placeholder="name@englishflow.vn"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-xs font-bold gap-2 shadow-md shadow-primary/25"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi Mã Xác Minh'}
                </Button>
              </form>
            )}

            {/* Step 2: Input OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
                <div className="space-y-1">
                  <Input
                    label="Mã OTP 6 chữ số"
                    placeholder="888999"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    leftIcon={<KeyRound className="w-4 h-4" />}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Đã gửi tới: <strong className="text-foreground">{email}</strong>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-xs font-bold gap-2 shadow-md shadow-primary/25"
                >
                  {isLoading ? 'Đang xác minh...' : 'Tiếp Tục'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                <Input
                  label="Mật khẩu mới"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Input
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-xs font-bold gap-2 shadow-md shadow-primary/25"
                >
                  {isLoading ? 'Đang cập nhật...' : 'Lưu Mật Khẩu & Đăng Nhập'}
                </Button>
              </form>
            )}

            {/* Back to Login link */}
            <div className="pt-2 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Quay lại trang Đăng nhập</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
