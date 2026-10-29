export interface DailyTask {
  id: string
  title: string
  category: 'VOCABULARY' | 'WRITING' | 'SPEAKING' | 'LISTENING'
  xpReward: number
  estimatedMinutes: number
  completed: boolean
}

export interface InProgressCourse {
  id: string
  title: string
  code: string
  thumbnail: string
  progressPercent: number
  completedLessons: number
  totalLessons: number
  nextLessonTitle: string
  instructor: string
}

export interface StudentSkillScore {
  skill: string
  score: number
  target: number
}

export interface WeeklyScoreProgress {
  week: string
  bandScore: number
  targetBand: number
}

export interface SRSFlashcard {
  id: number
  term: string
  ipa: string
  partOfSpeech: string
  definitionVi: string
  exampleEn: string
  exampleVi: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export interface MockTestQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  paragraphRef: string
}

export interface MockTestPassage {
  title: string
  timeLimitMinutes: number
  paragraphs: {
    label: string
    content: string
  }[]
  questions: MockTestQuestion[]
}

// ---------------- MOCK DATA ----------------

export const mockDailyTasks: DailyTask[] = [
  {
    id: 'dt_01',
    title: 'Ôn tập 15 từ vựng Chủ đề Môi trường (SRS SM-2)',
    category: 'VOCABULARY',
    xpReward: 150,
    estimatedMinutes: 10,
    completed: true,
  },
  {
    id: 'dt_02',
    title: 'Luyện 1 bài Writing Task 2: Artificial Intelligence & Jobs',
    category: 'WRITING',
    xpReward: 300,
    estimatedMinutes: 40,
    completed: true,
  },
  {
    id: 'dt_03',
    title: 'Luyện phát âm 5 câu mẫu IPA âm /θ/ trong Phòng Speaking',
    category: 'SPEAKING',
    xpReward: 200,
    estimatedMinutes: 15,
    completed: false,
  },
  {
    id: 'dt_04',
    title: 'Nghe 1 đoạn hội thoại TED-Ed IELTS Listening Section 3',
    category: 'LISTENING',
    xpReward: 150,
    estimatedMinutes: 12,
    completed: false,
  },
]

export const mockInProgressCourses: InProgressCourse[] = [
  {
    id: 'ipc_01',
    title: 'IELTS Intensive Target 7.0 - 7.5+ Masterclass',
    code: 'IELTS-7.0-INT',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    progressPercent: 68,
    completedLessons: 24,
    totalLessons: 36,
    nextLessonTitle: 'Buổi 25: Problem & Solution Essay Masterclass',
    instructor: 'David Miller (IELTS 8.5)',
  },
  {
    id: 'ipc_02',
    title: 'Tiếng Anh Giao Tiếp Doanh Nghiệp & Đàm Phán',
    code: 'BIZ-COMM-PRO',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    progressPercent: 42,
    completedLessons: 10,
    totalLessons: 24,
    nextLessonTitle: 'Buổi 11: Cross-cultural Negotiations & Email Etiquette',
    instructor: 'Emma Watson (Business Spec)',
  },
]

export const mockStudentSkillRadar: StudentSkillScore[] = [
  { skill: 'Listening', score: 7.5, target: 8.0 },
  { skill: 'Reading', score: 7.5, target: 8.0 },
  { skill: 'Writing', score: 6.5, target: 7.5 },
  { skill: 'Speaking', score: 6.5, target: 7.5 },
  { skill: 'Vocabulary', score: 7.0, target: 8.0 },
  { skill: 'Grammar', score: 7.0, target: 8.0 },
]

export const mockWeeklyProgress: WeeklyScoreProgress[] = [
  { week: 'Tuần 1', bandScore: 5.5, targetBand: 7.5 },
  { week: 'Tuần 2', bandScore: 5.8, targetBand: 7.5 },
  { week: 'Tuần 3', bandScore: 6.0, targetBand: 7.5 },
  { week: 'Tuần 4', bandScore: 6.2, targetBand: 7.5 },
  { week: 'Tuần 5', bandScore: 6.5, targetBand: 7.5 },
  { week: 'Tuần 6', bandScore: 6.6, targetBand: 7.5 },
  { week: 'Tuần 7', bandScore: 6.8, targetBand: 7.5 },
  { week: 'Tuần 8', bandScore: 7.0, targetBand: 7.5 },
]

