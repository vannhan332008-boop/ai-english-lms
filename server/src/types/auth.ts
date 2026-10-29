import { UserRole } from '@prisma/client'

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
  tenantId: string | null
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  tenantId: string | null
  avatar: string | null
  phone: string | null
  cefrLevel: string
  streakDays: number
  tenant?: {
    id: string
    name: string
    code: string
    city: string | null
    status: string
    aiTokenQuota: number
    aiTokensUsed: number
  } | null
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

