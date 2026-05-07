import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron/main',
    },
  },
  preload: {
    build: {
      outDir: 'dist-electron/preload',
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer/src'),
      },
    },
    plugins: [vue()],
    build: {
      outDir: 'dist',
    },
  },
})

