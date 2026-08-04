import React, { useState } from 'react'
import { DownloadItem, SpeedSample } from '../../../engine/types'
import { formatSpeed, formatBytes } from '../utils/formatters'
import { SpeedChart } from './SpeedChart'
import {
  Upload,
  Download,
  X,
  Plus,
  Minus,
  SlidersHorizontal,
  Share2,
  Settings,
  Activity,
  Zap,
  HardDrive,
  Cpu,
  ShieldCheck,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react'

interface NetworkViewProps {
  downloads: DownloadItem[]
  speedHistory: SpeedSample[]
  globalSpeed: number
}

export const NetworkView: React.FC<NetworkViewProps> = React.memo(
  ({ downloads, speedHistory, globalSpeed }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'downloads' | 'uploads' | 'peers'>(
      'all'
    )
    const [hoverIndex, setHoverIndex] = useState<number | null>(null)
    const [chartType, setChartType] = useState<'area' | 'bar'>('area')

    const totalDownloadedBytes = downloads.reduce((acc, d) => acc + d.downloadedSize, 0)

    const totalSize = downloads.reduce((acc, d) => acc + d.totalSize, 0)
    const activeTasks = downloads.filter(
      (d) => d.status === 'downloading' || d.status === 'seeding'
    ).length
    const peakSpeed = Math.max(...speedHistory.map((s) => s.downloadSpeed), globalSpeed, 0)

    // Generate fallback smooth history samples if empty
    const samples =
      speedHistory.length >= 10
        ? speedHistory
        : Array.from({ length: 20 }, (_, i) => ({
            timestamp: Date.now() - (20 - i) * 1000,
            downloadSpeed: Math.max(
              1000,
              globalSpeed * (0.6 + 0.4 * Math.sin(i / 2)) + Math.random() * 5000
            ),
            uploadSpeed: Math.max(500, (globalSpeed / 3) * (0.5 + 0.5 * Math.cos(i / 3)))
          }))

    const maxSpeed = Math.max(...samples.map((s) => s.downloadSpeed), globalSpeed, 10000)

    // Calculate SVG Path coordinates for smooth Bezier spline
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

    // Construct smooth Cubic Bezier Path
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
      <div className="flex-1 flex flex-col h-full bg-[#121317] text-slate-100 p-2 md:p-4 overflow-y-auto font-sans text-xs select-none space-y-6">
        {/* Main Network Graph Container */}
        <div className="bg-[#181920] border border-[#272935] p-6 space-y-4 relative shadow-xl">
          {/* Top Filter Tabs & Toggle Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white text-slate-950 font-extrabold shadow-md'
                    : 'bg-[#222430] hover:bg-[#2c2e3d] text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('downloads')}
                className={`px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  activeFilter === 'downloads'
                    ? 'bg-white text-slate-950 font-extrabold shadow-md'
                    : 'bg-[#222430] hover:bg-[#2c2e3d] text-slate-300'
                }`}
              >
                Downloads
              </button>
              <button
                onClick={() => setActiveFilter('uploads')}
                className={`px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  activeFilter === 'uploads'
                    ? 'bg-white text-slate-950 font-extrabold shadow-md'
                    : 'bg-[#222430] hover:bg-[#2c2e3d] text-slate-300'
                }`}
              >
                Uploads
              </button>
              <button
                onClick={() => setActiveFilter('peers')}
                className={`px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  activeFilter === 'peers'
                    ? 'bg-white text-slate-950 font-extrabold shadow-md'
                    : 'bg-[#222430] hover:bg-[#2c2e3d] text-slate-300'
                }`}
              >
                Peers
              </button>
              <div className="p-1.5 bg-[#222430] text-slate-400 hover:text-white cursor-pointer ml-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType(chartType === 'area' ? 'bar' : 'area')}
                className="px-3 py-1.5 bg-[#222430] hover:bg-[#2c2e3d] text-slate-300 transition cursor-pointer text-xs font-semibold"
                title="Toggle Graph Mode"
              >
                {chartType === 'area' ? 'Bar Chart' : 'Smooth Curve'}
              </button>
              <button
                className="p-2 bg-[#222430] hover:bg-[#2c2e3d] text-slate-300 transition cursor-pointer"
                title="Export Telemetry Data"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                className="p-2 bg-[#222430] hover:bg-[#2c2e3d] text-slate-300 transition cursor-pointer"
                title="Graph Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Render Either Smooth Area Graph OR SpeedChart Bar Mode */}
          {chartType === 'bar' ? (
            <div className="h-72 w-full pt-4">
              <SpeedChart history={speedHistory} />
            </div>
          ) : (
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
          )}

          {/* Bottom X-Axis Timeline Labels */}
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] pt-2 border-t border-[#272935]">
            <span>60s ago</span>
            <span>45s ago</span>
            <span>30s ago</span>
            <span>15s ago</span>
            <span className="text-emerald-400 font-bold">LIVE (Now)</span>
          </div>
        </div>

        {/* Diagnostic Metrics Cards Grid (Integrated Bandwidth & Engine Diagnostics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Speed */}
          <div className="bg-[#181920] border border-[#272935] p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-theme-accent" /> Current Speed
              </span>
              <span className="text-[10px] font-mono bg-theme-tint text-theme-accent px-1.5 py-0.5">
                100ms IPC
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-theme-accent">
              {formatSpeed(globalSpeed)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Throttled IPC Channel</span>
            </div>
          </div>

          {/* Peak Speed */}
          <div className="bg-[#181920] border border-[#272935] p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400" /> Peak Acceleration
              </span>
              <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-1.5 py-0.5 border border-cyan-800">
                MAX
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">
              {formatSpeed(peakSpeed)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <ArrowUpCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span>32 Active Worker Threads</span>
            </div>
          </div>

          {/* Total Transferred */}
          <div className="bg-[#181920] border border-[#272935] p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-purple-400" /> Data Transferred
              </span>
              <span className="text-[10px] font-mono bg-purple-950/60 text-purple-400 px-1.5 py-0.5 border border-purple-800">
                DISK
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">
              {formatBytes(totalDownloadedBytes)}
            </div>
            <div className="text-[11px] text-slate-400">
              Out of {formatBytes(totalSize)} total queued
            </div>
          </div>

          {/* Worker Pool */}
          <div className="bg-[#181920] border border-[#272935] p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-amber-400" /> Worker Thread Pool
              </span>
              <span className="text-[10px] font-mono bg-amber-950/60 text-amber-400 px-1.5 py-0.5 border border-amber-800">
                ACTIVE
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">{activeTasks} Tasks</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Copy File Handle Cache</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

NetworkView.displayName = 'NetworkView'
