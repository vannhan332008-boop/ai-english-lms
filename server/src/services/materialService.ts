import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'
import { AuditLogService } from './auditLogService.js'

export interface CreateMaterialParams {
  tenantId: string
  courseId?: string | null
  lessonId?: string | null
  title: string
  description?: string | null
  file: Express.Multer.File
  actorId: string
  actorRole: string
}

export interface MaterialSignedTokenPayload {
  materialId: string
  tenantId: string
  userId: string
  purpose: 'material_download'
  exp: number
}

export class MaterialService {
  /**
   * Determine normalized file type from mime or extension
   */
  static resolveFileType(mimeType: string, ext: string): string {
    const extLower = ext.toLowerCase()
    if (extLower === '.pdf' || mimeType.includes('pdf')) return 'PDF'
    if (
      ['.mp3', '.wav', '.m4a', '.ogg'].includes(extLower) ||
      mimeType.startsWith('audio/')
    )
      return 'AUDIO'
    if (
      ['.mp4', '.webm', '.mov'].includes(extLower) ||
      mimeType.startsWith('video/')
    )
      return 'VIDEO'
    if (
      ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extLower) ||
      mimeType.startsWith('image/')
    )
      return 'IMAGE'
    if (
      ['.doc', '.docx', '.xlsx', '.pptx', '.txt'].includes(extLower) ||
      mimeType.includes('officedocument') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('presentation')
    )
      return 'DOCUMENT'
    return 'OTHER'
  }

  /**
   * Secure upload and save metadata to DB
   */
  static async uploadMaterial(params: CreateMaterialParams) {
    const { tenantId, courseId, lessonId, title, description, file, actorId } = params

    // 1. File size enforcement based on file type
    const ext = path.extname(file.originalname).toLowerCase()
    const detectedType = this.resolveFileType(file.mimetype, ext)

    const MAX_DOC_AUDIO_SIZE = 25 * 1024 * 1024 // 25 MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50 MB

    if (detectedType === 'VIDEO') {
      if (file.size > MAX_VIDEO_SIZE) {
        // Clean up temporary saved file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
        throw new AppError('Tệp video không được vượt quá 50MB', 400, 'FILE_TOO_LARGE')
      }
    } else {
      if (file.size > MAX_DOC_AUDIO_SIZE) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
        throw new AppError('Tệp tài liệu / âm thanh không được vượt quá 25MB', 400, 'FILE_TOO_LARGE')
      }
    }

    // 2. Tenant isolation check for course if specified
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: { id: courseId, tenantId },
      })
      if (!course) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
        throw new AppError('Khóa học không tồn tại hoặc không thuộc quyền quản lý của trung tâm', 404, 'COURSE_NOT_FOUND')
      }
    }

    // 3. Tenant isolation check for lesson if specified
    if (lessonId) {
      const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, module: { course: { tenantId } } },
      })
      if (!lesson) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
        throw new AppError('Bài học không tồn tại hoặc không thuộc quyền quản lý của trung tâm', 404, 'LESSON_NOT_FOUND')
      }
    }

    // 4. Save metadata into DB
    const relativeStoragePath = `uploads/materials/${path.basename(file.path)}`

    const material = await prisma.material.create({
      data: {
        tenantId,
        courseId: courseId || null,
        lessonId: lessonId || null,
        title: title.trim(),
        description: description?.trim() || null,
        fileType: detectedType,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath: relativeStoragePath,
        fileUrl: `/api/v1/materials/temp-url`, // Updated with actual ID below
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
        lesson: { select: { id: true, title: true } },
      },
    })

    // Update with definitive secure download URL
    const updated = await prisma.material.update({
      where: { id: material.id },
      data: {
        fileUrl: `/api/v1/materials/${material.id}/download`,
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
        lesson: { select: { id: true, title: true } },
      },
    })

    // 5. Audit log entry
    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'MATERIAL_UPLOADED',
      resource: 'Material',
      resourceId: updated.id,
      details: {
        title: updated.title,
        fileType: updated.fileType,
        fileSize: updated.fileSize,
        courseId: updated.courseId,
        lessonId: updated.lessonId,
      },
    })

    return updated
  }

  /**
   * Get materials for a course with access control
   */
  static async getCourseMaterials(
    courseId: string,
    tenantId: string,
    user: { id: string; role: string; tenantId?: string | null }
  ) {
    // Verify course exists in tenant
    const course = await prisma.course.findFirst({
      where: { id: courseId, tenantId },
    })
    if (!course) {
      throw new AppError('Khóa học không tồn tại', 404, 'COURSE_NOT_FOUND')
    }

    // Role check: If student, verify enrollment
    if (user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: user.id,
          class: { courseId, tenantId },
        },
      })
      if (!enrollment) {
        throw new AppError('Bạn chưa được ghi danh vào khóa học này để xem tài liệu', 403, 'ENROLLMENT_REQUIRED')
      }
    }

    const materials = await prisma.material.findMany({
      where: {
        courseId,
        tenantId,
      },
      include: {
        lesson: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return materials
  }

  /**
   * Get all materials belonging to the tenant (Curriculum Bank)
   */
  static async getTenantMaterials(
    tenantId: string,
    params?: { search?: string; fileType?: string; courseId?: string }
  ) {
    const where: any = { tenantId }

    if (params?.courseId) {
      where.courseId = params.courseId
    }

    if (params?.fileType && params.fileType !== 'ALL') {
      where.fileType = params.fileType
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    const materials = await prisma.material.findMany({
      where,
      include: {
        course: { select: { id: true, title: true, code: true } },
        lesson: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return materials
  }

  /**
   * Verify download permissions and return file location & info
   */
  static async verifyAndGetDownload(
    materialId: string,
    tenantId: string,
    user: { id: string; role: string; tenantId?: string | null }
  ) {
    const material = await prisma.material.findFirst({
      where: { id: materialId, tenantId },
      include: {
        course: true,
      },
    })

    if (!material) {
      throw new AppError('Tài liệu không tồn tại', 404, 'MATERIAL_NOT_FOUND')
    }

    // If student, check if enrolled in the course (if material is tied to course)
    if (user.role === 'STUDENT' && material.courseId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: user.id,
          class: { courseId: material.courseId, tenantId },
        },
      })
      if (!enrollment) {
        throw new AppError('Bạn chưa được ghi danh vào khóa học này để tải tài liệu', 403, 'ENROLLMENT_REQUIRED')
      }
    }

    const fullPath = path.resolve(material.storagePath || `uploads/materials/${material.id}`)
    if (!fs.existsSync(fullPath)) {
      throw new AppError('Tệp tin vật lý không tồn tại trên hệ thống lưu trữ', 404, 'FILE_MISSING')
    }

    return { material, fullPath }
  }

  /**
   * Generate short-lived signed download token (15 mins)
   */
  static async generateDownloadToken(
    materialId: string,
    tenantId: string,
    user: { id: string; role: string; tenantId?: string | null }
  ) {
    // Validate access first
    const { material } = await this.verifyAndGetDownload(materialId, tenantId, user)

    const payload = {
      materialId: material.id,
      tenantId,
      userId: user.id,
      purpose: 'material_download' as const,
    }

    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' })

    return {
      token,
      downloadUrl: `/api/v1/materials/token-download?token=${token}`,
      expiresIn: 900, // 15 minutes
      fileName: material.title,
    }
  }

  /**
   * Verify signed token and retrieve material file path
   */
  static async getDownloadPathByToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as MaterialSignedTokenPayload
      if (decoded.purpose !== 'material_download') {
        throw new AppError('Token không hợp lệ cho mục đích tải tệp', 400, 'INVALID_TOKEN_PURPOSE')
      }

      const material = await prisma.material.findFirst({
        where: { id: decoded.materialId, tenantId: decoded.tenantId },
      })

      if (!material) {
        throw new AppError('Tài liệu không còn tồn tại', 404, 'MATERIAL_NOT_FOUND')
      }

      const fullPath = path.resolve(material.storagePath || `uploads/materials/${material.id}`)
      if (!fs.existsSync(fullPath)) {
        throw new AppError('Tệp tin vật lý không tồn tại trên hệ thống lưu trữ', 404, 'FILE_MISSING')
      }

      return { material, fullPath }
    } catch (err: any) {
      if (err instanceof AppError) throw err
      throw new AppError('Liên kết tải đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.', 401, 'EXPIRED_OR_INVALID_TOKEN')
    }
  }

  /**
   * Delete material and cleanup physical file
   */
  static async deleteMaterial(
    materialId: string,
    tenantId: string,
    actorId: string
  ) {
    const material = await prisma.material.findFirst({
      where: { id: materialId, tenantId },
    })

    if (!material) {
      throw new AppError('Tài liệu không tồn tại', 404, 'MATERIAL_NOT_FOUND')
    }

    // 1. Delete physical file if exists
    if (material.storagePath) {
      const fullPath = path.resolve(material.storagePath)
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath)
        } catch (e) {
          console.error(`Failed to delete physical file: ${fullPath}`, e)
        }
      }
    }

    // 2. Delete DB record
    await prisma.material.delete({
      where: { id: materialId },
    })

    // 3. Log audit
    await AuditLogService.logAction({
      tenantId,
      userId: actorId,
      action: 'MATERIAL_DELETED',
      resource: 'Material',
      resourceId: materialId,
      details: { title: material.title, fileType: material.fileType },
    })

    return { success: true, id: materialId }
  }
}
