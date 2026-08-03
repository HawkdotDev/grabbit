import { ipcMain, BrowserWindow } from 'electron'
import { DownloadManager } from '../engine/DownloadManager'
import { DownloadCategory, DownloadPriority, EngineSettings } from '../engine/types'

export function setupIPC(downloadManager: DownloadManager): void {
  // Download handlers
  ipcMain.handle(
    'download:add',
    async (
      _,
      args: {
        url: string
        filename?: string
        savePath?: string
        category?: DownloadCategory
        priority?: DownloadPriority
        threadCount?: number
      }
    ) => {
      return await downloadManager.addDownload(args.url, {
        filename: args.filename,
        savePath: args.savePath,
        category: args.category,
        priority: args.priority,
        threadCount: args.threadCount
      })
    }
  )

  ipcMain.handle('download:pause', (_, id: string) => {
    downloadManager.pauseDownload(id)
    return true
  })

  ipcMain.handle('download:resume', (_, id: string) => {
    downloadManager.resumeDownload(id)
    return true
  })

  ipcMain.handle('download:cancel', (_, id: string) => {
    downloadManager.cancelDownload(id)
    return true
  })

  ipcMain.handle('download:getAll', () => {
    return downloadManager.getDownloads()
  })

  ipcMain.handle(
    'download:verifyHash',
    async (_, args: { id: string; expectedHash: string; algo?: 'sha256' | 'md5' | 'sha512' }) => {
      return await downloadManager.verifyDownloadHash(args.id, args.expectedHash, args.algo)
    }
  )

  // Settings handlers
  ipcMain.handle('settings:get', () => {
    return downloadManager.getSettings()
  })

  ipcMain.handle('settings:update', (_, newSettings: Partial<EngineSettings>) => {
    downloadManager.updateSettings(newSettings)
    return downloadManager.getSettings()
  })

  // Stats handler
  ipcMain.handle('stats:getHistory', () => {
    return downloadManager.getSpeedHistory()
  })

  // Event forwarders from engine to renderer
  downloadManager.on('progress', (download) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('download:onProgress', download)
    })
  })

  downloadManager.on('downloadAdded', (download) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('download:onAdded', download)
    })
  })

  downloadManager.on('downloadUpdated', (download) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('download:onUpdated', download)
    })
  })

  downloadManager.on('downloadCompleted', (download) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('download:onCompleted', download)
    })
  })

  downloadManager.on('downloadRemoved', (id) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('download:onRemoved', id)
    })
  })

  downloadManager.on('statsTick', (sample) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('stats:onTick', sample)
    })
  })
}
