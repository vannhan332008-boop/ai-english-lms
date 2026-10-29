import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  GraduationCap,
  BookOpen,
  Users2,
  UserCheck,
  ShieldCheck,
  CreditCard,
  Receipt,
  Sparkles,
  Settings,
  ChevronLeft,
  X,
  Layers,
  BotMessageSquare,
} from 'lucide-react'
import { roleNavigationMap } from '@/mocks/navigation'
import { useRole } from '@/hooks/useRole'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  BarChart3,
  Building2,
  GraduationCap,
  BookOpen,
  Users2,
  UserCheck,
  ShieldCheck,
  CreditCard,
  Receipt,
  Sparkles,
  Settings,
  BotMessageSquare,
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { role, user } = useRole()
  const navigationGroups = roleNavigationMap[role] || roleNavigationMap.CENTER_MANAGER

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out lg:static',
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-64',
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-md shadow-primary/20">
              <Layers className="h-5 w-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-foreground">EnglishFlow</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1 rounded">VN</span>
                </div>
                <span className="text-[11px] text-muted-foreground truncate">{user.centerName || 'Multi-tenant LMS'}</span>
              </div>
            )}
          </div>

          {/* Close button for Mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Collapse desktop toggle */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              'hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar hover:bg-sidebar-accent text-sidebar-foreground transition-transform',
              isCollapsed && 'rotate-180'
            )}
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2">
                  {group.groupTitle}
                </h4>
              )}
              {group.items.map((item, itemIdx) => {
                const IconComponent = iconMap[item.icon] || LayoutDashboard
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.href}
                    onClick={() => {
                      if (isMobileOpen) onCloseMobile()
                    }}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isCollapsed && !isMobileOpen && 'justify-center px-2'
                      )
                    }
                    title={isCollapsed && !isMobileOpen ? item.title : undefined}
                  >
                    <IconComponent className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-105')} />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="flex-1 truncate">{item.title}</span>
                    )}
                    {(!isCollapsed || isMobileOpen) && item.badge && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 uppercase font-semibold"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>

        {/* Bottom AI Status widget */}
        {(!isCollapsed || isMobileOpen) ? (
          <div className="p-3 border-t border-sidebar-border">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 via-indigo-500/5 to-transparent border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-foreground">AI Tutor Engine</span>
                </div>
                <Badge variant="success" className="text-[9px] py-0 px-1.5 font-bold">
                  v2.4
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Đang đóng vai: <span className="font-semibold text-foreground">{user.roleLabel}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-sidebar-border flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" title="AI Engine Online">
              <BotMessageSquare className="h-4 w-4" />
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
