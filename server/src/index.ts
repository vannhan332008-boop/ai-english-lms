import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs'
import { env } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { apiRouter } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { logger } from './utils/logger.js'

const app = express()

// 1. Trust Reverse Proxy (Required for Render, Vercel, Nginx, Cloudflare to read real client IP)
app.set('trust proxy', 1)

// 2. Ensure uploads directory structure exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'audio')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// 3. Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: false, // REST APIs serving JSON & uploaded media
    hidePoweredBy: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts:
      env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
  })
)

// 4. Strict Multi-Tenant CORS Configuration
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
      // Allow server-to-server, curl, or mobile app requests without Origin header
      if (!origin) return callback(null, true)

      // Exact match in whitelist
      if (allowedOriginsSet.has(origin)) {
        return callback(null, true)
      }

      // In production, allow verified domain and its tenant subdomains if configured
      const isSubdomainAllowed = Array.from(allowedOriginsSet).some((allowed) => {
        try {
          const allowedHost = new URL(allowed).hostname
          const reqHost = new URL(origin).hostname
          return reqHost === allowedHost || reqHost.endsWith(`.${allowedHost}`)
        } catch {
          return false
        }
      })

      if (isSubdomainAllowed) {
        return callback(null, true)
      }

      // In development mode only, allow any localhost/127.0.0.1 origin
      if (env.NODE_ENV === 'development') {
        if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true)
        }
      }

      console.warn(`[CORS Blocked] Origin forbidden: ${origin}`)
      return callback(new Error(`CORS Error: Origin ${origin} not permitted.`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'x-tenant-id'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Retry-After'],
    maxAge: 86400, // 24 hours preflight cache
  })
)

// 5. Anti-Abuse & DDoS Protection with Rate Limiting
const generalLimiter = rateLimit({
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

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Hệ thống AI đang bận xử lý nhiều yêu cầu. Vui lòng thử lại sau giây lát.',
    error: { code: 'AI_RATE_LIMIT_EXCEEDED' },
  },
})

app.use('/api/', generalLimiter)
app.use('/api/v1/auth/login', authLimiter)
app.use('/api/v1/auth/register', authLimiter)
app.use('/api/v1/ai', aiLimiter)

// 6. Request Body Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 7. Static media uploads serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// 8. Base & Health Endpoints
app.get('/', (_req, res) => {
  res.json({
    name: 'EnglishFlow LMS REST API',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/v1/health',
    environment: env.NODE_ENV,
    clientOrigin: env.CORS_ORIGIN,
  })
})

app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    service: 'EnglishFlow LMS Backend',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// 9. API Routes
app.use('/api/v1', apiRouter)
app.use('/api', apiRouter)

// 10. Error Handling Middlewares
app.use(notFoundHandler)
app.use(errorHandler)

// 11. Start Server
const PORT = Number(env.PORT) || 5000

async function bootstrap() {
  await connectDatabase()

  app.listen(PORT, '0.0.0.0', () => {
    const dbType = env.DATABASE_URL.includes('postgresql') ? 'PostgreSQL (Supabase/Cloud)' : 'SQLite'
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║               🚀 ENGLISHFLOW LMS BACKEND SERVER                  ║
║         Multi-Tenant EdTech Platform with AI Integration         ║
║                        Version: 1.0.0                            ║
╚══════════════════════════════════════════════════════════════════╝
📡 Server running on       : http://localhost:${PORT}
🌐 Allowed Frontend CORS   : ${Array.from(allowedOriginsSet).join(', ')}
🏥 Health Check Endpoint   : http://localhost:${PORT}/api/v1/health
📦 Database Provider       : ${dbType}
⚙️  Environment Mode       : ${env.NODE_ENV}
────────────────────────────────────────────────────────────────────
    `)
  })
}

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection detected:', { reason: reason?.stack || reason })
})

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception detected:', { error: err.stack || err.message })
})

bootstrap()

export default app
