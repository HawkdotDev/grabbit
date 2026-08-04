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
  }): Promise<DownloadItem> => ipcRenderer.invoke('download:add', args),

  pauseDownload: (id: string): Promise<boolean> => ipcRenderer.invoke('download:pause', id),
  resumeDownload: (id: string): Promise<boolean> => ipcRenderer.invoke('download:resume', id),
  cancelDownload: (id: string): Promise<boolean> => ipcRenderer.invoke('download:cancel', id),
  exportQueue: (): Promise<boolean> => ipcRenderer.invoke('download:exportQueue'),
  importQueue: (): Promise<number> => ipcRenderer.invoke('download:importQueue'),
  getDownloads: (): Promise<DownloadItem[]> => ipcRenderer.invoke('download:getAll'),
  getAllDownloads: (): Promise<DownloadItem[]> => ipcRenderer.invoke('download:getAll'),

  verifyHash: (args: {
    id: string
    expectedHash: string
    algo?: 'sha256' | 'md5' | 'sha512'
  }): Promise<{ matches: boolean; actualHash: string }> =>
    ipcRenderer.invoke('download:verifyHash', args),

  getSettings: (): Promise<EngineSettings> => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Partial<EngineSettings>): Promise<EngineSettings> =>
    ipcRenderer.invoke('settings:update', settings),

  getSpeedHistory: (): Promise<SpeedSample[]> => ipcRenderer.invoke('stats:getHistory'),

  openFileLocation: (path: string): Promise<boolean> =>
    ipcRenderer.invoke('system:openFileLocation', path),
  copyToClipboard: (text: string): Promise<boolean> =>
    ipcRenderer.invoke('system:copyToClipboard', text),

  // Window controls
  minimizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:close'),
  isWindowMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),

  // Listeners
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
