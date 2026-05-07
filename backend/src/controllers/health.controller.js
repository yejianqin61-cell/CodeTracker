/**
 * backend/src/controllers/health.controller.js
 *
 * 目的：处理健康检查请求（只关心 HTTP 入参/出参）。
 * 原则：
 * - controller 只做：读 req → 调 service（如果需要）→ res.json(...)
 * - 不写 SQL、不写复杂业务规则（那些放 service/repo）
 *
 * 你需要按下面小标题逐块填代码（这里只给注释骨架）。
 */

// =========================================================
// 1) 定义 handler（建议导出一个对象或函数集合）
// ---------------------------------------------------------
// MVP 建议返回：
// - ok: true
// - service: 固定字符串（便于确认命中了哪个服务）
// - time: 当前时间（ISO 字符串）
//
// 可选增强（后面再做）：
// - db: true/false（如果你想在这里做 db ping）
//
// TODO: function getHealth(req, res) { ... }
// TODO: module.exports = { getHealth }

function getHealth(req, res) {
  const responseData = {
    ok: true,
    service: 'code-tracker-backend',
    time: new Date().toISOString()

  }
  res.json(responseData)
}
module.exports = { getHealth }
