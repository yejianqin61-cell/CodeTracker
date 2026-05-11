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

  server = app.listen(port, () => {
    console.log(`[server] listening on :${port}  dbPath=${dbPath}`)
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
})
process.on('uncaughtException', (err) => {
  console.error('[process] uncaughtException', err)
})
