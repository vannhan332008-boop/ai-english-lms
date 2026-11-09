import { Router } from 'express'
import { TenantController } from '../controllers/tenantController.js'
import { authenticate, optionalAuthenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'

export const tenantRouter = Router()

// B2B Public Self-serve Onboarding
tenantRouter.post('/register', TenantController.register)

// Public / optionally authenticated theme discovery
tenantRouter.get('/theme', optionalAuthenticate, TenantController.getTheme)

// Management endpoints
tenantRouter.patch('/theme', authenticate, requireRole(['SUPER_ADMIN', 'CENTER_MANAGER']), TenantController.updateTheme)
tenantRouter.put('/:id/brand', authenticate, requireRole(['SUPER_ADMIN']), TenantController.updateTheme)

// Super Admin listing & detail
tenantRouter.get('/', authenticate, requireRole(['SUPER_ADMIN']), TenantController.getAll)
tenantRouter.get('/:id', authenticate, TenantController.getById)

export default tenantRouter
