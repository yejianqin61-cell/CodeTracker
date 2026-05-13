/**
 * @file 后端进程入口：配置 → 数据库 → HTTP listen。
 * @description 只做启动编排；路由与业务在 `app.js` / `routes` / `controllers`。
 */

const { port, dbPath } = require('./config/env')
const app = require('./app')
const db = require('./db')

/** @type {import('http').Server | undefined} */
let server

async function startServer() {
  await db.initDb(dbPath)

  // 与 Electron 主进程健康检查 URL（127.0.0.1）一致；仅本机回环，避免仅绑定 IPv6 时连不上
  server = app.listen(port, '127.0.0.1', () => {
    console.log(`[server] listening on 127.0.0.1:${port}  dbPath=${dbPath}`)
  })
  server.on('error', (err) => {
    console.error('[server] listen error', err)
    process.exit(1)
  })
}

void startServer()

/**
 * 优雅退出：先关 HTTP，再关 DB。
 * @note `server.close` 为异步回调；若需严格等待可改为 Promise 封装后再 `process.exit`。
 */
async function shutdown(signal) {
  console.log(`[server] ${signal} — shutting down`)
  if (server) {
    server.close(() => {
      console.log('[server] HTTP closed')
    })
  }
  if (typeof db.close === 'function') {
    await db.close()
    console.log('[db] connection closed')
  }
  process.exit(0)
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})
process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})

process.on('unhandledRejection', (reason) => {
  console.error('[process] UnhandledRejection', reason)
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
})
process.on('uncaughtException', (err) => {
  console.error('[process] uncaughtException', err)
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
})
