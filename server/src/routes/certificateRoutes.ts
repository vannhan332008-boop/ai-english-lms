import { Router } from 'express'
import { CertificateController } from '../controllers/certificateController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { enforceTenantIsolation } from '../middlewares/tenantMiddleware.js'

export const certificateRouter = Router()

// Public download / verification route
certificateRouter.get('/download/:code', CertificateController.downloadPdf)

// Protected student routes
certificateRouter.get('/my-certificates', authenticate, enforceTenantIsolation, CertificateController.getMyCertificates)
certificateRouter.get('/progress/:courseId', authenticate, enforceTenantIsolation, CertificateController.checkProgress)
certificateRouter.post('/claim/:courseId', authenticate, enforceTenantIsolation, CertificateController.claimCertificate)

export default certificateRouter

