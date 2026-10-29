import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Layers,
  Lock,
  Mail,
  Building2,
  GraduationCap,
  Crown,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { useRole } from '@/hooks/useRole'
import { apiClient } from '@/lib/api-client'
import type { UserRoleType } from '@/mocks/users'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { setRole } = useRole()

  const [email, setEmail] = useState('manager.hn@englishflow.vn')
  const [password, setPassword] = useState('123456')
  const [isLoading, setIsLoading] = useState(false)

  const navigateByRole = (role: UserRoleType) => {
    switch (role) {
      case 'SUPER_ADMIN':
        navigate('/super-admin/dashboard')
        break
      case 'CENTER_MANAGER':
        navigate('/center-manager/dashboard')
        break
      case 'TEACHER':
        navigate('/teacher/dashboard')
        break
      case 'STUDENT':
        navigate('/student/dashboard')
        break
      default:
        navigate('/center-manager/dashboard')
    }
  }

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/login', {
        email: loginEmail,
        password: loginPass,
      })

      const data = response.data?.data
      if (data?.tokens?.accessToken && data?.user) {
        localStorage.setItem('ef_access_token', data.tokens.accessToken)
        localStorage.setItem('token', data.tokens.accessToken)
        localStorage.setItem('ef_user_profile', JSON.stringify(data.user))
        localStorage.setItem('ef_active_role', data.user.role)
        if (data.user.tenantId) {
          localStorage.setItem('ef_tenant_id', data.user.tenantId)
        }

        setRole(data.user.role as UserRoleType)
        success(
          'Đăng nhập thành công!',
          `Chào mừng ${data.user.fullName} (${data.user.role}) quay trở lại EnglishFlow LMS.`
        )

        navigateByRole(data.user.role as UserRoleType)
        return
      }
      throw new Error('Cấu trúc phản hồi không hợp lệ từ server')
    } catch (err: any) {
      console.warn('API login failed, attempting fallback:', err)
      const errorMsg =
        err.response?.data?.message || err.message || 'Email hoặc mật khẩu không chính xác'
      
      // Fallback for offline/demo if server is temporarily unreachable
      if (err.code === 'ERR_NETWORK' || !err.response) {
        let detectedRole: UserRoleType = 'CENTER_MANAGER'
        if (loginEmail.includes('superadmin')) detectedRole = 'SUPER_ADMIN'
        else if (loginEmail.includes('teacher')) detectedRole = 'TEACHER'
        else if (loginEmail.includes('student')) detectedRole = 'STUDENT'

        setRole(detectedRole)
        success('Đăng nhập (Chế độ Cục bộ)', `Hệ thống tiếp tục với vai trò: ${detectedRole}`)
        navigateByRole(detectedRole)
        return
      }

      toastError('Đăng nhập thất bại', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    executeLogin(email, password)
  }

  // Quick 1-click Demo Login
  const handleQuickLogin = (_role: UserRoleType, demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('123456')
    executeLogin(demoEmail, '123456')
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
            Đăng nhập hệ thống
          </h2>
          <p className="text-xs text-muted-foreground">
            Quản trị cơ sở, giảng dạy và học tập với sự hỗ trợ của AI
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-border shadow-xl">
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <Input
                label="Email đăng nhập"
                type="email"
                placeholder="name@englishflow.vn"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="space-y-1">
                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <div className="flex justify-end">
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-xs font-bold shadow-md shadow-primary/25"
              >
                {isLoading ? 'Đang xác thực qua API...' : 'Đăng Nhập'}
              </Button>
            </form>

            {/* Quick 1-click Role Selector for Demo Testing */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Đăng nhập nhanh (Tài khoản Seed):
                </span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-primary border-primary/30">
                  Real API Auth
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('SUPER_ADMIN', 'superadmin@englishflow.vn')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-accent/60 transition-colors text-left"
                >
                  <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-foreground text-[11px]">Super Admin</p>
                    <p className="text-[10px] text-muted-foreground truncate">superadmin@englishflow.vn</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('CENTER_MANAGER', 'manager.hn@englishflow.vn')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-accent/60 transition-colors text-left"
                >
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-foreground text-[11px]">Quản Lý Cơ Sở</p>
                    <p className="text-[10px] text-muted-foreground truncate">manager.hn@englishflow.vn</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('TEACHER', 'teacher.david@englishflow.vn')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-accent/60 transition-colors text-left"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-foreground text-[11px]">Giáo Viên</p>
                    <p className="text-[10px] text-muted-foreground truncate">teacher.david@englishflow.vn</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('STUDENT', 'student.nam@englishflow.vn')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-accent/60 transition-colors text-left"
                >
                  <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-foreground text-[11px]">Học Viên</p>
                    <p className="text-[10px] text-muted-foreground truncate">student.nam@englishflow.vn</p>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground">
          Trung tâm của bạn chưa có tài khoản?{' '}
          <Link to="/auth/register" className="font-bold text-primary hover:underline">
            Đăng ký cơ sở mới
          </Link>
        </p>
      </div>
    </div>
  )
}
export default LoginPage
