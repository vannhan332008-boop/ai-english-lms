import { Response } from 'express'

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: {
    code?: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    [key: string]: unknown
  }
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Request processed successfully',
  statusCode = 200,
  meta?: Record<string, unknown>
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
  return res.status(statusCode).json(payload)
}

export function sendError(
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
): Response {
  const payload: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  }
  return res.status(statusCode).json(payload)
}

