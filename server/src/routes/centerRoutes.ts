import { Router } from 'express'
import { CenterManagerController } from '../controllers/centerManagerController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'
import { enforceTenantIsolation } from '../middlewares/tenantMiddleware.js'

export const centerRouter = Router()

// All center endpoints require authentication, isolation check, and either CENTER_MANAGER or SUPER_ADMIN
centerRouter.use(
  authenticate,
  requireRole(['CENTER_MANAGER', 'SUPER_ADMIN']),
  enforceTenantIsolation
)

// Center Dashboard & Profile Management
centerRouter.get('/stats', CenterManagerController.getStats)
centerRouter.get('/profile', CenterManagerController.getProfile)
centerRouter.put('/profile', CenterManagerController.updateProfile)

// Teacher Management
centerRouter.get('/teachers', CenterManagerController.getTeachers)
centerRouter.post('/teachers', CenterManagerController.createTeacher)

// Student Management
centerRouter.get('/students', CenterManagerController.getStudents)
centerRouter.post('/students', CenterManagerController.createStudent)
centerRouter.post('/students/import-csv', CenterManagerController.importStudentsCsv)
centerRouter.post('/students/:id/transfer-class', CenterManagerController.transferStudentClass)

// User Directory & Creation
centerRouter.get('/users', CenterManagerController.getUsers)
centerRouter.post('/users', CenterManagerController.createUser)

// User Account Status (Active/Inactive Toggle)
centerRouter.patch('/users/:id/status', CenterManagerController.toggleUserStatus)

// Class Directory
centerRouter.get('/classes', CenterManagerController.getClasses)

// Governance Audit Logs
centerRouter.get('/audit-logs', CenterManagerController.getAuditLogs)

export default centerRouter
