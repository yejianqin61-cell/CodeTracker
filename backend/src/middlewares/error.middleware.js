/**
 * @file Express 统一错误处理中间件（四参数），须挂在所有路由之后。
 * @see backend/docs/api.md（错误响应约定）
 */

function normalizeError(err) {
  const statusCode =
    typeof err.statusCode === 'number'
      ? err.statusCode
      : typeof err.status === 'number'
        ? err.status
        : 500

  const code =
    typeof err.code === 'string' && err.code.length > 0
      ? err.code
      : statusCode === 400
        ? 'BAD_REQUEST'
        : statusCode === 404
          ? 'NOT_FOUND'
          : statusCode === 409
            ? 'CONFLICT'
            : 'INTERNAL_SERVER_ERROR'

  const isProd = process.env.NODE_ENV === 'production'
  const message =
    isProd && statusCode >= 500
      ? 'An unexpected error occurred.'
      : err.message || 'An unexpected error occurred.'

  return { statusCode, code, message }
}

function errorMiddleware(err, req, res, next) {
  const { statusCode, code, message } = normalizeError(err)
  res.status(statusCode).json({ error: { code, message } })
}

module.exports = errorMiddleware
