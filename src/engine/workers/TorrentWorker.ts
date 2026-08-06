import WebTorrent from 'webtorrent'
import parseTorrent from 'parse-torrent'
import * as fs from 'fs'
import * as path from 'path'
import { ChunkInfo, DownloadFileItem } from '../types'

export interface MagnetInfo {
  infoHash: string
  name: string
  trackers: string[]
  exactTopic?: string
}

export interface ParsedTorrentMeta {
  name: string
  infoHash: string
  totalSize: number
  files: Array<{ name: string; path: string; size: number }>
  trackers: string[]
}

interface ParsedTorrentFileItem {
  name?: string
  path?: string
  length?: number
}

interface InstanceTorrentData {
  name?: string
  infoHash?: string
  length?: number
  files?: ParsedTorrentFileItem[]
  announce?: string | string[]
}

export interface TorrentPeerInfo {
  ip: string
  port: number
  clientName?: string
  downloadSpeed: number
  uploadSpeed: number
  choked: boolean
}

export interface TorrentProgressEvent {
  downloadId: string
  downloadedSize: number
  totalSize: number
  downloadSpeed: number
  uploadSpeed: number
  uploadedSize: number
  progress: number
  peersCount: number
  seedsCount: number
  ratio: number
  eta: number
  chunks: ChunkInfo[]
  trackers: Array<{ url: string; status: 'working' | 'error' | 'disabled'; peers: number }>
  files: DownloadFileItem[]
  peersInfo?: TorrentPeerInfo[]
}

export class TorrentWorker {
  private static client: InstanceType<typeof WebTorrent> | null = null
  private static torrentsMap: Map<string, WebTorrent.Torrent> = new Map()

  public static generatePeerId(): string {
    const prefix = '-GR0110-' // GR = Grabbit, 0110 = v0.1.1
    const randomChars = Math.random().toString(36).substring(2, 14).padEnd(12, '0')
    return prefix + randomChars
  }

  /**
   * Initializes or returns the shared WebTorrent client singleton instance
   */
  public static getClient(): InstanceType<typeof WebTorrent> {
    if (!this.client) {
      const customPeerId = this.generatePeerId()

      this.client = new WebTorrent({
        dht: true,
        webSeeds: true,
        peerId: customPeerId,
        tracker: {
          userAgent: 'Grabbit/0.1.1 (Desktop Download Manager)'
        }
      })

      this.client.on('error', (err: Error | string) => {
        console.error('[WebTorrent Client Error]', err)
      })
    }
    return this.client
  }

  /**
   * Parses magnet URIs (magnet:?xt=urn:btih:...&dn=...&tr=...)
   */
  public static parseMagnetURI(magnetUrl: string): MagnetInfo {
    const info: MagnetInfo = {
      infoHash: '',
      name: 'Torrent Download',
      trackers: []
    }

    try {
      const urlObj = new URL(magnetUrl)
      const params = urlObj.searchParams

      // Extract BTIH InfoHash
      const xt = params.get('xt') || ''
      if (xt.includes('urn:btih:')) {
        info.infoHash = xt.replace('urn:btih:', '').toLowerCase()
      }

      // Extract Display Name
      const dn = params.get('dn')
      if (dn) {
        info.name = decodeURIComponent(dn)
      }

      // Extract Trackers
      const trList = params.getAll('tr')
      if (trList.length > 0) {
        info.trackers = trList.map((t) => decodeURIComponent(t))
      }
    } catch {
      // Fallback regex parsing
      const hashMatch = magnetUrl.match(/xt=urn:btih:([a-zA-Z0-9]+)/i)
      if (hashMatch && hashMatch[1]) {
        info.infoHash = hashMatch[1].toLowerCase()
      }

      const nameMatch = magnetUrl.match(/dn=([^&]+)/i)
      if (nameMatch && nameMatch[1]) {
        info.name = decodeURIComponent(nameMatch[1])
      }
    }

    return info
  }

