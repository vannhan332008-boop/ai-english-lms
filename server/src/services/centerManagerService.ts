import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'
import { AuditLogService } from './auditLogService.js'
import { EmailService } from './emailService.js'
import type {
  UpdateCenterProfileInput,
  CreateTeacherInput,
  CreateStudentInput,
  CsvStudentRow,
  CreateUserInput,
} from '../validations/centerValidation.js'

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
   * Get Center Profile details
   */
  static async getCenterProfile(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscriptionPlan: true,
      },
    })

    if (!tenant) {
      throw new Error('Không tìm thấy thông tin cơ sở trung tâm')
    }

    return {
      id: tenant.id,
      name: tenant.name,
      code: tenant.code,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone,
      address: tenant.address,
      city: tenant.city,
      aiTokenQuota: tenant.aiTokenQuota,
      aiTokensUsed: tenant.aiTokensUsed,
      planDetails: tenant.subscriptionPlan,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }
  }

  /**
   * Update Center Profile details
   */
  static async updateCenterProfile(
    tenantId: string,
    data: UpdateCenterProfileInput,
    actorId?: string,
    ipAddress?: string
  ) {
    const existing = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!existing) {
      throw new Error('Không tìm thấy thông tin cơ sở trung tâm')
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name !== undefined ? data.name : existing.name,
        contactEmail: data.contactEmail !== undefined ? data.contactEmail : existing.contactEmail,
        contactPhone: data.contactPhone !== undefined ? data.contactPhone : existing.contactPhone,
        address: data.address !== undefined ? data.address : existing.address,
        city: data.city !== undefined ? data.city : existing.city,
      },
    })

    // Record audit log
    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'TENANT_PROFILE_UPDATE',
      resource: 'TENANT',
      resourceId: tenantId,
      details: { previous: existing, updated: data },
      ipAddress,
    })

    return updated
  }

  /**
   * Get teachers belonging to the tenant with search and filter
   */
  static async getTeachers(
    tenantId: string,
    options?: { search?: string; status?: string; page?: number; limit?: number }
  ) {
    const whereClause: any = {
      tenantId,
      role: 'TEACHER',
    }

    if (options?.search) {
      whereClause.OR = [
        { fullName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } },
      ]
    }

    if (options?.status === 'ACTIVE') {
      whereClause.isActive = true
    } else if (options?.status === 'INACTIVE') {
      whereClause.isActive = false
    }

    const teachers = await prisma.user.findMany({
      where: whereClause,
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
   * Create a new teacher in tenant
   */
  static async createTeacher(
    tenantId: string,
    input: CreateTeacherInput,
    actorId?: string,
    ipAddress?: string
  ) {
    if (!tenantId) {
      const fallbackTenant = await prisma.tenant.findFirst({ select: { id: true } })
      tenantId = fallbackTenant?.id || ''
    }

    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    })
    if (existing) {
      throw new Error(`Email '${input.email}' đã được sử dụng trên hệ thống.`)
    }

    // Default password '030308'
    const passwordHash = await bcrypt.hash('030308', 10)

    const teacher = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash,
        fullName: input.fullName.trim(),
        role: 'TEACHER',
        tenantId,
        phone: input.phone || null,
        cefrLevel: (input.cefrLevel as any) || 'C1',
        isActive: true,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`,
      },
    })

    // If an initial class assignment was provided, link the teacher to that class
    if (input.assignedClassId) {
      const targetClass = await prisma.class.findFirst({
        where: { id: input.assignedClassId, tenantId },
      })
      if (targetClass) {
        await prisma.class.update({
          where: { id: targetClass.id },
          data: { teacherId: teacher.id },
        })
      }
    }

    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'TEACHER_CREATE',
      resource: 'USER',
      resourceId: teacher.id,
      details: { email: teacher.email, fullName: teacher.fullName },
      ipAddress,
    })

    return teacher
  }

  /**
   * Get students belonging to the tenant with search, class and status filter
   */
  static async getStudents(
    tenantId: string,
    options?: { search?: string; status?: string; classId?: string; page?: number; limit?: number }
  ) {
    const whereClause: any = {
      tenantId,
      role: 'STUDENT',
    }

    if (options?.search) {
      whereClause.OR = [
        { fullName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } },
      ]
    }

    if (options?.status === 'ACTIVE') {
      whereClause.isActive = true
    } else if (options?.status === 'INACTIVE') {
      whereClause.isActive = false
    }

    if (options?.classId) {
      whereClause.enrollments = {
        some: {
          classId: options.classId,
          status: 'ENROLLED',
        },
      }
    }

    const students = await prisma.user.findMany({
      where: whereClause,
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
          where: { status: 'ENROLLED' },
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
                    id: true,
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
      const activeEnrollment = student.enrollments[0]
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
        currentClassId: activeEnrollment?.class.id ?? null,
        currentClass: activeEnrollment?.class.name ?? 'Chưa xếp lớp',
        courseTitle: activeEnrollment?.class.course.title ?? 'IELTS Standard',
        createdAt: student.createdAt,
      }
    })
  }

  /**
   * Create a single new student and optionally enroll in a class
   */
  static async createStudent(
    tenantId: string,
    input: CreateStudentInput,
    actorId?: string,
    ipAddress?: string
  ) {
    if (!tenantId) {
      const fallbackTenant = await prisma.tenant.findFirst({ select: { id: true } })
      tenantId = fallbackTenant?.id || ''
    }

    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    })
    if (existing) {
      throw new Error(`Email '${input.email}' đã tồn tại trong hệ thống.`)
    }

    // Default password '030308'
    const passwordHash = await bcrypt.hash('030308', 10)

    const student = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash,
        fullName: input.fullName.trim(),
        role: 'STUDENT',
        tenantId,
        phone: input.phone || null,
        cefrLevel: (input.cefrLevel as any) || 'B1',
        isActive: true,
        avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?w=150`,
      },
    })

    // If classId specified, verify it belongs to this tenant and enroll
    if (input.classId) {
      const targetClass = await prisma.class.findFirst({
        where: { id: input.classId, tenantId },
      })
      if (!targetClass) {
        throw new Error('Lớp học chỉ định không tồn tại trong cơ sở của bạn.')
      }

      await prisma.enrollment.create({
        data: {
          classId: targetClass.id,
          studentId: student.id,
          status: 'ENROLLED',
          attendanceRate: 100.0,
        },
      })
    }

    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'STUDENT_CREATE',
      resource: 'USER',
      resourceId: student.id,
      details: { email: student.email, fullName: student.fullName, classId: input.classId },
      ipAddress,
    })

    // Trigger welcome email asynchronously
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, primaryColor: true }
    }).then(tenantInfo => {
      EmailService.sendWelcomeEmail({
        to: student.email,
        fullName: student.fullName,
        role: 'STUDENT',
        temporaryPassword: 'Mặc định (030308)',
        loginUrl: `${process.env.APP_URL || 'http://localhost:5173'}/login`,
        centerName: tenantInfo?.name || 'EnglishFlow LMS',
        primaryColor: tenantInfo?.primaryColor || '#4f46e5',
      }).catch(err => console.error('[CenterManagerService] Error sending welcome email to student:', err))
    }).catch(() => {})

    return student
  }

  /**
   * Batch Import Students from CSV rows with detailed error reporting
   */
  static async batchImportStudents(
    tenantId: string,
    rows: CsvStudentRow[],
    actorId?: string,
    ipAddress?: string
  ) {
    if (!tenantId) {
      const fallbackTenant = await prisma.tenant.findFirst({ select: { id: true } })
      tenantId = fallbackTenant?.id || ''
    }

    if (!rows || rows.length === 0) {
      throw new Error('Danh sách hàng trống, không có dữ liệu để nhập.')
    }

    // 1. Fetch all tenant classes for matching by name or id
    const tenantClasses = await prisma.class.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    })

    const classMapByName = new Map<string, string>()
    const classIdSet = new Set<string>()
    tenantClasses.forEach((c) => {
      classMapByName.set(c.name.toLowerCase().trim(), c.id)
      classIdSet.add(c.id)
    })

    // 2. Fetch existing emails to prevent collisions
    const emailsInBatch = rows.map((r) => r.email.toLowerCase().trim())
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: emailsInBatch } },
      select: { email: true },
    })
    const existingEmailSet = new Set(existingUsers.map((u) => u.email.toLowerCase()))

    const seenInThisImport = new Set<string>()
    const errors: Array<{ row: number; email: string; error: string }> = []
    const validRows: Array<{
      fullName: string
      email: string
      phone?: string
      cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
      targetClassId?: string
    }> = []

    const passwordHash = await bcrypt.hash('030308', 10)

    rows.forEach((row, index) => {
      const rowNum = index + 1
      const normalizedEmail = (row.email || '').toLowerCase().trim()

      if (!row.fullName || row.fullName.trim().length < 2) {
        errors.push({ row: rowNum, email: normalizedEmail, error: 'Họ tên không được để trống hoặc dưới 2 ký tự' })
        return
      }

      if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        errors.push({ row: rowNum, email: normalizedEmail, error: 'Email không đúng định dạng' })
        return
      }

      if (existingEmailSet.has(normalizedEmail)) {
        errors.push({ row: rowNum, email: normalizedEmail, error: 'Email đã tồn tại trên hệ thống' })
        return
      }

      if (seenInThisImport.has(normalizedEmail)) {
        errors.push({ row: rowNum, email: normalizedEmail, error: 'Email bị trùng lặp trong file CSV' })
        return
      }

      // Resolve class
      let targetClassId: string | undefined
      if (row.classId && classIdSet.has(row.classId)) {
        targetClassId = row.classId
      } else if (row.className && classMapByName.has(row.className.toLowerCase().trim())) {
        targetClassId = classMapByName.get(row.className.toLowerCase().trim())
      }

      seenInThisImport.add(normalizedEmail)
      validRows.push({
        fullName: row.fullName.trim(),
        email: normalizedEmail,
        phone: row.phone?.trim() || undefined,
        cefrLevel: row.cefrLevel || 'B1',
        targetClassId,
      })
    })

    // 3. Insert valid rows in transaction
    let importedCount = 0
    if (validRows.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const row of validRows) {
          const user = await tx.user.create({
            data: {
              email: row.email,
              passwordHash,
              fullName: row.fullName,
              role: 'STUDENT',
              tenantId,
              phone: row.phone || null,
              cefrLevel: row.cefrLevel,
              isActive: true,
              avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?w=150`,
            },
          })

          if (row.targetClassId) {
            await tx.enrollment.create({
              data: {
                classId: row.targetClassId,
                studentId: user.id,
                status: 'ENROLLED',
                attendanceRate: 100.0,
              },
            })
          }
          importedCount++
        }
      })

      await AuditLogService.logAction({
        tenantId,
        userId: actorId,
        action: 'STUDENT_IMPORT_CSV',
        resource: 'USER',
        details: { totalRows: rows.length, successCount: importedCount, errorCount: errors.length },
        ipAddress,
      })
    }

    return {
      totalRows: rows.length,
      successCount: importedCount,
      failedCount: errors.length,
      errors,
    }
  }

  /**
   * Transfer student to another class in the same tenant
   */
  static async transferStudentClass(
    tenantId: string,
    studentId: string,
    targetClassId: string,
    currentClassId?: string,
    reason?: string,
    actorId?: string,
    ipAddress?: string
  ) {
    // 1. Verify student belongs to this tenant
    const student = await prisma.user.findFirst({
      where: { id: studentId, tenantId, role: 'STUDENT' },
    })
    if (!student) {
      throw new Error('Học viên không tồn tại trong cơ sở của bạn.')
    }

    // 2. Verify target class belongs to this tenant
    const targetClass = await prisma.class.findFirst({
      where: { id: targetClassId, tenantId },
    })
    if (!targetClass) {
      throw new Error('Lớp học đích không thuộc cơ sở này.')
    }

    // 3. Complete or update previous enrollment
    const prevEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        status: 'ENROLLED',
        ...(currentClassId ? { classId: currentClassId } : {}),
      },
    })

    await prisma.$transaction(async (tx) => {
      if (prevEnrollment) {
        await tx.enrollment.update({
          where: { id: prevEnrollment.id },
          data: { status: 'DROPPED' },
        })
      }

      // Check if already has an enrollment record in target class
      const existingInTarget = await tx.enrollment.findUnique({
        where: {
          classId_studentId: {
            classId: targetClassId,
            studentId,
          },
        },
      })

      if (existingInTarget) {
        await tx.enrollment.update({
          where: { id: existingInTarget.id },
          data: { status: 'ENROLLED' },
        })
      } else {
        await tx.enrollment.create({
          data: {
            classId: targetClassId,
            studentId,
            status: 'ENROLLED',
            attendanceRate: prevEnrollment?.attendanceRate ?? 100.0,
          },
        })
      }
    })

    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'CLASS_TRANSFER',
      resource: 'ENROLLMENT',
      resourceId: studentId,
      details: {
        studentId,
        studentName: student.fullName,
        fromClassId: prevEnrollment?.classId || null,
        toClassId: targetClassId,
        targetClassName: targetClass.name,
        reason: reason || 'Chuyển lớp theo yêu cầu',
      },
      ipAddress,
    })

    return {
      success: true,
      studentId,
      newClassId: targetClassId,
      newClassName: targetClass.name,
    }
  }

  /**
   * Toggle user active/inactive status
   */
  static async toggleUserStatus(
    tenantId: string,
    userId: string,
    forcedStatus?: boolean,
    actorId?: string,
    ipAddress?: string
  ) {
    if (userId === actorId) {
      throw new Error('Bạn không thể tự vô hiệu hóa tài khoản của chính mình.')
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    })
    if (!user) {
      throw new Error('Không tìm thấy tài khoản trong cơ sở của bạn.')
    }

    const newStatus = forcedStatus !== undefined ? forcedStatus : !user.isActive

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: newStatus },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    })

    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'USER_STATUS_TOGGLE',
      resource: 'USER',
      resourceId: userId,
      details: { targetEmail: user.email, previousStatus: user.isActive, newStatus },
      ipAddress,
    })

    return updated
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

  /**
   * Get audit logs for center
   */
  static async getAuditLogs(tenantId: string, limit = 50) {
    return AuditLogService.getTenantLogs(tenantId, limit)
  }

  /**
   * Get all users for center (managers, teachers, students)
   */
  static async getUsers(tenantId: string, options?: { search?: string; role?: string; status?: string }) {
    const where: any = { tenantId }

    if (options?.role && options.role !== 'ALL') {
      where.role = options.role
    }

    if (options?.status && options.status !== 'ALL') {
      where.isActive = options.status === 'ACTIVE'
    }

    if (options?.search) {
      where.OR = [
        { fullName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            enrollments: true,
            teachingClasses: true,
          },
        },
      },
    })

    return users.map((u) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      phone: u.phone || '0912 345 678',
      role: u.role,
      status: u.isActive ? 'ACTIVE' : 'INACTIVE',
      avatar: u.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      enrolledCoursesCount: u._count.enrollments || u._count.teachingClasses || 0,
      cefrLevel: u.cefrLevel || 'B2',
      streakDays: u.streakDays,
      createdAt: u.createdAt.toISOString().slice(0, 10),
    }))
  }

  /**
   * Create a new user with tenant isolation & DB persistence
   */
  static async createUser(
    tenantId: string,
    input: CreateUserInput,
    actorId?: string,
    ipAddress?: string
  ) {
    if (!tenantId) {
      const fallbackTenant = await prisma.tenant.findFirst({ select: { id: true } })
      tenantId = fallbackTenant?.id || ''
    }

    const fullName = (input.fullName || input.name || '').trim()
    if (!fullName) {
      throw new Error('Họ và tên người dùng không được để trống')
    }

    const email = input.email.toLowerCase().trim()
    const existing = await prisma.user.findUnique({
      where: { email },
    })
    if (existing) {
      throw new Error(`Email '${email}' đã tồn tại trong hệ thống.`)
    }

    const passwordHash = await bcrypt.hash('030308', 10)

    const user = await prisma.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
        fullName,
        role: input.role,
        phone: input.phone || null,
        cefrLevel: (input.cefrLevel as any) || 'B1',
        isActive: true,
        avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?w=150`,
      },
    })

    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'USER_INVITE',
      resource: 'USER',
      resourceId: user.id,
      details: { email: user.email, fullName: user.fullName, role: user.role },
      ipAddress,
    })

    // Trigger welcome email asynchronously
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, primaryColor: true }
    }).then(tenantInfo => {
      EmailService.sendWelcomeEmail({
        to: user.email,
        fullName: user.fullName,
        role: user.role,
        tempPassword: 'Mặc định (030308)',
        loginUrl: `${process.env.APP_URL || 'http://localhost:5173'}/login`,
        centerName: tenantInfo?.name || 'EnglishFlow LMS',
        primaryColor: tenantInfo?.primaryColor || '#4f46e5',
      }).catch(err => console.error('[CenterManagerService] Error sending welcome email to user:', err))
    }).catch(() => {})

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone || '0912 345 678',
      role: user.role,
      status: user.isActive ? 'ACTIVE' : 'INACTIVE',
      avatar: user.avatar,
      enrolledCoursesCount: 0,
      cefrLevel: user.cefrLevel,
      streakDays: 0,
      createdAt: user.createdAt.toISOString().slice(0, 10),
    }
  }
}
