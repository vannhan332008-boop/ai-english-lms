import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/response.js'

export function enforceTenantIsolation(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  const user = req.user

  if (!user) {
    return sendError(res, 'Authentication required for tenant verification', 401, 'UNAUTHORIZED')
  }

  // Super Admin can access all or specify a tenant context via header
  if (user.role === 'SUPER_ADMIN') {
    const overrideTenantId = req.headers['x-tenant-id'] as string | undefined
    if (overrideTenantId) {
      req.user!.tenantId = overrideTenantId
    }
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
    req.params.tenantId || req.body?.tenantId || (req.query.tenantId as string)

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

