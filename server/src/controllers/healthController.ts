import { Request, Response } from 'express'
import { sendSuccess } from '../utils/response.js'
import { prisma } from '../config/prisma.js'

export class HealthController {
  static async check(_req: Request, res: Response): Promise<void> {
    const dbConnected = await prisma.$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false)

    sendSuccess(
      res,
      {
        status: 'UP',
        app: 'EnglishFlow LMS Backend API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
        systemTime: new Date().toISOString(),
      },
      'Hệ thống đang hoạt động ổn định'
    )
  }
}

