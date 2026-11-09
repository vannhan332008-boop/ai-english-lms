import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { MaterialService } from '../services/materialService.js'
import { uploadMaterialSchema } from '../validations/materialValidation.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

export class MaterialController {
  private static async resolveTenantId(req: Request): Promise<string | null> {
    if (!req.user) return null

    if (req.user.role === 'SUPER_ADMIN') {
      const headerTenantId = req.headers['x-tenant-id'] as string
      const queryTenantId = req.query.tenantId as string
      const foundId = headerTenantId || queryTenantId || req.user.tenantId || null
      if (foundId) return foundId

      const defaultTenant = await prisma.tenant.findFirst({ select: { id: true } })
      return defaultTenant?.id || null
    }

    return req.user.tenantId || null
  }

  /**
   * POST /api/v1/materials/upload
   * Role: SUPER_ADMIN, CENTER_MANAGER, TEACHER
   */
  static async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await MaterialController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      if (!req.file) {
        sendError(res, 'Vui lòng đính kèm tệp tin để tải lên', 400, 'FILE_REQUIRED')
        return
      }

      const validated = uploadMaterialSchema.parse(req.body)

      const material = await MaterialService.uploadMaterial({
        tenantId,
        courseId: validated.courseId,
        lessonId: validated.lessonId,
        title: validated.title,
        description: validated.description,
        file: req.file,
        actorId: req.user!.id,
        actorRole: req.user!.role,
      })

      sendSuccess(res, material, 'Tải lên tài liệu thành công', 201)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/materials/course/:courseId
   * Role: SUPER_ADMIN, CENTER_MANAGER, TEACHER, or Enrolled STUDENT
   */
  static async getCourseMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await MaterialController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const courseId = req.params.courseId as string
      const materials = await MaterialService.getCourseMaterials(courseId, tenantId, req.user!)

      sendSuccess(res, materials, 'Lấy danh sách tài liệu khóa học thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/materials
   * Role: SUPER_ADMIN, CENTER_MANAGER, TEACHER
   */
  static async getTenantMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await MaterialController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const search = req.query.search as string | undefined
      const fileType = req.query.fileType as string | undefined
      const courseId = req.query.courseId as string | undefined

      const materials = await MaterialService.getTenantMaterials(tenantId, {
        search,
        fileType,
        courseId,
      })

      sendSuccess(res, materials, 'Lấy danh mục tài liệu trung tâm thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/materials/:id/download-token
   * Generates a signed token for short-lived secure download
   */
  static async generateDownloadToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await MaterialController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = req.params.id as string
      const tokenData = await MaterialService.generateDownloadToken(id, tenantId, req.user!)

      sendSuccess(res, tokenData, 'Khởi tạo mã phiên tải bảo mật thành công')
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/materials/:id/download
   * Direct authenticated download
   */
  static async downloadDirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await MaterialController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = req.params.id as string
      const { material, fullPath } = await MaterialService.verifyAndGetDownload(id, tenantId, req.user!)

      const ext = path.extname(fullPath)
      const downloadName = material.title.toLowerCase().endsWith(ext.toLowerCase())
        ? material.title
        : `${material.title}${ext}`

      res.download(fullPath, downloadName)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/materials/token-download?token=xxx
   * Token-based secure download (no Authorization header required if signed token is valid)
   */
  static async downloadByToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.query.token as string
      if (!token) {
        sendError(res, 'Mã phiên tải tệp (token) không được cung cấp', 400, 'TOKEN_REQUIRED')
        return
      }

      const { material, fullPath } = await MaterialService.getDownloadPathByToken(token)

      const ext = path.extname(fullPath)
      const downloadName = material.title.toLowerCase().endsWith(ext.toLowerCase())
        ? material.title
        : `${material.title}${ext}`

      res.download(fullPath, downloadName)
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /api/v1/materials/:id
   * Role: SUPER_ADMIN, CENTER_MANAGER, TEACHER
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await MaterialController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const id = req.params.id as string
      const result = await MaterialService.deleteMaterial(id, tenantId, req.user!.id)

      sendSuccess(res, result, 'Xóa tài liệu thành công')
    } catch (error) {
      next(error)
    }
  }
}
