import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { DownloadItem, EngineSettings, SpeedSample } from './types'

export class Storage {
  private static storageDir: string
  private static downloadsFile: string
  private static settingsFile: string
  private static historyFile: string

  public static init(): void {
    const userData = app ? app.getPath('userData') : process.cwd()
    this.storageDir = path.join(userData, 'neobit_data')
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true })
    }

    this.downloadsFile = path.join(this.storageDir, 'downloads.json')
    this.settingsFile = path.join(this.storageDir, 'settings.json')
    this.historyFile = path.join(this.storageDir, 'speed_history.json')
  }

  public static loadDownloads(): DownloadItem[] {
    try {
      if (fs.existsSync(this.downloadsFile)) {
        const raw = fs.readFileSync(this.downloadsFile, 'utf8')
        return JSON.parse(raw)
      }
    } catch (err) {
      console.error('Failed to load downloads from storage:', err)
    }
    return []
  }

  public static saveDownloads(downloads: DownloadItem[]): void {
    try {
      fs.writeFileSync(this.downloadsFile, JSON.stringify(downloads, null, 2), 'utf8')
    } catch (err) {
      console.error('Failed to save downloads to storage:', err)
    }
  }

  public static loadSettings(): EngineSettings {
    const defaultSettings: EngineSettings = {
      maxConcurrentDownloads: 5,
      defaultThreadCount: 8,
      maxGlobalSpeedLimitKbps: 0,
      defaultSavePath: app ? app.getPath('downloads') : path.join(process.cwd(), 'downloads'),
      autoCategorize: true,
      enableNotifications: true,
      startOnBoot: false,
      theme: 'dark'
    }

    try {
      if (fs.existsSync(this.settingsFile)) {
        const raw = fs.readFileSync(this.settingsFile, 'utf8')
        return { ...defaultSettings, ...JSON.parse(raw) }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
    return defaultSettings
  }

  public static saveSettings(settings: EngineSettings): void {
    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify(settings, null, 2), 'utf8')
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  public static loadSpeedHistory(): SpeedSample[] {
    try {
      if (fs.existsSync(this.historyFile)) {
        const raw = fs.readFileSync(this.historyFile, 'utf8')
        return JSON.parse(raw)
      }
    } catch (err) {
      console.error('Failed to load speed history:', err)
    }
    return []
  }

  public static saveSpeedHistory(samples: SpeedSample[]): void {
    try {
      // Keep max 60 samples
      const slice = samples.slice(-60)
      fs.writeFileSync(this.historyFile, JSON.stringify(slice, null, 2), 'utf8')
    } catch (err) {
      console.error('Failed to save speed history:', err)
    }
  }
}
