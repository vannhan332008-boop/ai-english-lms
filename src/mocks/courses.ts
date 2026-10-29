export interface CourseItem {
  id: string
  title: string
  code: string
  type: 'IELTS' | 'TOEIC' | 'COMMUNICATION' | 'BUSINESS' | 'KIDS'
  level: string
  targetOutcome: string
  durationWeeks: number
  lessonsCount: number
  priceVND: number
  thumbnail: string
  enrolledStudents: number
  description: string
  popular?: boolean
}

export const mockCourses: CourseItem[] = [
  {
    id: 'c_01',
    title: 'IELTS Intensive Target 7.0 - 7.5+',
    code: 'IELTS-7.0-INT',
    type: 'IELTS',
    level: 'B2 - C1',
    targetOutcome: 'Cam kết đầu ra IELTS 7.0+ Overall (Writing & Speaking 6.5+)',
    durationWeeks: 12,
    lessonsCount: 36,
    priceVND: 11500000,
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    enrolledStudents: 348,
    description: 'Chương trình rèn luyện chuyên sâu 4 kỹ năng với AI chấm bài Writing & Speaking theo barem chuẩn khảo thí IDP & BC.',
    popular: true,
  },
  {
    id: 'c_02',
    title: 'TOEIC 850+ Comprehensive Mastery',
    code: 'TOEIC-850-MAS',
    type: 'TOEIC',
    level: 'Intermediate - Advanced',
    targetOutcome: 'Đạt 850+ điểm TOEIC 2 kỹ năng (Listening & Reading)',
    durationWeeks: 10,
    lessonsCount: 30,
    priceVND: 6800000,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    enrolledStudents: 412,
    description: 'Luyện đề thực chiến với thuật toán phân tích bẫy đề thi ETS, tối ưu phản xạ bắt keyword và quản lý thời gian.',
    popular: true,
  },
  {
    id: 'c_03',
    title: 'Tiếng Anh Giao Tiếp Doanh Nghiệp & Đàm Phán',
    code: 'BIZ-COMM-PRO',
    type: 'BUSINESS',
    level: 'B1 - B2',
    targetOutcome: 'Thuyết trình quốc tế, viết email thương mại và đàm phán hợp đồng',
    durationWeeks: 8,
    lessonsCount: 24,
    priceVND: 8200000,
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    enrolledStudents: 184,
    description: 'Mô phỏng các tình huống kinh doanh thực tế, họp bàn chiến lược với sự hướng dẫn của chuyên gia và AI Roleplay.',
  },
  {
    id: 'c_04',
    title: 'IELTS Foundation & Phát Âm Chuẩn IPA',
    code: 'IELTS-FOUND-55',
    type: 'IELTS',
    level: 'A2 - B1',
    targetOutcome: 'Xây dựng nền tảng ngữ pháp, phát âm và đạt band 5.0 - 5.5',
    durationWeeks: 12,
    lessonsCount: 36,
    priceVND: 7900000,
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
    enrolledStudents: 520,
    description: 'Chuẩn hóa 44 âm IPA cùng hệ thống AI nhận diện sóng âm, phát hiện lỗi sai từng âm tiết unstressed vowels.',
  },
]

