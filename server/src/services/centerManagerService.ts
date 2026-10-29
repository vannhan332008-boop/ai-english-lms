import { prisma } from '../config/prisma.js'

export class CenterManagerService {
  /**
   * Get stats for a specific tenant
   */
  static async getTenantStats(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscriptionPlan: true,
      },
    })

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      activeClasses,
      enrollments,
      courses,
      recentSubmissions,
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId, role: 'STUDENT' } }),
      prisma.user.count({ where: { tenantId, role: 'TEACHER' } }),
      prisma.class.count({ where: { tenantId } }),
      prisma.class.count({ where: { tenantId, status: 'ONGOING' } }),
      prisma.enrollment.findMany({
        where: { class: { tenantId } },
        select: { attendanceRate: true, finalGrade: true },
      }),
      prisma.course.findMany({
        where: { tenantId },
        select: { id: true, price: true, _count: { select: { classes: true } } },
      }),
      prisma.submission.count({
        where: { tenantId, status: 'AI_EVALUATED' },
      }),
    ])

    // Average attendance
    const avgAttendance =
      enrollments.length > 0
        ? Math.round(
            (enrollments.reduce((sum, e) => sum + e.attendanceRate, 0) / enrollments.length) * 10
          ) / 10
        : 95.0

    // Estimated monthly tuition revenue (sum of enrolled students * average course price)
    const estimatedTuitionRevenue = enrollments.length * 9500000

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        code: tenant.code,
        city: tenant.city,
        plan: tenant.plan,
        aiTokenQuota: tenant.aiTokenQuota,
        aiTokensUsed: tenant.aiTokensUsed,
        aiUsagePercent:
          tenant.aiTokenQuota > 0
            ? Math.round((tenant.aiTokensUsed / tenant.aiTokenQuota) * 100)
            : 0,
      },
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        activeClasses,
        totalCourses: courses.length,
        avgAttendance,
        estimatedRevenue: estimatedTuitionRevenue,
        recentSubmissions,
        atRiskStudentsCount: enrollments.filter((e) => e.attendanceRate < 80).length,
      },
    }
  }

  /**
   * Get teachers belonging to the tenant
   */
  static async getTeachers(tenantId: string) {
    const teachers = await prisma.user.findMany({
      where: {
        tenantId,
        role: 'TEACHER',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        cefrLevel: true,
        isActive: true,
        createdAt: true,
        teachingClasses: {
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
      orderBy: { createdAt: 'desc' },
    })

    return teachers.map((teacher) => ({
      ...teacher,
      activeClassesCount: teacher.teachingClasses.filter((c) => c.status === 'ONGOING').length,
      totalStudentsTaught: teacher.teachingClasses.reduce(
        (sum, c) => sum + c._count.enrollments,
        0
      ),
    }))
  }

  /**
   * Get students belonging to the tenant
   */
  static async getStudents(tenantId: string) {
    const students = await prisma.user.findMany({
      where: {
        tenantId,
        role: 'STUDENT',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        cefrLevel: true,
        streakDays: true,
        isActive: true,
        createdAt: true,
        enrollments: {
          select: {
            id: true,
            status: true,
            attendanceRate: true,
            finalGrade: true,
            class: {
              select: {
                id: true,
                name: true,
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return students.map((student) => {
      const activeEnrollment = student.enrollments.find((e) => e.status === 'ENROLLED')
      return {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone || '0901234567',
        avatar: student.avatar,
        targetBand: 'IELTS 7.0',
        currentLevel: student.cefrLevel,
        streakDays: student.streakDays,
        isActive: student.isActive,
        attendanceRate: activeEnrollment?.attendanceRate ?? 95,
        currentClass: activeEnrollment?.class.name ?? 'Chưa xếp lớp',
        courseTitle: activeEnrollment?.class.course.title ?? 'IELTS Standard',
        createdAt: student.createdAt,
      }
    })
  }

  /**
   * Get classes belonging to the tenant
   */
  static async getClasses(tenantId: string) {
    const classes = await prisma.class.findMany({
      where: { tenantId },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            code: true,
            type: true,
            targetLevel: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return classes.map((c) => ({
      id: c.id,
      name: c.name,
      roomNumber: c.roomNumber || 'Phòng trực tuyến',
      scheduleInfo: c.scheduleInfo || 'Linh hoạt',
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      teacher: c.teacher,
      course: c.course,
      studentCount: c._count.enrollments,
      assignmentCount: c._count.assignments,
    }))
  }
}

