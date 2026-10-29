import { Router } from 'express'
import { AIController } from '../controllers/aiController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import { uploadAudio } from '../middlewares/uploadMiddleware.js'

export const aiRouter = Router()

// All AI endpoints require authentication
aiRouter.use(authenticate)

// 1. AI Writing Evaluator
aiRouter.post('/writing/evaluate', AIController.evaluateWriting)

// 2. AI Speaking Evaluator with audio file upload
aiRouter.post('/speaking/evaluate', uploadAudio.single('audio'), AIController.evaluateSpeaking)

// 3. AI Teacher Lesson Planner
aiRouter.post('/teacher/lesson-plan', AIController.generateLessonPlan)

export default aiRouter

