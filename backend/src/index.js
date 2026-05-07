/**
 * backend/src/index.js
 *
 * 目的：后端进程启动入口（在这里 listen 端口）。
 * 原则：
 * - 这里负责“启动流程编排”：读配置 →（可选）初始化 DB → 启动 HTTP
 * - 不在这里写路由/业务逻辑
 *
 * 你需要按下面小标题逐块填代码（这里只给注释骨架）。
 */

// =========================================================
// 1) 引入依赖 & 引入本项目模块
// ---------------------------------------------------------
// 你需要引入的本地模块：
// - config/env.js：拿到 port/dbPath 等配置
// - app.js：Express app 实例（已装配路由与中间件）
// - db/index.js：初始化 SQLite（MVP 强烈建议在启动阶段做）
//
const { port, dbPath } = require('./config/env')
const app = require('./app')
const db = require('./db')
// =========================================================
// 2) 初始化数据库（可选但建议：启动即建表/迁移）
// ---------------------------------------------------------
// 目标：确保服务启动后数据库可用
//
// 你可以选择两种策略（二选一）：
// - 同步/阻塞式初始化：初始化完成后再 listen（更稳）
// - 异步初始化：listen 后再 init（更快但更容易踩 race）
//
let server

async function startServer() {
  await db.initDb(dbPath)

  // =========================================================
  // 3) 启动 HTTP 服务器（listen）
  // ---------------------------------------------------------
  // - 监听 port
  // - 启动后打印一条清晰日志（端口、dbPath）
  //
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}. DB path: ${dbPath}`)
  })
}
void startServer()
// =========================================================
// 4) 处理进程信号（优雅退出）（可选但推荐）
// ---------------------------------------------------------
// 目标：Ctrl+C 退出时能关闭 server、关闭数据库连接（如果你实现了）
//
// 建议处理：
// - SIGINT（Ctrl+C）
// - SIGTERM（进程被结束）
//
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down gracefully...')
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.')
    })
  }
  if (db.close) {
    await db.close()
    console.log('Database connection closed.')
  }
  process.exit(0)
})
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down gracefully...')
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.')
    })
  }
  if (db.close) {
    await db.close()
    console.log('Database connection closed.')
  }
  process.exit(0)
})
// =========================================================
// 5) 捕获未处理异常（可选但推荐）
// ---------------------------------------------------------
// 目标：打印错误，避免静默崩溃
//
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})
