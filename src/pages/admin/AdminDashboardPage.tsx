import React from 'react'
import {
  Users,
  GraduationCap,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Building2,
  BookOpen,
  Award,
  Clock,
  FileCheck2,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useRole } from '@/hooks/useRole'

export const AdminDashboardPage: React.FC = () => {
  const { user, role } = useRole()

  return (
    <div className="space-y-6 text-left">
      {/* Header section with Dynamic Persona Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover ring-4 ring-primary/20 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Xin chào, {user.name}
              </h1>
              <Badge variant="default" className="text-xs">
                {role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {user.bio}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tháng 10/2026</span>
          </Button>
          <Button size="sm" className="gap-1.5 text-xs shadow-sm shadow-primary/25">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Xuất Báo Cáo</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid based on Role */}
      {role === 'SUPER_ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Tổng Trung Tâm Đối Tác</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">35 Cơ sở</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                +4 tháng này <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Học Viên Toàn Hệ Thống</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">48.240</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                +14.8% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Đang hoạt động trên nền tảng</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Doanh Thu Thuê Bao SaaS (MRR)</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">468.5M ₫</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                +22% YoY <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Tỷ lệ duy trì hợp đồng 98.2%</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">AI Token Tiêu Thụ Toàn Quốc</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">14.8M Tokens</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                Quota 25M
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">59.2% dung lượng hạ tầng AI</p>
          </div>
        </div>
      )}

      {role === 'CENTER_MANAGER' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Học Viên Cơ Sở Landmark</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">1.248</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                +12.4% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Đạt 104% chỉ tiêu quý 4</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Lớp Học Đang Diễn Ra</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">42 Lớp</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                +3 lớp mới <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">IELTS Master, TOEIC Speed, Kids</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Doanh Thu Học Phí Tháng 10</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">1.84 Tỷ ₫</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                +8.1% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Thu tiền trực tuyến qua VNPay/MoMo</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Hạn Mức AI Token Cơ Sở</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">684K / 1.2M</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                57%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Gói Professional Academy</p>
          </div>
        </div>
      )}

      {role === 'TEACHER' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Lớp Học Phụ Trách</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">4 Lớp</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                86 Học sinh
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">IELTS Master K24, K25, K26</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Bài Chờ Duyệt (Co-pilot)</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">12 Bài</span>
              <Badge variant="destructive" className="text-[10px]">Cần xem</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">AI đã chấm sơ bộ & ghi chú lỗi</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Tỷ Lệ Điểm Danh Tuần</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">96.5%</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                Xuất sắc
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Check-in tự động qua mã QR</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Giáo Án Đã Tạo Với AI</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">24 Giáo Án</span>
              <span className="text-xs font-semibold text-primary flex items-center">
                Tiết kiệm 36h
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Sẵn sàng xuất file PDF / Word</p>
          </div>
        </div>
      )}

      {role === 'STUDENT' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Chuỗi Ngày Học Tập (Streak)</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">🔥 14 Ngày</span>
              <Badge variant="success" className="text-[10px]">Top 5%</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Mục tiêu: Đạt mốc 30 ngày liên tục</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Target Band Hiện Tại</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">IELTS 7.0</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                +0.5 Band
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Target đầu ra: Band 7.5+</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Từ Vựng SRS Cần Ôn Hôm Nay</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">18 Thẻ</span>
              <Badge variant="default" className="text-[10px]">Đến hạn</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Thuật toán Spaced Repetition SM-2</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Bài Tập Đã Nộp Cho AI</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">42 Bài</span>
              <span className="text-xs font-semibold text-emerald-500">100% Hoàn thành</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">18 Writing & 24 Speaking Drills</p>
          </div>
        </div>
      )}

      {/* Overview Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Tiến độ Hệ thống EnglishFlow LMS (Phase 1 Hoàn thiện)
              </h2>
              <p className="text-xs text-muted-foreground">
                Đã đồng bộ giao diện Phân khu A, thanh Role Switcher và Mock Data Tiếng Việt.
              </p>
            </div>
            <Badge variant="success">Hoạt động trơn tru</Badge>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Phân khu A hoàn tất: Landing Page, Tính năng chi tiết, Bảng giá & Đặt lịch Demo</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Cụm xác thực Auth: Đăng nhập (kèm 1-Click Role Switch), Đăng ký cơ sở, Quên mật khẩu OTP</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Bộ Core UI Components: Button, Card, Badge, Input, Select, Modal, DataTable, Tabs, Toast</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Thanh Role Switcher Topbar: Chuyển đổi tức thì giữa Super Admin, Quản lý, Giáo viên và Học viên</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground">Phân khu tiếp theo</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-muted-foreground">Phân khu B: Super Admin Panel</span>
              <Badge variant="outline">Chờ lệnh Phase 2</Badge>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-muted-foreground">Phân khu C: Center Manager Panel</span>
              <Badge variant="outline">Phase 3</Badge>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-muted-foreground">Phân khu D: Teacher Workspace</span>
              <Badge variant="outline">Phase 4</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phân khu E: Student Learning Portal</span>
              <Badge variant="outline">Phase 5</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
