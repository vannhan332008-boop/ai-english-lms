import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger.js'

// Global singleton instance for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function connectDatabase() {
  try {
    await prisma.$connect()
    const isPg = process.env.DATABASE_URL?.includes('postgresql')
    logger.info(`[Database] Database connection established via Prisma ORM (${isPg ? 'PostgreSQL Supabase' : 'SQLite'})`)
  } catch (error) {
    logger.error('[Database] Failed to connect to database:', error)
    process.exit(1)
  }
}

export default prisma

