/**
 * @fileoverview 聚合 `/api` 下各子路由（health、projects、logs、stats）。
 * @description
 * 只做路径挂载，不包含业务逻辑。子路由各自 `module.exports` 为 `express.Router()`。
 * @see backend/docs/api.md
 */

const express = require('express')
const healthRoutes = require('./health.routes')
const projectsRoutes = require('./projects.routes')
const logsRoutes = require('./logs.routes')
const statsRoutes = require('./stats.routes')

const router = express.Router()

router.use('/health', healthRoutes)
router.use('/projects', projectsRoutes)
router.use('/logs', logsRoutes)
router.use('/', statsRoutes)

module.exports = router
