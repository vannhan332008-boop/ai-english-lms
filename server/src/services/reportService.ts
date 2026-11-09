import { prisma } from '../config/prisma.js'

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

export class ReportService {
  /**
   * Real student dashboard statistics
   */
  static async getStudentDashboardStats(studentId: string, tenantId: string) {
    // 1. Get student enrollments with class & course
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                targetLevel: true,
              },
            },
          },
        },
      },
    })

    const classIds = enrollments.map((e) => e.classId)

    // 2. Total assignments for these classes
    const assignments = await prisma.assignment.findMany({
      where: {
        classId: { in: classIds },
        tenantId,
      },
      select: {
        id: true,
        title: true,
        type: true,
        dueDate: true,
        maxScore: true,
        classId: true,
      },
    })

    // 3. Submissions by student
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        tenantId,
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            type: true,
            classId: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    const completedSubmissionMap = new Map(
      submissions
        .filter((s) => !s.isDraft)
        .map((s) => [s.assignmentId, s])
    )

    // Pending assignments (not submitted, or draft)
    const pendingAssignments = assignments.filter((a) => !completedSubmissionMap.has(a.id))

    // Graded submissions
    const gradedSubmissions = submissions.filter(
      (s) => !s.isDraft && s.score !== null && s.score !== undefined
    )

    // Calculate average score (percentage)
    let averagePercentage = 0
    if (gradedSubmissions.length > 0) {
      const sum = gradedSubmissions.reduce((acc, curr) => {
        const max = curr.assignment?.maxScore || 10
        const pct = ((curr.score || 0) / max) * 100
        return acc + pct
      }, 0)
      averagePercentage = Math.round((sum / gradedSubmissions.length) * 10) / 10
    }

    // Weekly activity trend (last 7 days)
    const today = new Date()
    const weeklyProgress: { day: string; score: number; submissions: number }[] = []
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() - i)
      const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0)
      const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59)

      const daySubs = submissions.filter((s) => {
        const subDate = new Date(s.submittedAt)
        return subDate >= dayStart && subDate <= dayEnd
      })

      const dayName = dayNames[targetDate.getDay()]
      const avgScore =
        daySubs.length > 0
          ? Math.round(
              (daySubs.reduce((acc, s) => acc + (s.score || 0), 0) / daySubs.length) * 10
            ) / 10
          : 0

      weeklyProgress.push({
        day: dayName,
        score: avgScore,
        submissions: daySubs.length,
      })
    }

    // User profile for streak and CEFR
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        fullName: true,
        streakDays: true,
        cefrLevel: true,
        lastActiveAt: true,
      },
    })

    // Compute progress per enrolled class/course
    const enrolledCoursesData = enrollments.map((e) => {
      const classAssignments = assignments.filter((a) => a.classId === e.classId)
      const completedClassAssignments = classAssignments.filter((a) => completedSubmissionMap.has(a.id))
      const progressPct =
        classAssignments.length > 0
          ? Math.round((completedClassAssignments.length / classAssignments.length) * 100)
          : e.status === 'COMPLETED'
          ? 100
          : 0

      return {
        id: e.class.course.id,
        title: e.class.course.title,
        level: e.class.course.targetLevel,
        thumbnail: e.class.course.thumbnailUrl,
        className: e.class.name,
        progress: progressPct,
        status: e.status,
      }
    })

    return {
      enrolledCourses: enrolledCoursesData,
      stats: {
        enrolledCount: enrollments.length,
        completedCoursesCount: enrollments.filter((e) => e.status === 'COMPLETED').length,
        pendingAssignmentsCount: pendingAssignments.length,
        completedAssignmentsCount: completedSubmissionMap.size,
        averagePercentage,
        streakDays: student?.streakDays || 0,
        cefrLevel: student?.cefrLevel || 'B1',
      },
      weeklyProgress,
      recentSubmissions: submissions.slice(0, 5).map((s) => ({
        id: s.id,
        assignmentTitle: s.assignment?.title || 'Bài tập',
        score: s.score,
        maxScore: s.assignment?.maxScore || 10,
        status: s.status,
        isLate: s.isLate,
        submittedAt: s.submittedAt,
        teacherFeedback: s.teacherFeedback,
      })),
    }
  }

  /**
   * Real center dashboard statistics (Multi-tenant scoped)
   */
  static async getCenterDashboardStats(tenantId: string) {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      totalClasses,
      totalAssignments,
      submissions,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId, role: 'STUDENT', isActive: true } }),
      prisma.user.count({ where: { tenantId, role: 'TEACHER', isActive: true } }),
      prisma.course.count({ where: { tenantId } }),
      prisma.class.count({ where: { tenantId } }),
      prisma.assignment.count({ where: { tenantId } }),
      prisma.submission.findMany({
        where: { tenantId, isDraft: false },
        select: { score: true, status: true, isLate: true },
      }),
      prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, fullName: true, role: true } },
        },
      }),
    ])

    const gradedSubmissions = submissions.filter((s) => s.score !== null && s.score !== undefined)
    const avgScore =
      gradedSubmissions.length > 0
        ? Math.round(
            (gradedSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0) /
              gradedSubmissions.length) *
              10
          ) / 10
        : 0

    const lateCount = submissions.filter((s) => s.isLate).length

    return {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalClasses,
      totalAssignments,
      totalSubmissions: submissions.length,
      averageScore: avgScore,
      lateSubmissionsCount: lateCount,
      recentAuditLogs: recentAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        userName: log.user?.fullName || 'Hệ thống',
        userRole: log.user?.role || 'SYSTEM',
        createdAt: log.createdAt,
      })),
    }
  }

  /**
   * Export students CSV with UTF-8 BOM
   */
  static async exportStudentsCsv(tenantId: string): Promise<string> {
    const students = await prisma.user.findMany({
      where: { tenantId, role: 'STUDENT' },
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                course: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'Mã học viên',
      'Họ và tên',
      'Email',
      'Số điện thoại',
      'Trình độ CEFR',
      'Chuỗi ngày học',
      'Khóa học / Lớp học',
      'Tỉ lệ chuyên cần (%)',
      'Trạng thái',
      'Ngày tham gia',
    ]

    const rows: string[] = [headers.map(escapeCsv).join(',')]

    for (const s of students) {
      const classList = s.enrollments
        .map((e) => `${e.class.course?.title || 'Khóa học'} (${e.class.name})`)
        .join('; ')
      const avgAttendance =
        s.enrollments.length > 0
          ? Math.round(
              s.enrollments.reduce((acc: number, e) => acc + (e.attendanceRate || 100), 0) /
                s.enrollments.length
            )
          : 100

      const row = [
        s.id,
        s.fullName,
        s.email,
        s.phone || '',
        s.cefrLevel,
        s.streakDays,
        classList || 'Chưa ghi danh',
        avgAttendance,
        s.isActive ? 'Đang hoạt động' : 'Đã khóa',
        s.createdAt.toISOString().slice(0, 10),
      ]
      rows.push(row.map(escapeCsv).join(','))
    }

    // Prepend UTF-8 BOM so Microsoft Excel renders Vietnamese characters correctly
    return '\uFEFF' + rows.join('\r\n')
  }

  /**
   * Export grades & submissions CSV with UTF-8 BOM
   */
  static async exportGradesCsv(tenantId: string, classId?: string): Promise<string> {
    const where: any = { tenantId, isDraft: false }
    if (classId) {
      where.assignment = { classId }
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        assignment: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            class: { select: { name: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    const headers = [
      'Mã bài nộp',
      'Họ tên học viên',
      'Email học viên',
      'Lớp học',
      'Tên bài tập',
      'Hình thức',
      'Điểm đạt được',
      'Thang điểm',
      'Tỉ lệ (%)',
      'Trạng thái',
      'Nộp trễ hạn',
      'Thời gian nộp',
      'Nhận xét của giảng viên',
    ]

    const rows: string[] = [headers.map(escapeCsv).join(',')]

    for (const sub of submissions) {
      const maxScore = sub.assignment?.maxScore || 10
      const score = sub.score !== null ? sub.score : ''
      const pct = sub.score !== null ? Math.round(((sub.score || 0) / maxScore) * 100) : ''
      const statusLabel =
        sub.status === 'TEACHER_APPROVED'
          ? 'Đã chấm điểm'
          : sub.status === 'SUBMITTED'
          ? 'Chờ chấm'
          : sub.status === 'RETURNED'
          ? 'Yêu cầu làm lại'
          : sub.status

      const row = [
        sub.id,
        sub.student.fullName,
        sub.student.email,
        sub.assignment?.class?.name || '',
        sub.assignment?.title || '',
        sub.assignment?.type || '',
        score,
        maxScore,
        pct !== '' ? `${pct}%` : '',
        statusLabel,
        sub.isLate ? 'Có (Trễ)' : 'Không (Đúng hạn)',
        sub.submittedAt.toISOString().replace('T', ' ').slice(0, 19),
        sub.teacherFeedback || '',
      ]
      rows.push(row.map(escapeCsv).join(','))
    }

    return '\uFEFF' + rows.join('\r\n')
  }

  /**
   * Filter and query Audit Logs with tenant isolation
   */
  static async getAuditLogs(
    tenantId: string | null,
    options: {
      action?: string
      resource?: string
      startDate?: string
      endDate?: string
      page?: number
      limit?: number
    } = {}
  ) {
    const page = Math.max(1, options.page || 1)
    const limit = Math.min(100, Math.max(1, options.limit || 20))
    const skip = (page - 1) * limit

    const where: any = {}
    if (tenantId) {
      where.tenantId = tenantId
    }
    if (options.action) {
      where.action = { contains: options.action, mode: 'insensitive' }
    }
    if (options.resource) {
      where.resource = options.resource
    }
    if (options.startDate || options.endDate) {
      where.createdAt = {}
      if (options.startDate) {
        where.createdAt.gte = new Date(options.startDate)
      }
      if (options.endDate) {
        where.createdAt.lte = new Date(options.endDate)
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true, role: true } },
          tenant: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return {
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        details: log.details
          ? typeof log.details === 'string'
            ? (() => {
                try {
                  return JSON.parse(log.details)
                } catch {
                  return log.details
                }
              })()
            : log.details
          : null,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        user: log.user,
        tenant: log.tenant,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    }
  }
}
