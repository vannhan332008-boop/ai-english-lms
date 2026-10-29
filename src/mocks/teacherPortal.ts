export interface TodayScheduleItem {
  id: string
  timeRange: string
  className: string
  courseCode: string
  room: string
  topic: string
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING'
  studentCount: number
}

export interface TeacherAnnouncement {
  id: string
  title: string
  content: string
  sender: string
  senderRole: string
  date: string
  type: 'INFO' | 'URGENT' | 'EVENT'
  read: boolean
}

export interface StudentAttendance {
  studentId: string
  studentName: string
  avatar: string
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED'
  note?: string
  speakingAvg: number
  writingAvg: number
  overallBand: number
}

export interface TeacherClassDetail {
  id: string
  name: string
  courseCode: string
  courseName: string
  schedule: string
  room: string
  totalStudents: number
  attendanceRate: number
  avgScore: number
  nextLesson: string
  students: StudentAttendance[]
}

export interface TeacherAssignment {
  id: string
  title: string
  className: string
  classId: string
  type: 'ESSAY_WRITING' | 'SPEAKING_RECORDING' | 'MULTIPLE_CHOICE' | 'FLASHCARD'
  deadline: string
  totalAssigned: number
  submittedCount: number
  gradedCount: number
  status: 'OPEN' | 'CLOSED' | 'GRADING'
}

export interface WritingErrorHighlight {
  id: string
  startChar: number
  endChar: number
  originalText: string
  suggestion: string
  type: 'GRAMMAR' | 'VOCABULARY' | 'PUNCTUATION' | 'COLLOCATION'
  explanationVi: string
}

export interface SpeakingErrorHighlight {
  id: string
  timestamp: string
  word: string
  targetIpa: string
  studentIpa: string
  explanationVi: string
}

export interface GradingSubmission {
  id: string
  studentId: string
  studentName: string
  studentAvatar: string
  className: string
  assignmentTitle: string
  submittedAt: string
  type: 'WRITING' | 'SPEAKING'
  contentPrompt: string
  // Writing specifics
  writingEssayText?: string
  writingErrors?: WritingErrorHighlight[]
  // Speaking specifics
  speakingAudioUrl?: string
  speakingDuration?: string
  speakingTranscript?: string
  speakingErrors?: SpeakingErrorHighlight[]
  // AI Rubric
  aiScores: {
    criterion1Name: string
    criterion1Score: number
    criterion2Name: string
    criterion2Score: number
    criterion3Name: string
    criterion3Score: number
    criterion4Name: string
    criterion4Score: number
    overallBand: number
  }
  aiGeneralFeedbackVi: string
  teacherNote?: string
  status: 'PENDING' | 'APPROVED'
}

export interface LessonPlanResult {
  topic: string
  targetLevel: string
  durationMinutes: number
  learningObjectives: string[]
  timelineStages: {
    time: string
    stageName: string
    activity: string
    teacherAction: string
    studentAction: string
  }[]
  mcqQuestions: {
    id: number
    question: string
    options: string[]
    correctIndex: number
    explanationVi: string
  }[]
  flashcards: {
    id: number
    term: string
    ipa: string
    partOfSpeech: string
    definitionVi: string
    exampleEn: string
  }[]
}

// ---------------- MOCK DATA ----------------

export const mockTodaySchedule: TodayScheduleItem[] = [
  {
    id: 'sch_01',
    timeRange: '08:30 - 10:30',
    className: 'IELTS 6.5 - K42',
    courseCode: 'IELTS-INT-65',
    room: 'Phòng Lab 302 (Tầng 3)',
    topic: 'Writing Task 2: Agree or Disagree Essay Structures & Academic Vocabulary',
    status: 'COMPLETED',
    studentCount: 22,
  },
  {
    id: 'sch_02',
    timeRange: '14:00 - 16:00',
    className: 'Giao tiếp Doanh Nghiệp - B01',
    courseCode: 'BIZ-COMM-PRO',
    room: 'Executive Lounge VIP',
    topic: 'Negotiation Strategies & Cross-cultural Communication Simulation',
    status: 'IN_PROGRESS',
    studentCount: 15,
  },
  {
    id: 'sch_03',
    timeRange: '18:30 - 20:30',
    className: 'IELTS Master K24',
    courseCode: 'IELTS-7.0-INT',
    room: 'Phòng Lab 304 (Tầng 3)',
    topic: 'Speaking Part 3: Abstract Discussions & Fluency Cohesion Drill',
    status: 'UPCOMING',
    studentCount: 24,
  },
]

