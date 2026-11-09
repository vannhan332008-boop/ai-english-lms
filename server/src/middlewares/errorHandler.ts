import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { sendError } from '../utils/response.js'
import { AppError } from '../utils/errors.js'
import { logger, sanitizeLogData } from '../utils/logger.js'

export { AppError }

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  const statusCode = (err as unknown as { statusCode?: number }).statusCode || 500
  const isDev = process.env.NODE_ENV === 'development'

  // Structured Logging with Sensitive Data Redaction
  logger.error(`[${req.method}] ${req.originalUrl} -> ${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
    ip: req.ip,
    body: sanitizeLogData(req.body),
    stack: err.stack,
  })

  // Zod Input Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return sendError(
      res,
      'Dữ liệu đầu vào không hợp lệ',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    )
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Mã xác thực không hợp lệ', 401, 'INVALID_TOKEN')
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Phiên đăng nhập đã hết hạn', 401, 'TOKEN_EXPIRED')
  }

  // Custom application error (AppError)
  if (err instanceof AppError) {
    return sendError(
      res,
      err.message,
      err.statusCode,
      err.code,
      isDev ? err.stack : undefined
    )
  }

  // Production safety: sanitize internal 500 error messages
  const clientMessage = isDev
    ? err.message || 'Lỗi xử lý máy chủ'
    : statusCode === 500
    ? 'Hệ thống đang bận hoặc gặp sự cố xử lý. Vui lòng thử lại sau.'
    : err.message

  return sendError(
    res,
    clientMessage,
    statusCode,
    'SERVER_ERROR',
    isDev ? err.stack : undefined
  )
}

export function notFoundHandler(req: Request, res: Response): Response {
  return sendError(
    res,
    `Cannot ${req.method} route '${req.originalUrl}'`,
    404,
    'ROUTE_NOT_FOUND'
  )
}

