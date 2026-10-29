import { PrismaClient } from '@prisma/client'

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
    console.log('✅ [Database] SQLite connection established via Prisma ORM on Drive D')
  } catch (error) {
    console.error('❌ [Database] Failed to connect to SQLite database:', error)
    process.exit(1)
  }
}

export default prisma

