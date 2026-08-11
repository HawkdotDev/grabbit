import * as fs from 'fs'
import * as path from 'path'
import { ChunkInfo, DownloadFileItem } from '../types'

export interface TorrentFileEntry {
  path?: string
  name?: string
  length?: number
  downloaded?: number
  select?: () => void
  deselect?: () => void
}

export interface TorrentWireEntry {
  remoteAddress?: string
  remotePort?: number
  peerExtendedHandshake?: { v?: string }
  downloadSpeed?: number
  uploadSpeed?: number
  peerChoked?: boolean
}

export interface TorrentTaskInstance {
  name?: string
  infoHash?: string
  length: number
  downloaded: number
  downloadSpeed: number
  uploadSpeed: number
  uploaded: number
  progress: number
  numPeers: number
  ratio?: number
  timeRemaining: number
  pieceLength?: number
  pieces?: Array<{ missing?: number }>
  announce: string[]
  files: TorrentFileEntry[]
  wires?: TorrentWireEntry[]
  torrentFile?: Buffer
  addPeer?: (addr: string) => void
  addTracker?: (url: string) => void
  removeTracker?: (url: string) => void
  pause: () => void
  resume: () => void
  destroy: () => void
  createServer?: () => {
    listen: (port: number, cb: () => void) => void
    address: () => { port: number } | null
  }
  on: (event: string, cb: (...args: unknown[]) => void) => void
}

export interface TorrentClientInstance {
  add: (
    source: string,
    opts: { path: string },
    callback: (torrent: TorrentTaskInstance) => void
  ) => TorrentTaskInstance
  seed: (
    source: string,
    opts: { path?: string },
    callback: (torrent: TorrentTaskInstance) => void
  ) => TorrentTaskInstance
  on: (event: string, handler: (err: Error | string) => void) => void
}

type WebTorrentConstructor = new (opts?: Record<string, unknown>) => TorrentClientInstance
type ParseTorrentFunction = (source: string | Buffer) => Promise<InstanceTorrentData>

let _WebTorrentClass: WebTorrentConstructor | null = null
async function getWebTorrentClass(): Promise<WebTorrentConstructor> {
  if (!_WebTorrentClass) {
    const mod = await (new Function('m', 'return import(m)')('webtorrent') as Promise<{
      default?: WebTorrentConstructor
    }>)
    _WebTorrentClass = (mod.default || mod) as unknown as WebTorrentConstructor
  }
  return _WebTorrentClass
}

let _parseTorrentFn: ParseTorrentFunction | null = null
async function getParseTorrentFn(): Promise<ParseTorrentFunction> {
  if (!_parseTorrentFn) {
    const mod = await (new Function('m', 'return import(m)')('parse-torrent') as Promise<{
      default?: ParseTorrentFunction
    }>)
    _parseTorrentFn = (mod.default || mod) as unknown as ParseTorrentFunction
  }
  return _parseTorrentFn
}

type CreateTorrentCallback = (err: Error | null, torrentBuf: Buffer) => void
type CreateTorrentFunction = (
  input: string | Buffer | File | unknown,
  opts: Record<string, unknown>,
  cb: CreateTorrentCallback
) => void

