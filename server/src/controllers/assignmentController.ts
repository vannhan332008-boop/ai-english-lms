import { Request, Response, NextFunction } from 'express'
import { AssignmentService } from '../services/assignmentService.js'
import {
  createAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
} from '../validations/assignmentValidation.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

export class AssignmentController {
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
   * POST /api/v1/assignments
   * Role: SUPER_ADMIN, CENTER_MANAGER, TEACHER
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await AssignmentController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const validated = createAssignmentSchema.parse(req.body)

      const result = await AssignmentService.createAssignment(
        tenantId,
        validated,
        req.user!.id,
        req.user!.role
      )

      sendSuccess(res, result, 'Khởi tạo bài tập thành công', 201)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/assignments
   * All authenticated roles (Student sees enrolled; Staff sees assigned)
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await AssignmentController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const classId = req.query.classId as string | undefined
      const type = req.query.type as string | undefined
      const search = req.query.search as string | undefined

      const assignments = await AssignmentService.getAssignments(tenantId, req.user!, {
        classId,
        type,
        search,
      })

      sendSuccess(res, assignments, 'Lấy danh sách bài tập thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/assignments/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await AssignmentController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = req.params.id as string
      const assignment = await AssignmentService.getAssignmentById(id, tenantId, req.user!)

      sendSuccess(res, assignment, 'Lấy thông tin chi tiết bài tập thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/assignments/:id/submit
   * Role: STUDENT
   */
  static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await AssignmentController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = req.params.id as string
      const validated = submitAssignmentSchema.parse(req.body)

      const submission = await AssignmentService.submitAssignment(
        id,
        tenantId,
        req.user!.id,
        validated
      )

      sendSuccess(
        res,
        submission,
        validated.isDraft ? 'Đã lưu bản nháp bài nộp thành công' : 'Đã nộp bài tập thành công'
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/assignments/submissions/grading
   * Role: SUPER_ADMIN, CENTER_MANAGER, TEACHER
   */
  static async getSubmissionsForGrading(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await AssignmentController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const assignmentId = req.query.assignmentId as string | undefined
      const submissions = await AssignmentService.getSubmissionsForGrading(
        tenantId,
        req.user!,
        assignmentId
      )

      sendSuccess(res, submissions, 'Lấy danh sách bài nộp cần chấm điểm thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/assignments/submissions/:submissionId/grade
   * Role: SUPER_ADMIN, CENTER_MANAGER, TEACHER
   */
  static async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await AssignmentController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const submissionId = req.params.submissionId as string
      const validated = gradeSubmissionSchema.parse(req.body)

      const result = await AssignmentService.gradeSubmission(
        submissionId,
        tenantId,
        req.user!.id,
        validated
      )

      sendSuccess(res, result, 'Đã chấm điểm và gửi nhận xét thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/assignments/my-grades
   * Role: STUDENT
   */
  static async getMyGrades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await AssignmentController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const grades = await AssignmentService.getStudentGradeHistory(req.user!.id, tenantId)
      sendSuccess(res, grades, 'Lấy lịch sử điểm bài nộp thành công')
    } catch (error) {
      next(error)
    }
  }
}

