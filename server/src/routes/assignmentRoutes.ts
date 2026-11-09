import { Router } from 'express'
import { AssignmentController } from '../controllers/assignmentController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'
import { enforceTenantIsolation } from '../middlewares/tenantMiddleware.js'

export const assignmentRouter = Router()

// All endpoints require authentication and tenant isolation check
assignmentRouter.use(authenticate, enforceTenantIsolation)

// Student specific route
assignmentRouter.get('/my-grades', requireRole(['STUDENT']), AssignmentController.getMyGrades)

// Grading routes for Staff
assignmentRouter.get(
  '/submissions/grading',
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  AssignmentController.getSubmissionsForGrading
)

assignmentRouter.post(
  '/submissions/:submissionId/grade',
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  AssignmentController.gradeSubmission
)

// General Read routes
assignmentRouter.get(['/', ''], AssignmentController.getAll)
assignmentRouter.get('/:id', AssignmentController.getById)

// Teacher/Admin Create route
assignmentRouter.post(
  ['/', ''],
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  AssignmentController.create
)

// Student Submit route
assignmentRouter.post(
  '/:id/submit',
  requireRole(['STUDENT']),
  AssignmentController.submit
)

export default assignmentRouter

