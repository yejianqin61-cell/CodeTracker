<p align="center">
  <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Electron-33.4-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron" /></a>
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://pinia.vuejs.org/"><img src="https://img.shields.io/badge/Pinia-3-ffd859?style=flat-square&logo=vue.js&logoColor=black" alt="Pinia" /></a>
  <a href="https://router.vuejs.org/"><img src="https://img.shields.io/badge/Vue_Router-4-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue Router" /></a>
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://www.sqlite.org/"><img src="https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" /></a>
  <a href="https://github.com/WiseLibs/better-sqlite3"><img src="https://img.shields.io/badge/better--sqlite3-12-414141?style=flat-square&logo=sqlite&logoColor=white" alt="better-sqlite3" /></a>
  <a href="https://electron-vite.org/"><img src="https://img.shields.io/badge/electron--vite-5-9FE2F0?style=flat-square&logo=electron&logoColor=black" alt="electron-vite" /></a>
  <a href="https://www.electron.build/"><img src="https://img.shields.io/badge/electron--builder-26-4B5563?style=flat-square&logo=electron&logoColor=white" alt="electron-builder" /></a>
  <img src="https://img.shields.io/badge/PostCSS-8-DD3A0A?style=flat-square&logo=postcss&logoColor=white" alt="PostCSS" />
  <img src="https://img.shields.io/badge/Autoprefixer-10-38B2AC?style=flat-square&logo=postcss&logoColor=white" alt="Autoprefixer" />
</p>

# CodeTracker

---

## Overview

**CodeTracker** is a **local-first** desktop MVP for logging coding activity: **SQLite** storage, **Vue + Electron** UI, and an **Express** HTTP API on your machine. No cloud account; data stays offline.

