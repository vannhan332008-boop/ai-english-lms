export type UserRoleType = 'SUPER_ADMIN' | 'CENTER_MANAGER' | 'TEACHER' | 'STUDENT'

export interface MockUserDetail {
  id: string
  name: string
  email: string
  role: UserRoleType
  avatar: string
  roleLabel: string
  phone: string
  centerName?: string
  centerCode?: string
  cefrLevel: string
  streakDays: number
  badge: string
  bio: string
}

export const mockPersonas: Record<UserRoleType, MockUserDetail> = {
  SUPER_ADMIN: {
    id: 'usr_super',
    name: 'Nguyễn Hoàng Việt',
    email: 'superadmin@englishflow.vn',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    roleLabel: 'Tổng Giám đốc Nền tảng (Super Admin)',
    phone: '0901 234 567',
    cefrLevel: 'C2 Native-equivalent',
    streakDays: 62,
    badge: 'Platform Architect',
    bio: 'Giám sát toàn bộ 25+ cơ sở trung tâm đối tác, gói cước SaaS và phân bổ hạn mức AI Token toàn quốc.',
  },
  CENTER_MANAGER: {
    id: 'usr_manager',
    name: 'Pham Minh Tuan',
    email: 'manager.hn@englishflow.vn',
    role: 'CENTER_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    roleLabel: 'Giám đốc Cơ sở (Center Manager)',
    phone: '0912 345 678',
    centerName: 'EnglishFlow HN',
    centerCode: 'ef-hn',
    cefrLevel: 'C1 Professional',
    streakDays: 45,
    badge: 'Premier Campus',
    bio: 'Chịu trách nhiệm điều hành cơ sở EnglishFlow Hà Nội, giám sát chất lượng giảng dạy, tỷ lệ chuyên cần và hạn mức AI.',
  },
  TEACHER: {
    id: 'usr_teacher',
    name: 'David Miller',
    email: 'teacher.david@englishflow.vn',
    role: 'TEACHER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    roleLabel: 'Giảng viên Chuyên ngữ (Teacher)',
    phone: '0934 567 890',
    centerName: 'EnglishFlow Landmark Academy',
    centerCode: 'ef-landmark-hcm',
    cefrLevel: 'C2 Native Speaker (IELTS 8.5)',
    streakDays: 28,
    badge: 'Senior IELTS Trainer',
    bio: 'Giảng viên chính phụ trách các lớp IELTS Intensive 7.0+, chuyên gia kiểm duyệt kết quả chấm bài của AI Co-pilot.',
  },
  STUDENT: {
    id: 'usr_student',
    name: 'Lê Hoàng Nam',
    email: 'student.nam@gmail.com',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    roleLabel: 'Học viên (Student)',
    phone: '0978 123 456',
    centerName: 'EnglishFlow Landmark Academy',
    centerCode: 'ef-landmark-hcm',
    cefrLevel: 'B2 Vantage (Target 7.5)',
    streakDays: 14,
    badge: 'Top 5% Chăm chỉ tuần',
    bio: 'Học viên lớp IELTS Master K24. Đã hoàn thành 18 bài luyện viết Task 2 và 24 bài luyện nói phát âm qua AI.',
  },
}

