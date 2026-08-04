import { EventEmitter } from 'events'
import * as path from 'path'
import {
  DownloadCategory,
  DownloadItem,
  DownloadPriority,
  EngineSettings,
  SpeedSample
} from './types'
import { CategoryManager } from './CategoryManager'
import { ChunkEngine } from './ChunkEngine'
import { DiskAllocator } from './DiskAllocator'
import { RateLimiter } from './RateLimiter'
import { Storage } from './Storage'
import { HashVerifier } from './HashVerifier'
import { DownloadQueueManager } from './DownloadQueueManager'
import { StatsCollector } from './StatsCollector'

export class DownloadManager extends EventEmitter {
  private downloads: Map<string, DownloadItem> = new Map()
  private settings: EngineSettings
  private chunkEngine: ChunkEngine
  private rateLimiter: RateLimiter
  private queueManager: DownloadQueueManager
  private statsCollector: StatsCollector

  constructor() {
    super()
    Storage.init()
    this.settings = Storage.loadSettings()
    this.chunkEngine = new ChunkEngine()
    this.rateLimiter = new RateLimiter(this.settings.maxGlobalSpeedLimitKbps)
    this.queueManager = new DownloadQueueManager(this.settings.maxConcurrentDownloads)

    const savedHistory = Storage.loadSpeedHistory()
    this.statsCollector = new StatsCollector(savedHistory)

    // Restore saved downloads from storage
    const saved = Storage.loadDownloads()
    saved.forEach((d) => {
      if (d.status === 'downloading') {
        d.status = 'paused'
        d.speed = 0
      }
      this.downloads.set(d.id, d)
    })

    this.statsCollector.on('tick', (sample: SpeedSample) => {
      Storage.saveSpeedHistory(this.statsCollector.getHistory())
      this.emit('statsTick', sample)
    })
    this.statsCollector.start(() => Array.from(this.downloads.values()))
  }

  public getDownloads(): DownloadItem[] {
    return Array.from(this.downloads.values()).sort((a, b) => b.createdAt - a.createdAt)
  }

  public getSettings(): EngineSettings {
    return { ...this.settings }
  }

  public updateSettings(newSettings: Partial<EngineSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    if (newSettings.maxGlobalSpeedLimitKbps !== undefined) {
      this.rateLimiter.setLimitKbps(newSettings.maxGlobalSpeedLimitKbps)
    }
    if (newSettings.maxConcurrentDownloads !== undefined) {
      this.queueManager.setMaxConcurrentDownloads(newSettings.maxConcurrentDownloads)
    }
    Storage.saveSettings(this.settings)
    this.emit('settingsUpdated', this.settings)
  }

  public getSpeedHistory(): SpeedSample[] {
    return this.statsCollector.getHistory()
  }

  public async addDownload(
    url: string,
    options?: {
      savePath?: string
      filename?: string
      category?: DownloadCategory
      priority?: DownloadPriority
      threadCount?: number
    }
  ): Promise<DownloadItem> {
    let totalSize = 0
    let acceptRanges = true
    let etag = ''
    let filename = options?.filename || ''

    try {
      const info = await this.chunkEngine.getFileInfo(url)
      totalSize = info.totalSize
      acceptRanges = info.acceptRanges
      etag = info.etag
      if (!filename) filename = info.filename
    } catch {
      if (!filename) filename = 'download_' + Date.now()
    }

    const category =
      options?.category ||
      (this.settings.autoCategorize ? CategoryManager.detectCategory(filename) : 'other')

    const saveDir = options?.savePath || this.settings.defaultSavePath
    DiskAllocator.ensureDirectory(saveDir)

    const fullSavePath = path.join(saveDir, filename)
    const threadCount =
      options?.threadCount || (acceptRanges ? this.settings.defaultThreadCount : 1)
    const chunks = this.chunkEngine.createChunks(totalSize, threadCount)

    const download: DownloadItem = {
      id: 'dl_' + Math.random().toString(36).substring(2, 9),
      url,
      name: filename,
      savePath: fullSavePath,
      totalSize,
      downloadedSize: 0,
      speed: 0,
      eta: 0,
      status: 'queued',
      category,
      priority: options?.priority || 'normal',
      threadCount,
      chunks,
      createdAt: Date.now(),
      etag,
      upSpeed: 0,
      uploadedSize: 0,
      ratio: 0.0,
      seedsCount: 12,
      peersCount: 45,
      infoHash: 'e44232' + Math.random().toString(16).substring(2, 14),
      tags: ['neobit', category],
      trackers: [
        { url: 'udp://tracker.neobit.io:6969/announce', status: 'working', peers: 45 },
        { url: 'https://tracker.openbittorrent.com:443/announce', status: 'working', peers: 12 }
      ],
      files: [{ path: filename, size: totalSize, downloaded: 0, priority: 'normal' }]
    }

    this.downloads.set(download.id, download)
    this.saveStateImmediate()
    this.emit('downloadAdded', download)

    this.processQueue()
    return download
  }

  public async startDownload(id: string): Promise<void> {
    const download = this.downloads.get(id)
    if (!download) return

    download.status = 'downloading'
    this.saveStateImmediate()
    this.emit('downloadUpdated', download)

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
          d.downloadedSize = d.totalSize
          DiskAllocator.closeFile(d.savePath)
          this.saveStateImmediate()
          this.emit('downloadCompleted', d)
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
        this.processQueue()
      }
    )
  }

  public pauseDownload(id: string): void {
    const d = this.downloads.get(id)
    if (!d || d.status !== 'downloading') return

    this.chunkEngine.cancelDownload(id)
    DiskAllocator.closeFile(d.savePath)
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

    d.status = 'queued'
    this.saveStateImmediate()
    this.emit('downloadUpdated', d)
    this.processQueue()
  }

  public cancelDownload(id: string): void {
    const d = this.downloads.get(id)
    if (!d) return

    this.chunkEngine.cancelDownload(id)
    DiskAllocator.closeFile(d.savePath)
    this.downloads.delete(id)
    this.saveStateImmediate()
    this.emit('downloadRemoved', id)
    this.processQueue()
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

    return { matches, actualHash }
  }

  private processQueue(): void {
    const toStart = this.queueManager.getNextQueuedDownloads(this.downloads)
    toStart.forEach((d) => this.startDownload(d.id))
  }

  private saveStateImmediate(): void {
    Storage.saveDownloads(Array.from(this.downloads.values()))
  }

  private saveStateDebounced(): void {
    Storage.saveDownloadsDebounced(Array.from(this.downloads.values()))
  }

  public destroy(): void {
    this.statsCollector.stop()
    DiskAllocator.closeAll()
  }
}
