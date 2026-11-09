import fs from 'fs'
import path from 'path'
import winston from 'winston'
import { env } from '../config/env.js'

// Ensure logs directory exists
const logDirectory = path.resolve(process.cwd(), 'logs')
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true })
}

// Sensitive fields to redact from logs
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'authorization',
  'gemini_api_key',
  'openai_api_key',
  'creditcard',
  'cardnumber',
  'cvv',
])

/**
 * Deep redaction of sensitive user data to prevent credential leaks in log files
 */
export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) return data
  if (typeof data !== 'object') return data

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item))
  }

  const sanitized: Record<string, any> = {}
  for (const [key, val] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof val === 'object') {
      sanitized[key] = sanitizeLogData(val)
    } else {
      sanitized[key] = val
    }
  }
  return sanitized
}

// Custom format combining timestamp, level, and sanitized metadata
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const cleanMeta = sanitizeLogData(meta)
    const metaStr = Object.keys(cleanMeta).length ? ` ${JSON.stringify(cleanMeta)}` : ''
    const msg = stack || message
    return `[${timestamp}] [${level.toUpperCase()}]: ${msg}${metaStr}`
  })
)

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  defaultMeta: { service: 'englishflow-lms' },
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const cleanMeta = sanitizeLogData(meta)
          const metaStr = Object.keys(cleanMeta).length ? ` ${JSON.stringify(cleanMeta)}` : ''
          return `[${timestamp}] ${level}: ${stack || message}${metaStr}`
        })
      ),
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDirectory, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
})

export default logger

