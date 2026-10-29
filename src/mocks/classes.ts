export interface ClassCohort {
  id: string
  name: string
  courseName: string
  courseCode: string
  teacherName: string
  teacherAvatar: string
  room: string
  schedule: string
  startDate: string
  endDate: string
  enrolledStudents: number
  maxStudents: number
  status: 'ONGOING' | 'UPCOMING' | 'COMPLETED'
  attendanceAverage: number
}

export const mockClasses: ClassCohort[] = [
  {
    id: 'cls_01',
    name: 'IELTS Master K24',
    courseName: 'IELTS Intensive Target 7.0 - 7.5+',
    courseCode: 'IELTS-7.0-INT',
    teacherName: 'David Miller',
    teacherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    room: 'Phòng Lab 302 (Tầng 3)',
    schedule: 'Thứ 2 - 4 - 6 (18:30 - 20:30)',
    startDate: '01/10/2026',
    endDate: '30/12/2026',
    enrolledStudents: 22,
    maxStudents: 24,
    status: 'ONGOING',
    attendanceAverage: 96.5,
  },
  {
    id: 'cls_02',
    name: 'IELTS Master K25',
    courseName: 'IELTS Intensive Target 7.0 - 7.5+',
    courseCode: 'IELTS-7.0-INT',
    teacherName: 'David Miller',
    teacherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    room: 'Phòng Lab 304 (Tầng 3)',
    schedule: 'Thứ 3 - 5 - 7 (18:30 - 20:30)',
    startDate: '15/10/2026',
    endDate: '15/01/2027',
    enrolledStudents: 22,
    maxStudents: 24,
    status: 'ONGOING',
    attendanceAverage: 94.0,
  },
  {
    id: 'cls_03',
    name: 'TOEIC Speed Booster Weekend W04',
    courseName: 'TOEIC 850+ Comprehensive Mastery',
    courseCode: 'TOEIC-850-MAS',
    teacherName: 'Nguyễn Quốc Hưng',
    teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    room: 'Phòng 201 (Tầng 2)',
    schedule: 'Thứ 7 - CN (09:00 - 11:30)',
    startDate: '05/10/2026',
    endDate: '15/12/2026',
    enrolledStudents: 28,
    maxStudents: 30,
    status: 'ONGOING',
    attendanceAverage: 98.2,
  },
  {
    id: 'cls_04',
    name: 'Pronunciation & Accent Training K08',
    courseName: 'IELTS Foundation & Phát Âm Chuẩn IPA',
    courseCode: 'IELTS-FOUND-55',
    teacherName: 'Sarah Jenkins',
    teacherAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    room: 'Phòng Lab Âm thanh 401',
    schedule: 'Thứ 3 - 5 (19:00 - 20:30)',
    startDate: '20/10/2026',
    endDate: '20/12/2026',
    enrolledStudents: 16,
    maxStudents: 18,
    status: 'ONGOING',
    attendanceAverage: 91.5,
  },
  {
    id: 'cls_05',
    name: 'Executive Business English B01',
    courseName: 'Tiếng Anh Giao Tiếp Doanh Nghiệp',
    courseCode: 'BIZ-COMM-PRO',
    teacherName: 'Emma Watson',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    room: 'Executive Lounge VIP',
    schedule: 'Thứ 7 (14:00 - 17:00)',
    startDate: '01/11/2026',
    endDate: '31/12/2026',
    enrolledStudents: 12,
    maxStudents: 15,
    status: 'UPCOMING',
    attendanceAverage: 100,
  },
]
