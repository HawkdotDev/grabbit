import React, { useState } from 'react'
import { EngineSettings, AutoImportFolderRule, IpFilterEntry, RssAutoDownloadRule } from '../../../../engine/types'
import {
  X,
  Sliders,
  FolderOpen,
  GripHorizontal,
  Globe,
  Wrench,
  Gauge,
  Rss,
  ShieldAlert,
  Plus,
  Trash2,
  FolderDown,
  Network,
  Monitor
} from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'
import { IpFilterModal } from './IpFilterModal'
import { RssRulesManagerModal } from './RssRulesManagerModal'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: EngineSettings
  onSave: (newSettings: Partial<EngineSettings>) => void
}

type TabType =
  | 'behavior'
  | 'downloads'
  | 'connection'
  | 'speed'
  | 'bittorrent'
  | 'rss'
  | 'webui'
  | 'advanced'

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('behavior')

  // Sub-Modal States
  const [isIpFilterModalOpen, setIsIpFilterModalOpen] = useState(false)
  const [isRssRulesModalOpen, setIsRssRulesModalOpen] = useState(false)

  // ─── 1. Behavior State ───
  const [uiLanguage, setUiLanguage] = useState(settings.uiLanguage || 'English')
  const [startOnStartup, setStartOnStartup] = useState(settings.startOnStartup ?? settings.startOnBoot ?? false)
  const [showSplashScreen, setShowSplashScreen] = useState(settings.showSplashScreen ?? true)
  const [startMinimized, setStartMinimized] = useState(settings.startMinimized ?? false)
  const [showLanguageOption, setShowLanguageOption] = useState(settings.showLanguageOption ?? true)
  const [confirmDeleteTorrents, setConfirmDeleteTorrents] = useState(settings.confirmDeleteTorrents ?? true)
  const [confirmExit, setConfirmExit] = useState(settings.confirmExit ?? true)
  const [showStatusBar, setShowStatusBar] = useState(settings.showStatusBar ?? true)
  const [showNavigationBar, setShowNavigationBar] = useState(settings.showNavigationBar ?? true)
  const [alternatingRowColors, setAlternatingRowColors] = useState(settings.alternatingRowColors ?? true)
  const [showTrayIcon, setShowTrayIcon] = useState(settings.showTrayIcon ?? true)
  const [minimizeToTray, setMinimizeToTray] = useState(settings.minimizeToTray ?? true)
  const [closeToTray, setCloseToTray] = useState(settings.closeToTray ?? true)
  const [minimizeToNotificationAreaOnMinimize, setMinimizeToNotificationAreaOnMinimize] = useState(
    settings.minimizeToNotificationAreaOnMinimize ?? true
  )
  const [enableLogFile, setEnableLogFile] = useState(settings.enableLogFile ?? false)
  const [logPath, setLogPath] = useState(settings.logPath || '')
  const [backupLogOnRestart, setBackupLogOnRestart] = useState(settings.backupLogOnRestart ?? false)
  const [deleteLogOlderThan, setDeleteLogOlderThan] = useState(settings.deleteLogOlderThan ?? 30)
  const [deleteLogOlderThanUnit, setDeleteLogOlderThanUnit] = useState<'days' | 'months'>(
    settings.deleteLogOlderThanUnit || 'days'
  )
  const [maxLogFileSize, setMaxLogFileSize] = useState(settings.maxLogFileSize ?? 5)
  const [maxLogFileSizeUnit, setMaxLogFileSizeUnit] = useState<'KiB' | 'MiB'>(
    settings.maxLogFileSizeUnit || 'MiB'
  )
  const [enablePerformanceWarnings, setEnablePerformanceWarnings] = useState(
    settings.enablePerformanceWarnings ?? true
  )
  const [inhibitSleep, setInhibitSleep] = useState(settings.inhibitSleep ?? false)
  const [inhibitSleepOnlyDownloading, setInhibitSleepOnlyDownloading] = useState(
    settings.inhibitSleepOnlyDownloading ?? false
  )
  const [inhibitSleepOnlySeeding, setInhibitSleepOnlySeeding] = useState(
    settings.inhibitSleepOnlySeeding ?? false
  )
  const [notifyOnTorrentCompletion, setNotifyOnTorrentCompletion] = useState(
    settings.notifyOnTorrentCompletion ?? true
  )
  const [notifyOnTorrentAddition, setNotifyOnTorrentAddition] = useState(
    settings.notifyOnTorrentAddition ?? true
  )

  // ─── 2. Downloads State ───
  const [displayTorrentContentAndOptions, setDisplayTorrentContentAndOptions] = useState(
    settings.displayTorrentContentAndOptions ?? true
  )
  const [displayTorrentOptionsForMagnet, setDisplayTorrentOptionsForMagnet] = useState(
    settings.displayTorrentOptionsForMagnet ?? true
  )
  const [doNotStartDownloadAuto, setDoNotStartDownloadAuto] = useState(
    settings.doNotStartDownloadAuto ?? false
  )
  const [deleteTorrentFileAfterward, setDeleteTorrentFileAfterward] = useState<
    'never' | 'always' | 'trash'
  >(settings.deleteTorrentFileAfterward || 'never')
  const [defaultSavePath, setDefaultSavePath] = useState(settings.defaultSavePath || '')
  const [keepIncompleteTorrentsInEnabled, setKeepIncompleteTorrentsInEnabled] = useState(
    settings.keepIncompleteTorrentsInEnabled ?? false
  )
  const [keepIncompleteTorrentsPath, setKeepIncompleteTorrentsPath] = useState(
    settings.keepIncompleteTorrentsPath || ''
  )
  const [copyTorrentFilesToEnabled, setCopyTorrentFilesToEnabled] = useState(
    settings.copyTorrentFilesToEnabled ?? false
  )
  const [copyTorrentFilesPath, setCopyTorrentFilesPath] = useState(settings.copyTorrentFilesPath || '')
  const [copyFinishedTorrentFilesToEnabled, setCopyFinishedTorrentFilesToEnabled] = useState(
    settings.copyFinishedTorrentFilesToEnabled ?? false
  )
  const [copyFinishedTorrentFilesPath, setCopyFinishedTorrentFilesPath] = useState(
    settings.copyFinishedTorrentFilesPath || ''
  )
  const [defaultTorrentManagementMode, setDefaultTorrentManagementMode] = useState<
    'manual' | 'automatic'
  >(settings.defaultTorrentManagementMode || 'automatic')
  const [whenCategoryChanged, setWhenCategoryChanged] = useState<'relocate' | 'switch_mode'>(
    settings.whenCategoryChanged || 'relocate'
  )
  const [whenDefaultSavePathChanged, setWhenDefaultSavePathChanged] = useState<'relocate' | 'keep'>(
    settings.whenDefaultSavePathChanged || 'relocate'
  )
  const [whenCategorySavePathChanged, setWhenCategorySavePathChanged] = useState<'relocate' | 'keep'>(
    settings.whenCategorySavePathChanged || 'relocate'
  )
  const [autoImportFolders, setAutoImportFolders] = useState<AutoImportFolderRule[]>(
    settings.autoImportFolders || []
  )
  const [excludedFileExtensions, setExcludedFileExtensions] = useState(
    settings.excludedFileExtensions || '*.unwanted; *.txt'
  )
  const [sendEmailNotification, setSendEmailNotification] = useState(
    settings.sendEmailNotification ?? false
  )
  const [emailFrom, setEmailFrom] = useState(settings.emailFrom || '')
  const [emailTo, setEmailTo] = useState(settings.emailTo || '')
  const [smtpServer, setSmtpServer] = useState(settings.smtpServer || 'smtp.gmail.com')
  const [smtpAuthRequired, setSmtpAuthRequired] = useState(settings.smtpAuthRequired ?? true)
  const [smtpUsername, setSmtpUsername] = useState(settings.smtpUsername || '')
  const [smtpPassword, setSmtpPassword] = useState(settings.smtpPassword || '')
  const [runProgramOnCompletionEnabled, setRunProgramOnCompletionEnabled] = useState(
    settings.runProgramOnCompletionEnabled ?? false
  )
  const [runProgramOnCompletionCmd, setRunProgramOnCompletionCmd] = useState(
    settings.runProgramOnCompletionCmd || ''
  )
  const [runProgramOnAddedEnabled, setRunProgramOnAddedEnabled] = useState(
    settings.runProgramOnAddedEnabled ?? false
  )
  const [runProgramOnAddedCmd, setRunProgramOnAddedCmd] = useState(
    settings.runProgramOnAddedCmd || ''
  )

  // ─── 3. Connection State ───
  const [incomingPort, setIncomingPort] = useState(settings.incomingPort ?? 8999)
  const [useUPnP, setUseUPnP] = useState(settings.useUPnP ?? true)
  const [useDifferentPortOnStartup, setUseDifferentPortOnStartup] = useState(
    settings.useDifferentPortOnStartup ?? false
  )
  const [globalMaxConnectionsEnabled, setGlobalMaxConnectionsEnabled] = useState(
    settings.globalMaxConnectionsEnabled ?? true
  )
  const [globalMaxConnections, setGlobalMaxConnections] = useState(
    settings.globalMaxConnections ?? 500
  )
  const [maxConnectionsPerTorrentEnabled, setMaxConnectionsPerTorrentEnabled] = useState(
    settings.maxConnectionsPerTorrentEnabled ?? true
  )
  const [maxConnectionsPerTorrent, setMaxConnectionsPerTorrent] = useState(
    settings.maxConnectionsPerTorrent ?? 100
  )
  const [globalMaxUploadSlotsEnabled, setGlobalMaxUploadSlotsEnabled] = useState(
    settings.globalMaxUploadSlotsEnabled ?? true
  )
  const [globalMaxUploadSlots, setGlobalMaxUploadSlots] = useState(
    settings.globalMaxUploadSlots ?? 20
  )
  const [maxUploadSlotsPerTorrentEnabled, setMaxUploadSlotsPerTorrentEnabled] = useState(
    settings.maxUploadSlotsPerTorrentEnabled ?? true
  )
  const [maxUploadSlotsPerTorrent, setMaxUploadSlotsPerTorrent] = useState(
    settings.maxUploadSlotsPerTorrent ?? 4
  )
  const [peerProtocol, setPeerProtocol] = useState<'TCP and μTP' | 'TCP' | 'μTP'>(
    settings.peerProtocol || 'TCP and μTP'
  )
  const [proxyType, setProxyType] = useState<'none' | 'socks4' | 'socks5' | 'http'>(
    settings.proxyType || 'none'
  )
  const [proxyHost, setProxyHost] = useState(settings.proxyHost || '127.0.0.1')
  const [proxyPort, setProxyPort] = useState(settings.proxyPort || 8080)
  const [proxyAuthRequired, setProxyAuthRequired] = useState(settings.proxyAuthRequired ?? false)
  const [proxyUsername, setProxyUsername] = useState(settings.proxyUsername || '')
  const [proxyPassword, setProxyPassword] = useState(settings.proxyPassword || '')
  const [proxyPeerConnections, setProxyPeerConnections] = useState(
    settings.proxyPeerConnections ?? true
  )
  const [proxyWebSeeds, setProxyWebSeeds] = useState(settings.proxyWebSeeds ?? true)
  const [proxyHostnameLookup, setProxyHostnameLookup] = useState(settings.proxyHostnameLookup ?? true)
  const [proxyOnlyForTorrents, setProxyOnlyForTorrents] = useState(settings.proxyOnlyForTorrents ?? true)
  const [ipFilterPath, setIpFilterPath] = useState(settings.ipFilterPath || '')
  const [ipFilterApplyToTrackers, setIpFilterApplyToTrackers] = useState(
    settings.ipFilterApplyToTrackers ?? true
  )
  const [bannedIps, setBannedIps] = useState<IpFilterEntry[]>(settings.bannedIps || [])

  // ─── 4. Speed State ───
  const [globalUploadLimitKbps, setGlobalUploadLimitKbps] = useState(
    settings.globalUploadLimitKbps ?? 0
  )
  const [globalDownloadLimitKbps, setGlobalDownloadLimitKbps] = useState(
    settings.globalDownloadLimitKbps ?? settings.maxGlobalSpeedLimitKbps ?? 0
  )
  const [altUploadLimitKbps, setAltUploadLimitKbps] = useState(settings.altUploadLimitKbps ?? 100)
  const [altDownloadLimitKbps, setAltDownloadLimitKbps] = useState(settings.altDownloadLimitKbps ?? 1000)
  const [scheduleAltRateLimits, setScheduleAltRateLimits] = useState(
    settings.scheduleAltRateLimits ?? false
  )
  const [altRateLimitsFrom, setAltRateLimitsFrom] = useState(settings.altRateLimitsFrom || '08:00')
  const [altRateLimitsTo, setAltRateLimitsTo] = useState(settings.altRateLimitsTo || '20:00')
  const [altRateLimitsDays, setAltRateLimitsDays] = useState(settings.altRateLimitsDays || 'everyday')
  const [applyLimitToTransportOverhead, setApplyLimitToTransportOverhead] = useState(
    settings.applyLimitToTransportOverhead ?? false
  )
  const [applyLimitToUTP, setApplyLimitToUTP] = useState(settings.applyLimitToUTP ?? true)
  const [applyLimitToLanPeers, setApplyLimitToLanPeers] = useState(settings.applyLimitToLanPeers ?? false)

  // ─── 5. BitTorrent State ───
  const [enableDHT, setEnableDHT] = useState(settings.enableDHT ?? true)
  const [enablePeX, setEnablePeX] = useState(settings.enablePeX ?? true)
  const [enableLSD, setEnableLSD] = useState(settings.enableLSD ?? true)
  const [encryptionMode, setEncryptionMode] = useState<'allow' | 'require' | 'disable'>(
    settings.encryptionMode || 'allow'
  )
  const [enableAnonymousMode, setEnableAnonymousMode] = useState(settings.enableAnonymousMode ?? false)
  const [maxActiveDownloadsEnabled, setMaxActiveDownloadsEnabled] = useState(
    settings.maxActiveDownloadsEnabled ?? true
  )
  const [maxActiveDownloads, setMaxActiveDownloads] = useState(
    settings.maxActiveDownloads ?? settings.maxConcurrentDownloads ?? 3
  )
  const [maxActiveUploadsEnabled, setMaxActiveUploadsEnabled] = useState(
    settings.maxActiveUploadsEnabled ?? true
  )
  const [maxActiveUploads, setMaxActiveUploads] = useState(settings.maxActiveUploads ?? 3)
  const [maxActiveTorrentsEnabled, setMaxActiveTorrentsEnabled] = useState(
    settings.maxActiveTorrentsEnabled ?? true
  )
  const [maxActiveTorrents, setMaxActiveTorrents] = useState(settings.maxActiveTorrents ?? 5)
  const [maxActiveCheckingTorrents, setMaxActiveCheckingTorrents] = useState(1)
  const [dontCountSlowTorrents, setDontCountSlowTorrents] = useState(
    settings.dontCountSlowTorrents ?? false
  )
  const [downloadRateThresholdKbps, setDownloadRateThresholdKbps] = useState(
    settings.downloadRateThresholdKbps ?? 2
  )
  const [uploadRateThresholdKbps, setUploadRateThresholdKbps] = useState(
    settings.uploadRateThresholdKbps ?? 2
  )
  const [torrentInactivityTimerSec, setTorrentInactivityTimerSec] = useState(
    settings.torrentInactivityTimerSec ?? 60
  )
  const [seedingRatioLimitEnabled, setSeedingRatioLimitEnabled] = useState(
    settings.seedingRatioLimitEnabled ?? false
  )
  const [seedingRatioLimit, setSeedingRatioLimit] = useState(settings.seedingRatioLimit ?? 1.0)
  const [seedingTimeLimitEnabled, setSeedingTimeLimitEnabled] = useState(
    settings.seedingTimeLimitEnabled ?? false
  )
  const [seedingTimeLimitMin, setSeedingTimeLimitMin] = useState(settings.seedingTimeLimitMin ?? 1440)
  const [inactiveTimeLimitEnabled, setInactiveTimeLimitEnabled] = useState(
    settings.inactiveTimeLimitEnabled ?? false
  )
  const [inactiveTimeLimitMin, setInactiveTimeLimitMin] = useState(
    settings.inactiveTimeLimitMin ?? 1440
  )
  const [seedingLimitAction, setSeedingLimitAction] = useState<
    'pause' | 'remove' | 'remove_and_delete_files' | 'super_seeding'
  >(settings.seedingLimitAction || 'pause')
  const [autoTorrentManagementRatioRule, setAutoTorrentManagementRatioRule] = useState<
    'global' | 'manual'
  >(settings.autoTorrentManagementRatioRule || 'global')
  const [autoAppendTrackersEnabled, setAutoAppendTrackersEnabled] = useState(false)
  const [autoAppendTrackersText, setAutoAppendTrackersText] = useState('')

  // ─── 6. RSS State ───
  const [enableFetchingRss, setEnableFetchingRss] = useState(settings.enableFetchingRss ?? true)
  const [rssRefreshIntervalMin, setRssRefreshIntervalMin] = useState(
    settings.rssRefreshIntervalMin ?? 30
  )
  const [rssMaxArticlesPerFeed, setRssMaxArticlesPerFeed] = useState(
    settings.rssMaxArticlesPerFeed ?? 50
  )
  const [enableAutoDownloadingRss, setEnableAutoDownloadingRss] = useState(
    settings.enableAutoDownloadingRss ?? true
  )
  const [enableSmartEpisodeFilter, setEnableSmartEpisodeFilter] = useState(
    settings.enableSmartEpisodeFilter ?? true
  )
  const [rssAutoDownloadRules, setRssAutoDownloadRules] = useState<RssAutoDownloadRule[]>(
    settings.rssAutoDownloadRules || []
  )

  // ─── 7. Web UI State ───
  const [enableWebUi, setEnableWebUi] = useState(settings.enableWebUi ?? false)
  const [webUiIpAddress, setWebUiIpAddress] = useState(settings.webUiIpAddress || '*')
  const [webUiPort, setWebUiPort] = useState(settings.webUiPort ?? 8080)
  const [webUiUseUPnP, setWebUiUseUPnP] = useState(settings.webUiUseUPnP ?? false)
  const [webUiUseHttps, setWebUiUseHttps] = useState(settings.webUiUseHttps ?? false)
  const [webUiCertPath, setWebUiCertPath] = useState(settings.webUiCertPath || '')
  const [webUiKeyPath, setWebUiKeyPath] = useState(settings.webUiKeyPath || '')
  const [webUiUsername, setWebUiUsername] = useState(settings.webUiUsername || 'admin')
  const [webUiPassword, setWebUiPassword] = useState(settings.webUiPassword || '')
  const [webUiBypassLocalhost, setWebUiBypassLocalhost] = useState(
    settings.webUiBypassLocalhost ?? true
  )
  const [webUiBypassSubnetsEnabled, setWebUiBypassSubnetsEnabled] = useState(
    settings.webUiBypassSubnetsEnabled ?? false
  )
  const [webUiSubnetWhitelist, setWebUiSubnetWhitelist] = useState(
    settings.webUiSubnetWhitelist || '192.168.1.0/24'
  )
  const [webUiMaxAuthFailures, setWebUiMaxAuthFailures] = useState(settings.webUiMaxAuthFailures ?? 5)
  const [webUiBanDurationSec, setWebUiBanDurationSec] = useState(settings.webUiBanDurationSec ?? 3600)
  const [enableCsrfProtection, setEnableCsrfProtection] = useState(
    settings.enableCsrfProtection ?? true
  )
  const [enableClickjackingProtection, setEnableClickjackingProtection] = useState(
    settings.enableClickjackingProtection ?? true
  )
  const [enableHostHeaderValidation, setEnableHostHeaderValidation] = useState(
    settings.enableHostHeaderValidation ?? true
  )
  const [webUiServerDomains, setWebUiServerDomains] = useState(settings.webUiServerDomains || 'localhost')
  const [useAltWebUi, setUseAltWebUi] = useState(settings.useAltWebUi ?? false)
  const [altWebUiFilesLocation, setAltWebUiFilesLocation] = useState(
    settings.altWebUiFilesLocation || ''
  )

  // ─── 8. Advanced State ───
  const [networkInterface, setNetworkInterface] = useState(settings.networkInterface || 'Any interface')
  const [bindIpAddress, setBindIpAddress] = useState('All addresses')
  const [listenOnIPv6, setListenOnIPv6] = useState(settings.listenOnIPv6 ?? true)
  const [processMemoryPriority, setProcessMemoryPriority] = useState<'normal' | 'below_normal' | 'low'>(
    settings.processMemoryPriority || 'below_normal'
  )
  const [saveResumeDataIntervalMin, setSaveResumeDataIntervalMin] = useState(
    settings.saveResumeDataIntervalMin ?? 60
  )
  const [confirmTorrentRecheck, setConfirmTorrentRecheck] = useState(
    settings.confirmTorrentRecheck ?? true
  )
  const [recheckOnCompletion, setRecheckOnCompletion] = useState(settings.recheckOnCompletion ?? false)
  const [checkForUpdates, setCheckForUpdates] = useState(settings.checkForUpdates ?? true)
  const [transferListRefreshIntervalMs, setTransferListRefreshIntervalMs] = useState(
    settings.transferListRefreshIntervalMs ?? 1500
  )
  const [resolvePeerHostnames, setResolvePeerHostnames] = useState(
    settings.resolvePeerHostnames ?? false
  )
  const [resolvePeerCountries, setResolvePeerCountries] = useState(
    settings.resolvePeerCountries ?? true
  )
  const [displayPeerListWithIcons, setDisplayPeerListWithIcons] = useState(
    settings.displayPeerListWithIcons ?? true
  )
  const [displayNotifications, setDisplayNotifications] = useState(
    settings.displayNotifications ?? true
  )
  const [displayNotificationsForAdded, setDisplayNotificationsForAdded] = useState(
    settings.displayNotificationsForAdded ?? true
  )
  const [confirmRemoveAllTags, setConfirmRemoveAllTags] = useState(
    settings.confirmRemoveAllTags ?? true
  )
  const [downloadTrackerFavicon, setDownloadTrackerFavicon] = useState(
    settings.downloadTrackerFavicon ?? true
  )
  const [savePathHistoryLength, setSavePathHistoryLength] = useState(
    settings.savePathHistoryLength ?? 10
  )
  const [enableSpeedGraphs, setEnableSpeedGraphs] = useState(settings.enableSpeedGraphs ?? true)
  const [enableIconsInMenus, setEnableIconsInMenus] = useState(settings.enableIconsInMenus ?? true)
  const [trackerStatusColors, setTrackerStatusColors] = useState(
    settings.trackerStatusColors || {
      working: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      disabled: '#64748b'
    }
  )
  const [enableEmbeddedTracker, setEnableEmbeddedTracker] = useState(
    settings.enableEmbeddedTracker ?? false
  )
  const [embeddedTrackerPort, setEmbeddedTrackerPort] = useState(settings.embeddedTrackerPort ?? 9000)
  const [embeddedTrackerUrl, setEmbeddedTrackerUrl] = useState(settings.embeddedTrackerUrl || '')

  const [asyncIoThreads, setAsyncIoThreads] = useState(settings.asyncIoThreads ?? 4)
  const [hashingThreads, setHashingThreads] = useState(settings.hashingThreads ?? 2)
  const [filePoolSize, setFilePoolSize] = useState(settings.filePoolSize ?? 40)
  const [outstandingMemoryLowWatermarkMb, setOutstandingMemoryLowWatermarkMb] = useState(
    settings.outstandingMemoryLowWatermarkMb ?? 10
  )
  const [outstandingMemoryHighWatermarkMb, setOutstandingMemoryHighWatermarkMb] = useState(
    settings.outstandingMemoryHighWatermarkMb ?? 500
  )
  const [diskCacheMb, setDiskCacheMb] = useState(settings.diskCacheMb ?? -1)
  const [diskCacheExpirySec, setDiskCacheExpirySec] = useState(settings.diskCacheExpirySec ?? 60)
  const [diskIoType, setDiskIoType] = useState<'default' | 'memory_mapped' | 'posix'>(
    settings.diskIoType || 'default'
  )
  const [diskIoReadMode, setDiskIoReadMode] = useState<'enable_os_cache' | 'disable_os_cache'>(
    settings.diskIoReadMode || 'enable_os_cache'
  )
  const [diskIoWriteMode, setDiskIoWriteMode] = useState<'enable_os_cache' | 'disable_os_cache'>(
    settings.diskIoWriteMode || 'enable_os_cache'
  )
  const [coalesceReadsWrites, setCoalesceReadsWrites] = useState(settings.coalesceReadsWrites ?? true)
  const [pieceExtentAffinity, setPieceExtentAffinity] = useState(settings.pieceExtentAffinity ?? false)
  const [sendUploadPieceReadHint, setSendUploadPieceReadHint] = useState(
    settings.sendUploadPieceReadHint ?? true
  )
  const [sendBufferWatermarkKb, setSendBufferWatermarkKb] = useState(
    settings.sendBufferWatermarkKb ?? 500
  )
  const [sendBufferLowWatermarkKb, setSendBufferLowWatermarkKb] = useState(
    settings.sendBufferLowWatermarkKb ?? 10
  )
  const [sendBufferWatermarkFactorPct, setSendBufferWatermarkFactorPct] = useState(
    settings.sendBufferWatermarkFactorPct ?? 50
  )
  const [socketBacklogSize, setSocketBacklogSize] = useState(settings.socketBacklogSize ?? 50)
  const [outgoingPortsMin, setOutgoingPortsMin] = useState(settings.outgoingPortsMin ?? 0)
  const [outgoingPortsMax, setOutgoingPortsMax] = useState(settings.outgoingPortsMax ?? 0)
  const [upnpLeaseDurationSec, setUpnpLeaseDurationSec] = useState(
    settings.upnpLeaseDurationSec ?? 0
  )
  const [allowMultipleConnectionsPerIp, setAllowMultipleConnectionsPerIp] = useState(
    settings.allowMultipleConnectionsPerIp ?? false
  )
  const [validateHttpsTrackerCertificates, setValidateHttpsTrackerCertificates] = useState(
    settings.validateHttpsTrackerCertificates ?? true
  )
  const [uploadChokingAlgorithm, setUploadChokingAlgorithm] = useState<
    'round_robin' | 'fastest_upload' | 'anti_leech'
  >(settings.uploadChokingAlgorithm || 'fastest_upload')
  const [uploadSlotsBehavior, setUploadSlotsBehavior] = useState<'fixed_slots' | 'token_bucket'>(
    settings.uploadSlotsBehavior || 'fixed_slots'
  )
  const [chokingAlgorithm, setChokingAlgorithm] = useState<'fixed_slots' | 'rate_based'>(
    settings.chokingAlgorithm || 'fixed_slots'
  )

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  // ─── Browse Helper ───
  const handleBrowse = async (
    currentValue: string,
    setter: (val: string) => void
  ): Promise<void> => {
    if (window.api?.selectDirectory) {
      const selected = await window.api.selectDirectory(currentValue)
      if (selected) setter(selected)
    }
  }

  // ─── Auto Import Folders Handlers ───
  const handleAddAutoImportFolder = () => {
    const newRule: AutoImportFolderRule = {
      id: String(Date.now()),
      folder: 'C:/Torrents/Watch',
      overrideSavePath: '',
      status: 'Active',
      action: 'delete'
    }
    setAutoImportFolders((prev) => [...prev, newRule])
  }

  const handleRemoveAutoImportFolder = (id: string) => {
    setAutoImportFolders((prev) => prev.filter((r) => r.id !== id))
  }

  const handleRandomizePort = () => {
    const randomPort = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024
    setIncomingPort(randomPort)
  }

  // ─── Settings Payload & Save/Apply Handlers ───
  const getSettingsPayload = (): Partial<EngineSettings> => ({
    // Behavior
    uiLanguage,
    startOnStartup,
    startOnBoot: startOnStartup,
    showSplashScreen,
    startMinimized,
    showLanguageOption,
    confirmDeleteTorrents,
    confirmExit,
    showStatusBar,
    showNavigationBar,
    alternatingRowColors,
    showTrayIcon,
    minimizeToTray,
    closeToTray,
    minimizeToNotificationAreaOnMinimize,
    enableLogFile,
    logPath,
    backupLogOnRestart,
    deleteLogOlderThan,
    deleteLogOlderThanUnit,
    maxLogFileSize,
    maxLogFileSizeUnit,
    enablePerformanceWarnings,
    inhibitSleep,
    inhibitSleepOnlyDownloading,
    inhibitSleepOnlySeeding,
    notifyOnTorrentCompletion,
    notifyOnTorrentAddition,
    enableNotifications: notifyOnTorrentCompletion,

    // Downloads
    displayTorrentContentAndOptions,
    displayTorrentOptionsForMagnet,
    doNotStartDownloadAuto,
    deleteTorrentFileAfterward,
    defaultSavePath,
    keepIncompleteTorrentsInEnabled,
    keepIncompleteTorrentsPath,
    copyTorrentFilesToEnabled,
    copyTorrentFilesPath,
    copyFinishedTorrentFilesToEnabled,
    copyFinishedTorrentFilesPath,
    defaultTorrentManagementMode,
    whenCategoryChanged,
    whenDefaultSavePathChanged,
    whenCategorySavePathChanged,
    autoImportFolders,
    excludedFileExtensions,
    sendEmailNotification,
    emailFrom,
    emailTo,
    smtpServer,
    smtpAuthRequired,
    smtpUsername,
    smtpPassword,
    runProgramOnCompletionEnabled,
    runProgramOnCompletionCmd,
    runProgramOnAddedEnabled,
    runProgramOnAddedCmd,

    // Connection
    incomingPort,
    useUPnP,
    useDifferentPortOnStartup,
    globalMaxConnectionsEnabled,
    globalMaxConnections,
    maxConnectionsPerTorrentEnabled,
    maxConnectionsPerTorrent,
    globalMaxUploadSlotsEnabled,
    globalMaxUploadSlots,
    maxUploadSlotsPerTorrentEnabled,
    maxUploadSlotsPerTorrent,
    peerProtocol,
    proxyType,
    proxyHost,
    proxyPort,
    proxyAuthRequired,
    proxyUsername,
    proxyPassword,
    proxyPeerConnections,
    proxyWebSeeds,
    proxyHostnameLookup,
    proxyOnlyForTorrents,
    ipFilterPath,
    ipFilterApplyToTrackers,
    bannedIps,

    // Speed
    globalUploadLimitKbps,
    globalDownloadLimitKbps,
    maxGlobalSpeedLimitKbps: globalDownloadLimitKbps,
    altUploadLimitKbps,
    altDownloadLimitKbps,
    scheduleAltRateLimits,
    altRateLimitsFrom,
    altRateLimitsTo,
    altRateLimitsDays,
    applyLimitToTransportOverhead,
    applyLimitToUTP,
    applyLimitToLanPeers,

    // BitTorrent
    enableDHT,
    enablePeX,
    enableLSD,
    encryptionMode,
    enableAnonymousMode,
    maxActiveDownloadsEnabled,
    maxActiveDownloads,
    maxConcurrentDownloads: maxActiveDownloads,
    maxActiveUploadsEnabled,
    maxActiveUploads,
    maxActiveTorrentsEnabled,
    maxActiveTorrents,
    dontCountSlowTorrents,
    downloadRateThresholdKbps,
    uploadRateThresholdKbps,
    torrentInactivityTimerSec,
    seedingRatioLimitEnabled,
    seedingRatioLimit,
    seedingTimeLimitEnabled,
    seedingTimeLimitMin,
    inactiveTimeLimitEnabled,
    inactiveTimeLimitMin,
    seedingLimitAction,
    autoTorrentManagementRatioRule,

    // RSS
    enableFetchingRss,
    rssRefreshIntervalMin,
    rssMaxArticlesPerFeed,
    enableAutoDownloadingRss,
    enableSmartEpisodeFilter,
    rssAutoDownloadRules,

    // Web UI
    enableWebUi,
    webUiIpAddress,
    webUiPort,
    webUiUseUPnP,
    webUiUseHttps,
    webUiCertPath,
    webUiKeyPath,
    webUiUsername,
    webUiPassword,
    webUiBypassLocalhost,
    webUiBypassSubnetsEnabled,
    webUiSubnetWhitelist,
    webUiMaxAuthFailures,
    webUiBanDurationSec,
    enableCsrfProtection,
    enableClickjackingProtection,
    enableHostHeaderValidation,
    webUiServerDomains,
    useAltWebUi,
    altWebUiFilesLocation,

    // Advanced
    networkInterface,
    listenOnIPv6,
    processMemoryPriority,
    saveResumeDataIntervalMin,
    confirmTorrentRecheck,
    recheckOnCompletion,
    checkForUpdates,
    transferListRefreshIntervalMs,
    resolvePeerHostnames,
    resolvePeerCountries,
    displayPeerListWithIcons,
    displayNotifications,
    displayNotificationsForAdded,
    confirmRemoveAllTags,
    downloadTrackerFavicon,
    savePathHistoryLength,
    enableSpeedGraphs,
    enableIconsInMenus,
    trackerStatusColors,
    enableEmbeddedTracker,
    embeddedTrackerPort,
    embeddedTrackerUrl,
    asyncIoThreads,
    hashingThreads,
    filePoolSize,
    outstandingMemoryLowWatermarkMb,
    outstandingMemoryHighWatermarkMb,
    diskCacheMb,
    diskCacheExpirySec,
    diskIoType,
    diskIoReadMode,
    diskIoWriteMode,
    coalesceReadsWrites,
    pieceExtentAffinity,
    sendUploadPieceReadHint,
    sendBufferWatermarkKb,
    sendBufferLowWatermarkKb,
    sendBufferWatermarkFactorPct,
    socketBacklogSize,
    outgoingPortsMin,
    outgoingPortsMax,
    upnpLeaseDurationSec,
    allowMultipleConnectionsPerIp,
    validateHttpsTrackerCertificates,
    uploadChokingAlgorithm,
    uploadSlotsBehavior,
    chokingAlgorithm
  })

  const handleSave = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    onSave(getSettingsPayload())
    onClose()
  }

  const handleApply = (e?: React.MouseEvent): void => {
    if (e) e.preventDefault()
    onSave(getSettingsPayload())
  }

  const sidebarTabs: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'behavior', label: 'Behavior', icon: Sliders },
    { id: 'downloads', label: 'Downloads', icon: FolderDown },
    { id: 'connection', label: 'Connection', icon: Network },
    { id: 'speed', label: 'Speed', icon: Gauge },
    { id: 'bittorrent', label: 'BitTorrent', icon: Globe },
    { id: 'rss', label: 'RSS', icon: Rss },
    { id: 'webui', label: 'WebUI', icon: Monitor },
    { id: 'advanced', label: 'Advanced', icon: Wrench }
  ]

  return (
    <>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 select-none font-sans text-xs"
      >
        <div
          ref={modalRef}
          style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
          className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-5xl h-160 shadow-2xl overflow-hidden flex flex-col font-sans text-slate-100 ${isDragging ? 'transition-none duration-0' : ''
            } ${isBlinking ? 'animate-modal-blink' : ''}`}
        >
          {/* ─── Grabbit Title Bar ─── */}
          <div
            onMouseDown={handleMouseDown}
            className="px-4 py-2 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
              <div className="p-1 bg-theme-tint/60 border border-theme-accent/30">
                <Sliders className="h-3.5 w-3.5 text-theme-bright" />
              </div>
              <div>
                <span className="font-bold text-slate-100 text-xs block">Preferences & Options</span>
                <span className="text-[10px] text-slate-500 block leading-none mt-0.5">
                  Engine parameters, behavior preferences and networking controls
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ─── Main Split Container ─── */}
          <div className="flex-1 flex min-h-0 overflow-hidden bg-ide-surface">
            {/* Left Vertical Options Sidebar */}
            <div className="w-36 bg-ide-bg border-r border-ide-border p-2 flex flex-col items-stretch gap-1 select-none shrink-0 overflow-y-auto">
              {sidebarTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full py-2.5 px-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${isActive
                        ? 'bg-theme-tint/60 text-theme-bright font-semibold border-l-2 border-theme-accent shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-ide-surface/60'
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-theme-accent' : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight text-center">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Right Settings Pane (Fieldset Groupboxes IDE Design) */}
            <div className="flex-1 flex flex-col min-w-0 bg-ide-surface overflow-hidden">
              {/* Scrollable Form Content */}
              <form id="settings-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ────────────────────────────────────────────────────────── */}
                {/* 1. BEHAVIOR TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeTab === 'behavior' && (
                  <>
                    <FieldsetGroup title="Language">
                      <FieldRow label="User Interface Language">
                        <select
                          value={uiLanguage}
                          onChange={(e) => setUiLanguage(e.target.value)}
                          className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs focus:border-theme-accent focus:outline-none font-sans cursor-pointer"
                        >
                          <option value="English">English (United States)</option>
                          <option value="Spanish">Español (Spanish)</option>
                          <option value="French">Français (French)</option>
                          <option value="German">Deutsch (German)</option>
                          <option value="Japanese">日本語 (Japanese)</option>
                          <option value="Chinese">中文 (Chinese)</option>
                        </select>
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="Desktop">
                      <CheckboxField label="Start Grabbit on Windows startup" checked={startOnStartup} onChange={setStartOnStartup} />
                      <CheckboxField label="Show splash screen on startup" checked={showSplashScreen} onChange={setShowSplashScreen} />
                      <CheckboxField label="Start Grabbit minimized" checked={startMinimized} onChange={setStartMinimized} />
                      <CheckboxField label="Show option to change program language" checked={showLanguageOption} onChange={setShowLanguageOption} />
                      <CheckboxField label="Confirm when deleting torrents" checked={confirmDeleteTorrents} onChange={setConfirmDeleteTorrents} />
                      <CheckboxField label="Ask for program exit confirmation" checked={confirmExit} onChange={setConfirmExit} />
                      <CheckboxField label="Show status bar" checked={showStatusBar} onChange={setShowStatusBar} />
                      <CheckboxField label="Hide/Show main window navigation bar" checked={showNavigationBar} onChange={setShowNavigationBar} />
                      <CheckboxField label="Alternating row colors in lists" checked={alternatingRowColors} onChange={setAlternatingRowColors} />
                    </FieldsetGroup>

                    <FieldsetGroup title="System Tray">
                      <CheckboxField label="Show icon in system tray" checked={showTrayIcon} onChange={setShowTrayIcon} />
                      <CheckboxField label="Minimize to tray" checked={minimizeToTray} onChange={setMinimizeToTray} indent />
                      <CheckboxField label="Close to tray" checked={closeToTray} onChange={setCloseToTray} indent />
                      <CheckboxField label="Minimize Grabbit to notification area when clicking minimize button" checked={minimizeToNotificationAreaOnMinimize} onChange={setMinimizeToNotificationAreaOnMinimize} />
                    </FieldsetGroup>

                    <FieldsetGroup title="File Association">
                      <div className="flex items-center gap-3 py-1">
                        <button
                          type="button"
                          onClick={() => alert('.torrent files successfully associated')}
                          className="px-3 py-1 bg-ide-card hover:bg-ide-border border border-ide-border text-slate-200 text-xs transition cursor-pointer font-medium"
                        >
                          Associate with .torrent files
                        </button>
                        <button
                          type="button"
                          onClick={() => alert('Magnet links successfully associated')}
                          className="px-3 py-1 bg-ide-card hover:bg-ide-border border border-ide-border text-slate-200 text-xs transition cursor-pointer font-medium"
                        >
                          Associate with magnet links
                        </button>
                      </div>
                    </FieldsetGroup>

                    <FieldsetGroup title="Log Properties">
                      <CheckboxField label="Enable log file" checked={enableLogFile} onChange={setEnableLogFile} />
                      {enableLogFile && (
                        <div className="space-y-2 pl-4 border-l border-ide-border my-1">
                          <PathRow label="Path" value={logPath} onChange={setLogPath} onBrowse={() => handleBrowse(logPath, setLogPath)} />
                          <CheckboxField label="Backup log file on restart" checked={backupLogOnRestart} onChange={setBackupLogOnRestart} />
                          <FieldRow label="Delete log files older than">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={deleteLogOlderThan}
                                onChange={(e) => setDeleteLogOlderThan(parseInt(e.target.value, 10) || 0)}
                                className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none"
                              />
                              <select
                                value={deleteLogOlderThanUnit}
                                onChange={(e) => setDeleteLogOlderThanUnit(e.target.value as 'days' | 'months')}
                                className="bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                              >
                                <option value="days">Days</option>
                                <option value="months">Months</option>
                              </select>
                            </div>
                          </FieldRow>
                          <FieldRow label="Max log file size">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={maxLogFileSize}
                                onChange={(e) => setMaxLogFileSize(parseInt(e.target.value, 10) || 0)}
                                className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none"
                              />
                              <select
                                value={maxLogFileSizeUnit}
                                onChange={(e) => setMaxLogFileSizeUnit(e.target.value as 'KiB' | 'MiB')}
                                className="bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                              >
                                <option value="KiB">KiB</option>
                                <option value="MiB">MiB</option>
                              </select>
                            </div>
                          </FieldRow>
                        </div>
                      )}
                      <CheckboxField label="Performance warning settings" checked={enablePerformanceWarnings} onChange={setEnablePerformanceWarnings} />
                    </FieldsetGroup>

                    <FieldsetGroup title="Power Management">
                      <CheckboxField label="Inhibit system sleep when torrents are active" checked={inhibitSleep} onChange={setInhibitSleep} />
                      <CheckboxField label="Inhibit sleep only when downloading" checked={inhibitSleepOnlyDownloading} onChange={setInhibitSleepOnlyDownloading} indent />
                      <CheckboxField label="Inhibit sleep only when seeding" checked={inhibitSleepOnlySeeding} onChange={setInhibitSleepOnlySeeding} indent />
                    </FieldsetGroup>

                    <FieldsetGroup title="Desktop Notification">
                      <CheckboxField label="Display notification on torrent completion" checked={notifyOnTorrentCompletion} onChange={setNotifyOnTorrentCompletion} />
                      <CheckboxField label="Display notification on torrent addition" checked={notifyOnTorrentAddition} onChange={setNotifyOnTorrentAddition} />
                    </FieldsetGroup>
                  </>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 2. DOWNLOADS TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeTab === 'downloads' && (
                  <>
                    <FieldsetGroup title="When adding a torrent">
                      <CheckboxField label="Display torrent content and some options" checked={displayTorrentContentAndOptions} onChange={setDisplayTorrentContentAndOptions} />
                      <CheckboxField label="Display torrent options for magnet links" checked={displayTorrentOptionsForMagnet} onChange={setDisplayTorrentOptionsForMagnet} />
                      <CheckboxField label="Do not start the download automatically" checked={doNotStartDownloadAuto} onChange={setDoNotStartDownloadAuto} />
                      <FieldRow label="Delete .torrent files afterwards">
                        <select
                          value={deleteTorrentFileAfterward}
                          onChange={(e) => setDeleteTorrentFileAfterward(e.target.value as 'never' | 'always' | 'trash')}
                          className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="never">Never</option>
                          <option value="always">Always</option>
                          <option value="trash">Delete to Trash</option>
                        </select>
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="Saving Management">
                      <PathRow label="Default Save Path" value={defaultSavePath} onChange={setDefaultSavePath} onBrowse={() => handleBrowse(defaultSavePath, setDefaultSavePath)} />
                      <CheckboxPathRow label="Keep incomplete torrents in" checked={keepIncompleteTorrentsInEnabled} onCheckedChange={setKeepIncompleteTorrentsInEnabled} value={keepIncompleteTorrentsPath} onValueChange={setKeepIncompleteTorrentsPath} onBrowse={() => handleBrowse(keepIncompleteTorrentsPath, setKeepIncompleteTorrentsPath)} />
                      <CheckboxPathRow label="Copy .torrent files to" checked={copyTorrentFilesToEnabled} onCheckedChange={setCopyTorrentFilesToEnabled} value={copyTorrentFilesPath} onValueChange={setCopyTorrentFilesPath} onBrowse={() => handleBrowse(copyTorrentFilesPath, setCopyTorrentFilesPath)} />
                      <CheckboxPathRow label="Copy .torrent files for finished downloads to" checked={copyFinishedTorrentFilesToEnabled} onCheckedChange={setCopyFinishedTorrentFilesToEnabled} value={copyFinishedTorrentFilesPath} onValueChange={setCopyFinishedTorrentFilesPath} onBrowse={() => handleBrowse(copyFinishedTorrentFilesPath, setCopyFinishedTorrentFilesPath)} />

                      <FieldRow label="Default Torrent Management Mode">
                        <select
                          value={defaultTorrentManagementMode}
                          onChange={(e) => setDefaultTorrentManagementMode(e.target.value as 'manual' | 'automatic')}
                          className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="manual">Manual</option>
                          <option value="automatic">Automatic</option>
                        </select>
                      </FieldRow>

                      <FieldRow label="When Category changed">
                        <select
                          value={whenCategoryChanged}
                          onChange={(e) => setWhenCategoryChanged(e.target.value as 'relocate' | 'switch_mode')}
                          className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="relocate">Relocate torrent</option>
                          <option value="switch_mode">Switch torrent management mode</option>
                        </select>
                      </FieldRow>

                      <FieldRow label="When Default Save Path changed">
                        <select
                          value={whenDefaultSavePathChanged}
                          onChange={(e) => setWhenDefaultSavePathChanged(e.target.value as 'relocate' | 'keep')}
                          className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="relocate">Relocate torrents</option>
                          <option value="keep">Keep in old location</option>
                        </select>
                      </FieldRow>

                      <FieldRow label="When Category Save Path changed">
                        <select
                          value={whenCategorySavePathChanged}
                          onChange={(e) => setWhenCategorySavePathChanged(e.target.value as 'relocate' | 'keep')}
                          className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="relocate">Relocate torrents</option>
                          <option value="keep">Keep in old location</option>
                        </select>
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="Automated Torrent Import">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium text-xs">Automatically add torrents from:</span>
                          <button
                            type="button"
                            onClick={handleAddAutoImportFolder}
                            className="px-2.5 py-1 bg-theme-accent text-slate-950 font-bold hover:bg-theme-bright flex items-center gap-1 text-xs cursor-pointer transition"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Folder</span>
                          </button>
                        </div>

                        <div className="border border-ide-border bg-ide-bg overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-125">
                            <thead>
                              <tr className="bg-ide-card border-b border-ide-border text-slate-400 font-medium text-[11px]">
                                <th className="p-2 border-r border-ide-border">Monitored Folder</th>
                                <th className="p-2 border-r border-ide-border">Override Save Path</th>
                                <th className="p-2 border-r border-ide-border">Status</th>
                                <th className="p-2 border-r border-ide-border">Action per Folder</th>
                                <th className="p-2 w-10 text-center">Delete</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-ide-border/40 text-slate-200 text-xs">
                              {autoImportFolders.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-3 text-center text-slate-500 italic">
                                    No monitored folders added.
                                  </td>
                                </tr>
                              ) : (
                                autoImportFolders.map((rule) => (
                                  <tr key={rule.id} className="hover:bg-white/3">
                                    <td className="p-2 border-r border-ide-border font-mono">
                                      <input
                                        type="text"
                                        value={rule.folder}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          setAutoImportFolders((prev) =>
                                            prev.map((r) => (r.id === rule.id ? { ...r, folder: val } : r))
                                          )
                                        }}
                                        className="w-full bg-transparent border-none text-slate-100 text-xs focus:ring-0"
                                      />
                                    </td>
                                    <td className="p-2 border-r border-ide-border font-mono">
                                      <input
                                        type="text"
                                        value={rule.overrideSavePath}
                                        onChange={(e) => {
                                          const val = e.target.value
                                          setAutoImportFolders((prev) =>
                                            prev.map((r) =>
                                              r.id === rule.id ? { ...r, overrideSavePath: val } : r
                                            )
                                          )
                                        }}
                                        placeholder="Default if empty"
                                        className="w-full bg-transparent border-none text-slate-400 text-xs focus:ring-0"
                                      />
                                    </td>
                                    <td className="p-2 border-r border-ide-border text-emerald-400 font-medium">
                                      {rule.status}
                                    </td>
                                    <td className="p-2 border-r border-ide-border">
                                      <select
                                        value={rule.action}
                                        onChange={(e) => {
                                          const val = e.target.value as AutoImportFolderRule['action']
                                          setAutoImportFolders((prev) =>
                                            prev.map((r) => (r.id === rule.id ? { ...r, action: val } : r))
                                          )
                                        }}
                                        className="bg-ide-bg border border-ide-border text-slate-200 px-1 py-0.5 text-[11px] cursor-pointer"
                                      >
                                        <option value="delete">Delete .torrent file</option>
                                        <option value="append_extension">Add .torrent file extension</option>
                                        <option value="move_backup">Move to backup folder</option>
                                      </select>
                                    </td>
                                    <td className="p-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveAutoImportFolder(rule.id)}
                                        className="text-slate-400 hover:text-rose-400 p-1"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </FieldsetGroup>

                    <FieldsetGroup title="Excluded File Types">
                      <FieldRow label="Excluded file extensions">
                        <input
                          type="text"
                          value={excludedFileExtensions}
                          onChange={(e) => setExcludedFileExtensions(e.target.value)}
                          placeholder="e.g. *.unwanted; *.txt"
                          className="w-72 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none"
                        />
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="Email Notification upon Download Completion">
                      <CheckboxField label="Send email notification upon download completion" checked={sendEmailNotification} onChange={setSendEmailNotification} />
                      {sendEmailNotification && (
                        <div className="space-y-2 pl-4 border-l border-ide-border my-1">
                          <FieldRow label="From Email Address">
                            <input
                              type="email"
                              value={emailFrom}
                              onChange={(e) => setEmailFrom(e.target.value)}
                              placeholder="sender@domain.com"
                              className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none"
                            />
                          </FieldRow>
                          <FieldRow label="To Email Address">
                            <input
                              type="email"
                              value={emailTo}
                              onChange={(e) => setEmailTo(e.target.value)}
                              placeholder="recipient@domain.com"
                              className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none"
                            />
                          </FieldRow>
                          <FieldRow label="SMTP Server">
                            <input
                              type="text"
                              value={smtpServer}
                              onChange={(e) => setSmtpServer(e.target.value)}
                              placeholder="smtp.gmail.com"
                              className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none"
                            />
                          </FieldRow>
                          <CheckboxField label="Req. Authentication (SSL / TLS)" checked={smtpAuthRequired} onChange={setSmtpAuthRequired} />
                          {smtpAuthRequired && (
                            <div className="pl-4 space-y-1.5">
                              <FieldRow label="SMTP Username">
                                <input type="text" value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                              </FieldRow>
                              <FieldRow label="SMTP Password">
                                <input type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                              </FieldRow>
                            </div>
                          )}
                        </div>
                      )}
                    </FieldsetGroup>

                    <FieldsetGroup title="Run External Program">
                      <CheckboxField label="Run program on torrent completion" checked={runProgramOnCompletionEnabled} onChange={setRunProgramOnCompletionEnabled} />
                      {runProgramOnCompletionEnabled && (
                        <div className="pl-4">
                          <input
                            type="text"
                            value={runProgramOnCompletionCmd}
                            onChange={(e) => setRunProgramOnCompletionCmd(e.target.value)}
                            placeholder="C:\script.bat %N %F %R %D"
                            className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none"
                          />
                        </div>
                      )}
                      <CheckboxField label="Run program on torrent added" checked={runProgramOnAddedEnabled} onChange={setRunProgramOnAddedEnabled} />
                      {runProgramOnAddedEnabled && (
                        <div className="pl-4">
                          <input
                            type="text"
                            value={runProgramOnAddedCmd}
                            onChange={(e) => setRunProgramOnAddedCmd(e.target.value)}
                            placeholder="C:\script_on_add.bat %N %F"
                            className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none"
                          />
                        </div>
                      )}
                    </FieldsetGroup>
                  </>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 3. CONNECTION TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeTab === 'connection' && (
                  <>
                    <FieldsetGroup title="Listening Port">
                      <FieldRow label="Port used for incoming connections:">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={incomingPort}
                            onChange={(e) => setIncomingPort(parseInt(e.target.value, 10) || 0)}
                            className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleRandomizePort}
                            className="px-3 py-1 bg-ide-card hover:bg-ide-border border border-ide-border text-slate-200 text-xs transition cursor-pointer font-medium"
                          >
                            Random
                          </button>
                        </div>
                      </FieldRow>
                      <CheckboxField label="Use UPnP / NAT-PMP port forwarding from my router" checked={useUPnP} onChange={setUseUPnP} />
                      <CheckboxField label="Use different port on each startup" checked={useDifferentPortOnStartup} onChange={setUseDifferentPortOnStartup} />
                    </FieldsetGroup>

                    <FieldsetGroup title="Connection Limits">
                      <FieldRow label={<CheckboxLabel label="Global maximum number of connections:" checked={globalMaxConnectionsEnabled} onChange={setGlobalMaxConnectionsEnabled} />}>
                        <input type="number" disabled={!globalMaxConnectionsEnabled} value={globalMaxConnections} onChange={(e) => setGlobalMaxConnections(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40" />
                      </FieldRow>
                      <FieldRow label={<CheckboxLabel label="Maximum number of connections per torrent:" checked={maxConnectionsPerTorrentEnabled} onChange={setMaxConnectionsPerTorrentEnabled} />}>
                        <input type="number" disabled={!maxConnectionsPerTorrentEnabled} value={maxConnectionsPerTorrent} onChange={(e) => setMaxConnectionsPerTorrent(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40" />
                      </FieldRow>
                      <FieldRow label={<CheckboxLabel label="Global maximum number of upload slots:" checked={globalMaxUploadSlotsEnabled} onChange={setGlobalMaxUploadSlotsEnabled} />}>
                        <input type="number" disabled={!globalMaxUploadSlotsEnabled} value={globalMaxUploadSlots} onChange={(e) => setGlobalMaxUploadSlots(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40" />
                      </FieldRow>
                      <FieldRow label={<CheckboxLabel label="Maximum number of upload slots per torrent:" checked={maxUploadSlotsPerTorrentEnabled} onChange={setMaxUploadSlotsPerTorrentEnabled} />}>
                        <input type="number" disabled={!maxUploadSlotsPerTorrentEnabled} value={maxUploadSlotsPerTorrent} onChange={(e) => setMaxUploadSlotsPerTorrent(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40" />
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="Peer Connection Protocol">
                      <FieldRow label="Peer connection protocol:">
                        <select
                          value={peerProtocol}
                          onChange={(e) => setPeerProtocol(e.target.value as 'TCP and μTP' | 'TCP' | 'μTP')}
                          className="w-44 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="TCP and μTP">TCP and μTP</option>
                          <option value="TCP">TCP</option>
                          <option value="μTP">μTP</option>
                        </select>
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="Proxy Server">
                      <FieldRow label="Type:">
                        <select
                          value={proxyType}
                          onChange={(e) => setProxyType(e.target.value as 'none' | 'socks4' | 'socks5' | 'http')}
                          className="w-44 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="none">(None)</option>
                          <option value="socks4">SOCKS4</option>
                          <option value="socks5">SOCKS5</option>
                          <option value="http">HTTP</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Host / IP:">
                        <input type="text" value={proxyHost} onChange={(e) => setProxyHost(e.target.value)} className="w-44 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Port:">
                        <input type="number" value={proxyPort} onChange={(e) => setProxyPort(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <CheckboxField label="Authentication required" checked={proxyAuthRequired} onChange={setProxyAuthRequired} />
                      {proxyAuthRequired && (
                        <div className="space-y-1.5 pl-4 border-l border-ide-border">
                          <FieldRow label="Proxy Username:">
                            <input type="text" value={proxyUsername} onChange={(e) => setProxyUsername(e.target.value)} className="w-44 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                          </FieldRow>
                          <FieldRow label="Proxy Password:">
                            <input type="password" value={proxyPassword} onChange={(e) => setProxyPassword(e.target.value)} className="w-44 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                          </FieldRow>
                        </div>
                      )}
                      <CheckboxField label="Use proxy for peer connections" checked={proxyPeerConnections} onChange={setProxyPeerConnections} />
                      <CheckboxField label="Use proxy for web seed connections" checked={proxyWebSeeds} onChange={setProxyWebSeeds} />
                      <CheckboxField label="Use proxy for hostname lookup" checked={proxyHostnameLookup} onChange={setProxyHostnameLookup} />
                      <CheckboxField label="Use proxy only for torrents" checked={proxyOnlyForTorrents} onChange={setProxyOnlyForTorrents} />
                    </FieldsetGroup>

                    <FieldsetGroup title="IP Filtering">
                      <PathRow label="Filter path (.dat, .p2p, .p2b files)" value={ipFilterPath} onChange={setIpFilterPath} onBrowse={() => handleBrowse(ipFilterPath, setIpFilterPath)} />
                      <CheckboxField label="Apply to trackers" checked={ipFilterApplyToTrackers} onChange={setIpFilterApplyToTrackers} />
                      <FieldRow label="Banned IP addresses:">
                        <button
                          type="button"
                          onClick={() => setIsIpFilterModalOpen(true)}
                          className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-200 font-semibold text-xs rounded-none flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          <span>Edit IP Filter... ({bannedIps.length} rules)</span>
                        </button>
                      </FieldRow>
                    </FieldsetGroup>
                  </>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 4. SPEED TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeTab === 'speed' && (
                  <>
                    <FieldsetGroup title="Global Rate Limits">
                      <FieldRow label="Upload (KiB/s, 0 = ∞):">
                        <input type="number" value={globalUploadLimitKbps} onChange={(e) => setGlobalUploadLimitKbps(parseInt(e.target.value, 10) || 0)} className="w-28 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Download (KiB/s, 0 = ∞):">
                        <input type="number" value={globalDownloadLimitKbps} onChange={(e) => setGlobalDownloadLimitKbps(parseInt(e.target.value, 10) || 0)} className="w-28 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="Alternative Rate Limits">
                      <FieldRow label="Upload (KiB/s, 0 = ∞):">
                        <input type="number" value={altUploadLimitKbps} onChange={(e) => setAltUploadLimitKbps(parseInt(e.target.value, 10) || 0)} className="w-28 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Download (KiB/s, 0 = ∞):">
                        <input type="number" value={altDownloadLimitKbps} onChange={(e) => setAltDownloadLimitKbps(parseInt(e.target.value, 10) || 0)} className="w-28 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <CheckboxField label="Schedule Alternative Rate Limits" checked={scheduleAltRateLimits} onChange={setScheduleAltRateLimits} />
                      {scheduleAltRateLimits && (
                        <FieldRow label="Schedule time window & days:" indent>
                          <div className="flex items-center gap-2">
                            <input type="time" value={altRateLimitsFrom} onChange={(e) => setAltRateLimitsFrom(e.target.value)} className="bg-ide-bg border border-ide-border text-slate-100 px-2 py-0.5 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                            <span className="text-slate-400">-</span>
                            <input type="time" value={altRateLimitsTo} onChange={(e) => setAltRateLimitsTo(e.target.value)} className="bg-ide-bg border border-ide-border text-slate-100 px-2 py-0.5 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                            <select value={altRateLimitsDays} onChange={(e) => setAltRateLimitsDays(e.target.value)} className="bg-ide-bg border border-ide-border text-slate-100 px-2 py-0.5 text-xs cursor-pointer focus:border-theme-accent focus:outline-none">
                              <option value="everyday">Everyday</option>
                              <option value="weekdays">Weekdays</option>
                              <option value="weekends">Weekends</option>
                            </select>
                          </div>
                        </FieldRow>
                      )}
                    </FieldsetGroup>

                    <FieldsetGroup title="Rate Limit Options">
                      <CheckboxField label="Apply rate limit to transport overhead" checked={applyLimitToTransportOverhead} onChange={setApplyLimitToTransportOverhead} />
                      <CheckboxField label="Apply rate limit to μTP protocol" checked={applyLimitToUTP} onChange={setApplyLimitToUTP} />
                      <CheckboxField label="Apply rate limit to peers on LAN" checked={applyLimitToLanPeers} onChange={setApplyLimitToLanPeers} />
                    </FieldsetGroup>
                  </>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 5. BITTORRENT TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeTab === 'bittorrent' && (
                  <>
                    {/* Privacy Fieldset */}
                    <FieldsetGroup title="Privacy">
                      <CheckboxField label="Enable DHT (decentralized network) to find more peers" checked={enableDHT} onChange={setEnableDHT} />
                      <CheckboxField label="Enable Peer Exchange (PeX) to find more peers" checked={enablePeX} onChange={setEnablePeX} />
                      <CheckboxField label="Enable Local Peer Discovery to find more peers" checked={enableLSD} onChange={setEnableLSD} />

                      <div className="flex items-center gap-3 py-1">
                        <span className="text-slate-200 text-xs">Encryption mode:</span>
                        <select
                          value={encryptionMode}
                          onChange={(e) => setEncryptionMode(e.target.value as 'allow' | 'require' | 'disable')}
                          className="w-44 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="allow">Allow encryption</option>
                          <option value="require">Require encryption</option>
                          <option value="disable">Disable encryption</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <input
                          type="checkbox"
                          checked={enableAnonymousMode}
                          onChange={(e) => setEnableAnonymousMode(e.target.checked)}
                          className="h-4 w-4 border-ide-border bg-ide-bg accent-theme-accent cursor-pointer"
                        />
                        <span className="text-slate-200 text-xs">Enable anonymous mode</span>
                        <a href="https://github.com/qbittorrent/qBittorrent/wiki" target="_blank" rel="noreferrer" className="text-theme-bright hover:underline text-xs">
                          (More information)
                        </a>
                      </div>
                    </FieldsetGroup>

                    {/* Standalone Item: Maximum active checking torrents */}
                    <div className="flex items-center justify-between py-1 px-1">
                      <span className="text-slate-200 text-xs font-normal">Maximum active checking torrents:</span>
                      <input
                        type="number"
                        value={maxActiveCheckingTorrents}
                        onChange={(e) => setMaxActiveCheckingTorrents(parseInt(e.target.value, 10) || 0)}
                        className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none"
                      />
                    </div>

                    {/* Torrent Queueing Fieldset with Checkbox in Legend */}
                    <FieldsetGroup
                      title="Torrent Queueing"
                      checked={maxActiveTorrentsEnabled}
                      onCheckedChange={setMaxActiveTorrentsEnabled}
                    >
                      <FieldRow label={<CheckboxLabel label="Maximum active downloads:" checked={maxActiveDownloadsEnabled} onChange={setMaxActiveDownloadsEnabled} />}>
                        <input
                          type="number"
                          disabled={!maxActiveDownloadsEnabled}
                          value={maxActiveDownloads}
                          onChange={(e) => setMaxActiveDownloads(parseInt(e.target.value, 10) || 0)}
                          className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
                        />
                      </FieldRow>

                      <FieldRow label={<CheckboxLabel label="Maximum active uploads:" checked={maxActiveUploadsEnabled} onChange={setMaxActiveUploadsEnabled} />}>
                        <input
                          type="number"
                          disabled={!maxActiveUploadsEnabled}
                          value={maxActiveUploads}
                          onChange={(e) => setMaxActiveUploads(parseInt(e.target.value, 10) || 0)}
                          className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
                        />
                      </FieldRow>

                      <FieldRow label="Maximum active torrents:">
                        <input
                          type="number"
                          disabled={!maxActiveTorrentsEnabled}
                          value={maxActiveTorrents}
                          onChange={(e) => setMaxActiveTorrents(parseInt(e.target.value, 10) || 0)}
                          className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
                        />
                      </FieldRow>

                      {/* Nested Sub-Fieldset: Do not count slow torrents in these limits */}
                      <FieldsetGroup
                        title="Do not count slow torrents in these limits"
                        checked={dontCountSlowTorrents}
                        onCheckedChange={setDontCountSlowTorrents}
                      >
                        <FieldRow label="Download rate threshold:">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              disabled={!dontCountSlowTorrents}
                              value={downloadRateThresholdKbps}
                              onChange={(e) => setDownloadRateThresholdKbps(parseInt(e.target.value, 10) || 0)}
                              className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
                            />
                            <span className="text-slate-400 text-xs">KiB/s</span>
                          </div>
                        </FieldRow>

                        <FieldRow label="Upload rate threshold:">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              disabled={!dontCountSlowTorrents}
                              value={uploadRateThresholdKbps}
                              onChange={(e) => setUploadRateThresholdKbps(parseInt(e.target.value, 10) || 0)}
                              className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
                            />
                            <span className="text-slate-400 text-xs">KiB/s</span>
                          </div>
                        </FieldRow>

                        <FieldRow label="Torrent inactivity timer:">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              disabled={!dontCountSlowTorrents}
                              value={torrentInactivityTimerSec}
                              onChange={(e) => setTorrentInactivityTimerSec(parseInt(e.target.value, 10) || 0)}
                              className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
                            />
                            <span className="text-slate-400 text-xs">sec</span>
                          </div>
                        </FieldRow>
                      </FieldsetGroup>
                    </FieldsetGroup>

                    {/* Seeding Limits Fieldset */}
                    <FieldsetGroup title="Seeding Limits">
                      <FieldRow label={<CheckboxLabel label="When ratio reaches" checked={seedingRatioLimitEnabled} onChange={setSeedingRatioLimitEnabled} />}>
                        <input
                          type="number"
                          step="0.1"
                          disabled={!seedingRatioLimitEnabled}
                          value={seedingRatioLimit}
                          onChange={(e) => setSeedingRatioLimit(parseFloat(e.target.value) || 0)}
                          className="w-28 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
                        />
                      </FieldRow>

                      <FieldRow label={<CheckboxLabel label="When total seeding time reaches" checked={seedingTimeLimitEnabled} onChange={setSeedingTimeLimitEnabled} />}>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            disabled={!seedingTimeLimitEnabled}
                            value={seedingTimeLimitMin}
                            onChange={(e) => setSeedingTimeLimitMin(parseInt(e.target.value, 10) || 0)}
                            className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
                          />
                          <span className="text-slate-400 text-xs">min</span>
                        </div>
                      </FieldRow>

                      <FieldRow label={<CheckboxLabel label="When inactive seeding time reaches" checked={inactiveTimeLimitEnabled} onChange={setInactiveTimeLimitEnabled} />}>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            disabled={!inactiveTimeLimitEnabled}
                            value={inactiveTimeLimitMin}
                            onChange={(e) => setInactiveTimeLimitMin(parseInt(e.target.value, 10) || 0)}
                            className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
                          />
                          <span className="text-slate-400 text-xs">min</span>
                        </div>
                      </FieldRow>

                      <FieldRow label="then">
                        <select
                          value={seedingLimitAction}
                          onChange={(e) => setSeedingLimitAction(e.target.value as 'pause' | 'remove' | 'remove_and_delete_files' | 'super_seeding')}
                          className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="pause">Stop torrent</option>
                          <option value="remove">Remove torrent</option>
                          <option value="remove_and_delete_files">Remove torrent and files</option>
                          <option value="super_seeding">Enable Super Seeding</option>
                        </select>
                      </FieldRow>

                      <div className="pt-2 border-t border-ide-border/50 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-normal">Torrent management ratio rule:</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="ratioRule" checked={autoTorrentManagementRatioRule === 'global'} onChange={() => setAutoTorrentManagementRatioRule('global')} className="accent-theme-accent" />
                            <span>Global</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="ratioRule" checked={autoTorrentManagementRatioRule === 'manual'} onChange={() => setAutoTorrentManagementRatioRule('manual')} className="accent-theme-accent" />
                            <span>Manual</span>
                          </label>
                        </div>
                      </div>
                    </FieldsetGroup>

                    {/* Automatically append these trackers Fieldset */}
                    <FieldsetGroup
                      title="Automatically append these trackers to new downloads:"
                      checked={autoAppendTrackersEnabled}
                      onCheckedChange={setAutoAppendTrackersEnabled}
                    >
                      {autoAppendTrackersEnabled && (
                        <textarea
                          rows={3}
                          value={autoAppendTrackersText}
                          onChange={(e) => setAutoAppendTrackersText(e.target.value)}
                          placeholder="udp://tracker.openbittorrent.com:80/announce"
                          className="w-full bg-ide-bg border border-ide-border text-slate-100 p-2 text-xs font-mono focus:border-theme-accent focus:outline-none"
                        />
                      )}
                    </FieldsetGroup>
                  </>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 6. RSS TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeTab === 'rss' && (
                  <>
                    <FieldsetGroup title="RSS Reader">
                      <CheckboxField label="Enable fetching RSS feeds" checked={enableFetchingRss} onChange={setEnableFetchingRss} />
                      <FieldRow label="Feeds refresh interval:">
                        <div className="flex items-center gap-1.5">
                          <input type="number" value={rssRefreshIntervalMin} onChange={(e) => setRssRefreshIntervalMin(parseInt(e.target.value, 10) || 0)} className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none" />
                          <span className="text-slate-400">min</span>
                        </div>
                      </FieldRow>
                      <FieldRow label="Maximum number of articles per feed:">
                        <input type="number" value={rssMaxArticlesPerFeed} onChange={(e) => setRssMaxArticlesPerFeed(parseInt(e.target.value, 10) || 0)} className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="RSS Torrent Auto Downloader">
                      <CheckboxField label="Enable auto downloading of RSS torrents" checked={enableAutoDownloadingRss} onChange={setEnableAutoDownloadingRss} />
                      <CheckboxField label="Smart Episode Filter (Filters duplicate TV show episodes, parses S01E01)" checked={enableSmartEpisodeFilter} onChange={setEnableSmartEpisodeFilter} />
                      <FieldRow label="Auto Downloading Rules Manager:">
                        <button
                          type="button"
                          onClick={() => setIsRssRulesModalOpen(true)}
                          className="px-3 py-1.5 bg-orange-950/60 hover:bg-orange-900 border border-orange-800/80 text-orange-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <Rss className="h-4 w-4" />
                          <span>Edit Auto Downloading Rules... ({rssAutoDownloadRules.length} rules)</span>
                        </button>
                      </FieldRow>
                    </FieldsetGroup>
                  </>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 7. WEB UI TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeTab === 'webui' && (
                  <>
                    <FieldsetGroup title="Web User Interface (Remote control)">
                      <CheckboxField label="Web UI (Remote control)" checked={enableWebUi} onChange={setEnableWebUi} />
                      {enableWebUi && (
                        <div className="space-y-2 pl-4 border-l border-ide-border my-1">
                          <FieldRow label="IP Address:">
                            <input type="text" value={webUiIpAddress} onChange={(e) => setWebUiIpAddress(e.target.value)} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                          </FieldRow>
                          <FieldRow label="Port:">
                            <input type="number" value={webUiPort} onChange={(e) => setWebUiPort(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                          </FieldRow>
                          <CheckboxField label="Use UPnP / NAT-PMP to forward the port" checked={webUiUseUPnP} onChange={setWebUiUseUPnP} />
                          <CheckboxField label="Use HTTPS instead of HTTP" checked={webUiUseHttps} onChange={setWebUiUseHttps} />
                          {webUiUseHttps && (
                            <div className="space-y-1.5 pl-4 border-l border-ide-border">
                              <PathRow label="Certificate path" value={webUiCertPath} onChange={setWebUiCertPath} onBrowse={() => handleBrowse(webUiCertPath, setWebUiCertPath)} />
                              <PathRow label="Key path" value={webUiKeyPath} onChange={setWebUiKeyPath} onBrowse={() => handleBrowse(webUiKeyPath, setWebUiKeyPath)} />
                            </div>
                          )}
                        </div>
                      )}
                    </FieldsetGroup>

                    <FieldsetGroup title="Authentication">
                      <FieldRow label="Username:">
                        <input type="text" value={webUiUsername} onChange={(e) => setWebUiUsername(e.target.value)} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Password:">
                        <input type="password" value={webUiPassword} onChange={(e) => setWebUiPassword(e.target.value)} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <CheckboxField label="Bypass authentication for clients on localhost" checked={webUiBypassLocalhost} onChange={setWebUiBypassLocalhost} />
                      <CheckboxField label="Bypass authentication for clients in whitelisted IP subnets" checked={webUiBypassSubnetsEnabled} onChange={setWebUiBypassSubnetsEnabled} />
                      {webUiBypassSubnetsEnabled && (
                        <FieldRow label="Subnet whitelist:" indent>
                          <input type="text" value={webUiSubnetWhitelist} onChange={(e) => setWebUiSubnetWhitelist(e.target.value)} placeholder="192.168.1.0/24; 10.0.0.0/16" className="w-64 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                        </FieldRow>
                      )}
                      <FieldRow label="Max authentication failures before ban:">
                        <input type="number" value={webUiMaxAuthFailures} onChange={(e) => setWebUiMaxAuthFailures(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Ban duration (Seconds):">
                        <input type="number" value={webUiBanDurationSec} onChange={(e) => setWebUiBanDurationSec(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="Security">
                      <CheckboxField label="Enable Cross-Site Request Forgery (CSRF) protection" checked={enableCsrfProtection} onChange={setEnableCsrfProtection} />
                      <CheckboxField label="Enable Clickjacking protection" checked={enableClickjackingProtection} onChange={setEnableClickjackingProtection} />
                      <CheckboxField label="Enable Host header validation" checked={enableHostHeaderValidation} onChange={setEnableHostHeaderValidation} />
                      {enableHostHeaderValidation && (
                        <FieldRow label="Server domains:" indent>
                          <input type="text" value={webUiServerDomains} onChange={(e) => setWebUiServerDomains(e.target.value)} placeholder="localhost; mydomain.org" className="w-64 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                        </FieldRow>
                      )}
                    </FieldsetGroup>

                    <FieldsetGroup title="Alternative Web UI">
                      <CheckboxField label="Use alternative Web UI" checked={useAltWebUi} onChange={setUseAltWebUi} />
                      {useAltWebUi && (
                        <PathRow label="Files location" value={altWebUiFilesLocation} onChange={setAltWebUiFilesLocation} onBrowse={() => handleBrowse(altWebUiFilesLocation, setAltWebUiFilesLocation)} />
                      )}
                    </FieldsetGroup>
                  </>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* 8. ADVANCED TAB */}
                {/* ────────────────────────────────────────────────────────── */}
                {activeTab === 'advanced' && (
                  <>
                    <FieldsetGroup title="Grabbit Client Section">
                      <FieldRow label="Resume data storage type (requires restart):">
                        <select className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none">
                          <option>Fastresume files</option>
                          <option>SQLite database</option>
                        </select>
                      </FieldRow>

                      <FieldRow label="Torrent content removing mode:">
                        <select className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none">
                          <option>Delete files permanently</option>
                          <option>Move files to trash</option>
                        </select>
                      </FieldRow>

                      <FieldRow label="Process memory priority (?):">
                        <select
                          value={processMemoryPriority}
                          onChange={(e) => setProcessMemoryPriority(e.target.value as 'normal' | 'below_normal' | 'low')}
                          className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="normal">Normal</option>
                          <option value="below_normal">Below normal</option>
                          <option value="low">Low</option>
                        </select>
                      </FieldRow>

                      <FieldRow label="Network interface:">
                        <select
                          value={networkInterface}
                          onChange={(e) => setNetworkInterface(e.target.value)}
                          className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="Any interface">Any interface</option>
                          <option value="Ethernet">Ethernet</option>
                          <option value="Wi-Fi">Wi-Fi</option>
                          <option value="VPN TUN/TAP">VPN TUN/TAP</option>
                        </select>
                      </FieldRow>

                      <FieldRow label="Optional IP address to bind to:">
                        <select
                          value={bindIpAddress}
                          onChange={(e) => setBindIpAddress(e.target.value)}
                          className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono cursor-pointer focus:border-theme-accent focus:outline-none"
                        >
                          <option value="All addresses">All addresses</option>
                          <option value="192.168.1.100">192.168.1.100</option>
                        </select>
                      </FieldRow>

                      <FieldRow label="Save resume data interval [0: disabled]:">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={saveResumeDataIntervalMin}
                            onChange={(e) => setSaveResumeDataIntervalMin(parseInt(e.target.value, 10) || 0)}
                            className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none"
                          />
                          <span className="text-slate-400">min</span>
                        </div>
                      </FieldRow>

                      <FieldRow label="Save statistics interval [0: disabled]:">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={15}
                            className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none"
                          />
                          <span className="text-slate-400">min</span>
                        </div>
                      </FieldRow>

                      <FieldRow label=".torrent file size limit:">
                        <input
                          type="text"
                          value="100 MiB"
                          readOnly
                          className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono"
                        />
                      </FieldRow>

                      <CheckboxField label="Confirm torrent recheck" checked={confirmTorrentRecheck} onChange={setConfirmTorrentRecheck} />
                      <CheckboxField label="Recheck torrents on completion" checked={recheckOnCompletion} onChange={setRecheckOnCompletion} />
                      <FieldRow label="Customize application instance name:">
                        <input
                          type="text"
                          placeholder="Grabbit v1.0.0"
                          className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none"
                        />
                      </FieldRow>
                      <FieldRow label="Refresh interval:">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={transferListRefreshIntervalMs}
                            onChange={(e) => setTransferListRefreshIntervalMs(parseInt(e.target.value, 10) || 0)}
                            className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none"
                          />
                          <span className="text-slate-400">ms</span>
                        </div>
                      </FieldRow>
                      <CheckboxField label="Resolve peer host names" checked={resolvePeerHostnames} onChange={setResolvePeerHostnames} />
                      <CheckboxField label="Resolve peer countries" checked={resolvePeerCountries} onChange={setResolvePeerCountries} />
                      <CheckboxField label="Display peer list with icons" checked={displayPeerListWithIcons} onChange={setDisplayPeerListWithIcons} />
                      <CheckboxField label="Display notifications" checked={displayNotifications} onChange={setDisplayNotifications} />
                      <CheckboxField label="Display notifications for added torrents" checked={displayNotificationsForAdded} onChange={setDisplayNotificationsForAdded} />
                      <CheckboxField label="Confirm removal of all tags" checked={confirmRemoveAllTags} onChange={setConfirmRemoveAllTags} />
                      <CheckboxField label="Download tracker's favicon" checked={downloadTrackerFavicon} onChange={setDownloadTrackerFavicon} />
                      <FieldRow label="Save path history length:">
                        <input type="number" value={savePathHistoryLength} onChange={(e) => setSavePathHistoryLength(parseInt(e.target.value, 10) || 0)} className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs text-center font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <CheckboxField label="Enable speed graphs" checked={enableSpeedGraphs} onChange={setEnableSpeedGraphs} />
                      <CheckboxField label="Enable icons in menus" checked={enableIconsInMenus} onChange={setEnableIconsInMenus} />
                      <CheckboxField label="Listen on IPv6 address" checked={listenOnIPv6} onChange={setListenOnIPv6} />
                      <CheckboxField label="Check for software updates" checked={checkForUpdates} onChange={setCheckForUpdates} />
                      <FieldRow label="Tracker status colors:">
                        <div className="flex items-center gap-2">
                          <input type="color" value={trackerStatusColors.working} onChange={(e) => setTrackerStatusColors(p => ({ ...p, working: e.target.value }))} className="w-5 h-5 cursor-pointer bg-transparent border-0" title="Working" />
                          <input type="color" value={trackerStatusColors.warning} onChange={(e) => setTrackerStatusColors(p => ({ ...p, warning: e.target.value }))} className="w-5 h-5 cursor-pointer bg-transparent border-0" title="Warning" />
                          <input type="color" value={trackerStatusColors.error} onChange={(e) => setTrackerStatusColors(p => ({ ...p, error: e.target.value }))} className="w-5 h-5 cursor-pointer bg-transparent border-0" title="Error" />
                          <input type="color" value={trackerStatusColors.disabled} onChange={(e) => setTrackerStatusColors(p => ({ ...p, disabled: e.target.value }))} className="w-5 h-5 cursor-pointer bg-transparent border-0" title="Disabled" />
                        </div>
                      </FieldRow>
                    </FieldsetGroup>

                    <FieldsetGroup title="Embedded Tracker">
                      <CheckboxField label="Enable Embedded Tracker" checked={enableEmbeddedTracker} onChange={setEnableEmbeddedTracker} />
                      {enableEmbeddedTracker && (
                        <>
                          <FieldRow label="Port:">
                            <input type="number" value={embeddedTrackerPort} onChange={(e) => setEmbeddedTrackerPort(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                          </FieldRow>
                          <FieldRow label="URL:">
                            <input type="text" value={embeddedTrackerUrl} onChange={(e) => setEmbeddedTrackerUrl(e.target.value)} placeholder="http://localhost:9000/announce" className="w-56 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                          </FieldRow>
                        </>
                      )}
                    </FieldsetGroup>

                    <FieldsetGroup title="libtorrent / Engine Section">
                      <FieldRow label="Asynchronous I/O threads:">
                        <input type="number" value={asyncIoThreads} onChange={(e) => setAsyncIoThreads(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Hashing threads:">
                        <input type="number" value={hashingThreads} onChange={(e) => setHashingThreads(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="File pool size:">
                        <input type="number" value={filePoolSize} onChange={(e) => setFilePoolSize(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Outstanding memory low watermark (MiB):">
                        <input type="number" value={outstandingMemoryLowWatermarkMb} onChange={(e) => setOutstandingMemoryLowWatermarkMb(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Outstanding memory high watermark (MiB):">
                        <input type="number" value={outstandingMemoryHighWatermarkMb} onChange={(e) => setOutstandingMemoryHighWatermarkMb(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Disk cache (-1 for auto, MiB):">
                        <input type="number" value={diskCacheMb} onChange={(e) => setDiskCacheMb(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Disk cache expiry interval (Seconds):">
                        <input type="number" value={diskCacheExpirySec} onChange={(e) => setDiskCacheExpirySec(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Disk IO type:">
                        <select value={diskIoType} onChange={(e) => setDiskIoType(e.target.value as 'default' | 'memory_mapped' | 'posix')} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none">
                          <option value="default">Default</option>
                          <option value="memory_mapped">Memory mapped files</option>
                          <option value="posix">POSIX-compliant</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Disk IO read mode:">
                        <select value={diskIoReadMode} onChange={(e) => setDiskIoReadMode(e.target.value as 'enable_os_cache' | 'disable_os_cache')} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none">
                          <option value="enable_os_cache">Enable OS cache</option>
                          <option value="disable_os_cache">Disable OS cache</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Disk IO write mode:">
                        <select value={diskIoWriteMode} onChange={(e) => setDiskIoWriteMode(e.target.value as 'enable_os_cache' | 'disable_os_cache')} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none">
                          <option value="enable_os_cache">Enable OS cache</option>
                          <option value="disable_os_cache">Disable OS cache</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Upload choking algorithm:">
                        <select value={uploadChokingAlgorithm} onChange={(e) => setUploadChokingAlgorithm(e.target.value as 'round_robin' | 'fastest_upload' | 'anti_leech')} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none">
                          <option value="round_robin">Round-robin</option>
                          <option value="fastest_upload">Fastest upload</option>
                          <option value="anti_leech">Anti-leech</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Upload slots behavior:">
                        <select value={uploadSlotsBehavior} onChange={(e) => setUploadSlotsBehavior(e.target.value as 'fixed_slots' | 'token_bucket')} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none">
                          <option value="fixed_slots">Fixed slots</option>
                          <option value="token_bucket">Token bucket</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Choking algorithm:">
                        <select value={chokingAlgorithm} onChange={(e) => setChokingAlgorithm(e.target.value as 'fixed_slots' | 'rate_based')} className="w-48 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs cursor-pointer focus:border-theme-accent focus:outline-none">
                          <option value="fixed_slots">Fixed slots</option>
                          <option value="rate_based">Rate-based</option>
                        </select>
                      </FieldRow>
                      <FieldRow label="Send buffer watermark (KiB):">
                        <input type="number" value={sendBufferWatermarkKb} onChange={(e) => setSendBufferWatermarkKb(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Send buffer low watermark (KiB):">
                        <input type="number" value={sendBufferLowWatermarkKb} onChange={(e) => setSendBufferLowWatermarkKb(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Send buffer watermark factor (%):">
                        <input type="number" value={sendBufferWatermarkFactorPct} onChange={(e) => setSendBufferWatermarkFactorPct(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Socket backlog size:">
                        <input type="number" value={socketBacklogSize} onChange={(e) => setSocketBacklogSize(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>
                      <FieldRow label="Outgoing ports Min / Max:">
                        <div className="flex items-center gap-2">
                          <input type="number" value={outgoingPortsMin} onChange={(e) => setOutgoingPortsMin(parseInt(e.target.value, 10) || 0)} placeholder="Min" className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                          <span className="text-slate-400">-</span>
                          <input type="number" value={outgoingPortsMax} onChange={(e) => setOutgoingPortsMax(parseInt(e.target.value, 10) || 0)} placeholder="Max" className="w-20 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                        </div>
                      </FieldRow>
                      <FieldRow label="UPnP lease duration (Seconds):">
                        <input type="number" value={upnpLeaseDurationSec} onChange={(e) => setUpnpLeaseDurationSec(parseInt(e.target.value, 10) || 0)} className="w-24 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none" />
                      </FieldRow>

                      <CheckboxField label="Coalesce reads & writes" checked={coalesceReadsWrites} onChange={setCoalesceReadsWrites} />
                      <CheckboxField label="Piece extent affinity" checked={pieceExtentAffinity} onChange={setPieceExtentAffinity} />
                      <CheckboxField label="Send upload piece read hint" checked={sendUploadPieceReadHint} onChange={setSendUploadPieceReadHint} />
                      <CheckboxField label="Allow multiple connections from the same IP address" checked={allowMultipleConnectionsPerIp} onChange={setAllowMultipleConnectionsPerIp} />
                      <CheckboxField label="Validate HTTPS tracker certificates" checked={validateHttpsTrackerCertificates} onChange={setValidateHttpsTrackerCertificates} />
                    </FieldsetGroup>
                  </>
                )}
              </form>

              {/* ─── Grabbit Pinned Bottom Action Footer Bar ─── */}
              <div className="h-12 px-4 bg-ide-bg border-t border-ide-border flex items-center justify-end gap-2.5 shrink-0 select-none">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-1.5 bg-theme-accent text-slate-950 font-bold hover:bg-theme-bright text-xs shadow-md transition cursor-pointer"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-ide-card hover:bg-ide-border text-slate-200 border border-ide-border text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 bg-ide-card hover:bg-ide-border text-slate-200 border border-ide-border text-xs font-semibold transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Modals */}
      <IpFilterModal
        isOpen={isIpFilterModalOpen}
        onClose={() => setIsIpFilterModalOpen(false)}
        ipFilterPath={ipFilterPath}
        ipFilterApplyToTrackers={ipFilterApplyToTrackers}
        bannedIps={bannedIps}
        onSave={(data) => {
          setIpFilterPath(data.ipFilterPath)
          setIpFilterApplyToTrackers(data.ipFilterApplyToTrackers)
          setBannedIps(data.bannedIps)
        }}
      />

      <RssRulesManagerModal
        isOpen={isRssRulesModalOpen}
        onClose={() => setIsRssRulesModalOpen(false)}
        rules={rssAutoDownloadRules}
        onSave={(rules) => setRssAutoDownloadRules(rules)}
      />
    </>
  )
}

// ─── HELPER COMPONENTS FOR GRABBIT DESIGN SYSTEM ───

function FieldsetGroup({
  title,
  checked,
  onCheckedChange,
  children
}: {
  title: string | React.ReactNode
  checked?: boolean
  onCheckedChange?: (val: boolean) => void
  children: React.ReactNode
}) {
  return (
    <fieldset className="border border-ide-border bg-ide-card/50 p-3.5 pt-1.5 mb-4 shadow-xs relative">
      <legend className="px-2 py-0.5 text-xs font-bold text-theme-bright bg-ide-surface border border-ide-border select-none">
        {onCheckedChange !== undefined ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheckedChange(e.target.checked)}
              className="h-4 w-4 border-ide-border bg-ide-bg accent-theme-accent cursor-pointer"
            />
            <span>{title}</span>
          </label>
        ) : (
          title
        )}
      </legend>
      <div className="space-y-2.5 pt-1.5 text-xs">{children}</div>
    </fieldset>
  )
}

function FieldRow({
  label,
  children,
  indent = false
}: {
  label: string | React.ReactNode
  children: React.ReactNode
  indent?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-0.5 ${indent ? 'pl-4' : ''}`}>
      <div className="text-slate-200 text-xs font-normal shrink-0">{label}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
  indent = false
}: {
  label: string | React.ReactNode
  checked: boolean
  onChange: (val: boolean) => void
  indent?: boolean
}) {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer py-1 ${indent ? 'pl-5' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 border-ide-border bg-ide-bg accent-theme-accent cursor-pointer shrink-0"
      />
      <span className="text-slate-200 text-xs leading-snug">{label}</span>
    </label>
  )
}

