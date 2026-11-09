import { Router } from 'express'
import { CourseController } from '../controllers/courseController.js'
import { EnrollmentController } from '../controllers/enrollmentController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'
import { enforceTenantIsolation } from '../middlewares/tenantMiddleware.js'

export const courseRouter = Router()

// All course endpoints require authentication and tenant isolation check
courseRouter.use(authenticate, enforceTenantIsolation)

// Read routes
courseRouter.get(['/', ''], CourseController.getAll)
courseRouter.get('/my-courses', EnrollmentController.getMyEnrolledCourses)
courseRouter.get('/:id', CourseController.getById)

// Mutation routes (require elevated roles: SUPER_ADMIN, CENTER_MANAGER, TEACHER)
courseRouter.post(
  ['/', ''],
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  CourseController.create
)

courseRouter.put(
  '/:id',
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  CourseController.update
)

courseRouter.delete(
  '/:id',
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER']),
  CourseController.delete
)

export default courseRouter

