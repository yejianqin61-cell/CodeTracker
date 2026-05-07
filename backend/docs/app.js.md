# app.js

by human_yejianqin&aiAgent_cursor

```
/**
 * backend/src/app.js
 *
 * 目的：组装一个 Express app（不在这里 listen 端口）。
 * 原则：
 * - 这里负责“装配”：中间件、路由、统一错误处理
 * - 不写业务逻辑；业务逻辑放 controllers/services/repositories
 *
 * 你需要按下面小标题逐块填代码（这里只给注释骨架）。
 */

// =========================================================
// 1) 引入依赖 & 引入本项目模块
// ---------------------------------------------------------
// 你需要的依赖（MVP 建议）：
// - express：Web 框架
//
// 你需要引入的本地模块（后面会写）：
// - routes/index.js：挂载所有 /api 路由
// - middlewares/error.middleware.js：统一错误处理中间件
//
const express = require('express')
const routes = require('./routes')
const errorMiddleware = require('./middlewares/error.middleware')
// =========================================================
// 2) 创建 app 实例
// ---------------------------------------------------------
const app = express()
// =========================================================
// 3) 注册“通用中间件”（只做与业务无关的通用能力）
// ---------------------------------------------------------
// 常见项（按需）：
// - JSON body 解析：app.use(express.json({ limit: '1mb' }))
// - urlencoded（可选）
// - 简单请求日志（可选）
// - CORS（可选；Electron 本地通常不必须，但浏览器访问时可能需要）
//
app.use(express.json({ limit: '1mb' }))

// =========================================================
// 4) 挂载业务路由
// ---------------------------------------------------------
// 约定：统一挂在 /api 前缀下
//
app.use('/api', routes)
// =========================================================
// 5) 404 处理（可选但推荐）
// ---------------------------------------------------------
// 目的：当路由未命中时返回明确的 JSON（而不是默认 HTML）
//
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' })
});
// =========================================================
// 6) 统一错误处理中间件（必须放在所有路由之后）
// ---------------------------------------------------------
// 目的：控制错误输出结构，避免 try/catch 到处写
//
app.use(errorMiddleware)

// =========================================================
// 7) 导出 app（给 index.js 去 listen）
// ---------------------------------------------------------
module.exports = app


```

这个是 `app.js`，它的定位更准确地说是：**Express 应用的“装配/组装层”**（application assembly）。

它负责把一个可用的 Express app 拼出来（中间件、路由、统一错误处理都装好），但**不负责真正启动监听端口**。

所以它**不是整个后端服务的最终入口/main 函数**：真正的“启动入口”通常是 `index.js`（在那里读配置、初始化数据库、`app.listen(...)`）。

下面开始进行解析



```javascript
const express = require('express')
const routes = require('./routes')
const errorMiddleware = require('./middlewares/error.middleware')
```

引入 Express 框架（这是一个 Node.js 的 Web 框架）。

把 `./routes` 导入，挂在 `routes` 常量下面。

更专业/准确的说法是：
- `./routes` 指向的是 `backend/src/routes/index.js`（Node 的模块解析会优先找 `index.js`）。
- `routes` 通常导出的是一个 **`express.Router()` 实例**，里面再“聚合/挂载”了 `health/projects/logs/stats` 等子路由。
- `const routes = require('./routes')`
  - Node 在解析 `./routes` 这个路径时，会去找 `backend/src/routes/index.js`（这是 Node 的默认规则：目录模块默认找 `index.js`）。
  - 所以这里的 `routes` 通常拿到的是 `routes/index.js` 导出的东西。
- `routes/index.js` 里做什么
  - 它一般会 `require('./health.routes') / require('./logs.routes') ...`
  - 然后创建一个 `express.Router()`，把这些子路由 `router.use(...)` 挂进去
  - 最后 `module.exports = router`
