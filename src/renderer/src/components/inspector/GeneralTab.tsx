import React from 'react'
import { FolderOpen } from 'lucide-react'
import { DownloadItem } from '../../../../engine/types'
import { formatBytes, formatSpeed } from '../../utils/formatters'

interface GeneralTabProps {
  download: DownloadItem
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ download }) => {
  const isTorrent =
    download.url.startsWith('magnet:') || download.url.endsWith('.torrent')

  const formatEta = (seconds: number): string => {
    if (seconds <= 0 || !isFinite(seconds)) return 'Ready / Idle'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins < 60) return `${mins}m ${secs}s`
    const hours = Math.floor(mins / 60)
    const remMins = mins % 60
    return `${hours}h ${remMins}m`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-sans text-xs">
      {/* Transfer Information */}
      <div className="space-y-2 bg-ide-surface p-3 border border-ide-border rounded-none">
        <div className="font-bold uppercase text-[10px] tracking-wider border-b border-[#292929] pb-1 text-theme-accent">
          Transfer Information
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Total Size:</span>
          <span>{download.totalSize > 0 ? formatBytes(download.totalSize) : 'Resolving...'}</span>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Downloaded:</span>
          <span className="text-emerald-400">{formatBytes(download.downloadedSize)}</span>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Uploaded:</span>
          <span>{formatBytes(download.uploadedSize || 0)}</span>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Share Ratio:</span>
          <span>{download.ratio || '0.00'}</span>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Time Remaining:</span>
          <span className="text-cyan-400 font-semibold">{formatEta(download.eta)}</span>
        </div>
      </div>

      {/* Connection & Speed */}
      <div className="space-y-2 bg-ide-surface p-3 border border-ide-border rounded-none">
        <div className="font-bold uppercase text-[10px] tracking-wider border-b border-[#292929] pb-1 text-theme-accent">
          Connection &amp; Speed
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Download Speed:</span>
          <span className="text-cyan-400 font-bold">{formatSpeed(download.speed)}</span>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Upload Speed:</span>
          <span>{formatSpeed(download.upSpeed)}</span>
        </div>

        {isTorrent ? (
          <div className="flex justify-between font-mono">
            <span className="text-slate-400">Seeds / Peers:</span>
            <span className="text-emerald-400 font-semibold">
              {download.seedsCount ?? 0} Seeds / {download.peersCount ?? 0} Peers
            </span>
          </div>
        ) : (
          <div className="flex justify-between font-mono">
            <span className="text-slate-400">Protocol Mode:</span>
            <span className="text-emerald-400 font-semibold">HTTP Range Parallel</span>
          </div>
        )}

        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Worker Threads:</span>
          <span>
            {download.threadCount || download.chunks?.length || 8} Active (pwrite)
          </span>
        </div>
      </div>

      {/* File Diagnostics */}
      <div className="space-y-2 bg-ide-surface p-3 border border-ide-border rounded-none">
        <div className="font-bold uppercase text-[10px] tracking-wider border-b border-[#292929] pb-1 text-theme-accent">
          File Diagnostics
        </div>
        <div className="flex justify-between items-center font-mono gap-1">
          <span className="text-slate-400 shrink-0">Save Path:</span>
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="truncate max-w-28 text-[11px]" title={download.savePath}>
              {download.savePath}
            </span>
            <button
              onClick={() => window.api?.openFileLocation(download.savePath)}
              className="p-1 bg-white/5 hover:bg-theme-tint hover:text-theme-accent text-cyan-400 border border-ide-border rounded-none cursor-pointer shrink-0 transition-colors"
              title="Open Destination Folder"
            >
              <FolderOpen className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Info Hash / Hash:</span>
          <span className="truncate max-w-35 text-theme-accent" title={download.infoHash || download.checksum || 'N/A'}>
            {download.infoHash || download.checksum || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Task Status:</span>
          <span className="uppercase text-[10px] font-bold text-slate-200">{download.status}</span>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-slate-400">Added On:</span>
          <span>{new Date(download.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
