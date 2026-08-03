import React from 'react'
import { DownloadItem, SpeedSample } from '../../../engine/types'
import { ChunkProgress } from './ChunkProgress'
import { SpeedChart } from './SpeedChart'
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
      <aside className="w-80 bg-[#1e1e1e] border-l border-[#2e2e2e] p-6 flex flex-col items-center justify-center text-center select-none font-sans text-xs shrink-0 rounded-none">
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
    <aside className="w-80 bg-[#1e1e1e] border-l border-[#2e2e2e] p-4 flex flex-col justify-between overflow-y-auto select-none font-sans text-xs shrink-0 rounded-none">
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-[#2e2e2e] pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Task Inspection
            </span>
            {download.status === 'downloading' && (
              <RefreshCw className="h-4 w-4 text-[#009669] animate-spin" />
            )}
          </div>
          <h2 className="text-sm font-bold text-slate-100 truncate mt-1">{download.name}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2.5 py-0.5 bg-[#063e2c] text-[#009669] font-mono font-bold text-[11px] rounded-none">
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
        <div className="bg-[#141414] border border-[#2e2e2e] p-3 space-y-2 font-mono text-[11px] rounded-none">
          <div className="flex justify-between">
            <span className="text-slate-500">Downloaded:</span>
            <span className="text-slate-200 font-bold">
              {formatBytes(download.downloadedSize)} / {formatBytes(download.totalSize)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Save Location:</span>
            <span className="text-slate-300 truncate max-w-[140px]" title={download.savePath}>
              {download.savePath}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Parallel Engine:</span>
            <span className="text-[#009669] font-mono">32 Threads</span>
          </div>

          {download.checksum && (
            <div className="flex justify-between border-t border-[#292929] pt-1.5 mt-1.5">
              <span className="text-slate-500">Checksum (SHA-256):</span>
              <span className="text-slate-300 truncate max-w-[120px]" title={download.checksum}>
                {download.checksum}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-[#292929] pt-1.5 mt-1.5">
            <span className="text-slate-500">Pre-Allocation:</span>
            <span className="text-[#009669] font-semibold">ENABLED</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[#2e2e2e] space-y-2">
        <button
          onClick={() => onOpenHashModal(download)}
          className="w-full py-3 px-4 bg-[#009669] hover:bg-[#059669] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#009669]/20 transition duration-150 cursor-pointer font-sans rounded-none"
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
