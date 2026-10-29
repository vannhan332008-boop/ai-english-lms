import React, { useState, useRef, useEffect } from 'react'
import {
  LogOut,
  Settings,
  User,
  ShieldCheck,
  ChevronDown,
  Building,
} from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export const UserDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, role } = useRole()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-accent/60 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
        </div>
        <div className="hidden lg:flex flex-col">
          <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[130px]">
            {user.name}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-primary inline" />
            {user.roleLabel.split('(')[0].trim()}
          </span>
        </div>
        <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 text-card-foreground shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-xs font-semibold text-foreground">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Vai trò</span>
              <Badge variant="default" className="text-[10px] py-0 px-2 font-normal">
                {role}
              </Badge>
            </div>
            {user.centerName && (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Cơ sở</span>
                <span className="text-[10px] font-medium text-foreground flex items-center gap-1">
                  <Building className="w-2.5 h-2.5 text-primary" />
                  {user.centerName.replace('EnglishFlow ', '')}
                </span>
              </div>
            )}
          </div>

          <div className="py-1">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Hồ sơ cá nhân & Streak ({user.streakDays} ngày)</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Cài đặt hệ thống</span>
            </button>
          </div>

          <div className="pt-1 border-t border-border/60">
            <button
              onClick={() => {
                localStorage.removeItem('ef_access_token')
                localStorage.removeItem('token')
                localStorage.removeItem('ef_user_profile')
                localStorage.removeItem('ef_tenant_id')
                window.location.href = '/auth/login'
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-md transition-colors font-medium text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