export const mockTeacherAnnouncements: TeacherAnnouncement[] = [
  {
    id: 'ann_01',
    title: 'Họp sinh hoạt chuyên môn Học vụ Tháng 11/2026',
    content: 'Ban Giám đốc thông báo buổi họp định kỳ rà soát tiến độ lộ trình đầu ra IELTS quý 4 vào lúc 09:00 sáng thứ Sáu tại Hội trường Landmark.',
    sender: 'Thầy Hoàng Minh Tuấn',
    senderRole: 'Giám đốc Đào tạo',
    date: 'Hôm nay lúc 09:15',
    type: 'EVENT',
    read: false,
  },
  {
    id: 'ann_02',
    title: 'Khen thưởng lớp IELTS Master K24 đạt chuyên cần 96.5%',
    content: 'Chúc mừng thầy David Miller và tập thể học viên K24 đã duy trì 100% nộp bài tập AI Speaking tuần qua.',
    sender: 'Ban Quản Lý Cơ Sở',
    senderRole: 'Center Manager',
    date: 'Hôm qua lúc 16:30',
    type: 'INFO',
    read: true,
  },
  {
    id: 'ann_03',
    title: 'Cập nhật AI Speaking IPA Model v2.4',
    content: 'Mô hình nhận diện giọng nói mới đã bổ sung khả năng phát hiện nuốt âm cuối (/s/, /ed/) chuẩn xác hơn 35%.',
    sender: 'Đội ngũ Kỹ thuật SaaS',
    senderRole: 'System Admin',
    date: '28/10/2026',
    type: 'INFO',
    read: true,
  },
]

