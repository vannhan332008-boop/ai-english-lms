import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Building2, GraduationCap, UserCheck } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { useToast } from '@/hooks/useToast'
import type { UserRoleType } from '@/mocks/users'
import { cn } from '@/lib/utils'

export const RoleSwitcher: React.FC = () => {
  const { role, setRole, user } = useRole()
  const { info } = useToast()
  const navigate = useNavigate()

  const roles: { type: UserRoleType; label: string; icon: React.ElementType }[] = [
    { type: 'SUPER_ADMIN', label: 'Super Admin', icon: Crown },
    { type: 'CENTER_MANAGER', label: 'Quản Lý Cơ Sở', icon: Building2 },
    { type: 'TEACHER', label: 'Giáo Viên', icon: GraduationCap },
    { type: 'STUDENT', label: 'Học Viên', icon: UserCheck },
  ]

  const handleRoleChange = (newRole: UserRoleType) => {
    if (newRole === role) return
    setRole(newRole)
    const roleMeta = roles.find((r) => r.type === newRole)
    info(
      `Đã chuyển góc nhìn: ${roleMeta?.label}`,
      `Đang mô phỏng giao diện cho nhân vật: ${user.name}`
    )

    if (newRole === 'SUPER_ADMIN') {
      navigate('/super-admin/dashboard')
    } else if (newRole === 'CENTER_MANAGER') {
      navigate('/center-manager/dashboard')
    } else if (newRole === 'TEACHER') {
      navigate('/teacher/dashboard')
    } else if (newRole === 'STUDENT') {
      navigate('/student/dashboard')
    }
  }

  return (
    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/80">
      <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
        Góc nhìn:
      </span>
      {roles.map(({ type, label, icon: Icon }) => {
        const isActive = role === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => handleRoleChange(type)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150',
              isActive
                ? 'bg-background text-primary shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
            )}
            title={`Chuyển sang góc nhìn ${label}`}
          >
            <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-primary' : 'text-muted-foreground')} />
            <span className="hidden md:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
export default RoleSwitcher
