/**
 * @file 开发日志领域服务：校验、分页默认值、调用 repository。
 * @description Query/Body 契约见 `backend/docs/api.md`；错误以 `HttpError` 抛出。
 */

const logsRepo = require('../repositories/logs.repo')
const { HttpError } = require('../utils/http')

/**
 * 列表查询，带分页元数据。
 * @param {Record<string, unknown>} query
 */
async function listLogs(query) {
  const pageRaw = parseInt(String(query.page), 10)
  const pageSizeRaw = parseInt(String(query.page_size), 10)

  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
  const page_size = Number.isFinite(pageSizeRaw) && pageSizeRaw >= 1 ? pageSizeRaw : 20

  const filters = {
    date: query.date,
    project_id: query.project_id ? parseInt(String(query.project_id), 10) : undefined,
    q: query.q,
    page,
    page_size
  }

  const total = logsRepo.countLogs(filters)
  const items = logsRepo.listLogs(filters)

  return { items, page, page_size, total }
}

/**
 * 创建日志。
 * @param {Record<string, unknown>} body
 */
async function createLog(body) {
  const { date, project_id, code_lines, duration_minutes, note } = body
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpError(400, 'BAD_REQUEST', 'date is required and must be in YYYY-MM-DD format')
  }
  if (typeof project_id !== 'number' || project_id <= 0) {
    throw new HttpError(400, 'BAD_REQUEST', 'project_id is required and must be a positive integer')
  }
  if (typeof code_lines !== 'number' || code_lines < 0) {
    throw new HttpError(400, 'BAD_REQUEST', 'code_lines is required and must be a non-negative integer')
  }
  if (typeof duration_minutes !== 'number' || duration_minutes < 0) {
    throw new HttpError(400, 'BAD_REQUEST', 'duration_minutes is required and must be a non-negative integer')
  }
  if (note !== undefined && note !== null && typeof note !== 'string') {
    throw new HttpError(400, 'BAD_REQUEST', 'note must be a string')
  }
  const id = logsRepo.insert({
    date,
    project_id,
    code_lines,
    duration_minutes,
    note: note ?? ''
  })
  return { id }
}

/**
 * 部分更新；不存在时 404。
 * @param {number} id
 * @param {Record<string, unknown>} body
 */
async function updateLog(id, body) {
  const log = logsRepo.findById(id)
  if (!log) {
    throw new HttpError(404, 'NOT_FOUND', 'log not found')
  }
  const { date, project_id, code_lines, duration_minutes, note } = body
  if (date !== undefined) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new HttpError(400, 'BAD_REQUEST', 'date must be in YYYY-MM-DD format')
    }
    log.date = date
  }
  if (project_id !== undefined) {
    if (typeof project_id !== 'number' || project_id <= 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'project_id must be a positive integer')
    }
    log.project_id = project_id
  }
  if (code_lines !== undefined) {
    if (typeof code_lines !== 'number' || code_lines < 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'code_lines must be a non-negative integer')
    }
    log.code_lines = code_lines
  }
  if (duration_minutes !== undefined) {
    if (typeof duration_minutes !== 'number' || duration_minutes < 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'duration_minutes must be a non-negative integer')
    }
    log.duration_minutes = duration_minutes
  }
  if (note !== undefined) {
    if (typeof note !== 'string') {
      throw new HttpError(400, 'BAD_REQUEST', 'note must be a string')
    }
    log.note = note
  }
  logsRepo.update(id, log)
  return { ok: true }
}

/** 删除；不存在时 404。 */
async function deleteLog(id) {
  const log = logsRepo.findById(id)
  if (!log) {
    throw new HttpError(404, 'NOT_FOUND', 'log not found')
  }
  logsRepo.deleteById(id)
  return { ok: true }
}

module.exports = { listLogs, createLog, updateLog, deleteLog }
