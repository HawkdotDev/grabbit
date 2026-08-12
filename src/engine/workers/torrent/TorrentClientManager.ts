import packageJson from '../../../../package.json'
import { TorrentClientInstance, TorrentTaskInstance } from '../TorrentWorker'

type WebTorrentConstructor = new (opts?: Record<string, unknown>) => TorrentClientInstance

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

import * as crypto from 'crypto'

export class TorrentClientManager {
  private static client: TorrentClientInstance | null = null
  public static readonly torrentsMap: Map<string, TorrentTaskInstance> = new Map()

  public static readonly DEFAULT_PUBLIC_TRACKERS = [
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://open.stealth.si:80/announce',
    'udp://tracker.torrent.eu.org:451/announce',
    'udp://explodie.org:6969/announce',
    'udp://tracker.openbittorrent.com:6969/announce',
    'udp://p4p.arenabg.com:1337/announce',
    'udp://tracker.tiny-vps.com:6969/announce',
    'udp://tracker.coppersurfer.tk:6969/announce',
    'wss://tracker.openwebtorrent.com',
    'wss://tracker.webtorrent.dev',
    'wss://tracker.btorrent.xyz',
    'wss://tracker.files.fm:7073/announce'
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

  public static generatePeerIdBuffer(): Buffer {
    const peerIdStr = this.generatePeerId()
    return Buffer.from(peerIdStr, 'utf8')
  }

  public static async getClient(opts?: {
    forceEncryption?: boolean
    disableP2PTracking?: boolean
    downloadLimitKbps?: number
    uploadLimitKbps?: number
  }): Promise<TorrentClientInstance> {
    if (!this.client) {
      const WebTorrent = await getWebTorrentClass()

      const dlLimit = opts?.downloadLimitKbps && opts.downloadLimitKbps > 0
        ? opts.downloadLimitKbps * 1024
        : -1
      const ulLimit = opts?.uploadLimitKbps && opts.uploadLimitKbps > 0
        ? opts.uploadLimitKbps * 1024
        : -1

      this.client = new WebTorrent({
        peerId: TorrentClientManager.generatePeerIdBuffer(),
        nodeId: crypto.randomBytes(20),
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
        downloadLimit: dlLimit,
        uploadLimit: ulLimit,
        tracker: {
          announce: TorrentClientManager.DEFAULT_PUBLIC_TRACKERS
        }
      })

      this.client.on('error', (err: Error | string) => {
        const msg = (typeof err === 'string' ? err : err?.message || '').toLowerCase()
        if (msg.includes('peerconnection') || msg.includes('tracker') || msg.includes('enotfound') || msg.includes('already exists')) return
        console.warn('[WebTorrent Client Suppressed Error]', msg)
      })
    }
    return this.client
  }

  public static getRawClient(): TorrentClientInstance | null {
    return this.client
  }
}
