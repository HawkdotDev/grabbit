export type DownloadCategory =
  | 'all'
  | 'documents'
  | 'compressed'
  | 'video'
  | 'audio'
  | 'executables'
  | 'images'
  | 'code'
  | 'other'

export type DownloadStatus = 'downloading' | 'paused' | 'completed' | 'queued' | 'error'

export type DownloadPriority = 'high' | 'normal' | 'low'

export interface ChunkInfo {
  id: number
  startByte: number
  endByte: number
  downloadedBytes: number
  speed: number
  status: 'downloading' | 'completed' | 'paused' | 'queued' | 'error'
}

export interface DownloadItem {
  id: string
  url: string
  name: string
  savePath: string
  totalSize: number
  downloadedSize: number
  speed: number // bytes per second
  eta: number // seconds
  status: DownloadStatus
  category: DownloadCategory
  priority: DownloadPriority
  threadCount: number
  chunks: ChunkInfo[]
  createdAt: number
  completedAt?: number
  checksum?: string
  etag?: string
  error?: string
}

export interface EngineSettings {
  maxConcurrentDownloads: number
  defaultThreadCount: number
  maxGlobalSpeedLimitKbps: number // 0 = unlimited
  defaultSavePath: string
  autoCategorize: boolean
  enableNotifications: boolean
  startOnBoot: boolean
  theme: 'dark' | 'light' | 'system'
}

export interface SpeedSample {
  timestamp: number
  downloadSpeed: number
  uploadSpeed: number
}

export interface HashVerificationResult {
  downloadId: string
  algorithm: 'sha256' | 'md5' | 'sha512'
  expectedHash: string
  actualHash: string
  matches: boolean
}
