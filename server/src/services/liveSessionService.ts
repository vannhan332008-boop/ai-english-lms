import { prisma } from '../config/prisma.js'
import { MeetingPlatform } from '@prisma/client'
import { AppError } from '../utils/errors.js'
import { NotificationService } from './notificationService.js'
import type { CreateLiveSessionInput, UpdateLiveSessionInput } from '../validations/liveSessionValidation.js'
import type { AuthUser } from '../types/auth.js'

function generateRandomSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const part = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `efl-${part(3)}-${part(4)}`
}

function generateRandomNumeric(len = 10): string {
  let res = ''
  for (let i = 0; i < len; i++) {
    res += Math.floor(Math.random() * 10).toString()
  }
  return res
}

export class LiveSessionService {
  /**
   * Auto-generate standard meeting URL for Zoom / Google Meet / Teams
   */
  static generateDefaultMeetingUrl(platform: MeetingPlatform = MeetingPlatform.GOOGLE_MEET, courseId: string): string {
    switch (platform) {
      case MeetingPlatform.GOOGLE_MEET:
        return `https://meet.google.com/${generateRandomSlug()}`
      case MeetingPlatform.ZOOM:
        return `https://zoom.us/j/${generateRandomNumeric(10)}?pwd=${generateRandomSlug().replace(/-/g, '')}`
      case MeetingPlatform.MICROSOFT_TEAMS:
        return `https://teams.microsoft.com/l/meetup-join/efl-${generateRandomSlug()}`
      case MeetingPlatform.INTERNAL_ROOM:
      default:
        return `https://meet.google.com/${generateRandomSlug()}`
    }
  }

  /**
   * Create a new live session
   */
  static async createSession(input: CreateLiveSessionInput, user: AuthUser, tenantId: string) {
    // 1. Verify course
    const course = await prisma.course.findFirst({
      where: {
        id: input.courseId,
        tenantId,
      },
    })

    if (!course) {
      throw new AppError('Khóa học không tồn tại trong hệ thống trung tâm', 404, 'NOT_FOUND')
    }

    // 2. Verify class if specified
    if (input.classId) {
      const cls = await prisma.class.findFirst({
        where: {
          id: input.classId,
          courseId: input.courseId,
          tenantId,
        },
      })
      if (!cls) {
        throw new AppError('Lớp học không tồn tại hoặc không thuộc khóa học này', 404, 'NOT_FOUND')
      }
    }

    const startDate = new Date(input.startTime)
    const endDate = new Date(input.endTime)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new AppError('Thời gian bắt đầu hoặc kết thúc không hợp lệ', 400, 'BAD_REQUEST')
    }

    if (endDate <= startDate) {
      throw new AppError('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu', 400, 'BAD_REQUEST')
    }

    // Teacher assignment
    let teacherId = input.teacherId
    if (!teacherId && user.role === 'TEACHER') {
      teacherId = user.id
    }

    // Generate meeting URL if empty
    const platform = (input.meetingPlatform as MeetingPlatform) || MeetingPlatform.GOOGLE_MEET
    const meetingUrl = input.meetingUrl && input.meetingUrl.trim().length > 0
      ? input.meetingUrl.trim()
      : this.generateDefaultMeetingUrl(platform, course.id)

    // Create session in DB
    const session = await prisma.liveSession.create({
      data: {
        tenantId,
        courseId: input.courseId,
        classId: input.classId || null,
        teacherId: teacherId || null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        startTime: startDate,
        endTime: endDate,
        meetingUrl,
        meetingPlatform: platform,
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
        class: { select: { id: true, name: true, roomNumber: true } },
        teacher: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    })

    // Notify enrolled students asynchronously
    void (async () => {
      try {
        const studentEnrollments = await prisma.enrollment.findMany({
          where: {
            status: 'ENROLLED',
            ...(input.classId
              ? { classId: input.classId }
              : { class: { courseId: input.courseId } }),
          },
          select: { studentId: true },
        })

        for (const enroll of studentEnrollments) {
          await NotificationService.createNotification({
            tenantId,
            userId: enroll.studentId,
            title: `Lịch học trực tuyến mới: ${session.title}`,
            message: `Buổi học trực tuyến môn "${course.title}" đã được lên lịch vào lúc ${startDate.toLocaleTimeString('vi-VN')} ngày ${startDate.toLocaleDateString('vi-VN')}.`,
            type: 'REMINDER',
            link: `/learning-room/${course.id}?tab=live-sessions`,
          }).catch(() => null)
        }
      } catch (err) {
        console.error('Failed to dispatch live session notifications:', err)
      }
    })()

    return session
  }

