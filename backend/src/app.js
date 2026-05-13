/**
 * @file Express 应用装配：全局中间件、`/api` 路由、404 与统一错误处理。
 * @description 不包含业务逻辑；不在此 `listen`，由 `index.js` 启动 HTTP。
 */

const express = require('express')
const routes = require('./routes')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

app.use(express.json({ limit: '1mb' }))

// Electron + Vite 开发时渲染进程与 API 端口不同，需处理 CORS 与 OPTIONS 预检。
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  next()
})

app.use('/api', routes)

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' })
})

app.use(errorMiddleware)

module.exports = app
