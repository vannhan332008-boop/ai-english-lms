import { Request, Response, NextFunction } from 'express'
import { CourseService } from '../services/courseService.js'
import { createCourseSchema, updateCourseSchema } from '../validations/courseValidation.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

export class CourseController {
  private static async resolveTenantId(req: Request): Promise<string | null> {
    if (!req.user) return null

    if (req.user.role === 'SUPER_ADMIN') {
      const headerTenantId = req.headers['x-tenant-id'] as string
      const queryTenantId = req.query.tenantId as string
      const foundId = headerTenantId || queryTenantId || req.user.tenantId || null
      if (foundId) return foundId

      const defaultTenant = await prisma.tenant.findFirst({ select: { id: true } })
      return defaultTenant?.id || null
    }

    return req.user.tenantId || null
  }

  /**
   * GET /api/v1/courses
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CourseController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const search = req.query.search as string | undefined
      const type = req.query.type as string | undefined
      const category = req.query.category as string | undefined

      const courses = await CourseService.getAll(tenantId, { search, type, category })
      sendSuccess(res, courses, 'Lấy danh sách khóa học thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/courses/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CourseController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!id) {
        sendError(res, 'Mã khóa học không hợp lệ', 400)
        return
      }

      const course = await CourseService.getById(id, tenantId)
      if (!course) {
        sendError(res, 'Không tìm thấy khóa học', 404, 'NOT_FOUND')
        return
      }

      sendSuccess(res, course, 'Lấy chi tiết khóa học thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/courses
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CourseController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const validatedData = createCourseSchema.parse(req.body)
      const course = await CourseService.create(
        tenantId,
        validatedData,
        req.user?.id,
        req.ip
      )

      sendSuccess(res, course, 'Tạo khóa học thành công và lưu trữ cơ sở dữ liệu', 201)
    } catch (error) {
      next(error)
    }
  }

  /**
   * PUT /api/v1/courses/:id
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CourseController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!id) {
        sendError(res, 'Mã khóa học không hợp lệ', 400)
        return
      }

      const validatedData = updateCourseSchema.parse(req.body)
      const updated = await CourseService.update(
        id,
        tenantId,
        validatedData,
        req.user?.id,
        req.ip
      )

      sendSuccess(res, updated, 'Cập nhật khóa học thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /api/v1/courses/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CourseController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!id) {
        sendError(res, 'Mã khóa học không hợp lệ', 400)
        return
      }

      const result = await CourseService.delete(
        id,
        tenantId,
        req.user?.id,
        req.ip
      )

      sendSuccess(res, result, 'Xóa khóa học thành công')
    } catch (error) {
      next(error)
    }
  }
}
