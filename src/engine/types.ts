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

export type StatusFilter =
  | 'all'
  | 'downloading'
  | 'seeding'
  | 'completed'
  | 'running'
  | 'stopped'
  | 'active'
  | 'inactive'
  | 'stalled'
  | 'checking'
  | 'errored'

export type DownloadStatus =
  'downloading' | 'paused' | 'completed' | 'queued' | 'error' | 'seeding' | 'stalled' | 'checking'

export type DownloadPriority = 'high' | 'normal' | 'low'

export interface ChunkInfo {
  id: number
  startByte: number
  endByte: number
  downloadedBytes: number
  speed: number
  status: 'downloading' | 'completed' | 'paused' | 'queued' | 'error'
}

export interface DownloadFileItem {
  path: string
  size: number
  downloaded: number
  priority: 'ignore' | 'normal' | 'high'
}

export interface TrackerInfo {
  url: string
  status: 'working' | 'error' | 'disabled'
  peers: number
}

export interface DownloadItem {
  id: string
  url: string
  name: string
  savePath: string
  totalSize: number
  downloadedSize: number
  speed: number // bytes per second
  upSpeed?: number // upload speed
  uploadedSize?: number
  ratio?: number
  seedsCount?: number
  peersCount?: number
  eta: number // seconds
  status: DownloadStatus
  category: DownloadCategory
  priority: DownloadPriority
  threadCount: number
  chunks: ChunkInfo[]
  createdAt: number
  completedAt?: number
  checksum?: string
  infoHash?: string
  etag?: string
  error?: string
  tags?: string[]
  trackers?: TrackerInfo[]
  files?: DownloadFileItem[]
}

export interface EngineSettings {
  maxConcurrentDownloads: number
  defaultThreadCount: number
  maxGlobalSpeedLimitKbps: number // 0 = unlimited
  defaultSavePath: string
  autoCategorize: boolean
  enableNotifications: boolean
  startOnBoot: boolean
  theme: 'dark' | 'light' | 'contrast' | 'carrot' | 'custom' | 'system'
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
