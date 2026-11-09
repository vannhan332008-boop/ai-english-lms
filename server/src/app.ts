import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from './config/env.js'
import { swaggerSpec, swaggerUi } from './config/swagger.js'
import { apiRouter } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { sendSuccess } from './utils/response.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createApp(): Express {
  const app = express()

  app.set('trust proxy', 1)

  // 1. Security Headers with Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      contentSecurityPolicy: false,
      hidePoweredBy: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts:
        env.NODE_ENV === 'production'
          ? { maxAge: 31536000, includeSubDomains: true, preload: true }
          : false,
    })
  )

  // 2. Multi-Tenant CORS Configuration
  const allowedOriginsList: string[] = [
    env.FRONTEND_URL,
    env.CORS_ORIGIN,
    ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
  ].filter(Boolean)

  if (env.NODE_ENV !== 'production') {
    allowedOriginsList.push(
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      'http://localhost:3000'
    )
  }

  const allowedOriginsSet = new Set(allowedOriginsList)

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (allowedOriginsSet.has(origin)) return callback(null, true)

        const isSubdomainAllowed = Array.from(allowedOriginsSet).some((allowed) => {
          try {
            const allowedHost = new URL(allowed).hostname
            const reqHost = new URL(origin).hostname
            return reqHost === allowedHost || reqHost.endsWith(`.${allowedHost}`)
          } catch {
            return false
          }
        })

        if (isSubdomainAllowed) return callback(null, true)

        if (env.NODE_ENV === 'development') {
          if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true)
          }
        }

        return callback(new Error(`CORS Error: Origin ${origin} not permitted.`))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'x-tenant-id'],
      exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Retry-After'],
      maxAge: 86400,
    })
  )

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // 3. Rate Limiters
  const apiLimiter = rateLimit({
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(env.RATE_LIMIT_MAX) || 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút.',
      error: { code: 'RATE_LIMIT_EXCEEDED' },
    },
  })

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(env.AUTH_RATE_LIMIT_MAX) || 15,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
      success: false,
      message: 'Quá nhiều lần thử xác thực không thành công. Vui lòng chờ 15 phút trước khi thử lại.',
      error: { code: 'AUTH_RATE_LIMIT_EXCEEDED' },
    },
  })

  app.use('/api/', apiLimiter)
  app.use('/api/v1/auth/login', authLimiter)
  app.use('/api/v1/auth/register', authLimiter)

  // 4. Static media uploads serving
  const uploadsDir = path.resolve(__dirname, '../uploads')
  app.use('/uploads', express.static(uploadsDir))

  // 5. Interactive Swagger API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  // 6. System Health Check
  app.get('/health', (_req, res) => {
    return sendSuccess(
      res,
      {
        status: 'UP',
        service: 'EnglishFlow LMS Backend API',
        environment: env.NODE_ENV,
        version: '1.0.0',
        aiMockMode: env.AI_MOCK_MODE,
      },
      'EnglishFlow Backend Service is healthy'
    )
  })

  // 7. Mount API Routes
  app.use('/api/v1', apiRouter)
  app.use('/api', apiRouter)

  // 8. Error Handling
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
