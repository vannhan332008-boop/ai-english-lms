import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  DoorOpen,
  ArrowRight,
  FileCheck,
  BotMessageSquare,
  Bell,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import {
  mockTodaySchedule,
  mockTeacherAnnouncements,
  mockTeacherClasses,
  mockGradingSubmissions,
} from '@/mocks/teacherPortal'
import { useToast } from '@/hooks/useToast'

const TODAY_DATE = '29/10/2026'

export const TeacherDashboard: React.FC = () => {
  const { info } = useToast()

  const pendingGradingCount = mockGradingSubmissions.filter((s) => s.status === 'PENDING').length
  const totalStudents = mockTeacherClasses.reduce((acc, c) => acc + c.totalStudents, 0)

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Không Gian Giảng Dạy & AI Co-pilot
            </h1>
            <Badge variant="success">Giảng viên Chuyên nghiệp</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Chào mừng trở lại! Hôm nay bạn có <span className="font-semibold text-foreground">3 ca giảng dạy</span> và{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {pendingGradingCount} bài nộp của học viên
            </span>{' '}
            đang đợi bạn duyệt cùng AI Co-pilot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link to="/teacher/grading">
            <Button variant="primary" size="sm" className="gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Trạm chấm AI ({pendingGradingCount})
            </Button>
          </Link>
          <Link to="/teacher/lesson-planner">
            <Button variant="outline" size="sm" className="gap-1.5">
              <BotMessageSquare className="w-4 h-4 text-emerald-600" />
              Soạn giáo án
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bài Tập Chờ Chấm"
          value={`${pendingGradingCount} Bài Nộp`}
          icon={FileCheck}
          iconColor="text-rose-500"
          iconBg="bg-rose-500/10"
          trend={{ value: 'Cần duyệt', label: 'Writing & Speaking', isPositive: false }}
        />
        <StatCard
          title="Học Viên Phụ Trách"
          value={`${totalStudents} Học Viên`}
          icon={Users}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-500/10"
          trend={{ value: '3 lớp', label: 'IELTS 6.5, K24 & Giao tiếp', isPositive: true }}
        />
        <StatCard
          title="Đánh Giá Giảng Dạy"
          value="4.95 / 5.0"
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          trend={{ value: '98.5%', label: 'học viên hài lòng tuyệt đối', isPositive: true }}
        />
        <StatCard
          title="Chuyên Cần Trung Bình"
          value="96.8%"
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
          trend={{ value: '+2.1%', label: 'vượt chuẩn cơ sở 95%', isPositive: true }}
        />
      </div>

      {/* Row 2: Today's Schedule Timeline & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline: Today's Schedule (2 cols) */}
        <Card className="p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Lịch Giảng Dạy Hôm Nay (Timeline)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Thời khóa biểu các lớp được chỉ định trực tiếp tại cơ sở Landmark
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {TODAY_DATE}
              </Badge>
            </div>

            {/* Timeline UI list */}
            <div className="space-y-4 mt-5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60 before:z-0">
              {mockTodaySchedule.map((item) => {
                const isCompleted = item.status === 'COMPLETED'
                const isInProgress = item.status === 'IN_PROGRESS'

                return (
                  <div key={item.id} className="relative z-10 flex items-start gap-4 pl-1">
                    {/* Timeline Node dot */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-4 ring-card ${
                        isCompleted
                          ? 'bg-muted text-muted-foreground'
                          : isInProgress
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Timeline Content Card */}
                    <div
                      className={`flex-1 p-4 rounded-xl border transition-all ${
                        isInProgress
                          ? 'bg-emerald-500/5 border-emerald-500/30 shadow-sm'
                          : 'bg-muted/30 border-border/60 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{item.className}</span>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {item.courseCode}
                          </Badge>
                          {isInProgress && (
                            <Badge variant="success" className="text-[10px] animate-pulse">
                              Đang diễn ra
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="secondary" className="text-[10px]">
                              Đã kết thúc
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.timeRange}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 space-y-1.5">
                        <p className="text-xs font-medium text-foreground line-clamp-1">
                          <span className="text-muted-foreground">Chủ đề:</span> {item.topic}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DoorOpen className="w-3 h-3 text-primary" />
                            {item.room}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {item.studentCount} học viên
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-end gap-2">
                        <Link to="/teacher/classes">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            Xem sĩ số
                          </Button>
                        </Link>
                        <Link to="/teacher/assignments">
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                            Giao bài tập
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 text-right">
            <Link to="/teacher/classes" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
              Xem toàn bộ lịch giảng dạy tháng này
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Center Manager Announcements (1 col) */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Thông Báo Từ Học Vụ
              </h2>
              <Badge variant="outline" className="text-[10px]">
                3 Mới
              </Badge>
            </div>

            <div className="space-y-3.5 mt-4">
              {mockTeacherAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !ann.read
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-muted/20 border-border/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground text-xs line-clamp-1">{ann.title}</h3>
                    {!ann.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{ann.content}</p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {ann.sender} ({ann.senderRole})
                    </span>
                    <span>{ann.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => info('Đã đánh dấu tất cả thông báo là đã đọc')}
            >
              Đánh dấu đã đọc tất cả
            </Button>
          </div>
        </Card>
      </div>

      {/* Row 3: Quick AI Assistant & Class Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: AI Grading Quick Jump */}
        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                AI Grading Co-pilot
              </span>
              <Badge variant="primary">Trợ lý AI</Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-2">
              Chấm Điểm Tự Động Writing & Speaking Theo Rubric IELTS
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              AI đã phân tích ngữ pháp, từ vựng và sóng âm phát âm IPA cho{' '}
              <strong className="text-foreground">{pendingGradingCount} bài nộp</strong> mới nhất. Bạn chỉ cần xem xét
              và bấm duyệt!
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tiết kiệm 85% thời gian chấm bài</span>
            <Link to="/teacher/grading">
              <Button size="sm" variant="primary" className="gap-1.5 text-xs">
                Mở trạm chấm bài
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Card 2: AI Lesson Planner Quick Jump */}
        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                AI Lesson Planner
              </span>
              <Badge variant="success">Tạo giáo án</Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-2">
              Soạn Giáo Án 90 Phút Kèm Trắc Nghiệm & Flashcards
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Nhập chủ đề và trình độ mong muốn, AI sẽ sinh trọn vẹn dàn ý 5 giai đoạn sư phạm chuẩn Cambridge cùng bộ câu hỏi thực hành.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Xuất bản PDF & Flashcard 1-click</span>
            <Link to="/teacher/lesson-planner">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                Soạn bài học mới
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TeacherDashboard
