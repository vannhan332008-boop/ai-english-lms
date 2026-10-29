import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { TokenPayload } from '../types/auth.js'

export class AuthService {
  /**
   * Issue signed Access & Refresh tokens, persisting refresh token in DB
   */
  static async generateTokens(user: {
    id: string
    email: string
    role: UserRole
    tenantId: string | null
  }) {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    }

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    })

    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    })

    // Store refresh token in database (7 days validity)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    }
  }

  /**
   * User Login with email and password
   */
  static async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { email },
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
          },
        },
      },
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    if (!user.isActive) {
      throw new Error('Account has been deactivated. Contact center administrator.')
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash)
    if (!isMatch) {
      throw new Error('Invalid email or password')
    }

    // Update lastActiveAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    })

    const tokens = await this.generateTokens(user)

    // Format sanitized user profile
    const userProfile = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      cefrLevel: user.cefrLevel,
      streakDays: user.streakDays,
      tenantId: user.tenantId,
      tenant: user.tenant,
    }

    return {
      user: userProfile,
      tokens,
    }
  }

  /**
   * Refresh Token rotation
   */
  static async refreshAccessToken(oldRefreshToken: string) {
    const existing = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    })

    if (!existing || existing.expiresAt < new Date()) {
      if (existing) {
        await prisma.refreshToken.delete({ where: { id: existing.id } })
      }
      throw new Error('Refresh token is invalid or expired')
    }

    // Verify cryptographic signature
    jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET)

    // Delete the used refresh token (Rotation security)
    await prisma.refreshToken.delete({ where: { id: existing.id } })

    // Generate fresh tokens
    const tokens = await this.generateTokens(existing.user)

    return tokens
  }

  /**
   * Register a new Language Center (Tenant) along with Center Manager account
   */
  static async registerTenant(data: {
    centerName: string
    centerCode: string
    managerName: string
    managerEmail: string
    password: string
    phone?: string
    city?: string
    address?: string
  }) {
    // Check if code or email exists
    const existingCode = await prisma.tenant.findUnique({
      where: { code: data.centerCode },
    })
    if (existingCode) {
      throw new Error(`Center code '${data.centerCode}' is already registered`)
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.managerEmail },
    })
    if (existingUser) {
      throw new Error(`Email '${data.managerEmail}' is already registered in system`)
    }

    // Find default starter plan
    const starterPlan = await prisma.subscriptionPlan.findFirst({
      where: { code: 'STARTER' },
    })

    const passwordHash = await bcrypt.hash(data.password, 10)

    // Execute atomic creation in transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.centerName,
          code: data.centerCode.toLowerCase().trim(),
          city: data.city || 'Vietnam',
          address: data.address,
          contactEmail: data.managerEmail,
          contactPhone: data.phone,
          planId: starterPlan?.id,
          aiTokenQuota: starterPlan?.aiTokenLimit || 250000,
        },
      })

      const manager = await tx.user.create({
        data: {
          email: data.managerEmail,
          fullName: data.managerName,
          passwordHash,
          role: 'CENTER_MANAGER',
          tenantId: tenant.id,
          phone: data.phone,
          cefrLevel: 'C1',
        },
      })

      return { tenant, manager }
    })

    const tokens = await this.generateTokens(result.manager)

    return {
      tenant: result.tenant,
      user: {
        id: result.manager.id,
        email: result.manager.email,
        fullName: result.manager.fullName,
        role: result.manager.role,
        tenantId: result.tenant.id,
      },
      tokens,
    }
  }

  /**
   * Get Current Authenticated User Profile
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          include: {
            subscriptionPlan: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      cefrLevel: user.cefrLevel,
      streakDays: user.streakDays,
      tenantId: user.tenantId,
      tenant: user.tenant,
      createdAt: user.createdAt,
    }
  }

  /**
   * Demo Role Switcher helper for instant frontend demo testing
   */
  static async demoSwitch(role: UserRole, tenantCode?: string) {
    const whereClause: { role: UserRole; tenant?: { code: string } } = { role }
    if (tenantCode && role !== 'SUPER_ADMIN') {
      whereClause.tenant = { code: tenantCode }
    }

    const user = await prisma.user.findFirst({
      where: whereClause,
      include: {
        tenant: true,
      },
    })

    if (!user) {
      throw new Error(`No seeded demo user found for role '${role}'`)
    }

    const tokens = await this.generateTokens(user)

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        avatar: user.avatar,
        cefrLevel: user.cefrLevel,
        streakDays: user.streakDays,
        tenant: user.tenant,
      },
      tokens,
    }
  }
}

