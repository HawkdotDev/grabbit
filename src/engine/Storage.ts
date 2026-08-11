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
        if (!raw || !raw.trim()) return []
        return JSON.parse(raw)
      }
    } catch {
      // Fallback cleanly to empty array on parse errors or concurrency races
    }
    return []
  }

  public static async saveDownloads(downloads: DownloadItem[]): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = undefined
    }
    this.pendingDownloads = undefined
    try {
      const tmpFile = `${this.downloadsFile}.tmp`
      await fs.promises.writeFile(tmpFile, JSON.stringify(downloads, null, 2), 'utf8')
      await fs.promises.rename(tmpFile, this.downloadsFile)
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
        const tmpFile = `${this.downloadsFile}.tmp`
        fs.promises
          .writeFile(tmpFile, JSON.stringify(data, null, 2), 'utf8')
          .then(() => fs.promises.rename(tmpFile, this.downloadsFile))
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
      theme: 'dark',
      enableAdaptiveQoS: true,
      enableRpcServer: true,
      rpcPort: 6800,
      rpcSecretToken: 'gbt_secret_rpc',
      proxyEnabled: false,
      proxyType: 'none',
      proxyHost: '127.0.0.1',
      proxyPort: 8080,
      categorySpeedLimitsKbps: {},
      enableDoH: true,
      dohProvider: 'cloudflare',
      customDoHUrl: 'https://1.1.1.1/dns-query',
      enableWarp: false,
      warpEndpoint: '127.0.0.1:4001',
      stripReferrer: true,
      customUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      forceTorrentEncryption: true,
      disableP2PTracking: false,

      // Behavior Defaults
      uiLanguage: 'English',
      startOnStartup: false,
      showSplashScreen: true,
      startMinimized: false,
      showLanguageOption: true,
      confirmDeleteTorrents: true,
      confirmExit: true,
      showStatusBar: true,
      showNavigationBar: true,
      alternatingRowColors: true,
      showTrayIcon: true,
      minimizeToTray: true,
      closeToTray: true,
      minimizeToNotificationAreaOnMinimize: true,
      enableLogFile: false,
      logPath: '',
      backupLogOnRestart: false,
      deleteLogOlderThan: 30,
      deleteLogOlderThanUnit: 'days',
      maxLogFileSize: 5,
      maxLogFileSizeUnit: 'MiB',
      enablePerformanceWarnings: true,
      inhibitSleep: false,
      inhibitSleepOnlyDownloading: false,
      inhibitSleepOnlySeeding: false,
      notifyOnTorrentCompletion: true,
      notifyOnTorrentAddition: true,

      // Downloads Defaults
      displayTorrentContentAndOptions: true,
      displayTorrentOptionsForMagnet: true,
      doNotStartDownloadAuto: false,
      deleteTorrentFileAfterward: 'never',
      keepIncompleteTorrentsInEnabled: false,
      keepIncompleteTorrentsPath: '',
      copyTorrentFilesToEnabled: false,
      copyTorrentFilesPath: '',
      copyFinishedTorrentFilesToEnabled: false,
      copyFinishedTorrentFilesPath: '',
      defaultTorrentManagementMode: 'automatic',
      whenCategoryChanged: 'relocate',
      whenDefaultSavePathChanged: 'relocate',
      whenCategorySavePathChanged: 'relocate',
      autoImportFolders: [],
      excludedFileExtensions: '*.unwanted; *.txt',
      sendEmailNotification: false,
      emailFrom: '',
      emailTo: '',
      smtpServer: 'smtp.gmail.com',
      smtpAuthRequired: true,
      smtpUsername: '',
      smtpPassword: '',
      runProgramOnCompletionEnabled: false,
      runProgramOnCompletionCmd: '',
      runProgramOnAddedEnabled: false,
      runProgramOnAddedCmd: '',

      // Connection Defaults
      incomingPort: 8999,
      useUPnP: true,
      useDifferentPortOnStartup: false,
      globalMaxConnectionsEnabled: true,
      globalMaxConnections: 500,
      maxConnectionsPerTorrentEnabled: true,
      maxConnectionsPerTorrent: 100,
      globalMaxUploadSlotsEnabled: true,
      globalMaxUploadSlots: 20,
      maxUploadSlotsPerTorrentEnabled: true,
      maxUploadSlotsPerTorrent: 4,
      peerProtocol: 'TCP and μTP',
      proxyAuthRequired: false,
      proxyUsername: '',
      proxyPassword: '',
      proxyPeerConnections: true,
      proxyWebSeeds: true,
      proxyHostnameLookup: true,
      proxyOnlyForTorrents: true,
      ipFilterPath: '',
      ipFilterApplyToTrackers: true,
      bannedIps: [],

      // Speed Defaults
      globalUploadLimitKbps: 0,
      globalDownloadLimitKbps: 0,
      altUploadLimitKbps: 100,
      altDownloadLimitKbps: 1000,
      scheduleAltRateLimits: false,
      altRateLimitsFrom: '08:00',
      altRateLimitsTo: '20:00',
      altRateLimitsDays: 'everyday',
      applyLimitToTransportOverhead: false,
      applyLimitToUTP: true,
      applyLimitToLanPeers: false,

      // BitTorrent Defaults
      enableDHT: true,
      enablePeX: true,
      enableLSD: true,
      encryptionMode: 'allow',
      enableAnonymousMode: false,
      maxActiveDownloadsEnabled: true,
      maxActiveDownloads: 5,
      maxActiveUploadsEnabled: true,
      maxActiveUploads: 5,
      maxActiveTorrentsEnabled: true,
      maxActiveTorrents: 8,
      dontCountSlowTorrents: false,
      downloadRateThresholdKbps: 2,
      uploadRateThresholdKbps: 2,
      torrentInactivityTimerSec: 60,
      seedingRatioLimitEnabled: false,
      seedingRatioLimit: 1.5,
      seedingTimeLimitEnabled: false,
      seedingTimeLimitMin: 1440,
      inactiveTimeLimitEnabled: false,
      inactiveTimeLimitMin: 1440,
      seedingLimitAction: 'pause',
      autoTorrentManagementRatioRule: 'global',

      // RSS Defaults
      enableFetchingRss: true,
      rssRefreshIntervalMin: 30,
      rssMaxArticlesPerFeed: 50,
      enableAutoDownloadingRss: true,
      enableSmartEpisodeFilter: true,
      rssAutoDownloadRules: [],

      // Web UI Defaults
      enableWebUi: false,
      webUiIpAddress: '*',
      webUiPort: 8080,
      webUiUseUPnP: false,
      webUiUseHttps: false,
      webUiCertPath: '',
      webUiKeyPath: '',
      webUiUsername: 'admin',
      webUiPassword: '',
      webUiBypassLocalhost: true,
      webUiBypassSubnetsEnabled: false,
      webUiSubnetWhitelist: '192.168.1.0/24',
      webUiMaxAuthFailures: 5,
      webUiBanDurationSec: 3600,
      enableCsrfProtection: true,
      enableClickjackingProtection: true,
      enableHostHeaderValidation: true,
      webUiServerDomains: 'localhost',
      useAltWebUi: false,
      altWebUiFilesLocation: '',

      // Advanced Defaults
      networkInterface: 'Any interface',
      listenOnIPv6: true,
      processMemoryPriority: 'below_normal',
      saveResumeDataIntervalMin: 60,
      confirmTorrentRecheck: true,
      recheckOnCompletion: false,
      checkForUpdates: true,
      transferListRefreshIntervalMs: 1500,
      resolvePeerHostnames: false,
      resolvePeerCountries: true,
      displayPeerListWithIcons: true,
      displayNotifications: true,
      displayNotificationsForAdded: true,
      confirmRemoveAllTags: true,
      downloadTrackerFavicon: true,
      savePathHistoryLength: 10,
      enableSpeedGraphs: true,
      enableIconsInMenus: true,
      trackerStatusColors: {
        working: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        disabled: '#64748b'
      },
      enableEmbeddedTracker: false,
      embeddedTrackerPort: 9000,
      embeddedTrackerUrl: '',
      asyncIoThreads: 4,
      hashingThreads: 2,
      filePoolSize: 40,
      outstandingMemoryLowWatermarkMb: 10,
      outstandingMemoryHighWatermarkMb: 500,
      diskCacheMb: -1,
      diskCacheExpirySec: 60,
      diskIoType: 'default',
      diskIoReadMode: 'enable_os_cache',
      diskIoWriteMode: 'enable_os_cache',
      coalesceReadsWrites: true,
      pieceExtentAffinity: false,
      sendUploadPieceReadHint: true,
      sendBufferWatermarkKb: 500,
      sendBufferLowWatermarkKb: 10,
      sendBufferWatermarkFactorPct: 50,
      socketBacklogSize: 50,
      outgoingPortsMin: 0,
      outgoingPortsMax: 0,
      upnpLeaseDurationSec: 0,
      allowMultipleConnectionsPerIp: false,
      validateHttpsTrackerCertificates: true,
      uploadChokingAlgorithm: 'fastest_upload',
      uploadSlotsBehavior: 'fixed_slots',
      chokingAlgorithm: 'fixed_slots'
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
