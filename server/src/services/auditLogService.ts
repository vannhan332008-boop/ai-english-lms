import { prisma } from '../config/prisma.js'

export interface CreateAuditLogParams {
  tenantId?: string | null
  userId?: string | null
  action: string
  resource: string
  resourceId?: string | null
  details?: Record<string, any> | string | null
  ipAddress?: string | null
}

export class AuditLogService {
  /**
   * Record a governance audit entry
   */
  static async logAction(params: CreateAuditLogParams) {
    try {
      const detailsString =
        typeof params.details === 'object' && params.details !== null
          ? JSON.stringify(params.details)
          : (params.details as string | undefined)

      return await prisma.auditLog.create({
        data: {
          tenantId: params.tenantId || null,
          userId: params.userId || null,
          action: params.action,
          resource: params.resource,
          resourceId: params.resourceId || null,
          details: detailsString || null,
          ipAddress: params.ipAddress || null,
        },
      })
    } catch (err) {
      console.error('⚠️ [AuditLogService] Failed to record audit log:', err)
      // Never throw from audit logger to avoid interrupting primary business transaction
      return null
    }
  }

  /**
   * Get recent audit entries for a tenant
   */
  static async getTenantLogs(tenantId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }
}

