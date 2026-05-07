```javascript
/**
 * backend/src/config/env.js
 *
 * 目的：集中管理后端运行时配置（从环境变量读取 + 默认值 + 校验）。
 * 原则：这里不写业务逻辑，只输出“干净的配置对象”。
 *
 * 你需要在下面按小标题逐块填代码（我只写注释给你做路线图）。
 */

// =========================================================
// 1) 读取环境变量（process.env）
// ---------------------------------------------------------
// - 从 process.env 读取你需要的配置项
// - 建议统一在这里读取，避免全项目到处散落 process.env.xxx
//
// 需要的 env（MVP 建议）：
// - PORT：Express 监听端口（默认 3033 或 3001，二选一即可）
// - DB_PATH：SQLite 数据库文件路径（默认 ./database.db 或 backend/database.db）
// - NODE_ENV：development / production（可选）
// - CORS_ORIGIN：允许的来源（MVP 可先只允许本地；也可以先不做 CORS）
//
const PORT_RAW = process.env.PORT
const DB_PATH_RAW = process.env.DB_PATH
const NODE_ENV_RAW = process.env.NODE_ENV
const CORS_ORIGIN_RAW = process.env.CORS_ORIGIN
// =========================================================
// 2) 解析与类型转换（字符串 → number/boolean）
// ---------------------------------------------------------
// - PORT 要转成 number
// - 处理 NaN/空字符串
//
const parsedPort = parseInt(PORT_RAW, 10)
const portFromEnv = Number.isFinite(parsedPort) ? parsedPort : undefined
const dbPathFromEnv = DB_PATH_RAW ? DB_PATH_RAW.trim() : undefined
const nodeEnv = NODE_ENV_RAW ? NODE_ENV_RAW.trim() : undefined
const corsOrigin = CORS_ORIGIN_RAW ? CORS_ORIGIN_RAW.trim() : undefined
// =========================================================
// 3) 默认值（MVP 先让它“必能跑起来”）
// ---------------------------------------------------------
// - PORT：给默认值
// - DB_PATH：给默认值（注意：建议用绝对路径或基于 process.cwd() 拼接）
//
const DEFAULT_PORT = 3033
const DEFAULT_DB_PATH = './database.db'
const port = portFromEnv ?? DEFAULT_PORT
const dbPath = dbPathFromEnv ?? DEFAULT_DB_PATH
// =========================================================
// 4) 合法性校验（建议：启动就失败，而不是跑到一半才炸）
// ---------------------------------------------------------
// - port 必须在 1-65535
// - dbPath 必须是非空字符串
// - from/to/date 格式校验不要放这里（那是业务入参校验，放 controller/service）
//
if (port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${port}. Must be an integer between 1 and 65535.`);
}
if (!dbPath) {
  throw new Error('DB_PATH is required and must be a non-empty string.');
}
// =========================================================
// 5) 导出统一配置对象（全项目只依赖这一份）
// ---------------------------------------------------------
// - 让 app.js / db/index.js / index.js 等文件 import/require 这里
//
module.exports = { port, dbPath, nodeEnv, corsOrigin }

```

第一次古法编程，肯定没办法做到完美。

这次是有 Cursor 帮忙搭的框架，给的小标题注释，以及 VSCode 的补全提示，才让我能完成古法编程，进一步了解后端的细节，在心里形成后端的框架——这一步很重要。

这个 `config/env.js` 的整体流程是：

读取环境变量（`process.env`） → 解析/清洗 → 设置默认值兜底 → 合法性校验 → 导出全项目依赖的统一配置对象

下面一一进行解释



```javascript
const PORT_RAW = process.env.PORT
const DB_PATH_RAW = process.env.DB_PATH
const NODE_ENV_RAW = process.env.NODE_ENV
const CORS_ORIGIN_RAW = process.env.CORS_ORIGIN

