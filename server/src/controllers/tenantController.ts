import { Request, Response, NextFunction } from 'express'
import { TenantService } from '../services/tenantService.js'
import { sendSuccess, sendError } from '../utils/response.js'

export class TenantController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenants = await TenantService.getAllTenants()
      sendSuccess(res, tenants, 'Lấy danh sách trung tâm thành công')
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!id) {
        sendError(res, 'Mã định danh trung tâm không hợp lệ', 400)
        return
      }

      const tenant = await TenantService.getTenantById(id)
      if (!tenant) {
        sendError(res, 'Không tìm thấy thông tin trung tâm', 404)
        return
      }

      sendSuccess(res, tenant, 'Lấy chi tiết trung tâm thành công')
    } catch (error) {
      next(error)
    }
  }
}
