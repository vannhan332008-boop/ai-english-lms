import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

export async function enforceTenantIsolation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const user = req.user

  if (!user) {
    return sendError(res, 'Authentication required for tenant verification', 401, 'UNAUTHORIZED')
  }

  // 1. Resolve tenantId if missing on user object
  if (!user.tenantId) {
    const headerTenantId = req.headers['x-tenant-id'] as string | undefined
    const queryTenantId = (req.query.tenantId || (req.query as any)?.tenant_id) as string | undefined

    if (headerTenantId) {
      req.user!.tenantId = headerTenantId
    } else if (queryTenantId) {
      req.user!.tenantId = queryTenantId
    } else {
      // Find active tenant in DB
      const activeTenant =
        (await prisma.tenant.findFirst({ where: { status: 'ACTIVE' }, select: { id: true } })) ||
        (await prisma.tenant.findFirst({ select: { id: true } }))

      if (activeTenant) {
        req.user!.tenantId = activeTenant.id
        if (user.id && user.role !== 'SUPER_ADMIN') {
          await prisma.user
            .update({
              where: { id: user.id },
              data: { tenantId: activeTenant.id },
            })
            .catch(() => {})
        }
      }
    }
  }

  // Super Admin can access all or specify a tenant context via header
  if (user.role === 'SUPER_ADMIN') {
    return next()
  }

  // All other users must belong to a tenant
  if (!user.tenantId) {
    return sendError(
      res,
      'User is not associated with any active language center',
      403,
      'TENANT_NOT_ASSIGNED'
    )
  }

  // If request explicitly provided a tenantId in params or body that differs from user's tenantId, forbid it
  const requestedTenantId =
    req.params.tenantId || req.body?.tenantId || (req.query.tenantId as string) || (req.query as any)?.tenant_id

  if (requestedTenantId && requestedTenantId !== user.tenantId) {
    return sendError(
      res,
      'Cross-tenant access violation: Cannot access or manipulate data of another center',
      403,
      'CROSS_TENANT_FORBIDDEN'
    )
  }

  next()
}

