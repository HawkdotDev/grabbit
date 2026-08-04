import { EventEmitter } from 'events'
import { DownloadItem, SpeedSample } from './types'

export class StatsCollector extends EventEmitter {
  private speedHistory: SpeedSample[] = []
  private tickerTimer?: NodeJS.Timeout

  constructor(initialHistory: SpeedSample[] = []) {
    super()
    this.speedHistory = [...initialHistory]
  }

  public start(getDownloads: () => DownloadItem[]): void {
    if (this.tickerTimer) return
    this.tickerTimer = setInterval(() => {
      const activeDownloads = getDownloads().filter((d) => d.status === 'downloading')
      const totalSpeed = activeDownloads.reduce((acc, d) => acc + (d.speed || 0), 0)

      const sample: SpeedSample = {
        timestamp: Date.now(),
        downloadSpeed: totalSpeed,
        uploadSpeed: 0
      }

      this.speedHistory.push(sample)
      if (this.speedHistory.length > 60) {
        this.speedHistory.shift()
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
    }
  }
}
