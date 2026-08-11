import { ipcMain, BrowserWindow, Notification, shell, app, clipboard, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as crypto from 'crypto'
import { DownloadManager } from '../engine/DownloadManager'
import { TorrentWorker } from '../engine/workers/TorrentWorker'
import { PluginManager } from '../engine/PluginManager'
import { PostProcessor, AutomationRule } from '../engine/PostProcessor'
import { Storage } from '../engine/Storage'
import { DownloadCategory, DownloadItem, DownloadPriority, EngineSettings } from '../engine/types'

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

  ipcMain.handle('torrent:reannounce', (_, id: string) => {
    return TorrentWorker.reannounceTorrent(id)
  })

  ipcMain.handle(
    'torrent:updateOptions',
    (_, args: { id: string; options: Partial<DownloadItem> }) => {
      return downloadManager.setTorrentOptions(args.id, args.options)
    }
  )

  ipcMain.handle('torrent:exportFile', async (event, downloadId: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    const buffer = TorrentWorker.getTorrentFileBuffer(downloadId)
    if (!buffer) return false

    const downloads = downloadManager.getDownloads()
    const targetDownload = downloads.find((d) => d.id === downloadId)
    const defaultFilename = targetDownload?.name
      ? `${targetDownload.name.replace(/\.torrent$/i, '')}.torrent`
      : `${downloadId}.torrent`

    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Export .torrent File',
      defaultPath: defaultFilename,
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
        tags?: string[]
        startPaused?: boolean
        addToTopQueue?: boolean
        sequentialDownload?: boolean
        firstLastPiecesFirst?: boolean
        skipHashCheck?: boolean
        stopCondition?: 'none' | 'metadata' | 'files'
        contentLayout?: 'original' | 'subfolder' | 'nosubfolder'
        managementMode?: 'manual' | 'automatic'
      }
    ) => {
      return await downloadManager.addDownload(args.url, args)
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

  ipcMain.handle('download:pauseAll', () => {
    downloadManager.pauseAll()
    return true
  })

  ipcMain.handle('download:resumeAll', () => {
    downloadManager.resumeAll()
    return true
  })

  ipcMain.handle('download:clearCompleted', () => {
    downloadManager.clearCompleted()
    return true
  })

  ipcMain.handle('queue:getStats', () => {
    return downloadManager.getQueueStats()
  })

  ipcMain.handle('queue:promote', (_, id: string) => {
    return downloadManager.promoteQueueItem(id)
  })

  ipcMain.handle('queue:demote', (_, id: string) => {
    return downloadManager.demoteQueueItem(id)
  })

  ipcMain.handle('download:getAll', () => {
    return downloadManager.getDownloads()
  })

  ipcMain.handle('download:rename', (_, args: { id: string; newName: string }) => {
    return downloadManager.renameDownload(args.id, args.newName)
  })

  ipcMain.handle('download:setLocation', (_, args: { id: string; newPath: string }) => {
    return downloadManager.setDownloadLocation(args.id, args.newPath)
  })

  ipcMain.handle('download:setTags', (_, args: { id: string; tags: string[] }) => {
    return downloadManager.setDownloadTags(args.id, args.tags)
  })

  ipcMain.handle('download:toggleTag', (_, args: { id: string; tag: string }) => {
    return downloadManager.toggleDownloadTag(args.id, args.tag)
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
        if (!options.sourcePath || !fs.existsSync(options.sourcePath)) {
          throw new Error(`Source path does not exist: ${options?.sourcePath}`)
        }
        const outName = path.basename(options.sourcePath) || 'payload'
        const outputPath = path.join(app.getPath('downloads'), `${outName}.torrent`)

        const torrentBuffer = await TorrentWorker.createTorrentFile(options.sourcePath, {
          pieceSizeKb: options.pieceSizeKb,
          trackers: options.trackers,
          comment: options.comment,
          isPrivate: options.isPrivate
        })

        fs.writeFileSync(outputPath, torrentBuffer)

        if (options.startSeeding) {
          await downloadManager.addDownload(outputPath, {
            savePath: path.dirname(options.sourcePath)
          })
        }
        return { success: true, torrentPath: outputPath }
      } catch (err: unknown) {
        console.error('[torrent:create Error]', err)
        return { success: false, error: (err as Error).message || String(err) }
      }
    }
  )

  // App Version IPC Handler
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion() || '0.1.1'
  })

  // Auto-Updater IPC Handler
  ipcMain.handle('updater:check', async () => {
    const currentVersion = app.getVersion() || '0.1.1'

    try {
      const response = await new Promise<{
        tag_name?: string
        body?: string
        html_url?: string
      }>((resolve, reject) => {
        const req = https.get(
          'https://api.github.com/repos/HawkdotDev/grabbit/releases/latest',
          {
            headers: {
              'User-Agent': `Grabbit/${currentVersion} (Electron Desktop Client)`
            }
          },
          (res) => {
            if (res.statusCode && res.statusCode >= 400) {
              return reject(new Error(`HTTP ${res.statusCode}`))
            }
            let data = ''
            res.on('data', (chunk) => (data += chunk))
            res.on('end', () => {
              try {
                resolve(JSON.parse(data))
              } catch (e) {
                reject(e)
              }
            })
          }
        )
        req.on('error', reject)
        req.setTimeout(5000, () => {
          req.destroy()
          reject(new Error('Update check timeout'))
        })
      })

      const latestTag = (response.tag_name || '').replace(/^v/, '')
      const isNewer =
        latestTag &&
        latestTag.localeCompare(currentVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0

      if (isNewer) {
        return {
          hasUpdate: true,
          currentVersion,
          latestVersion: latestTag,
          releaseNotes: response.body || `New release v${latestTag} is available!`,
          downloadUrl: response.html_url || 'https://github.com/HawkdotDev/grabbit/releases/latest'
        }
      }
    } catch {
      // Offline or development mode fallback
    }

    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      releaseNotes: `Grabbit v${currentVersion} is up to date.`
    }
  })

  // Plugins IPC Handlers
  ipcMain.handle('plugins:getAll', () => {
    return PluginManager.getPlugins()
  })

  ipcMain.handle('plugins:toggleInstall', (_, id: string) => {
    return PluginManager.toggleInstall(id)
  })

  ipcMain.handle('plugins:toggleEnabled', (_, args: { id: string; enabled?: boolean }) => {
    return PluginManager.toggleEnabled(args.id, args.enabled)
  })

  // Automations IPC Handlers
  ipcMain.handle('automations:getRules', () => {
    return PostProcessor.getRules()
  })

  ipcMain.handle('automations:addRule', (_, rule: Omit<AutomationRule, 'id'>) => {
    return PostProcessor.addRule(rule)
  })

  ipcMain.handle('automations:deleteRule', (_, id: string) => {
    return PostProcessor.deleteRule(id)
  })

  ipcMain.handle('automations:toggleRule', (_, args: { id: string; enabled?: boolean }) => {
    return PostProcessor.toggleRule(args.id, args.enabled)
  })

  // Script Console Execution IPC Handler
  ipcMain.handle('script:execute', async (_, code: string) => {
    const logs: Array<{ type: 'log' | 'warn' | 'error'; message: string }> = []
    const startTime = Date.now()

    const customConsole = {
      log: (...args: unknown[]) => {
        logs.push({
          type: 'log',
          message: args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
            .join(' ')
        })
      },
      warn: (...args: unknown[]) => {
        logs.push({
          type: 'warn',
          message: args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
            .join(' ')
        })
      },
      error: (...args: unknown[]) => {
        logs.push({
          type: 'error',
          message: args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
            .join(' ')
        })
      }
    }

    try {
      const sandbox = {
        console: customConsole,
        downloadManager,
        Storage,
        PluginManager,
        PostProcessor,
        TorrentWorker,
        fs,
        path,
        https,
        crypto,
        Buffer,
        setTimeout,
        clearTimeout
      }

      const scriptFunction = new Function(
        'sandbox',
        `with(sandbox) {
          return (async () => {
            ${code}
          })()
        }`
      )

      const result = await scriptFunction(sandbox)
      const executionTimeMs = Date.now() - startTime

      let resultFormatted: string | undefined
      if (result !== undefined) {
        resultFormatted =
          typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
      }

      return {
        success: true,
        logs,
        result: resultFormatted,
        executionTimeMs
      }
    } catch (err: unknown) {
      const executionTimeMs = Date.now() - startTime
      return {
        success: false,
        logs,
        error: (err as Error).message || String(err),
        executionTimeMs
      }
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

  downloadManager.on('downloadError', (data) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('download:onError', data)
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
