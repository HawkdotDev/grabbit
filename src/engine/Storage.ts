import * as fs from 'fs'
import * as path from 'path'
import { DownloadItem, EngineSettings, SpeedSample } from './types'

function getAppPath(name: 'userData' | 'downloads'): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const electron = require('electron')
    const appObj = electron?.app || electron?.default?.app
    if (appObj && typeof appObj.getPath === 'function') {
      return appObj.getPath(name)
    }
  } catch {
    // Fallback when executed outside Electron environment
  }
  return name === 'userData' ? process.cwd() : path.join(process.cwd(), 'downloads')
}

export class Storage {
  private static storageDir: string
  private static downloadsFile: string
  private static settingsFile: string
  private static historyFile: string
  private static pluginsFile: string
  private static automationsFile: string
  private static saveTimeout?: NodeJS.Timeout
  private static pendingDownloads?: DownloadItem[]

  public static init(): void {
    const userData = getAppPath('userData')
    this.storageDir = path.join(userData, 'grabbit_data')
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true })
    }

    this.downloadsFile = path.join(this.storageDir, 'downloads.json')
    this.settingsFile = path.join(this.storageDir, 'settings.json')
    this.historyFile = path.join(this.storageDir, 'speed_history.json')
    this.pluginsFile = path.join(this.storageDir, 'plugins.json')
    this.automationsFile = path.join(this.storageDir, 'automations.json')
  }

  public static loadPlugins<T>(defaultPlugins: T[]): T[] {
    if (!this.storageDir) this.init()
    try {
      if (fs.existsSync(this.pluginsFile)) {
        const raw = fs.readFileSync(this.pluginsFile, 'utf8').trim()
        if (raw) return JSON.parse(raw)
      }
    } catch {
      // Return defaults on parse error
    }
    return defaultPlugins
  }

  public static async savePlugins<T>(plugins: T[]): Promise<void> {
    if (!this.storageDir) this.init()
    try {
      fs.writeFileSync(this.pluginsFile, JSON.stringify(plugins, null, 2), 'utf8')
    } catch (err) {
      console.error('Failed to save plugins:', err)
    }
  }

  public static loadAutomations<T>(defaultRules: T[]): T[] {
    if (!this.storageDir) this.init()
    try {
      if (fs.existsSync(this.automationsFile)) {
        const raw = fs.readFileSync(this.automationsFile, 'utf8').trim()
        if (raw) return JSON.parse(raw)
      }
    } catch {
      // Return defaults on parse error
    }
    return defaultRules
  }

  public static async saveAutomations<T>(rules: T[]): Promise<void> {
    if (!this.storageDir) this.init()
    try {
      fs.writeFileSync(this.automationsFile, JSON.stringify(rules, null, 2), 'utf8')
    } catch (err) {
      console.error('Failed to save automations:', err)
    }
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
    const defaultSettings: EngineSettings = {
      maxConcurrentDownloads: 5,
      defaultThreadCount: 8,
      maxGlobalSpeedLimitKbps: 0,
      defaultSavePath: getAppPath('downloads'),
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
