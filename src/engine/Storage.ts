import * as fs from 'fs'
import * as path from 'path'
import { DownloadItem, EngineSettings, SpeedSample } from './types'

function getElectronApp(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { app } = require('electron')
    return app
  } catch {
    return null
  }
}

export class Storage {
  private static storageDir: string
  private static downloadsFile: string
  private static settingsFile: string
  private static historyFile: string
  private static saveTimeout?: NodeJS.Timeout
  private static pendingDownloads?: DownloadItem[]

  public static init(): void {
    let userData = process.cwd()
    try {
      const app = getElectronApp()
      if (app && typeof app.getPath === 'function') {
        userData = app.getPath('userData')
      }
    } catch {
      userData = process.cwd()
    }
    this.storageDir = path.join(userData, 'grabbit_data')
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

  /**
   * Save downloads immediately asynchronously.
   */
  public static async saveDownloads(downloads: DownloadItem[]): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = undefined
    }
    this.pendingDownloads = undefined
    try {
      await fs.promises.writeFile(this.downloadsFile, JSON.stringify(downloads, null, 2), 'utf8')
    } catch (err) {
      console.error('Failed to save downloads asynchronously:', err)
    }
  }

  /**
   * Debounced save for high-frequency progress ticks.
   */
  public static saveDownloadsDebounced(downloads: DownloadItem[], delayMs: number = 1000): void {
    this.pendingDownloads = downloads
    if (this.saveTimeout) return

    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = undefined
      if (this.pendingDownloads) {
        const data = this.pendingDownloads
        this.pendingDownloads = undefined
        fs.promises
          .writeFile(this.downloadsFile, JSON.stringify(data, null, 2), 'utf8')
          .catch((err) => {
            console.error('Failed to save debounced downloads:', err)
          })
      }
    }, delayMs)
  }

  public static loadSettings(): EngineSettings {
    const app = getElectronApp()
    const defaultSettings: EngineSettings = {
      maxConcurrentDownloads: 5,
      defaultThreadCount: 8,
      maxGlobalSpeedLimitKbps: 0,
      defaultSavePath:
        app && typeof app.getPath === 'function'
          ? app.getPath('downloads')
          : path.join(process.cwd(), 'downloads'),
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

  public static async saveSettings(settings: EngineSettings): Promise<void> {
    try {
      await fs.promises.writeFile(this.settingsFile, JSON.stringify(settings, null, 2), 'utf8')
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

  public static async saveSpeedHistory(samples: SpeedSample[]): Promise<void> {
    try {
      const slice = samples.slice(-60)
      await fs.promises.writeFile(this.historyFile, JSON.stringify(slice, null, 2), 'utf8')
    } catch (err) {
      console.error('Failed to save speed history:', err)
    }
  }
}
