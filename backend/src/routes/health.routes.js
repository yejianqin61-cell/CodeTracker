/**
 * @file 健康检查路由：`GET /api/health`（在 `routes/index.js` 中挂载于 `/health`）。
 * @see {@link ../controllers/health.controller.js}
 */

const express = require('express')
const healthController = require('../controllers/health.controller')

const router = express.Router()

router.get('/', healthController.getHealth)

module.exports = router
