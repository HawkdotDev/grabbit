import { EventEmitter } from 'events'
import * as fs from 'fs'
import * as path from 'path'
import { ChunkEngine } from './ChunkEngine'
import { DiskAllocator } from './DiskAllocator'
import { RateLimiter } from './RateLimiter'
import { StatsCollector } from './StatsCollector'
import { Storage } from './Storage'
import { CategoryManager } from './CategoryManager'
import { HashVerifier } from './HashVerifier'
import { TorrentWorker } from './workers/TorrentWorker'
import { PostProcessor } from './PostProcessor'
import { PluginManager } from './PluginManager'
import { AdaptiveQoS } from './AdaptiveQoS'
import {
  DownloadCategory,
  DownloadItem,
  DownloadPriority,
  EngineSettings,
  SpeedSample
} from './types'
import { DownloadQueueManager, QueueStatistics } from './DownloadQueueManager'

export class DownloadManager extends EventEmitter {
  private downloads: Map<string, DownloadItem> = new Map()
  private chunkEngine: ChunkEngine
  private rateLimiter: RateLimiter
  private statsCollector: StatsCollector
  private queueManager: DownloadQueueManager
  private settings: EngineSettings
  private adaptiveQoS: AdaptiveQoS

  constructor() {
    super()
    Storage.init()
    this.settings = Storage.loadSettings()
    this.rateLimiter = new RateLimiter(this.settings.maxGlobalSpeedLimitKbps)
    this.chunkEngine = new ChunkEngine()
    this.statsCollector = new StatsCollector()
    this.queueManager = new DownloadQueueManager(this.settings.maxConcurrentDownloads)
    this.adaptiveQoS = new AdaptiveQoS(this.rateLimiter)

    this.statsCollector.on('tick', (sample: SpeedSample) => {
      this.emit('statsTick', sample)
    })

    this.loadState()
    this.statsCollector.start(() => this.getDownloads())

    if (this.settings.enableAdaptiveQoS) {
      this.adaptiveQoS.startMonitoring(10000)
    }
  }

  private loadState(): void {
    const saved = Storage.loadDownloads()
    const autoResumeIds: string[] = []
    saved.forEach((d: DownloadItem) => {
      if (d.status === 'downloading') {
        autoResumeIds.push(d.id)
        d.status = 'paused'
      }
      d.speed = 0
      this.downloads.set(d.id, d)
    })

    if (autoResumeIds.length > 0) {
      setTimeout(() => {
        autoResumeIds.forEach((id) => {
          this.startDownload(id)
        })
      }, 500)
    }
  }

  private saveStateImmediate(): void {
    Storage.saveDownloads(Array.from(this.downloads.values()))
  }

  private saveStateDebounced(): void {
    Storage.saveDownloadsDebounced(Array.from(this.downloads.values()), 1000)
  }

  public getSettings(): EngineSettings {
    return { ...this.settings }
  }

  public getAdaptiveQoS(): AdaptiveQoS {
    return this.adaptiveQoS
  }

  public updateSettings(newSettings: Partial<EngineSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    if (newSettings.maxGlobalSpeedLimitKbps !== undefined) {
      this.rateLimiter.setLimitKbps(this.settings.maxGlobalSpeedLimitKbps)
    }
    if (newSettings.maxConcurrentDownloads !== undefined) {
      this.queueManager.setMaxConcurrentDownloads(this.settings.maxConcurrentDownloads)
    }
    if (newSettings.enableAdaptiveQoS !== undefined) {
      if (newSettings.enableAdaptiveQoS) {
        this.adaptiveQoS.startMonitoring(10000)
      } else {
        this.adaptiveQoS.stopMonitoring()
      }
    }
    Storage.saveSettings(this.settings)
    this.processQueue()
  }

  public getQueueStats(): QueueStatistics {
    return this.queueManager.getQueueStats(this.downloads)
  }

  public promoteQueueItem(id: string): boolean {
    const ok = this.queueManager.promoteQueueItem(this.downloads, id)
    if (ok) {
      this.saveStateImmediate()
      const d = this.downloads.get(id)
      if (d) this.emit('downloadUpdated', d)
      this.processQueue()
    }
    return ok
  }

  public demoteQueueItem(id: string): boolean {
    const ok = this.queueManager.demoteQueueItem(this.downloads, id)
    if (ok) {
      this.saveStateImmediate()
      const d = this.downloads.get(id)
      if (d) this.emit('downloadUpdated', d)
      this.processQueue()
    }
    return ok
  }

