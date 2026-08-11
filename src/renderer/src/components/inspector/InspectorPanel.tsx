import React from 'react'
import { DownloadItem, SpeedSample } from '../../../../engine/types'
import { ChunkProgress } from './ChunkProgress'
import { SpeedChart } from '../common/SpeedChart'
import { FileText, RefreshCw, Zap, Sliders } from 'lucide-react'

interface InspectorPanelProps {
  download: DownloadItem | null
  speedHistory: SpeedSample[]
  onOpenHashModal: (download: DownloadItem) => void
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  download,
  speedHistory,
  onOpenHashModal
}) => {
  if (!download) {
    return (
      <aside className="w-80 bg-ide-surface border-l border-ide-border p-6 flex flex-col items-center justify-center text-center select-none font-sans text-xs shrink-0 rounded-none">
        <FileText className="h-12 w-12 text-slate-600 mb-3 stroke-[1.5]" />
        <h3 className="text-sm font-semibold text-slate-300">No Selection</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Select a task from the workspace to inspect chunk progress and real-time metrics.
        </p>
      </aside>
    )
  }

  const formatBytes = (bytes: number): string => {
    if (bytes <= 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  return (
    <aside className="w-80 bg-ide-surface border-l border-ide-border p-4 flex flex-col justify-between overflow-y-auto select-none font-sans text-xs shrink-0 rounded-none">
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-ide-border pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Task Inspection
            </span>
            {download.status === 'downloading' && (
              <RefreshCw className="h-4 w-4 text-theme-accent animate-spin" />
            )}
          </div>
          <h2 className="text-sm font-bold text-slate-100 truncate mt-1">{download.name}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2.5 py-0.5 bg-theme-tint text-theme-accent font-mono font-bold text-[11px] rounded-none">
              {download.category.toUpperCase()}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Priority: <strong className="text-slate-200 uppercase">{download.priority}</strong>
            </span>
          </div>
        </div>

        {/* Speed Chart */}
        <SpeedChart history={speedHistory} />

        {/* Multi-thread Chunk Grid */}
        <ChunkProgress chunks={download.chunks} totalSize={download.totalSize} />

        {/* Storage & Metadata */}
        <div className="bg-ide-bg border border-ide-border p-3 space-y-2 font-mono text-[11px] rounded-none">
          <div className="flex justify-between">
            <span className="text-slate-500">Downloaded:</span>
            <span className="text-slate-200 font-bold">
              {formatBytes(download.downloadedSize)} / {formatBytes(download.totalSize)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Save Location:</span>
            <span className="text-slate-300 truncate max-w-35" title={download.savePath}>
              {download.savePath}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              {download.url.startsWith('magnet:') || download.url.endsWith('.torrent') || !!download.infoHash
                ? 'Swarm Connections:'
                : 'Parallel Engine:'}
            </span>
            <span className="text-theme-accent font-mono font-semibold">
              {download.url.startsWith('magnet:') || download.url.endsWith('.torrent') || !!download.infoHash
                ? `${download.peersCount || 0} Peers (${download.seedsCount || 0} Seeds)`
                : `${download.threadCount || (download.chunks && download.chunks.length > 0 ? download.chunks.length : 8)} Threads`}
            </span>
          </div>

          {download.checksum && (
            <div className="flex justify-between border-t border-[#292929] pt-1.5 mt-1.5">
              <span className="text-slate-500">Checksum (SHA-256):</span>
              <span className="text-slate-300 truncate max-w-30" title={download.checksum}>
                {download.checksum}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-[#292929] pt-1.5 mt-1.5">
            <span className="text-slate-500">Pre-Allocation:</span>
            <span className="text-theme-accent font-semibold">
              {download.downloadedSize > 0 || download.status === 'completed' || download.status === 'seeding'
                ? 'ALLOCATED / READY'
                : download.totalSize > 0
                  ? 'ENABLED'
                  : 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-ide-border space-y-2">
        <button
          onClick={() => onOpenHashModal(download)}
          className="w-full py-3 px-4 bg-theme-accent hover:bg-theme-bright active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-theme-accent/20 transition duration-150 cursor-pointer font-sans rounded-none"
        >
          <Sliders className="h-4 w-4" />
          <span>Verify Integrity &amp; Hash</span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <Zap className="h-3 w-3 text-amber-400" />
          <span>Zero-Copy Direct Disk I/O</span>
        </div>
      </div>
    </aside>
  )
}
