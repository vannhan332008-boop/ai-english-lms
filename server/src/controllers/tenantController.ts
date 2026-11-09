import { Request, Response, NextFunction } from 'express'
import { TenantService } from '../services/tenantService.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { updateTenantBrandSchema, registerTenantSchema } from '../validations/tenantValidation.js'

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

  static async getTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userTenantId = (req as any).user?.tenantId
      const queryTenant = req.query.tenantId as string | undefined
      const headerTenant = req.headers['x-tenant-id'] as string | undefined
      const domain = req.headers.host?.split(':')[0]

      const tenantId = userTenantId || queryTenant || headerTenant
      const theme = await TenantService.getTenantTheme(tenantId, domain)
      sendSuccess(res, theme, 'Lấy cấu hình thương hiệu thành công')
    } catch (error) {
      next(error)
    }
  }

  static async updateTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user
      const validated = updateTenantBrandSchema.parse(req.body)

      // Super admin can specify target tenant in params, Center Manager updates their own tenant
      let targetTenantId = user?.tenantId
      if (user?.role === 'SUPER_ADMIN' && req.params.id) {
        targetTenantId = req.params.id
      }

      if (!targetTenantId) {
        sendError(res, 'Không xác định được trung tâm cần cập nhật thương hiệu', 400)
        return
      }

      const updated = await TenantService.updateTenantTheme(targetTenantId, validated)
      sendSuccess(res, updated, 'Cập nhật cấu hình thương hiệu thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * B2B Onboarding: Register new Center Tenant + Center Administrator
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerTenantSchema.parse(req.body)
      const result = await TenantService.registerTenant(validated)
      sendSuccess(res, result, 'Khởi tạo trung tâm và tài khoản Quản trị thành công', 201)
    } catch (error) {
      next(error)
    }
  }
}
