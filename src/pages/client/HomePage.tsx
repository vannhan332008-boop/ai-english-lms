import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Play,
  Mic,
  FileText,
  BarChart2,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { CourseCard } from '@/components/specific/CourseCard'
import { useCourseStore } from '@/store/courseStore'

export const HomePage: React.FC = () => {
  const { courses, fetchCourses } = useCourseStore()

  useEffect(() => {
    void fetchCourses()
  }, [fetchCourses])

  const featuredCourses = courses.slice(0, 3)

  return (
    <div className="space-y-24 pb-20">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-6 sm:pt-12 overflow-hidden">
        {/* Subtle Ambient Backlight Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-r from-indigo-500/15 via-cyan-400/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-cyan-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
              <span>Nền Tảng AI Tiên Phong Cho Trung Tâm Anh Ngữ Việt Nam</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Chinh phục ngoại ngữ cùng{' '}
              <span className="gradient-text-primary">AI Co-pilot</span> thông minh
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Chấm điểm bài viết IELTS chuẩn 4 tiêu chí trong 3 giây. Phân tích ngữ âm IPA bóc băng sóng âm. Tối ưu hóa 80% thời gian soạn giáo án cho giảng viên.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/courses">
                <Button
                  variant="glow"
                  size="lg"
                  className="w-full sm:w-auto shadow-xl shadow-indigo-500/25 gap-2"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Khám phá khóa học
                </Button>
              </Link>

              <Link to="/learning-room">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
                  leftIcon={<Play className="w-4 h-4 fill-current text-indigo-600" />}
                >
                  Vào phòng học thử
                </Button>
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60 text-center">
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">98.5%</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Đạt band mục tiêu</p>
              </div>
              <div>
                <span className="text-2xl font-black text-indigo-600 dark:text-cyan-400">3 Giây</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI chấm Writing</p>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">100%</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Phân tích âm IPA</p>
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">25+</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cơ sở trung tâm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HERO PREVIEW CARDS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-3 relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Writing Task 2 Evaluator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Chấm điểm tự động theo chuẩn 4 tiêu chí IDP/BC: Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Accuracy.
            </p>
          </div>

          <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-3 relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Sóng Âm Whisper & Đối Chiếu IPA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bóc băng âm thanh học viên gửi lên, phát hiện các lỗi phát âm sai trọng âm, nuốt âm đuôi và gợi ý sửa khẩu hình chuẩn xác.
            </p>
          </div>

          <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-3 relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Quản Trị Cơ Sở Multi-Tenant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Phân quyền thông minh Super Admin, Center Manager, Teacher và Student. Kiểm soát hạn mức Token AI và doanh thu tức thì.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FEATURED COURSES ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">
              Lộ Trình Đào Tạo Trọng Tâm
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Các Khóa Học Nổi Bật Nhất 2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Chương trình được thiết kế tương thích với công nghệ AI Co-pilot hỗ trợ học 24/7.
            </p>
          </div>

          <Link to="/courses">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Xem tất cả khóa học
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* ================= CTA BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold backdrop-blur-sm">
              Trải Nghiệm Miễn Phí
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Sẵn sàng bứt phá điểm số tiếng Anh của bạn ngay hôm nay?
            </h3>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Đăng ký tài khoản để nhận bài kiểm tra trình độ AI đầu vào miễn phí và trải nghiệm phòng luyện Writing & Speaking không giới hạn.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/auth/register">
                <Button variant="glow" size="lg">
                  Tạo tài khoản học viên
                </Button>
              </Link>
              <Link to="/learning-room">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  Vào phòng học trực tuyến
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
