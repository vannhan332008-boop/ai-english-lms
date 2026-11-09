import { z } from 'zod'

export const createCourseSchema = z.object({
  title: z.string().min(2, 'Tên khóa học phải có ít nhất 2 ký tự'),
  code: z.string().optional(),
  type: z
    .enum(['IELTS', 'TOEIC', 'COMMUNICATION', 'BUSINESS_ENGLISH', 'KIDS_TEENS'])
    .optional()
    .default('IELTS')
    .or(
      z.string().transform((val) => {
        if (val === 'BUSINESS') return 'BUSINESS_ENGLISH'
        return val as any
      })
    ),
  category: z.string().optional(),
  description: z.string().optional(),
  targetLevel: z.string().optional(),
  level: z.string().optional(),
  price: z.coerce.number().min(0, 'Học phí không được âm').default(0),
  originalPrice: z.coerce.number().optional(),
  duration: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  instructorId: z.string().optional(),
})

export const updateCourseSchema = z.object({
  title: z.string().min(2).optional(),
  code: z.string().optional(),
  type: z
    .enum(['IELTS', 'TOEIC', 'COMMUNICATION', 'BUSINESS_ENGLISH', 'KIDS_TEENS'])
    .optional()
    .or(
      z.string().transform((val) => {
        if (val === 'BUSINESS') return 'BUSINESS_ENGLISH'
        return val as any
      })
    ),
  description: z.string().optional(),
  targetLevel: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  thumbnailUrl: z.string().optional(),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>

