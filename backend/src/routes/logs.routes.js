/**
 * @file Logs 路由：`/api/logs` 与 `/api/logs/:id`（在聚合路由中挂载于 `/logs`）。
 * @see backend/docs/api.md（Logs）
 */

const express = require('express')
const logsController = require('../controllers/logs.controller')

const router = express.Router()

router.get('/', logsController.listLogs)
router.post('/', logsController.createLog)
router.put('/:id', logsController.updateLog)
router.delete('/:id', logsController.deleteLog)

module.exports = router
