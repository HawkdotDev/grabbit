import React, { useState, useEffect } from 'react'
import { DownloadItem, DownloadPriority } from '../../../../engine/types'
import { X, Sliders, Zap, CheckCircle2, GripHorizontal } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface TorrentOptionsModalProps {
  download: DownloadItem | null
  isOpen: boolean
  onClose: () => void
  onSave?: (id: string, options: Partial<DownloadItem>) => void
}

export const TorrentOptionsModal: React.FC<TorrentOptionsModalProps> = ({
  download,
  isOpen,
  onClose,
  onSave
}) => {
  const [priority, setPriority] = useState<DownloadPriority>('normal')
  const [autoManagement, setAutoManagement] = useState(true)
  const [superSeeding, setSuperSeeding] = useState(false)
  const [uploadLimitKbps, setUploadLimitKbps] = useState('0')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  useEffect(() => {
    if (download) {
      setPriority(download.priority || 'normal')
      setUploadLimitKbps(download.upSpeed ? String(Math.round(download.upSpeed / 1024)) : '0')
    }
  }, [download])

  if (!isOpen || !download) return null

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    const options: Partial<DownloadItem> = {
      priority
    }

    try {
      if (window.api?.updateTorrentOptions) {
        await window.api.updateTorrentOptions(download.id, options)
      }
      onSave?.(download.id, options)
      setStatusMsg('Torrent options updated successfully')
      setTimeout(() => {
        setStatusMsg(null)
        onClose()
      }, 700)
    } catch {
      setStatusMsg('Failed to update options')
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="p-4 border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-4 w-4 text-slate-500 shrink-0 opacity-70" />
            <div className="p-2 bg-indigo-950/40 text-indigo-400 rounded-none border border-indigo-500/30">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">BitTorrent Transfer Options</h2>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{download.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 space-y-4">
          {statusMsg && (
            <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Queue Priority */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Swarm Priority</label>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {(['high', 'normal', 'low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 px-3 uppercase font-bold border transition cursor-pointer ${
                    priority === p
                      ? 'bg-theme-accent text-slate-950 border-theme-accent'
                      : 'bg-ide-bg text-slate-400 border-ide-border hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Swarm & Seeding Modes */}
          <div className="space-y-2 pt-1 border-t border-ide-border">
            <label className="flex items-center justify-between p-2.5 bg-ide-bg border border-ide-border cursor-pointer hover:bg-white/5 transition">
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-slate-400" />
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Automatic Torrent Management</div>
                  <div className="text-[10px] text-slate-400">Auto-relocate based on category and priority rules</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoManagement}
                onChange={(e) => setAutoManagement(e.target.checked)}
                className="accent-purple-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-ide-bg border border-ide-border cursor-pointer hover:bg-white/5 transition">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Super Seeding Mode</div>
                  <div className="text-[10px] text-slate-400">Only seed unseen pieces until swarm becomes self-sustaining</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={superSeeding}
                onChange={(e) => setSuperSeeding(e.target.checked)}
                className="accent-amber-500 h-4 w-4"
              />
            </label>
          </div>

          {/* Upload Limit Input */}
          <div className="space-y-1 pt-1">
            <label className="block text-xs font-semibold text-slate-300">Upload Rate Limit (KB/s)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={uploadLimitKbps}
                onChange={(e) => setUploadLimitKbps(e.target.value)}
                placeholder="0 (Unlimited)"
                className="w-full bg-ide-bg text-slate-100 text-xs px-2.5 py-1.5 border border-ide-border focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-slate-400 text-xs font-mono shrink-0">KB/s</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Set to 0 for unlimited swarm upload speed.</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-ide-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-theme-accent text-slate-950 font-bold hover:bg-theme-bright transition cursor-pointer text-xs"
            >
              Apply Options
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
