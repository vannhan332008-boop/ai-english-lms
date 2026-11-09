import { Request, Response, NextFunction } from 'express'
import { LiveSessionService } from '../services/liveSessionService.js'
import { createLiveSessionSchema, updateLiveSessionSchema } from '../validations/liveSessionValidation.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

export class LiveSessionController {
  private static async resolveTenantId(req: Request): Promise<string | null> {
    if (!req.user) return null

    let tenantId = req.user.tenantId || (req.user as any).tenant_id
    const headerTenantId = req.headers['x-tenant-id'] as string
    const queryTenantId = (req.query.tenantId || (req.query as any)?.tenant_id) as string

    if (headerTenantId) {
      tenantId = headerTenantId
    } else if (queryTenantId) {
      tenantId = queryTenantId
    }

    if (!tenantId && req.user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { tenantId: true },
      })
      if (dbUser?.tenantId) {
        tenantId = dbUser.tenantId
        req.user.tenantId = tenantId
      }
    }

    if (!tenantId) {
      const activeTenant =
        (await prisma.tenant.findFirst({
          where: { status: 'ACTIVE' },
          select: { id: true },
        })) || (await prisma.tenant.findFirst({ select: { id: true } }))

      if (activeTenant) {
        tenantId = activeTenant.id
        req.user.tenantId = tenantId
      }
    }

    return tenantId || null
  }

  /**
   * POST /api/v1/live-sessions
   * Create a new live session (Admin, Teacher, Center Manager only)
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await LiveSessionController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const validatedData = createLiveSessionSchema.parse(req.body)
      const session = await LiveSessionService.createSession(validatedData, req.user, tenantId)

      sendSuccess(res, session, 'Tạo lịch học trực tuyến thành công', 201)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/live-sessions
   * Get all live sessions for current tenant and role
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await LiveSessionController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const courseId = req.query.courseId as string | undefined
      const classId = req.query.classId as string | undefined
      const upcomingOnly = req.query.upcomingOnly === 'true'

      const sessions = await LiveSessionService.getSessions(tenantId, req.user, {
        courseId,
        classId,
        upcomingOnly,
      })

      sendSuccess(res, sessions, 'Lấy danh sách buổi học trực tuyến thành công')
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/live-sessions/:id
   * Get session details
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await LiveSessionController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = req.params.id as string
      const session = await LiveSessionService.getSessionById(id, tenantId, req.user)

      sendSuccess(res, session, 'Lấy thông tin buổi học thành công')
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/v1/live-sessions/:id
   * Update session
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await LiveSessionController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = req.params.id as string
      const validatedData = updateLiveSessionSchema.parse(req.body)
      const session = await LiveSessionService.updateSession(id, tenantId, validatedData)

      sendSuccess(res, session, 'Cập nhật buổi học thành công')
    } catch (err) {
      next(err)
    }
  }

  /**
   * DELETE /api/v1/live-sessions/:id
   * Delete session
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await LiveSessionController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = req.params.id as string
      await LiveSessionService.deleteSession(id, tenantId)

      sendSuccess(res, null, 'Xóa buổi học trực tuyến thành công')
    } catch (err) {
      next(err)
    }
  }
}
