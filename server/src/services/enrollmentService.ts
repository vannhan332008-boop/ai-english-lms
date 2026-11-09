import { prisma } from '../config/prisma.js'
import { AuditLogService } from './auditLogService.js'
import type { CreateEnrollmentInput } from '../validations/enrollmentValidation.js'

export class EnrollmentService {
  /**
   * Enroll a student into a course/class with RBAC & Tenant Isolation
   */
  static async enroll(
    tenantId: string,
    input: CreateEnrollmentInput,
    actorId?: string,
    ipAddress?: string
  ) {
    const studentId = (input.studentId || input.student_id)?.trim()
    const courseId = (input.courseId || input.course_id)?.trim()
    const classId = (input.classId || input.class_id)?.trim()

    if (!studentId) {
      throw new Error('Mã định danh học viên (studentId) là bắt buộc.')
    }

    // 1. Verify student exists and belongs to the same tenant
    const student = await prisma.user.findFirst({
      where: { id: studentId, tenantId },
    })

    if (!student) {
      throw new Error('Học viên không tồn tại trong cơ sở của bạn.')
    }

    if (student.role !== 'STUDENT') {
      throw new Error('Tài khoản được chọn không phải là học viên.')
    }

    // 2. Resolve target class
    let targetClass: any = null

    if (classId) {
      targetClass = await prisma.class.findFirst({
        where: { id: classId, tenantId },
        include: { course: true },
      })
      if (!targetClass) {
        throw new Error('Lớp học chỉ định không tồn tại trong cơ sở này.')
      }
    } else if (courseId) {
      const course = await prisma.course.findFirst({
        where: { id: courseId, tenantId },
      })
      if (!course) {
        throw new Error('Khóa học không tồn tại trong cơ sở của bạn.')
      }

      // Find an ongoing class for this course
      targetClass = await prisma.class.findFirst({
        where: { courseId, tenantId, status: 'ONGOING' },
        include: { course: true },
      })

      // If no ongoing class exists, auto-provision a default ongoing class
      if (!targetClass) {
        targetClass = await prisma.class.create({
          data: {
            tenantId,
            courseId,
            name: `${course.title} - Lớp Tiêu Chuẩn`,
            status: 'ONGOING',
            scheduleInfo: 'Linh hoạt',
            roomNumber: 'Phòng học trực tuyến',
          },
          include: { course: true },
        })
      }
    } else {
      throw new Error('Vui lòng chỉ định khóa học (courseId) hoặc lớp học (classId).')
    }

    // 3. Check for existing enrollment record
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        classId_studentId: {
          classId: targetClass.id,
          studentId: student.id,
        },
      },
    })

    let enrollmentRecord: any = null

    if (existingEnrollment) {
      if (existingEnrollment.status === 'ENROLLED') {
        throw new Error(
          `Học viên ${student.fullName} (${student.email}) đã được ghi danh vào khóa học này rồi.`
        )
      }

      // Re-activate dropped enrollment
      enrollmentRecord = await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: 'ENROLLED',
          enrolledAt: new Date(),
        },
        include: {
          class: {
            include: {
              course: true,
            },
          },
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
      })
    } else {
      enrollmentRecord = await prisma.enrollment.create({
        data: {
          classId: targetClass.id,
          studentId: student.id,
          status: 'ENROLLED',
          attendanceRate: 100.0,
        },
        include: {
          class: {
            include: {
              course: true,
            },
          },
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
      })
    }

    // 4. Log governance audit trail
    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'COURSE_ENROLLMENT',
      resource: 'ENROLLMENT',
      resourceId: enrollmentRecord.id,
      details: {
        studentId: student.id,
        studentName: student.fullName,
        studentEmail: student.email,
        courseId: targetClass.course.id,
        courseTitle: targetClass.course.title,
        classId: targetClass.id,
        className: targetClass.name,
      },
      ipAddress,
    })

    return {
      id: enrollmentRecord.id,
      status: enrollmentRecord.status,
      enrolledAt: enrollmentRecord.enrolledAt.toISOString(),
      student: enrollmentRecord.student,
      course: {
        id: targetClass.course.id,
        title: targetClass.course.title,
        code: targetClass.course.code,
      },
      class: {
        id: targetClass.id,
        name: targetClass.name,
      },
    }
  }

  /**
   * Get enrolled courses for a specific student (Student Portal)
   */
  static async getMyEnrolledCourses(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        status: 'ENROLLED',
      },
      include: {
        class: {
          include: {
            course: true,
            teacher: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    return enrollments.map((e) => {
      const course = e.class.course
      return {
        id: course.id,
        title: course.title,
        code: course.code,
        type: course.type,
        category: course.type,
        description: course.description || '',
        thumbnailUrl: course.thumbnailUrl || '',
        thumbnail: course.thumbnailUrl || '',
        targetLevel: course.targetLevel || '',
        level: course.targetLevel || '',
        price: course.price,
        enrollmentId: e.id,
        enrolledAt: e.enrolledAt.toISOString(),
        status: e.status,
        attendanceRate: e.attendanceRate,
        classId: e.class.id,
        className: e.class.name,
        teacherName: e.class.teacher?.fullName || 'Giảng viên chuyên môn',
        teacherAvatar:
          e.class.teacher?.avatar ||
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        progressPercent: Math.min(100, Math.max(10, Math.round(e.attendanceRate * 0.65))),
        nextLessonTitle: 'Bài học tiếp theo: Phương pháp Skimming & Scanning chuyên sâu',
      }
    })
  }

  /**
   * Get all students enrolled in a specific course
   */
  static async getCourseEnrollments(courseId: string, tenantId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        class: {
          courseId,
          tenantId,
        },
        status: 'ENROLLED',
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
            cefrLevel: true,
            streakDays: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    return enrollments.map((e) => ({
      enrollmentId: e.id,
      studentId: e.student.id,
      fullName: e.student.fullName,
      email: e.student.email,
      phone: e.student.phone,
      avatar: e.student.avatar,
      cefrLevel: e.student.cefrLevel,
      streakDays: e.student.streakDays,
      className: e.class.name,
      classId: e.class.id,
      enrolledAt: e.enrolledAt.toISOString(),
      attendanceRate: e.attendanceRate,
    }))
  }
}

