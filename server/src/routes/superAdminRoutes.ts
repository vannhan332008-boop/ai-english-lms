import { Router } from 'express'
import { SuperAdminController } from '../controllers/superAdminController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'

export const superAdminRouter = Router()

// All super-admin endpoints require valid JWT and SUPER_ADMIN role
superAdminRouter.use(authenticate, requireRole(['SUPER_ADMIN']))

superAdminRouter.get('/stats', SuperAdminController.getStats)
superAdminRouter.get('/tenants', SuperAdminController.getTenants)

export default superAdminRouter

