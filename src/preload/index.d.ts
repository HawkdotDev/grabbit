import { ElectronAPI } from '@electron-toolkit/preload'
import {
  DownloadCategory,
  DownloadItem,
  DownloadPriority,
  EngineSettings,
  SpeedSample
} from '../engine/types'

export interface NeobitAPI {
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
  getAllDownloads: () => Promise<DownloadItem[]>

  verifyHash: (args: {
    id: string
    expectedHash: string
    algo?: 'sha256' | 'md5' | 'sha512'
  }) => Promise<{ matches: boolean; actualHash: string }>

  getSettings: () => Promise<EngineSettings>
  updateSettings: (settings: Partial<EngineSettings>) => Promise<EngineSettings>

  getSpeedHistory: () => Promise<SpeedSample[]>

  // Window controls
  minimizeWindow: () => Promise<boolean>
  maximizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  isWindowMaximized: () => Promise<boolean>

  // Listeners
  onDownloadProgress: (callback: (download: DownloadItem) => void) => () => void
  onDownloadAdded: (callback: (download: DownloadItem) => void) => () => void
  onDownloadUpdated: (callback: (download: DownloadItem) => void) => () => void
  onDownloadCompleted: (callback: (download: DownloadItem) => void) => () => void
  onDownloadRemoved: (callback: (id: string) => void) => () => void
  onStatsTick: (callback: (sample: SpeedSample) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: NeobitAPI
  }
}
