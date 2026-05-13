import { app, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { spawn, type ChildProcess } from 'node:child_process'

const API_PORT = 3033

let backendChild: ChildProcess | null = null

/** 与渲染进程默认 API 基址一致 */
export function embeddedApiBase(): string {
  return `http://127.0.0.1:${API_PORT}`
}

export function shouldEmbedBackend(): boolean {
  if (!app.isPackaged) return false
  const entry = path.join(process.resourcesPath, 'backend', 'src', 'index.js')
  return fs.existsSync(entry)
}

function backendLogPath(): string {
  return path.join(app.getPath('userData'), 'backend-spawn.log')
}

async function waitForHealth(timeoutMs: number, logPath: string): Promise<boolean> {
  const url = `${embeddedApiBase()}/api/health`
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const child = backendChild
    if (child && child.exitCode !== null) {
      throw new Error(
        `内置后端进程已退出（退出码 ${String(child.exitCode)}）。请查看日志：\n${logPath}\n常见原因：3033 端口已被其它程序占用。`,
      )
    }
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) return true
    } catch {
      /* 服务尚未就绪 */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

/**
 * 使用当前 Electron 可执行文件以 Node 模式运行嵌入的 Express 后端。
 * @see https://www.electronjs.org/docs/latest/tutorial/using-as-node
 */
export async function startEmbeddedBackend(): Promise<void> {
  const backendRoot = path.join(process.resourcesPath, 'backend')
  const script = path.join(backendRoot, 'src', 'index.js')
  if (!fs.existsSync(script)) {
    throw new Error(`未找到嵌入后端: ${script}`)
  }

  const dbPath = path.join(app.getPath('userData'), 'codetracker.db')
  const logPath = backendLogPath()

  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true })
  } catch {
    /* ignore */
  }
  fs.writeFileSync(
    logPath,
    `[CodeTracker] 启动嵌入后端 ${new Date().toISOString()}\ncwd=${backendRoot}\nscript=${script}\nDB_PATH=${dbPath}\n--- stderr ---\n`,
    { encoding: 'utf8' },
  )

  const nmPath = path.join(backendRoot, '_node_modules')
  const nodePathExtra = fs.existsSync(nmPath)
    ? [nmPath, process.env.NODE_PATH].filter(Boolean).join(path.delimiter)
    : process.env.NODE_PATH

  backendChild = spawn(process.execPath, [script], {
    cwd: backendRoot,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: String(API_PORT),
      DB_PATH: dbPath,
      NODE_ENV: 'production',
      // 与 stage-backend 中重命名的 _node_modules 对应（electron-builder 会丢弃顶层 node_modules）
      ...(nodePathExtra ? { NODE_PATH: nodePathExtra } : {}),
    },
    // stdout 忽略避免管道塞满；stderr 写入日志便于安装版排错
    stdio: ['ignore', 'ignore', 'pipe'],
  })

  backendChild.stderr?.on('data', (chunk: Buffer) => {
    try {
      fs.appendFileSync(logPath, chunk)
    } catch {
      /* ignore */
    }
  })

  backendChild.once('error', (err) => {
    try {
      fs.appendFileSync(logPath, `\n[spawn error] ${String(err)}\n`)
    } catch {
      /* ignore */
    }
  })

  await new Promise<void>((resolve, reject) => {
    backendChild?.once('error', reject)
    backendChild?.once('spawn', () => resolve())
  })

  const ok = await waitForHealth(40_000, logPath)
  if (!ok) {
    stopEmbeddedBackend()
    throw new Error(
      `本地 API 在 40 秒内未就绪。请确认 3033 未被占用，并查看日志：\n${logPath}`,
    )
  }

  try {
    fs.appendFileSync(logPath, `\n[CodeTracker] 健康检查通过 ${new Date().toISOString()}\n`)
  } catch {
    /* ignore */
  }
}

export function stopEmbeddedBackend(): void {
  const c = backendChild
  backendChild = null
  if (!c || c.killed) return
  try {
    if (process.platform === 'win32') {
      c.kill()
    } else {
      c.kill('SIGTERM')
    }
  } catch {
    /* ignore */
  }
}

export function showBackendStartError(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err)
  const logHint = shouldEmbedBackend() ? `\n\n日志文件：\n${backendLogPath()}` : ''
  dialog.showErrorBox(
    'CodeTracker',
    `无法启动内置本地服务，应用将退出。\n\n${msg}${logHint}\n\n若从源码打包，请先执行 npm run dist（含 stage:backend）。`,
  )
}
