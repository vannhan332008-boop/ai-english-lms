import { z } from 'zod'

export const createLiveSessionSchema = z.object({
  courseId: z.string({ required_error: 'Vui lòng chọn khóa học' }).min(1, 'Khóa học không được để trống'),
  classId: z.string().optional().nullable(),
  teacherId: z.string().optional().nullable(),
  title: z
    .string({ required_error: 'Tiêu đề buổi học là bắt buộc' })
    .min(3, 'Tiêu đề phải từ 3 ký tự trở lên')
    .max(200, 'Tiêu đề không quá 200 ký tự'),
  description: z.string().max(2000, 'Mô tả không quá 2000 ký tự').optional().nullable(),
  startTime: z.string({ required_error: 'Vui lòng chọn thời gian bắt đầu' }),
  endTime: z.string({ required_error: 'Vui lòng chọn thời gian kết thúc' }),
  meetingUrl: z.string().url('Link phòng học phải là URL hợp lệ').optional().or(z.literal('')).nullable(),
  meetingPlatform: z.enum(['GOOGLE_MEET', 'ZOOM', 'MICROSOFT_TEAMS', 'INTERNAL_ROOM']).default('GOOGLE_MEET'),
})

export type CreateLiveSessionInput = z.infer<typeof createLiveSessionSchema>

export const updateLiveSessionSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải từ 3 ký tự trở lên').max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  meetingUrl: z.string().url('Link phòng học phải là URL hợp lệ').optional().or(z.literal('')).nullable(),
  meetingPlatform: z.enum(['GOOGLE_MEET', 'ZOOM', 'MICROSOFT_TEAMS', 'INTERNAL_ROOM']).optional(),
  isCancelled: z.boolean().optional(),
  teacherId: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
})

export type UpdateLiveSessionInput = z.infer<typeof updateLiveSessionSchema>

