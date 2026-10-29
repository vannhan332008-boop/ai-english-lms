import { prisma } from '../config/prisma.js'

export class ClassService {
  static async getClassesByTenant(tenantId: string) {
    return prisma.class.findMany({
      where: { tenantId },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            code: true,
            type: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getClassDetails(classId: string) {
    return prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: true,
        course: true,
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
                streakDays: true,
              },
            },
          },
        },
        assignments: true,
      },
    })
  }
}