export const mockTeacherClasses: TeacherClassDetail[] = [
  {
    id: 'tcls_01',
    name: 'IELTS 6.5 - K42',
    courseCode: 'IELTS-INT-65',
    courseName: 'IELTS Intensive 6.5 Accelerator',
    schedule: 'Thứ 2 - 4 - 6 (08:30 - 10:30)',
    room: 'Phòng Lab 302',
    totalStudents: 22,
    attendanceRate: 97.5,
    avgScore: 6.8,
    nextLesson: 'Buổi 16: Writing Task 2 Problem - Solution Essay',
    students: [
      {
        studentId: 'std_01',
        studentName: 'Nguyễn Văn A',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        status: 'PRESENT',
        speakingAvg: 7.0,
        writingAvg: 6.5,
        overallBand: 7.0,
      },
      {
        studentId: 'std_02',
        studentName: 'Trần Thị B',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        status: 'PRESENT',
        speakingAvg: 7.5,
        writingAvg: 7.0,
        overallBand: 7.5,
      },
      {
        studentId: 'std_03',
        studentName: 'Đặng Tuấn Anh',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        status: 'ABSENT',
        note: 'Báo nghỉ ốm, chưa nộp bù bài Task 2',
        speakingAvg: 5.0,
        writingAvg: 5.5,
        overallBand: 5.5,
      },
      {
        studentId: 'std_04',
        studentName: 'Hoàng Phương Thảo',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        status: 'PRESENT',
        speakingAvg: 6.5,
        writingAvg: 6.5,
        overallBand: 6.5,
      },
      {
        studentId: 'std_05',
        studentName: 'Vũ Đức Minh',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        status: 'EXCUSED',
        note: 'Xin phép đi công tác, học qua Zoom Recording',
        speakingAvg: 7.0,
        writingAvg: 7.0,
        overallBand: 7.0,
      },
    ],
  },
  {
    id: 'tcls_02',
    name: 'Giao tiếp Cơ bản - L01',
    courseCode: 'COMM-BEG-01',
    courseName: 'Phản Xạ Giao Tiếp Hàng Ngày Chuẩn Quốc Tế',
    schedule: 'Thứ 3 - 5 (14:00 - 16:00)',
    room: 'Phòng 204 (Tầng 2)',
    totalStudents: 18,
    attendanceRate: 94.2,
    avgScore: 7.2,
    nextLesson: 'Buổi 8: Ordering Food & Restaurant Etiquette',
    students: [
      {
        studentId: 'std_06',
        studentName: 'Bùi Gia Huy',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        status: 'PRESENT',
        speakingAvg: 5.0,
        writingAvg: 5.0,
        overallBand: 5.0,
      },
      {
        studentId: 'std_07',
        studentName: 'Lê Minh Khôi',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        status: 'PRESENT',
        speakingAvg: 6.5,
        writingAvg: 6.0,
        overallBand: 6.5,
      },
    ],
  },
  {
    id: 'tcls_03',
    name: 'IELTS Master K24',
    courseCode: 'IELTS-7.0-INT',
    courseName: 'IELTS Intensive Target 7.0 - 7.5+',
    schedule: 'Thứ 2 - 4 - 6 (18:30 - 20:30)',
    room: 'Phòng Lab 304',
    totalStudents: 24,
    attendanceRate: 96.5,
    avgScore: 7.4,
    nextLesson: 'Buổi 22: Speaking Mock Interview Full 3 Parts',
    students: [
      {
        studentId: 'std_08',
        studentName: 'Phạm Hồng Ánh',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        status: 'PRESENT',
        speakingAvg: 7.5,
        writingAvg: 7.5,
        overallBand: 7.5,
      },
    ],
  },
]

export const mockTeacherAssignments: TeacherAssignment[] = [
  {
    id: 'asg_01',
    title: 'IELTS Writing Task 2: Artificial Intelligence & Future Job Market',
    className: 'IELTS 6.5 - K42',
    classId: 'tcls_01',
    type: 'ESSAY_WRITING',
    deadline: '31/10/2026 23:59',
    totalAssigned: 22,
    submittedCount: 20,
    gradedCount: 15,
    status: 'GRADING',
  },
  {
    id: 'asg_02',
    title: 'Speaking Part 2: Describe an impressive environmental campaign in Vietnam',
    className: 'IELTS 6.5 - K42',
    classId: 'tcls_01',
    type: 'SPEAKING_RECORDING',
    deadline: '02/11/2026 23:59',
    totalAssigned: 22,
    submittedCount: 18,
    gradedCount: 12,
    status: 'GRADING',
  },
  {
    id: 'asg_03',
    title: 'Quiz 20 câu: Phân biệt Present Perfect vs. Past Simple trong báo cáo tài chính',
    className: 'Giao tiếp Doanh Nghiệp - B01',
    classId: 'tcls_02',
    type: 'MULTIPLE_CHOICE',
    deadline: '05/11/2026 18:00',
    totalAssigned: 18,
    submittedCount: 16,
    gradedCount: 16,
    status: 'CLOSED',
  },
  {
    id: 'asg_04',
    title: 'SRS Bộ 40 Từ Vựng Academic Collocations: Technology & Society',
    className: 'IELTS Master K24',
    classId: 'tcls_03',
    type: 'FLASHCARD',
    deadline: '04/11/2026 22:00',
    totalAssigned: 24,
    submittedCount: 22,
    gradedCount: 22,
    status: 'OPEN',
  },
]

