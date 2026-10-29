import { Router } from 'express'
import { AuthController } from '../controllers/authController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

export const authRouter = Router()

authRouter.post('/login', AuthController.login)
authRouter.post('/refresh', AuthController.refreshToken)
authRouter.get('/me', authenticate, AuthController.me)

export default authRouter

