import React, { useState } from 'react'
import { EngineSettings } from '../../../../engine/types'
import {
  X,
  Sliders,
  Folder,
  Network,
  Cpu,
  Bell,
  Laptop,
  GripHorizontal,
  Palette
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
  const [savePath, setSavePath] = useState(settings.defaultSavePath)
  const [theme, setTheme] = useState(settings.theme || 'dark')
  const [autoCategorize, setAutoCategorize] = useState(settings.autoCategorize)
  const [enableNotifications, setEnableNotifications] = useState(settings.enableNotifications)
  const [startOnBoot, setStartOnBoot] = useState(settings.startOnBoot)

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent): void => {
    e.preventDefault()
    onSave({
      maxConcurrentDownloads: maxConcurrent,
      defaultThreadCount: defaultThreads,
      maxGlobalSpeedLimitKbps: maxGlobalSpeed,
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
      className="fixed inset-0 z-50 bg-slate-950/35 flex items-center justify-center p-4 select-none font-sans text-xs"
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
          className="p-5 border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-4 w-4 text-slate-500 shrink-0 opacity-70" />
            <div className="p-2 bg-theme-tint text-theme-accent rounded-none border border-theme-accent/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Preferences &amp; Engine Settings
              </h2>
              <p className="text-xs text-slate-400">Configure core download parameters &amp; RPC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-none transition cursor-pointer"
          >
            <X className="h-5 w-5" />
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
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer rounded-none ${
                  isActive
                    ? 'border-theme-accent text-theme-accent font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Settings Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {activeTab === 'engine' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Default Thread Count per Download</span>
                  <span className="font-mono text-theme-accent font-bold">
                    {defaultThreads} Threads
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="32"
                  value={defaultThreads}
                  onChange={(e) => setDefaultThreads(parseInt(e.target.value, 10))}
                  className="w-full accent-theme-accent cursor-pointer"
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
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Global Speed Limit (KB/s) [0 = Unlimited]
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={maxGlobalSpeed}
                  onChange={(e) => setMaxGlobalSpeed(parseInt(e.target.value, 10))}
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono"
                />
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
                <input
                  type="text"
                  value={savePath}
                  onChange={(e) => setSavePath(e.target.value)}
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5 text-amber-400" />
                  Appearance Theme
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="flex-1 bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono cursor-pointer"
                  >
                    <option value="dark">Dark Mode (IDE Default)</option>
                    <option value="carrot">
                      Carrot Theme 🥕 (Pastel Orange/Green on Pitch Black)
                    </option>
                    <option value="light">Light Mode</option>
                    <option value="contrast">High Contrast</option>
                    <option value="custom">Custom Theme 🎨</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCategorize}
                    onChange={(e) => setAutoCategorize(e.target.checked)}
                    className="h-4 w-4 accent-theme-accent rounded-none"
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
                    className="h-4 w-4 accent-theme-accent rounded-none"
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
                    className="h-4 w-4 accent-theme-accent rounded-none"
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
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-theme-accent hover:bg-theme-bright active:scale-95 rounded-none shadow-lg shadow-theme-accent/20 transition cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
