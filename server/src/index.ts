import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import { env } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { apiRouter } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const app = express()

// Ensure uploads directory structure exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'audio')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// 1. Security & Body Parsing Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// Allowed Origins Resolver
const rawAllowedOrigins = [
  env.FRONTEND_URL,
  env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
].filter(Boolean) as string[]

const allowedOriginsSet = new Set(rawAllowedOrigins)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)

      if (
        allowedOriginsSet.has(origin) ||
        env.NODE_ENV === 'development' ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true)
      }

      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`)
      return callback(new Error(`CORS Error: Origin ${origin} not permitted.`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static media uploads serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// 2. Base & Health Endpoints
app.get('/', (_req, res) => {
  res.json({
    name: 'EnglishFlow LMS REST API',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/v1/health',
    clientOrigin: env.CORS_ORIGIN,
  })
})

app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
  })
})

// 3. API V1 Routes
app.use('/api/v1', apiRouter)

// 4. Error Handling Middlewares
app.use(notFoundHandler)
app.use(errorHandler)

// 5. Start Server
const PORT = Number(env.PORT) || 5000

async function bootstrap() {
  await connectDatabase()

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║               🚀 ENGLISHFLOW LMS BACKEND SERVER                  ║
║         Multi-Tenant EdTech Platform with AI Integration         ║
╚══════════════════════════════════════════════════════════════════╝
📡 Server running on       : http://localhost:${PORT}
🌐 Allowed Frontend CORS   : ${env.CORS_ORIGIN}
🏥 Health Check Endpoint   : http://localhost:${PORT}/api/v1/health
📦 Database Location       : D:\\ai-english-lms\\server\\prisma\\dev.db
⚙️  Environment Mode       : ${env.NODE_ENV}
────────────────────────────────────────────────────────────────────
    `)
  })
}

bootstrap()

export default app

