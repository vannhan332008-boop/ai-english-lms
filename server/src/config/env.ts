import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().default('englishflow_access_secret_key_vietnam_edtech_2026'),
  JWT_REFRESH_SECRET: z.string().default('englishflow_refresh_secret_key_vietnam_edtech_2026'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional().default(''),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('300'),
  AUTH_RATE_LIMIT_MAX: z.string().default('15'),
  AI_MOCK_MODE: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  AI_PROVIDER: z.string().default('gemini'),
  GEMINI_API_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  PAYMENT_HASH_SECRET: z.string().default('englishflow_payment_hash_secret_2026'),
  VAPID_PUBLIC_KEY: z
    .string()
    .default('BHlptYma0YszwYoaOO0TOaRSjgWF1eP5AyhCOJ7kNmvw-3PAeotNcz861sWqoEYdExTOWmkCdU_tfe-UxRx8Pnk'),
  VAPID_PRIVATE_KEY: z
    .string()
    .default('nkM57J7ftxaa2fTORaN7l1NhhCLH47k2IXe2q358YP8'),
  VAPID_SUBJECT: z.string().default('mailto:admin@englishflow.vn'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  APP_URL: z.string().optional().default('http://localhost:5173'),
})

export const env = envSchema.parse(process.env)
