import type { UserRoleType } from './users'

export interface SidebarNavGroup {
  groupTitle: string
  items: {
    title: string
    href: string
    icon: string
    badge?: string
  }[]
}

export const roleNavigationMap: Record<UserRoleType, SidebarNavGroup[]> = {
  SUPER_ADMIN: [
    {
      groupTitle: 'Hệ Thống SaaS Toàn Quốc',
      items: [
        { title: 'Global Dashboard', href: '/super-admin/dashboard', icon: 'LayoutDashboard' },
        { title: 'Quản Lý Trung Tâm', href: '/super-admin/tenants', icon: 'Building2', badge: '37 Cơ sở' },
        { title: 'Gói Cước & Hóa Đơn', href: '/super-admin/billing', icon: 'CreditCard' },
      ],
    },
    {
      groupTitle: 'Hạ Tầng & AI Engine',
      items: [
        { title: 'Tài Nguyên AI Studio', href: '/super-admin/ai-studio', icon: 'Sparkles', badge: 'Live' },
        { title: 'Cấu Hình Hệ Thống', href: '/super-admin/settings', icon: 'Settings' },
      ],
    },
  ],

  CENTER_MANAGER: [
    {
      groupTitle: 'Vận Hành Cơ Sở',
      items: [
        { title: 'Bảng Điều Hành Cơ Sở', href: '/center-manager/dashboard', icon: 'LayoutDashboard' },
        { title: 'Lớp Học & Khóa Học', href: '/center-manager/classes', icon: 'GraduationCap', badge: '42 Lớp' },
        { title: 'Kho Học Liệu & Đề Thi', href: '/center-manager/curriculum', icon: 'BookOpen' },
      ],
    },
    {
      groupTitle: 'Nhân Sự & Học Viên',
      items: [
        { title: 'Đội Ngũ Giáo Viên', href: '/center-manager/teachers', icon: 'Users2', badge: '45 GV' },
        { title: 'Hồ Sơ Học Viên', href: '/center-manager/students', icon: 'UserCheck', badge: '1.248 HV' },
      ],
    },
    {
      groupTitle: 'Công Nghệ AI',
      items: [
        { title: 'AI Assistant Studio', href: '/center-manager/ai-studio', icon: 'Sparkles', badge: 'v2.4' },
      ],
    },
  ],

  TEACHER: [
    {
      groupTitle: 'Không Gian Giảng Dạy',
      items: [
        { title: 'Bảng Điều Khiển', href: '/teacher/dashboard', icon: 'LayoutDashboard' },
        { title: 'Quản Lý Lớp Học', href: '/teacher/classes', icon: 'GraduationCap', badge: '3 Lớp' },
        { title: 'Giao Bài & Học Liệu', href: '/teacher/assignments', icon: 'BookOpen' },
      ],
    },
    {
      groupTitle: 'Trợ Lý AI Giảng Dạy',
      items: [
        { title: 'AI Grading Co-pilot', href: '/teacher/grading', icon: 'Sparkles', badge: '5 bài mới' },
        { title: 'AI Lesson Planner', href: '/teacher/lesson-planner', icon: 'BotMessageSquare', badge: 'New' },
      ],
    },
  ],

  STUDENT: [
    {
      groupTitle: 'Góc Học Tập Của Tôi',
      items: [
        { title: 'Góc Học Tập & Streak', href: '/student/dashboard', icon: 'LayoutDashboard', badge: '🔥 14 ngày' },
        { title: 'Học Từ Vựng SRS', href: '/student/flashcards', icon: 'CreditCard' },
      ],
    },
    {
      groupTitle: 'Luyện Đề & Khảo Thí AI',
      items: [
        { title: 'Phòng Luyện AI Lab', href: '/student/practice', icon: 'Sparkles', badge: 'Live AI' },
        { title: 'Phòng Thi Thử', href: '/student/mock-test', icon: 'Clock', badge: 'Official' },
      ],
    },
  ],
}
