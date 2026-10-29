import { Router } from 'express'
import { authRouter } from './authRoutes.js'
import { tenantRouter } from './tenantRoutes.js'
import { classRouter } from './classRoutes.js'
import { superAdminRouter } from './superAdminRoutes.js'
import { centerRouter } from './centerRoutes.js'
import { aiRouter } from './aiRoutes.js'
import { HealthController } from '../controllers/healthController.js'

export const apiRouter = Router()

// Health check endpoint
apiRouter.get('/health', HealthController.check)

// Feature routes
apiRouter.use('/auth', authRouter)
apiRouter.use('/tenants', tenantRouter)
apiRouter.use('/classes', classRouter)
apiRouter.use('/super-admin', superAdminRouter)
apiRouter.use('/center', centerRouter)
apiRouter.use('/ai', aiRouter)

export default apiRouter