  public getDownloads(): DownloadItem[] {
    return Array.from(this.downloads.values()).sort((a, b) => b.createdAt - a.createdAt)
  }

  public getSpeedHistory(): SpeedSample[] {
    return this.statsCollector.getHistory()
  }

  public static isTorrentSource(url: string): boolean {
    if (!url) return false
    const clean = url.trim().toLowerCase()
    return (
      clean.startsWith('magnet:') ||
      clean.includes('magnet:') ||
      /\.torrent(\?.*)?$/.test(clean) ||
      /\.meta(\?.*)?$/.test(clean) ||
      /\.metalink(\?.*)?$/.test(clean)
    )
  }

  public async addDownload(
    urlOrOptions:
      | string
      | {
        url: string
        savePath?: string
        filename?: string
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
      },
    maybeOptions?: {
      savePath?: string
      filename?: string
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
  ): Promise<DownloadItem> {
    const url = typeof urlOrOptions === 'string' ? urlOrOptions : urlOrOptions.url
    const options = typeof urlOrOptions === 'string' ? maybeOptions : urlOrOptions

    const isTorrent = DownloadManager.isTorrentSource(url)
    let totalSize = 0
    let acceptRanges = true
    let etag = ''
    let filename = options?.filename || ''
    let infoHash = ''
    let trackersList: { url: string; status: 'working' | 'error' | 'disabled'; peers: number }[] =
      []
    let fileEntries: Array<{ path: string; size: number; downloaded: number; priority: 'high' | 'normal' | 'low' | 'ignore' }> = []

    if (isTorrent) {
      acceptRanges = true
      const magInfo = url.startsWith('magnet:') || url.includes('magnet:') ? TorrentWorker.parseMagnetURI(url) : null
      infoHash = magInfo?.infoHash || ''

      // Use the fast synchronous magnet parser for initial state.
      // Skip the expensive parseTorrentMetadata() call here — startTorrentDownload()
      // will resolve full metadata (name, files, size) from the live swarm.
      // This avoids a 10-24 second blocking delay and prevents duplicate torrent
      // collisions when client.add() is called both here and in startTorrentDownload().
      if (!filename) {
        filename = magInfo?.name || (infoHash ? `Magnet (${infoHash.substring(0, 8)})` : 'Magnet Download')
      }

      const combinedTrackers = Array.from(
        new Set([...(magInfo?.trackers || []), ...TorrentWorker.DEFAULT_PUBLIC_TRACKERS])
      )
      trackersList = combinedTrackers.map((trUrl) => ({
        url: trUrl,
        status: 'working' as const,
        peers: 0
      }))

      if (fileEntries.length === 0) {
        fileEntries = [{ path: filename, size: totalSize, downloaded: 0, priority: 'normal' }]
      }
    } else {
      if (!filename) {
        try {
          const parsed = new URL(url)
          filename = path.basename(parsed.pathname) || 'download_' + Date.now()
        } catch {
          filename = 'download_' + Date.now()
        }
      }
      infoHash = ''
      trackersList = []
      fileEntries = [{ path: filename, size: totalSize, downloaded: 0, priority: 'normal' }]
    }

    const category =
      options?.category ||
      (this.settings.autoCategorize ? CategoryManager.detectCategory(filename) : 'other')

    let fullSavePath: string
    if (options?.savePath) {
      if (path.extname(options.savePath)) {
        fullSavePath = options.savePath
      } else {
        fullSavePath = path.join(options.savePath, filename)
      }
    } else {
      fullSavePath = path.join(this.settings.defaultSavePath, filename)
    }
    DiskAllocator.ensureDirectory(path.dirname(fullSavePath))

    const threadCount =
      options?.threadCount || (acceptRanges ? this.settings.defaultThreadCount : 1)
    const chunks = isTorrent
      ? TorrentWorker.createTorrentChunks(32)
      : this.chunkEngine.createChunks(totalSize, threadCount)

    const userTags =
      options?.tags && options.tags.length > 0
        ? Array.from(new Set(options.tags.map((t) => t.trim()).filter(Boolean)))
        : ['grabbit', category]

    const initialStatus = options?.startPaused ? 'paused' : 'queued'

    const download: DownloadItem = {
      id: 'dl_' + Math.random().toString(36).substring(2, 9),
      url,
      name: filename,
      savePath: fullSavePath,
      totalSize,
      downloadedSize: 0,
      speed: 0,
      eta: 0,
      status: initialStatus,
      category,
      priority: options?.priority || 'normal',
      threadCount,
      chunks,
      createdAt: Date.now(),
      etag,
      upSpeed: 0,
      uploadedSize: 0,
      ratio: 0.0,
      seedsCount: 0,
      peersCount: 0,
      infoHash,
      tags: userTags,
      trackers: trackersList,
      files: fileEntries
    }

    this.downloads.set(download.id, download)
    if (options?.addToTopQueue) {
      this.queueManager.promoteQueueItem(this.downloads, download.id)
    }

    this.saveStateImmediate()
    this.emit('downloadAdded', download)
    PostProcessor.handleDownloadEvent('onAdded', download).catch(() => { })

    if (!options?.startPaused) {
      this.processQueue()
    }
    return download
  }

  public async startDownload(id: string): Promise<void> {
    const download = this.downloads.get(id)
    if (!download) return

    download.status = 'downloading'
    this.saveStateImmediate()
    this.emit('downloadUpdated', download)

    const isTorrent = DownloadManager.isTorrentSource(download.url)

    if (isTorrent) {
      const saveDir = path.dirname(download.savePath)
      DiskAllocator.ensureDirectory(saveDir)
      TorrentWorker.startTorrentDownload(
        download.id,
        download.url,
        saveDir,
        (event) => {
          const d = this.downloads.get(event.downloadId)
          if (!d) return

          if (event.name && (!d.name || d.name.startsWith('Magnet ('))) {
            d.name = event.name
            d.savePath = path.join(path.dirname(d.savePath), event.name)
          }
          if (event.infoHash && !d.infoHash) {
            d.infoHash = event.infoHash
          }
          d.downloadedSize = event.downloadedSize
          if (event.totalSize > 0) d.totalSize = event.totalSize
          d.speed = event.downloadSpeed
          d.upSpeed = event.uploadSpeed
          d.uploadedSize = event.uploadedSize
          d.ratio = event.ratio
          d.eta = event.eta
          d.peersCount = event.peersCount
          d.seedsCount = event.seedsCount
          d.chunks = event.chunks
          if (event.trackers && event.trackers.length > 0) d.trackers = event.trackers
          if (event.files && event.files.length > 0) d.files = event.files
          if (event.peersInfo) d.peersInfo = event.peersInfo

          this.saveStateDebounced()
          this.emit('progress', d)
        },
        (event) => {
          const d = this.downloads.get(event.downloadId)
          if (!d) return
          d.status = 'seeding'
          d.speed = 0
          d.upSpeed = event.uploadSpeed
          d.eta = 0
          d.completedAt = Date.now()
          d.downloadedSize = d.totalSize
          this.saveStateImmediate()
          this.emit('downloadCompleted', d)
          PostProcessor.handleDownloadEvent('onCompleted', d).catch(() => { })
          PluginManager.executeHook('onDownloadCompleted', d).catch(() => { })
          this.processQueue()
        }
      ).catch((err) => {
        const d = this.downloads.get(id)
        if (!d) return
        d.status = 'error'
        d.error = err.message
        d.speed = 0
        this.saveStateImmediate()
        this.emit('downloadUpdated', d)
        this.emit('downloadError', { id: d.id, error: d.error })
        PostProcessor.handleDownloadEvent('onError', d).catch(() => { })
        PluginManager.executeHook('onDownloadError', d).catch(() => { })
        this.processQueue()
      })
      return
    }

    if (download.totalSize === 0) {
      try {
        const info = await this.chunkEngine.getFileInfo(download.url)
        download.totalSize = info.totalSize
        if (info.filename && download.name.startsWith('download_')) {
          download.name = info.filename
          download.savePath = path.join(path.dirname(download.savePath), info.filename)
        }
        download.chunks = this.chunkEngine.createChunks(download.totalSize, download.threadCount)
        this.saveStateImmediate()
        this.emit('downloadUpdated', download)
      } catch {
        // Proceed even if HEAD request timed out
      }
    }

    this.chunkEngine.startChunkDownload(
      download,
      this.rateLimiter,
      (event) => {
        const d = this.downloads.get(event.downloadId)
        if (!d) return

        d.downloadedSize = d.chunks.reduce((acc, c) => acc + c.downloadedBytes, 0)
        d.speed = d.chunks.reduce((acc, c) => acc + c.speed, 0)

        const remainingBytes = Math.max(0, d.totalSize - d.downloadedSize)
        d.eta = d.speed > 0 ? Math.ceil(remainingBytes / d.speed) : 0

        this.saveStateDebounced()
        this.emit('progress', d)
      },
      () => {
        const d = this.downloads.get(id)
        if (!d) return

        const allDone = d.chunks.every((c) => c.status === 'completed')
        if (allDone) {
          d.status = 'completed'
          d.speed = 0
          d.eta = 0
          d.completedAt = Date.now()
          if (d.totalSize > 0) {
            d.downloadedSize = d.totalSize
          } else {
            d.totalSize = d.downloadedSize
          }
          DiskAllocator.closeFile(d.savePath)
          this.saveStateImmediate()
          this.emit('downloadCompleted', d)
          PostProcessor.handleDownloadEvent('onCompleted', d).catch(() => { })
          PluginManager.executeHook('onDownloadCompleted', d).catch(() => { })
          this.processQueue()
        }
      },
      (err) => {
        const d = this.downloads.get(id)
        if (!d) return
        d.status = 'error'
        d.error = err.message
        d.speed = 0
        DiskAllocator.closeFile(d.savePath)
        this.saveStateImmediate()
        this.emit('downloadUpdated', d)
        this.emit('downloadError', { id: d.id, error: d.error })
        PostProcessor.handleDownloadEvent('onError', d).catch(() => { })
        PluginManager.executeHook('onDownloadError', d).catch(() => { })
        this.processQueue()
      },
      {
        stripReferrer: this.settings.stripReferrer,
        customUserAgent: this.settings.customUserAgent,
        enableDoH: this.settings.enableDoH,
        dohProvider: this.settings.dohProvider
      }
    )
  }

  public pauseDownload(id: string): void {
    const d = this.downloads.get(id)
    if (!d || d.status !== 'downloading') return

    const isTorrent = DownloadManager.isTorrentSource(d.url)

    if (isTorrent) {
      TorrentWorker.pauseTorrent(id)
    } else {
      this.chunkEngine.cancelDownload(id)
      DiskAllocator.closeFile(d.savePath)
    }

    d.status = 'paused'
    d.speed = 0
    d.chunks.forEach((c) => {
      if (c.status === 'downloading') c.status = 'paused'
    })
    this.saveStateImmediate()
    this.emit('downloadUpdated', d)
    this.processQueue()
  }

  public resumeDownload(id: string): void {
    const d = this.downloads.get(id)
    if (!d || (d.status !== 'paused' && d.status !== 'error')) return

    const isTorrent = DownloadManager.isTorrentSource(d.url)

    if (isTorrent) {
      TorrentWorker.resumeTorrent(id)
    }

    d.status = 'queued'
    d.error = undefined
    d.chunks.forEach((c) => {
      if (c.status !== 'completed') c.status = 'queued'
    })
    this.saveStateImmediate()
    this.emit('downloadUpdated', d)
    this.processQueue()
  }

  public cancelDownload(id: string, deleteFiles: boolean = false): void {
    const d = this.downloads.get(id)
    if (!d) return

    const isTorrent = DownloadManager.isTorrentSource(d.url)

    if (isTorrent) {
      TorrentWorker.removeTorrent(id, deleteFiles)
    } else {
      this.chunkEngine.cancelDownload(id)
      DiskAllocator.closeFile(d.savePath)
    }

    if (deleteFiles && d.savePath) {
      try {
        if (fs.existsSync(d.savePath)) {
          fs.rmSync(d.savePath, { recursive: true, force: true })
        }
      } catch (err) {
        console.error(`[DownloadManager] Failed to delete file at ${d.savePath}:`, err)
      }
    }

    this.downloads.delete(id)
    this.saveStateImmediate()
    this.emit('downloadRemoved', id)
    this.processQueue()
  }

  public pauseAll(): void {
    this.downloads.forEach((d) => {
      if (d.status === 'downloading' || d.status === 'queued') {
        this.pauseDownload(d.id)
      }
    })
  }

  public getDownload(id: string): DownloadItem | undefined {
    return this.downloads.get(id)
  }

  public resumeAll(): void {
    this.downloads.forEach((d) => {
      if (d.status === 'paused' || d.status === 'error') {
        this.resumeDownload(d.id)
      }
    })
  }

  public clearCompleted(): void {
    const toRemove: string[] = []
    this.downloads.forEach((d) => {
      if (d.status === 'completed') {
        toRemove.push(d.id)
      }
    })
    toRemove.forEach((id) => this.cancelDownload(id))
  }

  public async verifyDownloadHash(
    id: string,
    expectedHash: string,
    algo: 'sha256' | 'md5' | 'sha512' = 'sha256'
  ): Promise<{ matches: boolean; actualHash: string }> {
    const d = this.downloads.get(id)
    if (!d) throw new Error('Download not found')

    const actualHash = await HashVerifier.calculateHash(d.savePath, algo)
    const matches = actualHash.toLowerCase().trim() === expectedHash.toLowerCase().trim()
    d.checksum = actualHash
    this.saveStateImmediate()
    this.emit('downloadUpdated', d)

    return { matches, actualHash }
  }

  public renameDownload(id: string, newName: string): boolean {
    const d = this.downloads.get(id)
    if (!d || !newName || !newName.trim()) return false

    const cleanName = newName.trim()
    const oldPath = d.savePath

    if (oldPath && fs.existsSync(oldPath)) {
      try {
        const newPath = path.join(path.dirname(oldPath), cleanName)
        if (oldPath !== newPath) {
          fs.renameSync(oldPath, newPath)
          d.savePath = newPath
        }
      } catch (err) {
        console.warn(`[DownloadManager] Could not rename file on disk:`, err)
      }
    }

    d.name = cleanName
    this.saveStateImmediate()
    this.emit('downloadUpdated', d)
    return true
  }

  public setDownloadLocation(id: string, newTargetLocation: string): boolean {
    const d = this.downloads.get(id)
    if (!d || !newTargetLocation || !newTargetLocation.trim()) return false

    const cleanTarget = newTargetLocation.trim()
    const oldPath = d.savePath
    let newSavePath = cleanTarget

    try {
      if (fs.existsSync(cleanTarget) && fs.statSync(cleanTarget).isDirectory()) {
        newSavePath = path.join(cleanTarget, path.basename(oldPath || d.name))
      }

      if (oldPath && fs.existsSync(oldPath) && oldPath !== newSavePath) {
        DiskAllocator.ensureDirectory(path.dirname(newSavePath))
        fs.renameSync(oldPath, newSavePath)
      }
    } catch (err) {
      console.warn(`[DownloadManager] Could not relocate file on disk:`, err)
    }

    d.savePath = newSavePath
    this.saveStateImmediate()
    this.emit('downloadUpdated', d)
    return true
  }

  public setDownloadTags(id: string, tags: string[]): boolean {
    const d = this.downloads.get(id)
    if (!d) return false

    d.tags = Array.from(new Set((tags || []).map((t) => t.trim()).filter(Boolean)))
    this.saveStateImmediate()
    this.emit('downloadUpdated', d)
    return true
  }

  public toggleDownloadTag(id: string, tag: string): boolean {
    const d = this.downloads.get(id)
    if (!d || !tag || !tag.trim()) return false

    const cleanTag = tag.trim()
    const currentTags = d.tags || []
    if (currentTags.includes(cleanTag)) {
      d.tags = currentTags.filter((t) => t !== cleanTag)
    } else {
      d.tags = [...currentTags, cleanTag]
    }

    this.saveStateImmediate()
    this.emit('downloadUpdated', d)
    return true
  }

  public setTorrentOptions(id: string, options: Partial<DownloadItem>): boolean {
    const d = this.downloads.get(id)
    if (!d) return false

    Object.assign(d, options)
    this.saveStateImmediate()
    this.emit('downloadUpdated', d)
    return true
  }

  public setCategory(id: string, category: DownloadCategory): boolean {
    const d = this.downloads.get(id)
    if (!d) return false
    d.category = category
    this.saveStateImmediate()
    this.emit('downloadUpdated', d)
    return true
  }

  public getStatsCollector(): StatsCollector {
    return this.statsCollector
  }

  private processQueue(): void {
    const toStart = this.queueManager.getNextQueuedDownloads(this.downloads)
    toStart.forEach((d) => this.startDownload(d.id))
  }

  public destroy(): void {
    // 1. Stop monitoring systems
    this.statsCollector.stop()
    this.adaptiveQoS.stopMonitoring()

    // 2. Cancel all active downloads (both HTTP and torrent)
    this.downloads.forEach((d) => {
      if (d.status === 'downloading') {
        const isTorrent = DownloadManager.isTorrentSource(d.url)
        if (isTorrent) {
          TorrentWorker.removeTorrent(d.id)
        } else {
          this.chunkEngine.cancelDownload(d.id)
          DiskAllocator.closeFile(d.savePath)
        }
      }
    })

    // 3. Close any remaining open file handles
    DiskAllocator.closeAll()

    // 4. Flush pending state to disk before exit
    this.saveStateImmediate()
  }
}
