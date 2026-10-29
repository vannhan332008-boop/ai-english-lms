export interface StudentRecord {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  enrolledClass: string
  courseType: 'IELTS' | 'TOEIC' | 'COMMUNICATION'
  placementScore: string
  currentBand: string
  targetBand: string
  attendanceRate: number // percent
  submittedAssignments: number
  totalAssignments: number
  streakDays: number
  status: 'EXCELLENT' | 'GOOD' | 'AT_RISK'
  riskReason?: string
  lastActive: string
  speakingScore?: number // thang điểm 9.0 hoặc 100
  writingScore?: number
}

export const mockStudents: StudentRecord[] = [
  {
    id: 'std_01',
    name: 'Nguyễn Văn A',
    email: 'nguyen.vana@gmail.com',
    phone: '0978 123 456',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    enrolledClass: 'IELTS Master K24',
    courseType: 'IELTS',
    placementScore: '6.0 (W: 5.5, S: 6.0)',
    currentBand: '7.0',
    targetBand: '7.5+',
    attendanceRate: 96.5,
    submittedAssignments: 18,
    totalAssignments: 18,
    streakDays: 14,
    status: 'EXCELLENT',
    lastActive: 'Hôm nay lúc 14:20',
    speakingScore: 7.5,
    writingScore: 7.0,
  },
  {
    id: 'std_02',
    name: 'Trần Thị B',
    email: 'tran.thib@gmail.com',
    phone: '0989 234 567',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    enrolledClass: 'TOEIC Speed Booster Weekend W04',
    courseType: 'TOEIC',
    placementScore: '550 điểm',
    currentBand: '780 điểm',
    targetBand: '850+ điểm',
    attendanceRate: 100,
    submittedAssignments: 15,
    totalAssignments: 16,
    streakDays: 7,
    status: 'GOOD',
    lastActive: 'Hôm nay lúc 11:05',
    speakingScore: 8.0,
    writingScore: 7.5,
  },
  {
    id: 'std_03',
    name: 'Đặng Tuấn Anh',
    email: 'tuananh.dang@gmail.com',
    phone: '0903 445 566',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    enrolledClass: 'IELTS Master K24',
    courseType: 'IELTS',
    placementScore: '5.5 (W: 5.0, S: 5.5)',
    currentBand: '5.5',
    targetBand: '6.5+',
    attendanceRate: 68.0,
    submittedAssignments: 6,
    totalAssignments: 18,
    streakDays: 0,
    status: 'AT_RISK',
    riskReason: 'Vắng 3 buổi liên tiếp, nợ 4 bài viết Task 2, điểm AI Speaking: 5.0',
    lastActive: '6 ngày trước',
    speakingScore: 5.0,
    writingScore: 5.0,
  },
  {
    id: 'std_04',
    name: 'Hoàng Phương Thảo',
    email: 'phuongthao.h@gmail.com',
    phone: '0912 889 900',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    enrolledClass: 'IELTS Master K25',
    courseType: 'IELTS',
    placementScore: '6.0 (W: 6.0, S: 6.0)',
    currentBand: '6.5',
    targetBand: '7.0+',
    attendanceRate: 92.0,
    submittedAssignments: 14,
    totalAssignments: 15,
    streakDays: 9,
    status: 'GOOD',
    lastActive: 'Hôm qua lúc 19:40',
    speakingScore: 6.5,
    writingScore: 6.5,
  },
  {
    id: 'std_05',
    name: 'Vũ Đức Minh',
    email: 'minh.vuduc@gmail.com',
    phone: '0938 112 233',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    enrolledClass: 'Executive Business English B01',
    courseType: 'COMMUNICATION',
    placementScore: 'B1 Intermediate',
    currentBand: 'B2 Upper',
    targetBand: 'C1 Fluent',
    attendanceRate: 95.0,
    submittedAssignments: 8,
    totalAssignments: 8,
    streakDays: 12,
    status: 'EXCELLENT',
    lastActive: 'Hôm nay lúc 08:30',
    speakingScore: 7.5,
    writingScore: 7.0,
  },
  {
    id: 'std_06',
    name: 'Bùi Gia Huy',
    email: 'giahuy.bui@gmail.com',
    phone: '0966 778 899',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    enrolledClass: 'Pronunciation & Accent Training K08',
    courseType: 'COMMUNICATION',
    placementScore: 'Pre-IELTS 4.5',
    currentBand: '5.0',
    targetBand: '6.0+',
    attendanceRate: 62.5,
    submittedAssignments: 4,
    totalAssignments: 12,
    streakDays: 0,
    status: 'AT_RISK',
    riskReason: 'Điểm AI Pronunciation thấp (48/100), bỏ 3 bài thu âm IPA tuần này',
    lastActive: '5 ngày trước',
    speakingScore: 4.8,
    writingScore: 4.5,
  },
]
