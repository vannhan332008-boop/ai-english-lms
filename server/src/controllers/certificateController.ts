import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import { CertificateService } from '../services/certificateService.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

export class CertificateController {
  private static async resolveTenantId(req: Request): Promise<string | null> {
    if (!req.user) return null

    let tenantId = req.user.tenantId || (req.user as any).tenant_id
    const headerTenantId = req.headers['x-tenant-id'] as string
    const queryTenantId = (req.query.tenantId || (req.query as any)?.tenant_id) as string

    if (headerTenantId) {
      tenantId = headerTenantId
    } else if (queryTenantId) {
      tenantId = queryTenantId
    }

    if (!tenantId && req.user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { tenantId: true },
      })
      if (dbUser?.tenantId) {
        tenantId = dbUser.tenantId
        req.user.tenantId = tenantId
      }
    }

    if (!tenantId) {
      const activeTenant =
        (await prisma.tenant.findFirst({
          where: { status: 'ACTIVE' },
          select: { id: true },
        })) || (await prisma.tenant.findFirst({ select: { id: true } }))

      if (activeTenant) {
        tenantId = activeTenant.id
        req.user.tenantId = tenantId
      }
    }

    return tenantId || null
  }

  /**
   * GET /api/v1/certificates/progress/:courseId
   * Check progress and certificate eligibility
   */
  static async checkProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await CertificateController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const courseId = req.params.courseId as string
      const result = await CertificateService.checkProgress(courseId, req.user.id, tenantId)

      sendSuccess(res, result, 'Kiểm tra tiến độ hoàn thành thành công')
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/v1/certificates/claim/:courseId
   * Claim and generate certificate PDF
   */
  static async claimCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await CertificateController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const courseId = req.params.courseId as string
      const cert = await CertificateService.claimCertificate(courseId, req.user.id, tenantId)

      sendSuccess(res, cert, 'Cấp chứng chỉ hoàn thành khóa học thành công', 201)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/certificates/my-certificates
   * Get all claimed certificates of current student
   */
  static async getMyCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Chưa xác thực người dùng', 401, 'UNAUTHORIZED')
        return
      }

      const tenantId = await CertificateController.resolveTenantId(req)
      if (!tenantId) {
        sendError(res, 'Người dùng không trực thuộc trung tâm nào', 400, 'TENANT_REQUIRED')
        return
      }

      const certs = await CertificateService.getMyCertificates(req.user.id, tenantId)
      sendSuccess(res, certs, 'Lấy danh sách chứng chỉ thành công')
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/certificates/download/:code
   * Stream or download PDF file
   */
  static async downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.params.code as string
      const certInfo = await CertificateService.getCertificateByCode(code)

      if (!certInfo.existsOnDisk) {
        sendError(res, 'Tệp tin chứng chỉ chưa được tạo hoặc đã bị xóa', 404, 'NOT_FOUND')
        return
      }

      res.setHeader('Content-Disposition', `inline; filename="Certificate-${code}.pdf"`)
      res.sendFile(certInfo.filePath)
    } catch (err) {
      next(err)
    }
  }
}
