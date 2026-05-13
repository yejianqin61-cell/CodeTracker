/**
 * @file Logs HTTP 控制器。
 * @description 将 query/body/params 交给 service；错误经 `next(err)` 统一处理。
 * @see backend/docs/api.md（Logs）
 */

const logsService = require('../services/logs.service')

/** `GET /api/logs` */
async function listLogs(req, res, next) {
  try {
    const data = await logsService.listLogs(req.query)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

/** `POST /api/logs` */
async function createLog(req, res, next) {
  try {
    const data = await logsService.createLog(req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

/** `PUT /api/logs/:id` */
async function updateLog(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const data = await logsService.updateLog(id, req.body)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

/** `DELETE /api/logs/:id` */
async function deleteLog(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const data = await logsService.deleteLog(id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = { listLogs, createLog, updateLog, deleteLog }
