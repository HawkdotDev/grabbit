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
  priority: 'ignore' | 'normal' | 'high' | 'low'
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
  superSeeding?: boolean
  managementMode?: 'manual' | 'automatic'
  timeActive?: number
  seededTime?: number
  sessionDownloaded?: number
  sessionUploaded?: number
  avgDownSpeed?: number
  avgUpSpeed?: number
  downloadLimit?: number
  uploadLimit?: number
  popularity?: number
  reannounceIn?: number
  maxConnections?: number
  totalSeeds?: number
  totalPeers?: number
  wastedSize?: number
  lastSeenComplete?: number | string
  piecesCount?: number
  pieceSize?: number
  piecesHave?: number
  infoHashV2?: string
  createdBy?: string
  createdOn?: number
  comment?: string
  isPrivate?: boolean
}

export interface CustomThemeColors {
  bg: string
  surface: string
  card: string
  border: string
  accent: string
  bright: string
  tint: string
}

export interface AutoImportFolderRule {
  id: string
  folder: string
  overrideSavePath: string
  status: string
  action: 'delete' | 'append_extension' | 'move_backup'
}

export interface IpFilterEntry {
  id: string
  ipOrRange: string
  description?: string
}

export interface RssAutoDownloadRule {
  id: string
  name: string
  mustContain: string
  mustNotContain: string
  episodeFilter: string
  useSmartEpisodeFilter: boolean
  category: DownloadCategory
  savePath: string
  applyToFeeds: string[]
  ignoreMatchesDuration: string
  addPaused: boolean
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
  enableAdaptiveQoS?: boolean
  enableRpcServer?: boolean
  rpcPort?: number
  rpcSecretToken?: string
  proxyEnabled?: boolean
  proxyType?: 'none' | 'socks4' | 'socks5' | 'http'
  proxyHost?: string
  proxyPort?: number
  categorySpeedLimitsKbps?: Partial<Record<DownloadCategory, number>>
  enableDoH?: boolean
  dohProvider?: 'cloudflare' | 'quad9' | 'google' | 'custom'
  customDoHUrl?: string
  enableWarp?: boolean
  warpEndpoint?: string
  stripReferrer?: boolean
  customUserAgent?: string
  forceTorrentEncryption?: boolean
  disableP2PTracking?: boolean

  // 1. Behavior Settings
  uiLanguage?: string
  startOnStartup?: boolean
  showSplashScreen?: boolean
  startMinimized?: boolean
  showLanguageOption?: boolean
  confirmDeleteTorrents?: boolean
  confirmExit?: boolean
  showStatusBar?: boolean
  showNavigationBar?: boolean
  alternatingRowColors?: boolean
  showTrayIcon?: boolean
  minimizeToTray?: boolean
  closeToTray?: boolean
  minimizeToNotificationAreaOnMinimize?: boolean
  enableLogFile?: boolean
  logPath?: string
  backupLogOnRestart?: boolean
  deleteLogOlderThan?: number
  deleteLogOlderThanUnit?: 'days' | 'months'
  maxLogFileSize?: number
  maxLogFileSizeUnit?: 'KiB' | 'MiB'
  enablePerformanceWarnings?: boolean
  inhibitSleep?: boolean
  inhibitSleepOnlyDownloading?: boolean
  inhibitSleepOnlySeeding?: boolean
  notifyOnTorrentCompletion?: boolean
  notifyOnTorrentAddition?: boolean

  // 2. Downloads Settings
  displayTorrentContentAndOptions?: boolean
  displayTorrentOptionsForMagnet?: boolean
  doNotStartDownloadAuto?: boolean
  deleteTorrentFileAfterward?: 'never' | 'always' | 'trash'
  keepIncompleteTorrentsInEnabled?: boolean
  keepIncompleteTorrentsPath?: string
  copyTorrentFilesToEnabled?: boolean
  copyTorrentFilesPath?: string
  copyFinishedTorrentFilesToEnabled?: boolean
  copyFinishedTorrentFilesPath?: string
  defaultTorrentManagementMode?: 'manual' | 'automatic'
  whenCategoryChanged?: 'relocate' | 'switch_mode'
  whenDefaultSavePathChanged?: 'relocate' | 'keep'
  whenCategorySavePathChanged?: 'relocate' | 'keep'
  autoImportFolders?: AutoImportFolderRule[]
  excludedFileExtensions?: string
  sendEmailNotification?: boolean
  emailFrom?: string
  emailTo?: string
  smtpServer?: string
  smtpAuthRequired?: boolean
  smtpUsername?: string
  smtpPassword?: string
  runProgramOnCompletionEnabled?: boolean
  runProgramOnCompletionCmd?: string
  runProgramOnAddedEnabled?: boolean
  runProgramOnAddedCmd?: string

  // 3. Connection Settings
  incomingPort?: number
  useUPnP?: boolean
  useDifferentPortOnStartup?: boolean
  globalMaxConnectionsEnabled?: boolean
  globalMaxConnections?: number
  maxConnectionsPerTorrentEnabled?: boolean
  maxConnectionsPerTorrent?: number
  globalMaxUploadSlotsEnabled?: boolean
  globalMaxUploadSlots?: number
  maxUploadSlotsPerTorrentEnabled?: boolean
  maxUploadSlotsPerTorrent?: number
  peerProtocol?: 'TCP and μTP' | 'TCP' | 'μTP'
  proxyAuthRequired?: boolean
  proxyUsername?: string
  proxyPassword?: string
  proxyPeerConnections?: boolean
  proxyWebSeeds?: boolean
  proxyHostnameLookup?: boolean
  proxyOnlyForTorrents?: boolean
  ipFilterPath?: string
  ipFilterApplyToTrackers?: boolean
  bannedIps?: IpFilterEntry[]

