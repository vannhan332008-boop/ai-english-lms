import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  Cpu, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { adminService } from '../../services/adminService';
import type { OverviewStats } from '../../services/adminService';
import { formatVND, formatCompactNumber } from '../../utils/formatters';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const data = await adminService.getOverviewStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Đang đồng bộ chỉ số phân tích quản trị..." />
      </div>
    );
  }

  const tokenUsagePercent = Math.min(
    Math.round((stats.aiTokensUsed / stats.aiTokensQuota) * 100),
    100
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-primary-900/40 via-slate-900 to-slate-900 border border-primary-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống vận hành ổn định
            </span>
            <span className="text-xs text-slate-400">EnglishFlow v2.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bảng điều khiển Trung tâm Quản trị
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Theo dõi tổng quan doanh thu đào tạo, số lượng học viên trực tuyến và mức độ khai thác tài nguyên AI Co-Pilot theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link to="/admin/courses">
            <Button variant="outline" size="sm">
              Quản lý khóa học
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="primary" size="sm">
              Xem học viên
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Doanh thu tháng này
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatVND(stats.totalRevenue)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% so với tháng trước</span>
          </div>
        </div>

        {/* Active Students */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Học viên hoạt động
            </span>
            <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.totalStudents.toLocaleString('vi-VN')}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+125 học viên đăng ký mới</span>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Khóa học trực tuyến
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.totalCourses} khóa học
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>4 chương trình luyện thi IELTS/TOEIC</span>
          </div>
        </div>

        {/* AI Tokens Consumed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AI Token Tiêu thụ
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCompactNumber(stats.aiTokensUsed)} / {formatCompactNumber(stats.aiTokensQuota)}
          </p>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-primary-500 transition-all duration-500"
              style={{ width: `${tokenUsagePercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Biểu đồ Doanh thu 6 tháng gần nhất
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tăng trưởng doanh thu từ các chương trình học trực tuyến và gói luyện thi IELTS
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20">
              +28.5% YoY
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatVND(Number(value) || 0), 'Doanh thu']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0284c7" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Quota & Capabilities Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tài nguyên AI Co-Pilot
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Hạn mức tính toán dành riêng cho chấm điểm Writing Task 1/2 và nhận diện phát âm tự động.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Đã sử dụng</span>
                  <span className="text-primary-600 dark:text-primary-400">{tokenUsagePercent}% ({formatCompactNumber(stats.aiTokensUsed)})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
                    style={{ width: `${tokenUsagePercent}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giới hạn hàng tháng:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatCompactNumber(stats.aiTokensQuota)} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bài viết đã chấm điểm:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1,420 bài</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phản hồi trung bình:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">1.8 giây</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button variant="outline" fullWidth size="sm">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Nâng cấp gói Token
            </Button>
          </div>
        </div>

      </div>

      {/* Recent Student Enrollments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Đăng ký học viên gần đây
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Danh sách học viên vừa kích hoạt khóa học thành công trên hệ thống
            </p>
          </div>
          <Link to="/admin/users">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              Xem tất cả người dùng <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-6">Học viên</th>
                <th className="py-3 px-6">Khóa học đăng ký</th>
                <th className="py-3 px-6">Học phí</th>
                <th className="py-3 px-6">Thời gian</th>
                <th className="py-3 px-6 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stats.recentEnrollments.map((enr: any) => (
                <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center">
                        {enr.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{enr.userName}</p>
                        <p className="text-xs text-slate-400">{enr.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{enr.courseTitle}</p>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                    {formatVND(enr.amount)}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    {enr.createdAt}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/20">
                      Hoàn thành
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
