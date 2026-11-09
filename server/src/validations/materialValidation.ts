import { z } from 'zod'

export const uploadMaterialSchema = z.object({
  title: z
    .string({ required_error: 'Tiêu đề tài liệu là bắt buộc' })
    .min(1, 'Tiêu đề không được để trống')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  courseId: z.string().optional().nullable(),
  lessonId: z.string().optional().nullable(),
  description: z.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự').optional().nullable(),
  fileType: z
    .enum(['PDF', 'AUDIO', 'VIDEO', 'DOCUMENT', 'IMAGE', 'OTHER'])
    .optional(),
})

export type UploadMaterialInput = z.infer<typeof uploadMaterialSchema>

