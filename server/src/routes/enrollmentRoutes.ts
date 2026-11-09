import { Router } from 'express'
import { EnrollmentController } from '../controllers/enrollmentController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'
import { enforceTenantIsolation } from '../middlewares/tenantMiddleware.js'

export const enrollmentRouter = Router()

// All enrollment routes require authentication
enrollmentRouter.use(authenticate)

// Student Portal - My Enrolled Courses
enrollmentRouter.get('/my-courses', EnrollmentController.getMyEnrolledCourses)

// Course enrollment roster (Managers & Teachers)
enrollmentRouter.get(
  '/courses/:courseId',
  enforceTenantIsolation,
  EnrollmentController.getCourseEnrollments
)

// Create Enrollment (Admin, Center Manager, Teacher only)
enrollmentRouter.post(
  ['/', ''],
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  enforceTenantIsolation,
  EnrollmentController.createEnrollment
)

export default enrollmentRouter

