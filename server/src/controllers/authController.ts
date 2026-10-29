import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AuthService } from '../services/authService.js'
import { sendSuccess, sendError } from '../utils/response.js'

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  tenantCode: z.string().optional(),
})

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body)
      const result = await AuthService.login(validated.email, validated.password)

      sendSuccess(res, result, 'Đăng nhập thành công')
    } catch (error) {
      next(error)
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user
      if (!user) {
        sendError(res, 'Chưa xác thực', 401)
        return
      }

      sendSuccess(res, { user }, 'Lấy thông tin người dùng thành công')
    } catch (error) {
      next(error)
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        sendError(res, 'Refresh token là bắt buộc', 400)
        return
      }

      const result = await AuthService.refreshAccessToken(refreshToken)
      sendSuccess(res, result, 'Làm mới token thành công')
    } catch (error) {
      next(error)
    }
  }
}
