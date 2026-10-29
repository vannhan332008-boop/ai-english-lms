import { Router } from 'express'
import { TenantController } from '../controllers/tenantController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'

export const tenantRouter = Router()

tenantRouter.get('/', authenticate, requireRole(['SUPER_ADMIN']), TenantController.getAll)
tenantRouter.get('/:id', authenticate, TenantController.getById)

export default tenantRouter

