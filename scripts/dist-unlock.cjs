/**
 * 打包前：结束 CodeTracker 并尽量删除 release/，避免 app.asar 被占用导致 electron-builder 失败。
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.join(__dirname, '..')
const releaseDir = path.join(root, 'release')

function tryKillWin(imageName) {
  if (process.platform !== 'win32') return
  try {
    execSync(`taskkill /F /T /IM ${imageName}`, { stdio: 'ignore' })
  } catch {
    /* 无此进程 */
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  if (process.platform === 'win32') {
    console.log('[dist:unlock] 结束 CodeTracker.exe 进程树（含内置后端子进程）…')
    tryKillWin('CodeTracker.exe')
    await sleep(1000)
  }

  if (!fs.existsSync(releaseDir)) {
    console.log('[dist:unlock] 无 release/ 目录，继续')
    return
  }

  for (let i = 0; i < 10; i++) {
    try {
      fs.rmSync(releaseDir, { recursive: true, force: true })
      console.log('[dist:unlock] 已清空 release/')
      return
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.warn(`[dist:unlock] 删除 release 失败 (${i + 1}/10): ${msg}`)
      if (i === 0) {
        console.warn('[dist:unlock] 常见占用：① 正在运行 release\\win-unpacked\\CodeTracker.exe')
        console.warn('[dist:unlock] ② 资源管理器打开了 release 且「预览窗格」占着 app.asar')
        console.warn('[dist:unlock] ③ 杀毒/索引正在扫描该目录')
        console.warn(
          '[dist:unlock] 排查：任务管理器→详细信息→结束 CodeTracker.exe；关掉 release 文件夹窗口；',
        )
        console.warn(
          '[dist:unlock] 或 任务管理器→性能→打开资源监视器→CPU 标签→「关联的句柄」搜索 app.asar',
        )
      }
      await sleep(2000)
    }
  }

  console.error('[dist:unlock] 仍无法删除 release/，请手动删掉整个 release 文件夹后再执行 npm run dist')
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
