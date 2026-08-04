import React from 'react'
import { SpeedSample } from '../../../../engine/types'

interface SpeedChartProps {
  history: SpeedSample[]
}

export const SpeedChart: React.FC<SpeedChartProps> = React.memo(({ history }) => {
  const maxSpeed = Math.max(...history.map((h) => h.downloadSpeed), 100 * 1024)
  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 KB/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
    return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="bg-ide-bg border border-ide-border p-3 space-y-2 select-none font-sans rounded-none">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">Bandwidth Speed Graph</span>
        <span className="text-theme-accent font-bold">Peak: {formatSpeed(maxSpeed)}</span>
      </div>

      <div className="h-16 flex items-end gap-1 pt-2 overflow-hidden bg-ide-surface/50 px-1 border border-ide-border rounded-none">
        {history.map((sample, idx) => {
          const heightPct = Math.min(100, Math.max(5, (sample.downloadSpeed / maxSpeed) * 100))
          return (
            <div
              key={idx}
              className="flex-1 bg-theme-accent hover:bg-theme-bright transition-all duration-150 relative group rounded-none"
              style={{ height: `${heightPct}%` }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-none pointer-events-none z-20 whitespace-nowrap shadow-md border border-slate-700">
                {formatSpeed(sample.downloadSpeed)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>60s ago</span>
        <span>Real-Time (100ms)</span>
      </div>
    </div>
  )
})

SpeedChart.displayName = 'SpeedChart'
