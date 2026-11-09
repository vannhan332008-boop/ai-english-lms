import api from './api'

export interface WritingAiResult {
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

export interface SpeakingAiResult {
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

export interface QuizQuestionGenerated {
  prompt: string
  options: string[]
  correctAnswer: string
  explanation: string
  points?: number
}

export interface QuizGenerationResult {
  passage: string
  difficulty: string
  topic?: string
  questions: QuizQuestionGenerated[]
  tokensUsed: number
}

export interface LessonPlanResult {
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

export const aiService = {
  /**
   * AI evaluate student Writing essay
   */
  async evaluateWriting(params: {
    content: string
    prompt?: string
    rubricType?: string
    submissionId?: string
  }): Promise<WritingAiResult> {
    const res = await api.post('/ai/writing/evaluate', params)
    return res.data.data
  },

  /**
   * AI evaluate student Speaking audio
   */
  async evaluateSpeaking(formData: FormData): Promise<SpeakingAiResult> {
    const res = await api.post('/ai/speaking/evaluate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  /**
   * Generate Quiz Questions from a text excerpt / reading passage
   */
  async generateQuiz(params: {
    passage: string
    numQuestions?: number
    difficulty?: string
    topic?: string
    assignmentId?: string
  }): Promise<QuizGenerationResult> {
    const res = await api.post('/ai/teacher/quiz-generate', params)
    return res.data.data
  },

  /**
   * Generate Lesson Plan and activities
   */
  async generateLessonPlan(params: {
    topic: string
    targetBand?: string
    durationMinutes?: number
  }): Promise<LessonPlanResult> {
    const res = await api.post('/ai/teacher/lesson-plan', params)
    return res.data.data
  },
}

export default aiService

