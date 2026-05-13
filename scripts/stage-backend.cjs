/**
 * 为桌面打包准备嵌入后端：
 * 1) 复制 backend 源码（不含 node_modules）
 * 2) npm ci --omit=dev（按当前 Node 拉取依赖）
 * 3) 在 better-sqlite3 目录执行 prebuild-install，下载与根项目 Electron 版本一致的预编译 .node
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.join(__dirname, '..')
const backendSrc = path.join(root, 'backend')
const stageDir = path.join(root, 'pack-resources', 'backend')

function copyBackendNoModules() {
  if (fs.existsSync(stageDir)) {
    fs.rmSync(stageDir, { recursive: true, force: true })
  }
  fs.mkdirSync(path.dirname(stageDir), { recursive: true })

  fs.cpSync(backendSrc, stageDir, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(backendSrc, src)
      if (!rel || rel === '.') return true
      const parts = rel.split(path.sep)
      if (parts.includes('node_modules')) return false
      return true
    },
  })
}

function readElectronVersion() {
  const ep = path.join(root, 'node_modules', 'electron', 'package.json')
  const j = JSON.parse(fs.readFileSync(ep, 'utf8'))
  if (!j.version) throw new Error('无法读取 electron 版本')
  return j.version
}

function main() {
  if (!fs.existsSync(path.join(backendSrc, 'package.json'))) {
    throw new Error(`未找到后端目录: ${backendSrc}`)
  }
  const ev = readElectronVersion()
  const platform =
    process.platform === 'win32' ? 'win32' : process.platform === 'darwin' ? 'darwin' : 'linux'
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64'

  console.log('[stage-backend] 复制源码 →', stageDir)
  copyBackendNoModules()

  console.log('[stage-backend] npm ci --omit=dev')
  execSync('npm ci --omit=dev', {
    cwd: stageDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  })

  const bsqlite = path.join(stageDir, 'node_modules', 'better-sqlite3')
  if (!fs.existsSync(bsqlite)) {
    throw new Error('未找到 better-sqlite3 模块目录')
  }

  console.log('[stage-backend] prebuild-install Electron', ev, `(${platform} ${arch})`)
  execSync(
    `npx --yes prebuild-install --runtime electron --target "${ev}" --arch ${arch} --platform ${platform} --force`,
    {
      cwd: bsqlite,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        npm_config_build_from_source: 'false',
        npm_config_disturl: 'https://electronjs.org/headers',
      },
    },
  )

  const nodeFile = path.join(bsqlite, 'build', 'Release', 'better_sqlite3.node')
  if (!fs.existsSync(nodeFile)) {
    throw new Error(
      `未找到 better_sqlite3.node: ${nodeFile}\n` +
        `请确认 better-sqlite3 已为 Electron ${ev} 提供当前平台的预编译包；否则需调整根目录 electron 版本后重试。`,
    )
  }

  // electron-builder 复制 extraResources 时会硬性跳过「源目录根下名为 node_modules 的文件夹」，
  // 导致安装后缺 express。重命名为 _node_modules，运行时由主进程设置 NODE_PATH 解析依赖。
  const nm = path.join(stageDir, 'node_modules')
  const nmHidden = path.join(stageDir, '_node_modules')
  if (fs.existsSync(nmHidden)) {
    fs.rmSync(nmHidden, { recursive: true, force: true })
  }
  fs.renameSync(nm, nmHidden)
  console.log('[stage-backend] 已将 node_modules → _node_modules（供 electron-builder 打包）')

  console.log('[stage-backend] 完成')
}

main()
