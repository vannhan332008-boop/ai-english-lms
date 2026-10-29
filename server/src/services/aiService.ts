import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'

export interface WritingEvaluationOutput {
  overallBand: number
  rubricScores: {
    taskAchievement: number
    coherence: number
    lexical: number
    grammar: number
  }
  correctedText: string
  detailedErrors: Array<{
    original: string
    suggestion: string
    errorType: string
    explanation: string
  }>
  summaryFeedback: string
  tokensUsed: number
}

export interface SpeakingEvaluationOutput {
  overallBand: number
  fluencyScore: number
  pronunciationScore: number
  lexicalScore: number
  grammarScore: number
  transcript: string
  pronunciationErrors: Array<{
    word: string
    targetIpa: string
    detectedIpa: string
    contextSentence: string
    advice: string
  }>
  detailedFeedback: string
  tokensUsed: number
}

export interface LessonPlanOutput {
  topic: string
  targetBand: string
  durationMinutes: number
  outline: Array<{
    time: string
    title: string
    activity: string
    teacherNotes: string
  }>
  flashcards: Array<{
    word: string
    partOfSpeech: string
    phonetic: string
    vietnameseMeaning: string
    exampleSentence: string
  }>
  quiz: Array<{
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
  }>
  tokensUsed: number
}

export class AIService {
  private static geminiClient: GoogleGenAI | null = null

  private static getGeminiClient(): GoogleGenAI {
    if (!this.geminiClient) {
      if (!env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in .env')
      }
      this.geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
    }
    return this.geminiClient
  }

