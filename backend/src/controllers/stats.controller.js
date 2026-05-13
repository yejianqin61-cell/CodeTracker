/**
 * @file Stats HTTP 控制器（summary / heatmap）。
 * @description
 * - 只做 HTTP 适配：读 `req.query` → 调 service → `res.json(...)`
 * - 错误统一 `next(err)` 交给 `middlewares/error.middleware.js`
 * @see backend/docs/api.md §5
 *
 * 【注释规范】参考答案只在 `//`；手写区留空由你写。
 */

// ════════════════════════════════════════════════════════════════════
// 段落 1 — 参考答案：依赖
// ════════════════════════════════════════════════════════════════════
// const statsService = require('../services/stats.service')

// ────────────────────────────────────────────────────────────────────
// 手写区 1：依赖
// ────────────────────────────────────────────────────────────────────
const statesService=require('../services/stats.service')


// ════════════════════════════════════════════════════════════════════
// 段落 2 — 参考答案：getSummary (GET /api/summary)
// ════════════════════════════════════════════════════════════════════
// async function getSummary(req, res, next) {
//   try {
//     const data = await statsService.getSummary(req.query)
//     res.json(data)
//   } catch (err) {
//     next(err)
//   }
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 2：getSummary
// ────────────────────────────────────────────────────────────────────

async function getSummary(req,res,next){
    try{
        const data=await statesService.getSummary(req.query)
        res.json(data)
    }catch(e){
        next(e)
    }
}

// ════════════════════════════════════════════════════════════════════
// 段落 3 — 参考答案：getHeatmap (GET /api/heatmap)
// ════════════════════════════════════════════════════════════════════
// async function getHeatmap(req, res, next) {
//   try {
//     const data = await statsService.getHeatmap(req.query)
//     res.json(data)
//   } catch (err) {
//     next(err)
//   }
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 3：getHeatmap
// ────────────────────────────────────────────────────────────────────

async function getHeatmap(req,res,next){
    try{
        const data=await statesService.getHeatmap(req.query)
        res.json(data)
    }catch(e){
        next(e)
    }
}

// ════════════════════════════════════════════════════════════════════
// 段落 4 — 参考答案：导出
// ══════════════════════════════════════════════
// module.exports = { getSummary, getHeatmap }

// ────────────────────────────────────────────────────────────────────
// 手写区 4：导出
// ────────────────────────────────────────────────────────────────────
module.exports={getSummary,getHeatmap}

