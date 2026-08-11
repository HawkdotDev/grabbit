import { ElectronAPI } from '@electron-toolkit/preload'
import {
  DownloadCategory,
  DownloadItem,
  DownloadPriority,
  EngineSettings,
  SpeedSample
} from '../engine/types'

export interface GrabbitAPI {
  // Downloads IPC
  getDownloads: () => Promise<DownloadItem[]>
  getAllDownloads: () => Promise<DownloadItem[]>
  addDownload: (args: {
    url: string
    filename?: string
    savePath?: string
    category?: DownloadCategory
    priority?: DownloadPriority
    threadCount?: number
    tags?: string[]
    startPaused?: boolean
    addToTopQueue?: boolean
    sequentialDownload?: boolean
    firstLastPiecesFirst?: boolean
    skipHashCheck?: boolean
    stopCondition?: 'none' | 'metadata' | 'files'
    contentLayout?: 'original' | 'subfolder' | 'nosubfolder'
    managementMode?: 'manual' | 'automatic'
  }) => Promise<DownloadItem>
  pauseDownload: (id: string) => Promise<boolean>
  resumeDownload: (id: string) => Promise<boolean>
  cancelDownload: (id: string) => Promise<boolean>
  pauseAll: () => Promise<boolean>
  resumeAll: () => Promise<boolean>
  clearCompleted: () => Promise<boolean>
  exportQueue: () => Promise<boolean>
  importQueue: () => Promise<number>

  // WebTorrent IPC
  addTorrentTracker: (id: string, trackerUrl: string) => Promise<boolean>
  removeTorrentTracker: (id: string, trackerUrl: string) => Promise<boolean>
  addTorrentPeer: (id: string, peerAddress: string) => Promise<boolean>
  setTorrentFilePriority: (
    id: string,
    filePath: string,
    priority: 'high' | 'normal' | 'low' | 'ignore'
  ) => Promise<boolean>
  exportTorrentFile: (downloadId: string) => Promise<boolean>
  getTorrentStreamUrl: (id: string, fileIndex?: number) => Promise<string | null>
  parseTorrentMetadata: (source: string) => Promise<{
    name: string
    infoHash: string
    totalSize: number
    files: Array<{ name: string; path: string; size: number }>
    trackers: string[]
  }>
  reannounceTorrent: (id: string) => Promise<boolean>
  updateTorrentOptions: (id: string, options: Partial<DownloadItem>) => Promise<boolean>
  renameDownload: (id: string, newName: string) => Promise<boolean>
  setDownloadLocation: (id: string, newPath: string) => Promise<boolean>
  setDownloadTags: (id: string, tags: string[]) => Promise<boolean>
  toggleDownloadTag: (id: string, tag: string) => Promise<boolean>

  // Category & Filter IPC
  getCategories: () => Promise<Record<DownloadCategory, string[]>>
  setCategory: (id: string, category: DownloadCategory) => Promise<boolean>

  // Settings IPC
  getSettings: () => Promise<EngineSettings>
  updateSettings: (settings: Partial<EngineSettings>) => Promise<EngineSettings>

  // System & Hash Verification IPC
  verifyHash: (args: {
    id: string
    expectedHash: string
    algo?: 'md5' | 'sha256' | 'sha512'
  }) => Promise<{ matches: boolean; actualHash: string }>
  selectDirectory: (defaultPath?: string) => Promise<string | null>
  openFileLocation: (path: string) => Promise<boolean>
  openFile: (path: string) => Promise<boolean>
  copyToClipboard: (text: string) => Promise<boolean>

  getSpeedHistory: () => Promise<SpeedSample[]>

  // Window controls
  minimizeWindow: () => Promise<boolean>
  maximizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  isWindowMaximized: () => Promise<boolean>
  setAlwaysOnTop: (flag?: boolean) => Promise<boolean>
  toggleFullscreen: () => Promise<boolean>
  getQueueStats: () => Promise<{
    active: number
    queued: number
    paused: number
    completed: number
    error: number
    total: number
  }>
  promoteQueueItem: (id: string) => Promise<boolean>
  demoteQueueItem: (id: string) => Promise<boolean>
  exportLogs: () => Promise<boolean>
  createTorrent: (options: {
    sourcePath: string
    pieceSizeKb?: number
    trackers?: string[]
    comment?: string
    isPrivate?: boolean
    startSeeding?: boolean
  }) => Promise<{ success: boolean; torrentPath?: string; error?: string }>
  getAppVersion: () => Promise<string>
  checkForUpdates: () => Promise<{
    hasUpdate: boolean
    currentVersion: string
    latestVersion: string
    releaseNotes: string
    downloadUrl?: string
  }>
  installNativeHost: () => Promise<{ success: boolean; manifestPath?: string; error?: string }>

  // Plugins API
  getPlugins: () => Promise<
    Array<{
      id: string
      name: string
      version: string
      author: string
      description: string
      installed: boolean
      enabled: boolean
    }>
  >
  togglePluginInstall: (id: string) => Promise<unknown>
  togglePluginEnabled: (id: string, enabled?: boolean) => Promise<unknown>

  // Automations API
  getAutomationRules: () => Promise<
    Array<{
      id: string
      name: string
      trigger: string
      action: string
      actionConfig?: { webhookUrl?: string; scriptCommand?: string; targetFolder?: string }
      enabled: boolean
    }>
  >
  addAutomationRule: (rule: {
    name: string
    trigger: string
    action: string
    actionConfig?: { webhookUrl?: string; scriptCommand?: string; targetFolder?: string }
    enabled: boolean
  }) => Promise<unknown>
  deleteAutomationRule: (id: string) => Promise<boolean>
  toggleAutomationRule: (id: string, enabled?: boolean) => Promise<unknown>

  // Script Console API
  executeScript: (code: string) => Promise<{
    success: boolean
    logs: Array<{ type: 'log' | 'warn' | 'error'; message: string }>
    result?: string
    error?: string
    executionTimeMs: number
  }>

  // Real-Time Push Events & Listeners
  onDownloadsUpdated: (callback: (downloads: DownloadItem[]) => void) => () => void
  onSpeedUpdated: (
    callback: (speed: {
      downloadSpeed: number
      uploadSpeed: number
      history: SpeedSample[]
    }) => void
  ) => () => void
  onDownloadProgress: (callback: (data: DownloadItem) => void) => () => void
  onDownloadCompleted: (callback: (data: DownloadItem) => void) => () => void
  onDownloadError: (callback: (data: { id: string; error: string }) => void) => () => void
  onDownloadAdded: (callback: (download: DownloadItem) => void) => () => void
  onDownloadUpdated: (callback: (download: DownloadItem) => void) => () => void
  onDownloadRemoved: (callback: (id: string) => void) => () => void
  onStatsTick: (callback: (sample: SpeedSample) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: GrabbitAPI
  }
}