export const mockFlashcardsList: SRSFlashcard[] = [
  {
    id: 1,
    term: 'Biodiversity',
    ipa: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/',
    partOfSpeech: 'noun',
    definitionVi: 'Sự đa dạng sinh học (tổng hợp các loài sinh vật trong một hệ sinh thái)',
    exampleEn: 'The Mekong River Delta boasts an extraordinarily rich biodiversity that sustains millions of livelihoods.',
    exampleVi: 'Đồng bằng sông Cửu Long sở hữu sự đa dạng sinh học phong phú nuôi sống hàng triệu người dân.',
    difficulty: 'MEDIUM',
  },
  {
    id: 2,
    term: 'Ecological imbalance',
    ipa: '/ˌiː.kəˈlɒdʒ.ɪ.kəl ɪmˈbæl.əns/',
    partOfSpeech: 'noun phrase',
    definitionVi: 'Mất cân bằng sinh thái',
    exampleEn: 'Excessive deforestation directly triggers severe ecological imbalance and soil erosion.',
    exampleVi: 'Nạn phá rừng quá mức gây ra trực tiếp sự mất cân bằng sinh thái nghiêm trọng và xói mòn đất.',
    difficulty: 'HARD',
  },
  {
    id: 3,
    term: 'Mitigate',
    ipa: '/ˈmɪt.ɪ.ɡeɪt/',
    partOfSpeech: 'verb',
    definitionVi: 'Giảm nhẹ, xoa dịu, hạn chế mức độ tác hại',
    exampleEn: 'Switching to renewable energy is paramount to mitigate the catastrophic impacts of climate change.',
    exampleVi: 'Chuyển đổi sang năng lượng tái tạo là tối quan trọng nhằm giảm thiểu các tác động thảm khốc của biến đổi khí hậu.',
    difficulty: 'EASY',
  },
  {
    id: 4,
    term: 'Carbon footprint',
    ipa: '/ˌkɑː.bən ˈfʊt.prɪnt/',
    partOfSpeech: 'noun phrase',
    definitionVi: 'Dấu chân carbon (tổng lượng khí thải CO2 do cá nhân hoặc tổ chức tạo ra)',
    exampleEn: 'Individuals can drastically shrink their carbon footprint by commuting via electric public buses.',
    exampleVi: 'Các cá nhân có thể thu nhỏ đáng kể dấu chân carbon bằng cách di chuyển bằng xe buýt điện công cộng.',
    difficulty: 'EASY',
  },
  {
    id: 5,
    term: 'Pristine',
    ipa: '/ˈprɪs.tiːn/',
    partOfSpeech: 'adjective',
    definitionVi: 'Nguyên sơ, thuần khiết, chưa bị bàn tay con người làm hoen ố',
    exampleEn: 'Phu Quoc island used to be renowned for its pristine beaches and crystal-clear emerald water.',
    exampleVi: 'Đảo Phú Quốc từng nổi tiếng với những bãi biển nguyên sơ và làn nước màu ngọc bích trong vắt.',
    difficulty: 'HARD',
  },
  {
    id: 6,
    term: 'Unprecedented',
    ipa: '/ʌnˈpres.ɪ.den.tɪd/',
    partOfSpeech: 'adjective',
    definitionVi: 'Chưa từng có tiền lệ, chưa từng xảy ra trong lịch sử',
    exampleEn: 'The rise of generative artificial intelligence has brought unprecedented transformations to educational methodologies.',
    exampleVi: 'Sự phát triển của AI tạo sinh đã đem lại những biến đổi chưa từng có tiền lệ cho các phương pháp giáo dục.',
    difficulty: 'MEDIUM',
  },
]

