import { Request, Response, NextFunction } from 'express'
import { ClassService } from '../services/classService.js'
import { sendSuccess, sendError } from '../utils/response.js'

export class ClassController {
  static async getTenantClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawTenantId = (req as any).tenantId || req.params.tenantId
      const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId
      if (!tenantId) {
        sendError(res, 'Mã trung tâm (tenantId) là bắt buộc', 400)
        return
      }

      const classes = await ClassService.getClassesByTenant(tenantId)
      sendSuccess(res, classes, 'Lấy danh sách lớp học thành công')
    } catch (error) {
      next(error)
    }
  }

  static async getClassById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!id) {
        sendError(res, 'Mã lớp học không hợp lệ', 400)
        return
      }

      const classItem = await ClassService.getClassDetails(id)
      if (!classItem) {
        sendError(res, 'Không tìm thấy lớp học', 404)
        return
      }

      sendSuccess(res, classItem, 'Lấy chi tiết lớp học thành công')
    } catch (error) {
      next(error)
    }
  }
}
