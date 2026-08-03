import React, { useState } from 'react'
import { EngineSettings } from '../../../engine/types'
import { X, Sliders, Wifi, Bot, Server } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'engine' | 'network' | 'automation' | 'remote'>(
    'engine'
  )
  const [formData, setFormData] = useState<EngineSettings>({ ...settings })

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent): void => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono text-xs">
      <div className="bg-ide-surface border border-ide-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-ide-border flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 font-sans">
            Preferences &amp; Engine Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#202228] rounded-xl transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-ide-border bg-ide-bg px-4 pt-2">
          {[
            { id: 'engine', label: 'Engine', icon: Sliders },
            { id: 'network', label: 'Network & Bandwidth', icon: Wifi },
            { id: 'automation', label: 'Automation', icon: Bot },
            { id: 'remote', label: 'Remote RPC', icon: Server }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as 'engine' | 'network' | 'automation' | 'remote')
                }
                className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer font-sans ${
                  isActive
                    ? 'border-lime-accent text-lime-accent font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {activeTab === 'engine' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">
                  Max Concurrent Downloads
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.maxConcurrentDownloads}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxConcurrentDownloads: parseInt(e.target.value, 10)
                    })
                  }
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-ide-border focus:outline-none focus:border-lime-accent font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">
                  Default Thread Count per File
                </label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={formData.defaultThreadCount}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultThreadCount: parseInt(e.target.value, 10) })
                  }
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-ide-border focus:outline-none focus:border-lime-accent font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">
                  Default Save Path
                </label>
                <input
                  type="text"
                  value={formData.defaultSavePath}
                  onChange={(e) => setFormData({ ...formData, defaultSavePath: e.target.value })}
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-ide-border focus:outline-none focus:border-lime-accent font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">
                  Global Bandwidth Speed Limit (KB/s) — 0 = Unlimited
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxGlobalSpeedLimitKbps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxGlobalSpeedLimitKbps: parseInt(e.target.value, 10) || 0
                    })
                  }
                  className="w-full bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-ide-border focus:outline-none focus:border-lime-accent font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoCategorize}
                  onChange={(e) => setFormData({ ...formData, autoCategorize: e.target.checked })}
                  className="h-4 w-4 accent-lime-accent rounded"
                />
                <span className="text-xs text-slate-300 font-medium font-sans">
                  Auto-categorize downloads by file extension
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableNotifications}
                  onChange={(e) =>
                    setFormData({ ...formData, enableNotifications: e.target.checked })
                  }
                  className="h-4 w-4 accent-lime-accent rounded"
                />
                <span className="text-xs text-slate-300 font-medium font-sans">
                  Show system notification when a download completes
                </span>
              </label>
            </div>
          )}

          {activeTab === 'remote' && (
            <div className="space-y-3 text-xs text-slate-400">
              <p>WebSocket JSON-RPC Server interface configured at port 6800.</p>
              <div className="p-3 bg-ide-bg rounded-xl border border-ide-border font-mono text-[11px] space-y-1">
                <div>Status: Available</div>
                <div>RPC Port: 6800</div>
                <div>Token: neobit_secret_key</div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ide-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-[#202228] transition cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-lime-bright hover:bg-[#b8e600] active:scale-95 rounded-xl shadow-lg shadow-lime-bright/10 transition cursor-pointer font-sans"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
