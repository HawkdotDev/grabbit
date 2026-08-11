import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@electron-toolkit/utils', '@electron-toolkit/preload']
      })
    ]
  },
  preload: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@electron-toolkit/utils', '@electron-toolkit/preload']
      })
    ]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
