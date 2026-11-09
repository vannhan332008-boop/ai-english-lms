import { Request, Response, NextFunction } from 'express'
import { CenterManagerService } from '../services/centerManagerService.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { prisma } from '../config/prisma.js'
import {
  updateCenterProfileSchema,
  createTeacherSchema,
  createStudentSchema,
  transferStudentClassSchema,
  toggleUserStatusSchema,
  batchImportStudentsSchema,
  createUserSchema,
} from '../validations/centerValidation.js'

export class CenterManagerController {
  /**
   * Helper to safely extract and resolve tenantId from authenticated user or database context
   */
  private static async resolveTenantId(req: Request): Promise<string | null> {
    if (!req.user) return null

    // 1. Direct tenantId on req.user
    let tenantId = req.user.tenantId || (req.user as any).tenant_id

    // 2. Override via headers/query for Super Admin or client header
    const headerTenantId = req.headers['x-tenant-id'] as string
    const queryTenantId = (req.query.tenantId || (req.query as any).tenant_id) as string

    if (headerTenantId) {
      tenantId = headerTenantId
    } else if (queryTenantId) {
      tenantId = queryTenantId
    }

    // 3. If still empty, check fresh record from DB using req.user.id
    if (!tenantId && req.user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { tenantId: true, role: true },
      })
      if (dbUser?.tenantId) {
        tenantId = dbUser.tenantId
        req.user.tenantId = tenantId
      }
    }

    // 4. Default fallback: find the active language center in DB (for SUPER_ADMIN or unassigned managers)
    if (!tenantId) {
      const activeTenant =
        (await prisma.tenant.findFirst({
          where: { status: 'ACTIVE' },
          select: { id: true },
        })) || (await prisma.tenant.findFirst({ select: { id: true } }))

      if (activeTenant) {
        tenantId = activeTenant.id
        req.user.tenantId = tenantId

        // Auto-bind unassigned CENTER_MANAGER or TEACHER to this active tenant
        if (req.user.id && req.user.role !== 'SUPER_ADMIN') {
          await prisma.user
            .update({
              where: { id: req.user.id },
              data: { tenantId: activeTenant.id },
            })
            .catch(() => {})
        }
      }
    }

    return tenantId || null
  }

  /**
   * GET /api/v1/center/stats
   */
  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
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
   * GET /api/v1/center/profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const profile = await CenterManagerService.getCenterProfile(tenantId)
      sendSuccess(res, profile, 'Lấy thông tin hồ sơ trung tâm thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * PUT /api/v1/center/profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const validatedData = updateCenterProfileSchema.parse(req.body)
      const updated = await CenterManagerService.updateCenterProfile(
        tenantId,
        validatedData,
        req.user?.id,
        req.ip
      )
      sendSuccess(res, updated, 'Cập nhật thông tin trung tâm thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/center/teachers
   */
  static async getTeachers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const search = req.query.search as string | undefined
      const status = req.query.status as string | undefined

      const teachers = await CenterManagerService.getTeachers(tenantId, { search, status })
      sendSuccess(res, teachers, 'Lấy danh sách giảng viên thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/center/teachers
   */
  static async createTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const validatedData = createTeacherSchema.parse(req.body)
      const teacher = await CenterManagerService.createTeacher(
        tenantId,
        validatedData,
        req.user?.id,
        req.ip
      )
      sendSuccess(res, teacher, 'Tạo tài khoản giảng viên thành công', 201)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/center/students
   */
  static async getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const search = req.query.search as string | undefined
      const status = req.query.status as string | undefined
      const classId = req.query.classId as string | undefined

      const students = await CenterManagerService.getStudents(tenantId, { search, status, classId })
      sendSuccess(res, students, 'Lấy danh sách học viên thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/center/students
   */
  static async createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const validatedData = createStudentSchema.parse(req.body)
      const student = await CenterManagerService.createStudent(
        tenantId,
        validatedData,
        req.user?.id,
        req.ip
      )
      sendSuccess(res, student, 'Thêm học viên thành công', 201)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/center/students/import-csv
   */
  static async importStudentsCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const { students } = batchImportStudentsSchema.parse(req.body)
      const result = await CenterManagerService.batchImportStudents(
        tenantId,
        students,
        req.user?.id,
        req.ip
      )
      sendSuccess(
        res,
        result,
        `Nhập dữ liệu hoàn tất: Thành công ${result.successCount}/${result.totalRows} học viên.`
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/center/students/:id/transfer-class
   */
  static async transferStudentClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const studentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!studentId) {
        sendError(res, 'Mã học viên không hợp lệ', 400)
        return
      }
      const { targetClassId, currentClassId, reason } = transferStudentClassSchema.parse(req.body)

      const result = await CenterManagerService.transferStudentClass(
        tenantId,
        studentId,
        targetClassId,
        currentClassId,
        reason,
        req.user?.id,
        req.ip
      )
      sendSuccess(res, result, `Chuyển học viên sang lớp ${result.newClassName} thành công`)
    } catch (error) {
      next(error)
    }
  }

  /**
   * PATCH /api/v1/center/users/:id/status
   */
  static async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!userId) {
        sendError(res, 'Mã người dùng không hợp lệ', 400)
        return
      }
      const { isActive } = toggleUserStatusSchema.parse(req.body || {})

      const updated = await CenterManagerService.toggleUserStatus(
        tenantId,
        userId,
        isActive,
        req.user?.id,
        req.ip
      )
      sendSuccess(
        res,
        updated,
        `Tài khoản ${updated.fullName} đã được ${updated.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/center/classes
   */
  static async getClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
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

  /**
   * GET /api/v1/center/audit-logs
   */
  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const limit = Number(req.query.limit) || 50
      const logs = await CenterManagerService.getAuditLogs(tenantId, limit)
      sendSuccess(res, logs, 'Lấy nhật ký quản trị thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/center/users
   */
  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const search = req.query.search as string | undefined
      const role = req.query.role as string | undefined
      const status = req.query.status as string | undefined

      const users = await CenterManagerService.getUsers(tenantId, { search, role, status })
      sendSuccess(res, users, 'Lấy danh sách người dùng thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/center/users
   */
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await CenterManagerController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const validatedData = createUserSchema.parse(req.body)
      const user = await CenterManagerService.createUser(
        tenantId,
        validatedData,
        req.user?.id,
        req.ip
      )
      sendSuccess(res, user, 'Tạo người dùng mới thành công và lưu vào cơ sở dữ liệu', 201)
    } catch (error) {
      next(error)
    }
  }
}
