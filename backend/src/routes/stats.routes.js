/**
 * @file Stats 路由：`GET /summary`、`GET /heatmap`（聚合路由挂载为 `/api` 前缀）。
 * @see backend/docs/api.md（Stats）
 */

const express = require('express')
const statsController = require('../controllers/stats.controller')

const router = express.Router()

router.get('/summary', statsController.getSummary)
router.get('/heatmap', statsController.getHeatmap)

module.exports = router
