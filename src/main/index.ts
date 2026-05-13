import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import {
  shouldEmbedBackend,
  startEmbeddedBackend,
  stopEmbeddedBackend,
  showBackendStartError,
} from './backend'

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 740,
    minWidth: 980,
    minHeight: 640,
    show: false,
    backgroundColor: '#0b1220',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
    },
  })

  win.once('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void win.loadFile(path.join(__dirname, '../../dist/index.html'))
  }
}

app.on('before-quit', () => {
  stopEmbeddedBackend()
})

app
  .whenReady()
  .then(async () => {
    if (shouldEmbedBackend()) {
      try {
        await startEmbeddedBackend()
      } catch (e) {
        showBackendStartError(e)
        app.quit()
        return
      }
    }
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  .catch((e) => {
    showBackendStartError(e)
    app.quit()
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
