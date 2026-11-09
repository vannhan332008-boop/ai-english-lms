import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  TrendingUp,
  CreditCard,
  Mic,
  FileText,
  Radio,
  Video,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  mockDailyTasks,
  mockInProgressCourses,
  mockWeeklyProgress,
  type DailyTask,
} from '@/mocks/studentPortal'
import { useToast } from '@/hooks/useToast'
import { useRole } from '@/hooks/useRole'
import { courseService } from '@/services/courseService'
import { assignmentService, type AssignmentItem } from '@/services/assignmentService'
import { reportService, type StudentDashboardReport } from '@/services/reportService'
import {
  liveSessionService,
  type LiveSessionItem,
  checkLiveSessionJoinStatus,
} from '@/services/liveSessionService'
import { StudentAssignmentModal } from '@/components/specific/StudentAssignmentModal'

export const StudentDashboard: React.FC = () => {
  const { success } = useToast()
  const { user } = useRole()
  const [tasks, setTasks] = useState<DailyTask[]>(mockDailyTasks)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>(mockInProgressCourses)
  const [studentAssignments, setStudentAssignments] = useState<AssignmentItem[]>([])
  const [liveSessions, setLiveSessions] = useState<LiveSessionItem[]>([])
  const [reportData, setReportData] = useState<StudentDashboardReport | null>(null)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState<boolean>(false)

  const fetchStudentData = async () => {
    try {
      const [coursesData, assignmentsData, report, sessionsData] = await Promise.all([
        courseService.getMyEnrolledCourses().catch(() => []),
        assignmentService.getAssignments().catch(() => []),
        reportService.getStudentReport().catch(() => null),
        liveSessionService.getLiveSessions().catch(() => []),
      ])

      if (sessionsData && sessionsData.length > 0) {
        setLiveSessions(sessionsData)
      }

      if (report) {
        setReportData(report)
        if (report.enrolledCourses && report.enrolledCourses.length > 0) {
          setEnrolledCourses(report.enrolledCourses)
        }
      } else if (coursesData && coursesData.length > 0) {
        setEnrolledCourses(coursesData)
      }

      if (assignmentsData && assignmentsData.length > 0) {
        setStudentAssignments(assignmentsData)
      }
    } catch (err) {
      console.warn('Could not load student dashboard data:', err)
    }
  }

  useEffect(() => {
    void fetchStudentData()
  }, [])

  const completedCount = tasks.filter((t) => t.completed).length
  const progressPercent = Math.round((completedCount / tasks.length) * 100)

  const chartData =
    reportData && reportData.weeklyProgress && reportData.weeklyProgress.some((p) => p.score > 0 || p.submissions > 0)
      ? reportData.weeklyProgress.map((w) => ({
          week: w.day,
          bandScore: w.score > 0 ? (w.score > 10 ? Math.round((w.score / 10) * 10) / 10 : w.score) : 6.0,
          targetBand: 7.5,
          submissions: w.submissions,
        }))
      : mockWeeklyProgress

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed
          if (nextState) {
            success(`Hoàn thành nhiệm vụ!`, `Bạn đã nhận thêm +${t.xpReward} XP điểm thưởng.`)
          }
          return { ...t, completed: nextState }
        }
        return t
      })
    )
  }

  return (
    <div className="space-y-6">
      {/* Gamification Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/25">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Chào {user?.name || 'Học viên'}! 🔥
            </h1>
            <Badge variant="warning" className="gap-1 shadow-sm font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              Streak {reportData?.stats?.streakDays ?? (user as any)?.streakDays ?? 7} Ngày Liên Tiếp
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Bạn đang duy trì phong độ rất tốt! Trình độ hiện tại:{' '}
            <strong className="text-foreground">CEFR {reportData?.stats?.cefrLevel ?? (user as any)?.cefrLevel ?? 'B2'}</strong>. Đã nộp {reportData?.stats?.completedAssignmentsCount ?? 0} bài tập.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-semibold uppercase">Điểm TB Bài Tập</span>
              <span className="text-lg font-black text-foreground">
                {reportData?.stats?.averagePercentage ? `${reportData.stats.averagePercentage}%` : '85%'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-semibold uppercase">Trình độ CEFR</span>
              <span className="text-lg font-black text-primary">
                {reportData?.stats?.cefrLevel ?? 'B2'} Level
              </span>
            </div>
          </div>

          <Link to="/student/practice">
            <Button variant="primary" className="h-full py-3.5 gap-1.5 shadow-md shadow-primary/20">
              <Sparkles className="w-4 h-4" />
              Vào phòng luyện AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Today's Tasks & Band Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Tasks (5 cols) */}
        <Card className="lg:col-span-5 p-5 flex flex-col justify-between border-border/80">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Nhiệm Vụ Học Tập Hôm Nay
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Hoàn thành để duy trì chuỗi Streak</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {completedCount}/{tasks.length} Xong
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="my-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Tiến độ hôm nay</span>
                <span className="font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Task list with checkboxes */}
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-muted/30 border-border/40 opacity-70'
                      : 'bg-card border-border/80 hover:border-primary/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}} // handled by parent div
                      className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <p
                        className={`text-xs font-semibold ${
                          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedMinutes} phút
                        </span>
                        <span>•</span>
                        <span className="text-amber-500 font-bold">+{task.xpReward} XP</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-primary shrink-0">
                    {task.completed ? '✓ Đã xong' : 'Làm ngay →'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 mt-4 text-center">
            <span className="text-xs text-muted-foreground">
              Hoàn thành toàn bộ để nhận thêm <strong className="text-amber-500">+100 XP Thưởng Ngày</strong>
            </span>
          </div>
        </Card>

        {/* Right: Band Progress LineChart (7 cols) */}
        <Card className="lg:col-span-7 p-5 flex flex-col justify-between border-border/80">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Tiến Trình Tăng Trưởng Band Điểm (8 Tuần Qua)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dữ liệu tổng hợp từ bài chấm AI Speaking, Writing và Mock Tests
              </p>
            </div>
            <Badge variant="primary" className="text-xs font-mono">
              7.0 Band
            </Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                <XAxis dataKey="week" stroke="currentColor" className="text-xs text-muted-foreground" />
                <YAxis domain={[5.0, 8.0]} stroke="currentColor" className="text-xs text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.75rem',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} Overall Band`, 'Điểm dự phóng']}
                />
                <Line
                  type="monotone"
                  dataKey="bandScore"
                  name="Điểm của bạn"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <span>Khởi điểm: Band 5.5</span>
            <span className="font-semibold text-foreground">Tăng trưởng: +1.5 Band sau 2 tháng</span>
            <span className="text-primary font-bold">Mục tiêu: 7.5+</span>
          </div>
        </Card>
      </div>

      {/* Row: Upcoming Live Sessions (Giai đoạn P15) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              Các Buổi Học Trực Tuyến Sắp Tới
            </h2>
            <Badge variant="outline" className="border-rose-500/30 text-rose-500 font-mono text-[11px]">
              {liveSessions.length} Buổi học
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Tự động kích hoạt nút "Vào lớp" trước giờ học 15 phút
          </span>
        </div>

        {liveSessions.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground border-border/80 text-xs">
            Hiện tại bạn chưa có lịch học trực tuyến nào sắp diễn ra. Giảng viên sẽ thông báo khi có lịch học mới!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveSessions.map((session) => {
              const joinStatus = checkLiveSessionJoinStatus(session)
              const start = new Date(session.startTime)
              const end = new Date(session.endTime)

              return (
                <Card
                  key={session.id}
                  className="p-5 border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {session.meetingPlatform === 'ZOOM'
                            ? '🔵 Zoom'
                            : session.meetingPlatform === 'MICROSOFT_TEAMS'
                            ? '🟣 Teams'
                            : '🟢 Google Meet'}
                        </Badge>
                        {session.class && (
                          <Badge variant="secondary" className="text-[10px]">
                            {session.class.name}
                          </Badge>
                        )}
                      </div>

                      {/* Status indicator badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          joinStatus.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400'
                            : joinStatus.status === 'UPCOMING'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {joinStatus.status === 'ACTIVE' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                        {joinStatus.status === 'UPCOMING' && <Clock className="w-3 h-3" />}
                        {joinStatus.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-foreground text-sm line-clamp-1">
                        {session.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.course?.title || 'Khóa học tiếng Anh'}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                          {start.toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                          {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {session.teacher && (
                        <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                          <span className="text-[11px]">Giảng viên:</span>
                          <span className="font-semibold text-foreground text-[11px]">{session.teacher.fullName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-muted-foreground">
                      {joinStatus.canJoin ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Đã mở phòng học
                        </span>
                      ) : joinStatus.status === 'UPCOMING' ? (
                        <span>Mở trước 15p ({joinStatus.countdownText})</span>
                      ) : (
                        <span>{joinStatus.label}</span>
                      )}
                    </span>

                    {joinStatus.canJoin ? (
                      <a
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Vào lớp
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="text-xs gap-1.5 opacity-60 cursor-not-allowed"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Vào lớp
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Row: Assigned Homework & Quizzes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Bài Tập & Bài Kiểm Tra Được Giao
          </h2>
          <span className="text-xs text-muted-foreground">{studentAssignments.length} Bài tập</span>
        </div>

        {studentAssignments.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground border-border/80 text-xs">
            Hiện bạn chưa có bài tập nào cần làm. Hãy tham gia lớp học và kiểm tra lại sau!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentAssignments.map((asg) => {
              const sub = asg.submissions && asg.submissions[0]
              const isGraded = sub && sub.score !== null && sub.score !== undefined
              const isSubmitted = sub && !sub.isDraft
              const isDraft = sub && sub.isDraft

              return (
                <Card
                  key={asg.id}
                  className="p-4 border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {asg.class?.name}
                      </Badge>
                      <Badge
                        variant={
                          isGraded
                            ? 'success'
                            : isSubmitted
                            ? 'primary'
                            : isDraft
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {isGraded
                          ? `Đã chấm: ${sub.score}/${asg.maxScore}`
                          : isSubmitted
                          ? 'Đã nộp bài'
                          : isDraft
                          ? 'Bản nháp'
                          : 'Chưa làm'}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-foreground text-sm line-clamp-1">{asg.title}</h3>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Hạn nộp:{' '}
                        {asg.dueDate
                          ? new Date(asg.dueDate).toLocaleString('vi-VN')
                          : 'Không giới hạn'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Dạng bài: <strong>{asg.type}</strong>
                    </span>
                    <Button
                      size="sm"
                      variant={isSubmitted ? 'outline' : 'primary'}
                      onClick={() => {
                        setSelectedAssignmentId(asg.id)
                        setIsAssignmentModalOpen(true)
                      }}
                      className="text-xs"
                    >
                      {isGraded ? 'Xem điểm & Nhận xét' : isSubmitted ? 'Xem bài nộp' : 'Làm bài ngay →'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Row 2: In-Progress Courses & Fast Hub Shortcuts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Khóa Học Đang Theo Học
          </h2>
          <span className="text-xs text-muted-foreground">{enrolledCourses.length} Khóa đang học</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => (
            <Card
              key={course.id || course.enrollmentId}
              className="p-5 flex flex-col justify-between hover:shadow-lg transition-all border-border/80 group"
            >
              <div className="flex items-start gap-4">
                <img
                  src={course.thumbnail || course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                  alt={course.title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 ring-1 ring-border"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {course.code || 'ENG-COURSE'}
                    </Badge>
                    <span className="text-xs font-bold text-primary">{course.progressPercent || 25}%</span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Giảng viên: {course.instructor || course.teacherName || 'David Miller'}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${course.progressPercent || 25}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground block">Lớp / Bài học tiếp theo:</span>
                  <span className="text-xs font-semibold text-foreground line-clamp-1">
                    {course.className ? `${course.className} • ` : ''}{course.nextLessonTitle || 'Bài học 01: Giới thiệu & Chiến thuật'}
                  </span>
                </div>

                <Link to={course.id ? `/learn/${course.id}` : "/student/practice"}>
                  <Button variant="primary" size="sm" className="gap-1.5 text-xs shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Học tiếp
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Row 3: Fast Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/student/practice">
          <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-3.5 group">
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm group-hover:text-primary">Phòng Luyện Speaking AI</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Nhận diện sóng âm IPA thời gian thực</p>
            </div>
          </Card>
        </Link>

        <Link to="/student/practice">
          <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-3.5 group">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm group-hover:text-primary">Phòng Luyện Writing Task 2</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Chấm tự động theo barem IDP/BC</p>
            </div>
          </Card>
        </Link>

        <Link to="/student/flashcards">
          <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-3.5 group">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm group-hover:text-primary">Học Từ Vựng SRS (SM-2)</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Thuật toán ghi nhớ ngắt quãng</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Student Assignment Modal */}
      {selectedAssignmentId && (
        <StudentAssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          assignmentId={selectedAssignmentId}
          onSubmitted={() => {
            void fetchStudentData()
          }}
        />
      )}
    </div>
  )
}

export default StudentDashboard