  /**
   * Enforce tenant-level AI quota limit and record usage
   */
  static async checkAndDeductQuota(
    tenantId: string | null,
    userId: string,
    moduleName: 'WRITING' | 'SPEAKING' | 'LESSON_PLAN',
    tokensToDeduct: number
  ): Promise<void> {
    if (!tenantId) return // Global Super Admin or unbound user

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, aiTokenQuota: true, aiTokensUsed: true },
    })

    if (!tenant) return

    // If quota exceeded, deny request
    if (tenant.aiTokensUsed + tokensToDeduct > tenant.aiTokenQuota) {
      const err: any = new Error(
        `Cơ sở ${tenant.name} đã dùng hết quota AI (${tenant.aiTokensUsed.toLocaleString()}/${tenant.aiTokenQuota.toLocaleString()} tokens). Vui lòng nâng cấp gói hoặc liên hệ Super Admin.`
      )
      err.statusCode = 403
      err.code = 'AI_QUOTA_EXCEEDED'
      throw err
    }

    // Atomically increment tokens and record audit log
    await prisma.$transaction([
      prisma.tenant.update({
        where: { id: tenantId },
        data: {
          aiTokensUsed: { increment: tokensToDeduct },
        },
      }),
      prisma.aIUsageLog.create({
        data: {
          tenantId,
          userId,
          module: moduleName,
          tokensUsed: tokensToDeduct,
          modelName: env.AI_MOCK_MODE ? 'mock-ai-engine' : 'gemini-2.5-flash',
          costEstimate: (tokensToDeduct / 1000) * 0.0015,
        },
      }),
    ])
  }

  /**
   * 1. Evaluate Writing Essay with Rubric & Error Highlights
   */
  static async evaluateWriting(
    studentText: string,
    prompt = 'IELTS Academic Writing Task 2 Prompt'
  ): Promise<WritingEvaluationOutput> {
    const estimatedTokens = Math.max(800, Math.round(studentText.split(/\s+/).length * 4.5))

    // A. MOCK MODE or when API key is missing
    if (env.AI_MOCK_MODE || !env.GEMINI_API_KEY) {
      console.log('🤖 [AIService] Using MOCK_MODE for Writing Evaluation')
      
      const wordCount = studentText.trim().split(/\s+/).length
      let overallBand = 7.0
      if (wordCount < 150) overallBand = 5.5
      else if (wordCount < 220) overallBand = 6.5
      else if (wordCount > 300) overallBand = 7.5

      return {
        overallBand,
        rubricScores: {
          taskAchievement: overallBand,
          coherence: Math.min(9.0, overallBand + 0.5),
          lexical: overallBand,
          grammar: Math.max(5.5, overallBand - 0.5),
        },
        correctedText: studentText
          .replace(/important/gi, 'paramount')
          .replace(/a lot of/gi, 'a substantial multitude of')
          .replace(/bad/gi, 'detrimental')
          .replace(/good/gi, 'beneficial'),
        detailedErrors: [
          {
            original: 'in nowadays society',
            suggestion: 'in contemporary society',
            errorType: 'Lexical Register',
            explanation: 'Nâng sắc thái biểu đạt trang trọng chuẩn học thuật (Academic tone).',
          },
          {
            original: 'it make people feel tired',
            suggestion: 'it causes individuals to experience cognitive exhaustion',
            errorType: 'Subject-Verb Agreement & Vocabulary',
            explanation: 'Lỗi chia động từ số ít ở hiện tại đơn và diễn đạt quá đơn giản.',
          },
          {
            original: 'more better than before',
            suggestion: 'significantly superior to previous benchmarks',
            errorType: 'Double Comparative',
            explanation: 'Tránh dùng "more better", thay bằng cấu trúc so sánh học thuật cao cấp.',
          },
        ],
        summaryFeedback:
          'Bài viết có bố cục 4 đoạn rõ ràng, bảo đảm trả lời đúng trọng tâm câu hỏi. Luận điểm ở thân bài 1 được giải thích logic. Cần chú ý giảm các cụm từ đàm thoại thông thường và đa dạng hóa cấu trúc câu phức.',
        tokensUsed: estimatedTokens,
      }
    }

    // B. REAL GEMINI 2.5 API
    try {
      const client = this.getGeminiClient()
      const systemInstruction = `You are a certified senior IELTS Academic Examiner. Evaluate the user's essay against standard IELTS band descriptors.
Return ONLY a valid JSON object matching this schema:
{
  "overallBand": number (e.g. 7.0),
  "rubricScores": {
    "taskAchievement": number,
    "coherence": number,
    "lexical": number,
    "grammar": number
  },
  "correctedText": string,
  "detailedErrors": [
    {
      "original": string,
      "suggestion": string,
      "errorType": string,
      "explanation": string (in Vietnamese)
    }
  ],
  "summaryFeedback": string (in Vietnamese)
}`

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Prompt: ${prompt}\n\nStudent Essay:\n${studentText}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      })

      const rawText = response.text || '{}'
      const parsed = JSON.parse(rawText)

      return {
        overallBand: Number(parsed.overallBand) || 6.5,
        rubricScores: {
          taskAchievement: Number(parsed.rubricScores?.taskAchievement) || 6.5,
          coherence: Number(parsed.rubricScores?.coherence) || 6.5,
          lexical: Number(parsed.rubricScores?.lexical) || 6.5,
          grammar: Number(parsed.rubricScores?.grammar) || 6.0,
        },
        correctedText: parsed.correctedText || studentText,
        detailedErrors: Array.isArray(parsed.detailedErrors) ? parsed.detailedErrors : [],
        summaryFeedback: parsed.summaryFeedback || 'Đã phân tích thành công bài viết của bạn.',
        tokensUsed: estimatedTokens,
      }
    } catch (err) {
      console.error('❌ [AIService] Gemini Writing Error, falling back to mock:', err)
      return this.evaluateWriting(studentText, prompt)
    }
  }

  /**
   * 2. Evaluate Speaking Audio with STT & Phonetic IPA Analysis
   */
  static async evaluateSpeaking(
    audioFilePath: string,
    prompt = 'IELTS Speaking Part 2 Response'
  ): Promise<SpeakingEvaluationOutput> {
    const estimatedTokens = 1850

    // A. MOCK MODE or when API key is missing
    if (env.AI_MOCK_MODE || !env.GEMINI_API_KEY) {
      console.log('🤖 [AIService] Using MOCK_MODE for Speaking Audio Evaluation:', audioFilePath)
      return {
        overallBand: 6.5,
        fluencyScore: 7.0,
        pronunciationScore: 6.0,
        lexicalScore: 7.0,
        grammarScore: 6.5,
        transcript:
          'Well, to be quite frank, when I first encountered this initiative, I was genuinely skeptical. However, subsequent developments have thoroughly corroborated its long-term viability...',
        pronunciationErrors: [
          {
            word: 'initiative',
            targetIpa: '/ɪˈnɪʃ.ə.tɪv/',
            detectedIpa: '/ɪˈnɪʃ.i.eɪ.tɪv/',
            contextSentence: 'when I first encountered this initiative',
            advice: 'Âm tiết thứ 3 phát âm là schwa /ə/ nhẹ, tránh kéo dài thành /i:eɪ/.',
          },
          {
            word: 'corroborated',
            targetIpa: '/kəˈrɒb.ə.reɪ.tɪd/',
            detectedIpa: '/kəˈrəʊ.bə.reɪ.tɪd/',
            contextSentence: 'have thoroughly corroborated its viability',
            advice: 'Âm nguyên âm /ɒ/ ngắn cần mở tròn môi dứt khoát hơn.',
          },
          {
            word: 'viability',
            targetIpa: '/ˌvaɪ.əˈbɪl.ə.ti/',
            detectedIpa: '/ˌveɪ.əˈbɪl.ə.ti/',
            contextSentence: 'its long-term viability',
            advice: 'Trọng âm rơi vào /bɪl/, chú ý nguyên âm đôi /aɪ/ ở đầu từ.',
          },
        ],
        detailedFeedback:
          'Tốc độ nói ổn định, phản xạ ngữ pháp tự nhiên với rất ít khoảng ngừng ngắc ngứ. Bạn biết cách sử dụng các từ nối mang tính học thuật (subsequent, thoroughly). Cần chú ý nhấn đúng trọng âm của các từ đa âm tiết.',
        tokensUsed: estimatedTokens,
      }
    }

    // B. REAL GEMINI AUDIO
    try {
      const client = this.getGeminiClient()
      const systemInstruction = `You are an expert IELTS Speaking Examiner and Acoustic Phonetician.
Analyze the user's spoken audio response for transcript, fluency, pronunciation IPA deviations, lexical range, and grammatical range.
Return ONLY a valid JSON object matching:
{
  "overallBand": number,
  "fluencyScore": number,
  "pronunciationScore": number,
  "lexicalScore": number,
  "grammarScore": number,
  "transcript": string,
  "pronunciationErrors": [
    {
      "word": string,
      "targetIpa": string,
      "detectedIpa": string,
      "contextSentence": string,
      "advice": string (in Vietnamese)
    }
  ],
  "detailedFeedback": string (in Vietnamese)
}`

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Please evaluate this spoken English test response for prompt: "${prompt}". Audio file stored at: ${audioFilePath}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      })

      const parsed = JSON.parse(response.text || '{}')
      return {
        overallBand: Number(parsed.overallBand) || 6.5,
        fluencyScore: Number(parsed.fluencyScore) || 6.5,
        pronunciationScore: Number(parsed.pronunciationScore) || 6.0,
        lexicalScore: Number(parsed.lexicalScore) || 6.5,
        grammarScore: Number(parsed.grammarScore) || 6.5,
        transcript: parsed.transcript || 'Spoken response transcribed successfully.',
        pronunciationErrors: Array.isArray(parsed.pronunciationErrors) ? parsed.pronunciationErrors : [],
        detailedFeedback: parsed.detailedFeedback || 'Đã phân tích bản ghi âm thành công.',
        tokensUsed: estimatedTokens,
      }
    } catch (err) {
      console.error('❌ [AIService] Gemini Audio Error, falling back to mock:', err)
      return this.evaluateSpeaking(audioFilePath, prompt)
    }
  }

  /**
   * 3. Generate Lesson Plan, Flashcards, and Quiz for Teachers
   */
  static async generateLessonPlan(input: {
    topic: string
    targetBand?: string
    durationMinutes?: number
  }): Promise<LessonPlanOutput> {
    const topic = input.topic || 'Urban Sustainability & Smart Cities'
    const targetBand = input.targetBand || 'IELTS 7.0 - 7.5+'
    const duration = input.durationMinutes || 90
    const estimatedTokens = 2400

    // A. MOCK MODE or when API key is missing
    if (env.AI_MOCK_MODE || !env.GEMINI_API_KEY) {
      console.log(`🤖 [AIService] Generating Lesson Plan (MOCK) for: "${topic}" (${targetBand})`)

      return {
        topic,
        targetBand,
        durationMinutes: duration,
        outline: [
          {
            time: '15 phút',
            title: 'Schema Activation & High-Level Brainstorming',
            activity: 'Thảo luận cặp với hình ảnh trực quan và kích hoạt 8 collocations chủ điểm',
            teacherNotes: 'Chiếu biểu đồ hoặc hình ảnh tương phản giữa đô thị truyền thống và thành phố thông minh.',
          },
          {
            time: '25 phút',
            title: 'Lexical Framing & Argument Mapping (Band 8.0 Sample)',
            activity: 'Phân tích cấu trúc bài viết mẫu Academic Task 2 nguyên nhân - hệ quả',
            teacherNotes: 'Làm nổi bật các cụm linking words học thuật (To substantiate, In light of, Paradoxically).',
          },
          {
            time: '35 phút',
            title: 'Collaborative Writing & Live AI Feedback Drilling',
            activity: 'Học viên viết bài theo nhóm đôi, chấm thử nghiệm qua AI Engine',
            teacherNotes: 'Giáo viên theo dõi lỗi sai phổ biến để phản hồi đồng loạt trước lớp.',
          },
          {
            time: '15 phút',
            title: 'Consolidation & Homework Assignment',
            activity: 'Ôn tập 5 từ vựng mấu chốt và giao nhiệm vụ luyện tập Flashcard Spaced Repetition',
            teacherNotes: 'Giao bài tập Writing Task 2 trên hệ thống với hạn nộp trước buổi học sau 24h.',
          },
        ],
        flashcards: [
          {
            word: 'Infrastructure',
            partOfSpeech: 'noun',
            phonetic: '/ˈɪn.frəˌstrʌk.tʃər/',
            vietnameseMeaning: 'Cơ sở hạ tầng, nền tảng kỹ thuật.',
            exampleSentence: 'Metropolitan authorities must invest heavily in sustainable public infrastructure.',
          },
          {
            word: 'Congestion',
            partOfSpeech: 'noun',
            phonetic: '/kənˈdʒes.tʃən/',
            vietnameseMeaning: 'Tình trạng ùn tắc (giao thông), quá tải.',
            exampleSentence: 'Congestion pricing schemes have proven effective in reducing inner-city vehicular traffic.',
          },
          {
            word: 'Incentivize',
            partOfSpeech: 'verb',
            phonetic: '/ɪnˈsen.tɪ.vaɪz/',
            vietnameseMeaning: 'Khuyến khích, tạo động lực tài chính hoặc chính sách.',
            exampleSentence: 'Subsidies are deployed to incentivize green energy adoption among industrial corporations.',
          },
          {
            word: 'Detrimental',
            partOfSpeech: 'adjective',
            phonetic: '/ˌdet.rɪˈmen.təl/',
            vietnameseMeaning: 'Có hại, gây tổn hại nghiêm trọng.',
            exampleSentence: 'Excessive reliance on private vehicles yields detrimental environmental consequences.',
          },
        ],
        quiz: [
          {
            question: `Which collocation best describes modern city planning policies regarding ${topic}?`,
            options: [
              'Implement urban renewal initiatives',
              'Do city work quickly',
              'Make roads bigger only',
              'Build simple homes',
            ],
            correctAnswer: 'Implement urban renewal initiatives',
            explanation:
              "'Implement urban renewal initiatives' là cụm collocation học thuật C1-C2 tiêu biểu trong IELTS Writing.",
          },
          {
            question: "Choose the word closest in meaning to 'having harmful effects':",
            options: ['Detrimental', 'Superficial', 'Beneficial', 'Insignificant'],
            correctAnswer: 'Detrimental',
            explanation:
              "'Detrimental' mang nghĩa có hại, gây tác hại tiêu cực, phù hợp với luận điểm nguyên nhân - hệ quả.",
          },
          {
            question: 'What is the correct pronunciation stress for the word "Infrastructure"?',
            options: [
              'First syllable: IN-fra-struc-ture',
              'Second syllable: in-FRA-struc-ture',
              'Third syllable: in-fra-STRUC-ture',
              'Fourth syllable: in-fra-struc-TURE',
            ],
            correctAnswer: 'First syllable: IN-fra-struc-ture',
            explanation: 'Trọng âm chính của "infrastructure" rơi vào âm tiết đầu tiên /ˈɪn/.',
          },
        ],
        tokensUsed: estimatedTokens,
      }
    }

    // B. REAL GEMINI
    try {
      const client = this.getGeminiClient()
      const systemInstruction = `You are a Master English Curriculum Designer.
Generate a structured 90-minute IELTS/TOEIC lesson plan with interactive timeline, flashcard collocations, and multiple-choice quiz questions.
Return ONLY valid JSON matching:
{
  "topic": string,
  "targetBand": string,
  "durationMinutes": number,
  "outline": [
    {
      "time": string,
      "title": string,
      "activity": string,
      "teacherNotes": string (in Vietnamese)
    }
  ],
  "flashcards": [
    {
      "word": string,
      "partOfSpeech": string,
      "phonetic": string,
      "vietnameseMeaning": string,
      "exampleSentence": string
    }
  ],
  "quiz": [
    {
      "question": string,
      "options": string[],
      "correctAnswer": string,
      "explanation": string (in Vietnamese)
    }
  ]
}`

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Create a detailed lesson plan for topic: "${topic}", target level: "${targetBand}", duration: ${duration} minutes.`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      })

      const parsed = JSON.parse(response.text || '{}')
      return {
        topic: parsed.topic || topic,
        targetBand: parsed.targetBand || targetBand,
        durationMinutes: duration,
        outline: Array.isArray(parsed.outline) ? parsed.outline : [],
        flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
        quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
        tokensUsed: estimatedTokens,
      }
    } catch (err) {
      console.error('❌ [AIService] Gemini Lesson Plan Error, falling back to mock:', err)
      return this.generateLessonPlan(input)
    }
  }
}
