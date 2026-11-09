import { Router } from 'express'
import { ReportController } from '../controllers/reportController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { authorize } from '../middlewares/rbacMiddleware.js'
import { UserRole } from '@prisma/client'

const router = Router()

router.use(authenticate)

router.get('/student', ReportController.getStudentReport)
router.get(
  '/center',
  authorize(UserRole.CENTER_MANAGER, UserRole.SUPER_ADMIN, UserRole.TEACHER),
  ReportController.getCenterReport
)
router.get(
  '/export/students',
  authorize(UserRole.CENTER_MANAGER, UserRole.SUPER_ADMIN, UserRole.TEACHER),
  ReportController.exportStudentsCsv
)
router.get(
  '/export/grades',
  authorize(UserRole.CENTER_MANAGER, UserRole.SUPER_ADMIN, UserRole.TEACHER),
  ReportController.exportGradesCsv
)
router.get(
  '/audit-logs',
  authorize(UserRole.CENTER_MANAGER, UserRole.SUPER_ADMIN),
  ReportController.getAuditLogs
)

export default router

