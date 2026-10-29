import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

const app = createApp()
const PORT = parseInt(env.PORT, 10) || 5000

const server = app.listen(PORT, () => {
  console.log('=============================================================')
  console.log(`🚀 EnglishFlow LMS Backend running at http://localhost:${PORT}`)
  console.log(`📖 Swagger API Docs available at   http://localhost:${PORT}/api-docs`)
  console.log(`❤️  Health check endpoint:          http://localhost:${PORT}/health`)
  console.log(`🤖 AI Engine Mode:                 ${env.AI_MOCK_MODE ? 'MOCK_MODE (No API Key Required)' : 'LIVE'}`)
  console.log(`📁 Database Location:              d:\\ai-english-lms\\server\\prisma\\dev.db`)
  console.log('=============================================================')
})

// Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`)
  server.close(async () => {
    await prisma.$disconnect()
    console.log('Prisma disconnected. Server closed.')
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

