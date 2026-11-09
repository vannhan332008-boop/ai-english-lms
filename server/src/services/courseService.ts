import { prisma } from '../config/prisma.js'
import { AuditLogService } from './auditLogService.js'
import { CacheService } from '../utils/cache.js'
import type { CreateCourseInput, UpdateCourseInput } from '../validations/courseValidation.js'

function normalizeCourseType(type?: string, category?: string): 'IELTS' | 'TOEIC' | 'COMMUNICATION' | 'BUSINESS_ENGLISH' | 'KIDS_TEENS' {
  const val = (type || category || 'IELTS').toUpperCase()
  if (val.includes('BUSINESS')) return 'BUSINESS_ENGLISH'
  if (val.includes('KID') || val.includes('TEEN')) return 'KIDS_TEENS'
  if (val.includes('TOEIC')) return 'TOEIC'
  if (val.includes('COMMUNICATION') || val.includes('GIAO TIEP')) return 'COMMUNICATION'
  return 'IELTS'
}

export class CourseService {
  /**
   * Get all courses belonging to tenant (with fast memory caching)
   */
  static async getAll(tenantId: string, params?: { search?: string; type?: string; category?: string }) {
    const cacheKey = `courses:${tenantId}:list:${params?.type || 'all'}:${params?.category || 'all'}:${params?.search || 'all'}`

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = { tenantId }

        if (params?.type || params?.category) {
          const typeFilter = normalizeCourseType(params.type, params.category)
          where.type = typeFilter
        }

        if (params?.search) {
          where.OR = [
            { title: { contains: params.search, mode: 'insensitive' } },
            { code: { contains: params.search, mode: 'insensitive' } },
            { description: { contains: params.search, mode: 'insensitive' } },
          ]
        }

        const courses = await prisma.course.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                classes: true,
                modules: true,
                reviews: true,
              },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
            classes: {
              select: {
                id: true,
                name: true,
                status: true,
                _count: {
                  select: {
                    enrollments: true,
                  },
                },
              },
            },
          },
        })

        return courses.map((course) => {
          const totalEnrolled = course.classes.reduce((sum, cls) => sum + cls._count.enrollments, 0)
          const reviewCount = course.reviews.length
          const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0)
          const rating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 4.8

          return {
            id: course.id,
            title: course.title,
            code: course.code,
            type: course.type,
            category: course.type,
            description: course.description || '',
            targetLevel: course.targetLevel || '',
            level: course.targetLevel || '',
            price: course.price,
            priceVND: course.price,
            thumbnailUrl: course.thumbnailUrl || '',
            thumbnail: course.thumbnailUrl || '',
            lessonsCount: course._count.modules * 8 || 24,
            enrolledCount: totalEnrolled,
            enrolledStudents: totalEnrolled,
            classesCount: course._count.classes,
            rating,
            averageRating: rating,
            reviewCount,
            reviewsCount: reviewCount,
            createdAt: course.createdAt.toISOString(),
            updatedAt: course.updatedAt.toISOString(),
          }
        })
      },
      300 // 5 minutes TTL
    )
  }

  /**
   * Get single course details (with fast memory caching)
   */
  static async getById(id: string, tenantId: string) {
    const cacheKey = `courses:${tenantId}:detail:${id}`

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const course = await prisma.course.findFirst({
          where: { id, tenantId },
          include: {
            classes: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatar: true,
                  },
                },
                _count: {
                  select: {
                    enrollments: true,
                  },
                },
              },
            },
            modules: {
              include: {
                lessons: true,
              },
            },
            reviews: {
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
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        })

        if (!course) {
          return null
        }

        const totalEnrolled = course.classes.reduce((sum, cls) => sum + cls._count.enrollments, 0)
        const reviewCount = course.reviews.length
        const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 4.8

        return {
          ...course,
          category: course.type,
          level: course.targetLevel,
          priceVND: course.price,
          enrolledStudents: totalEnrolled,
          rating: averageRating,
          averageRating,
          reviewCount,
          reviewsCount: reviewCount,
        }
      },
      300
    )
  }

  /**
   * Create a new course with tenant isolation & DB persistence
   */
  static async create(tenantId: string, input: CreateCourseInput, actorId?: string, ipAddress?: string) {
    const courseType = normalizeCourseType(input.type, input.category)
    const code = input.code?.trim() || `${courseType.slice(0, 3)}-${Date.now().toString().slice(-6)}`

    // Create course in DB
    const course = await prisma.course.create({
      data: {
        tenantId,
        title: input.title.trim(),
        code,
        type: courseType,
        description: input.description?.trim() || null,
        targetLevel: (input.targetLevel || input.level)?.trim() || null,
        price: Number(input.price) || 0,
        thumbnailUrl: (input.thumbnailUrl || input.thumbnail)?.trim() || null,
      },
    })

    // Log governance audit trail
    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'COURSE_CREATE',
      resource: 'COURSE',
      resourceId: course.id,
      details: { title: course.title, code: course.code, type: course.type, price: course.price },
      ipAddress,
    })

    // Invalidate course cache for this tenant
    CacheService.deletePattern(`courses:${tenantId}`)

    return {
      id: course.id,
      title: course.title,
      code: course.code,
      type: course.type,
      category: course.type,
      description: course.description || '',
      targetLevel: course.targetLevel || '',
      level: course.targetLevel || '',
      price: course.price,
      priceVND: course.price,
      thumbnailUrl: course.thumbnailUrl || '',
      thumbnail: course.thumbnailUrl || '',
      lessonsCount: 0,
      enrolledCount: 0,
      enrolledStudents: 0,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }
  }

  /**
   * Update course details
   */
  static async update(id: string, tenantId: string, input: UpdateCourseInput, actorId?: string, ipAddress?: string) {
    const existing = await prisma.course.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      throw new Error('Khóa học không tồn tại trong cơ sở của bạn.')
    }

    const data: any = {}
    if (input.title !== undefined) data.title = input.title.trim()
    if (input.code !== undefined) data.code = input.code.trim()
    if (input.type !== undefined) data.type = normalizeCourseType(input.type)
    if (input.description !== undefined) data.description = input.description.trim()
    if (input.targetLevel !== undefined) data.targetLevel = input.targetLevel.trim()
    if (input.price !== undefined) data.price = Number(input.price)
    if (input.thumbnailUrl !== undefined) data.thumbnailUrl = input.thumbnailUrl.trim()

    const updated = await prisma.course.update({
      where: { id },
      data,
    })

    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'COURSE_UPDATE',
      resource: 'COURSE',
      resourceId: updated.id,
      details: { changes: data },
      ipAddress,
    })

    // Invalidate course cache for this tenant
    CacheService.deletePattern(`courses:${tenantId}`)

    return {
      ...updated,
      category: updated.type,
      level: updated.targetLevel,
      priceVND: updated.price,
    }
  }

  /**
   * Delete course
   */
  static async delete(id: string, tenantId: string, actorId?: string, ipAddress?: string) {
    const existing = await prisma.course.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { classes: true },
        },
      },
    })

    if (!existing) {
      throw new Error('Khóa học không tồn tại hoặc đã bị xóa trước đó.')
    }

    if (existing._count.classes > 0) {
      throw new Error(`Không thể xóa khóa học đang có ${existing._count.classes} lớp học liên kết. Vui lòng gỡ hoặc chuyển các lớp học trước.`)
    }

    await prisma.course.delete({
      where: { id },
    })

    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'COURSE_DELETE',
      resource: 'COURSE',
      resourceId: id,
      details: { title: existing.title, code: existing.code },
      ipAddress,
    })

    // Invalidate course cache for this tenant
    CacheService.deletePattern(`courses:${tenantId}`)

    return {
      success: true,
      id,
    }
  }
}

