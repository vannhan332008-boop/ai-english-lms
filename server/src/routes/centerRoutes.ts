import { Router } from 'express'
import { CenterManagerController } from '../controllers/centerManagerController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'
import { enforceTenantIsolation } from '../middlewares/tenantMiddleware.js'

export const centerRouter = Router()

// All center endpoints require authentication, isolation check, and either CENTER_MANAGER or SUPER_ADMIN
centerRouter.use(
  authenticate,
  requireRole(['CENTER_MANAGER', 'SUPER_ADMIN']),
  enforceTenantIsolation
)

centerRouter.get('/stats', CenterManagerController.getStats)
centerRouter.get('/teachers', CenterManagerController.getTeachers)
centerRouter.get('/students', CenterManagerController.getStudents)
centerRouter.get('/classes', CenterManagerController.getClasses)

export default centerRouter

