import React from 'react'
import { DownloadItem } from '../../../../engine/types'
import { ChunkProgress } from './ChunkProgress'
import { Cpu, Zap, Layers, Activity } from 'lucide-react'
import { formatBytes, formatSpeed } from '../../utils/formatters'

interface ThreadsTabProps {
  download?: DownloadItem | null
}

export const ThreadsTab: React.FC<ThreadsTabProps> = ({ download }) => {
  if (!download) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-500 italic text-xs font-mono">
        No task selected to inspect thread chunks.
      </div>
    )
  }

  const chunks = download.chunks || []
  const totalSize = download.totalSize || 0
  const activeThreadsCount = chunks.filter((c) => c.status === 'downloading').length
  const completedThreadsCount = chunks.filter((c) => c.status === 'completed').length

  return (
    <div className="space-y-3 font-sans text-xs select-none">
      {/* Threads Overview Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ide-surface/50 p-2.5 border border-ide-border">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-theme-accent shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Threads</div>
            <div className="font-mono font-bold text-slate-200">
              {chunks.length} Threads ({activeThreadsCount} Active)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Completed Segments</div>
            <div className="font-mono font-bold text-emerald-400">
              {completedThreadsCount} / {chunks.length} Chunks
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Engine Allocation</div>
            <div className="font-mono font-bold text-slate-200">Zero-Copy Direct I/O</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-purple-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Aggregated Speed</div>
            <div className="font-mono font-bold text-theme-bright">
              {formatSpeed(download.speed || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-thread Visual Grid */}
      <ChunkProgress chunks={chunks} totalSize={totalSize} />

      {/* Threads Table Details */}
      {chunks.length > 0 && (
        <div className="overflow-x-auto border border-zinc-700/60 bg-ide-surface/40 mt-3">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-ide-bg/90 border-b border-zinc-700/60 text-slate-400 text-[11px]">
                <th className="p-2 font-medium w-20">Thread ID</th>
                <th className="p-2 font-medium">Byte Range</th>
                <th className="p-2 font-medium text-right">Downloaded</th>
                <th className="p-2 font-medium text-right">Segment Speed</th>
                <th className="p-2 font-medium text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {chunks.map((chunk) => {
                const chunkSize = Math.max(1, chunk.endByte - chunk.startByte + 1)
                const pct = Math.min(100, Math.round((chunk.downloadedBytes / chunkSize) * 100))

                return (
                  <tr key={chunk.id} className="hover:bg-white/5 transition">
                    <td className="p-2 text-theme-accent font-bold">Thread #{chunk.id + 1}</td>
                    <td className="p-2 text-slate-300">
                      {formatBytes(chunk.startByte)} – {formatBytes(chunk.endByte)}
                    </td>
                    <td className="p-2 text-right text-slate-200 font-semibold">
                      {formatBytes(chunk.downloadedBytes)} / {formatBytes(chunkSize)} ({pct}%)
                    </td>
                    <td className="p-2 text-right text-emerald-400 font-semibold">
                      {chunk.speed > 0 ? formatSpeed(chunk.speed) : 'Idle'}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded font-semibold border ${
                          chunk.status === 'completed'
                            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
                            : chunk.status === 'downloading'
                              ? 'bg-theme-tint text-theme-accent border-theme-accent/40 animate-pulse'
                              : chunk.status === 'paused'
                                ? 'bg-amber-950/50 text-amber-400 border-amber-800/40'
                                : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {chunk.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