**Repository:** [github.com/yejianqin61-cell/CodeTracker](https://github.com/yejianqin61-cell/CodeTracker)

### MVP features

| Module | Description |
|--------|-------------|
| **Dashboard** | Summary, mini heatmap (current UTC calendar year), quick log entry, recent activity |
| **Logs** | Filter by date/project, paginated list, full CRUD, create projects in-app |
| **Heatmap** | GitHub-style grid; **years ≥ 2026** only (UTC), year selector |
| **Statistics** | Global totals, 7/30-day cards, aligned with heatmap API semantics |
| **Settings** | UI locale (zh/en), API base URL, health check, repository link |
| **i18n** | Chinese / English; preference stored in `localStorage` |

**Backend (`/api`)**: health, projects CRUD, logs CRUD + filters/pagination, stats summary + heatmap range. Contract: [`backend/docs/api.md`](backend/docs/api.md).

### Tech stack

| Layer | Stack |
|-------|--------|
| Shell | **Electron 33.4.11** (aligned with `better-sqlite3` prebuild ABI) |
| UI | Vue 3, Vue Router (hash), Pinia, Tailwind CSS 4, TypeScript, Vite |
| API | Node.js, Express, `better-sqlite3` (SQLite) |
| Build | electron-vite, electron-builder, PostCSS, Autoprefixer |

### Prerequisites

- **Node.js** 20 LTS or 22 recommended  
- **Windows**: packaging needs network for `npm ci` / downloads; **Visual Studio Build Tools** if you must compile native addons from source (prebuilt path preferred)

### Development

The repo root is the Electron + renderer project; the **API lives in `backend/`**.

```bash
npm install
cd backend && npm install && cd ..
```

```bash
# Terminal A — API (default http://127.0.0.1:3033 , DB file backend/database.db)
cd backend && npm start
```

```bash
# Terminal B — Electron dev
npm run dev
```

Optional: **`VITE_API_BASE`** overrides the API origin (`src/renderer/src/api/http.ts`).

### Production builds

| Script | What it does |
|--------|----------------|
| `npm run build` | Compile renderer + main/preload only |
| `npm run dist` | Unlock → build → `stage:backend` → NSIS + portable → `release/` |
| `npm run dist:dir` | Same pipeline, output unpacked `win-unpacked/` only |

The packaged app **starts the embedded backend** automatically. DB path: **`%AppData%\Roaming\codetracker\codetracker.db`** (not the same as dev `backend/database.db`).

### Repository layout

```
CodeTracker/
├── src/                 # Electron main/preload + Vue renderer
├── backend/             # Express + SQLite (+ backend/docs/api.md)
├── scripts/             # stage-backend, dist-unlock
├── electron-builder.yml
└── package.json
```

### Distribution

- Prefer **`CodeTracker Setup *.exe`** from `release/`  
- Or ship a zip of **`win-unpacked`** (run `CodeTracker.exe` inside)  
- **Windows x64** today; publish binaries via GitHub **Releases**

### License

See `package.json` → **ISC**.

---

## 概述（简体中文）

**CodeTracker** 是一款**本地离线**的代码活动记录桌面应用（MVP）：使用 **SQLite** 存储数据，**Vue + Electron** 作为界面，**Express** 在本地提供 HTTP API。无需云端账号，数据不出本机。

**源码仓库：** [github.com/yejianqin61-cell/CodeTracker](https://github.com/yejianqin61-cell/CodeTracker)

### MVP 功能

| 模块 | 说明 |
|------|------|
| **仪表盘** | 汇总数据、迷你热力图（当前 UTC 自然年）、快速记一条日志、最近动态 |
| **日志** | 按日期/项目筛选、分页列表；新建 / 编辑 / 删除；支持在界面内新建项目 |
| **热力图** | GitHub 风格周格；**仅展示 2026 年及以后**的 UTC 自然年，年份下拉切换 |
| **统计** | 全局汇总、近 7/30 日卡片、与热力图接口一致的数据口径 |
| **设置** | 界面语言（中/英）、API 基地址展示、健康检查、开源仓库链接 |
| **国际化** | 中文 / English，语言偏好保存在本机 `localStorage` |

**后端（`/api`）**：健康检查、项目 CRUD、日志 CRUD 与筛选分页、统计摘要与热力图区间。契约见 [`backend/docs/api.md`](backend/docs/api.md)。

### 技术栈

| 层级 | 技术 |
|------|------|
| 桌面壳 | Electron **33.4.11**（与 `better-sqlite3` 预编译 ABI 对齐） |
| 前端 | Vue 3、Vue Router（Hash）、Pinia、Tailwind CSS 4、TypeScript、Vite |
| 后端 | Node.js、Express、`better-sqlite3`（SQLite） |
| 构建 | electron-vite、electron-builder、PostCSS、Autoprefixer |

### 环境要求

- **Node.js** 建议 **20 LTS** 或 **22**
- **Windows**：打安装包需联网执行 `npm ci` / 下载依赖；若需从源码编译原生模块，建议安装 **Visual Studio Build Tools**（打包流程优先使用预编译包）

### 开发运行

仓库根目录为 Electron + 前端工程；**后端在 `backend/` 子目录**。

```bash
npm install
cd backend && npm install && cd ..
```

```bash
# 终端 A：后端（默认 http://127.0.0.1:3033 ，数据库 backend/database.db）
cd backend && npm start
```

```bash
# 终端 B：Electron 开发窗口
npm run dev
```

可选：环境变量 **`VITE_API_BASE`** 覆盖 API 根地址（见 `src/renderer/src/api/http.ts`）。

### 生产构建

| 命令 | 说明 |
|------|------|
| `npm run build` | 仅编译前端 + Electron 主/预加载脚本 |
| `npm run dist` | 解锁占用 → 编译 → `stage:backend` → NSIS 安装包 + portable → `release/` |
| `npm run dist:dir` | 同上，仅解包到 `release/win-unpacked/` |

安装版会**自动启动内置后端**；数据库在 **`%AppData%\Roaming\codetracker\codetracker.db`**，与开发时 `backend/database.db` **不是同一文件**。

### 目录结构（简要）

```
CodeTracker/
├── src/                 # Electron main/preload + Vue 渲染进程
├── backend/             # Express + SQLite（含 backend/docs/api.md）
├── scripts/             # stage-backend、dist-unlock
├── electron-builder.yml
└── package.json
```

### 发布

- 推荐分发 **`release/`** 下的 **`CodeTracker Setup *.exe`**
- 或分发完整 **`win-unpacked`** 压缩包（解压后运行 `CodeTracker.exe`）
- 当前为 **Windows x64**；在 GitHub **Releases** 上传对应产物即可

### 许可

以 `package.json` 中 `license` 字段为准（**ISC**）。
