import { Router } from 'express'
import { ClassController } from '../controllers/classController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

export const classRouter = Router()

classRouter.get('/', authenticate, ClassController.getTenantClasses)
classRouter.get('/:id', authenticate, ClassController.getClassById)

export default classRouter

