import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { sendError } from '../utils/response.js'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error('💥 Unhandled Exception:', err)

  // Zod Input Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return sendError(
      res,
      'Validation failed for input data',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    )
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token', 401, 'INVALID_TOKEN')
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired', 401, 'TOKEN_EXPIRED')
  }

  // Custom application error with status
  const statusCode = (err as unknown as { statusCode?: number }).statusCode || 500
  const message = err.message || 'Internal server error occurred'

  return sendError(
    res,
    message,
    statusCode,
    'SERVER_ERROR',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
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

