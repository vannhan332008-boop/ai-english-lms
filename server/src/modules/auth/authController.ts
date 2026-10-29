import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AuthService } from '../../services/authService.js'
import { sendSuccess } from '../../utils/response.js'
import { UserRole } from '@prisma/client'

// Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerTenantSchema = z.object({
  centerName: z.string().min(3, 'Center name must be at least 3 characters'),
  centerCode: z
    .string()
    .min(3, 'Center code must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Center code must contain only lowercase letters, numbers, and dashes'),
  managerName: z.string().min(2, 'Manager name must be at least 2 characters'),
  managerEmail: z.string().email('Invalid manager email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required'),
})

export const demoSwitchSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER', 'STUDENT']),
  tenantCode: z.string().optional(),
})

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body)
      const result = await AuthService.login(data.email, data.password)
      return sendSuccess(res, result, 'User logged in successfully')
    } catch (error) {
      next(error)
    }
  }

  static async registerTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerTenantSchema.parse(req.body)
      const result = await AuthService.registerTenant(data)
      return sendSuccess(res, result, 'Language center and manager registered successfully', 201)
    } catch (error) {
      next(error)
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body)
      const tokens = await AuthService.refreshAccessToken(refreshToken)
      return sendSuccess(res, tokens, 'Token refreshed successfully')
    } catch (error) {
      next(error)
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.id)
      return sendSuccess(res, user, 'Current user profile fetched successfully')
    } catch (error) {
      next(error)
    }
  }

  static async demoSwitch(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, tenantCode } = demoSwitchSchema.parse(req.body)
      const result = await AuthService.demoSwitch(role as UserRole, tenantCode)
      return sendSuccess(res, result, `Demo switched to role '${role}'`)
    } catch (error) {
      next(error)
    }
  }
}

