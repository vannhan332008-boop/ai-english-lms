import { Request, Response, NextFunction } from 'express'
import { ReviewService } from '../services/reviewService.js'
import { createReviewSchema } from '../validations/reviewValidation.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

export class ReviewController {
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
   * POST /api/v1/courses/:courseId/reviews
   * Submit or update a course review (Enrolled students only)
   */
  static async addReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await ReviewController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const courseId = (req.params.courseId || req.params.id) as string
      const validatedData = createReviewSchema.parse(req.body)

      const review = await ReviewService.addReview(
        courseId,
        req.user.id,
        tenantId,
        validatedData
      )

      sendSuccess(res, review, 'Gửi đánh giá khóa học thành công', 201)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/courses/:courseId/reviews
   * Get all reviews and rating breakdown for course
   */
  static async getCourseReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await ReviewController.resolveTenantId(req)
      const courseId = (req.params.courseId || req.params.id) as string

      const data = await ReviewService.getCourseReviews(courseId, tenantId || '')

      sendSuccess(res, data, 'Lấy danh sách đánh giá thành công')
    } catch (err) {
      next(err)
    }
  }

  /**
   * DELETE /api/v1/reviews/:id
   * Delete a review
   */
  static async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await ReviewController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const reviewId = req.params.id as string
      await ReviewService.deleteReview(reviewId, req.user, tenantId)

      sendSuccess(res, null, 'Xóa đánh giá thành công')
    } catch (err) {
      next(err)
    }
  }
}

