import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Layers,
  Menu,
  X,
  ArrowRight,
  Globe,
  CheckCircle2,
  PhoneCall,
  Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Tính năng AI', path: '/features' },
    { label: 'Bảng giá SaaS', path: '/pricing' },
    { label: 'Liên hệ & Demo', path: '/contact' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Top Banner for Vietnamese Language Centers */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 text-center text-xs font-medium text-primary flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span className="hidden sm:inline">Dành riêng cho Trung tâm Anh ngữ tại Việt Nam:</span>
        <span>AI Chấm Writing & Speaking chuẩn Barem IELTS, TOEIC 2026.</span>
        <Link to="/contact" className="underline font-bold hover:text-primary/80 flex items-center gap-0.5 ml-1">
          Đăng ký trải nghiệm <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-md shadow-primary/20">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight">EnglishFlow</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">LMS</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'transition-colors py-1 hover:text-primary relative',
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <span>Vào Dashboard Demo</span>
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="sm" className="text-xs">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="shadow-sm shadow-primary/25 text-xs">
                Đăng ký Trung tâm
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Vào Dashboard Demo
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-border bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="font-bold text-base">EnglishFlow LMS</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nền tảng Quản trị Đào tạo & Khảo thí Tiếng Anh tích hợp AI thế hệ mới, thiết kế riêng cho các trung tâm, học viện ngôn ngữ và cơ sở luyện thi tại Việt Nam.
              </p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span>Cơ sở 1: Landmark 81, P.22, Q. Bình Thạnh, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span>Cơ sở 2: 45 Kim Mã, Q. Ba Đình, Hà Nội</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">Hotline: 1900 6886 (8:00 - 21:00)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Sản phẩm & AI</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">AI Chấm Viết Writing Rubric 4 tiêu chí</Link></li>
                <li><Link to="/features" className="hover:text-foreground">AI Chấm Nói Speaking & Nhận diện IPA</Link></li>
                <li><Link to="/features" className="hover:text-foreground">AI Co-pilot Soạn Giáo Án & Trắc Nghiệm</Link></li>
                <li><Link to="/features" className="hover:text-foreground">Thẻ Nhớ Học Từ Vựng Spaced Repetition</Link></li>
                <li><Link to="/features" className="hover:text-foreground">Báo cáo Zalo tự động cho Phụ huynh</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Đối tượng phục vụ</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/admin/dashboard" className="hover:text-foreground">Chuỗi trung tâm nhượng quyền (Franchise)</Link></li>
                <li><Link to="/admin/dashboard" className="hover:text-foreground">Ban Giám đốc & Quản lý Học vụ</Link></li>
                <li><Link to="/admin/dashboard" className="hover:text-foreground">Giáo viên bản ngữ & Trợ giảng</Link></li>
                <li><Link to="/admin/dashboard" className="hover:text-foreground">Học viên luyện thi IELTS / TOEIC</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Bảo mật & Pháp lý</h4>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tuân thủ Nghị định 13/2023/NĐ-CP (PDPD)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Máy chủ điện toán đám mây tại Việt Nam</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Mã hóa dữ liệu người dùng AES-256</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Cam kết bảo mật đề thi độc quyền</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <p>© 2026 EnglishFlow EdTech SaaS. Bảo lưu mọi quyền.</p>
            <div className="flex gap-4">
              <Link to="/contact" className="hover:text-foreground">Điều khoản dịch vụ</Link>
              <Link to="/contact" className="hover:text-foreground">Chính sách bảo mật</Link>
              <Link to="/contact" className="hover:text-foreground">Hỗ trợ kỹ thuật</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
