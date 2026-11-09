import { z } from 'zod'

export const questionInputSchema = z.object({
  prompt: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  questionType: z.enum(['MULTIPLE_CHOICE', 'FILL_BLANK', 'ESSAY', 'AUDIO_RECORDING']).default('MULTIPLE_CHOICE'),
  mediaUrl: z.string().optional().nullable(),
  options: z.array(z.string()).optional().nullable(),
  correctAnswer: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  points: z.number().min(0).default(1.0),
  orderIndex: z.number().int().default(1),
})

export const createAssignmentSchema = z.object({
  classId: z.string({ required_error: 'Vui lòng chọn lớp học' }).min(1, 'Lớp học không được để trống'),
  title: z
    .string({ required_error: 'Tiêu đề bài tập là bắt buộc' })
    .min(1, 'Tiêu đề không được để trống')
    .max(200, 'Tiêu đề không quá 200 ký tự'),
  description: z.string().max(2000, 'Mô tả không quá 2000 ký tự').optional().nullable(),
  type: z.enum(['WRITING', 'SPEAKING', 'QUIZ', 'HOMEWORK']).default('WRITING'),
  dueDate: z.string().optional().nullable(), // ISO string or datetime
  maxScore: z.number().min(1).max(100).default(10.0),
  rubricConfig: z.any().optional().nullable(),
  questions: z.array(questionInputSchema).optional().nullable(),
})

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>

export const submitAssignmentSchema = z.object({
  content: z.string().optional().nullable(),
  answers: z.record(z.any()).optional().nullable(), // { [questionId]: selectedOptionIndex | string }
  isDraft: z.boolean().default(false),
  audioDurationSeconds: z.number().optional().nullable(),
})

export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0).max(100, 'Điểm số không được vượt quá 100'),
  teacherFeedback: z.string().max(3000, 'Nhận xét không vượt quá 3000 ký tự').optional().nullable(),
  rubricScores: z.any().optional().nullable(),
  status: z.enum(['TEACHER_APPROVED', 'RETURNED']).default('TEACHER_APPROVED'),
})

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>

