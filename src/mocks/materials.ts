export interface MaterialItem {
  id: string
  title: string
  category: 'IELTS' | 'TOEIC' | 'GENERAL' | 'GRAMMAR'
  fileType: 'PDF' | 'AUDIO' | 'DOCX' | 'VIDEO'
  sizeMB: number
  downloadsCount: number
  uploadedBy: string
  uploadDate: string
  tags: string[]
}

export interface ExamBankItem {
  id: string
  title: string
  type: 'IELTS_MOCK' | 'TOEIC_MOCK' | 'MINI_QUIZ'
  durationMinutes: number
  totalQuestions: number
  difficulty: 'MEDIUM' | 'HARD' | 'VERY_HARD'
  submissionsCount: number
  avgScore: string
  author: string
}

export const mockMaterials: MaterialItem[] = [
  {
    id: 'mat_01',
    title: 'IELTS Writing Task 2 - Band 8.0 Model Essays & Vocabulary Compilation.pdf',
    category: 'IELTS',
    fileType: 'PDF',
    sizeMB: 8.4,
    downloadsCount: 1420,
    uploadedBy: 'David Miller',
    uploadDate: '12/10/2026',
    tags: ['Writing Task 2', 'Band 8.0', 'Academic Collocations'],
  },
  {
    id: 'mat_02',
    title: '44 Âm IPA Chuẩn Quốc Tế & Audio Nhận Diện Trọng Âm.zip',
    category: 'GENERAL',
    fileType: 'AUDIO',
    sizeMB: 45.2,
    downloadsCount: 890,
    uploadedBy: 'Sarah Jenkins',
    uploadDate: '18/10/2026',
    tags: ['Phát âm IPA', 'Sóng âm', 'Luyện nghe'],
  },
  {
    id: 'mat_03',
    title: 'Bộ Đề ETS TOEIC 2026 Format Mới Nhất (Parts 1 - 7).pdf',
    category: 'TOEIC',
    fileType: 'PDF',
    sizeMB: 14.8,
    downloadsCount: 2150,
    uploadedBy: 'Nguyễn Quốc Hưng',
    uploadDate: '05/10/2026',
    tags: ['TOEIC ETS', 'Full Test', 'Listening & Reading'],
  },
  {
    id: 'mat_04',
    title: 'Mẫu Email Thương Mại & Cấu Trúc Đàm Phán Hợp Đồng Quốc Tế.docx',
    category: 'GENERAL',
    fileType: 'DOCX',
    sizeMB: 3.1,
    downloadsCount: 430,
    uploadedBy: 'Emma Watson',
    uploadDate: '22/10/2026',
    tags: ['Business English', 'Email Writing', 'Negotiation'],
  },
]

export const mockExamBank: ExamBankItem[] = [
  {
    id: 'ex_01',
    title: 'IELTS Academic Full Mock Test #14 (4 Skills)',
    type: 'IELTS_MOCK',
    durationMinutes: 165,
    totalQuestions: 82,
    difficulty: 'HARD',
    submissionsCount: 428,
    avgScore: '6.6 Overall',
    author: 'Hội đồng Học vụ Landmark',
  },
  {
    id: 'ex_02',
    title: 'IELTS Writing Task 2 Real Exam Simulation - Topic AI & Automation',
    type: 'IELTS_MOCK',
    durationMinutes: 40,
    totalQuestions: 1,
    difficulty: 'HARD',
    submissionsCount: 812,
    avgScore: '6.4 Band',
    author: 'AI Question Generator',
  },
  {
    id: 'ex_03',
    title: 'TOEIC 2-Hour Speed Test ETS Realistic Simulation #08',
    type: 'TOEIC_MOCK',
    durationMinutes: 120,
    totalQuestions: 200,
    difficulty: 'MEDIUM',
    submissionsCount: 950,
    avgScore: '745 Điểm',
    author: 'Bộ phận Khảo thí TOEIC',
  },
  {
    id: 'ex_04',
    title: 'Quiz 15 Phút: Bẫy Mạo Từ & Giới Từ Học Thuật C1',
    type: 'MINI_QUIZ',
    durationMinutes: 15,
    totalQuestions: 20,
    difficulty: 'MEDIUM',
    submissionsCount: 1430,
    avgScore: '16.5 / 20',
    author: 'Trần Phương Linh',
  },
]