let _createTorrentFn: CreateTorrentFunction | null = null
async function getCreateTorrentFn(): Promise<CreateTorrentFunction> {
  if (!_createTorrentFn) {
    const mod = await (new Function('m', 'return import(m)')('create-torrent') as Promise<{
      default?: CreateTorrentFunction
    }>)
    _createTorrentFn = (mod.default || mod) as unknown as CreateTorrentFunction
  }
  return _createTorrentFn
}

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
  name?: string
  infoHash?: string
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
  private static client: TorrentClientInstance | null = null
  private static torrentsMap: Map<string, TorrentTaskInstance> = new Map()

  public static generatePeerId(): string {
    const prefix = '-GR0110-' // GR = Grabbit, 0110 = v0.1.1
    const randomChars = Math.random().toString(36).substring(2, 14).padEnd(12, '0')
    return prefix + randomChars
  }

  /**
   * Initializes or returns the shared WebTorrent client singleton instance asynchronously
   */
  public static async getClient(opts?: { forceEncryption?: boolean; disableP2PTracking?: boolean }): Promise<TorrentClientInstance> {
    if (!this.client) {
      const WebTorrent = await getWebTorrentClass()
      const customPeerId = this.generatePeerId()

      this.client = new WebTorrent({
        dht: !opts?.disableP2PTracking,
        webSeeds: true,
        encrypt: opts?.forceEncryption ?? true,
        peerId: customPeerId,
        tracker: {
          userAgent: 'Grabbit/0.1.1 (Desktop Download Manager - Privacy Encrypted)'
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
      name: '',
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

    if (!info.name) {
      info.name = info.infoHash ? `Magnet (${info.infoHash.substring(0, 8)})` : 'Magnet Download'
    }

    return info
  }

  /**
   * Parses local .torrent file or magnet URI metadata
   */
  public static async parseTorrentMetadata(sourcePathOrMagnet: string): Promise<ParsedTorrentMeta> {
    const parseTorrent = await getParseTorrentFn()

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
  public static async startTorrentDownload(
    downloadId: string,
    torrentSource: string,
    savePath: string,
    onProgress: (event: TorrentProgressEvent) => void,
    onComplete: (event: TorrentProgressEvent) => void
  ): Promise<TorrentTaskInstance> {
    const client = await this.getClient()

    return new Promise((resolve, reject) => {
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
          (addedTorrent: TorrentTaskInstance) => {
            this.torrentsMap.set(downloadId, addedTorrent)

            // Setup listeners
            addedTorrent.on('metadata', () => {
              this.emitProgressEvent(downloadId, addedTorrent, onProgress)
            })

            addedTorrent.on('ready', () => {
              this.emitProgressEvent(downloadId, addedTorrent, onProgress)
            })

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

            // Initial progress snapshot
            this.emitProgressEvent(downloadId, addedTorrent, onProgress)
            resolve(addedTorrent)
          }
        )

        torrent.on('error', (err: unknown) => {
          console.error(`[WebTorrent Task Error ${downloadId}]`, err)
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Generates authentic bencoded BitTorrent .torrent metainfo buffer
   */
  public static async createTorrentFile(
    sourcePath: string,
    options?: {
      pieceSizeKb?: number
      trackers?: string[]
      comment?: string
      createdBy?: string
      isPrivate?: boolean
    }
  ): Promise<Buffer> {
    const createTorrent = await getCreateTorrentFn()
    const pieceLength = (options?.pieceSizeKb || 512) * 1024
    const announceList =
      options?.trackers && options.trackers.length > 0
        ? options.trackers.map((tr) => [tr])
        : undefined

    return new Promise((resolve, reject) => {
      createTorrent(
        sourcePath,
        {
          pieceLength,
          announceList,
          comment: options?.comment || 'Created with Grabbit v0.1.1',
          createdBy: options?.createdBy || 'Grabbit Desktop Client v0.1.1',
          private: options?.isPrivate ?? false
        },
        (err: Error | null, torrentBuf: Buffer) => {
          if (err) return reject(err)
          resolve(torrentBuf)
        }
      )
    })
  }

  /**
   * Seeds a local file or folder into a WebTorrent task
   */
  public static async seedTorrent(
    sourcePath: string,
    options?: { savePath?: string }
  ): Promise<TorrentTaskInstance> {
    const client = await this.getClient()
    return new Promise((resolve) => {
      client.seed(sourcePath, { path: options?.savePath }, (torrent: TorrentTaskInstance) => {
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
      if (typeof torrent.addTracker === 'function') {
        torrent.addTracker(trackerUrl)
      } else if (Array.isArray(torrent.announce) && !torrent.announce.includes(trackerUrl)) {
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
      if (typeof torrent.removeTracker === 'function') {
        torrent.removeTracker(trackerUrl)
      } else if (Array.isArray(torrent.announce)) {
        const idx = torrent.announce.indexOf(trackerUrl)
        if (idx !== -1) torrent.announce.splice(idx, 1)
      }
      return true
    }
    return false
  }

  /**
   * Forces re-announcing to all configured trackers on an active torrent
   */
  public static reannounceTorrent(downloadId: string): boolean {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent) {
      if (typeof (torrent as unknown as { announce?: () => void }).announce === 'function') {
        ;(torrent as unknown as { announce: () => void }).announce()
      } else if (Array.isArray(torrent.announce)) {
        torrent.announce.forEach((trUrl: string) => {
          if (typeof torrent.addTracker === 'function') {
            torrent.addTracker(trUrl)
          }
        })
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
    if (torrent && typeof torrent.addPeer === 'function') {
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
    if (!torrent || !Array.isArray(torrent.files)) return false

    const targetFile = torrent.files.find(
      (f: TorrentFileEntry) => f.path === filePath || f.name === filePath
    )
    if (targetFile) {
      if (priority === 'ignore') {
        if (typeof targetFile.deselect === 'function') targetFile.deselect()
      } else {
        if (typeof targetFile.select === 'function') {
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
      if (!torrent || !torrent.files || !torrent.files[fileIndex]) {
        resolve(null)
        return
      }

      if (typeof torrent.createServer === 'function') {
        const server = torrent.createServer()
        server.listen(0, () => {
          const addr = server.address()
          if (typeof addr === 'object' && addr !== null) {
            resolve(`http://localhost:${addr.port}/${fileIndex}`)
          } else {
            resolve(null)
          }
        })
      } else {
        resolve(null)
      }
    })
  }

  /**
   * Pauses an active WebTorrent download
   */
  public static pauseTorrent(downloadId: string): void {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent && typeof torrent.pause === 'function') {
      torrent.pause()
    }
  }

  /**
   * Resumes a paused WebTorrent download
   */
  public static resumeTorrent(downloadId: string): void {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent && typeof torrent.resume === 'function') {
      torrent.resume()
    }
  }

  /**
   * Removes and destroys a WebTorrent download task
   */
  public static removeTorrent(downloadId: string): void {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent) {
      if (typeof torrent.destroy === 'function') {
        torrent.destroy()
      }
      this.torrentsMap.delete(downloadId)
    }
  }

  /**
   * Helper to construct and emit WebTorrent telemetry snapshot
   */
  private static emitProgressEvent(
    downloadId: string,
    torrent: TorrentTaskInstance,
    callback: (event: TorrentProgressEvent) => void
  ): void {
    const totalSize = torrent.length || 0
    const virtualBlocks = 32
    const chunks: ChunkInfo[] = []

    if (torrent.pieces && torrent.pieces.length > 0 && totalSize > 0) {
      const totalPieces = torrent.pieces.length
      const blockByteSize = Math.max(1, Math.floor(totalSize / virtualBlocks))

      for (let b = 0; b < virtualBlocks; b++) {
        const startPieceIdx = Math.floor((b * totalPieces) / virtualBlocks)
        const endPieceIdx = Math.min(
          totalPieces - 1,
          Math.floor(((b + 1) * totalPieces) / virtualBlocks) - 1
        )
        const piecesInSlice = Math.max(1, endPieceIdx - startPieceIdx + 1)

        let completedInSlice = 0
        for (let p = startPieceIdx; p <= endPieceIdx; p++) {
          const piece = torrent.pieces[p] as { missing?: number } | undefined
          if (piece && piece.missing === 0) {
            completedInSlice++
          }
        }

        const startByte = b * blockByteSize
        const endByte = b === virtualBlocks - 1 ? totalSize - 1 : (b + 1) * blockByteSize - 1
        const sliceByteSize = Math.max(1, endByte - startByte + 1)
        const downloadedBytes = Math.min(
          sliceByteSize,
          Math.round((completedInSlice / piecesInSlice) * sliceByteSize)
        )
        const isDone = completedInSlice === piecesInSlice
        const status = isDone ? 'completed' : downloadedBytes > 0 ? 'downloading' : 'queued'

        chunks.push({
          id: b,
          startByte,
          endByte,
          downloadedBytes,
          speed: isDone ? 0 : Math.round(torrent.downloadSpeed / virtualBlocks),
          status
        })
      }
    } else {
      chunks.push(...this.createTorrentChunks(32))
    }

    const trackerList = (torrent.announce || []).map((trUrl: string) => ({
      url: trUrl,
      status: 'working' as const,
      peers: torrent.numPeers || 0
    }))

    const fileList: DownloadFileItem[] = (torrent.files || []).map((f: TorrentFileEntry) => ({
      path: f.path || f.name || 'file',
      size: f.length || 0,
      downloaded: f.downloaded || 0,
      priority: 'normal' as const
    }))

    const wiresList = torrent.wires || []
    const peersInfo: TorrentPeerInfo[] = wiresList.map((wire: TorrentWireEntry) => ({
      ip: wire.remoteAddress || '127.0.0.1',
      port: wire.remotePort || 6881,
      clientName: wire.peerExtendedHandshake?.v || 'BitTorrent Peer',
      downloadSpeed: wire.downloadSpeed || 0,
      uploadSpeed: wire.uploadSpeed || 0,
      choked: !!wire.peerChoked
    }))

    const event: TorrentProgressEvent = {
      downloadId,
      name: torrent.name,
      infoHash: torrent.infoHash,
      downloadedSize: torrent.downloaded || 0,
      totalSize: torrent.length || 0,
      downloadSpeed: torrent.downloadSpeed || 0,
      uploadSpeed: torrent.uploadSpeed || 0,
      uploadedSize: torrent.uploaded || 0,
      progress: torrent.progress || 0,
      peersCount: torrent.numPeers || 0,
      seedsCount: Math.floor((torrent.numPeers || 0) * 0.6),
      ratio: torrent.ratio || 0,
      eta: Math.round((torrent.timeRemaining || 0) / 1000),
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
