import { z } from 'zod'

export const updateTenantBrandSchema = z.object({
  name: z.string().min(2, 'Tên trung tâm phải có ít nhất 2 ký tự').optional(),
  logoUrl: z.string().url('Đường dẫn logo phải là URL hợp lệ').optional().or(z.literal('')).nullable(),
  primaryColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Mã màu Primary Hex không hợp lệ (VD: #4f46e5)')
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Mã màu Secondary Hex không hợp lệ (VD: #06b6d4)')
    .optional(),
  faviconUrl: z.string().url('Đường dẫn Favicon phải là URL hợp lệ').optional().or(z.literal('')).nullable(),
  customDomain: z.string().optional().nullable(),
})

export type UpdateTenantBrandInput = z.infer<typeof updateTenantBrandSchema>

export const registerTenantSchema = z.object({
  centerName: z.string().min(2, 'Tên trung tâm phải có ít nhất 2 ký tự'),
  adminName: z.string().min(2, 'Tên người quản trị phải có ít nhất 2 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().optional().nullable(),
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).default('PROFESSIONAL'),
  city: z.string().optional().nullable(),
})

export type RegisterTenantInput = z.infer<typeof registerTenantSchema>
