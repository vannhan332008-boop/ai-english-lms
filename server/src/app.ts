import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from './config/env.js'
import { swaggerSpec, swaggerUi } from './config/swagger.js'
import authRoutes from './modules/auth/authRoutes.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { sendSuccess } from './utils/response.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createApp(): Express {
  const app = express()

  // 1. Security & Core Middlewares
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  )

  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    })
  )

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Rate Limiting (100 requests per 15 minutes per IP)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes',
      error: { code: 'RATE_LIMIT_EXCEEDED' },
    },
  })
  app.use('/api/', apiLimiter)

  // 2. Static Assets Serving (Audio & Document Uploads on Drive D)
  const uploadsDir = path.resolve(__dirname, '../uploads')
  app.use('/uploads', express.static(uploadsDir))

  // 3. Interactive Swagger API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  // 4. System Health Check
  app.get('/health', (_req, res) => {
    return sendSuccess(
      res,
      {
        status: 'UP',
        service: 'EnglishFlow LMS Backend API',
        environment: env.NODE_ENV,
        aiMockMode: env.AI_MOCK_MODE,
        database: 'SQLite (dev.db on Drive D)',
      },
      'EnglishFlow Backend Service is healthy'
    )
  })

  // 5. Mount API Modules
  app.use('/api/v1/auth', authRoutes)

  // 6. 404 & Global Error Handling
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

