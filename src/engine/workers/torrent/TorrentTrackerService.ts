import { MagnetInfo, ParsedTorrentMeta } from '../TorrentWorker'
import { TorrentClientManager } from './TorrentClientManager'

export class TorrentTrackerService {
  public static parseMagnetURI(magnetUrl: string): MagnetInfo {
    const info: MagnetInfo = {
      infoHash: '',
      name: '',
      trackers: []
    }

    try {
      const urlObj = new URL(magnetUrl)
      const params = urlObj.searchParams

      const xt = params.get('xt') || ''
      if (xt.includes('urn:btih:')) {
        info.infoHash = xt.replace('urn:btih:', '').toLowerCase()
      }

      const dn = params.get('dn')
      if (dn) {
        info.name = decodeURIComponent(dn)
      }

      const trList = params.getAll('tr')
      if (trList.length > 0) {
        info.trackers = trList.map((t) => decodeURIComponent(t))
      }
    } catch {
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

  public static async fetchMagnetMetadata(
    magnetUrl: string,
    timeoutMs: number = 10000
  ): Promise<ParsedTorrentMeta> {
    const mag = this.parseMagnetURI(magnetUrl)
    const fallbackTrackers = Array.from(
      new Set([...mag.trackers, ...TorrentClientManager.DEFAULT_PUBLIC_TRACKERS])
    )

    try {
      const client = await TorrentClientManager.getClient()

      return await new Promise((resolve) => {
        let isDone = false
        let createdTemporary = false
        let torrentInstance: any = null

        const cleanupAndResolve = (result: ParsedTorrentMeta): void => {
          if (isDone) return
          isDone = true
          if (timer) clearTimeout(timer)
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

        const existingTorrents = (client as unknown as { torrents: any[] }).torrents || []
        torrentInstance = mag.infoHash
          ? existingTorrents.find(
              (t) => (t.infoHash || '').toLowerCase() === mag.infoHash.toLowerCase()
            )
          : null

        if (torrentInstance && torrentInstance.files && torrentInstance.files.length > 0) {
          cleanupAndResolve({
            name: torrentInstance.name || mag.name || 'Magnet Download',
            infoHash: torrentInstance.infoHash || mag.infoHash,
            totalSize: torrentInstance.length || 0,
            files: (torrentInstance.files || []).map((f: any) => ({
              name: f.name || f.path || 'file',
              path: f.path || f.name || 'file',
              size: f.length || 0
            })),
            trackers: Array.from(new Set([...(torrentInstance.announce || []), ...fallbackTrackers]))
          })
          return
        }

        createdTemporary = true
        torrentInstance = client.add(
          magnetUrl,
          { announce: TorrentClientManager.DEFAULT_PUBLIC_TRACKERS },
          (t) => {
            cleanupAndResolve({
              name: t.name || mag.name || 'Magnet Download',
              infoHash: t.infoHash || mag.infoHash,
              totalSize: t.length || 0,
              files: (t.files || []).map((f) => ({
                name: f.name || f.path || 'file',
                path: f.path || f.name || 'file',
                size: f.length || 0
              })),
              trackers: Array.from(new Set([...(t.announce || []), ...fallbackTrackers]))
            })
          }
        )
      })
    } catch {
      return {
        name: mag.name || 'Magnet Download',
        infoHash: mag.infoHash,
        totalSize: 0,
        files: [],
        trackers: fallbackTrackers
      }
    }
  }
}
