import { Request, Response, NextFunction } from 'express'
import { SuperAdminService } from '../services/superAdminService.js'
import { sendSuccess } from '../utils/response.js'

export class SuperAdminController {
  /**
   * GET /api/v1/super-admin/stats
   */
  static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await SuperAdminService.getPlatformStats()
      sendSuccess(res, stats, 'Lấy số liệu thống kê toàn hệ thống thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/super-admin/tenants
   */
  static async getTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined
      const status = typeof req.query.status === 'string' ? req.query.status : undefined

      const tenants = await SuperAdminService.getTenants({ search, status })
      sendSuccess(res, tenants, 'Lấy danh sách trung tâm thành công')
    } catch (error) {
      next(error)
    }
  }
}

