import { z } from 'zod'

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string().max(1000, 'Nhận xét không được vượt quá 1000 ký tự').optional().nullable(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>

