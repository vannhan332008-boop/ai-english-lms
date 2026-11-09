import { Request, Response, NextFunction } from 'express'
import { EnrollmentService } from '../services/enrollmentService.js'
import { createEnrollmentSchema } from '../validations/enrollmentValidation.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

export class EnrollmentController {
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
   * POST /api/v1/enrollments
   * Assign a student into a course or class (Admin, Teacher, Center Manager only)
   */
  static async createEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await EnrollmentController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const validatedData = createEnrollmentSchema.parse(req.body)
      const result = await EnrollmentService.enroll(
        tenantId,
        validatedData,
        req.user?.id,
        req.ip
      )

      sendSuccess(
        res,
        result,
        `Ghi danh học viên ${result.student.fullName} vào khóa học ${result.course.title} thành công!`,
        201
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/enrollments/my-courses or /api/v1/courses/my-courses
   * Get all courses the current logged-in student is enrolled in
   */
  static async getMyEnrolledCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        sendError(res, 'Yêu cầu đăng nhập để xem khóa học', 401, 'UNAUTHORIZED')
        return
      }

      const courses = await EnrollmentService.getMyEnrolledCourses(req.user.id)
      sendSuccess(res, courses, 'Lấy danh sách khóa học của học viên thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/enrollments/courses/:courseId
   * Get all students enrolled in a specific course
   */
  static async getCourseEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await EnrollmentController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const rawCourseId = req.params.courseId || req.params.id
      const courseId = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId

      if (!courseId) {
        sendError(res, 'Mã khóa học không hợp lệ', 400)
        return
      }

      const students = await EnrollmentService.getCourseEnrollments(courseId, tenantId)
      sendSuccess(res, students, 'Lấy danh sách học viên trong khóa học thành công')
    } catch (error) {
      next(error)
    }
  }
}
