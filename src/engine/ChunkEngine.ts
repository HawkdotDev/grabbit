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
    downloadUrl: string,
    redirectCount = 0
  ): Promise<{ totalSize: number; acceptRanges: boolean; etag: string; filename: string }> {
    if (redirectCount > 5) {
      throw new Error('Too many HTTP redirects')
    }

    return new Promise((resolve, reject) => {
      try {
        const parsedUrl = new URL(downloadUrl)
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return reject(new Error(`Unsupported protocol: ${parsedUrl.protocol}`))
        }
        const client = parsedUrl.protocol === 'https:' ? https : http

        const req = client.request(
          downloadUrl,
          { method: 'HEAD', headers: { 'User-Agent': 'grabbit/1.0' } },
          (res) => {
            // Follow HTTP redirects (301, 302, 303, 307, 308)
            if (
              res.statusCode &&
              [301, 302, 303, 307, 308].includes(res.statusCode) &&
              res.headers.location
            ) {
              const redirectUrl = new URL(res.headers.location, downloadUrl).toString()
              return resolve(this.getFileInfo(redirectUrl, redirectCount + 1))
            }

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
    onChunkComplete: (chunkId: number) => void,
    targetUrl?: string,
    redirectCount = 0
  ): Promise<void> {
    if (redirectCount > 5) {
      throw new Error('Too many HTTP redirects during chunk download')
    }
    const currentUrl = targetUrl || download.url

    return new Promise((resolve, reject) => {
      try {
        const parsedUrl = new URL(currentUrl)
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

        const req = client.request(currentUrl, { method: 'GET', headers }, (res) => {
          if (
            res.statusCode &&
            [301, 302, 303, 307, 308].includes(res.statusCode) &&
            res.headers.location
          ) {
            const redirectUrl = new URL(res.headers.location, currentUrl).toString()
            return resolve(
              this.downloadChunkRange(
                download,
                chunk,
                rateLimiter,
                streams,
                onProgress,
                onChunkComplete,
                redirectUrl,
                redirectCount + 1
              )
            )
          }

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

  public cancelDownload(downloadId: string): void {
    const streams = this.activeStreams.get(downloadId)
    if (streams) {
      streams.forEach((s) => s.abort())
      this.activeStreams.delete(downloadId)
    }
  }
}
