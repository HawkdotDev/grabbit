import React from 'react'
import { SpeedSample } from '../../../engine/types'

interface SpeedChartProps {
  history: SpeedSample[]
}

export const SpeedChart: React.FC<SpeedChartProps> = ({ history }) => {
  if (!history || history.length < 2) {
    return (
      <div className="h-28 bg-[#18191d] rounded-xl border border-[#2a2d34] p-4 flex items-center justify-center text-xs font-mono text-slate-500">
        Collecting real-time bandwidth metrics...
      </div>
    )
  }

  const maxSpeed = Math.max(1024 * 1024, ...history.map((h) => h.downloadSpeed))
  const width = 600
  const height = 100

  const points = history
    .map((sample, idx) => {
      const x = (idx / (history.length - 1)) * width
      const y = height - (sample.downloadSpeed / maxSpeed) * (height - 10)
      return `${x},${y}`
    })
    .join(' ')

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
    return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const currentSpeed = history[history.length - 1]?.downloadSpeed || 0

  return (
    <div className="bg-[#18191d] rounded-xl border border-[#2a2d34] p-4 shadow-xl mb-4 font-mono text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#a3e635] animate-ping" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Real-time Bandwidth Usage
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            Peak: <strong className="text-slate-200">{formatSpeed(maxSpeed)}</strong>
          </span>
          <span className="text-[#a3e635] font-bold">Current: {formatSpeed(currentSpeed)}</span>
        </div>
      </div>

      <div className="relative w-full h-20 overflow-hidden rounded-lg bg-[#121316] p-2 border border-[#2a2d34]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a3e635" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a3e635" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#limeGrad)" />

          {/* Line path */}
          <polyline
            fill="none"
            stroke="#a3e635"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    </div>
  )
}
