import { Router } from 'express'
import { authRouter } from './authRoutes.js'
import { tenantRouter } from './tenantRoutes.js'
import { classRouter } from './classRoutes.js'
import { superAdminRouter } from './superAdminRoutes.js'
import { centerRouter } from './centerRoutes.js'
import { courseRouter } from './courseRoutes.js'
import { enrollmentRouter } from './enrollmentRoutes.js'
import { materialRouter } from './materialRoutes.js'
import { assignmentRouter } from './assignmentRoutes.js'
import { aiRouter } from './aiRoutes.js'
import notificationRouter from './notificationRoutes.js'
import reportRouter from './reportRoutes.js'
import { paymentRouter } from './paymentRoutes.js'
import { liveSessionRouter } from './liveSessionRoutes.js'
import { reviewRouter } from './reviewRoutes.js'
import { certificateRouter } from './certificateRoutes.js'
import { HealthController } from '../controllers/healthController.js'

export const apiRouter = Router()

// Health check endpoint
apiRouter.get('/health', HealthController.check)

// Feature routes
apiRouter.use('/auth', authRouter)
apiRouter.use('/tenants', tenantRouter)
apiRouter.use('/classes', classRouter)
apiRouter.use('/courses', courseRouter)
apiRouter.use('/enrollments', enrollmentRouter)
apiRouter.use('/materials', materialRouter)
apiRouter.use('/assignments', assignmentRouter)
apiRouter.use('/notifications', notificationRouter)
apiRouter.use('/reports', reportRouter)
apiRouter.use('/payments', paymentRouter)
apiRouter.use('/live-sessions', liveSessionRouter)
apiRouter.use('/reviews', reviewRouter)
apiRouter.use('/certificates', certificateRouter)
apiRouter.use('/super-admin', superAdminRouter)
apiRouter.use('/center', centerRouter)
apiRouter.use('/ai', aiRouter)

export default apiRouter
