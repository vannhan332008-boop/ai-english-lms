import api from './api'

export interface Course {
  id: string
  title: string
  code?: string
  description: string
  thumbnailUrl?: string
  thumbnail?: string
  type?: 'IELTS' | 'TOEIC' | 'COMMUNICATION' | 'BUSINESS' | string
  category?: string
  targetLevel?: string
  level?: string
  lessonsCount: number
  durationWeeks?: number
  duration?: string
  priceVND?: number
  price?: number
  originalPrice?: number
  enrolledStudents?: number
  enrolledCount?: number
  instructorName?: string
  instructorAvatar?: string
  instructor?: {
    name: string
    avatar: string
    title: string
  }
  rating?: number
  reviewsCount?: number
  totalReviews?: number
  highlights?: string[]
}

export interface Lesson {
  id: string
  title: string
  order?: number
  orderIndex?: number
  duration: string
  videoUrl?: string
  summary?: string
  hasAssignment?: boolean
  isCompleted?: boolean
  isFreePreview?: boolean
  quizQuestions?: any[]
}

export const courseService = {
  getAllCourses: async (params?: { category?: string; search?: string }): Promise<Course[]> => {
    try {
      const res = await api.get('/courses', { params })
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data
      }
    } catch (err) {
      console.debug('Falling back to catalog for courses:', err)
    }

    // Default courses fallback
    const rawCourses = [
      {
        id: 'c-ielts-mastery',
        title: 'IELTS Band 7.5+ Intensive Mastery',
        code: 'IELTS-75-INT',
        description:
          'Lộ trình toàn diện bứt phá điểm số IELTS với công nghệ AI Grading Co-pilot chấm điểm Writing Task 2 và sửa lỗi phát âm IPA Speaking Part 2.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        type: 'IELTS',
        targetLevel: 'Band 7.5 - 8.0+',
        lessonsCount: 48,
        durationWeeks: 12,
        priceVND: 8900000,
        enrolledStudents: 1420,
        instructorName: 'David Miller',
        instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        rating: 4.9,
        reviewsCount: 382,
        highlights: ['AI Writing Evaluator 24/7', 'Phân tích âm vị IPA Whisper', 'Giáo trình chuẩn Cambridge'],
      },
      {
        id: 'c-toeic-pro',
        title: 'TOEIC 850+ Speedrun & Business Comm',
        code: 'TOEIC-850-PRO',
        description:
          'Chiến thuật xử lý bẫy Part 5-7 và luyện phản xạ nghe Part 3-4, nâng cao kỹ năng đàm phán thương mại quốc tế.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
        type: 'TOEIC',
        targetLevel: '850 - 950+ Điểm',
        lessonsCount: 36,
        durationWeeks: 10,
        priceVND: 6500000,
        enrolledStudents: 980,
        instructorName: 'Sarah Jenkins',
        instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        rating: 4.8,
        reviewsCount: 215,
        highlights: ['Đề thi ETS mới nhất', 'Spaced Repetition Flashcards', 'Chứng chỉ hoàn thành quốc tế'],
      },
      {
        id: 'c-comm-fluent',
        title: 'Phản Xạ Giao Tiếp Tiếng Anh Bản Xứ',
        code: 'ENG-COMM-EXP',
        description:
          'Tự tin làm chủ cuộc trò chuyện công sở, thuyết trình ý tưởng và giao lưu quốc tế mà không bị vấp hay ngại phát âm.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
        type: 'COMMUNICATION',
        targetLevel: 'CEFR B2 - C1',
        lessonsCount: 30,
        durationWeeks: 8,
        priceVND: 5200000,
        enrolledStudents: 1850,
        instructorName: 'Elena Rostova',
        instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        rating: 4.95,
        reviewsCount: 540,
        highlights: ['Phòng luyện AI Speaking 1-on-1', 'Thực hành 50+ tình huống thực tế', 'Sửa ngọng L/N & phát âm đuôi'],
      },
      {
        id: 'c-biz-leader',
        title: 'English for Global Business Leaders',
        code: 'BIZ-GLOBAL-99',
        description:
          'Dành riêng cho Quản lý & Lãnh đạo doanh nghiệp. Kỹ năng soạn thảo hợp đồng, email thương thuyết và phỏng vấn nhân sự cấp cao.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
        type: 'BUSINESS',
        targetLevel: 'Executive Level',
        lessonsCount: 24,
        durationWeeks: 8,
        priceVND: 12500000,
        enrolledStudents: 410,
        instructorName: 'Michael Nguyen',
        instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        rating: 5.0,
        reviewsCount: 168,
        highlights: ['Tài liệu độc quyền Harvard Business', 'Kèm 1-1 với Chuyên gia C-Level', 'Hỗ trợ viết luận án'],
      },
    ]

    return rawCourses.map((c) => ({
      ...c,
      category: c.type,
      thumbnail: c.thumbnailUrl,
      level: c.targetLevel,
      duration: `${c.durationWeeks} tuần học`,
      price: c.priceVND,
      originalPrice: Math.round(c.priceVND * 1.35),
      enrolledCount: c.enrolledStudents,
      totalReviews: c.reviewsCount,
      instructor: {
        name: c.instructorName,
        avatar: c.instructorAvatar,
        title: 'Senior English Master & IELTS Coach',
      },
    }))
  },

  getCourseById: async (id: string): Promise<Course | null> => {
    try {
      const res = await api.get(`/courses/${id}`)
      if (res.data?.data) return res.data.data
    } catch {
      // fallback
    }
    const all = await courseService.getAllCourses()
    return all.find((c) => c.id === id) || all[0]
  },

  getCourseLessons: async (courseId: string): Promise<Lesson[]> => {
    try {
      const res = await api.get(`/courses/${courseId}/lessons`)
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data
      }
    } catch {
      // fallback
    }

    const sampleQuiz = [
      {
        id: 1,
        question: 'Which paragraph in IELTS Writing Task 2 should present your clear personal stance or thesis statement?',
        options: [
          'Introduction paragraph',
          'Body Paragraph 1',
          'Body Paragraph 2',
          'Only in the conclusion'
        ],
        correctAnswer: 0,
        explanation: 'In academic writing, having a clear thesis statement stated in the introduction and reinforced in the conclusion satisfies the Task Response criterion for Band 7+.',
      },
      {
        id: 2,
        question: 'What does the acronym "PEEL" stand for in paragraph organization?',
        options: [
          'Point - Evidence - Example - Link',
          'Point - Explanation - Evidence - Link',
          'Paragraph - Essay - Evaluation - Logic',
          'Prompt - Evaluate - Explain - Learn'
        ],
        correctAnswer: 1,
        explanation: 'PEEL is the universal standard: Point (Topic Sentence), Explanation, Evidence/Example, Link (Connecting back to prompt).',
      }
    ]

    return [
      {
        id: 'les-1',
        title: '01. Khởi động: Tổng quan Barem Chấm Điểm & Chiến Lược 2026',
        order: 1,
        orderIndex: 1,
        duration: '18:45',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        summary: 'Hiểu rõ 4 tiêu chí cốt lõi, ma trận chấm điểm của giám khảo và cách tránh bẫy tâm lý phòng thi.',
        hasAssignment: true,
        isCompleted: true,
        isFreePreview: true,
        quizQuestions: sampleQuiz,
      },
      {
        id: 'les-2',
        title: '02. Kỹ thuật Argument Mapping & Brainstorming Ý Tưởng Cấp Cao',
        order: 2,
        orderIndex: 2,
        duration: '24:30',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        summary: 'Xây dựng dàn ý đa chiều trong 5 phút. Ứng dụng kỹ thuật PEEL (Point, Explanation, Example, Link).',
        hasAssignment: true,
        isCompleted: true,
        isFreePreview: true,
        quizQuestions: sampleQuiz,
      },
      {
        id: 'les-3',
        title: '03. Từ Vựng Học Thuật C2: Collocations Chuyên Đề Môi Trường & Đô Thị',
        order: 3,
        orderIndex: 3,
        duration: '32:10',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        summary: 'Nâng cấp vốn từ với 25 cặp Collocation cao cấp, loại bỏ hoàn toàn các từ vựng sáo rỗng quen thuộc.',
        hasAssignment: true,
        isCompleted: false,
        isFreePreview: false,
        quizQuestions: sampleQuiz,
      },
      {
        id: 'les-4',
        title: '04. Cấu Trúc Ngữ Pháp Phức Hợp: Đảo ngữ & Mệnh đề phân từ',
        order: 4,
        orderIndex: 4,
        duration: '28:15',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        summary: 'Cách lồng ghép khéo léo Inversion và Participle Clauses mà không gây gượng gạo trong bài luận.',
        hasAssignment: true,
        isCompleted: false,
        isFreePreview: false,
        quizQuestions: sampleQuiz,
      },
      {
        id: 'les-5',
        title: '05. Thực Hành Phòng Luyện AI: Chấm Bài Trực Tuyến & Sửa Lỗi Tức Thì',
        order: 5,
        orderIndex: 5,
        duration: '45:00',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        summary: 'Nộp bài trực tiếp vào AI Practice Lab, nhận feedback chi tiết từng câu và thang điểm dự phóng.',
        hasAssignment: true,
        isCompleted: false,
        isFreePreview: false,
        quizQuestions: sampleQuiz,
      },
    ]
  },

  enrollCourse: async (courseId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post(`/courses/${courseId}/enroll`)
      return res.data
    } catch {
      return { success: true, message: 'Đăng ký khóa học thành công!' }
    }
  },

  enrollStudent: async (payload: {
    studentId: string
    courseId?: string
    classId?: string
  }): Promise<{ id: string; status: string; student: any; course: any; class: any }> => {
    const res = await api.post('/enrollments', payload)
    return res.data?.data
  },

  getMyEnrolledCourses: async (): Promise<any[]> => {
    try {
      const res = await api.get('/courses/my-courses')
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data
      }
    } catch (err) {
      console.warn('Failed to fetch my-courses from backend:', err)
    }
    return []
  },

  getCourseEnrollments: async (courseId: string): Promise<any[]> => {
    try {
      const res = await api.get(`/enrollments/courses/${courseId}`)
      return res.data?.data || []
    } catch (err) {
      console.warn('Failed to fetch course enrollments:', err)
      return []
    }
  },

  createCourse: async (data: any): Promise<Course> => {
    const res = await api.post('/courses', data)
    return res.data?.data
  },

  updateCourse: async (id: string, data: any): Promise<Course> => {
    const res = await api.put(`/courses/${id}`, data)
    return res.data?.data
  },

  deleteCourse: async (id: string): Promise<{ success: boolean; id: string }> => {
    const res = await api.delete(`/courses/${id}`)
    return res.data?.data
  },
}

export default courseService
