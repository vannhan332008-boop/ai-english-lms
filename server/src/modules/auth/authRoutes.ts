import { Router } from 'express'
import { AuthController } from './authController.js'
import { authenticate } from '../../middlewares/authMiddleware.js'

const router = Router()

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: manager.hcm@englishflow.vn
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', AuthController.login)

/**
 * @swagger
 * /api/v1/auth/register-tenant:
 *   post:
 *     summary: Register New Language Center & Manager Account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [centerName, centerCode, managerName, managerEmail, password]
 *             properties:
 *               centerName:
 *                 type: string
 *                 example: EnglishFlow Da Nang Academy
 *               centerCode:
 *                 type: string
 *                 example: ef-danang
 *               managerName:
 *                 type: string
 *                 example: Tran Van Chinh
 *               managerEmail:
 *                 type: string
 *                 example: manager.danang@englishflow.vn
 *               password:
 *                 type: string
 *                 example: password123
 *               city:
 *                 type: string
 *                 example: Da Nang
 *     responses:
 *       201:
 *         description: Center registered successfully
 */
router.post('/register-tenant', AuthController.registerTenant)

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post('/refresh-token', AuthController.refreshToken)

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get Current User Profile & Tenant Info
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', authenticate, AuthController.getMe)

/**
 * @swagger
 * /api/v1/auth/demo-switch:
 *   post:
 *     summary: Instant Demo Role Switcher for Frontend
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, CENTER_MANAGER, TEACHER, STUDENT]
 *                 example: CENTER_MANAGER
 *               tenantCode:
 *                 type: string
 *                 example: ef-landmark-hcm
 *     responses:
 *       200:
 *         description: Demo switched successfully with live JWT tokens
 */
router.post('/demo-switch', AuthController.demoSwitch)

export default router

