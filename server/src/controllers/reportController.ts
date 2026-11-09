import { Request, Response } from 'express'
import { ReportService } from '../services/reportService.js'
import { sendSuccess, sendError } from '../utils/response.js'

export class ReportController {
  /**
   * GET /api/v1/reports/student
   * Returns authenticated student's dashboard metrics and progress
   */
  static async getStudentReport(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
      }

      if (!user.tenantId) {
        return sendError(res, 'Người dùng không thuộc cơ sở nào', 400, 'NO_TENANT')
      }

      const data = await ReportService.getStudentDashboardStats(user.id, user.tenantId)
      return sendSuccess(res, data, 'Lấy báo cáo học viên thành công')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi lấy báo cáo học viên', error.statusCode || 500)
    }
  }

  /**
   * GET /api/v1/reports/center
   * Returns manager dashboard metrics
   */
  static async getCenterReport(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
      }

      const tenantId = user.tenantId || (req.query.tenantId as string)
      if (!tenantId) {
        return sendError(res, 'Mã cơ sở là bắt buộc', 400, 'TENANT_REQUIRED')
      }

      const data = await ReportService.getCenterDashboardStats(tenantId)
      return sendSuccess(res, data, 'Lấy báo cáo trung tâm thành công')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi lấy báo cáo trung tâm', error.statusCode || 500)
    }
  }

  /**
   * GET /api/v1/reports/export/students
   * Download CSV of students
   */
  static async exportStudentsCsv(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
      }

      const tenantId = user.tenantId || (req.query.tenantId as string)
      if (!tenantId) {
        return sendError(res, 'Mã cơ sở là bắt buộc', 400, 'TENANT_REQUIRED')
      }

      const csvContent = await ReportService.exportStudentsCsv(tenantId)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const fileName = `danh_sach_hoc_vien_${dateStr}.csv`

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      return res.status(200).send(csvContent)
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi xuất file CSV học viên', error.statusCode || 500)
    }
  }

  /**
   * GET /api/v1/reports/export/grades
   * Download CSV of assignment grades and submissions
   */
  static async exportGradesCsv(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
      }

      const tenantId = user.tenantId || (req.query.tenantId as string)
      if (!tenantId) {
        return sendError(res, 'Mã cơ sở là bắt buộc', 400, 'TENANT_REQUIRED')
      }

      const classId = req.query.classId as string | undefined
      const csvContent = await ReportService.exportGradesCsv(tenantId, classId)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const fileName = `bang_diem_bai_tap_${dateStr}.csv`

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      return res.status(200).send(csvContent)
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi xuất file CSV bảng điểm', error.statusCode || 500)
    }
  }

  /**
   * GET /api/v1/reports/audit-logs
   * View & search audit logs
   */
  static async getAuditLogs(req: Request, res: Response) {
    try {
      const user = req.user
      if (!user) {
        return sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
      }

      // SUPER_ADMIN can see all or specify tenantId; others must be scoped to their tenant
      const tenantId = user.role === 'SUPER_ADMIN' ? (req.query.tenantId as string) || null : user.tenantId

      const action = req.query.action as string | undefined
      const resource = req.query.resource as string | undefined
      const startDate = req.query.startDate as string | undefined
      const endDate = req.query.endDate as string | undefined
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20

      const result = await ReportService.getAuditLogs(tenantId, {
        action,
        resource,
        startDate,
        endDate,
        page,
        limit,
      })

      return sendSuccess(res, result, 'Lấy nhật ký kiểm toán thành công')
    } catch (error: any) {
      return sendError(res, error.message || 'Lỗi tra cứu nhật ký', error.statusCode || 500)
    }
  }
}

