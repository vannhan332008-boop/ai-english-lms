import { z } from 'zod'

export const createEnrollmentSchema = z
  .object({
    studentId: z.string().optional(),
    student_id: z.string().optional(),
    courseId: z.string().optional(),
    course_id: z.string().optional(),
    classId: z.string().optional(),
    class_id: z.string().optional(),
  })
  .refine((data) => Boolean(data.studentId || data.student_id), {
    message: 'Mã học viên (studentId) là bắt buộc',
  })
  .refine((data) => Boolean(data.courseId || data.course_id || data.classId || data.class_id), {
    message: 'Mã khóa học (courseId) hoặc lớp học (classId) là bắt buộc',
  })

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>

