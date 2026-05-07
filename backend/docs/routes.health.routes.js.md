# routes/health.routes.js

```javascript
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

```



这个路由就是用来做 **健康检查（health check）** 的。

通俗解释：健康检查就是一个“最简单、最稳定”的接口，用来回答一句话：**后端服务现在是不是活着、能不能正常响应请求**。

它通常用于：
- **你自己开发调试**：先确认服务启动成功、路由链路没问题（比一上来就写复杂业务更稳）
- **前端/桌面端探活**：应用启动时先请求一下，确认后端可用
- （以后如果你做进程守护/自动重启/打包部署）用于监控探测

在 MVP 阶段，health 接口一般不做复杂逻辑，返回 `{ ok: true }` + 当前时间就够了；后面你也可以增强成“顺便检测数据库是否能连上”。





下面开始解析

```javascript
const express = require('express')
const healthController = require('../controllers/health.controller')
```



仍然是引入 Express 框架，赋给 `express` 常量，因为下面要用 `express.Router()` 来创建 Router。

然后把 `health.controller.js` 引入进来，赋给 `healthController` 常量。

`healthController` 是 **控制器（controller）**：它负责处理 HTTP 请求并返回 HTTP 响应。

在这个文件里，你把“路由定义”和“具体怎么响应”分开了：
- `health.routes.js`：定义 URL + method（GET/POST 等）
- `health.controller.js`：定义当这个路由命中时具体做什么（比如返回 JSON）

这样做的好处是：结构清晰、可维护，业务复杂后不会把所有逻辑挤在 routes 文件里。



```javascript
const router = express.Router()
```



这个地方就是找一个express.Router()实例,赋予给了router这个常量

但是这个router现在没有挂任何路由



```javascript
router.get('/', healthController.getHealth)
```





对的：这里是通过 `router.get(...)` 注册了一个 **GET 请求处理函数（handler）**，也就是 `healthController.getHealth`。

### 为什么这里用 `get` 而不是 `use`？

- `router.get(path, handler)`：只匹配 **GET** 请求（更精确），用于定义一个具体的“接口 endpoint”。
- `router.use(path, middlewareOrRouter)`：更通用，常用来挂载：
  - 中间件（对所有 method 生效）
  - 或者子路由（把另一个 router 挂在某个前缀下）

这里你要做的是一个明确的接口：`GET /api/health`，所以用 `get` 最合适、语义最清楚。

### `getHealth` 是什么性质的东西？

它通常是一个 **Express handler 函数**，形态一般是：

- `(req, res) => { ... }`
- 或 `(req, res, next) => { ... }`（需要把错误交给错误中间件时用 next）

它属于“控制器函数”，专门负责这个接口的响应。

### `router.get('/', ...)` 里面的 `'/'` 到底表示什么？

它表示的是 **相对于“挂载点”的子路径**。

你这条路由的完整路径是“多段拼出来的”：

1. 在 `app.js`：`app.use('/api', routes)`  → 先加上 `/api`
2. 在 `routes/index.js`：`router.use('/health', healthRoutes)` → 再加上 `/health`
3. 在 `health.routes.js`：`router.get('/', ...)` → 最后加上 `/`

拼接后就是：`GET /api/health`

所以这里写 `'/'` 的意思是：“在 health 这个子路由根路径上处理 GET 请求”。







```javascript
module.exports = router
```

最后导出 `router`，让 `routes/index.js` 能 `require('./health.routes')` 把它聚合起来。