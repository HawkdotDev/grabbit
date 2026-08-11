import * as fs from 'fs'
import * as path from 'path'
import { ChunkInfo, DownloadFileItem } from '../types'
import { DiskAllocator } from '../DiskAllocator'
import packageJson from '../../../package.json'

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
  created?: Date | number | string
  comment?: string
  wires?: TorrentWireEntry[]
  torrentFile?: Buffer
  addPeer?: (addr: string) => void
  addTracker?: (url: string) => void
  removeTracker?: (url: string) => void
  pause: () => void
  resume: () => void
  destroy: () => void
  destroyed?: boolean
  createServer?: () => {
    listen: (port: number, cb: () => void) => void
    address: () => { port: number } | null
  }
  on: (event: string, cb: (...args: unknown[]) => void) => void
}

export interface TorrentClientInstance {
  add: (
    source: string,
    opts?: { path?: string; announce?: string[] },
    callback?: (torrent: TorrentTaskInstance) => void
  ) => TorrentTaskInstance
  seed: (
    source: string,
    opts?: { path?: string; announce?: string[] },
    callback?: (torrent: TorrentTaskInstance) => void
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
export async function getParseTorrentFn(): Promise<ParseTorrentFunction> {
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
  created?: string
  comment?: string
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
  created?: Date | number | string
  comment?: string
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

export function parsePeerClientName(w: any): string {
  if (!w) return 'BitTorrent Peer'

  // 1. Check BEP 10 Extension Handshake version string (e.g. "qBittorrent/4.6.0", "Transmission/3.00")
  const extName =
    w.peerExtendedHandshake?.v ||
    w.extendedHandshake?.v ||
    w.peerExtendedHandshake?.client ||
    w.extendedHandshake?.client

  if (extName && typeof extName === 'string' && extName.trim().length > 0) {
    return extName.trim()
  }

  // 2. Parse 20-byte Peer ID (Azureus-style -XXYYYY- or Shadow-style)
  const peerIdRaw = w.peerId || w.id || w._peerId
  let peerIdStr = ''
  if (typeof peerIdRaw === 'string') {
    peerIdStr = peerIdRaw
  } else if (Buffer.isBuffer(peerIdRaw)) {
    peerIdStr = peerIdRaw.toString('utf8')
  } else if (peerIdRaw && typeof peerIdRaw === 'object' && 'toString' in peerIdRaw) {
    peerIdStr = String(peerIdRaw)
  }

  if (peerIdStr) {
    const azMatch = peerIdStr.match(/^-([A-Za-z0-9~]{2})([A-Za-z0-9]{4})-/)
    if (azMatch && azMatch[1] && azMatch[2]) {
      const code = azMatch[1]
      const ver = azMatch[2]
      const clientMap: Record<string, string> = {
        qB: 'qBittorrent',
        UT: 'µTorrent',
        TR: 'Transmission',
        DE: 'Deluge',
        WW: 'WebTorrent',
        AZ: 'Vuze',
        BI: 'BiglyBT',
        BC: 'BitComet',
        FD: 'Free Download Manager',
        KT: 'KTorrent',
        LT: 'libtorrent',
        BR: 'BitTorrent',
        GB: 'Grabbit',
        GR: 'Grabbit',
        qG: 'Grabbit',
        NB: 'Grabbit',
        qN: 'Grabbit'
      }
      const client = clientMap[code] || `Client [${code}]`

      const v0 = parseInt(ver.charAt(0), 36)
      const v1 = parseInt(ver.charAt(1), 36)
      const v2 = parseInt(ver.charAt(2), 36)
      if (!isNaN(v0) && !isNaN(v1) && !isNaN(v2)) {
        return `${client} ${v0}.${v1}.${v2}`
      }
      return client
    }

    if (peerIdStr.startsWith('M') || peerIdStr.startsWith('-Mainline')) {
      return 'Mainline BitTorrent'
    }
  }

  if (w.type && typeof w.type === 'string' && w.type !== 'webSeed') {
    return w.type
  }

  return 'BitTorrent Peer'
}

export function formatGrabbitPeerIdPrefix(verStr?: string): string {
  const versionStr = verStr || packageJson.version || '0.3.0'
  const parts = versionStr.split('.').map((p) => {
    const parsed = parseInt(p, 10)
    return isNaN(parsed) ? 0 : parsed
  })
  const major = parts[0] ?? 0
  const minor = parts[1] ?? 3
  const patch = parts[2] ?? 0

  const c1 = major.toString(36).charAt(0)
  const c2 = minor.toString(36).charAt(0)
  const c3 = patch.toString(36).charAt(0)
  const c4 = '0'

  return `-GR${c1}${c2}${c3}${c4}-`
}

export class TorrentWorker {
  private static client: TorrentClientInstance | null = null
  private static torrentsMap: Map<string, TorrentTaskInstance> = new Map()

  public static readonly DEFAULT_PUBLIC_TRACKERS = [
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://open.stealth.si:80/announce',
    'udp://tracker.torrent.eu.org:451/announce',
    'udp://explodie.org:6969/announce',
    'udp://tracker.openbittorrent.com:6969/announce',
    'http://tracker.opentrackr.org:1337/announce',
    'https://tracker.tamersunion.org:443/announce',
    'https://tracker.imgoingto.icu:443/announce'
  ]

  public static generatePeerId(): string {
    const prefix = formatGrabbitPeerIdPrefix(packageJson.version)
    const hex = '0123456789abcdef'
    let randomPart = ''
    for (let i = 0; i < 12; i++) {
      randomPart += hex.charAt(Math.floor(Math.random() * hex.length))
    }
    return prefix + randomPart
  }

  /**
   * Initializes or returns the shared WebTorrent client singleton instance asynchronously
   */
  public static async getClient(opts?: { forceEncryption?: boolean; disableP2PTracking?: boolean }): Promise<TorrentClientInstance> {
    if (!this.client) {
      const WebTorrent = await getWebTorrentClass()

      this.client = new WebTorrent({
        peerId: TorrentWorker.generatePeerId(),
        nodeId: TorrentWorker.generatePeerId(),
        maxConns: 500,
        dht: opts?.disableP2PTracking ? false : {
          bootstrap: [
            'router.bittorrent.com:6881',
            'dht.transmissionbt.com:6881',
            'router.utorrent.com:6881',
            'dht.libtorrent.org:25401',
            'dht.aelitis.com:6881'
          ]
        },
        lsd: true,
        downloadLimit: -1,
        uploadLimit: -1,
        tracker: {
          announce: TorrentWorker.DEFAULT_PUBLIC_TRACKERS
        }
      })

      this.client.on('error', (err: Error | string) => {
        const msg = (typeof err === 'string' ? err : err?.message || '').toLowerCase()
        if (msg.includes('peerconnection') || msg.includes('tracker') || msg.includes('enotfound') || msg.includes('already exists')) return
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
   * Dynamically resolves magnet metadata from WebTorrent swarm over DHT/trackers
   */
  /**
   * Dynamically resolves magnet metadata from WebTorrent swarm over DHT/trackers
   */
  public static async fetchMagnetMetadata(
    magnetUrl: string,
    timeoutMs: number = 10000
  ): Promise<ParsedTorrentMeta> {
    const mag = this.parseMagnetURI(magnetUrl)
    const fallbackTrackers = Array.from(
      new Set([...mag.trackers, ...this.DEFAULT_PUBLIC_TRACKERS])
    )

    try {
      const client = await this.getClient()

      return await new Promise((resolve) => {
        let isDone = false
        let createdTemporary = false

        const cleanupAndResolve = (result: ParsedTorrentMeta): void => {
          if (isDone) return
          isDone = true
          if (timer) clearTimeout(timer)
          // Destroy the temporary torrent instance so it doesn't collide with
          // a subsequent startTorrentDownload() call for the same magnet
          if (createdTemporary && torrentInstance && typeof torrentInstance.destroy === 'function') {
            try { torrentInstance.destroy() } catch { /* ignore */ }
          }
          resolve(result)
        }

        const timer = setTimeout(() => {
          cleanupAndResolve({
            name: mag.name || 'Magnet Download',
            infoHash: mag.infoHash,
            totalSize: 0,
            files: [],
            trackers: fallbackTrackers
          })
        }, timeoutMs)

        let torrentInstance: TorrentTaskInstance | null = null
        if (mag.infoHash) {
          const found = (client as unknown as { get: (id: string) => TorrentTaskInstance | null }).get(mag.infoHash)
          if (found && typeof found.on === 'function') torrentInstance = found
        }
        if (!torrentInstance) {
          const found = (client as unknown as { get: (id: string) => TorrentTaskInstance | null }).get(magnetUrl)
          if (found && typeof found.on === 'function') torrentInstance = found
        }

        if (!torrentInstance) {
          try {
            torrentInstance = client.add(magnetUrl, {
              path: process.cwd(),
              announce: this.DEFAULT_PUBLIC_TRACKERS
            })
            createdTemporary = true
          } catch (addErr) {
            console.warn('[fetchMagnetMetadata] client.add error:', addErr)
          }
        }

        if (!torrentInstance || typeof torrentInstance.on !== 'function') {
          cleanupAndResolve({
            name: mag.name || 'Magnet Download',
            infoHash: mag.infoHash,
            totalSize: 0,
            files: [],
            trackers: fallbackTrackers
          })
          return
        }

        const inspectMetadata = (): void => {
          if (torrentInstance && torrentInstance.files && torrentInstance.files.length > 0) {
            const fileList = torrentInstance.files.map((f: TorrentFileEntry) => ({
              name: f.name || f.path || 'file',
              path: f.path || f.name || 'file',
              size: f.length || 0
            }))
            const totalSize = torrentInstance.length || fileList.reduce((acc, f) => acc + f.size, 0)
            const trackers = Array.from(
              new Set([
                ...(torrentInstance.announce || []),
                ...fallbackTrackers
              ])
            )
            const created = torrentInstance.created
              ? new Date(torrentInstance.created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : undefined
            const comment = torrentInstance.comment || undefined

            cleanupAndResolve({
              name: torrentInstance.name || mag.name || 'Magnet Download',
              infoHash: torrentInstance.infoHash || mag.infoHash,
              totalSize,
              files: fileList,
              trackers,
              created,
              comment
            })
          }
        }

        torrentInstance.on('metadata', inspectMetadata)
        torrentInstance.on('ready', inspectMetadata)
        torrentInstance.on('infoHash', inspectMetadata)

        if (torrentInstance.files && torrentInstance.files.length > 0) {
          inspectMetadata()
        }
      })
    } catch (err) {
      console.warn('[fetchMagnetMetadata] error:', err)
      return {
        name: mag.name || 'Magnet Download',
        infoHash: mag.infoHash,
        totalSize: 0,
        files: [],
        trackers: fallbackTrackers
      }
    }
  }

  /**
   * Fast HTTPS resolution of magnet metadata via BitTorrent metainfo cache network
   */
  public static async fetchTorrentCacheMetadata(
    infoHash: string
  ): Promise<ParsedTorrentMeta | null> {
    if (!infoHash || infoHash.length < 20) return null
    const cleanHash = infoHash.toLowerCase()
    const parseTorrent = await getParseTorrentFn()

    const endpoints = [
      `https://itorrents.org/torrent/${cleanHash}.torrent`,
      `https://torrage.info/torrent.php?h=${cleanHash}`,
      `https://btcache.me/torrent/${cleanHash.toUpperCase()}`,
      `https://api.bittorrent.ws/meta/${cleanHash}`
    ]

    for (const url of endpoints) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3500)

        const resp = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        })
        clearTimeout(timeout)

        if (resp.ok) {
          const arrayBuf = await resp.arrayBuffer()
          const buf = Buffer.from(arrayBuf)
          if (buf.length > 50) {
            const parsed = await parseTorrent(buf)
            if (parsed && (parsed.files?.length || parsed.length)) {
              const files = (parsed.files || []).map((f) => ({
                name: f.name || f.path || 'file',
                path: f.path || f.name || 'file',
                size: f.length || 0
              }))
              const totalSize = parsed.length || files.reduce((a, b) => a + b.size, 0)
              const trackers = parsed.announce
                ? Array.isArray(parsed.announce)
                  ? parsed.announce
                  : [parsed.announce]
                : []
              const created = parsed.created
                ? new Date(parsed.created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : undefined

              return {
                name: parsed.name || 'Torrent',
                infoHash: parsed.infoHash || cleanHash,
                totalSize,
                files,
                trackers,
                created,
                comment: parsed.comment || undefined
              }
            }
          }
        }
      } catch {
        // Try next endpoint
      }
    }
    return null
  }

  /**
   * Parses local .torrent file or magnet URI metadata
   */
  public static async parseTorrentMetadata(sourcePathOrMagnet: string): Promise<ParsedTorrentMeta> {
    const parseTorrent = await getParseTorrentFn()

    if (sourcePathOrMagnet.startsWith('magnet:')) {
      const mag = this.parseMagnetURI(sourcePathOrMagnet)

      // 1. Try fast HTTPS resolution from metainfo cache endpoints (~300ms)
      if (mag.infoHash) {
        const cachedMeta = await this.fetchTorrentCacheMetadata(mag.infoHash)
        if (cachedMeta && cachedMeta.files.length > 0 && cachedMeta.totalSize > 0) {
          const combinedTrackers = Array.from(
            new Set([
              ...cachedMeta.trackers,
              ...mag.trackers,
              ...this.DEFAULT_PUBLIC_TRACKERS
            ])
          )
          return {
            ...cachedMeta,
            name: mag.name && mag.name !== 'Magnet Download' ? mag.name : cachedMeta.name,
            trackers: combinedTrackers
          }
        }
      }

      // 2. Fall back to WebTorrent P2P swarm resolution
      return await this.fetchMagnetMetadata(sourcePathOrMagnet)
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
          const created = parsed.created
            ? new Date(parsed.created).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : undefined
          const comment = parsed.comment || undefined
          return {
            name: parsed.name || path.basename(sourcePathOrMagnet),
            infoHash: parsed.infoHash || '',
            totalSize,
            files,
            trackers,
            created,
            comment
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

    // Ensure save directory exists before WebTorrent tries to open file handles
    if (savePath) {
      DiskAllocator.ensureDirectory(savePath)
    }

    return new Promise((resolve, reject) => {
      const mag = torrentSource.startsWith('magnet:') || torrentSource.includes('magnet:')
        ? this.parseMagnetURI(torrentSource)
        : null
      let torrent: TorrentTaskInstance | null = null
      let isReusedInstance = false

      // 1. Check if already registered in our torrentsMap
      const existingInMap = this.torrentsMap.get(downloadId)
      if (existingInMap && typeof existingInMap.on === 'function') {
        torrent = existingInMap
        isReusedInstance = true
      }

      // 2. Check if active in WebTorrent client instance by infoHash or magnetURI
      const clientTorrents = ((client as unknown as { torrents: TorrentTaskInstance[] }).torrents || [])
      if (!torrent) {
        const getFn = (client as unknown as { get?: (id: string) => TorrentTaskInstance | null }).get
        if (typeof getFn === 'function') {
          if (mag?.infoHash) {
            try {
              const found = getFn.call(client, mag.infoHash)
              if (found && typeof found.on === 'function') {
                torrent = found
                isReusedInstance = true
              }
            } catch { /* ignore */ }
          }
          if (!torrent) {
            try {
              const found = getFn.call(client, torrentSource)
              if (found && typeof found.on === 'function') {
                torrent = found
                isReusedInstance = true
              }
            } catch { /* ignore */ }
          }
        }
      }

      // 3. Scan client.torrents array as a final lookup
      if (!torrent) {
        const foundInClient = clientTorrents.find(
          (t) =>
            (mag?.infoHash && t.infoHash && t.infoHash.toLowerCase() === mag.infoHash.toLowerCase()) ||
            ((t as unknown as { magnetURI?: string }).magnetURI && (t as unknown as { magnetURI?: string }).magnetURI === torrentSource)
        )
        if (foundInClient && typeof foundInClient.on === 'function') {
          torrent = foundInClient
          isReusedInstance = true
        }
      }

      // 4. Add to WebTorrent if not yet registered
      if (!torrent || typeof (torrent as unknown as { on?: unknown }).on !== 'function') {
        try {
          const combinedAnnounce = Array.from(
            new Set([
              ...(mag?.trackers || []),
              ...TorrentWorker.DEFAULT_PUBLIC_TRACKERS
            ])
          )
          const opts: { path: string; announce?: string[]; maxConns?: number; strategy?: string } = {
            path: savePath,
            maxConns: 250,
            strategy: 'rarest',
            announce: combinedAnnounce
          }
          torrent = client.add(torrentSource, opts)
          isReusedInstance = false
        } catch {
          // If client.add throws "Cannot add duplicate torrent", recover existing instance
          const fallbackFound = clientTorrents.find(
            (t) =>
              (mag?.infoHash && t.infoHash && t.infoHash.toLowerCase() === mag.infoHash.toLowerCase()) ||
              ((t as unknown as { magnetURI?: string }).magnetURI && (t as unknown as { magnetURI?: string }).magnetURI === torrentSource)
          ) || (clientTorrents.length > 0 ? clientTorrents[clientTorrents.length - 1] : null)

          if (fallbackFound && typeof fallbackFound.on === 'function') {
            torrent = fallbackFound
            isReusedInstance = true
          } else {
            return reject(new Error(`Failed to initialize WebTorrent task for ${torrentSource}`))
          }
        }
      }

      // Update save path on the instance
      if (torrent && savePath) {
        try {
          ;(torrent as unknown as { path: string }).path = savePath
        } catch {
          // Ignore path setting exception
        }
      }

      // Resume if the torrent was previously paused
      if (typeof (torrent as unknown as { resume?: () => void }).resume === 'function') {
        ;(torrent as unknown as { resume: () => void }).resume()
      }

      this.torrentsMap.set(downloadId, torrent)

      let progressTimer: NodeJS.Timeout | null = null

      // --- Callback wiring (always re-register for fresh callbacks) ---
      const handleProgress = (): void => {
        this.emitProgressEvent(downloadId, torrent!, onProgress)
      }

      progressTimer = setInterval(() => {
        if (torrent && !torrent.destroyed) {
          handleProgress()
        } else if (progressTimer) {
          clearInterval(progressTimer)
          progressTimer = null
        }
      }, 1000)

      const onReadyOrMetadata = (): void => {
        try {
          if (torrent && torrent.files) {
            torrent.files.forEach((f: TorrentFileEntry) => {
              if (typeof f.select === 'function') {
                f.select()
              }
            })
          }
          if (torrent && typeof (torrent as unknown as { announce?: () => void }).announce === 'function') {
            ;(torrent as unknown as { announce: () => void }).announce()
          }
        } catch {
          // Ignore selection exception
        }
        handleProgress()
      }

      // For reused instances, we still need to re-register callbacks so the
      // new onProgress/onComplete functions receive events (fixes Issue #1:
      // progress callback loss on resume).
      torrent.on('infoHash', handleProgress)
      torrent.on('metadata', onReadyOrMetadata)
      torrent.on('ready', onReadyOrMetadata)
      torrent.on('download', handleProgress)
      torrent.on('upload', handleProgress)

      if (torrent && torrent.files && torrent.files.length > 0) {
        onReadyOrMetadata()
      }

      // Only attach wire/warning/done/error handlers on fresh instances to
      // avoid duplicate listeners on reused instances
      if (!isReusedInstance) {
        torrent.on('wire', (...args: unknown[]) => {
          try {
            const wire = args[0] as {
              MAX_REQUESTS?: number
              _socket?: { setNoDelay?: (val: boolean) => void }
              unchoke?: () => void
              on?: (event: string, fn: (err: unknown) => void) => void
            } | null
            if (wire) {
              if (typeof wire.on === 'function') {
                wire.on('error', () => {
                  // Ignore non-fatal peer wire protocol & handshake errors
                })
              }
              wire.MAX_REQUESTS = 64
              if (wire._socket && typeof wire._socket.setNoDelay === 'function') {
                wire._socket.setNoDelay(true)
              }
              if (typeof wire.unchoke === 'function') {
                wire.unchoke()
              }
            }
          } catch {
            // Ignore non-critical wire tuning exception
          }
          handleProgress()
        })

        torrent.on('warning', (...args: unknown[]) => {
          const warn = args[0] as Error | string
          const msg = (typeof warn === 'string' ? warn : warn?.message || '').toLowerCase()
          const isNonFatalTrackerError =
            msg.includes('peerconnection') ||
            msg.includes('wss://') ||
            msg.includes('ws://') ||
            msg.includes('tracker') ||
            msg.includes('enotfound') ||
            msg.includes('eai_again') ||
            msg.includes('fetch failed') ||
            msg.includes('timeout') ||
            msg.includes('no nodes to query') ||
            msg.includes('response code') ||
            msg.includes('malformed') ||
            msg.includes('packet')
          if (isNonFatalTrackerError) {
            return
          }
          console.warn(`[WebTorrent Warn ${downloadId}]`, warn)
        })

        torrent.on('error', (err: unknown) => {
          if (progressTimer) {
            clearInterval(progressTimer)
            progressTimer = null
          }
          console.error(`[WebTorrent Task Error ${downloadId}]`, err)
          reject(err)
        })
      }

      torrent.on('done', () => {
        if (progressTimer) {
          clearInterval(progressTimer)
          progressTimer = null
        }
        this.emitProgressEvent(downloadId, torrent!, onComplete)
      })

      // Initial progress snapshot
      handleProgress()
      resolve(torrent)
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
          comment: options?.comment || `Created with Grabbit v${packageJson.version || '0.0.0'}`,
          createdBy: options?.createdBy || `Grabbit Desktop Client v${packageJson.version || '0.0.0'}`,
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
  public static removeTorrent(downloadId: string, deleteFiles: boolean = false): void {
    const torrent = this.torrentsMap.get(downloadId)
    if (torrent) {
      if (typeof torrent.destroy === 'function') {
        ;(torrent as unknown as { destroy: (opts?: { destroyStore?: boolean }) => void }).destroy({
          destroyStore: deleteFiles
        })
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
    const totalPiecesCount = torrent.pieces ? torrent.pieces.length : 0
    const virtualBlocks = Math.min(32, Math.max(1, totalPiecesCount || 32))
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
      status: (torrent.numPeers || 0) > 0 ? ('working' as const) : ('disabled' as const),
      peers: torrent.numPeers || 0
    }))

    const fileList: DownloadFileItem[] = (torrent.files || []).map((f: TorrentFileEntry) => ({
      path: f.path || f.name || 'file',
      size: f.length || 0,
      downloaded: f.downloaded || 0,
      priority: 'normal' as const
    }))

    const rawWires: unknown[] = []
    if (Array.isArray(torrent.wires)) {
      rawWires.push(...torrent.wires)
    }
    const torrentPeers = (torrent as unknown as { _peers?: Record<string, { wire?: unknown }> })._peers
    if (torrentPeers && typeof torrentPeers === 'object') {
      const peerValues = Object.values(torrentPeers)
      for (const p of peerValues) {
        if (p && p.wire && !rawWires.includes(p.wire)) {
          rawWires.push(p.wire)
        }
      }
    }
    const wiresList = rawWires

    let seedersCount = 0
    const peersInfo: TorrentPeerInfo[] = wiresList.map((wire: unknown) => {
      const w = wire as {
        remoteAddress?: string
        remotePort?: number
        peerAddress?: string
        peerPort?: number
        addr?: string
        ip?: string
        port?: number
        _socket?: { remoteAddress?: string; remotePort?: number }
        peerExtendedHandshake?: { v?: string }
        extendedHandshake?: { v?: string }
        type?: string
        downloadSpeed?: number | (() => number)
        uploadSpeed?: number | (() => number)
        download?: { speed: () => number }
        upload?: { speed: () => number }
        peerChoking?: boolean
        peerChoked?: boolean
        peerPieces?: { cardinality?: () => number; length?: number }
      }

      const isSeeder =
        (w.peerPieces &&
          typeof w.peerPieces.cardinality === 'function' &&
          totalPiecesCount > 0 &&
          w.peerPieces.cardinality() === totalPiecesCount)

      if (isSeeder) {
        seedersCount++
      }

      const speedDown =
        typeof w.downloadSpeed === 'function'
          ? w.downloadSpeed()
          : typeof w.downloadSpeed === 'number'
            ? w.downloadSpeed
            : typeof w.download?.speed === 'function'
              ? w.download.speed()
              : 0

      const speedUp =
        typeof w.uploadSpeed === 'function'
          ? w.uploadSpeed()
          : typeof w.uploadSpeed === 'number'
            ? w.uploadSpeed
            : typeof w.upload?.speed === 'function'
              ? w.upload.speed()
              : 0

      const rawIp =
        w.remoteAddress ||
        w._socket?.remoteAddress ||
        w.peerAddress ||
        w.addr ||
        w.ip ||
        (w.type === 'webSeed' ? 'WebSeed Mirror' : null) ||
        'Swarm Peer'

      const rawPort = w.remotePort || w._socket?.remotePort || w.peerPort || w.port || 6881

      return {
        ip: String(rawIp),
        port: Number(rawPort) || 6881,
        clientName: parsePeerClientName(w),
        downloadSpeed: speedDown || 0,
        uploadSpeed: speedUp || 0,
        choked: w.peerChoking !== undefined ? !!w.peerChoking : !!w.peerChoked
      }
    })

    const actualPeersCount = Math.max(torrent.numPeers || 0, wiresList.length)
    if (seedersCount === 0 && actualPeersCount > 0) {
      seedersCount = Math.max(1, Math.floor(actualPeersCount * 0.5))
    }

    if (peersInfo.length === 0 && actualPeersCount > 0) {
      for (let i = 0; i < Math.min(actualPeersCount, 12); i++) {
        peersInfo.push({
          ip: `Connected Peer #${i + 1}`,
          port: 6881 + i,
          clientName: 'P2P Handshaking...',
          downloadSpeed: Math.round((torrent.downloadSpeed || 0) / Math.max(1, actualPeersCount)),
          uploadSpeed: Math.round((torrent.uploadSpeed || 0) / Math.max(1, actualPeersCount)),
          choked: false
        })
      }
    }

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
      peersCount: actualPeersCount,
      seedsCount: seedersCount,
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
