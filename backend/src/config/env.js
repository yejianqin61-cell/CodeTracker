/**
 * @file 运行时配置：从环境变量读取、默认值与启动期校验。
 * @description 仅导出配置对象，不包含业务逻辑。
 *
 * 环境变量：
 * - `PORT`：监听端口，默认 3033
 * - `DB_PATH`：SQLite 文件路径，默认 `./database.db`（相对 `process.cwd()`）
 * - `NODE_ENV`：可选，`development` / `production`
 * - `CORS_ORIGIN`：可选，预留
 */

const PORT_RAW = process.env.PORT
const DB_PATH_RAW = process.env.DB_PATH
const NODE_ENV_RAW = process.env.NODE_ENV
const CORS_ORIGIN_RAW = process.env.CORS_ORIGIN

const parsedPort = parseInt(PORT_RAW, 10)
const portFromEnv = Number.isFinite(parsedPort) ? parsedPort : undefined
const dbPathFromEnv = DB_PATH_RAW ? DB_PATH_RAW.trim() : undefined
const nodeEnv = NODE_ENV_RAW ? NODE_ENV_RAW.trim() : undefined
const corsOrigin = CORS_ORIGIN_RAW ? CORS_ORIGIN_RAW.trim() : undefined

const DEFAULT_PORT = 3033
const DEFAULT_DB_PATH = './database.db'
const port = portFromEnv ?? DEFAULT_PORT
const dbPath = dbPathFromEnv ?? DEFAULT_DB_PATH

if (port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${port}. Must be an integer between 1 and 65535.`)
}
if (!dbPath) {
  throw new Error('DB_PATH is required and must be a non-empty string.')
}

module.exports = { port, dbPath, nodeEnv, corsOrigin }