  /**
   * Get live sessions with strict tenant and role isolation
   */
  static async getSessions(
    tenantId: string,
    user: AuthUser,
    filters: {
      courseId?: string
      classId?: string
      upcomingOnly?: boolean
    }
  ) {
    const whereClause: any = {
      tenantId,
    }

    if (filters.courseId) {
      whereClause.courseId = filters.courseId
    }

    if (filters.classId) {
      whereClause.classId = filters.classId
    }

    if (filters.upcomingOnly) {
      whereClause.endTime = { gte: new Date(Date.now() - 30 * 60 * 1000) } // include ongoing
      whereClause.isCancelled = false
    }

    // Role-specific filtering
    if (user.role === 'STUDENT') {
      const studentEnrollments = await prisma.enrollment.findMany({
        where: {
          studentId: user.id,
          status: 'ENROLLED',
        },
        include: {
          class: {
            select: {
              id: true,
              courseId: true,
            },
          },
        },
      })

      if (studentEnrollments.length === 0) {
        return []
      }

      const enrolledCourseIds = [...new Set(studentEnrollments.map((e) => e.class.courseId))]
      const enrolledClassIds = [...new Set(studentEnrollments.map((e) => e.class.id))]

      whereClause.AND = [
        {
          OR: [
            // Session for the whole course
            { courseId: { in: enrolledCourseIds }, classId: null },
            // Session for specific enrolled class
            ...(enrolledClassIds.length > 0 ? [{ classId: { in: enrolledClassIds } }] : []),
          ],
        },
      ]
    }

    const sessions = await prisma.liveSession.findMany({
      where: whereClause,
      include: {
        course: { select: { id: true, title: true, code: true } },
        class: { select: { id: true, name: true, roomNumber: true } },
        teacher: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return sessions
  }

  /**
   * Get single live session by ID with security checks
   */
  static async getSessionById(id: string, tenantId: string, user: AuthUser) {
    const session = await prisma.liveSession.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
        class: { select: { id: true, name: true, roomNumber: true } },
        teacher: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    })

    if (!session) {
      throw new AppError('Không tìm thấy buổi học trực tuyến', 404, 'NOT_FOUND')
    }

    if (user.role === 'STUDENT') {
      const hasEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: user.id,
          status: 'ENROLLED',
          class: {
            courseId: session.courseId,
          },
          ...(session.classId ? { classId: session.classId } : {}),
        },
      })

      if (!hasEnrollment) {
        throw new AppError('Học viên không có quyền truy cập vào buổi học của lớp này', 403, 'FORBIDDEN')
      }
    }

    return session
  }

  /**
   * Update session details
   */
  static async updateSession(id: string, tenantId: string, input: UpdateLiveSessionInput) {
    const existing = await prisma.liveSession.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      throw new AppError('Không tìm thấy buổi học trực tuyến', 404, 'NOT_FOUND')
    }

    const updateData: any = {}

    if (input.title !== undefined) updateData.title = input.title.trim()
    if (input.description !== undefined) updateData.description = input.description?.trim() || null
    if (input.meetingPlatform !== undefined) updateData.meetingPlatform = input.meetingPlatform
    if (input.meetingUrl !== undefined) {
      updateData.meetingUrl = input.meetingUrl?.trim() || this.generateDefaultMeetingUrl(input.meetingPlatform || existing.meetingPlatform, existing.courseId)
    }
    if (input.isCancelled !== undefined) updateData.isCancelled = input.isCancelled
    if (input.classId !== undefined) updateData.classId = input.classId || null
    if (input.teacherId !== undefined) updateData.teacherId = input.teacherId || null

    if (input.startTime || input.endTime) {
      const start = input.startTime ? new Date(input.startTime) : existing.startTime
      const end = input.endTime ? new Date(input.endTime) : existing.endTime

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError('Thời gian bắt đầu hoặc kết thúc không hợp lệ', 400, 'BAD_REQUEST')
      }

      if (end <= start) {
        throw new AppError('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu', 400, 'BAD_REQUEST')
      }

      updateData.startTime = start
      updateData.endTime = end
    }

    const updated = await prisma.liveSession.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, title: true, code: true } },
        class: { select: { id: true, name: true, roomNumber: true } },
        teacher: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    })

    return updated
  }

  /**
   * Delete session
   */
  static async deleteSession(id: string, tenantId: string) {
    const existing = await prisma.liveSession.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      throw new AppError('Không tìm thấy buổi học trực tuyến', 404, 'NOT_FOUND')
    }

    await prisma.liveSession.delete({
      where: { id },
    })

    return true
  }
}