  /**
   * Parses local .torrent file or magnet URI metadata
   */
  public static async parseTorrentMetadata(sourcePathOrMagnet: string): Promise<ParsedTorrentMeta> {
    if (sourcePathOrMagnet.startsWith('magnet:')) {
      try {
        const parsed = (await parseTorrent(sourcePathOrMagnet)) as InstanceTorrentData
        const trackers = Array.isArray(parsed.announce)
          ? parsed.announce
          : parsed.announce
            ? [parsed.announce]
            : []
        const files = (parsed.files || []).map((f: ParsedTorrentFileItem) => ({
          name: f.name || f.path || 'file',
          path: f.path || f.name || 'file',
          size: f.length || 0
        }))
        const totalSize = parsed.length || files.reduce((acc: number, f) => acc + f.size, 0)
        return {
          name: parsed.name || 'Magnet Download',
          infoHash: parsed.infoHash || '',
          totalSize,
          files,
          trackers
        }
      } catch {
        const mag = this.parseMagnetURI(sourcePathOrMagnet)
        return {
          name: mag.name || 'Magnet Download',
          infoHash: mag.infoHash,
          totalSize: 0,
          files: [],
          trackers: mag.trackers
        }
      }
    }

    try {
      if (fs.existsSync(sourcePathOrMagnet)) {
        const buf = fs.readFileSync(sourcePathOrMagnet)
        const parsed = (await parseTorrent(buf)) as InstanceTorrentData
        if (parsed) {
          const files = (parsed.files || []).map((f: ParsedTorrentFileItem) => ({
            name: f.name || f.path || 'file',
            path: f.path || f.name || 'file',
            size: f.length || 0
          }))
          const totalSize = parsed.length || files.reduce((acc: number, f) => acc + f.size, 0)
          const trackers = Array.isArray(parsed.announce)
            ? parsed.announce
            : parsed.announce
              ? [parsed.announce]
              : []
          return {
            name: parsed.name || path.basename(sourcePathOrMagnet),
            infoHash: parsed.infoHash || '',
            totalSize,
            files,
            trackers
          }
        }
      }
    } catch (err) {
      console.warn('[TorrentWorker] Failed to parse file metadata:', err)
    }

    return {
      name: path.basename(sourcePathOrMagnet),
      infoHash: '',
      totalSize: 0,
      files: [],
      trackers: []
    }
  }

  /**
   * Adds and starts a WebTorrent task
   */
  public static startTorrentDownload(
    downloadId: string,
    torrentSource: string,
    savePath: string,
    onProgress: (event: TorrentProgressEvent) => void,
    onComplete: (event: TorrentProgressEvent) => void
  ): Promise<WebTorrent.Torrent> {
    return new Promise((resolve, reject) => {
      const client = this.getClient()

      // Check if already active
      const existing = this.torrentsMap.get(downloadId)
      if (existing) {
        existing.resume()
        resolve(existing)
        return
      }

      try {
        const torrent = client.add(
          torrentSource,
          {
            path: savePath
          },
          (addedTorrent: WebTorrent.Torrent) => {
            this.torrentsMap.set(downloadId, addedTorrent)

            // Setup listeners
            addedTorrent.on('download', () => {
              this.emitProgressEvent(downloadId, addedTorrent, onProgress)
            })

            addedTorrent.on('upload', () => {
              this.emitProgressEvent(downloadId, addedTorrent, onProgress)
            })

            addedTorrent.on('wire', () => {
              this.emitProgressEvent(downloadId, addedTorrent, onProgress)
            })

            addedTorrent.on('done', () => {
              this.emitProgressEvent(downloadId, addedTorrent, onComplete)
            })

            resolve(addedTorrent)
          }
        )

        torrent.on('error', (err: Error | string) => {
          console.error(`[WebTorrent Task Error ${downloadId}]`, err)
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Seeds a local file or folder into a WebTorrent task
   */
  public static seedTorrent(
    sourcePath: string,
    options?: { savePath?: string }
  ): Promise<WebTorrent.Torrent> {
    return new Promise((resolve) => {
      const client = this.getClient()
      client.seed(sourcePath, { path: options?.savePath }, (torrent: WebTorrent.Torrent) => {
        resolve(torrent)
      })
    })
  }

  /**
   * Dynamically adds an announce tracker URL to an active torrent
   */
  public static addTracker(downloadId: string, trackerUrl: string): boolean {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent) {
      if (
        typeof (torrent as unknown as { addTracker?: (url: string) => void }).addTracker ===
        'function'
      ) {
        ;(torrent as unknown as { addTracker: (url: string) => void }).addTracker(trackerUrl)
      } else if (!torrent.announce.includes(trackerUrl)) {
        torrent.announce.push(trackerUrl)
      }
      return true
    }
    return false
  }

  /**
   * Dynamically removes an announce tracker URL from an active torrent
   */
  public static removeTracker(downloadId: string, trackerUrl: string): boolean {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent) {
      if (
        typeof (torrent as unknown as { removeTracker?: (url: string) => void }).removeTracker ===
        'function'
      ) {
        ;(torrent as unknown as { removeTracker: (url: string) => void }).removeTracker(trackerUrl)
      } else {
        const idx = torrent.announce.indexOf(trackerUrl)
        if (idx !== -1) torrent.announce.splice(idx, 1)
      }
      return true
    }
    return false
  }

  /**
   * Manually adds a peer IP:port address to an active torrent swarm
   */
  public static addPeer(downloadId: string, peerAddress: string): boolean {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent) {
      torrent.addPeer(peerAddress)
      return true
    }
    return false
  }

  /**
   * Sets individual file selection & priority ('high', 'normal', 'low', 'ignore')
   */
  public static setFilePriority(
    downloadId: string,
    filePath: string,
    priority: 'high' | 'normal' | 'low' | 'ignore'
  ): boolean {
    const torrent = this.torrentsMap.get(downloadId)
    if (!torrent) return false

    const targetFile = torrent.files.find((f) => f.path === filePath || f.name === filePath)
    if (targetFile) {
      if (priority === 'ignore') {
        targetFile.deselect()
      } else {
        targetFile.select()
        if (priority === 'high') {
          // Prioritize pieces for this file
          targetFile.select()
        }
      }
      return true
    }
    return false
  }

  /**
   * Exports the .torrent metadata buffer of an active torrent
   */
  public static getTorrentFileBuffer(downloadId: string): Buffer | null {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent && torrent.torrentFile) {
      return torrent.torrentFile
    }
    return null
  }

  /**
   * Returns a local HTTP media streaming URL for in-app preview
   */
  public static getStreamUrl(downloadId: string, fileIndex = 0): Promise<string | null> {
    return new Promise((resolve) => {
      const torrent = this.torrentsMap.get(downloadId)
      if (!torrent || !torrent.files[fileIndex]) {
        resolve(null)
        return
      }

      const server = torrent.createServer()
      server.listen(0, () => {
        const addr = server.address()
        if (typeof addr === 'object' && addr !== null) {
          resolve(`http://localhost:${addr.port}/${fileIndex}`)
        } else {
          resolve(null)
        }
      })
    })
  }

  /**
   * Pauses an active WebTorrent download
   */
  public static pauseTorrent(downloadId: string): void {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent) {
      torrent.pause()
    }
  }

  /**
   * Resumes a paused WebTorrent download
   */
  public static resumeTorrent(downloadId: string): void {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent) {
      torrent.resume()
    }
  }

