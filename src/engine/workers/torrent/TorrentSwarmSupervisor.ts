import { TorrentTaskInstance } from '../TorrentWorker'

export interface PeerUsefulnessStats {
  peerAddress: string
  isSeeder: boolean
  usefulPiecesCount: number
  downloadSpeed: number
  score: number
  isTopTier: boolean
  isUseless: boolean
}

export class TorrentSwarmSupervisor {
  private static readonly MAX_TOP_PEERS = 24
  private static readonly STALL_TIMEOUT_MS = 30_000
  private static readonly USELESS_GRACE_PERIOD_MS = 15_000

  // Wire connect timestamps to grant initial grace periods for handshakes and bitfield exchanges
  private static readonly wireConnectTimes = new WeakMap<object, number>()
  private static readonly wireLastDataTimes = new WeakMap<object, number>()

  /**
   * Evaluates the usefulness of a peer wire based on whether they possess
   * pieces that we still need to download.
   */
  public static evaluatePeerUsefulness(
    wire: any,
    torrent: TorrentTaskInstance
  ): { isSeeder: boolean; usefulPiecesCount: number; isUseless: boolean } {
    if (!wire || !torrent) {
      return { isSeeder: false, usefulPiecesCount: 0, isUseless: true }
    }

    // 1. Check if peer is a complete seeder
    const isSeeder = Boolean(wire.isSeeder || wire.peerPieces?.cardinality?.() === torrent.pieces?.length)
    if (isSeeder) {
      const missingCount = torrent.pieces ? torrent.pieces.filter((p) => p !== null).length : 1
      return {
        isSeeder: true,
        usefulPiecesCount: missingCount,
        isUseless: missingCount === 0 // only useless if torrent is already 100% complete
      }
    }

    // 2. Check if we have missing pieces that this peer possesses
    if (!torrent.pieces || !torrent.bitfield) {
      return { isSeeder: false, usefulPiecesCount: 0, isUseless: false }
    }

    let usefulCount = 0
    const totalPieces = torrent.pieces.length

    if (wire.peerPieces && typeof wire.peerPieces.get === 'function') {
      for (let i = 0; i < totalPieces; i++) {
        // If we DON'T have this piece yet, but the peer DOES have it
        if (!torrent.bitfield.get(i) && wire.peerPieces.get(i)) {
          usefulCount++
        }
      }
    }

    const isUseless = usefulCount === 0
    return { isSeeder: false, usefulPiecesCount: usefulCount, isUseless }
  }

  /**
   * Performs an optimization pass over the connected wires of a torrent:
   * 1. Evaluates piece usefulness (ignores peers with 0 needed pieces)
   * 2. Ranks peers by sustained download speed & piece availability
   * 3. Designates the Top 24 fastest useful seeders/peers
   * 4. Prunes dead, stalled (0 KB/s for >30s), or completely useless peers to cycle DHT/PEX slots
   */
  public static optimizeSwarm(torrent: TorrentTaskInstance): PeerUsefulnessStats[] {
    if (!torrent || torrent.destroyed || !torrent.wires || torrent.wires.length === 0) {
      return []
    }

    const now = Date.now()
    const wires = torrent.wires as any[]
    const statsList: PeerUsefulnessStats[] = []

    // Map each wire with connect timestamp & data tracking
    for (const wire of wires) {
      if (!this.wireConnectTimes.has(wire)) {
        this.wireConnectTimes.set(wire, now)
        this.wireLastDataTimes.set(wire, now)
      }

      const speed = typeof wire.downloadSpeed === 'function' ? wire.downloadSpeed() : 0
      if (speed > 0) {
        this.wireLastDataTimes.set(wire, now)
      }
    }

    // Evaluate usefulness and compute rank score
    const evaluatedWires = wires.map((wire) => {
      const { isSeeder, usefulPiecesCount, isUseless } = this.evaluatePeerUsefulness(wire, torrent)
      const downloadSpeed = typeof wire.downloadSpeed === 'function' ? wire.downloadSpeed() : 0
      const connectTime = this.wireConnectTimes.get(wire) || now
      const lastDataTime = this.wireLastDataTimes.get(wire) || now
      const timeSinceConnect = now - connectTime
      const timeSinceLastData = now - lastDataTime

      // Score formula: high download speed weighted by piece availability
      // Useless peers receive a score of 0
      let score = 0
      if (!isUseless) {
        score = downloadSpeed + (isSeeder ? 1024 : Math.min(usefulPiecesCount * 10, 512))
      }

      const remoteAddr = wire.remoteAddress ? `${wire.remoteAddress}:${wire.remotePort || 6881}` : 'Unknown'

      return {
        wire,
        remoteAddr,
        isSeeder,
        usefulPiecesCount,
        isUseless,
        downloadSpeed,
        score,
        timeSinceConnect,
        timeSinceLastData
      }
    })

    // Sort descending by score (fastest & most useful first)
    evaluatedWires.sort((a, b) => b.score - a.score)

    // Designate Top 24 useful peers
    const topTierSet = new Set(
      evaluatedWires
        .filter((w) => !w.isUseless && w.score > 0)
        .slice(0, this.MAX_TOP_PEERS)
        .map((w) => w.wire)
    )

    // Build stats and prune dead/useless wires
    const wiresToPrune: any[] = []

    for (const item of evaluatedWires) {
      const isTopTier = topTierSet.has(item.wire)

      statsList.push({
        peerAddress: item.remoteAddr,
        isSeeder: item.isSeeder,
        usefulPiecesCount: item.usefulPiecesCount,
        downloadSpeed: item.downloadSpeed,
        score: item.score,
        isTopTier,
        isUseless: item.isUseless
      })

      // Check if wire should be pruned:
      // Condition A: Peer has 0 needed pieces and has been connected past grace period without uploading
      const isUselessAndPastGrace = item.isUseless && item.timeSinceConnect > this.USELESS_GRACE_PERIOD_MS && item.downloadSpeed === 0

      // Condition B: Peer has needed pieces but has been completely stalled (0 KB/s) for >30s while we have >30 other peers
      const isStalledAndExcess = !item.isUseless && item.timeSinceLastData > this.STALL_TIMEOUT_MS && evaluatedWires.length > 35 && item.downloadSpeed === 0

      if (isUselessAndPastGrace || isStalledAndExcess) {
        wiresToPrune.push(item.wire)
      }
    }

    // Safely prune stalled/useless wires to trigger DHT/PEX discovery of fresh candidates
    // Limit pruning to at most 3 peers per cycle to avoid thrashing
    const pruneBatch = wiresToPrune.slice(0, 3)
    for (const wire of pruneBatch) {
      try {
        if (typeof wire.destroy === 'function' && !wire.destroyed) {
          wire.destroy()
        }
      } catch {
        /* ignore */
      }
    }

    return statsList
  }
}
