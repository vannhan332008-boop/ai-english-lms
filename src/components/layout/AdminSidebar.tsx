import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  FileCheck,
  BotMessageSquare,
  Palette,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTenantTheme } from '@/context/TenantThemeContext'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed))

  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme } = useTenantTheme()

  const navItems = [
    {
      group: 'ĐIỀU HÀNH',
      items: [
        { label: 'Thống kê tổng quan', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Quản lý khóa học', path: '/admin/courses', icon: BookOpen },
        { label: 'Quản lý học viên', path: '/admin/users', icon: Users },
      ],
    },
    {
      group: 'AI CO-PILOT',
      items: [
        { label: 'Trạm chấm bài AI', path: '/teacher/grading', icon: FileCheck },
        { label: 'Soạn giáo án AI', path: '/teacher/lesson-planner', icon: BotMessageSquare },
        { label: 'Phòng học trực tuyến', path: '/learning-room', icon: GraduationCap },
      ],
    },
    {
      group: 'HỆ THỐNG',
      items: [
        { label: 'Về trang học viên', path: '/', icon: Sparkles },
        ...(user?.role === 'SUPER_ADMIN' || user?.role === 'CENTER_MANAGER'
          ? [{ label: 'Thương hiệu cơ sở', path: '/center-manager/brand', icon: Palette }]
          : []),
        { label: 'Cài đặt nền tảng', path: '/admin/settings', icon: Settings },
      ],
    },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-all duration-300 z-30 select-none min-h-screen',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800/80">
          <Link to="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={theme.name}
                className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-md shadow-indigo-500/20"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor || '#4f46e5'}, ${theme.secondaryColor || '#06b6d4'})`,
                }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                  {theme.name || 'EnglishFlow'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {theme.code && theme.code !== 'DEFAULT' ? `Cơ sở ${theme.code}` : 'Admin Portal'}
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                        active
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 shadow-sm border border-indigo-200/50 dark:border-indigo-800/50'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-900/60'
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0',
                          active
                            ? 'text-indigo-600 dark:text-cyan-400'
                            : 'text-slate-400 dark:text-slate-500'
                        )}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className={cn('flex items-center gap-2.5', isCollapsed ? 'justify-center' : 'justify-between')}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'
              }
              alt={user?.fullName || 'User'}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/20 shrink-0"
            />
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.fullName || 'Quản trị viên'}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{user?.role || 'CENTER_MANAGER'}</span>
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