export const mockReadingTestPassage: MockTestPassage = {
  title: 'The Evolution of Urban Mass Transit in Asian Megacities',
  timeLimitMinutes: 60,
  paragraphs: [
    {
      label: 'A',
      content:
        'In the dawn of the twenty-first century, rapid urbanization across Southeast Asian metropolises like Ho Chi Minh City, Bangkok, and Jakarta presented an existential crisis to urban planners. As rural populations migrated en masse toward economic hubs, the explosion of private personal vehicles—principally gasoline-powered motorbikes and subcompact automobiles—choked arterial roads. The ensuing gridlock not only paralyzed logistics, exacting billions of dollars in lost productivity annually, but also degraded ambient air quality to perilous levels, prompting severe public health warnings.',
    },
    {
      label: 'B',
      content:
        'To counteract this mounting infrastructural paralysis, municipal administrations embarked upon grandiose grade-separated mass rapid transit (MRT) endeavors. Heavy rail subterranean subways and elevated skytrains were heralded as the panacea for chronic congestion. By segregating high-capacity commuter carriages from ground-level vehicular chaos, urban authorities envisioned transporting upward of 40,000 passengers per hour per direction, drastically cutting commute times and curbing carbon emissions.',
    },
    {
      label: 'C',
      content:
        'However, the implementation of these mega-infrastructure projects was perpetually fraught with labyrinthine bureaucratic impediments and astronomical budget overruns. Land acquisition disputes in densely populated historical corridors delayed construction schedules by upwards of a decade. Furthermore, financing models reliant on overseas development assistance (ODA) loans introduced fiscal exposure to currency fluctuations, while technology transfers between foreign civil engineering contractors and domestic entities proved arduous.',
    },
    {
      label: 'D',
      content:
        'Notwithstanding these tribulations, the inaugural operations of urban transit networks have unequivocally demonstrated profound socio-economic dividends. High-density commercial and residential complexes have mushroomed along transit corridors—an urban planning paradigm known as Transit-Oriented Development (TOD). When seamlessly integrated with feeder bus feeder routes, bicycle-sharing stations, and micro-mobility hubs, metro lines have successfully induced a cognitive shift among younger commuters, who increasingly embrace public mass transit as a progressive, sustainable lifestyle choice.',
    },
  ],
  questions: [
    {
      id: 1,
      question: 'According to Paragraph A, what was the primary cause of urban traffic paralysis in Southeast Asian cities?',
      options: [
        'Frequent geological disruptions to arterial highways',
        'The proliferation of private motorbikes and subcompact cars following rural migration',
        'Excessive reliance on heavy rail freight networks',
        'Strict governmental restrictions on commercial logistics',
      ],
      correctAnswer: 1,
      paragraphRef: 'Paragraph A',
    },
    {
      id: 2,
      question: "The word 'panacea' in Paragraph B is closest in meaning to:",
      options: [
        'Universal remedy / complete solution',
        'Temporary financial subsidy',
        'Controversial technological experiment',
        'Minor administrative adjustment',
      ],
      correctAnswer: 0,
      paragraphRef: 'Paragraph B',
    },
    {
      id: 3,
      question: 'Which of the following was NOT mentioned in Paragraph C as an obstacle to MRT construction?',
      options: [
        'Protracted land acquisition disputes in crowded historical districts',
        'Fiscal vulnerabilities associated with foreign currency loan fluctuations',
        'Widespread industrial strikes among domestic transit operating staff',
        'Complex coordination and technology transfers with foreign engineering firms',
      ],
      correctAnswer: 2,
      paragraphRef: 'Paragraph C',
    },
    {
      id: 4,
      question: "What urban planning phenomenon is described in Paragraph D as 'Transit-Oriented Development (TOD)'?",
      options: [
        'Constructing extensive parking lots exclusively for diesel private cars',
        'The burgeoning of commercial and residential hubs concentrated along mass transit lines',
        'Banning all pedestrian corridors within a five-kilometer radius of rail stations',
        'Replacing underground subways entirely with decentralized micro-bicycles',
      ],
      correctAnswer: 1,
      paragraphRef: 'Paragraph D',
    },
  ],
}

