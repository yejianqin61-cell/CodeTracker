/**
 * backend/src/routes/index.js
 *
 * 目的：聚合所有子路由（projects/logs/stats/health），统一挂在 /api 下。
 * 原则：
 * - 这里只做“URL → 子路由”映射，不写业务逻辑
 * - 每个模块各自维护自己的 routes 文件
 *
 * 你需要按下面小标题逐块填代码（这里只给注释骨架）。
 */

// =========================================================
// 1) 引入依赖 & 引入子路由模块
// ---------------------------------------------------------
const express = require('express')
const healthRoutes = require('./health.routes')
const projectsRoutes = require('./projects.routes')
const logsRoutes = require('./logs.routes')
const statsRoutes = require('./stats.routes')

// =========================================================
// 2) 创建一个 router（用来挂载子路由）
// ---------------------------------------------------------
const router = express.Router()

// =========================================================
// 3) 挂载子路由（建议路径约定）
// ---------------------------------------------------------
// 建议（MVP）：
// - GET  /health
// - GET  /projects
// - POST /projects
// - GET  /logs
// - POST /logs
// - PUT  /logs/:id
// - DELETE /logs/:id
// - GET /summary
// - GET /heatmap
//
router.use('/health', healthRoutes)
router.use('/projects', projectsRoutes)
router.use('/logs', logsRoutes)
router.use('/', statsRoutes) // stats 里可以挂 /summary /heatmap

// =========================================================
// 4) 导出 router
// ---------------------------------------------------------
module.exports = router