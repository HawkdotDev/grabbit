export class TorrentWireTelemetry {
  public static parsePeerClientName(w: any): string {
    return parsePeerClientName(w)
  }

  public static extractWirePeersInfo(wiresList: any[], totalPiecesCount: number): TorrentPeerInfo[] {
    return extractWirePeersInfo(wiresList, totalPiecesCount)
  }
}

export function parsePeerClientName(w: any): string {
  if (!w) return 'BitTorrent Peer'

  // 1. Check BEP 10 Extension Handshake version string
  const extName =
    w.peerExtendedHandshake?.v ||
    w.extendedHandshake?.v ||
    w.peerExtendedHandshake?.client ||
    w.extendedHandshake?.client

  if (extName && typeof extName === 'string' && extName.trim().length > 0) {
    return extName.trim()
  }

  // 2. Parse 20-byte Peer ID (Azureus-style or Shadow-style)
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

export function extractWirePeersInfo(wiresList: any[], totalPiecesCount: number): TorrentPeerInfo[] {
  return wiresList.map((wire) => {
    const w = wire as any
    const remoteAddr = w.remoteAddress || w.address || (w.peerId ? '127.0.0.1' : '')
    const remotePort = w.remotePort || w.port || 6881

    const ipStr = remoteAddr ? String(remoteAddr) : '127.0.0.1'
    const portNum = typeof remotePort === 'number' ? remotePort : 6881

    const connType = w.type === 'webSeed' ? 'WebSeed' : w._utp ? 'uTP' : 'BT'

    let peerProgress = 0
    if (w.peerPieces && totalPiecesCount > 0) {
      if (typeof w.peerPieces.cardinality === 'function') {
        peerProgress = Math.min(1.0, w.peerPieces.cardinality() / totalPiecesCount)
      } else if (w.peerPieces.length) {
        peerProgress = Math.min(1.0, w.peerPieces.length / totalPiecesCount)
      }
    } else if (w.downloaded && totalPiecesCount > 0) {
      peerProgress = 0.5
    }

    const speedDown = Math.round(w.downloadSpeed ? w.downloadSpeed() : w.downloadSpeed || 0)
    const speedUp = Math.round(w.uploadSpeed ? w.uploadSpeed() : w.uploadSpeed || 0)

    const flagsList: string[] = []
    if (speedDown > 0) {
      flagsList.push('D')
    } else if (w.peerChoking === false && w.amInterested === true) {
      flagsList.push('d')
    } else if (w.peerChoking === true && w.amInterested === true) {
      flagsList.push('d')
    }
    if (speedUp > 0) {
      flagsList.push('U')
    } else if (w.amChoking === false && w.peerInterested === true) {
      flagsList.push('u')
    }
    if (w._encrypted === true) flagsList.push('E')
    if (w._utp === true) flagsList.push('P')

    const extHandshake = w.peerExtendedHandshake || w.extendedHandshake
    if (extHandshake && (extHandshake as any).m && (extHandshake as any).m.ut_pex !== undefined) {
      flagsList.push('X')
    }
    const flags = flagsList.join(' ') || 'H'

    const outgoingReqs = Array.isArray(w.requests) ? w.requests.length : 0
    const incomingReqs = Array.isArray(w.peerRequests) ? w.peerRequests.length : 0
    const reqsStr = `${outgoingReqs} | ${incomingReqs}`

    const wireDownloaded = typeof w.downloaded === 'number' ? w.downloaded : 0
    const wireUploaded = typeof w.uploaded === 'number' ? w.uploaded : 0
    const peerDlSpeed = speedUp > 0 ? speedUp : 0

    let relevance = 0.0
    let isSeeder = false
    let peerPiecesCount = 0

    if (w.peerPieces && totalPiecesCount > 0) {
      peerPiecesCount = typeof w.peerPieces.cardinality === 'function'
        ? w.peerPieces.cardinality()
        : (w.peerPieces.length || 0)
      relevance = Math.round((peerPiecesCount / totalPiecesCount) * 100) / 100
      isSeeder = Boolean(w.isSeeder || peerPiecesCount === totalPiecesCount)
    } else if (w.isSeeder) {
      isSeeder = true
      relevance = 1.0
      peerPiecesCount = totalPiecesCount
    }

    const isTopTier = speedDown > 0 || (isSeeder && relevance >= 1.0)

    return {
      ip: ipStr,
      port: portNum,
      country: undefined,
      connection: connType,
      flags,
      clientName: parsePeerClientName(w),
      progress: peerProgress,
      downloadSpeed: speedDown || 0,
      uploadSpeed: speedUp || 0,
      reqs: reqsStr,
      peerDlSpeed,
      downloaded: wireDownloaded,
      uploaded: wireUploaded,
      relevance,
      choked: w.peerChoking !== undefined ? !!w.peerChoking : !!w.peerChoked,
      isTopTier,
      isSeeder,
      usefulPiecesCount: peerPiecesCount
    }
  })
}
