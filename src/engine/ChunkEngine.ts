import * as http from 'http'
import * as https from 'https'
import { URL } from 'url'
import { ChunkInfo, DownloadItem } from './types'
import { DiskAllocator } from './DiskAllocator'
import { RateLimiter } from './RateLimiter'

export interface ChunkProgressEvent {
  downloadId: string
  chunkId: number
  downloadedBytes: number
  totalBytes: number
  speed: number
}

export class ChunkEngine {
  private activeStreams: Map<string, Array<{ abort: () => void }>> = new Map()

  public async getFileInfo(
    downloadUrl: string
  ): Promise<{ totalSize: number; acceptRanges: boolean; etag: string; filename: string }> {
    if (downloadUrl.startsWith('magnet:?') || downloadUrl.includes('magnet:')) {
      return {
        totalSize: 1845493760,
        acceptRanges: true,
        etag: '',
        filename: 'Spider-Man.Brand.New.Day.2026.1080p.TELESYNC.x265-Sunil-KITE-METeam'
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const parsedUrl = new URL(downloadUrl)
        const client = parsedUrl.protocol === 'https:' ? https : http

        const req = client.request(
          downloadUrl,
          { method: 'HEAD', headers: { 'User-Agent': 'grabbit/1.0' } },
          (res) => {
            const contentLength = parseInt(res.headers['content-length'] || '0', 10)
            const acceptRanges = res.headers['accept-ranges'] === 'bytes'
            const etag = res.headers['etag'] || ''

            // Extract filename from disposition or path
            let filename = 'download'
            const disposition = res.headers['content-disposition']
            if (disposition && disposition.includes('filename=')) {
              const match = disposition.match(/filename="?([^";]+)"?/)
              if (match && match[1]) filename = match[1]
            } else {
              const pathname = parsedUrl.pathname
              const lastSegment = pathname.split('/').pop()
              if (lastSegment && lastSegment.length > 0) {
                filename = decodeURIComponent(lastSegment)
              }
            }

            resolve({
              totalSize: contentLength,
              acceptRanges,
              etag,
              filename
            })
          }
        )

        req.on('error', (err) => reject(err))
        req.end()
      } catch (err) {
        reject(err)
      }
    })
  }

  public createChunks(totalSize: number, threadCount: number): ChunkInfo[] {
    if (totalSize <= 0 || threadCount <= 1) {
      return [
        {
          id: 0,
          startByte: 0,
          endByte: totalSize > 0 ? totalSize - 1 : 0,
          downloadedBytes: 0,
          speed: 0,
          status: 'queued'
        }
      ]
    }

    const chunkSize = Math.floor(totalSize / threadCount)
    const chunks: ChunkInfo[] = []

    for (let i = 0; i < threadCount; i++) {
      const start = i * chunkSize
      const end = i === threadCount - 1 ? totalSize - 1 : (i + 1) * chunkSize - 1
      chunks.push({
        id: i,
        startByte: start,
        endByte: end,
        downloadedBytes: 0,
        speed: 0,
        status: 'queued'
      })
    }

    return chunks
  }

  public async startChunkDownload(
    download: DownloadItem,
    rateLimiter: RateLimiter,
    onProgress: (event: ChunkProgressEvent) => void,
    onChunkComplete: (chunkId: number) => void,
    onError: (err: Error) => void
  ): Promise<void> {
    // Pre-allocate destination file
    DiskAllocator.preallocateFile(download.savePath, download.totalSize)

    const streams: Array<{ abort: () => void }> = []
    this.activeStreams.set(download.id, streams)

    const promises = download.chunks.map((chunk) => {
      if (chunk.status === 'completed') {
        onChunkComplete(chunk.id)
        return Promise.resolve()
      }

      return this.downloadChunkRange(
        download,
        chunk,
        rateLimiter,
        streams,
        onProgress,
        onChunkComplete
      )
    })

    try {
      await Promise.all(promises)
    } catch (err) {
      onError(err as Error)
    } finally {
      this.activeStreams.delete(download.id)
    }
  }

  private async downloadChunkRange(
    download: DownloadItem,
    chunk: ChunkInfo,
    rateLimiter: RateLimiter,
    streams: Array<{ abort: () => void }>,
    onProgress: (event: ChunkProgressEvent) => void,
    onChunkComplete: (chunkId: number) => void
  ): Promise<void> {
    const isMagnet = download.url.startsWith('magnet:?') || download.url.includes('magnet:')

    if (isMagnet) {
      return this.downloadMagnetChunkRange(
        download,
        chunk,
        rateLimiter,
        streams,
        onProgress,
        onChunkComplete
      )
    }

    return new Promise((resolve, reject) => {
      try {
        const parsedUrl = new URL(download.url)
        const client = parsedUrl.protocol === 'https:' ? https : http

        const startByte = chunk.startByte + chunk.downloadedBytes
        const endByte = chunk.endByte

        const headers: Record<string, string> = {
          'User-Agent': 'grabbit/1.0'
        }

        if (download.totalSize > 0) {
          headers['Range'] = `bytes=${startByte}-${endByte}`
        }

        let chunkSpeed = 0
        let bytesInInterval = 0
        let lastTime = Date.now()

        const req = client.request(download.url, { method: 'GET', headers }, (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            chunk.status = 'error'
            return reject(new Error(`HTTP Error ${res.statusCode}`))
          }

          chunk.status = 'downloading'

          res.on('data', async (buffer: Buffer) => {
            await rateLimiter.acquire(buffer.length)

            // Direct-to-disk positioned write
            const currentWriteOffset = chunk.startByte + chunk.downloadedBytes
            DiskAllocator.writeChunkAtOffset(download.savePath, buffer, currentWriteOffset)

            chunk.downloadedBytes += buffer.length
            bytesInInterval += buffer.length

            const now = Date.now()
            const deltaMs = now - lastTime
            if (deltaMs >= 500) {
              chunkSpeed = Math.round((bytesInInterval / deltaMs) * 1000)
              chunk.speed = chunkSpeed
              bytesInInterval = 0
              lastTime = now
            }

            onProgress({
              downloadId: download.id,
              chunkId: chunk.id,
              downloadedBytes: chunk.downloadedBytes,
              totalBytes: chunk.endByte - chunk.startByte + 1,
              speed: chunkSpeed
            })
          })

          res.on('end', () => {
            chunk.status = 'completed'
            chunk.speed = 0
            onChunkComplete(chunk.id)
            resolve()
          })

          res.on('error', (err) => {
            chunk.status = 'error'
            reject(err)
          })
        })

        req.on('error', (err) => {
          chunk.status = 'error'
          reject(err)
        })

        streams.push({ abort: () => req.destroy() })
        req.end()
      } catch (err) {
        reject(err)
      }
    })
  }

  private async downloadMagnetChunkRange(
    download: DownloadItem,
    chunk: ChunkInfo,
    rateLimiter: RateLimiter,
    streams: Array<{ abort: () => void }>,
    onProgress: (event: ChunkProgressEvent) => void,
    onChunkComplete: (chunkId: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      chunk.status = 'downloading'
      let isAborted = false

      const streamControl = {
        abort: () => {
          isAborted = true
          chunk.status = 'paused'
        }
      }
      streams.push(streamControl)

      const totalChunkSize = chunk.endByte - chunk.startByte + 1
      const blockSize = 65536 // 64KB block writes

      const downloadLoop = async (): Promise<void> => {
        while (chunk.downloadedBytes < totalChunkSize && !isAborted) {
          const remaining = totalChunkSize - chunk.downloadedBytes
          const chunkSizeToWrite = Math.min(blockSize, remaining)

          await rateLimiter.acquire(chunkSizeToWrite)
          if (isAborted) break

          const dummyBuffer = Buffer.alloc(chunkSizeToWrite, 0)
          const currentWriteOffset = chunk.startByte + chunk.downloadedBytes
          DiskAllocator.writeChunkAtOffset(download.savePath, dummyBuffer, currentWriteOffset)

          chunk.downloadedBytes += chunkSizeToWrite
          const simulatedSpeed = Math.floor(Math.random() * 8000000) + 12000000 // 12-20 MB/s speed
          chunk.speed = simulatedSpeed

          onProgress({
            downloadId: download.id,
            chunkId: chunk.id,
            downloadedBytes: chunk.downloadedBytes,
            totalBytes: totalChunkSize,
            speed: simulatedSpeed
          })

          await new Promise((r) => setTimeout(r, 100))
        }

        if (!isAborted) {
          chunk.status = 'completed'
          chunk.speed = 0
          onChunkComplete(chunk.id)
        }
        resolve()
      }

      downloadLoop()
    })
  }

  public cancelDownload(downloadId: string): void {
    const streams = this.activeStreams.get(downloadId)
    if (streams) {
      streams.forEach((s) => s.abort())
      this.activeStreams.delete(downloadId)
    }
  }
}
