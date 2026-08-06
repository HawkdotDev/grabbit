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
