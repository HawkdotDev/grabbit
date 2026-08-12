import { ChunkInfo } from '../../types'
import { TorrentTaskInstance } from '../TorrentWorker'

export interface PieceTelemetryResult {
  chunks: ChunkInfo[]
  pieceMap: number[]
  availabilityMap: number[]
  availability: number
}

export class TorrentPieceManager {
  public static calculateChunks(torrent: TorrentTaskInstance): ChunkInfo[] {
    const totalSize = torrent.length || 0
    const totalPiecesCount = torrent.pieces ? torrent.pieces.length : 0
    const virtualBlocks = totalPiecesCount > 0 ? Math.min(32, totalPiecesCount) : 32
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
      const prog = torrent.progress || 0
      const downloadedBytesTotal = Math.round(prog * totalSize)
      const blockByteSize = Math.max(1, Math.floor(totalSize / virtualBlocks))

      for (let b = 0; b < virtualBlocks; b++) {
        const startByte = b * blockByteSize
        const endByte = b === virtualBlocks - 1 ? totalSize - 1 : (b + 1) * blockByteSize - 1
        const sliceByteSize = Math.max(1, endByte - startByte + 1)

        let sliceDownloadedBytes = 0
        if (downloadedBytesTotal >= endByte + 1) {
          sliceDownloadedBytes = sliceByteSize
        } else if (downloadedBytesTotal > startByte) {
          sliceDownloadedBytes = downloadedBytesTotal - startByte
        }

        const isDone = sliceDownloadedBytes === sliceByteSize || prog === 1
        const isDownloading = sliceDownloadedBytes > 0 && !isDone
        const status = isDone ? 'completed' : isDownloading ? 'downloading' : 'queued'

        chunks.push({
          id: b,
          startByte,
          endByte,
          downloadedBytes: sliceDownloadedBytes,
          speed: isDone ? 0 : Math.round(torrent.downloadSpeed / virtualBlocks),
          status
        })
      }
    }

    return chunks
  }

  public static calculateBitfields(
    torrent: TorrentTaskInstance,
    wiresList: any[],
    seedersCount: number
  ): { pieceMap: number[]; availabilityMap: number[]; availability: number } {
    const numSlices = 100
    const pieceMap: number[] = new Array(numSlices).fill(0)
    const availabilityMap: number[] = new Array(numSlices).fill(0)
    let totalAvailSum = 0

    if (torrent.pieces && torrent.pieces.length > 0) {
      const totalPieces = torrent.pieces.length

      // High-efficiency pre-aggregation using typed array Uint16Array
      const peerPieceCounts = new Uint16Array(totalPieces)
      const numWires = wiresList.length
      if (numWires > 0) {
        for (let w = 0; w < numWires; w++) {
          const wire = wiresList[w] as any
          const peerPieces = wire?.peerPieces
          if (peerPieces && typeof peerPieces.get === 'function') {
            for (let p = 0; p < totalPieces; p++) {
              if (peerPieces.get(p)) {
                peerPieceCounts[p] = (peerPieceCounts[p] ?? 0) + 1
              }
            }
          }
        }
      }

      for (let s = 0; s < numSlices; s++) {
        const startIdx = Math.floor((s * totalPieces) / numSlices)
        const endIdx = Math.min(totalPieces - 1, Math.floor(((s + 1) * totalPieces) / numSlices) - 1)
        const count = Math.max(1, endIdx - startIdx + 1)

        let doneCount = 0
        let wireHaveSum = 0

        for (let p = startIdx; p <= endIdx; p++) {
          const piece = torrent.pieces[p] as { missing?: number } | undefined
          if (piece && piece.missing === 0) {
            doneCount++
          }
          wireHaveSum += peerPieceCounts[p] ?? 0
        }

        pieceMap[s] = Math.round((doneCount / count) * 100) / 100
        const baseAvail = (torrent.progress === 1 || doneCount === count) ? Math.max(1, seedersCount) : 0
        const sliceAvail = baseAvail + (count > 0 ? wireHaveSum / count : 0)
        availabilityMap[s] = Math.round(sliceAvail * 1000) / 1000
        totalAvailSum += sliceAvail
      }
    } else {
      const prog = torrent.progress || 0
      const doneSlices = Math.round(prog * numSlices)
      for (let s = 0; s < numSlices; s++) {
        pieceMap[s] = s < doneSlices ? 1.0 : 0.0
        availabilityMap[s] = prog === 1 ? Math.max(1, seedersCount) : (s < doneSlices ? 1.0 : 0.0)
      }
      totalAvailSum = prog === 1 ? Math.max(1, seedersCount) * numSlices : doneSlices
    }

    const calculatedAvailability = torrent.progress === 1
      ? Math.max(1, seedersCount)
      : Math.round((totalAvailSum / numSlices) * 1000) / 1000

    return { pieceMap, availabilityMap, availability: calculatedAvailability }
  }
}
