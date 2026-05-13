/**
 * @file 与 HTTP 语义相关的轻量工具（无 Express 依赖）。
 * @description
 * `HttpError` 携带 `statusCode` 与 `code`，供 `middlewares/error.middleware.js` 映射为
 * `docs/api.md` §6 中的统一 JSON 错误体。
 */

class HttpError extends Error {
  /**
   * @param {number} statusCode HTTP 状态码（如 400、404、409）
   * @param {string} code 对外错误码（如 `BAD_REQUEST`）
   * @param {string} message 人类可读说明
   */
  constructor(statusCode, code, message) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

module.exports = { HttpError }
