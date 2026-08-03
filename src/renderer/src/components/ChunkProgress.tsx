import React from 'react'
import { ChunkInfo } from '../../../engine/types'

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
    <div className="mt-3 p-3 bg-[#141414] rounded-xl border border-[#2e2e2e] space-y-2 font-mono">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="text-[#e44232] font-bold">
          Multi-Thread Chunk Split ({chunks.length} Threads)
        </span>
        <span>Parallel Positioned Writes (pwrite)</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {chunks.map((chunk) => {
          const chunkSize = Math.max(1, chunk.endByte - chunk.startByte + 1)
          const pct = Math.min(100, Math.round((chunk.downloadedBytes / chunkSize) * 100))

          let statusBg = 'bg-[#1e1e1e] border-[#2e2e2e]'
          if (chunk.status === 'completed')
            statusBg = 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
          if (chunk.status === 'downloading')
            statusBg = 'bg-[#381c1c] border-[#e44232]/40 text-[#e44232]'
          if (chunk.status === 'paused')
            statusBg = 'bg-amber-950/60 border-amber-800 text-amber-400'
          if (chunk.status === 'error') statusBg = 'bg-rose-950/60 border-rose-800 text-rose-400'

          return (
            <div
              key={chunk.id}
              className={`relative overflow-hidden p-1.5 rounded-lg border text-[10px] flex flex-col justify-between ${statusBg}`}
            >
              {/* Internal progress bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#e44232]/20 transition-all duration-300"
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
