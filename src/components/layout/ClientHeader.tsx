import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sparkles,
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NotificationBell } from '@/components/specific/NotificationBell'
import { useAuthStore } from '@/store/authStore'
import { useTenantTheme } from '@/context/TenantThemeContext'
import { cn } from '@/lib/utils'

export const ClientHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme } = useTenantTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Khóa học', path: '/courses' },
    { label: 'Phòng học AI', path: '/learning-room' },
    { label: 'Lộ trình IELTS', path: '/courses/c-ielts-mastery' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={theme.name}
                className="w-10 h-10 rounded-2xl object-cover shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor || '#4f46e5'}, ${theme.secondaryColor || '#06b6d4'})`,
                }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {theme.name || 'EnglishFlow'}
                <span className="text-primary">.</span>
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                {theme.code && theme.code !== 'DEFAULT' ? `Cơ sở ${theme.code}` : 'AI EdTech LMS'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/70 dark:bg-slate-900/60 rounded-full border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-sm">
            {navLinks.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200',
                    active
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="hidden sm:flex items-center gap-2.5">
            <ThemeToggle className="h-9 w-9 rounded-xl" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <NotificationBell />
                <Link
                  to={user.role === 'STUDENT' ? '/learning-room' : '/admin/dashboard'}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.fullName}
                    className="w-6 h-6 rounded-lg object-cover ring-1 ring-indigo-500/30"
                  />
                  <span className="max-w-[110px] truncate">{user.fullName}</span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  title="Đăng xuất"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="glow" size="sm" leftIcon={<GraduationCap className="w-3.5 h-3.5" />}>
                    Học thử ngay
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-1.5">
            {isAuthenticated && <NotificationBell />}
            <ThemeToggle className="h-8 w-8 rounded-lg" />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'px-3 py-2 text-sm font-semibold rounded-xl',
                  isActive(link.path)
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full text-rose-500"
              >
                Đăng xuất
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default ClientHeader
