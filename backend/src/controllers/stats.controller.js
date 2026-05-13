/**
 * @file Stats HTTP 控制器：`GET /api/summary`、`GET /api/heatmap`。
 * @description 读 `req.query` 调用 service；错误 `next(err)`。
 * @see backend/docs/api.md（Stats）
 */

const statsService = require('../services/stats.service')

async function getSummary(req, res, next) {
  try {
    const data = await statsService.getSummary(req.query)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function getHeatmap(req, res, next) {
  try {
    const data = await statsService.getHeatmap(req.query)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = { getSummary, getHeatmap }
