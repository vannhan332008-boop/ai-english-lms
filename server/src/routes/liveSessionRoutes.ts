import { Router } from 'express'
import { LiveSessionController } from '../controllers/liveSessionController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'
import { enforceTenantIsolation } from '../middlewares/tenantMiddleware.js'

export const liveSessionRouter = Router()

// All routes require authentication and tenant isolation
liveSessionRouter.use(authenticate, enforceTenantIsolation)

// Read routes
liveSessionRouter.get(['/', ''], LiveSessionController.getAll)
liveSessionRouter.get('/:id', LiveSessionController.getById)

// Mutation routes (Teacher, Center Manager, Super Admin)
liveSessionRouter.post(
  ['/', ''],
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  LiveSessionController.create
)

liveSessionRouter.patch(
  '/:id',
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  LiveSessionController.update
)

liveSessionRouter.put(
  '/:id',
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  LiveSessionController.update
)

liveSessionRouter.delete(
  '/:id',
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  LiveSessionController.delete
)

export default liveSessionRouter

