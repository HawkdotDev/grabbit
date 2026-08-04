import React, { useState } from 'react'
import { SpeedSample } from '../../../../engine/types'
import { formatSpeed } from '../../utils/formatters'
import { X, Download, Upload, Plus, Minus } from 'lucide-react'

interface NetworkGraphProps {
  samples: SpeedSample[]
  globalSpeed: number
}

export const NetworkGraph: React.FC<NetworkGraphProps> = React.memo(({ samples, globalSpeed }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const maxSpeed = Math.max(...samples.map((s) => s.downloadSpeed), globalSpeed, 10000)
  const width = 800
  const height = 260

  const points = samples.map((sample, idx) => {
    const x = (idx / (samples.length - 1)) * width
    const y = height - (sample.downloadSpeed / maxSpeed) * (height - 40) - 20
    return { x, y, sample }
  })

  const pointsUp = samples.map((sample, idx) => {
    const x = (idx / (samples.length - 1)) * width
    const y = height - ((sample.uploadSpeed || 500) / maxSpeed) * (height - 40) - 10
    return { x, y }
  })

  const createSmoothPath = (pts: { x: number; y: number }[]): string => {
    if (!pts || pts.length === 0 || !pts[0]) return ''
    let path = `M ${pts[0].x},${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i]
      const next = pts[i + 1]
      if (curr && next) {
        const cpX = (curr.x + next.x) / 2
        path += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`
      }
    }
    return path
  }

  const pathD = createSmoothPath(points)
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`
  const pathUpD = createSmoothPath(pointsUp)

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="relative h-72 w-full pt-4 overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const relX = (e.clientX - rect.left) / rect.width
          const idx = Math.min(
            points.length - 1,
            Math.max(0, Math.round(relX * (points.length - 1)))
          )
          setHoverIndex(idx)
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area Fill */}
        <path d={areaD} fill="url(#emeraldAreaGradient)" />

        {/* Secondary Baseline Curve */}
        <path
          d={pathUpD}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          strokeDasharray="4 3"
        />

        {/* Primary Glowing Smooth Emerald Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#3ee07f"
          strokeWidth="3"
          className="drop-shadow-[0_0_12px_rgba(62,224,127,0.6)]"
        />

        {/* Active Dotted Cursor Line */}
        {activePoint && (
          <line
            x1={activePoint.x}
            y1={0}
            x2={activePoint.x}
            y2={height}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.6"
          />
        )}
      </svg>

      {/* Floating Telemetry Tooltip Badge (Hover Only) */}
      {activePoint && (
        <div
          className="absolute z-30 bg-[#3ee07f] text-[#0f172a] p-4 shadow-2xl w-60 border border-white/20 transition-all duration-150 pointer-events-none"
          style={{
            left: `${Math.min(75, Math.max(15, (activePoint.x / width) * 100))}%`,
            top: '15%'
          }}
        >
          <div className="flex items-center justify-between border-b border-[#0f172a]/15 pb-2 mb-3">
            <div className="flex items-center gap-1 bg-black/10 px-1.5 py-0.5 text-[10px] font-bold">
              <X className="h-3 w-3" />
            </div>
            <span className="font-mono text-[11px] font-bold opacity-75">Live Sample</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Download Box */}
            <div className="bg-[#0f172a] text-white p-2.5 space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-300">
                <Download className="h-3 w-3 text-emerald-400" />
                <span>Download</span>
              </div>
              <div className="font-mono font-bold text-xs text-emerald-400 truncate">
                {formatSpeed(activePoint.sample.downloadSpeed)}
              </div>
            </div>

            {/* Upload Box */}
            <div className="bg-black/10 text-[#0f172a] p-2.5 space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-semibold">
                <Upload className="h-3 w-3" />
                <span>Upload</span>
              </div>
              <div className="font-mono font-bold text-xs truncate">
                {formatSpeed(activePoint.sample.uploadSpeed || 500)}
              </div>
            </div>
          </div>

          {/* Net Throughput Stat */}
          <div>
            <span className="text-[10px] font-semibold text-[#0f172a]/70 block">
              Net Throughput
            </span>
            <div className="text-xl font-extrabold font-mono text-[#0f172a]">
              {formatSpeed(activePoint.sample.downloadSpeed)}
            </div>
          </div>
        </div>
      )}

      {/* Right Side Zoom Controls */}
      <div className="absolute right-3 top-1/3 flex flex-col gap-1 z-20">
        <button
          className="p-2 bg-[#222430] hover:bg-[#2c2e3d] text-slate-300 transition cursor-pointer"
          title="Zoom In"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          className="p-2 bg-[#222430] hover:bg-[#2c2e3d] text-slate-300 transition cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
})

NetworkGraph.displayName = 'NetworkGraph'