export const mockGradingSubmissions: GradingSubmission[] = [
  {
    id: 'sub_01',
    studentId: 'std_01',
    studentName: 'Nguyễn Văn A',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    className: 'IELTS 6.5 - K42',
    assignmentTitle: 'Writing Task 2: Artificial Intelligence & The Future of Education',
    submittedAt: 'Hôm nay lúc 10:45',
    type: 'WRITING',
    contentPrompt:
      'Some people believe that artificial intelligence will entirely replace human teachers in the classroom within the next few decades. To what extent do you agree or disagree?',
    writingEssayText:
      `In the contemporary era, the proliferation of artificial intelligence has revolutionized numerous industries, including pedagogy. It is argued by some individuals that traditional educators will be completely superseded by AI machines in the near future. While I acknowledge the immense benefits of technological advancements, I vehemently disagree with the assertion that human teachers can be rendered obsolete.

To begin with, artificial intelligence undoubtedly possesses distinct advantages in terms of information dissemination and personalized learning pacing. Sophisticated algorithms can analyze a student's weaknesses instantaneously and generate customized drill exercises tailored to their specific needs. For instance, intelligent tutoring systems are capable of grading hundreds of essays in seconds with remarkable accuracy. However, education is not merely a process of transferring empirical knowledge. It fundamentally encompasses character cultivation, emotional mentorship, and moral guidance—qualities that silicon chips are inherently incapable of providing.

Furthermore, the human bond between teachers and learners plays an indispensable role in student psychological development. A compassionate educator can perceive a student's frustration, anxiety, or lack of confidence through subtle facial expressions and tone of voice, thereby offering timely emotional reassurance. AI programs, despite their computational prowess, lack genuine empathy and cannot forge meaningful emotional connections with pupils. Moreover, teachers instill critical life skills such as ethical judgment and teamwork through collaborative classroom interactions that automated software cannot replicate.

In conclusion, although artificial intelligence will undeniably serve as an invaluable teaching co-pilot, it cannot entirely supplant the human teacher. The future classroom will flourish most effectively through a symbiotic synergy between AI tools and dedicated human educators.`,
    writingErrors: [
      {
        id: 'err_01',
        startChar: 412,
        endChar: 437,
        originalText: 'personalized learning pacing',
        suggestion: 'personalized learning pace',
        type: 'VOCABULARY',
        explanationVi: "Danh từ 'pace' bản thân đã mang nghĩa nhịp độ học tập. Không nên dùng dạng V-ing 'pacing' trong ngữ cảnh này.",
      },
      {
        id: 'err_02',
        startChar: 620,
        endChar: 635,
        originalText: 'instantaneously',
        suggestion: 'instantly / in real time',
        type: 'COLLOCATION',
        explanationVi: "Mặc dù đúng ngữ pháp, 'instantly' hoặc 'in real time' tạo cảm giác tự nhiên và mang tính học thuật hiện đại hơn.",
      },
      {
        id: 'err_03',
        startChar: 940,
        endChar: 975,
        originalText: 'character cultivation, emotional mentorship',
        suggestion: 'character formation and emotional mentorship',
        type: 'COLLOCATION',
        explanationVi: "Cặp cụm từ 'character formation' tự nhiên hơn so với 'character cultivation' trong văn cảnh giáo dục.",
      },
      {
        id: 'err_04',
        startChar: 1425,
        endChar: 1445,
        originalText: 'tone of voice',
        suggestion: 'vocal inflection',
        type: 'VOCABULARY',
        explanationVi: "Gợi ý nâng cấp từ vựng Band 8.0: dùng 'vocal inflection' thay cho 'tone of voice' để gây ấn tượng mạnh với giám khảo.",
      },
    ],
    aiScores: {
      criterion1Name: 'Task Achievement',
      criterion1Score: 7.5,
      criterion2Name: 'Coherence & Cohesion',
      criterion2Score: 7.5,
      criterion3Name: 'Lexical Resource',
      criterion3Score: 7.0,
      criterion4Name: 'Grammatical Range & Accuracy',
      criterion4Score: 7.0,
      overallBand: 7.0,
    },
    aiGeneralFeedbackVi:
      'Bài viết đạt chuẩn cấu trúc 4 đoạn chặt chẽ, luận điểm rõ ràng và phản biện thuyết phục. Thí sinh sử dụng linh hoạt các mệnh đề quan hệ và liên từ chỉ sự tương phản. Cần lưu ý một số cụm từ kết hợp (Collocations) để văn phong đạt mức tự nhiên Band 8.0+.',
    teacherNote:
      'Lập luận rất sắc bén! Em đã áp dụng xuất sắc bộ từ vựng Academic pedagogy đã học trên lớp. Hãy tiếp tục phát huy.',
    status: 'PENDING',
  },
  {
    id: 'sub_02',
    studentId: 'std_02',
    studentName: 'Trần Thị B',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    className: 'IELTS 6.5 - K42',
    assignmentTitle: 'Speaking Part 2: Describe an environmental project in Vietnam',
    submittedAt: 'Hôm qua lúc 19:20',
    type: 'SPEAKING',
    contentPrompt:
      'Describe an environmental project or campaign that you know of in your country. You should say: what it is, who organized it, what people did, and explain how you feel about it.',
    speakingAudioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    speakingDuration: '02:04',
    speakingTranscript:
      `Today I would like to talk about the 'Clean Up Vietnam' campaign which was organized last summer in Da Nang city. This environmental initiative was launched by a non-profit youth organization with the primary objective of tackling plastic pollution along the coastline. Hundreds of volunteers, including university students and local residents, gathered early in the morning to collect discarded plastic bottles, food wrappers, and fishing nets. In my opinion, this movement was exceptionally meaningful because it not only restored the pristine beauty of the beaches but also fostered environmental awareness among the younger generation. I think everyone should participate actively in such green projects.`,
    speakingErrors: [
      {
        id: 'spk_err_01',
        timestamp: '00:18',
        word: 'initiative',
        targetIpa: '/ɪˈnɪʃ.ə.tɪv/',
        studentIpa: '/ɪˈnɪʃ.i.eɪ.tɪv/',
        explanationVi: "Học viên phát âm sai trọng âm và nhầm đuôi '-tive' thành âm /eɪ/ thay vì âm schwa nhẹ /ə/.",
      },
      {
        id: 'spk_err_02',
        timestamp: '00:44',
        word: 'coastline',
        targetIpa: '/ˈkəʊst.laɪn/',
        studentIpa: '/ˈkɒs.laɪn/',
        explanationVi: "Bỏ quên nguyên âm đôi /əʊ/ và nuốt âm cuối /t/ trước phụ âm /l/.",
      },
      {
        id: 'spk_err_03',
        timestamp: '01:12',
        word: 'pristine',
        targetIpa: '/ˈprɪs.tiːn/',
        studentIpa: '/ˈpraɪs.taɪn/',
        explanationVi: "Nhầm lẫn phát âm nguyên âm /ɪ/ thành /aɪ/ trong từ 'pristine'.",
      },
      {
        id: 'spk_err_04',
        timestamp: '01:45',
        word: 'think',
        targetIpa: '/θɪŋk/',
        studentIpa: '/sɪŋk/',
        explanationVi: "Lỗi người Việt điển hình: phát âm âm /θ/ vô thanh thành âm xát /s/ ('think' nghe thành 'sink').",
      },
    ],
    aiScores: {
      criterion1Name: 'Fluency & Coherence',
      criterion1Score: 7.5,
      criterion2Name: 'Lexical Resource',
      criterion2Score: 7.0,
      criterion3Name: 'Grammatical Range & Accuracy',
      criterion3Score: 7.0,
      criterion4Name: 'Pronunciation & Intonation',
      criterion4Score: 6.5,
      overallBand: 7.0,
    },
    aiGeneralFeedbackVi:
      'Bài nói trôi chảy, tốc độ đều đặn và không bị ngập ngừng quá lâu. Từ vựng phong phú (tackling plastic pollution, pristine beauty, foster awareness). Tuy nhiên, cần chú ý khẩu hình âm /θ/ răng môi và không nuốt âm cuối /t/, /s/.',
    teacherNote:
      'Phong thái tự tin, ngữ điệu lên xuống tự nhiên. Em nhớ luyện lại 4 từ bị đánh dấu đỏ bằng công cụ sóng âm AI nhé!',
    status: 'PENDING',
  },
]

