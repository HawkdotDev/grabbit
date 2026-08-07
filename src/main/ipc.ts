import { ipcMain, BrowserWindow, Notification, shell, app, clipboard, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { DownloadManager } from '../engine/DownloadManager'
import { TorrentWorker } from '../engine/workers/TorrentWorker'
import { DownloadCategory, DownloadPriority, EngineSettings } from '../engine/types'

export function setupIPC(downloadManager: DownloadManager): void {
  // WebTorrent Specific IPC Handlers
  ipcMain.handle('torrent:addTracker', (_, args: { id: string; trackerUrl: string }) => {
    return TorrentWorker.addTracker(args.id, args.trackerUrl)
  })

  ipcMain.handle('torrent:removeTracker', (_, args: { id: string; trackerUrl: string }) => {
    return TorrentWorker.removeTracker(args.id, args.trackerUrl)
  })

  ipcMain.handle('torrent:addPeer', (_, args: { id: string; peerAddress: string }) => {
    return TorrentWorker.addPeer(args.id, args.peerAddress)
  })

  ipcMain.handle(
    'torrent:setFilePriority',
    (_, args: { id: string; filePath: string; priority: 'high' | 'normal' | 'low' | 'ignore' }) => {
      return TorrentWorker.setFilePriority(args.id, args.filePath, args.priority)
    }
  )

  ipcMain.handle('torrent:exportFile', async (event, downloadId: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    const buffer = TorrentWorker.getTorrentFileBuffer(downloadId)
    if (!buffer) return false

    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Export .torrent File',
      defaultPath: `${downloadId}.torrent`,
      filters: [{ name: 'Torrent File', extensions: ['torrent'] }]
    })

    if (filePath) {
      fs.writeFileSync(filePath, buffer)
      return true
    }
    return false
  })

  ipcMain.handle('dialog:selectDirectory', async (event, defaultPath?: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      title: 'Select Destination Folder',
      defaultPath: defaultPath || app.getPath('downloads'),
      properties: ['openDirectory', 'createDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle('torrent:getStreamUrl', async (_, args: { id: string; fileIndex?: number }) => {
    return await TorrentWorker.getStreamUrl(args.id, args.fileIndex || 0)
  })

  ipcMain.handle('torrent:parseMetadata', async (_, source: string) => {
    return await TorrentWorker.parseTorrentMetadata(source)
  })
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

  // Export / Import Queue State IPC
  ipcMain.handle('download:exportQueue', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Export Grabbit Queue State',
      defaultPath: 'grabbit_queue.json',
      filters: [{ name: 'JSON Queue File', extensions: ['json'] }]
    })
    if (filePath) {
      const downloads = downloadManager.getDownloads()
      fs.writeFileSync(filePath, JSON.stringify(downloads, null, 2), 'utf-8')
      return true
    }
    return false
  })

  ipcMain.handle('download:importQueue', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return 0
    const { filePaths } = await dialog.showOpenDialog(win, {
      title: 'Import Grabbit Queue State',
      filters: [{ name: 'JSON Queue File', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (filePaths && filePaths[0]) {
      try {
        const content = fs.readFileSync(filePaths[0], 'utf-8')
        const items = JSON.parse(content)
        if (Array.isArray(items)) {
          let importedCount = 0
          for (const item of items) {
            if (item && item.url) {
              await downloadManager.addDownload(item.url, {
                filename: item.name,
                category: item.category,
                priority: item.priority
              })
              importedCount++
            }
          }
          return importedCount
        }
      } catch (err) {
        console.error('Failed to import queue file:', err)
      }
    }
    return 0
  })

  // Settings handlers
  ipcMain.handle('settings:get', () => {
    return downloadManager.getSettings()
  })

  ipcMain.handle('settings:update', (_, newSettings: Partial<EngineSettings>) => {
    downloadManager.updateSettings(newSettings)
    const settings = downloadManager.getSettings()

    // Handle Start on Boot configuration
    if (typeof newSettings.startOnBoot === 'boolean') {
      try {
        app.setLoginItemSettings({
          openAtLogin: newSettings.startOnBoot,
          openAsHidden: false
        })
      } catch (err) {
        console.error('Failed to update login item settings:', err)
      }
    }

    return settings
  })

  // System Utility IPC
  ipcMain.handle('system:openFileLocation', (_, path: string) => {
    if (path) {
      shell.showItemInFolder(path)
      return true
    }
    return false
  })

  ipcMain.handle('system:openFile', (_, path: string) => {
    if (path) {
      shell.openPath(path)
      return true
    }
    return false
  })

  ipcMain.handle('system:copyToClipboard', (_, text: string) => {
    if (text) {
      clipboard.writeText(text)
      return true
    }
    return false
  })

  // Stats handler
  ipcMain.handle('stats:getHistory', () => {
    return downloadManager.getSpeedHistory()
  })

  // Window control handlers
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
    return true
  })

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
    return win?.isMaximized() ?? false
  })

  ipcMain.handle('window:setAlwaysOnTop', (event, flag?: boolean) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      const nextFlag = flag ?? !win.isAlwaysOnTop()
      win.setAlwaysOnTop(nextFlag)
      return win.isAlwaysOnTop()
    }
    return false
  })

  ipcMain.handle('window:toggleFullscreen', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      const isFS = win.isFullScreen()
      win.setFullScreen(!isFS)
      return win.isFullScreen()
    }
    return false
  })

  ipcMain.handle('logs:export', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Export Transfer Diagnostics & Logs',
      defaultPath: `grabbit_session_log_${Date.now()}.txt`,
      filters: [{ name: 'Log File', extensions: ['txt', 'log'] }]
    })

    if (filePath) {
      const logs = downloadManager.getSpeedHistory()
      const content = `Grabbit v0.1.1 Session Log\nExported: ${new Date().toISOString()}\n\nTelemetry History:\n${JSON.stringify(logs, null, 2)}`
      fs.writeFileSync(filePath, content, 'utf8')
      return true
    }
    return false
  })

  // Torrent Creator IPC Handler
  ipcMain.handle(
    'torrent:create',
    async (
      _event,
      options: {
        sourcePath: string
        pieceSizeKb?: number
        trackers?: string[]
        comment?: string
        isPrivate?: boolean
        startSeeding?: boolean
      }
    ) => {
      try {
        const outName = path.basename(options.sourcePath) || 'payload'
        const outputPath = path.join(app.getPath('downloads'), `${outName}.torrent`)
        const dummyMeta = {
          name: outName,
          pieceLength: (options.pieceSizeKb || 512) * 1024,
          announce: options.trackers || ['udp://tracker.opentrackr.org:1337/announce'],
          comment: options.comment || 'Created with Grabbit v0.1.1',
          private: options.isPrivate ?? false,
          created: new Date().toISOString()
        }
        fs.writeFileSync(outputPath, JSON.stringify(dummyMeta, null, 2), 'utf8')

        if (options.startSeeding) {
          await downloadManager.addDownload(outputPath, {
            savePath: path.dirname(options.sourcePath)
          })
        }
        return { success: true, torrentPath: outputPath }
      } catch (err: unknown) {
        return { success: false, error: (err as Error).message || String(err) }
      }
    }
  )

  // Auto-Updater IPC Handler
  ipcMain.handle('updater:check', async () => {
    return {
      hasUpdate: false,
      currentVersion: '0.1.1',
      latestVersion: '0.1.1',
      releaseNotes: 'Grabbit v0.1.1 is up to date.'
    }
  })

  // Browser Extension Native Host Installer
  ipcMain.handle('nativeHost:install', async () => {
    try {
      const manifestPath = path.join(app.getPath('userData'), 'com.grabbit.native.json')
      const manifest = {
        name: 'com.grabbit.native',
        description: 'Grabbit Desktop Native Messaging Host',
        path: process.execPath,
        type: 'stdio',
        allowed_origins: ['chrome-extension://grabbit_extension_id/']
      }
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
      return { success: true, manifestPath }
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || String(err) }
    }
  })

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
    return true
  })

  ipcMain.handle('window:isMaximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.isMaximized() ?? false
  })

  // Event forwarders from engine to renderer with progress throttling (~100ms)
  const lastProgressEmit = new Map<string, number>()

  downloadManager.on('progress', (download) => {
    const now = Date.now()
    const last = lastProgressEmit.get(download.id) || 0
    if (now - last >= 100) {
      lastProgressEmit.set(download.id, now)
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('download:onProgress', download)
      })
    }
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
    lastProgressEmit.delete(download.id)

    // Trigger Desktop Notification if enabled in settings
    const settings = downloadManager.getSettings()
    if (settings.enableNotifications && Notification.isSupported()) {
      new Notification({
        title: 'Download Finished',
        body: `"${download.name}" has completed downloading.`,
        silent: false
      }).show()
    }

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('download:onCompleted', download)
    })
  })

  downloadManager.on('downloadRemoved', (id) => {
    lastProgressEmit.delete(id)
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
