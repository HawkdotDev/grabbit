import React, { useState } from 'react'
import { EngineSettings, DownloadCategory } from '../../../../engine/types'
import {
  X,
  Sliders,
  Folder,
  FolderOpen,
  Network,
  Cpu,
  Bell,
  Laptop,
  GripHorizontal,
  Palette,
  Shield,
  Radio
} from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: EngineSettings
  onSave: (newSettings: Partial<EngineSettings>) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'engine' | 'network' | 'general'>('engine')

  const [maxConcurrent, setMaxConcurrent] = useState(settings.maxConcurrentDownloads)
  const [defaultThreads, setDefaultThreads] = useState(settings.defaultThreadCount)
  const [maxGlobalSpeed, setMaxGlobalSpeed] = useState(settings.maxGlobalSpeedLimitKbps)
  const [enableAdaptiveQoS, setEnableAdaptiveQoS] = useState(settings.enableAdaptiveQoS ?? true)
  const [enableRpcServer, setEnableRpcServer] = useState(settings.enableRpcServer ?? true)
  const [rpcPort, setRpcPort] = useState(settings.rpcPort ?? 6800)
  const [rpcSecretToken, setRpcSecretToken] = useState(settings.rpcSecretToken ?? 'gbt_secret_rpc')
  const [proxyEnabled, setProxyEnabled] = useState(settings.proxyEnabled ?? false)
  const [proxyType, setProxyType] = useState(settings.proxyType ?? 'http')
  const [proxyHost, setProxyHost] = useState(settings.proxyHost ?? '127.0.0.1')
  const [proxyPort, setProxyPort] = useState(settings.proxyPort ?? 8080)
  const [categoryLimits, setCategoryLimits] = useState<Partial<Record<DownloadCategory, number>>>(
    settings.categorySpeedLimitsKbps ?? {}
  )

  const [savePath, setSavePath] = useState(settings.defaultSavePath)
  const [theme, setTheme] = useState(settings.theme || 'dark')
  const [autoCategorize, setAutoCategorize] = useState(settings.autoCategorize)
  const [enableNotifications, setEnableNotifications] = useState(settings.enableNotifications)
  const [startOnBoot, setStartOnBoot] = useState(settings.startOnBoot)

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

  const handleSave = (e: React.FormEvent): void => {
    e.preventDefault()
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
      defaultSavePath: savePath,
      theme,
      autoCategorize,
      enableNotifications,
      startOnBoot
    })
    onClose()
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="p-4 border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none bg-ide-bg/80"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-4 w-4 text-slate-500 shrink-0 opacity-70" />
            <div className="p-2 bg-cyan-950 text-cyan-400 rounded-none border border-cyan-500/20">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Preferences &amp; Engine Settings</h2>
              <p className="text-[11px] text-slate-400">
                Configure download engine, proxy, RPC gateway &amp; storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-ide-border bg-ide-bg">
          {[
            { id: 'engine', label: 'Engine & Threads', icon: Cpu },
            { id: 'network', label: 'Bandwidth & RPC', icon: Network },
            { id: 'general', label: 'General & Storage', icon: Laptop }
          ].map((t) => {
            const Icon = t.icon
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as 'engine' | 'network' | 'general')}
                className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer rounded-none ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400 font-bold bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Settings Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'engine' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Default Thread Count per Download</span>
                  <span className="font-mono text-cyan-400 font-bold">{defaultThreads} Threads</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="32"
                  value={defaultThreads}
                  onChange={(e) => setDefaultThreads(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Max Concurrent Downloads
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxConcurrent}
                  onChange={(e) => setMaxConcurrent(parseInt(e.target.value, 10))}
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3 py-2 rounded-none border border-ide-border focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-ide-border">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAdaptiveQoS}
                    onChange={(e) => setEnableAdaptiveQoS(e.target.checked)}
                    className="h-4 w-4 accent-cyan-400 rounded-none"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Enable Adaptive QoS Latency Throttling
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Automatically limits bandwidth during latency spikes (&gt;120ms) to protect gaming &amp; VoIP ping.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-4">
              {/* Global Limit */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Global Download Speed Limit (KB/s) [0 = Unlimited]
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={maxGlobalSpeed}
                  onChange={(e) => setMaxGlobalSpeed(parseInt(e.target.value, 10))}
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3 py-2 rounded-none border border-ide-border focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Per-Category Speed Limits */}
              <div className="p-3 bg-ide-bg/50 border border-ide-border space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Per-Category Speed Limits (KB/s)</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Videos</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={categoryLimits['video'] ?? 0}
                      onChange={(e) => handleCategoryLimitChange('video', parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg text-slate-200 px-2 py-1 border border-ide-border focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Compressed / Archives</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={categoryLimits['compressed'] ?? 0}
                      onChange={(e) => handleCategoryLimitChange('compressed', parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg text-slate-200 px-2 py-1 border border-ide-border focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Programs</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={categoryLimits['executables'] ?? 0}
                      onChange={(e) => handleCategoryLimitChange('executables', parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg text-slate-200 px-2 py-1 border border-ide-border focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Documents</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={categoryLimits['documents'] ?? 0}
                      onChange={(e) => handleCategoryLimitChange('documents', parseInt(e.target.value, 10))}
                      className="w-full bg-ide-bg text-slate-200 px-2 py-1 border border-ide-border focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* RPC Server Settings */}
              <div className="p-3 bg-ide-bg/50 border border-ide-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-cyan-400" />
                    Remote JSON-RPC &amp; REST Server
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableRpcServer}
                      onChange={(e) => setEnableRpcServer(e.target.checked)}
                      className="h-3.5 w-3.5 accent-cyan-400 rounded-none"
                    />
                    <span className="text-[11px] text-slate-300">Enabled</span>
                  </label>
                </div>
                {enableRpcServer && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">RPC Port</label>
                      <input
                        type="number"
                        min="1024"
                        max="65535"
                        value={rpcPort}
                        onChange={(e) => setRpcPort(parseInt(e.target.value, 10))}
                        className="w-full bg-ide-bg text-slate-200 px-2 py-1 border border-ide-border focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">RPC Secret Token</label>
                      <input
                        type="text"
                        value={rpcSecretToken}
                        onChange={(e) => setRpcSecretToken(e.target.value)}
                        className="w-full bg-ide-bg text-slate-200 px-2 py-1 border border-ide-border focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Proxy Settings */}
              <div className="p-3 bg-ide-bg/50 border border-ide-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                    Network Proxy Settings
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={proxyEnabled}
                      onChange={(e) => setProxyEnabled(e.target.checked)}
                      className="h-3.5 w-3.5 accent-cyan-400 rounded-none"
                    />
                    <span className="text-[11px] text-slate-300">Use Proxy</span>
                  </label>
                </div>
                {proxyEnabled && (
                  <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Type</label>
                      <select
                        value={proxyType}
                        onChange={(e) => setProxyType(e.target.value as 'http' | 'socks5')}
                        className="w-full bg-ide-bg text-slate-200 px-2 py-1 border border-ide-border focus:border-cyan-400 font-mono"
                      >
                        <option value="http">HTTP</option>
                        <option value="socks5">SOCKS5</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Host</label>
                      <input
                        type="text"
                        value={proxyHost}
                        onChange={(e) => setProxyHost(e.target.value)}
                        className="w-full bg-ide-bg text-slate-200 px-2 py-1 border border-ide-border focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-0.5">Port</label>
                      <input
                        type="number"
                        min="1"
                        max="65535"
                        value={proxyPort}
                        onChange={(e) => setProxyPort(parseInt(e.target.value, 10))}
                        className="w-full bg-ide-bg text-slate-200 px-2 py-1 border border-ide-border focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Folder className="h-3.5 w-3.5 text-slate-400" />
                  Default Save Path
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={savePath}
                    onChange={(e) => setSavePath(e.target.value)}
                    className="flex-1 bg-ide-bg text-slate-100 text-xs px-3 py-2 rounded-none border border-ide-border focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleBrowseFolder}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-ide-border text-slate-200 hover:text-white rounded-none cursor-pointer transition flex items-center gap-1.5"
                    title="Browse Folder"
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Browse</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5 text-amber-400" />
                  Appearance Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as EngineSettings['theme'])}
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3 py-2 rounded-none border border-ide-border focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
                >
                  <option value="dark">Dark Mode (IDE Default)</option>
                  <option value="carrot">Carrot Theme 🥕 (Pastel Orange/Green on Pitch Black)</option>
                  <option value="light">Light Mode</option>
                  <option value="contrast">High Contrast</option>
                  <option value="custom">Custom Theme 🎨</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCategorize}
                    onChange={(e) => setAutoCategorize(e.target.checked)}
                    className="h-4 w-4 accent-cyan-400 rounded-none"
                  />
                  <span className="text-xs text-slate-300">
                    Auto-categorize downloads by extension
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableNotifications}
                    onChange={(e) => setEnableNotifications(e.target.checked)}
                    className="h-4 w-4 accent-cyan-400 rounded-none"
                  />
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 text-slate-400" />
                    Show system notification on completion
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={startOnBoot}
                    onChange={(e) => setStartOnBoot(e.target.checked)}
                    className="h-4 w-4 accent-cyan-400 rounded-none"
                  />
                  <span className="text-xs text-slate-300">Start Grabbit on system boot</span>
                </label>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ide-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-none hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-95 rounded-none shadow-lg shadow-cyan-400/20 transition cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