export const mockSampleLessonPlan: LessonPlanResult = {
  topic: 'Climate Change & Environmental Protection in Southeast Asia',
  targetLevel: 'IELTS Band 6.0 - 7.0 (Intermediate to Upper-Intermediate)',
  durationMinutes: 90,
  learningObjectives: [
    'Nắm vững 15 thuật ngữ học thuật chủ đề Môi trường & Biến đổi khí hậu.',
    'Sử dụng cấu trúc câu điều kiện loại 2 & 3 và đảo ngữ (Inversion) để thảo luận hậu quả giả định.',
    'Luyện tập phát âm chuẩn các âm đuôi phức hợp (/st/, /kts/, /ndz/) trong từ vựng chuyên ngành.',
    'Hoàn thiện dàn bài IELTS Speaking Part 3 và Writing Task 2 trong thời gian quy định.',
  ],
  timelineStages: [
    {
      time: '00:00 - 00:15 (15p)',
      stageName: 'Warm-up & Lead-in',
      activity: 'Video Hook: Sông Mekong mùa khô hạn & Câu hỏi kích hoạt tư duy',
      teacherAction: 'Trình chiếu clip ngắn 2 phút, yêu cầu học viên brainstorm 5 từ khóa miêu tả tác động môi trường.',
      studentAction: 'Thảo luận cặp trong 3 phút, ghi từ khóa lên bảng tương tác Padlet / whiteboard.',
    },
    {
      time: '00:15 - 00:40 (25p)',
      stageName: 'Target Language Presentation',
      activity: 'Học từ vựng Collocations & Ngữ pháp Inversion for Emphasis',
      teacherAction: 'Giảng nghĩa qua ngữ cảnh thực tế, hướng dẫn phát âm IPA các từ: ecological imbalance, carbon footprint, mitigation.',
      studentAction: 'Luyện đọc theo nhóm, hoàn thành bài tập điền từ ngữ cảnh vào worksheet.',
    },
    {
      time: '00:40 - 01:10 (30p)',
      stageName: 'Controlled & Free Practice',
      activity: 'Mini Debate: Phát triển kinh tế vs. Bảo vệ rừng nguyên sinh',
      teacherAction: 'Chia lớp thành 2 phe (Pro-Economy vs. Pro-Environment), giám sát và ghi nhận lỗi sai phát âm.',
      studentAction: 'Mỗi nhóm có 5 phút chuẩn bị lập luận, áp dụng cấu trúc Inversion (e.g. "Not only does deforestation cause...").',
    },
    {
      time: '01:10 - 01:25 (15p)',
      stageName: 'Production & Writing Drill',
      activity: 'Viết đoạn thân bài IELTS Writing Task 2 (120 từ)',
      teacherAction: 'Cung cấp prompt: "Governments should impose heavy taxes on polluting companies". Đặt đồng hồ đếm ngược.',
      studentAction: 'Học viên viết trực tiếp trên EnglishFlow LMS để AI Co-pilot phân tích ngữ pháp thời gian thực.',
    },
    {
      time: '01:25 - 01:30 (5p)',
      stageName: 'Wrap-up & Homework Assign',
      activity: 'Tổng kết bài học & Giao bài tập về nhà trên Portal',
      teacherAction: 'Nhắc nhở học viên làm 10 câu trắc nghiệm và ôn tập bộ Flashcard 15 từ trên app.',
      studentAction: 'Quét mã QR nhận bài tập trên thiết bị cá nhân.',
    },
  ],
  mcqQuestions: [
    {
      id: 1,
      question: "The massive release of greenhouse gases has accelerated the rate of global warming, causing __________ consequences for coastal communities.",
      options: ['disastrous', 'beneficial', 'indifferent', 'negligible'],
      correctIndex: 0,
      explanationVi: "'Disastrous' (thảm khốc) là tính từ phù hợp nhất về ngữ nghĩa diễn tả hậu quả nặng nề của việc giải phóng khí nhà kính.",
    },
    {
      id: 2,
      question: "Not only __________ biodiversity, but it also disrupts the livelihood of local indigenous people.",
      options: ['deforestation does destroy', 'does deforestation destroy', 'deforestation destroys', 'is destroying deforestation'],
      correctIndex: 1,
      explanationVi: "Cấu trúc đảo ngữ với 'Not only': Not only + Trợ động từ (does) + Chủ ngữ (deforestation) + Động từ nguyên thể (destroy).",
    },
    {
      id: 3,
      question: "Governments should encourage citizens to reduce their carbon __________ by utilizing public mass transit.",
      options: ['fingerprint', 'footstep', 'footprint', 'handprint'],
      correctIndex: 2,
      explanationVi: "Collocation chuẩn: 'carbon footprint' (vết carbon / lượng khí thải carbon cá nhân).",
    },
    {
      id: 4,
      question: "Many endangered marine species are on the __________ of extinction due to ocean acidification.",
      options: ['verge', 'border', 'edge', 'margin'],
      correctIndex: 0,
      explanationVi: "Idiomatic phrase: 'on the verge of extinction' (trên bờ vực tuyệt chủng).",
    },
    {
      id: 5,
      question: "Which of the following words has the stress on the THIRD syllable?",
      options: ['Environment', 'Ecological', 'Conservation', 'Contamination'],
      correctIndex: 1,
      explanationVi: "'Ecological' có trọng âm rơi vào âm tiết thứ 3: /ˌiː.kəˈlɒdʒ.ɪ.kəl/.",
    },
  ],
  flashcards: [
    {
      id: 1,
      term: 'Biodiversity',
      ipa: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
      partOfSpeech: 'noun',
      definitionVi: 'Sự đa dạng sinh học trong một hệ sinh thái',
      exampleEn: 'The tropical rainforest is renowned for its extraordinarily rich biodiversity.',
    },
    {
      id: 2,
      term: 'Ecological imbalance',
      ipa: '/ˌiː.kəˈlɒdʒ.ɪ.kəl ɪmˈbæl.əns/',
      partOfSpeech: 'noun phrase',
      definitionVi: 'Mất cân bằng sinh thái',
      exampleEn: 'Overfishing has led to a catastrophic ecological imbalance in the local marine sanctuary.',
    },
    {
      id: 3,
      term: 'Mitigate',
      ipa: '/ˈmɪt.ɪ.ɡeɪt/',
      partOfSpeech: 'verb',
      definitionVi: 'Giảm thiểu, làm dịu bớt mức độ nghiêm trọng',
      exampleEn: 'Subsidizing electric vehicles is one effective way to mitigate air pollution in megacities.',
    },
    {
      id: 4,
      term: 'Carbon footprint',
      ipa: '/ˌkɑː.bən ˈfʊt.prɪnt/',
      partOfSpeech: 'noun phrase',
      definitionVi: 'Dấu chân carbon (lượng phát thải CO2 của cá nhân/tổ chức)',
      exampleEn: 'Consumers are increasingly striving to minimize their individual carbon footprint.',
    },
    {
      id: 5,
      term: 'Pristine',
      ipa: '/ˈprɪs.tiːn/',
      partOfSpeech: 'adjective',
      definitionVi: 'Nguyên sơ, thuần khiết, chưa bị tàn phá',
      exampleEn: 'The island has managed to preserve its pristine coral reefs and turquoise waters.',
    },
  ],
}

