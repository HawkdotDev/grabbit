import { ChunkInfo } from '../types'

export interface MagnetInfo {
  infoHash: string
  name: string
  trackers: string[]
  exactTopic?: string
}

export class TorrentWorker {
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
