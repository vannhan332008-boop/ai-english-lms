import { Router } from 'express'
import { ReviewController } from '../controllers/reviewController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { enforceTenantIsolation } from '../middlewares/tenantMiddleware.js'

export const reviewRouter = Router()

// Public read reviews for a course
reviewRouter.get('/course/:courseId', ReviewController.getCourseReviews)

// Protected mutation routes (Enrolled student only)
reviewRouter.post('/course/:courseId', authenticate, enforceTenantIsolation, ReviewController.addReview)
reviewRouter.delete('/:id', authenticate, enforceTenantIsolation, ReviewController.deleteReview)

export default reviewRouter

