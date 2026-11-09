import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/errors.js'
import { CacheService } from '../utils/cache.js'
import type { CreateReviewInput } from '../validations/reviewValidation.js'
import type { AuthUser } from '../types/auth.js'

export class ReviewService {
  /**
   * Add or update a review for a course (Student must be enrolled)
   */
  static async addReview(
    courseId: string,
    studentId: string,
    tenantId: string,
    input: CreateReviewInput
  ) {
    // 1. Verify course
    const course = await prisma.course.findFirst({
      where: { id: courseId, tenantId },
    })

    if (!course) {
      throw new AppError('Khóa học không tồn tại trong hệ thống', 404, 'NOT_FOUND')
    }

    // 2. Strict Check: Student must be enrolled in this course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        status: 'ENROLLED',
        class: {
          courseId,
        },
      },
    })

    if (!enrollment) {
      throw new AppError(
        'Chỉ học viên đã ghi danh khóa học mới có quyền gửi đánh giá và xếp hạng sao',
        403,
        'FORBIDDEN'
      )
    }

    // 3. Upsert review (one review per student per course)
    const review = await prisma.review.upsert({
      where: {
        courseId_studentId: {
          courseId,
          studentId,
        },
      },
      update: {
        rating: input.rating,
        comment: input.comment?.trim() || null,
      },
      create: {
        tenantId,
        courseId,
        studentId,
        rating: input.rating,
        comment: input.comment?.trim() || null,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            cefrLevel: true,
          },
        },
      },
    })

    // Invalidate course cache so ratings update immediately
    CacheService.deletePattern(`courses:${tenantId}`)

    return review
  }

  /**
   * Get all reviews for a course with summary statistics
   */
  static async getCourseReviews(courseId: string, tenantId?: string | null) {
    const where: any = { courseId }
    if (tenantId) {
      where.tenantId = tenantId
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            cefrLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const reviewCount = reviews.length
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    let totalScore = 0
    for (const r of reviews) {
      totalScore += r.rating
      distribution[r.rating] = (distribution[r.rating] || 0) + 1
    }

    const averageRating =
      reviewCount > 0 ? Number((totalScore / reviewCount).toFixed(1)) : 5.0

    return {
      reviews,
      summary: {
        averageRating,
        reviewCount,
        distribution,
      },
    }
  }

  /**
   * Delete a review (Student author or SuperAdmin/CenterManager)
   */
  static async deleteReview(reviewId: string, user: AuthUser, tenantId: string) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, tenantId },
    })

    if (!review) {
      throw new AppError('Không tìm thấy đánh giá', 404, 'NOT_FOUND')
    }

    if (
      review.studentId !== user.id &&
      user.role !== 'SUPER_ADMIN' &&
      user.role !== 'CENTER_MANAGER'
    ) {
      throw new AppError('Bạn không có quyền xóa đánh giá này', 403, 'FORBIDDEN')
    }

    await prisma.review.delete({
      where: { id: reviewId },
    })

    // Invalidate course cache so ratings update immediately
    CacheService.deletePattern(`courses:${tenantId}`)

    return true
  }
}
