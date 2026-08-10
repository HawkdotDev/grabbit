import { DownloadItem, DownloadPriority } from './types'

export interface QueueStatistics {
  active: number
  queued: number
  paused: number
  completed: number
  error: number
  total: number
}

export class DownloadQueueManager {
  private maxConcurrentDownloads: number

  constructor(maxConcurrentDownloads: number = 5) {
    this.maxConcurrentDownloads = maxConcurrentDownloads
  }

  public setMaxConcurrentDownloads(limit: number): void {
    this.maxConcurrentDownloads = Math.max(1, limit)
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

    const priorityWeight: Record<DownloadPriority, number> = { high: 3, normal: 2, low: 1 }

    const queued = list
      .filter((d) => d.status === 'queued')
      .sort((a, b) => {
        const weightDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2)
        if (weightDiff !== 0) return weightDiff
        // If equal priority, use FIFO (older createdAt first)
        return (a.createdAt || 0) - (b.createdAt || 0)
      })

    const slotsAvailable = Math.max(0, this.maxConcurrentDownloads - activeCount)
    return queued.slice(0, slotsAvailable)
  }

  public getQueueStats(downloads: Map<string, DownloadItem>): QueueStatistics {
    const list = Array.from(downloads.values())
    let active = 0
    let queued = 0
    let paused = 0
    let completed = 0
    let error = 0

    for (const item of list) {
      switch (item.status) {
        case 'downloading':
          active++
          break
        case 'queued':
          queued++
          break
        case 'paused':
          paused++
          break
        case 'completed':
          completed++
          break
        case 'error':
          error++
          break
      }
    }

    return {
      active,
      queued,
      paused,
      completed,
      error,
      total: list.length
    }
  }

  public promoteQueueItem(downloads: Map<string, DownloadItem>, id: string): boolean {
    const item = downloads.get(id)
    if (!item) return false

    if (item.priority === 'low') {
      item.priority = 'normal'
      return true
    } else if (item.priority === 'normal') {
      item.priority = 'high'
      return true
    }
    return false
  }

  public demoteQueueItem(downloads: Map<string, DownloadItem>, id: string): boolean {
    const item = downloads.get(id)
    if (!item) return false

    if (item.priority === 'high') {
      item.priority = 'normal'
      return true
    } else if (item.priority === 'normal') {
      item.priority = 'low'
      return true
    }
    return false
  }
}
