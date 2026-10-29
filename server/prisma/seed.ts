import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 [EnglishFlow Seed] Starting database seeding on Drive D...')

  // Clean existing records in reverse dependency order
  console.log('🧹 Cleaning previous records...')
  await prisma.flashcardReview.deleteMany()
  await prisma.flashcardProgress.deleteMany()
  await prisma.flashcard.deleteMany()
  await prisma.flashcardDeck.deleteMany()
  await prisma.writingEvaluation.deleteMany()
  await prisma.speakingEvaluation.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.question.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.material.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.class.deleteMany()
  await prisma.course.deleteMany()
  await prisma.aIUsageLog.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.subscriptionPlan.deleteMany()

  // Hash common password '123456'
  const passwordHash = await bcrypt.hash('123456', 10)
  console.log('🔑 Common password hashed: 123456')

  // 1. Create Subscription Plans
  console.log('📦 Creating Subscription Plans...')
  const _starterPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Starter Center',
      code: 'STARTER',
      priceMonthly: 4990000,
      aiTokenLimit: 250000,
      maxStudents: 150,
      maxTeachers: 10,
      features: JSON.stringify({
        aiWriting: true,
        aiSpeaking: false,
        customBranding: false,
        analyticsExport: false,
      }),
    },
  })

  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Professional Academy',
      code: 'PROFESSIONAL',
      priceMonthly: 12990000,
      aiTokenLimit: 1200000,
      maxStudents: 600,
      maxTeachers: 35,
      features: JSON.stringify({
        aiWriting: true,
        aiSpeaking: true,
        customBranding: true,
        analyticsExport: true,
        lessonPlanGen: true,
      }),
    },
  })

  // 2. Create Sample Tenant: "EnglishFlow HN"
  console.log('🏢 Creating Sample Tenant: EnglishFlow HN...')
  const tenantHN = await prisma.tenant.create({
    data: {
      name: 'EnglishFlow HN',
      code: 'ef-hn',
      domain: 'hn.englishflow.vn',
      plan: 'PROFESSIONAL',
      aiQuota: 1000000,
      status: 'ACTIVE',
      contactEmail: 'contact.hn@englishflow.vn',
      contactPhone: '02439996666',
      address: 'Toa nha Keangnam Landmark 72, Pham Hung, Nam Tu Liem, Ha Noi',
      city: 'Hanoi',
      aiTokenQuota: proPlan.aiTokenLimit,
      aiTokensUsed: 128500,
      planId: proPlan.id,
    },
  })

  // 3. Create Super Admin (Global - tenantId = null)
  console.log('👑 Creating Super Admin...')
  const _superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@englishflow.vn',
      passwordHash,
      fullName: 'Nguyen Hoang Viet (Super Admin)',
      role: 'SUPER_ADMIN',
      tenantId: null,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '0901234567',
      cefrLevel: 'C2',
      streakDays: 45,
      isActive: true,
    },
  })

  // 4. Create Center Manager for EnglishFlow HN
  console.log('👔 Creating Center Manager for EnglishFlow HN...')
  const _centerManager = await prisma.user.create({
    data: {
      email: 'manager.hn@englishflow.vn',
      passwordHash,
      fullName: 'Pham Minh Tuan (Center Manager)',
      role: 'CENTER_MANAGER',
      tenantId: tenantHN.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      phone: '0912345678',
      cefrLevel: 'C1',
      isActive: true,
    },
  })

  // 5. Create Teacher for EnglishFlow HN
  console.log('👨‍🏫 Creating Teacher for EnglishFlow HN...')
  const teacherDavid = await prisma.user.create({
    data: {
      email: 'teacher.david@englishflow.vn',
      passwordHash,
      fullName: 'David Miller (Senior IELTS Instructor)',
      role: 'TEACHER',
      tenantId: tenantHN.id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      phone: '0934567890',
      cefrLevel: 'C2',
      isActive: true,
    },
  })

  // 6. Create 2 Students for EnglishFlow HN
  console.log('🎓 Creating 2 Students for EnglishFlow HN...')
  const studentNam = await prisma.user.create({
    data: {
      email: 'student.nam@englishflow.vn',
      passwordHash,
      fullName: 'Le Hoang Nam (Student)',
      role: 'STUDENT',
      tenantId: tenantHN.id,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      phone: '0978123456',
      cefrLevel: 'B2',
      streakDays: 14,
      isActive: true,
    },
  })

  const studentMai = await prisma.user.create({
    data: {
      email: 'student.mai@englishflow.vn',
      passwordHash,
      fullName: 'Tran Thi Mai (Student)',
      role: 'STUDENT',
      tenantId: tenantHN.id,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      phone: '0989234567',
      cefrLevel: 'B1',
      streakDays: 8,
      isActive: true,
    },
  })

  // 7. Academic Structure: Course, Class, Enrollments
  console.log('📚 Creating Course, Class, and Enrollments...')
  const courseIelts = await prisma.course.create({
    data: {
      tenantId: tenantHN.id,
      title: 'IELTS Intensive Master 7.5+',
      code: 'IELTS-7.5-INTENSIVE',
      type: 'IELTS',
      description: 'Khóa học luyện thi IELTS chuyên sâu 4 kỹ năng với AI Co-pilot feedback 24/7.',
      targetLevel: 'IELTS 7.0 - 7.5+',
      price: 12500000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
    },
  })

  const classK42 = await prisma.class.create({
    data: {
      tenantId: tenantHN.id,
      courseId: courseIelts.id,
      name: 'IELTS 7.5 - K42 Evening',
      roomNumber: 'Room 402 - Keangnam Lab',
      scheduleInfo: 'Thứ 2 - 4 - 6 (18:30 - 20:30)',
      status: 'ONGOING',
      teacherId: teacherDavid.id,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-15'),
    },
  })

  await prisma.enrollment.createMany({
    data: [
      {
        classId: classK42.id,
        studentId: studentNam.id,
        status: 'ENROLLED',
        attendanceRate: 95.5,
        finalGrade: 7.5,
      },
      {
        classId: classK42.id,
        studentId: studentMai.id,
        status: 'ENROLLED',
        attendanceRate: 91.0,
        finalGrade: 7.0,
      },
    ],
  })

  // 8. Assignments & Submissions (with AI Evaluation)
  console.log('📝 Creating Assignments & Submissions with AI Evaluation...')
  const assignmentWriting = await prisma.assignment.create({
    data: {
      tenantId: tenantHN.id,
      classId: classK42.id,
      title: 'IELTS Academic Writing Task 2 - AI and Future Workforce',
      description: 'Some people argue that artificial intelligence will replace most human jobs, while others believe it will create new opportunities. Discuss both views and give your opinion.',
      type: 'WRITING',
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      maxScore: 9.0,
      rubricConfig: JSON.stringify({
        taskAchievementWeight: 0.25,
        coherenceWeight: 0.25,
        lexicalWeight: 0.25,
        grammarWeight: 0.25,
      }),
    },
  })

  const submissionNam = await prisma.submission.create({
    data: {
      tenantId: tenantHN.id,
      assignmentId: assignmentWriting.id,
      studentId: studentNam.id,
      content: 'In recent decades, artificial intelligence has emerged as one of the most transformative technologies. While critics express valid concerns regarding widespread job obsolescence, I firmly advocate that AI will fundamentally augment human capabilities and foster unprecedented career pathways...',
      score: 7.5,
      aiScore: 7.5,
      aiFeedback: 'Bài viết có luận điểm chặt chẽ, từ vựng học thuật phong phú (obsolescence, augment). Cần chú ý cấu trúc câu phức ở đoạn mở bài.',
      status: 'AI_EVALUATED',
      teacherFeedback: 'Rất ấn tượng với lập luận ở body 2. Thầy nhất trí với điểm 7.5 của AI!',
      evaluatedAt: new Date(),
    },
  })

  await prisma.writingEvaluation.create({
    data: {
      submissionId: submissionNam.id,
      originalText: submissionNam.content || '',
      improvedText: 'In recent decades, artificial intelligence has emerged as a profoundly transformative technology...',
      bandScore: 7.5,
      taskAchievementScore: 7.5,
      coherenceScore: 7.5,
      lexicalScore: 8.0,
      grammarScore: 7.0,
      detailedFeedback: JSON.stringify({
        strengths: ['Từ vựng band 8.0 tự nhiên', 'Bố cục bài viết mạch lạc theo chuẩn Academic IELTS'],
        weaknesses: ['Đoạn mở bài hơi dài, cần đi thẳng vào thesis statement'],
      }),
      errorList: JSON.stringify([
        {
          original: 'regarding widespread job obsolescence',
          suggestion: 'concerning job obsolescence',
          explanation: 'Gợi ý collocation tự nhiên hơn trong ngữ cảnh học thuật.',
        },
      ]),
    },
  })

  // 9. Flashcards & SRS Review History
  console.log('📇 Creating Flashcard Deck, Cards, and SRS Reviews...')
  const flashcardDeck = await prisma.flashcardDeck.create({
    data: {
      tenantId: tenantHN.id,
      courseId: courseIelts.id,
      title: 'IELTS Band 7.5+ High-Impact Collocations',
      topic: 'Technology & Academic Vocabulary',
      level: 'B2-C1',
      totalCards: 5,
    },
  })

  const card1 = await prisma.flashcard.create({
    data: {
      deckId: flashcardDeck.id,
      word: 'Unprecedented',
      phonetic: '/ʌnˈpres.ɪ.den.tɪd/',
      partOfSpeech: 'adjective',
      definition: 'Never having happened or existed in the past.',
      vietnameseMeaning: 'Chưa từng có tiền lệ, vô tiền khoáng hậu.',
      exampleSentence: 'The city is facing an unprecedented surge in digital infrastructure investments.',
    },
  })

  const card2 = await prisma.flashcard.create({
    data: {
      deckId: flashcardDeck.id,
      word: 'Corroborate',
      phonetic: '/kəˈrɒb.ə.reɪt/',
      partOfSpeech: 'verb',
      definition: 'To add proof to an account, statement, or idea with new information.',
      vietnameseMeaning: 'Chứng thực, xác minh, củng cố (chứng cứ).',
      exampleSentence: 'Recent empirical studies corroborate the hypothesis regarding language immersion.',
    },
  })

  // Create SRS reviews for Student Nam using SuperMemo-2 values
  await prisma.flashcardReview.createMany({
    data: [
      {
        cardId: card1.id,
        studentId: studentNam.id,
        easeFactor: 2.6,
        interval: 6,
        repetition: 2,
        quality: 5,
        nextReviewDate: new Date(Date.now() + 6 * 24 * 3600 * 1000),
      },
      {
        cardId: card2.id,
        studentId: studentNam.id,
        easeFactor: 2.5,
        interval: 1,
        repetition: 1,
        quality: 4,
        nextReviewDate: new Date(Date.now() + 1 * 24 * 3600 * 1000),
      },
    ],
  })

  console.log('✅ [EnglishFlow Seed] Seeding completed successfully!')
  console.log('--------------------------------------------------')
  console.log('📋 MOCK ACCOUNTS (Mật khẩu chung: 123456):')
  console.log('👑 Super Admin    : superadmin@englishflow.vn')
  console.log('🏢 Center Manager : manager.hn@englishflow.vn (EnglishFlow HN)')
  console.log('👨‍🏫 Teacher        : teacher.david@englishflow.vn')
  console.log('🎓 Student 1      : student.nam@englishflow.vn')
  console.log('🎓 Student 2      : student.mai@englishflow.vn')
  console.log('--------------------------------------------------')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
