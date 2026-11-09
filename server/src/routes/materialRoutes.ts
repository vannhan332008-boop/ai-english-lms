import { Router } from 'express'
import { MaterialController } from '../controllers/materialController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/rbacMiddleware.js'
import { enforceTenantIsolation } from '../middlewares/tenantMiddleware.js'
import { uploadMaterial } from '../middlewares/materialUploadMiddleware.js'

export const materialRouter = Router()

// 1. Token-based secure download: does not require Bearer header since token is in query param
materialRouter.get('/token-download', MaterialController.downloadByToken)

// 2. All subsequent routes require user authentication
materialRouter.use(authenticate, enforceTenantIsolation)

// Read materials of a course (accessible by enrolled students and staff)
materialRouter.get('/course/:courseId', MaterialController.getCourseMaterials)

// Download direct with Bearer token authentication
materialRouter.get('/:id/download', MaterialController.downloadDirect)

// Get signed short-lived download token
materialRouter.get('/:id/download-token', MaterialController.generateDownloadToken)

// Staff routes (SUPER_ADMIN, CENTER_MANAGER, TEACHER)
materialRouter.get(
  ['/', ''],
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  MaterialController.getTenantMaterials
)

materialRouter.post(
  '/upload',
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  uploadMaterial.single('file'),
  MaterialController.upload
)

materialRouter.delete(
  '/:id',
  requireRole(['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']),
  MaterialController.delete
)

export default materialRouter