function CheckboxLabel({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 border-ide-border bg-ide-bg accent-theme-accent cursor-pointer shrink-0"
      />
      <span>{label}</span>
    </label>
  )
}

function PathRow({
  label,
  value,
  onChange,
  onBrowse
}: {
  label: string
  value: string
  onChange: (val: string) => void
  onBrowse: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div className="text-slate-200 text-xs font-normal shrink-0">{label}</div>
      <div className="flex items-center gap-2 w-72">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={onBrowse}
          className="px-2.5 py-1 bg-ide-card hover:bg-ide-border border border-ide-border text-slate-200 text-xs transition cursor-pointer flex items-center gap-1 shrink-0 font-medium"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span>Browse</span>
        </button>
      </div>
    </div>
  )
}

function CheckboxPathRow({
  label,
  checked,
  onCheckedChange,
  value,
  onValueChange,
  onBrowse
}: {
  label: string
  checked: boolean
  onCheckedChange: (val: boolean) => void
  value: string
  onValueChange: (val: string) => void
  onBrowse: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <CheckboxLabel label={label} checked={checked} onChange={onCheckedChange} />
      <div className="flex items-center gap-2 w-72">
        <input
          type="text"
          disabled={!checked}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="flex-1 bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs font-mono focus:border-theme-accent focus:outline-none disabled:opacity-40"
        />
        <button
          type="button"
          disabled={!checked}
          onClick={onBrowse}
          className="px-2.5 py-1 bg-ide-card hover:bg-ide-border border border-ide-border text-slate-200 text-xs transition cursor-pointer flex items-center gap-1 shrink-0 font-medium disabled:opacity-40"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span>Browse</span>
        </button>
      </div>
    </div>
  )
}