- 回到 `app.js`
  - `app.use('/api', routes)` 相当于把“聚合好的总 Router”挂到 `/api` 下
  - 所以你可以把 `routes` 理解成“总路由集合（一个 Router 实例）”，它内部已经把各个模块的路由汇总好了

一句话总结：`require('./routes')` 拿到的是“路由聚合器”（一个 Router），它在 `routes/index.js` 里把各个子路由汇总后导出，`app.js` 再把它挂到 `/api` 前缀下。

然后把错误处理中间件引入，挂在 `errorMiddleware` 常量下面（注意大小写：你代码里是 `errorMiddleware`）。

专业术语上，它是 Express 的 **error-handling middleware（错误处理中间件）**。



```javascript
const app = express()
```

创建 Express 的 app 实例（常叫 `app`）。

注意：这里的 `app` 本质上是一个函数对象 + 一堆方法（如 `use/get/post`），用来注册中间件与路由。



```javascript
app.use(express.json({ limit: '1mb' }))
```

给 `app` 注册 JSON 请求体解析中间件：

- 作用：让你能在路由里通过 `req.body` 读取 JSON body
- `limit: '1mb'`：限制请求体最大 1MB（防止超大 body 占内存/拖慢服务）

专业术语：这是一个 **built-in middleware（内置中间件）**。



```javascript
app.use('/api', routes)
```

把 `routes`（也就是你 `routes/index.js` 聚合出来的总路由）挂载到 `/api` 前缀下。

更直观地理解：
- 当你在 `routes/index.js` 里写 `router.use('/health', healthRoutes)` 时
- 这里再写 `app.use('/api', routes)`
- 最终健康检查的完整路径就是：`/api/health`

所以你这句理解**是对的**，只是表述上建议把“所有 routes 文件夹里的所有路由文件”改成“聚合后的总 router”会更准确。

```javascript
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' })
});
```

这段 404 处理中间件的理解也基本正确，但有一个关键点要更专业地说清楚：

- 它并不是“只要不在 `/api` 挂载的路由中就返回 404”
- 而是：**只要请求一路走下来，前面所有路由/中间件都没有匹配并且也没有提前返回响应**，那么就会走到这里，被你统一返回 404。

因为它被注册在 `app.use('/api', routes)` 之后，所以对本项目当前结构而言：
- `/api/...` 下没匹配到 → 会到这里 → 返回 404 JSON
- 甚至如果你将来增加其他非 `/api` 路由，但仍然放在它前面没匹配到，也会落到这里



```javascript
app.use(errorMiddleware)
```

你这段理解**是对的**，并且非常关键：

- 错误处理中间件（`(err, req, res, next) => { ... }`）必须注册在所有路由之后
- 这样当前面路由里 `throw err` / `next(err)` 时，Express 才能把错误“交给它”来统一处理
- 统一处理的好处：错误响应结构一致、避免每个 controller 都写一堆 try/catch

补充一个术语细节：  
这里不是“规范所有路由中抛出的 error”，而是“**统一处理请求链路中冒泡出来的错误**（并生成统一的 HTTP 响应）”。



```javascript
module.exports = app
```

最后导出 `app`，给 `index.js` 之类的启动文件去做 `app.listen(port)`。

### `index.js` vs `app.js`：两者分别干嘛？（通俗但专业）

- **`app.js`（装配层 / 组装层）**：把 Express app “拼好”
  - 注册通用中间件（例如 `express.json`）
  - 挂载路由（例如 `/api`）
  - 注册 404 与统一错误处理中间件
  - 导出 `app`

- **`index.js`（启动入口 / 引导层 / bootstrap）**：把服务“跑起来”
  - 读取配置（例如从 `config/env.js` 取 `port/dbPath`）
  - 初始化数据库（例如 SQLite 建表/迁移）
  - 调用 `app.listen(port)` 开始监听端口
  - 处理进程信号（SIGINT/SIGTERM）与未捕获异常（可选但推荐）

一句话总结：**`app.js` 负责“拼装”，`index.js` 负责“启动”。**