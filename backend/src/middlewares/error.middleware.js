/**
 * backend/src/middlewares/error.middleware.js
 *
 * 目的：统一错误处理（Express 错误处理中间件，必须是最后一个 app.use）。
 * 原则：
 * - 这里负责把各种 throw/next(err) 统一转成稳定的 JSON 输出
 * - 生产环境不要把内部 stack 直接返回给前端
 *
 * 你需要按下面小标题逐块填代码（这里只给注释骨架）。
 */

// =========================================================
// 1) 约定统一错误响应结构
// ---------------------------------------------------------
// 建议与 backend/docs/api.md 对齐：
//
// {
//   "error": {
//     "code": "BAD_REQUEST",
//     "message": "..."
//   }
// }
//
// TODO: 定义一个把任意 error 归一化的函数（可选）
function normalizeError(err) {
  const code = err.statusCode || err.status || 'INTERNAL_SERVER_ERROR'
  const message = process.send.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message || 'An unexpected error occurred.'
  return { code, message }
}
// =========================================================
// 2) 定义错误处理中间件签名
// ---------------------------------------------------------
// Express 错误中间件必须是四个参数：
// (err, req, res, next)
//
// TODO: function errorMiddleware(err, req, res, next) { ... }
function errorMiddleware(err, req, res, next) {
  const { code, message } = normalizeError(err)
  const status = err.statusCode || err.status || 500
  res.status(status).json({ error: { code, message } })

}
// =========================================================
// 3) 决定 status code
// ---------------------------------------------------------
// MVP 简化策略（先跑起来）：
// - 如果 err 自带 statusCode / status，就用它
// - 否则默认 500
//
// TODO: const status = ...
const status = err.statusCode || err.status || 500
// =========================================================
// 4) 生成对外 message
// ---------------------------------------------------------
// - 开发环境可以更详细
// - 生产环境尽量只给通用信息
//
// TODO: const message = ...
const message = process.send.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message || 'An unexpected error occurred. '

// =========================================================
// 5) 输出 JSON 并结束请求
// ---------------------------------------------------------
// TODO: res.status(status).json({ error: { code, message } })
res.status(status).json({ error: { code, message } })
// =========================================================
// 6) 导出中间件
// ---------------------------------------------------------
// TODO: module.exports = errorMiddleware
module.exports = errorMiddleware
