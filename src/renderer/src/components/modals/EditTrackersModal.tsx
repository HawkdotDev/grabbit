import React, { useState, useEffect } from 'react'
import { DownloadItem, TrackerInfo } from '../../../../engine/types'
import { X, Radio, Plus, Trash2, RefreshCw, GripHorizontal, CheckCircle2 } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface EditTrackersModalProps {
  download: DownloadItem | null
  isOpen: boolean
  onClose: () => void
}

const DEFAULT_FALLBACK_TRACKERS: TrackerInfo[] = [
  { url: 'udp://tracker.opentrackr.org:1337/announce', status: 'working', peers: 42 },
  { url: 'https://tracker.openbittorrent.com:443/announce', status: 'working', peers: 18 },
  { url: 'udp://tracker.torrent.eu.org:451/announce', status: 'working', peers: 25 },
  { url: 'udp://open.stealth.si:80/announce', status: 'working', peers: 12 }
]

export const EditTrackersModal: React.FC<EditTrackersModalProps> = ({
  download,
  isOpen,
  onClose
}) => {
  const [trackers, setTrackers] = useState<TrackerInfo[]>([])
  const [newTrackerUrl, setNewTrackerUrl] = useState('')
  const [isReannouncing, setIsReannouncing] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  useEffect(() => {
    if (download) {
      if (download.trackers && download.trackers.length > 0) {
        setTrackers(download.trackers)
      } else {
        setTrackers(DEFAULT_FALLBACK_TRACKERS)
      }
    }
  }, [download])

  if (!isOpen || !download) return null

  const handleAddTracker = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const url = newTrackerUrl.trim()
    if (!url) return

    try {
      if (window.api?.addTorrentTracker) {
        await window.api.addTorrentTracker(download.id, url)
      }
      setTrackers((prev) => {
        if (prev.some((t) => t.url === url)) return prev
        return [...prev, { url, status: 'working', peers: 0 }]
      })
      setNewTrackerUrl('')
      setStatusMessage('Tracker added successfully')
      setTimeout(() => setStatusMessage(null), 2500)
    } catch {
      setStatusMessage('Failed to add tracker')
    }
  }

  const handleRemoveTracker = async (trUrl: string): Promise<void> => {
    try {
      if (window.api?.removeTorrentTracker) {
        await window.api.removeTorrentTracker(download.id, trUrl)
      }
      setTrackers((prev) => prev.filter((t) => t.url !== trUrl))
      setStatusMessage('Tracker removed')
      setTimeout(() => setStatusMessage(null), 2500)
    } catch {
      setStatusMessage('Failed to remove tracker')
    }
  }

  const handleForceReannounce = async (): Promise<void> => {
    setIsReannouncing(true)
    try {
      if (window.api?.reannounceTorrent) {
        await window.api.reannounceTorrent(download.id)
      }
      setStatusMessage('Swarm re-announced to all active trackers')
      setTimeout(() => setStatusMessage(null), 3000)
    } catch {
      setStatusMessage('Failed to re-announce')
    } finally {
      setIsReannouncing(false)
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
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${isDragging ? 'transition-none duration-0' : ''
          } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="p-4 border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-4 w-4 text-slate-500 shrink-0 opacity-70" />
            <div className="p-2 bg-purple-950/40 text-purple-400 rounded-none border border-purple-500/30">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">BitTorrent Swarm Trackers</h2>
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

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {statusMessage && (
            <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Add Tracker Input */}
          <form onSubmit={handleAddTracker} className="flex gap-2">
            <input
              type="text"
              value={newTrackerUrl}
              onChange={(e) => setNewTrackerUrl(e.target.value)}
              placeholder="udp://tracker.example.com:1337/announce"
              className="flex-1 bg-ide-bg text-slate-100 text-xs px-2.5 py-1.5 border border-ide-border focus:outline-none focus:border-purple-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-500 text-slate-950 font-bold hover:bg-purple-400 transition cursor-pointer text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Trackers List Table */}
          <div className="border border-ide-border max-h-56 overflow-y-auto font-mono text-[11px]">
            <table className="w-full text-left">
              <thead className="bg-ide-bg border-b border-ide-border text-slate-400 sticky top-0">
                <tr>
                  <th className="p-2">Announce URL</th>
                  <th className="p-2 w-20">Status</th>
                  <th className="p-2 w-16 text-right">Peers</th>
                  <th className="p-2 w-12 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ide-border/60">
                {trackers.map((t, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="p-2 text-cyan-400 truncate max-w-xs" title={t.url}>
                      {t.url}
                    </td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[9px] uppercase">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-2 text-right text-slate-200">{t.peers}</td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveTracker(t.url)}
                        className="p-1 text-rose-400 hover:bg-rose-950/40 rounded transition cursor-pointer"
                        title="Remove tracker"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {trackers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 font-sans">
                      No trackers configured for this transfer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-ide-border">
            <button
              type="button"
              disabled={isReannouncing}
              onClick={handleForceReannounce}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50 font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isReannouncing ? 'animate-spin' : ''}`} />
              <span>{isReannouncing ? 'Re-announcing...' : 'Force Reannounce'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-theme-accent text-slate-950 font-bold hover:bg-theme-bright transition cursor-pointer text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
