import { EventEmitter } from 'events'
import { DownloadItem, SpeedSample } from './types'
import { Storage } from './Storage'

export class StatsCollector extends EventEmitter {
  private speedHistory: SpeedSample[] = []
  private tickerTimer?: NodeJS.Timeout
  private tickCount: number = 0

  constructor(initialHistory: SpeedSample[] = []) {
    super()
    if (initialHistory.length > 0) {
      this.speedHistory = [...initialHistory]
    } else {
      this.speedHistory = Storage.loadSpeedHistory()
    }
  }

  public start(getDownloads: () => DownloadItem[]): void {
    if (this.tickerTimer) return
    this.tickerTimer = setInterval(() => {
      const downloads = getDownloads()
      const activeDownloads = downloads.filter((d) => d.status === 'downloading' || d.status === 'seeding')
      const totalDlSpeed = activeDownloads.reduce((acc, d) => acc + (d.speed || 0), 0)
      const totalUpSpeed = activeDownloads.reduce((acc, d) => acc + (d.upSpeed || 0), 0)

      const sample: SpeedSample = {
        timestamp: Date.now(),
        downloadSpeed: totalDlSpeed,
        uploadSpeed: totalUpSpeed
      }

      this.speedHistory.push(sample)
      if (this.speedHistory.length > 60) {
        this.speedHistory.shift()
      }

      this.tickCount++
      if (this.tickCount % 5 === 0) {
        Storage.saveSpeedHistory(this.speedHistory).catch(() => {})
      }

      this.emit('tick', sample)
    }, 1000)
  }

  public getHistory(): SpeedSample[] {
    return [...this.speedHistory]
  }

  public stop(): void {
    if (this.tickerTimer) {
      clearInterval(this.tickerTimer)
      this.tickerTimer = undefined
      Storage.saveSpeedHistory(this.speedHistory).catch(() => {})
    }
  }
}
