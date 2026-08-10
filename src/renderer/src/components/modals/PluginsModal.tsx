import React, { useState } from 'react'
import { X, Puzzle, GripHorizontal, Search, Download, Check } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface PluginsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PluginItem {
  id: string
  name: string
  version: string
  author: string
  description: string
  installed: boolean
}

export const PluginsModal: React.FC<PluginsModalProps> = ({ isOpen, onClose }) => {
  const [plugins, setPlugins] = useState<PluginItem[]>([])
  const [query, setQuery] = useState('')
  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  React.useEffect(() => {
    if (isOpen && window.api?.getPlugins) {
      window.api.getPlugins().then((items) => {
        if (Array.isArray(items)) {
          setPlugins(items as PluginItem[])
        }
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const toggleInstall = async (id: string): Promise<void> => {
    if (window.api?.togglePluginInstall) {
      const updated = (await window.api.togglePluginInstall(id)) as PluginItem
      if (updated) {
        setPlugins((prev) => prev.map((p) => (p.id === id ? updated : p)))
      }
    } else {
      setPlugins((prev) => prev.map((p) => (p.id === id ? { ...p, installed: !p.installed } : p)))
    }
  }

  const filtered = plugins.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Title Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-2.5 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <div className="p-1.5 bg-purple-950/40 rounded-none border border-purple-500/25">
              <Puzzle className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-xs block">
                Plugins &amp; Extensions Manager
              </span>
              <span className="text-[10px] text-slate-500 block">
                Browse and configure third-party application extensions
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Header */}
        <div className="p-3 bg-ide-bg/60 border-b border-ide-border/80 flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plugins and extensions..."
            className="w-full bg-ide-surface text-slate-100 text-xs px-2.5 py-1.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 font-mono transition"
            autoFocus
          />
        </div>

        {/* Plugin Cards List */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
          {filtered.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-ide-bg/70 border border-ide-border/80 p-3.5 flex items-start justify-between gap-4 hover:border-slate-500/50 transition"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-xs">{plugin.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">v{plugin.version}</span>
                  <span className="text-[10px] text-purple-400/80 font-mono">
                    by {plugin.author}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{plugin.description}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleInstall(plugin.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-none cursor-pointer transition shrink-0 flex items-center gap-1.5 ${
                  plugin.installed
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/40'
                    : 'bg-theme-accent text-slate-950 hover:bg-theme-bright'
                }`}
              >
                {plugin.installed ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Installed</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Install</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