  // 4. Speed Settings
  globalUploadLimitKbps?: number
  globalDownloadLimitKbps?: number
  altUploadLimitKbps?: number
  altDownloadLimitKbps?: number
  scheduleAltRateLimits?: boolean
  altRateLimitsFrom?: string
  altRateLimitsTo?: string
  altRateLimitsDays?: string
  applyLimitToTransportOverhead?: boolean
  applyLimitToUTP?: boolean
  applyLimitToLanPeers?: boolean

  // 5. BitTorrent Settings
  enableDHT?: boolean
  enablePeX?: boolean
  enableLSD?: boolean
  encryptionMode?: 'allow' | 'require' | 'disable'
  enableAnonymousMode?: boolean
  maxActiveDownloadsEnabled?: boolean
  maxActiveDownloads?: number
  maxActiveUploadsEnabled?: boolean
  maxActiveUploads?: number
  maxActiveTorrentsEnabled?: boolean
  maxActiveTorrents?: number
  dontCountSlowTorrents?: boolean
  downloadRateThresholdKbps?: number
  uploadRateThresholdKbps?: number
  torrentInactivityTimerSec?: number
  seedingRatioLimitEnabled?: boolean
  seedingRatioLimit?: number
  seedingTimeLimitEnabled?: boolean
  seedingTimeLimitMin?: number
  inactiveTimeLimitEnabled?: boolean
  inactiveTimeLimitMin?: number
  seedingLimitAction?: 'pause' | 'remove' | 'remove_and_delete_files' | 'super_seeding'
  autoTorrentManagementRatioRule?: 'global' | 'manual'

  // 6. RSS Settings
  enableFetchingRss?: boolean
  rssRefreshIntervalMin?: number
  rssMaxArticlesPerFeed?: number
  enableAutoDownloadingRss?: boolean
  enableSmartEpisodeFilter?: boolean
  rssAutoDownloadRules?: RssAutoDownloadRule[]

  // 7. Web UI Settings
  enableWebUi?: boolean
  webUiIpAddress?: string
  webUiPort?: number
  webUiUseUPnP?: boolean
  webUiUseHttps?: boolean
  webUiCertPath?: string
  webUiKeyPath?: string
  webUiUsername?: string
  webUiPassword?: string
  webUiBypassLocalhost?: boolean
  webUiBypassSubnetsEnabled?: boolean
  webUiSubnetWhitelist?: string
  webUiMaxAuthFailures?: number
  webUiBanDurationSec?: number
  enableCsrfProtection?: boolean
  enableClickjackingProtection?: boolean
  enableHostHeaderValidation?: boolean
  webUiServerDomains?: string
  useAltWebUi?: boolean
  altWebUiFilesLocation?: string

  // 8. Advanced Settings
  networkInterface?: string
  listenOnIPv6?: boolean
  processMemoryPriority?: 'normal' | 'below_normal' | 'low'
  saveResumeDataIntervalMin?: number
  confirmTorrentRecheck?: boolean
  recheckOnCompletion?: boolean
  checkForUpdates?: boolean
  transferListRefreshIntervalMs?: number
  resolvePeerHostnames?: boolean
  resolvePeerCountries?: boolean
  displayPeerListWithIcons?: boolean
  displayNotifications?: boolean
  displayNotificationsForAdded?: boolean
  confirmRemoveAllTags?: boolean
  downloadTrackerFavicon?: boolean
  savePathHistoryLength?: number
  enableSpeedGraphs?: boolean
  enableIconsInMenus?: boolean
  trackerStatusColors?: { working: string; warning: string; error: string; disabled: string }
  enableEmbeddedTracker?: boolean
  embeddedTrackerPort?: number
  embeddedTrackerUrl?: string
  asyncIoThreads?: number
  hashingThreads?: number
  filePoolSize?: number
  outstandingMemoryLowWatermarkMb?: number
  outstandingMemoryHighWatermarkMb?: number
  diskCacheMb?: number
  diskCacheExpirySec?: number
  diskIoType?: 'default' | 'memory_mapped' | 'posix'
  diskIoReadMode?: 'enable_os_cache' | 'disable_os_cache'
  diskIoWriteMode?: 'enable_os_cache' | 'disable_os_cache'
  coalesceReadsWrites?: boolean
  pieceExtentAffinity?: boolean
  sendUploadPieceReadHint?: boolean
  sendBufferWatermarkKb?: number
  sendBufferLowWatermarkKb?: number
  sendBufferWatermarkFactorPct?: number
  socketBacklogSize?: number
  outgoingPortsMin?: number
  outgoingPortsMax?: number
  upnpLeaseDurationSec?: number
  allowMultipleConnectionsPerIp?: boolean
  validateHttpsTrackerCertificates?: boolean
  uploadChokingAlgorithm?: 'round_robin' | 'fastest_upload' | 'anti_leech'
  uploadSlotsBehavior?: 'fixed_slots' | 'token_bucket'
  chokingAlgorithm?: 'fixed_slots' | 'rate_based'
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
