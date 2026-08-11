import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  DownloadCategory,
  DownloadItem,
  DownloadPriority,
  EngineSettings,
  SpeedSample
} from '../engine/types'

const api = {
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
  }): Promise<DownloadItem> => ipcRenderer.invoke('download:add', args),

  pauseDownload: (id: string): Promise<boolean> => ipcRenderer.invoke('download:pause', id),
  resumeDownload: (id: string): Promise<boolean> => ipcRenderer.invoke('download:resume', id),
  cancelDownload: (id: string): Promise<boolean> => ipcRenderer.invoke('download:cancel', id),
  pauseAll: (): Promise<boolean> => ipcRenderer.invoke('download:pauseAll'),
  resumeAll: (): Promise<boolean> => ipcRenderer.invoke('download:resumeAll'),
  clearCompleted: (): Promise<boolean> => ipcRenderer.invoke('download:clearCompleted'),
  getQueueStats: (): Promise<{
    active: number
    queued: number
    paused: number
    completed: number
    error: number
    total: number
  }> => ipcRenderer.invoke('queue:getStats'),
  promoteQueueItem: (id: string): Promise<boolean> => ipcRenderer.invoke('queue:promote', id),
  demoteQueueItem: (id: string): Promise<boolean> => ipcRenderer.invoke('queue:demote', id),
  exportQueue: (): Promise<boolean> => ipcRenderer.invoke('download:exportQueue'),
  importQueue: (): Promise<number> => ipcRenderer.invoke('download:importQueue'),
  getDownloads: (): Promise<DownloadItem[]> => ipcRenderer.invoke('download:getAll'),
  getAllDownloads: (): Promise<DownloadItem[]> => ipcRenderer.invoke('download:getAll'),

  // WebTorrent IPC
  addTorrentTracker: (id: string, trackerUrl: string): Promise<boolean> =>
    ipcRenderer.invoke('torrent:addTracker', { id, trackerUrl }),
  removeTorrentTracker: (id: string, trackerUrl: string): Promise<boolean> =>
    ipcRenderer.invoke('torrent:removeTracker', { id, trackerUrl }),
  addTorrentPeer: (id: string, peerAddress: string): Promise<boolean> =>
    ipcRenderer.invoke('torrent:addPeer', { id, peerAddress }),
  setTorrentFilePriority: (
    id: string,
    filePath: string,
    priority: 'high' | 'normal' | 'low' | 'ignore'
  ): Promise<boolean> => ipcRenderer.invoke('torrent:setFilePriority', { id, filePath, priority }),
  exportTorrentFile: (downloadId: string): Promise<boolean> =>
    ipcRenderer.invoke('torrent:exportFile', downloadId),
  getTorrentStreamUrl: (id: string, fileIndex?: number): Promise<string | null> =>
    ipcRenderer.invoke('torrent:getStreamUrl', { id, fileIndex }),
  parseTorrentMetadata: (
    source: string
  ): Promise<{
    name: string
    infoHash: string
    totalSize: number
    files: Array<{ name: string; path: string; size: number }>
    trackers: string[]
  }> => ipcRenderer.invoke('torrent:parseMetadata', source),

  reannounceTorrent: (id: string): Promise<boolean> => ipcRenderer.invoke('torrent:reannounce', id),
  updateTorrentOptions: (id: string, options: Partial<DownloadItem>): Promise<boolean> =>
    ipcRenderer.invoke('torrent:updateOptions', { id, options }),

  renameDownload: (id: string, newName: string): Promise<boolean> =>
    ipcRenderer.invoke('download:rename', { id, newName }),
  setDownloadLocation: (id: string, newPath: string): Promise<boolean> =>
    ipcRenderer.invoke('download:setLocation', { id, newPath }),
  setDownloadTags: (id: string, tags: string[]): Promise<boolean> =>
    ipcRenderer.invoke('download:setTags', { id, tags }),
  toggleDownloadTag: (id: string, tag: string): Promise<boolean> =>
    ipcRenderer.invoke('download:toggleTag', { id, tag }),

  verifyHash: (args: {
    id: string
    expectedHash: string
    algo?: 'sha256' | 'md5' | 'sha512'
  }): Promise<{ matches: boolean; actualHash: string }> =>
    ipcRenderer.invoke('download:verifyHash', args),

  selectDirectory: (defaultPath?: string): Promise<string | null> =>
    ipcRenderer.invoke('dialog:selectDirectory', defaultPath),

  getSettings: (): Promise<EngineSettings> => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Partial<EngineSettings>): Promise<EngineSettings> =>
    ipcRenderer.invoke('settings:update', settings),
  extractVideoFormats: (url: string): Promise<Array<{ formatId: string; extension: string; resolution: string; filesize?: number; note?: string }>> =>
    ipcRenderer.invoke('media:extractFormats', url),
  getQoSStatus: (): Promise<{ throttled: boolean; pingMs: number }> =>
    ipcRenderer.invoke('qos:getStatus'),

  getSpeedHistory: (): Promise<SpeedSample[]> => ipcRenderer.invoke('stats:getHistory'),

  openFileLocation: (path: string): Promise<boolean> =>
    ipcRenderer.invoke('system:openFileLocation', path),
  openFile: (path: string): Promise<boolean> => ipcRenderer.invoke('system:openFile', path),
  copyToClipboard: (text: string): Promise<boolean> =>
    ipcRenderer.invoke('system:copyToClipboard', text),

  // Window controls
  minimizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:close'),
  isWindowMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
  setAlwaysOnTop: (flag?: boolean): Promise<boolean> =>
    ipcRenderer.invoke('window:setAlwaysOnTop', flag),
  toggleFullscreen: (): Promise<boolean> => ipcRenderer.invoke('window:toggleFullscreen'),
  exportLogs: (): Promise<boolean> => ipcRenderer.invoke('logs:export'),
  createTorrent: (options: {
    sourcePath: string
    pieceSizeKb?: number
    trackers?: string[]
    comment?: string
    isPrivate?: boolean
    startSeeding?: boolean
  }): Promise<{ success: boolean; torrentPath?: string; error?: string }> =>
    ipcRenderer.invoke('torrent:create', options),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
  checkForUpdates: (): Promise<{
    hasUpdate: boolean
    currentVersion: string
    latestVersion: string
    releaseNotes: string
    downloadUrl?: string
  }> => ipcRenderer.invoke('updater:check'),
  installNativeHost: (): Promise<{ success: boolean; manifestPath?: string; error?: string }> =>
    ipcRenderer.invoke('nativeHost:install'),

  // Plugins API
  getPlugins: (): Promise<Array<{
    id: string
    name: string
    version: string
    author: string
    description: string
    installed: boolean
    enabled: boolean
  }>> => ipcRenderer.invoke('plugins:getAll'),
  togglePluginInstall: (id: string): Promise<unknown> =>
    ipcRenderer.invoke('plugins:toggleInstall', id),
  togglePluginEnabled: (id: string, enabled?: boolean): Promise<unknown> =>
    ipcRenderer.invoke('plugins:toggleEnabled', { id, enabled }),

  // Automations API
  getAutomationRules: (): Promise<Array<{
    id: string
    name: string
    trigger: string
    action: string
    actionConfig?: { webhookUrl?: string; scriptCommand?: string; targetFolder?: string }
    enabled: boolean
  }>> => ipcRenderer.invoke('automations:getRules'),
  addAutomationRule: (rule: {
    name: string
    trigger: string
    action: string
    actionConfig?: { webhookUrl?: string; scriptCommand?: string; targetFolder?: string }
    enabled: boolean
  }): Promise<unknown> => ipcRenderer.invoke('automations:addRule', rule),
  deleteAutomationRule: (id: string): Promise<boolean> =>
    ipcRenderer.invoke('automations:deleteRule', id),
  toggleAutomationRule: (id: string, enabled?: boolean): Promise<unknown> =>
    ipcRenderer.invoke('automations:toggleRule', { id, enabled }),

  // Script Console API
  executeScript: (code: string): Promise<{
    success: boolean
    logs: Array<{ type: 'log' | 'warn' | 'error'; message: string }>
    result?: string
    error?: string
    executionTimeMs: number
  }> => ipcRenderer.invoke('script:execute', code),

  // Categories API
  getCategories: (): Promise<Record<DownloadCategory, string[]>> =>
    ipcRenderer.invoke('categories:get'),
  setCategory: (id: string, category: DownloadCategory): Promise<boolean> =>
    ipcRenderer.invoke('download:setCategory', { id, category }),

  // Listeners
  onDownloadsUpdated: (callback: (downloads: DownloadItem[]) => void): (() => void) => {
    const handler = (_: unknown, downloads: DownloadItem[]): void => callback(downloads)
    ipcRenderer.on('downloads:onUpdated', handler)
    return () => ipcRenderer.removeListener('downloads:onUpdated', handler)
  },

  onSpeedUpdated: (
    callback: (speed: {
      downloadSpeed: number
      uploadSpeed: number
      history: SpeedSample[]
    }) => void
  ): (() => void) => {
    const handler = (
      _: unknown,
      speed: { downloadSpeed: number; uploadSpeed: number; history: SpeedSample[] }
    ): void => callback(speed)
    ipcRenderer.on('speed:onUpdated', handler)
    return () => ipcRenderer.removeListener('speed:onUpdated', handler)
  },

  onDownloadProgress: (callback: (download: DownloadItem) => void): (() => void) => {
    const handler = (_: unknown, download: DownloadItem): void => callback(download)
    ipcRenderer.on('download:onProgress', handler)
    return () => ipcRenderer.removeListener('download:onProgress', handler)
  },

  onDownloadAdded: (callback: (download: DownloadItem) => void): (() => void) => {
    const handler = (_: unknown, download: DownloadItem): void => callback(download)
    ipcRenderer.on('download:onAdded', handler)
    return () => ipcRenderer.removeListener('download:onAdded', handler)
  },

  onDownloadUpdated: (callback: (download: DownloadItem) => void): (() => void) => {
    const handler = (_: unknown, download: DownloadItem): void => callback(download)
    ipcRenderer.on('download:onUpdated', handler)
    return () => ipcRenderer.removeListener('download:onUpdated', handler)
  },

  onDownloadCompleted: (callback: (download: DownloadItem) => void): (() => void) => {
    const handler = (_: unknown, download: DownloadItem): void => callback(download)
    ipcRenderer.on('download:onCompleted', handler)
    return () => ipcRenderer.removeListener('download:onCompleted', handler)
  },

  onDownloadError: (callback: (data: { id: string; error: string }) => void): (() => void) => {
    const handler = (_: unknown, data: { id: string; error: string }): void => callback(data)
    ipcRenderer.on('download:onError', handler)
    return () => ipcRenderer.removeListener('download:onError', handler)
  },

  onDownloadRemoved: (callback: (id: string) => void): (() => void) => {
    const handler = (_: unknown, id: string): void => callback(id)
    ipcRenderer.on('download:onRemoved', handler)
    return () => ipcRenderer.removeListener('download:onRemoved', handler)
  },

  onStatsTick: (callback: (sample: SpeedSample) => void): (() => void) => {
    const handler = (_: unknown, sample: SpeedSample): void => callback(sample)
    ipcRenderer.on('stats:onTick', handler)
    return () => ipcRenderer.removeListener('stats:onTick', handler)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
