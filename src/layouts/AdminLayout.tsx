import React, { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { RoleSwitcher } from '@/components/common/RoleSwitcher'
import { NotificationBell } from '@/components/specific/NotificationBell'
import { useAuthStore } from '@/store/authStore'
import {
  Menu,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/common/Button'

export interface AdminLayoutProps {
  children?: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-white dark:bg-slate-950 shadow-2xl">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Administrative Work Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Role Switcher Bar for testing */}
            <RoleSwitcher />
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2.5">
            <Link to="/courses" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-xs text-slate-500 hover:text-indigo-600 gap-1.5"
                rightIcon={<ExternalLink className="w-3 h-3" />}
              >
                Xem Web Học Viên
              </Button>
            </Link>

            <ThemeToggle className="h-9 w-9 rounded-xl" />

            <NotificationBell />

            <div className="h-4 w-px bg-slate-200 dark:border-slate-800 mx-1" />

            {/* Profile Avatar Chip */}
            <div className="flex items-center gap-2 pl-1">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                }
                alt={user?.fullName || 'Admin'}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold leading-tight truncate max-w-[120px]">
                  {user?.fullName || 'Quản trị viên'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {user?.tenant?.name || 'EnglishFlow HN'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