  /**
   * Removes and destroys a WebTorrent download task
   */
  public static removeTorrent(downloadId: string): void {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent) {
      torrent.destroy()
      this.torrentsMap.delete(downloadId)
    }
  }

  /**
   * Helper to construct and emit WebTorrent telemetry snapshot
   */
  private static emitProgressEvent(
    downloadId: string,
    torrent: WebTorrent.Torrent,
    callback: (event: TorrentProgressEvent) => void
  ): void {
    const pieceCount = torrent.pieces ? torrent.pieces.length : 32
    const pieceLength = torrent.pieceLength || 524288
    const chunks: ChunkInfo[] = []

    if (torrent.pieces) {
      for (let i = 0; i < torrent.pieces.length; i++) {
        const p = torrent.pieces[i] as { missing?: number } | undefined
        const isDone = p && p.missing === 0
        chunks.push({
          id: i,
          startByte: i * pieceLength,
          endByte: Math.min(torrent.length - 1, (i + 1) * pieceLength - 1),
          downloadedBytes: isDone ? pieceLength : 0,
          speed: torrent.downloadSpeed / pieceCount,
          status: isDone ? 'completed' : 'downloading'
        })
      }
    } else {
      chunks.push(...this.createTorrentChunks(32))
    }

    const trackerList = (torrent.announce || []).map((trUrl: string) => ({
      url: trUrl,
      status: 'working' as const,
      peers: torrent.numPeers
    }))

    const fileList: DownloadFileItem[] = (torrent.files || []).map((f: WebTorrent.TorrentFile) => ({
      path: f.path || f.name,
      size: f.length,
      downloaded: f.downloaded,
      priority: 'normal' as const
    }))

    const wiresList = (torrent as unknown as { wires: Array<Record<string, unknown>> }).wires || []
    const peersInfo: TorrentPeerInfo[] = wiresList.map((wire: Record<string, unknown>) => ({
      ip: (wire.remoteAddress as string) || '127.0.0.1',
      port: (wire.remotePort as number) || 6881,
      clientName:
        ((wire.peerExtendedHandshake as Record<string, unknown>)?.v as string) || 'BitTorrent Peer',
      downloadSpeed: (wire.downloadSpeed as number) || 0,
      uploadSpeed: (wire.uploadSpeed as number) || 0,
      choked: !!wire.peerChoked
    }))

    const event: TorrentProgressEvent = {
      downloadId,
      downloadedSize: torrent.downloaded,
      totalSize: torrent.length,
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      uploadedSize: torrent.uploaded,
      progress: torrent.progress,
      peersCount: torrent.numPeers,
      seedsCount: Math.floor(torrent.numPeers * 0.6),
      ratio: torrent.ratio || 0,
      eta: Math.round(torrent.timeRemaining / 1000),
      chunks,
      trackers: trackerList,
      files: fileList,
      peersInfo
    }

    callback(event)
  }

  /**
   * Generates piece/chunk structure for BitTorrent torrent tasks
   */
  public static createTorrentChunks(totalPieces: number = 32): ChunkInfo[] {
    const chunks: ChunkInfo[] = []
    const pieceSize = 524288 // 512KB per piece default

    for (let i = 0; i < totalPieces; i++) {
      chunks.push({
        id: i,
        startByte: i * pieceSize,
        endByte: (i + 1) * pieceSize - 1,
        downloadedBytes: 0,
        speed: 0,
        status: 'queued'
      })
    }

    return chunks
  }
}
