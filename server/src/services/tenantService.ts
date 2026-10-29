import { prisma } from '../config/prisma.js'

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
}

