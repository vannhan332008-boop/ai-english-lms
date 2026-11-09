import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Heart,
  Globe,
  ShieldCheck,
  Send,
} from 'lucide-react'
import { Button } from '@/components/common/Button'

export const ClientFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Newsletter & Brand Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  EnglishFlow<span className="text-indigo-600 dark:text-cyan-400">.</span>
                </span>
                <span className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                  AI EdTech SaaS
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pr-6">
              Hệ thống quản lý học tập tiếng Anh chuẩn quốc tế tích hợp AI Co-pilot chấm bài Writing Task 2 và sửa phát âm IPA thời gian thực cho các trung tâm Anh ngữ tại Việt Nam.
            </p>

            <div className="flex flex-col space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Tòa nhà Keangnam Landmark 72, Nam Từ Liêm, Hà Nội</span>
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Hotline: 1900 6868 • Hỗ trợ 24/7</span>
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>contact@englishflow.vn</span>
              </span>
            </div>
          </div>

          {/* Quick Links Sitemaps (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white tracking-wide uppercase text-[11px]">
                Khóa Học
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    IELTS Mastery 7.5+
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    TOEIC 850+ Speedrun
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    Giao tiếp Bản xứ
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    Tiếng Anh Doanh nghiệp
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white tracking-wide uppercase text-[11px]">
                Công Nghệ AI
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <Link to="/learning-room" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    AI Writing Barem
                  </Link>
                </li>
                <li>
                  <Link to="/learning-room" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    Sóng âm Whisper IPA
                  </Link>
                </li>
                <li>
                  <Link to="/learning-room" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    AI Lesson Planner
                  </Link>
                </li>
                <li>
                  <Link to="/learning-room" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    Spaced Repetition
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white tracking-wide uppercase text-[11px]">
                Nền Tảng
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <Link to="/admin/dashboard" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    Cổng Quản Trị
                  </Link>
                </li>
                <li>
                  <Link to="/auth/login" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    Đăng nhập Hệ thống
                  </Link>
                </li>
                <li>
                  <Link to="/auth/register" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    Đăng ký Đối tác
                  </Link>
                </li>
                <li>
                  <span className="text-slate-400">Bảo mật Multi-Tenant</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter (3 cols) */}
          <div className="lg:col-span-3 space-y-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs">
              Nhận tài liệu học bổng & Tips IELTS
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Cập nhật hàng tuần đề thi thật IELTS/TOEIC mới nhất cùng bài mẫu band 8.5+ từ AI Engine.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button variant="primary" size="sm" className="w-full text-xs gap-1.5" leftIcon={<Send className="w-3 h-3" />}>
                Đăng ký nhận tin
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-1">
            <span>© 2026 EnglishFlow LMS. Bản quyền thuộc về EdTech Vietnam. Thiết kế với</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Máy chủ Cloud Việt Nam</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Tiếng Việt (VN)</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default ClientFooter