```

**PORT_RAW**：从 `process.env.PORT` 读取端口号的**原始值**（未经解析/校验），类型是 `string | undefined`。之所以叫 RAW，就是“原始输入”。

重要纠正：这里读的是 **`process.env`**，并不是“自动读取 `.env` 文件”。  
如果你希望 `.env` 文件里的内容进入 `process.env`，需要你在程序启动阶段显式加载（例如使用 `dotenv`），或者你在系统/命令行里提前设置了环境变量。

**DB_PATH_RAW：**从 `process.env.DB_PATH` 读取 SQLite 数据库文件路径的**原始值**（未经解析/校验），类型是 `string | undefined`。

这里补充一个关键点：`DB_PATH` **可以是相对路径，也可以是绝对路径**。
- 相对路径例子：`./database.db`
- 绝对路径例子：`C:\\Users\\你\\Documents\\CodeTracker\\database.db`

如果是相对路径，它是**相对于 `process.cwd()`（启动时的当前工作目录）**的。Electron / 不同启动方式下 `cwd` 可能不一样，所以相对路径后面要格外留意（MVP 先这样也可以，后面再优化成固定落盘位置）。

**NODE_ENV_RAW**：从 `process.env.NODE_ENV` 读取运行环境标识（常见是 `development` / `production`），类型 `string | undefined`。

它通常用来影响：
- 开发环境：日志更详细、错误返回更直观
- **生产环境：更谨慎的错误输出（不暴露内部堆栈）、更保守的日志**

**CORS_ORIGIN_RAW**：从 `process.env.CORS_ORIGIN` 读取允许跨域的来源（Origin），类型 `string | undefined`。

通俗解释 CORS：浏览器为了安全，会拦截“不同来源”的请求；服务端要显式允许某些来源，浏览器才放行。
- 如果你的前端是 Vite 开发服务器（例如 `http://localhost:5173`），后端是 `http://localhost:3033`，这在浏览器视角是跨域，可能需要 CORS。
- 在 Electron 里很多场景限制没那么严格，但开发阶段依然可能遇到，所以保留这个配置是合理的。





```javascript
const parsedPort = parseInt(PORT_RAW, 10)
const portFromEnv = Number.isFinite(parsedPort) ? parsedPort : undefined
const dbPathFromEnv = DB_PATH_RAW ? DB_PATH_RAW.trim() : undefined
const nodeEnv = NODE_ENV_RAW ? NODE_ENV_RAW.trim() : undefined
const corsOrigin = CORS_ORIGIN_RAW ? CORS_ORIGIN_RAW.trim() : undefined
```





这一块就是对 RAW 数据进行“解析/清洗”：把字符串变成更好用的类型（例如 number），或者在不合法时变成 `undefined`，这样后面就能用默认值兜底。

parsedPort就是对端口号进行数字化



const portFromEnv = Number.isFinite(parsedPort) ? parsedPort : undefined

这句话就是判断上一句解析出来的parsedPort是否是个有限的数字,如果是,那就是它本身,并赋值给portFromEnv,

如果不是,那么就让portFromEnv成为undefined,



`dbPathFromEnv`：对 `DB_PATH_RAW` 做存在性判断与清洗：

- 如果 `DB_PATH_RAW` 存在：`trim()` 后得到更干净的路径字符串
- 如果不存在：变成 `undefined`，交给后面的默认值兜底

**`trim()` 是干嘛的：****去掉字符串首尾的空格/换行/制表符**。  
比如用户在 `.env` 写了 `DB_PATH= ./database.db `（前后多空格），`trim()` 可以把这些意外空白去掉，避免路径出错。



nodeEnv同理



```JavaScript
const DEFAULT_PORT = 3033
const DEFAULT_DB_PATH = './database.db'
const port = portFromEnv ?? DEFAULT_PORT
const dbPath = dbPathFromEnv ?? DEFAULT_DB_PATH
```



设置默认值,3033和./database.db



然后，如果 `portFromEnv` 或 `dbPathFromEnv` 是 `undefined`，就会用默认值给最终的 `port` / `dbPath`。



```javascript
if (port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${port}. Must be an integer between 1 and 65535.`);
}
if (!dbPath) {
  throw new Error('DB_PATH is required and must be a non-empty string.');
}
```

然后进行合法性校验,如果不合法,直接无法启动server



```javascript
module.exports = { port, dbPath, nodeEnv, corsOrigin }
```

最后把这些环境变量暴露给整个项目使用

---

## 常见疑问

### 1）是不是“服务器开始监听端口后”，端口号就会写到 `process.env.PORT`，并被 `PORT_RAW` 读取？

不是。更准确的关系是：

- `process.env.PORT` 是**程序启动前**就存在的输入（来自系统环境变量/命令行/或 `.env` 被你用 `dotenv` 显式加载进来）。
- 代码在启动时读取它，放进 `PORT_RAW`，再解析成最终的 `port`。
- 然后调用 `app.listen(port)`，服务器才开始监听这个端口。

也就是说：**端口监听是你用 `port` 去 listen 的结果，不会反过来“写回”到 `process.env`**。

另外注意大小写：本项目里用的是 `process.env.PORT`（全大写），不是 `process.env.port`。

### 2）是不是“只要启动服务器”，就会有 `process` 变量，以及 `process.env` 之类？

更准确的说法是：**只要你运行的是 Node.js 程序，就有 `process` 这个全局对象**，跟你有没有启动 HTTP 服务器没直接关系。

- `process` 是 Node.js 提供的全局对象
- `process.env` 是其中的一个属性，表示“当前进程的环境变量集合”（key/value 字符串）
- `process` 还有很多常用能力，例如：
  - `process.cwd()`：当前工作目录（相对路径的基准）
  - `process.exit()`：退出进程
  - `process.on(...)`：监听信号/异常（比如 SIGINT、unhandledRejection）