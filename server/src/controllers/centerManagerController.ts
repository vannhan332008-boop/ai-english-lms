import { Request, Response, NextFunction } from 'express'
import { CenterManagerService } from '../services/centerManagerService.js'
import { sendSuccess, sendError } from '../utils/response.js'

export class CenterManagerController {
  /**
   * Helper to safely extract tenantId from authenticated user
   */
  private static getTenantId(req: Request): string | null {
    if (!req.user) return null

    // Super Admin can override or view specific tenant via header or query
    if (req.user.role === 'SUPER_ADMIN') {
      const headerTenantId = req.headers['x-tenant-id'] as string
      const queryTenantId = req.query.tenantId as string
      return headerTenantId || queryTenantId || req.user.tenantId || null
    }

    return req.user.tenantId || null
  }

  /**
   * GET /api/v1/center/stats
   */
  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = CenterManagerController.getTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const data = await CenterManagerService.getTenantStats(tenantId)
      sendSuccess(res, data, 'Lấy thống kê cơ sở thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/center/teachers
   */
  static async getTeachers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = CenterManagerController.getTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const teachers = await CenterManagerService.getTeachers(tenantId)
      sendSuccess(res, teachers, 'Lấy danh sách giảng viên thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/center/students
   */
  static async getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = CenterManagerController.getTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const students = await CenterManagerService.getStudents(tenantId)
      sendSuccess(res, students, 'Lấy danh sách học viên thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/center/classes
   */
  static async getClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = CenterManagerController.getTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const classes = await CenterManagerService.getClasses(tenantId)
      sendSuccess(res, classes, 'Lấy danh sách lớp học thành công')
    } catch (error) {
      next(error)
    }
  }
}

