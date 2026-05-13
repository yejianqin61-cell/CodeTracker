import { contextBridge } from 'electron'

// 先把桥接留空：MVP 前端通过本地 Express API 通信即可。
// 后续若要做更“原生”的能力（文件选择、通知、系统托盘等），再在这里补 API。
contextBridge.exposeInMainWorld('codetracker', {})
