import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'
import { logger } from './utils/logger.js'

const app = createApp()
const PORT = parseInt(env.PORT, 10) || 5000

const server = app.listen(PORT, () => {
  logger.info(`[Server] EnglishFlow LMS Backend running at http://localhost:${PORT}`)
})

// Graceful Shutdown
async function shutdown(signal: string) {
  logger.info(`[Server] Received ${signal}. Shutting down gracefully...`)
  server.close(async () => {
    await prisma.$disconnect()
    logger.info('[Server] Prisma disconnected. Server closed.')
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

