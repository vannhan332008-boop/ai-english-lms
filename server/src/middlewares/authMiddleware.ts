import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'
import { sendError } from '../utils/response.js'
import { TokenPayload } from '../types/auth.js'

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      res,
      'Authorization header missing or format invalid (Bearer <token>)',
      401,
      'UNAUTHORIZED'
    )
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            status: true,
            aiTokenQuota: true,
            aiTokensUsed: true,
            logoUrl: true,
            primaryColor: true,
            secondaryColor: true,
            faviconUrl: true,
            customDomain: true,
          },
        },
      },
    })

    if (!user || !user.isActive) {
      return sendError(
        res,
        'User account is suspended or no longer exists',
        401,
        'ACCOUNT_INACTIVE'
      )
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId || decoded.tenantId || null,
      avatar: user.avatar,
      phone: user.phone,
      cefrLevel: user.cefrLevel,
      streakDays: user.streakDays,
      tenant: user.tenant,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 'Session token has expired. Please refresh token.', 401, 'TOKEN_EXPIRED')
    }
    return sendError(res, 'Invalid authentication token', 401, 'INVALID_TOKEN')
  }
}

export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            status: true,
            aiTokenQuota: true,
            aiTokensUsed: true,
            logoUrl: true,
            primaryColor: true,
            secondaryColor: true,
            faviconUrl: true,
            customDomain: true,
          },
        },
      },
    })

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId || decoded.tenantId || null,
        avatar: user.avatar,
        phone: user.phone,
        cefrLevel: user.cefrLevel,
        streakDays: user.streakDays,
        tenant: user.tenant,
      }
    }
  } catch {
    // Ignore invalid/expired token for optional authentication
  }

  next()
}
