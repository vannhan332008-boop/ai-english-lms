import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'
import { sendError } from '../utils/response.js'

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return sendError(res, 'Authentication required before checking permissions', 401, 'UNAUTHORIZED')
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access forbidden. Role '${req.user.role}' lacks sufficient privileges for this action.`,
        403,
        'FORBIDDEN_ROLE'
      )
    }

    next()
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return authorize(...allowedRoles)
}

export default authorize
