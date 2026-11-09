import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/errors.js'
import { AuditLogService } from './auditLogService.js'
import { NotificationService } from './notificationService.js'
import type {
  CreateAssignmentInput,
  SubmitAssignmentInput,
  GradeSubmissionInput,
} from '../validations/assignmentValidation.js'

export class AssignmentService {
  /**
   * Create an assignment (with optional quiz questions and rubric)
   */
  static async createAssignment(
    tenantId: string,
    data: CreateAssignmentInput,
    actorId: string,
    actorRole: string
  ) {
    // 1. Verify class belongs to tenant
    const cls = await prisma.class.findFirst({
      where: { id: data.classId, tenantId },
      include: { course: true },
    })
    if (!cls) {
      throw new AppError('Lớp học không tồn tại hoặc không thuộc quyền quản lý của trung tâm', 404, 'CLASS_NOT_FOUND')
    }

    // If teacher, verify teacher teaches this class
    if (actorRole === 'TEACHER' && cls.teacherId && cls.teacherId !== actorId) {
      throw new AppError('Bạn không được phân công giảng dạy lớp học này', 403, 'FORBIDDEN_CLASS')
    }

    // 2. Format rubricConfig to JSON string if provided as object
    const rubricString =
      typeof data.rubricConfig === 'object' && data.rubricConfig !== null
        ? JSON.stringify(data.rubricConfig)
        : (data.rubricConfig as string | undefined)

    // 3. Create assignment in DB
    const assignment = await prisma.assignment.create({
      data: {
        tenantId,
        classId: data.classId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        type: data.type,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        maxScore: data.maxScore || 10.0,
        rubricConfig: rubricString || null,
      },
    })

    // 4. If questions provided, create them linked to assignment
    if (data.questions && data.questions.length > 0) {
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i]
        await prisma.question.create({
          data: {
            assignmentId: assignment.id,
            questionType: q.questionType,
            prompt: q.prompt.trim(),
            mediaUrl: q.mediaUrl || null,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer || null,
            explanation: q.explanation || null,
            points: q.points || 1.0,
            orderIndex: q.orderIndex ?? i + 1,
          },
        })
      }
    }

    // 5. Audit Log
    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'ASSIGNMENT_CREATED',
      resource: 'Assignment',
      resourceId: assignment.id,
      details: { title: assignment.title, classId: cls.id, type: assignment.type },
    })

    return this.getAssignmentById(assignment.id, tenantId, {
      id: actorId,
      role: actorRole,
      tenantId,
    })
  }

  /**
   * Get assignments list filtered by role & permissions
   */
  static async getAssignments(
    tenantId: string,
    user: { id: string; role: string; tenantId?: string | null },
    params?: { classId?: string; type?: string; search?: string }
  ) {
    const where: any = { tenantId }

    if (params?.classId) {
      where.classId = params.classId
    }

    if (params?.type && params.type !== 'ALL') {
      where.type = params.type
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    // Role-specific filtering
    if (user.role === 'STUDENT') {
      // Find classes the student is enrolled in
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id, class: { tenantId } },
        select: { classId: true },
      })
      const classIds = enrollments.map((e) => e.classId)
      where.classId = { in: classIds }

      const assignments = await prisma.assignment.findMany({
        where,
        include: {
          class: { select: { id: true, name: true, course: { select: { id: true, title: true } } } },
          submissions: {
            where: { studentId: user.id },
            select: {
              id: true,
              status: true,
              score: true,
              submittedAt: true,
              isDraft: true,
              isLate: true,
              teacherFeedback: true,
            },
          },
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      return assignments
    }

    // Staff view (TEACHER, CENTER_MANAGER, SUPER_ADMIN)
    if (user.role === 'TEACHER') {
      // Only classes assigned to this teacher
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: user.id, tenantId },
        select: { id: true },
      })
      const teacherClassIds = teacherClasses.map((c) => c.id)
      where.classId = { in: teacherClassIds }
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            _count: { select: { enrollments: true } },
          },
        },
        _count: {
          select: {
            submissions: true,
            questions: true,
          },
        },
        submissions: {
          select: {
            id: true,
            status: true,
            score: true,
            isDraft: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compute progress stats for teacher
    return assignments.map((asg) => {
      const totalStudents = asg.class._count.enrollments || 0
      const validSubmissions = asg.submissions.filter((s) => !s.isDraft)
      const submittedCount = validSubmissions.length
      const gradedCount = validSubmissions.filter(
        (s) => s.status === 'TEACHER_APPROVED' || s.score !== null
      ).length

      return {
        ...asg,
        totalAssigned: totalStudents,
        submittedCount,
        gradedCount,
      }
    })
  }

  /**
   * Get assignment detail with security checks
   */
  static async getAssignmentById(
    id: string,
    tenantId: string,
    user: { id: string; role: string; tenantId?: string | null }
  ) {
    const assignment = await prisma.assignment.findFirst({
      where: { id, tenantId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            courseId: true,
            teacherId: true,
            course: { select: { id: true, title: true, code: true } },
          },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        submissions: {
          where: user.role === 'STUDENT' ? { studentId: user.id } : undefined,
          include: {
            student: { select: { id: true, fullName: true, email: true, avatar: true } },
          },
        },
      },
    })

    if (!assignment) {
      throw new AppError('Bài tập không tồn tại', 404, 'ASSIGNMENT_NOT_FOUND')
    }

    // Role-specific check
    if (user.role === 'STUDENT') {
      const isEnrolled = await prisma.enrollment.findFirst({
        where: { studentId: user.id, classId: assignment.classId },
      })
      if (!isEnrolled) {
        throw new AppError('Bạn chưa được ghi danh vào lớp học của bài tập này', 403, 'FORBIDDEN_CLASS')
      }

      // Check if student has a submitted & evaluated submission
      const studentSub = assignment.submissions[0]
      const hasCompleted = studentSub && !studentSub.isDraft

      // Strip correctAnswer & explanation if student hasn't completed or hasn't received score
      const safeQuestions = assignment.questions.map((q) => {
        let parsedOptions: any = null
        try {
          parsedOptions = q.options ? JSON.parse(q.options) : null
        } catch {
          parsedOptions = q.options
        }

        if (hasCompleted) {
          return {
            ...q,
            options: parsedOptions,
          }
        }

        // Conceal answers during test
        const { correctAnswer: _, explanation: __, ...safeQ } = q
        return {
          ...safeQ,
          options: parsedOptions,
        }
      })

      return {
        ...assignment,
        questions: safeQuestions,
        mySubmission: studentSub || null,
      }
    }

    // For teacher/admin: parse questions options JSON
    const questionsWithParsedOptions = assignment.questions.map((q) => {
      try {
        return { ...q, options: q.options ? JSON.parse(q.options) : null }
      } catch {
        return q
      }
    })

    return {
      ...assignment,
      questions: questionsWithParsedOptions,
    }
  }

  /**
   * Submit an assignment (or save draft) with deadline & anti-duplicate checks
   */
  static async submitAssignment(
    assignmentId: string,
    tenantId: string,
    studentId: string,
    data: SubmitAssignmentInput
  ) {
    // 1. Verify assignment exists and student is enrolled
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, tenantId },
      include: {
        questions: true,
        class: { select: { id: true, name: true, teacherId: true } },
      },
    })
    if (!assignment) {
      throw new AppError('Bài tập không tồn tại', 404, 'ASSIGNMENT_NOT_FOUND')
    }

    const isEnrolled = await prisma.enrollment.findFirst({
      where: { studentId, classId: assignment.classId },
    })
    if (!isEnrolled) {
      throw new AppError('Bạn không ghi danh trong lớp học này để nộp bài', 403, 'FORBIDDEN_CLASS')
    }

    // 2. Deadline check
    const now = new Date()
    const isLate = assignment.dueDate ? now > assignment.dueDate : false

    // 3. Anti-duplicate submission check
    const existing = await prisma.submission.findFirst({
      where: { assignmentId, studentId, tenantId },
    })

    if (existing && !existing.isDraft && !data.isDraft && existing.status !== 'RETURNED') {
      throw new AppError(
        'Bạn đã nộp bài tập này rồi và không thể nộp lại (trừ khi giảng viên mở quyền làm lại)',
        400,
        'DUPLICATE_SUBMISSION'
      )
    }

    // 4. Auto-grading for QUIZ
    let autoScore: number | null = null
    let autoStatus: 'SUBMITTED' | 'TEACHER_APPROVED' = 'SUBMITTED'
    let autoFeedback: string | null = null

    if (assignment.type === 'QUIZ' && !data.isDraft && assignment.questions.length > 0) {
      let correctCount = 0
      const totalQuestions = assignment.questions.length
      const submittedAnswers = data.answers || {}

      for (const q of assignment.questions) {
        if (q.correctAnswer !== null && q.correctAnswer !== undefined) {
          const userAns = submittedAnswers[q.id]
          if (String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
            correctCount += 1
          }
        }
      }

      // Calculate score out of assignment.maxScore
      autoScore = parseFloat(((correctCount / totalQuestions) * assignment.maxScore).toFixed(1))
      autoStatus = 'TEACHER_APPROVED' // Quizzes are instantly approved with auto-grade
      autoFeedback = `Hệ thống chấm tự động: Đúng ${correctCount}/${totalQuestions} câu hỏi trắc nghiệm.`
    }

    // 5. Serialize answers JSON string
    const answersString = data.answers ? JSON.stringify(data.answers) : null

    // 6. Save or update submission
    let submission
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          content: data.content || existing.content,
          answers: answersString || existing.answers,
          audioDurationSeconds: data.audioDurationSeconds ?? existing.audioDurationSeconds,
          isDraft: data.isDraft,
          isLate,
          score: autoScore !== null ? autoScore : existing.score,
          status: autoStatus,
          aiFeedback: autoFeedback || existing.aiFeedback,
          submittedAt: now,
        },
      })
    } else {
      submission = await prisma.submission.create({
        data: {
          tenantId,
          assignmentId,
          studentId,
          content: data.content || null,
          answers: answersString,
          audioDurationSeconds: data.audioDurationSeconds || null,
          isDraft: data.isDraft,
          isLate,
          score: autoScore,
          status: autoStatus,
          aiFeedback: autoFeedback,
          submittedAt: now,
        },
      })
    }

    // 7. Audit Log
    await AuditLogService.logAction({
      tenantId,
      userId: studentId,
      action: data.isDraft ? 'ASSIGNMENT_DRAFT_SAVED' : 'ASSIGNMENT_SUBMITTED',
      resource: 'Submission',
      resourceId: submission.id,
      details: {
        assignmentId,
        isDraft: data.isDraft,
        isLate,
        score: autoScore,
      },
    })

    // 8. Auto-Notification for Teacher (if submitted and not draft)
    if (!data.isDraft && assignment.class?.teacherId) {
      try {
        await NotificationService.createNotification({
          tenantId,
          userId: assignment.class.teacherId,
          title: 'Học viên nộp bài tập mới',
          message: `Một học viên vừa nộp bài tập "${assignment.title}" thuộc lớp "${assignment.class.name}".`,
          type: 'ASSIGNMENT',
          link: '/teacher/grading',
        })
      } catch (err) {
        console.error('Failed to send teacher notification:', err)
      }
    }

    return submission
  }

  /**
   * Get submissions for grading (Teachers & Managers)
   */
  static async getSubmissionsForGrading(
    tenantId: string,
    user: { id: string; role: string },
    assignmentId?: string
  ) {
    const where: any = { tenantId, isDraft: false }

    if (assignmentId) {
      where.assignmentId = assignmentId
    }

    if (user.role === 'TEACHER') {
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: user.id, tenantId },
        select: { id: true },
      })
      const classIds = teacherClasses.map((c) => c.id)
      where.assignment = { classId: { in: classIds } }
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        student: { select: { id: true, fullName: true, email: true, avatar: true } },
        assignment: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            rubricConfig: true,
            class: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return submissions
  }

  /**
   * Grade a submission with Rubric breakdown and feedback
   */
  static async gradeSubmission(
    submissionId: string,
    tenantId: string,
    teacherId: string,
    data: GradeSubmissionInput
  ) {
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, tenantId },
      include: { assignment: true, student: true },
    })

    if (!submission) {
      throw new AppError('Bài nộp không tồn tại', 404, 'SUBMISSION_NOT_FOUND')
    }

    const rubricString =
      typeof data.rubricScores === 'object' && data.rubricScores !== null
        ? JSON.stringify(data.rubricScores)
        : (data.rubricScores as string | undefined)

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        teacherFeedback: data.teacherFeedback?.trim() || null,
        rubricScores: rubricString || null,
        status: data.status || 'TEACHER_APPROVED',
        evaluatedAt: new Date(),
      },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        assignment: { select: { id: true, title: true, maxScore: true } },
      },
    })

    // Audit log
    await AuditLogService.logAction({
      tenantId,
      userId: teacherId,
      action: 'SUBMISSION_GRADED',
      resource: 'Submission',
      resourceId: updated.id,
      details: {
        score: data.score,
        studentId: submission.studentId,
        assignmentId: submission.assignmentId,
      },
    })

    // Auto-Notification for Student
    try {
      const assignmentTitle = updated.assignment?.title || 'Bài tập'
      const maxScore = updated.assignment?.maxScore || 10
      await NotificationService.createNotification({
        tenantId,
        userId: submission.studentId,
        title: 'Bài tập đã được chấm điểm',
        message: `Bài tập "${assignmentTitle}" của bạn đã có điểm: ${data.score}/${maxScore}.${data.teacherFeedback ? ` Nhận xét: ${data.teacherFeedback}` : ''}`,
        type: 'GRADE',
        link: '/student/assignments',
      })
    } catch (err) {
      console.error('Failed to send student notification:', err)
    }

    return updated
  }

  /**
   * Get student's grade history & feedback
   */
  static async getStudentGradeHistory(studentId: string, tenantId: string) {
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        tenantId,
        isDraft: false,
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true,
            class: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return submissions
  }
}

