/**
 * backend/src/routes/health.routes.js
 *
 * 目的：提供健康检查接口（最小可用接口）。
 * 原则：
 * - 这里只定义路由与 HTTP method
 * - 具体响应内容交给 controller
 *
 * 你需要按下面小标题逐块填代码（这里只给注释骨架）。
 */

// =========================================================
// 1) 引入依赖 & 引入 controller
// ---------------------------------------------------------
// TODO: const express = require('express')
// TODO: const healthController = require('../controllers/health.controller')
const express = require('express')
const healthController = require('../controllers/health.controller')
// =========================================================
// 2) 创建 router
// ---------------------------------------------------------
// TODO: const router = express.Router()
const router = express.Router()
// =========================================================
// 3) 定义路由
// ---------------------------------------------------------
// 约定（与 backend/docs/api.md 对齐）：
// - GET /api/health
//
// 在 routes/index.js 里会挂载：router.use('/health', healthRoutes)
// 所以这里的 path 通常写 '/'：
// - router.get('/', healthController.getHealth)
//
// TODO: router.get('/', ...)
router.get('/', healthController.getHealth)

// =========================================================
// 4) 导出 router
// ---------------------------------------------------------
// TODO: module.exports = router
module.exports = router
