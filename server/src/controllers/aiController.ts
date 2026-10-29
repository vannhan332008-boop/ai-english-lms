import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AIService } from '../services/aiService.js'
import { sendSuccess } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

const writingInputSchema = z
  .object({
    studentText: z.string().optional(),
    content: z.string().optional(),
    prompt: z.string().optional(),
    rubricType: z.string().optional(),
    submissionId: z.string().optional(),
  })
  .refine((data) => (data.content && data.content.length >= 10) || (data.studentText && data.studentText.length >= 10), {
    message: 'Văn bản cần đánh giá phải có tối thiểu 10 ký tự',
    path: ['content'],
  })

const lessonPlanInputSchema = z.object({
  topic: z.string().min(2, 'Chủ đề bài giảng không được để trống'),
  targetBand: z.string().optional(),
  targetLevel: z.string().optional(),
  durationMinutes: z.number().optional(),
  duration: z.union([z.number(), z.string()]).optional(),
  curriculumFocus: z.string().optional(),
})

export class AIController {
  /**
   * POST /api/v1/ai/writing/evaluate
   */
  static async evaluateWriting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = writingInputSchema.parse(req.body)
      const user = req.user
      const textToEvaluate = validated.content || validated.studentText || ''

      const result = await AIService.evaluateWriting(textToEvaluate, validated.prompt)

      // Deduct AI Quota from tenant
      if (user) {
        await AIService.checkAndDeductQuota(
          user.tenantId,
          user.id,
          'WRITING',
          result.tokensUsed
        )
      }

      // If submissionId provided, persist evaluation in database
      if (validated.submissionId) {
        try {
          await prisma.submission.update({
            where: { id: validated.submissionId },
            data: {
              score: result.overallBand,
              aiScore: result.overallBand,
              aiFeedback: result.summaryFeedback,
              status: 'AI_EVALUATED',
              evaluatedAt: new Date(),
              writingEvaluation: {
                upsert: {
                  create: {
                    originalText: textToEvaluate,
                    improvedText: result.correctedText,
                    bandScore: result.overallBand,
                    taskAchievementScore: result.rubricScores.taskAchievement,
                    coherenceScore: result.rubricScores.coherence,
                    lexicalScore: result.rubricScores.lexical,
                    grammarScore: result.rubricScores.grammar,
                    detailedFeedback: JSON.stringify(result.rubricScores),
                    errorList: JSON.stringify(result.detailedErrors),
                  },
                  update: {
                    improvedText: result.correctedText,
                    bandScore: result.overallBand,
                    taskAchievementScore: result.rubricScores.taskAchievement,
                    coherenceScore: result.rubricScores.coherence,
                    lexicalScore: result.rubricScores.lexical,
                    grammarScore: result.rubricScores.grammar,
                    detailedFeedback: JSON.stringify(result.rubricScores),
                    errorList: JSON.stringify(result.detailedErrors),
                  },
                },
              },
            },
          })
        } catch (dbErr) {
          console.warn('Could not update submission record in DB:', dbErr)
        }
      }

      sendSuccess(res, result, 'Đánh giá bài viết bằng AI thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/ai/speaking/evaluate
   */
  static async evaluateSpeaking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const audioFile = req.file
      const prompt = (req.body?.prompt as string) || 'IELTS Speaking Part 2 Response'
      const submissionId = req.body?.submissionId as string | undefined
      const user = req.user

      const audioPath = audioFile ? audioFile.path : 'uploads/audio/sample-recording.webm'

      const result = await AIService.evaluateSpeaking(audioPath, prompt)

      // Deduct AI Quota from tenant
      if (user) {
        await AIService.checkAndDeductQuota(
          user.tenantId,
          user.id,
          'SPEAKING',
          result.tokensUsed
        )
      }

      // If submissionId provided, persist evaluation in database
      if (submissionId) {
        try {
          await prisma.submission.update({
            where: { id: submissionId },
            data: {
              score: result.overallBand,
              aiScore: result.overallBand,
              aiFeedback: result.detailedFeedback,
              status: 'AI_EVALUATED',
              evaluatedAt: new Date(),
              speakingEvaluation: {
                upsert: {
                  create: {
                    audioPath,
                    transcript: result.transcript,
                    overallScore: result.overallBand,
                    fluencyScore: result.fluencyScore,
                    pronunciationScore: result.pronunciationScore,
                    vocabularyScore: result.lexicalScore,
                    grammarScore: result.grammarScore,
                    ipaErrors: JSON.stringify(result.pronunciationErrors),
                    detailedFeedback: result.detailedFeedback,
                  },
                  update: {
                    audioPath,
                    transcript: result.transcript,
                    overallScore: result.overallBand,
                    fluencyScore: result.fluencyScore,
                    pronunciationScore: result.pronunciationScore,
                    vocabularyScore: result.lexicalScore,
                    grammarScore: result.grammarScore,
                    ipaErrors: JSON.stringify(result.pronunciationErrors),
                    detailedFeedback: result.detailedFeedback,
                  },
                },
              },
            },
          })
        } catch (dbErr) {
          console.warn('Could not update speaking submission record in DB:', dbErr)
        }
      }

      sendSuccess(res, result, 'Đánh giá phát âm Speaking bằng AI thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/ai/teacher/lesson-plan
   */
  static async generateLessonPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = lessonPlanInputSchema.parse(req.body)
      const user = req.user
      const durationMins =
        typeof validated.duration === 'number'
          ? validated.duration
          : typeof validated.duration === 'string'
          ? parseInt(validated.duration, 10) || 90
          : validated.durationMinutes || 90

      const result = await AIService.generateLessonPlan({
        topic: validated.topic,
        targetBand: validated.targetLevel || validated.targetBand || 'IELTS Band 6.5',
        durationMinutes: durationMins,
      })

      // Deduct AI Quota from tenant
      if (user) {
        await AIService.checkAndDeductQuota(
          user.tenantId,
          user.id,
          'LESSON_PLAN',
          result.tokensUsed
        )
      }

      sendSuccess(res, result, 'Khởi tạo giáo án và bộ câu hỏi trắc nghiệm bằng AI thành công')
    } catch (error) {
      next(error)
    }
  }
}
