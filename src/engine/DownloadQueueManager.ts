import { DownloadItem } from './types'

export class DownloadQueueManager {
  private maxConcurrentDownloads: number

  constructor(maxConcurrentDownloads: number = 5) {
    this.maxConcurrentDownloads = maxConcurrentDownloads
  }

  public setMaxConcurrentDownloads(limit: number): void {
    this.maxConcurrentDownloads = limit
  }

  public getMaxConcurrentDownloads(): number {
    return this.maxConcurrentDownloads
  }

  public getNextQueuedDownloads(downloads: Map<string, DownloadItem>): DownloadItem[] {
    const list = Array.from(downloads.values())
    const activeCount = list.filter((d) => d.status === 'downloading').length

    if (activeCount >= this.maxConcurrentDownloads) {
      return []
    }

    const queued = list
      .filter((d) => d.status === 'queued')
      .sort((a, b) => {
        const priorityWeight = { high: 3, normal: 2, low: 1 }
        return priorityWeight[b.priority] - priorityWeight[a.priority]
      })

    const slotsAvailable = this.maxConcurrentDownloads - activeCount
    return queued.slice(0, slotsAvailable)
  }
}
