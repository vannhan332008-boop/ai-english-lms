import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sparkles, ShieldCheck, Award } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export interface AuthLayoutProps {
  children?: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Left Visual Column (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-12 flex-col justify-between overflow-hidden text-white select-none">
        {/* Ambient Decorative Blurs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 z-10 w-fit">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight leading-tight">
              EnglishFlow<span className="text-cyan-400">.</span>
            </span>
            <span className="block text-[10px] font-semibold tracking-widest text-indigo-300 uppercase">
              AI English Learning Management
            </span>
          </div>
        </Link>

        {/* Middle Feature Cards Showcase */}
        <div className="space-y-6 z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-semibold">
            <Award className="w-4 h-4" />
            <span>Nền tảng EdTech Tiên Phong tại Việt Nam</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
            Nâng tầm chuẩn mực học tiếng Anh với sức mạnh AI Co-pilot
          </h2>

          <p className="text-sm text-indigo-200/90 leading-relaxed">
            Tự động chấm bài Writing Task 2 chuẩn barem IDP/BC trong 3 giây và nhận diện từng âm vị IPA lệch chuẩn trong phòng luyện Speaking tương tác.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <span className="text-2xl font-black text-cyan-400">98.4%</span>
              <p className="text-xs text-indigo-200">Học viên đạt mục tiêu cam kết</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <span className="text-2xl font-black text-indigo-400">2.4 Triệu+</span>
              <p className="text-xs text-indigo-200">Bài tập AI đã chấm điểm</p>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="pt-6 border-t border-white/10 z-10 flex items-center justify-between text-xs text-indigo-300/80">
          <span>Hệ thống bảo mật dữ liệu đa trung tâm (Multi-Tenant)</span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO/IEC 27001 Certified</span>
          </span>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="flex items-center justify-between pb-6">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">EnglishFlow</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle className="h-9 w-9 rounded-xl" />
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto py-8">
          {children || <Outlet />}
        </div>

        {/* Bottom Copyright */}
        <p className="text-center text-xs text-slate-400">
          © 2026 EnglishFlow LMS. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
