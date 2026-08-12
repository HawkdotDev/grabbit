import React, { useMemo } from 'react'
import { DownloadItem, SpeedSample } from '../../../../engine/types'
import { formatSpeed, formatBytes } from '../../utils/formatters'
import { LineChart, ArrowDown, ArrowUp, Zap } from 'lucide-react'

interface GraphsTabProps {
  download?: DownloadItem | null
  speedHistory?: SpeedSample[]
}

export const GraphsTab: React.FC<GraphsTabProps> = ({ download, speedHistory = [] }) => {
  const samples = useMemo(() => {
    if (speedHistory.length > 0) return speedHistory
    // Generate smooth demo history if idle
    const now = Date.now()
    const result: SpeedSample[] = []
    const baseDown = download?.speed || 2500000
    const baseUp = download?.upSpeed || 120000
    for (let i = 59; i >= 0; i--) {
      const noiseDown = Math.sin(i * 0.3) * 400000 + Math.cos(i * 0.7) * 200000
      const noiseUp = Math.cos(i * 0.4) * 30000
      result.push({
        timestamp: now - i * 1000,
        downloadSpeed: Math.max(0, baseDown + noiseDown),
        uploadSpeed: Math.max(0, baseUp + noiseUp)
      })
    }
    return result
  }, [download, speedHistory])

  const maxSpeed = useMemo(() => {
    let max = 100 * 1024 // Min 100 KB/s scale
    samples.forEach((s) => {
      if (s.downloadSpeed > max) max = s.downloadSpeed
      if (s.uploadSpeed > max) max = s.uploadSpeed
    })
    return max * 1.15
  }, [samples])

  const width = 600
  const height = 140

  const pointsDown = useMemo(() => {
    if (samples.length === 0) return ''
    const step = width / Math.max(1, samples.length - 1)
    return samples
      .map((s, idx) => {
        const x = idx * step
        const y = height - (s.downloadSpeed / maxSpeed) * height
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [samples, maxSpeed])

  const pointsUp = useMemo(() => {
    if (samples.length === 0) return ''
    const step = width / Math.max(1, samples.length - 1)
    return samples
      .map((s, idx) => {
        const x = idx * step
        const y = height - (s.uploadSpeed / maxSpeed) * height
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [samples, maxSpeed])

  const currentDown = download?.speed || samples[samples.length - 1]?.downloadSpeed || 0
  const currentUp = download?.upSpeed || samples[samples.length - 1]?.uploadSpeed || 0

  return (
    <div className="w-full flex flex-col font-sans text-xs select-none bg-ide-bg text-slate-200 p-3 space-y-3 min-h-55">
      {/* ─── Top Telemetry Summary ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ide-surface p-2.5 border border-ide-border">
        <div className="flex items-center gap-2">
          <ArrowDown className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Download Rate</div>
            <div className="font-mono font-bold text-emerald-400">{formatSpeed(currentDown)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUp className="h-4 w-4 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Upload Rate</div>
            <div className="font-mono font-bold text-cyan-400">{formatSpeed(currentUp)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Peak Line Speed</div>
            <div className="font-mono font-bold text-amber-300">{formatSpeed(maxSpeed / 1.15)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-purple-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Session Transfer</div>
            <div className="font-mono font-bold text-slate-200">
              {formatBytes(download?.downloadedSize || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Live SVG Bandwidth Graph ─── */}
      <div className="bg-ide-surface/60 border border-ide-border p-2 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1 z-10">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
              <span className="text-emerald-400 font-bold">Download</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
              <span className="text-cyan-400 font-bold">Upload</span>
            </span>
          </span>
          <span>60 Seconds Live Bandwidth Window</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          {/* Grid lines */}
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#2e2e2e" strokeDasharray="3 3" />
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#2e2e2e" strokeDasharray="3 3" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#2e2e2e" strokeDasharray="3 3" />

          {/* Area under download curve */}
          {pointsDown && (
            <polygon
              points={`0,${height} ${pointsDown} ${width},${height}`}
              fill="rgba(52, 211, 153, 0.15)"
            />
          )}

          {/* Upload Curve Line */}
          {pointsUp && (
            <polyline
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              points={pointsUp}
            />
          )}

          {/* Download Curve Line */}
          {pointsDown && (
            <polyline
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              points={pointsDown}
            />
          )}
        </svg>
      </div>
    </div>
  )
}
