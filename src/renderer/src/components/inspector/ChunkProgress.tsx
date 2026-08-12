import React from 'react'
import { ChunkInfo } from '../../../../engine/types'

interface ChunkProgressProps {
  chunks: ChunkInfo[]
  totalSize: number
}

export const ChunkProgress: React.FC<ChunkProgressProps> = ({ chunks }) => {
  if (!chunks || chunks.length === 0) return null

  const formatBytes = (bytes: number): string => {
    if (bytes <= 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="mt-3 p-3 bg-ide-bg border border-ide-border space-y-2 font-mono rounded-none">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="text-theme-accent font-bold">
          Multi-Thread Chunk Split ({chunks.length} Threads)
        </span>
        <span>Parallel Positioned Writes (pwrite)</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {chunks.map((chunk) => {
          const chunkSize = Math.max(1, chunk.endByte - chunk.startByte + 1)
          const pct = Math.min(100, Math.round((chunk.downloadedBytes / chunkSize) * 100))

          let statusBg = 'bg-ide-surface border-ide-border'
          if (chunk.status === 'completed')
            statusBg = 'bg-emerald-950/40 border-emerald-300/40 text-emerald-300'
          if (chunk.status === 'downloading')
            statusBg = 'bg-violet-950/40 border-violet-300/40 text-violet-300'
          if (chunk.status === 'paused')
            statusBg = 'bg-amber-950/40 border-amber-300/40 text-amber-200'
          if (chunk.status === 'error') statusBg = 'bg-rose-950/40 border-rose-300/40 text-rose-300'

          return (
            <div
              key={chunk.id}
              className={`relative overflow-hidden p-1.5 border text-[10px] flex flex-col justify-between rounded-none smooth-transition ${statusBg}`}
            >
              {/* Internal progress bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-theme-accent/20 smooth-gpu transition-all duration-300 ease-out rounded-none"
                style={{ width: `${pct}%` }}
              />

              <div className="relative z-10 flex items-center justify-between font-bold">
                <span>T#{chunk.id + 1}</span>
                <span>{pct}%</span>
              </div>
              <div className="relative z-10 text-[9px] text-slate-400 truncate mt-1">
                {formatBytes(chunk.downloadedBytes)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
