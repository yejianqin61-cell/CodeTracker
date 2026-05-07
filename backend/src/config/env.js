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
// TODO: const PORT_RAW = process.env.PORT
// TODO: const DB_PATH_RAW = process.env.DB_PATH
// TODO: const NODE_ENV_RAW = process.env.NODE_ENV
// TODO: const CORS_ORIGIN_RAW = process.env.CORS_ORIGIN

// =========================================================
// 2) 解析与类型转换（字符串 → number/boolean）
// ---------------------------------------------------------
// - PORT 要转成 number
// - 处理 NaN/空字符串
//
// TODO: const port = ...
// TODO: const dbPath = ...
// TODO: const nodeEnv = ...
// TODO: const corsOrigin = ...

// =========================================================
// 3) 默认值（MVP 先让它“必能跑起来”）
// ---------------------------------------------------------
// - PORT：给默认值
// - DB_PATH：给默认值（注意：建议用绝对路径或基于 process.cwd() 拼接）
//
// TODO: const port = parsedPort ?? DEFAULT_PORT
// TODO: const dbPath = parsedDbPath ?? DEFAULT_DB_PATH

// =========================================================
// 4) 合法性校验（建议：启动就失败，而不是跑到一半才炸）
// ---------------------------------------------------------
// - port 必须在 1-65535
// - dbPath 必须是非空字符串
// - from/to/date 格式校验不要放这里（那是业务入参校验，放 controller/service）
//
// TODO: if (port invalid) throw new Error(...)
// TODO: if (dbPath invalid) throw new Error(...)

// =========================================================
// 5) 导出统一配置对象（全项目只依赖这一份）
// ---------------------------------------------------------
// - 让 app.js / db/index.js / index.js 等文件 import/require 这里
//
// TODO: module.exports = { port, dbPath, nodeEnv, corsOrigin }

