export interface TeacherRecord {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  qualification: string
  nativeSpeaker: boolean
  teachingSpecialty: 'IELTS' | 'TOEIC' | 'COMMUNICATION' | 'KIDS'
  assignedClasses: string[]
  activeStudents: number
  hoursPerWeek: number
  rating: number
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION'
  joinedDate: string
}

export const mockTeachers: TeacherRecord[] = [
  {
    id: 'tch_01',
    name: 'David Miller',
    email: 'david.miller@englishflow.vn',
    phone: '0934 567 890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    qualification: 'IELTS 8.5 Overall (C2 Native Speaker, CELTA)',
    nativeSpeaker: true,
    teachingSpecialty: 'IELTS',
    assignedClasses: ['IELTS Master K24', 'IELTS Master K25'],
    activeStudents: 44,
    hoursPerWeek: 24,
    rating: 4.95,
    status: 'ACTIVE',
    joinedDate: '2024-03-15',
  },
  {
    id: 'tch_02',
    name: 'Trần Phương Linh',
    email: 'linh.tran@englishflow.vn',
    phone: '0945 678 901',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    qualification: 'IELTS 8.0, Thạc sĩ TESOL ĐH Nottingham',
    nativeSpeaker: false,
    teachingSpecialty: 'IELTS',
    assignedClasses: ['IELTS Focus Weekend W02', 'Writing Clinic Task 2'],
    activeStudents: 38,
    hoursPerWeek: 20,
    rating: 4.88,
    status: 'ACTIVE',
    joinedDate: '2024-08-01',
  },
  {
    id: 'tch_03',
    name: 'Emma Watson',
    email: 'emma.watson@englishflow.vn',
    phone: '0901 112 223',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    qualification: 'British Council Certified Examiner, DELTA',
    nativeSpeaker: true,
    teachingSpecialty: 'COMMUNICATION',
    assignedClasses: ['Executive Business English B01'],
    activeStudents: 18,
    hoursPerWeek: 16,
    rating: 4.98,
    status: 'ACTIVE',
    joinedDate: '2025-01-10',
  },
  {
    id: 'tch_04',
    name: 'Nguyễn Quốc Hưng',
    email: 'hung.nguyen@englishflow.vn',
    phone: '0918 223 344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    qualification: 'TOEIC 990/990, Cử nhân Sư phạm Tiếng Anh ULIS',
    nativeSpeaker: false,
    teachingSpecialty: 'TOEIC',
    assignedClasses: ['TOEIC Speed Booster Weekend W04', 'TOEIC 750+ Evening'],
    activeStudents: 52,
    hoursPerWeek: 22,
    rating: 4.82,
    status: 'ACTIVE',
    joinedDate: '2025-04-12',
  },
  {
    id: 'tch_05',
    name: 'Sarah Jenkins',
    email: 'sarah.j@englishflow.vn',
    phone: '0988 776 655',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    qualification: 'IELTS 8.5, Chuyên gia Âm ngữ trị liệu & IPA',
    nativeSpeaker: true,
    teachingSpecialty: 'IELTS',
    assignedClasses: ['Pronunciation & Accent Training K08'],
    activeStudents: 26,
    hoursPerWeek: 18,
    rating: 4.91,
    status: 'ACTIVE',
    joinedDate: '2025-09-01',
  },
]
