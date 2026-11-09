import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { AuthService } from './authService.js'
import { EmailService } from './emailService.js'
import { UpdateTenantBrandInput, RegisterTenantInput } from '../validations/tenantValidation.js'
import { AppError } from '../utils/errors.js'

export class TenantService {
  static async getAllTenants() {
    return prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            classes: true,
            courses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getTenantById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        classes: true,
        courses: true,
      },
    })
  }

  static async getTenantTheme(tenantIdOrCode?: string, domain?: string) {
    let tenant = null

    if (tenantIdOrCode) {
      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [{ id: tenantIdOrCode }, { code: tenantIdOrCode }],
        },
      })
    } else if (domain) {
      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [{ customDomain: domain }, { domain: domain }],
        },
      })
    }

    if (!tenant) {
      // Default to first active tenant or fallback
      tenant = await prisma.tenant.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      })
    }

    return {
      id: tenant?.id || null,
      name: tenant?.name || 'EnglishFlow LMS',
      code: tenant?.code || 'DEFAULT',
      domain: tenant?.domain || null,
      customDomain: tenant?.customDomain || null,
      logoUrl: tenant?.logoUrl || null,
      primaryColor: tenant?.primaryColor || '#4f46e5',
      secondaryColor: tenant?.secondaryColor || '#06b6d4',
      faviconUrl: tenant?.faviconUrl || null,
    }
  }

  static async updateTenantTheme(tenantId: string, data: UpdateTenantBrandInput) {
    const existing = await prisma.tenant.findUnique({
      where: { id: tenantId },
    })

    if (!existing) {
      throw new AppError('Không tìm thấy trung tâm để cập nhật thương hiệu', 404, 'TENANT_NOT_FOUND')
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
        ...(data.secondaryColor !== undefined && { secondaryColor: data.secondaryColor }),
        ...(data.faviconUrl !== undefined && { faviconUrl: data.faviconUrl }),
        ...(data.customDomain !== undefined && { customDomain: data.customDomain }),
      },
    })

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      domain: updated.domain,
      customDomain: updated.customDomain,
      logoUrl: updated.logoUrl,
      primaryColor: updated.primaryColor,
      secondaryColor: updated.secondaryColor,
      faviconUrl: updated.faviconUrl,
    }
  }

  static async createTenant(data: {
    name: string
    code: string
    domain?: string
    contactEmail: string
    contactPhone?: string
    address?: string
    city?: string
    plan?: string
    aiQuota?: number
  }) {
    return prisma.tenant.create({
      data: {
        name: data.name,
        code: data.code,
        domain: data.domain,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        city: data.city,
        plan: data.plan ?? 'PROFESSIONAL',
        aiQuota: data.aiQuota ?? 1000000,
        aiTokenQuota: data.aiQuota ?? 1000000,
      },
    })
  }

  /**
   * B2B Self-serve Onboarding:
   * Creates Tenant + Center Admin User + Default Class + Audit Log inside an ACID Transaction
   * Issues JWT access & refresh tokens and sends welcome email
   */
  static async registerTenant(data: RegisterTenantInput) {
    const email = data.email.toLowerCase().trim()

    // 1. Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new AppError('Email này đã được sử dụng trên hệ thống. Vui lòng đăng nhập hoặc sử dụng email khác.', 409, 'EMAIL_EXISTS')
    }

    // 2. Generate slug code for tenant
    const baseSlug = data.centerName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'center'
    
    const uniqueSuffix = Math.random().toString(36).substring(2, 6)
    const tenantCode = `ef-${baseSlug.substring(0, 20)}-${uniqueSuffix}`

    // 3. Determine AI quota and plan defaults
    let aiQuota = 1000000
    if (data.plan === 'STARTER') aiQuota = 500000
    if (data.plan === 'PROFESSIONAL') aiQuota = 2000000
    if (data.plan === 'ENTERPRISE') aiQuota = 10000000

    const passwordHash = await bcrypt.hash(data.password, 10)

    // 4. ACID Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Create Tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: data.centerName.trim(),
          code: tenantCode,
          domain: `${baseSlug.substring(0, 25)}.englishflow.vn`,
          contactEmail: email,
          contactPhone: data.phone || null,
          city: data.city || 'Hà Nội',
          plan: data.plan || 'PROFESSIONAL',
          aiQuota,
          aiTokenQuota: aiQuota,
          aiTokensUsed: 0,
          primaryColor: '#4f46e5',
          secondaryColor: '#06b6d4',
        },
      })

      // Step B: Create Center Admin User (Role: CENTER_MANAGER)
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: data.adminName.trim(),
          role: UserRole.CENTER_MANAGER,
          tenantId: newTenant.id,
          phone: data.phone || null,
          isActive: true,
          avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150`,
        },
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
              customDomain: true,
            },
          },
        },
      })

      // Step C: Create Default Starter Course & Class
      const defaultCourse = await tx.course.create({
        data: {
          tenantId: newTenant.id,
          title: 'Khóa học Tiếng Anh Tiêu Chuẩn & Luyện thi',
          code: `ENG-STD-${uniqueSuffix.toUpperCase()}`,
          description: 'Khóa học mẫu thiết lập sẵn cho trung tâm mới gia nhập EnglishFlow LMS.',
          targetLevel: 'IELTS 5.5 - 6.5',
          price: 2500000,
        },
      })

      await tx.class.create({
        data: {
          tenantId: newTenant.id,
          courseId: defaultCourse.id,
          name: `${data.centerName.trim()} - Lớp Khởi Đầu K01`,
          status: 'ONGOING',
        },
      })

      // Step D: Create Audit Log
      await tx.auditLog.create({
        data: {
          tenantId: newTenant.id,
          userId: newUser.id,
          action: 'TENANT_ONBOARDING_REGISTER',
          resource: 'TENANT',
          resourceId: newTenant.id,
          details: JSON.stringify({
            centerName: newTenant.name,
            code: newTenant.code,
            plan: newTenant.plan,
            adminEmail: newUser.email,
          }),
        },
      })

      return { tenant: newTenant, user: newUser }
    })

    // 5. Generate Auth Tokens for Immediate Login & Dashboard Access
    const tokens = await AuthService.generateTokens(result.user)

    // 6. Asynchronously Send Welcome Email
    EmailService.sendWelcomeEmail({
      to: result.user.email,
      fullName: result.user.fullName,
      role: 'Quản trị viên Trung tâm (Center Admin)',
      loginUrl: `${process.env.APP_URL || 'http://localhost:5173'}/center-manager/dashboard`,
      centerName: result.tenant.name,
      primaryColor: result.tenant.primaryColor || '#4f46e5',
    }).catch((err) => {
      console.error('[TenantService] Failed to send B2B onboarding welcome email:', err)
    })

    // 7. Return sanitized payload
    return {
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        code: result.tenant.code,
        domain: result.tenant.domain,
        plan: result.tenant.plan,
        primaryColor: result.tenant.primaryColor,
        secondaryColor: result.tenant.secondaryColor,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        tenantId: result.user.tenantId,
        avatar: result.user.avatar,
        phone: result.user.phone,
        tenant: result.user.tenant,
      },
      tokens,
    }
  }
}
