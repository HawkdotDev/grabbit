import React, { useState } from 'react'
import { EngineSettings, DownloadCategory } from '../../../../engine/types'
import {
  X,
  Sliders,
  FolderOpen,
  GripHorizontal,
  Globe,
  Wrench,
  Gauge,
  Rss,
  ExternalLink
} from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

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

  // Behavior State
  const [theme, setTheme] = useState(settings.theme || 'dark')
  const [autoCategorize, setAutoCategorize] = useState(settings.autoCategorize)
  const [enableNotifications, setEnableNotifications] = useState(settings.enableNotifications)
  const [startOnBoot, setStartOnBoot] = useState(settings.startOnBoot)
  const [refreshInterval, setRefreshInterval] = useState(1500)
  const [instanceName, setInstanceName] = useState('Grabbit Desktop')

  // Downloads State
  const [savePath, setSavePath] = useState(settings.defaultSavePath)
  const [maxConcurrent, setMaxConcurrent] = useState(settings.maxConcurrentDownloads)
  const [defaultThreads, setDefaultThreads] = useState(settings.defaultThreadCount)
  const [resumeDataStorage, setResumeDataStorage] = useState('Fastresume files')
  const [torrentRemovalMode, setTorrentRemovalMode] = useState('Delete files permanently')
  const [torrentSizeLimitMb, setTorrentSizeLimitMb] = useState(100)
  const [confirmRecheck, setConfirmRecheck] = useState(true)

  // Connection State
  const [networkInterface, setNetworkInterface] = useState('Any interface')
  const [bindIpAddress, setBindIpAddress] = useState('All addresses')
  const [proxyEnabled, setProxyEnabled] = useState(settings.proxyEnabled ?? false)
  const [proxyType, setProxyType] = useState(settings.proxyType ?? 'http')
  const [proxyHost, setProxyHost] = useState(settings.proxyHost ?? '127.0.0.1')
  const [proxyPort, setProxyPort] = useState(settings.proxyPort ?? 8080)
  const [enableDoH, setEnableDoH] = useState(settings.enableDoH ?? true)
  const [dohProvider, setDohProvider] = useState(settings.dohProvider ?? 'cloudflare')
  const [customDoHUrl, setCustomDoHUrl] = useState(settings.customDoHUrl ?? 'https://1.1.1.1/dns-query')
  const [enableWarp, setEnableWarp] = useState(settings.enableWarp ?? false)
  const [warpEndpoint, setWarpEndpoint] = useState(settings.warpEndpoint ?? '127.0.0.1:4001')

  // Speed State
  const [maxGlobalSpeed, setMaxGlobalSpeed] = useState(settings.maxGlobalSpeedLimitKbps)
  const [enableAdaptiveQoS, setEnableAdaptiveQoS] = useState(settings.enableAdaptiveQoS ?? true)
  const [categoryLimits, setCategoryLimits] = useState<Partial<Record<DownloadCategory, number>>>(
    settings.categorySpeedLimitsKbps ?? {}
  )

  // BitTorrent State
  const [forceTorrentEncryption, setForceTorrentEncryption] = useState(
    settings.forceTorrentEncryption ?? true
  )
  const [disableP2PTracking, setDisableP2PTracking] = useState(settings.disableP2PTracking ?? false)
  const [stripReferrer, setStripReferrer] = useState(settings.stripReferrer ?? true)
  const [customUserAgent, setCustomUserAgent] = useState(
    settings.customUserAgent ??
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  )
  const [saveResumeIntervalMin, setSaveResumeIntervalMin] = useState(60)
  const [saveStatsIntervalMin, setSaveStatsIntervalMin] = useState(15)

  // WebUI & RPC State
  const [enableRpcServer, setEnableRpcServer] = useState(settings.enableRpcServer ?? true)
  const [rpcPort, setRpcPort] = useState(settings.rpcPort ?? 6800)
  const [rpcSecretToken, setRpcSecretToken] = useState(settings.rpcSecretToken ?? 'gbt_secret_rpc')

  // Advanced State
  const [memoryPriority, setMemoryPriority] = useState('Below normal')
  const [resolveHostnames, setResolveHostnames] = useState(false)
  const [resolveCountries, setResolveCountries] = useState(true)

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const handleBrowseFolder = async (): Promise<void> => {
    if (window.api?.selectDirectory) {
      const selected = await window.api.selectDirectory(savePath)
      if (selected) setSavePath(selected)
    }
  }

  const handleCategoryLimitChange = (cat: DownloadCategory, val: number): void => {
    setCategoryLimits((prev) => ({
      ...prev,
      [cat]: val
    }))
  }

  const handleSave = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    onSave({
      maxConcurrentDownloads: maxConcurrent,
      defaultThreadCount: defaultThreads,
      maxGlobalSpeedLimitKbps: maxGlobalSpeed,
      enableAdaptiveQoS,
      enableRpcServer,
      rpcPort,
      rpcSecretToken,
      proxyEnabled,
      proxyType,
      proxyHost,
      proxyPort,
      categorySpeedLimitsKbps: categoryLimits,
      enableDoH,
      dohProvider,
      customDoHUrl,
      enableWarp,
      warpEndpoint,
      stripReferrer,
      customUserAgent,
      forceTorrentEncryption,
      disableP2PTracking,
      defaultSavePath: savePath,
      theme,
      autoCategorize,
      enableNotifications,
      startOnBoot
    })
    onClose()
  }

  const sidebarTabs: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }>; color: string }> =
    [
      { id: 'behavior', label: 'Behavior', icon: Sliders, color: 'text-amber-400 opacity-90' },
      { id: 'downloads', label: 'Downloads', icon: FolderDownIcon, color: 'text-sky-400 opacity-90' },
      { id: 'connection', label: 'Connection', icon: NetworkNodesIcon, color: 'text-cyan-400 opacity-90' },
      { id: 'speed', label: 'Speed', icon: Gauge, color: 'text-emerald-400 opacity-90' },
      { id: 'bittorrent', label: 'BitTorrent', icon: Globe, color: 'text-indigo-400 opacity-90' },
      { id: 'rss', label: 'RSS & Rules', icon: Rss, color: 'text-orange-400 opacity-90' },
      { id: 'webui', label: 'WebUI', icon: WebUIIcon, color: 'text-purple-400 opacity-90' },
      { id: 'advanced', label: 'Advanced', icon: Wrench, color: 'text-rose-400 opacity-90' }
    ]

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-3 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-4xl h-[620px] shadow-2xl overflow-hidden flex flex-col font-sans text-slate-100 ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* ─── Top qBittorrent Style Header Bar ─── */}
        <div
          onMouseDown={handleMouseDown}
          className="h-9 px-3 bg-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-theme-accent text-slate-950 rounded-none font-bold flex items-center justify-center text-[10px] shadow-sm">
              qb
            </div>
            <span className="font-semibold text-slate-100 text-xs tracking-tight">Options</span>
          </div>

          <div className="flex items-center gap-2">
            <GripHorizontal className="h-4 w-4 text-slate-500 shrink-0 opacity-70" />
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ─── Main Content Split (Left Sidebar + Right Table Pane) ─── */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-ide-bg">
          {/* Left Vertical Options Navigation Bar */}
          <div className="w-36 bg-ide-bg border-r border-ide-border flex flex-col py-2 shrink-0 select-none overflow-y-auto">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full py-2.5 px-2 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center rounded-none ${
                    isActive
                      ? 'bg-theme-tint text-theme-accent font-bold border-l-2 border-theme-accent'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${tab.color}`} />
                  <span className="text-[11px] font-medium leading-none">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Settings Grid / Table Pane */}
          <div className="flex-1 flex flex-col min-w-0 bg-ide-surface overflow-hidden">
            {/* Table Header Columns */}
            <div className="h-7 px-4 bg-ide-bg border-b border-ide-border flex items-center text-[11px] font-bold text-slate-300 shrink-0">
              <div className="w-1/2 flex items-center justify-between border-r border-ide-border pr-4">
                <span>Setting</span>
              </div>
              <div className="w-1/2 pl-4">
                <span>Value</span>
              </div>
            </div>

            {/* Scrollable Settings Rows */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-0">
              {/* Section Header Row */}
              <div className="px-4 py-2 bg-ide-card border-b border-ide-border flex items-center justify-between text-xs font-bold text-slate-200">
                <span>
                  {activeTab === 'behavior' && 'Application Behavior & Appearance'}
                  {activeTab === 'downloads' && 'Downloads & File Storage Section'}
                  {activeTab === 'connection' && 'Network Connection & Privacy Proxy'}
                  {activeTab === 'speed' && 'Bandwidth & Rate Limiting Controls'}
                  {activeTab === 'bittorrent' && 'BitTorrent Protocol & Swarm Options'}
                  {activeTab === 'rss' && 'RSS Feed & Automations Rules'}
                  {activeTab === 'webui' && 'Web UI & JSON-RPC Gateway'}
                  {activeTab === 'advanced' && 'Advanced Kernel & Memory Parameters'}
                </span>
                <a
                  href="https://github.com/HawkdotDev/grabbit#readme"
                  target="_blank"
                  rel="noreferrer"
                  className="text-theme-accent text-[11px] hover:underline flex items-center gap-1 font-normal"
                >
                  <span>Open documentation</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* ─── TAB: Behavior ─── */}
              {activeTab === 'behavior' && (
                <div className="divide-y divide-ide-border/50">
                  <TableRow label="Customize application instance name">
                    <input
                      type="text"
                      value={instanceName}
                      onChange={(e) => setInstanceName(e.target.value)}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                    />
                  </TableRow>

                  <TableRow label="Appearance theme">
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as EngineSettings['theme'])}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="dark">Dark Mode (IDE Default)</option>
                      <option value="carrot">Carrot Theme 🥕 (Pastel Orange/Green)</option>
                      <option value="light">Light Mode</option>
                      <option value="contrast">High Contrast</option>
                      <option value="custom">Custom Theme 🎨</option>
                    </select>
                  </TableRow>

                  <TableRow label="Refresh interval">
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="500">500 ms</option>
                      <option value="1000">1000 ms</option>
                      <option value="1500">1500 ms</option>
                      <option value="3000">3000 ms</option>
                    </select>
                  </TableRow>

                  <TableRow label="Display notifications">
                    <input
                      type="checkbox"
                      checked={enableNotifications}
                      onChange={(e) => setEnableNotifications(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  <TableRow label="Auto-categorize downloads by extension">
                    <input
                      type="checkbox"
                      checked={autoCategorize}
                      onChange={(e) => setAutoCategorize(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  <TableRow label="Start application on system boot">
                    <input
                      type="checkbox"
                      checked={startOnBoot}
                      onChange={(e) => setStartOnBoot(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>
                </div>
              )}

              {/* ─── TAB: Downloads ─── */}
              {activeTab === 'downloads' && (
                <div className="divide-y divide-ide-border/50">
                  <TableRow label="Default save location">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={savePath}
                        onChange={(e) => setSavePath(e.target.value)}
                        className="flex-1 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleBrowseFolder}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-ide-border text-slate-200 rounded-none cursor-pointer"
                      >
                        <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                      </button>
                    </div>
                  </TableRow>

                  <TableRow label="Resume data storage type (requires restart)">
                    <select
                      value={resumeDataStorage}
                      onChange={(e) => setResumeDataStorage(e.target.value)}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="Fastresume files">Fastresume files</option>
                      <option value="SQLite database">SQLite database</option>
                    </select>
                  </TableRow>

                  <TableRow label="Torrent content removing mode">
                    <select
                      value={torrentRemovalMode}
                      onChange={(e) => setTorrentRemovalMode(e.target.value)}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="Delete files permanently">Delete files permanently</option>
                      <option value="Move to trash / recycle bin">Move to trash / recycle bin</option>
                    </select>
                  </TableRow>

                  <TableRow label="Max concurrent downloads">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={maxConcurrent}
                      onChange={(e) => setMaxConcurrent(parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                    />
                  </TableRow>

                  <TableRow label="Default thread count per download">
                    <input
                      type="number"
                      min="1"
                      max="32"
                      value={defaultThreads}
                      onChange={(e) => setDefaultThreads(parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                    />
                  </TableRow>

                  <TableRow label=".torrent file size limit">
                    <select
                      value={`${torrentSizeLimitMb} MiB`}
                      onChange={(e) => setTorrentSizeLimitMb(parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="50 MiB">50 MiB</option>
                      <option value="100 MiB">100 MiB</option>
                      <option value="250 MiB">250 MiB</option>
                    </select>
                  </TableRow>

                  <TableRow label="Confirm torrent recheck">
                    <input
                      type="checkbox"
                      checked={confirmRecheck}
                      onChange={(e) => setConfirmRecheck(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>
                </div>
              )}

              {/* ─── TAB: Connection ─── */}
              {activeTab === 'connection' && (
                <div className="divide-y divide-ide-border/50">
                  <TableRow label="Network interface">
                    <select
                      value={networkInterface}
                      onChange={(e) => setNetworkInterface(e.target.value)}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="Any interface">Any interface</option>
                      <option value="Ethernet">Ethernet</option>
                      <option value="Wi-Fi">Wi-Fi</option>
                    </select>
                  </TableRow>

                  <TableRow label="Optional IP address to bind to">
                    <select
                      value={bindIpAddress}
                      onChange={(e) => setBindIpAddress(e.target.value)}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="All addresses">All addresses</option>
                      <option value="127.0.0.1 (Localhost)">127.0.0.1 (Localhost)</option>
                    </select>
                  </TableRow>

                  <TableRow label="Enable Proxy">
                    <input
                      type="checkbox"
                      checked={proxyEnabled}
                      onChange={(e) => setProxyEnabled(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  {proxyEnabled && (
                    <>
                      <TableRow label="Proxy Type">
                        <select
                          value={proxyType}
                          onChange={(e) => setProxyType(e.target.value as 'http' | 'socks5')}
                          className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                        >
                          <option value="http">HTTP Proxy</option>
                          <option value="socks5">SOCKS5 Proxy</option>
                        </select>
                      </TableRow>

                      <TableRow label="Proxy Host">
                        <input
                          type="text"
                          value={proxyHost}
                          onChange={(e) => setProxyHost(e.target.value)}
                          className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                        />
                      </TableRow>

                      <TableRow label="Proxy Port">
                        <input
                          type="number"
                          value={proxyPort}
                          onChange={(e) => setProxyPort(parseInt(e.target.value, 10))}
                          className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                        />
                      </TableRow>
                    </>
                  )}

                  <TableRow label="DNS-over-HTTPS (DoH) encrypted resolution">
                    <input
                      type="checkbox"
                      checked={enableDoH}
                      onChange={(e) => setEnableDoH(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  {enableDoH && (
                    <>
                      <TableRow label="DoH Provider">
                        <select
                          value={dohProvider}
                          onChange={(e) =>
                            setDohProvider(e.target.value as 'cloudflare' | 'quad9' | 'google' | 'custom')
                          }
                          className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                        >
                          <option value="cloudflare">Cloudflare (1.1.1.1)</option>
                          <option value="quad9">Quad9 (9.9.9.9)</option>
                          <option value="google">Google DNS</option>
                          <option value="custom">Custom Endpoint</option>
                        </select>
                      </TableRow>

                      {dohProvider === 'custom' && (
                        <TableRow label="Custom DoH URL">
                          <input
                            type="text"
                            value={customDoHUrl}
                            onChange={(e) => setCustomDoHUrl(e.target.value)}
                            className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                          />
                        </TableRow>
                      )}
                    </>
                  )}

                  <TableRow label="Cloudflare WARP tunneling integration">
                    <input
                      type="checkbox"
                      checked={enableWarp}
                      onChange={(e) => setEnableWarp(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  {enableWarp && (
                    <TableRow label="WARP Endpoint Address">
                      <input
                        type="text"
                        value={warpEndpoint}
                        onChange={(e) => setWarpEndpoint(e.target.value)}
                        className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                      />
                    </TableRow>
                  )}
                </div>
              )}

              {/* ─── TAB: Speed ─── */}
              {activeTab === 'speed' && (
                <div className="divide-y divide-ide-border/50">
                  <TableRow label="Global download rate limit [0: disabled]">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={maxGlobalSpeed}
                      onChange={(e) => setMaxGlobalSpeed(parseInt(e.target.value, 10))}
                      placeholder="0 KB/s"
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                    />
                  </TableRow>

                  <TableRow label="Adaptive QoS ping-latency throttling">
                    <input
                      type="checkbox"
                      checked={enableAdaptiveQoS}
                      onChange={(e) => setEnableAdaptiveQoS(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  <TableRow label="Videos category speed limit (KB/s)">
                    <input
                      type="number"
                      value={categoryLimits['video'] ?? 0}
                      onChange={(e) => handleCategoryLimitChange('video', parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                    />
                  </TableRow>

                  <TableRow label="Archives category speed limit (KB/s)">
                    <input
                      type="number"
                      value={categoryLimits['compressed'] ?? 0}
                      onChange={(e) => handleCategoryLimitChange('compressed', parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                    />
                  </TableRow>
                </div>
              )}

              {/* ─── TAB: BitTorrent ─── */}
              {activeTab === 'bittorrent' && (
                <div className="divide-y divide-ide-border/50">
                  <TableRow label="Enforce protocol header encryption (MSE/PE)">
                    <input
                      type="checkbox"
                      checked={forceTorrentEncryption}
                      onChange={(e) => setForceTorrentEncryption(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  <TableRow label="Strict anonymous P2P mode (disable DHT/PeX)">
                    <input
                      type="checkbox"
                      checked={disableP2PTracking}
                      onChange={(e) => setDisableP2PTracking(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  <TableRow label="Strip HTTP Referrer header">
                    <input
                      type="checkbox"
                      checked={stripReferrer}
                      onChange={(e) => setStripReferrer(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  <TableRow label="Custom User-Agent mask">
                    <input
                      type="text"
                      value={customUserAgent}
                      onChange={(e) => setCustomUserAgent(e.target.value)}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono text-[11px]"
                    />
                  </TableRow>

                  <TableRow label="Save resume data interval [0: disabled]">
                    <select
                      value={`${saveResumeIntervalMin} min`}
                      onChange={(e) => setSaveResumeIntervalMin(parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="15 min">15 min</option>
                      <option value="30 min">30 min</option>
                      <option value="60 min">60 min</option>
                    </select>
                  </TableRow>

                  <TableRow label="Save statistics interval [0: disabled]">
                    <select
                      value={`${saveStatsIntervalMin} min`}
                      onChange={(e) => setSaveStatsIntervalMin(parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="5 min">5 min</option>
                      <option value="15 min">15 min</option>
                      <option value="30 min">30 min</option>
                    </select>
                  </TableRow>
                </div>
              )}

              {/* ─── TAB: RSS & Automations ─── */}
              {activeTab === 'rss' && (
                <div className="divide-y divide-ide-border/50">
                  <TableRow label="Auto-unpack downloaded archives (.zip, .tar, .rar)">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  <TableRow label="Execute post-processing automation scripts">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  <TableRow label="Dispatch webhooks on error">
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>
                </div>
              )}

              {/* ─── TAB: WebUI & RPC ─── */}
              {activeTab === 'webui' && (
                <div className="divide-y divide-ide-border/50">
                  <TableRow label="Enable Remote WebUI & JSON-RPC server">
                    <input
                      type="checkbox"
                      checked={enableRpcServer}
                      onChange={(e) => setEnableRpcServer(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  {enableRpcServer && (
                    <>
                      <TableRow label="RPC Listening Port">
                        <input
                          type="number"
                          value={rpcPort}
                          onChange={(e) => setRpcPort(parseInt(e.target.value, 10))}
                          className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                        />
                      </TableRow>

                      <TableRow label="RPC Secret Token">
                        <input
                          type="text"
                          value={rpcSecretToken}
                          onChange={(e) => setRpcSecretToken(e.target.value)}
                          className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                        />
                      </TableRow>
                    </>
                  )}
                </div>
              )}

              {/* ─── TAB: Advanced ─── */}
              {activeTab === 'advanced' && (
                <div className="divide-y divide-ide-border/50">
                  <TableRow label="Process memory priority (?)">
                    <select
                      value={memoryPriority}
                      onChange={(e) => setMemoryPriority(e.target.value)}
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono cursor-pointer"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Below normal">Below normal</option>
                      <option value="Low">Low</option>
                    </select>
                  </TableRow>

                  <TableRow label="Resolve peer host names">
                    <input
                      type="checkbox"
                      checked={resolveHostnames}
                      onChange={(e) => setResolveHostnames(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>

                  <TableRow label="Resolve peer countries">
                    <input
                      type="checkbox"
                      checked={resolveCountries}
                      onChange={(e) => setResolveCountries(e.target.checked)}
                      className="h-4 w-4 accent-theme-accent rounded-none cursor-pointer"
                    />
                  </TableRow>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ─── Bottom Action Bar (OK, Cancel, Apply) ─── */}
        <div className="h-12 px-4 bg-ide-bg border-t border-ide-border flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-6 py-1 bg-theme-accent hover:bg-theme-bright text-slate-950 font-bold border border-theme-accent rounded-none cursor-pointer transition text-xs shadow-sm"
          >
            OK
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-ide-border rounded-none cursor-pointer transition text-xs shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-ide-border rounded-none cursor-pointer transition text-xs shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

// Sub-component for clean 2-column qBittorrent table rows ("Setting" | "Value")
const TableRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center text-xs py-2 px-4 hover:bg-white/3 transition-colors">
    <div className="w-1/2 pr-4 border-r border-ide-border/50 text-slate-300 font-normal">{label}</div>
    <div className="w-1/2 pl-4">{children}</div>
  </div>
)

// Helper Icons
const FolderDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const NetworkNodesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
)

const WebUIIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
)
