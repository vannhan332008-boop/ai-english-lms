import { z } from 'zod'

export const updateCenterProfileSchema = z.object({
  name: z.string().min(2, 'Tên trung tâm phải có ít nhất 2 ký tự').max(100).optional(),
  contactEmail: z.string().email('Địa chỉ email không đúng định dạng').optional(),
  contactPhone: z.string().min(8, 'Số điện thoại phải từ 8 chữ số trở lên').max(15).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(50).optional(),
})

export const createTeacherSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên giảng viên phải từ 2 ký tự trở lên'),
  email: z.string().email('Email giảng viên không đúng định dạng'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ').max(15).optional(),
  cefrLevel: z.enum(['B1', 'B2', 'C1', 'C2']).default('C1'),
  qualification: z.string().max(200).optional(),
  assignedClassId: z.string().optional(),
})

export const createStudentSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên học viên phải từ 2 ký tự trở lên'),
  email: z.string().email('Email học viên không đúng định dạng'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ').max(15).optional(),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B1'),
  classId: z.string().optional(),
})

export const transferStudentClassSchema = z.object({
  targetClassId: z.string().min(1, 'Vui lòng chọn lớp học mới'),
  currentClassId: z.string().optional(),
  reason: z.string().max(255).optional(),
})

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean().optional(),
})

export const csvRowSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  email: z.string().email('Email không đúng định dạng'),
  phone: z.string().optional(),
  className: z.string().optional(),
  classId: z.string().optional(),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional().default('B1'),
})

export const batchImportStudentsSchema = z.object({
  students: z.array(csvRowSchema).min(1, 'Danh sách học viên rỗng'),
})

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải từ 2 ký tự trở lên').optional(),
  name: z.string().optional(),
  email: z.string().email('Email không đúng định dạng'),
  role: z.enum(['STUDENT', 'TEACHER', 'CENTER_MANAGER']).default('STUDENT'),
  phone: z.string().optional(),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional().default('B1'),
})

export type UpdateCenterProfileInput = z.infer<typeof updateCenterProfileSchema>
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>
export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type TransferStudentClassInput = z.infer<typeof transferStudentClassSchema>
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>
export type CsvStudentRow = z.infer<typeof csvRowSchema>
export type BatchImportStudentsInput = z.infer<typeof batchImportStudentsSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>


