import React from 'react'
import { DownloadItem } from '../../../engine/types'
import { Activity, ShieldCheck } from 'lucide-react'

interface BottomStatusBarProps {
  downloads: DownloadItem[]
  globalSpeed: number
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({ downloads, globalSpeed }) => {
  const activeDownloads = downloads.filter((d) => d.status === 'downloading').length
  const totalUploaded = downloads.reduce((acc, d) => acc + (d.uploadedSize || 0), 0)
  const totalDownloaded = downloads.reduce((acc, d) => acc + d.downloadedSize, 0)

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KiB/s', 'MiB/s', 'GiB/s']
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
    return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatBytes = (bytes: number): string => {
    if (bytes <= 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KiB', 'MiB', 'GiB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <footer className="h-7 px-4 bg-[#141414] border-t border-[#2e2e2e] flex items-center justify-between font-mono text-[11px] text-slate-400 select-none shrink-0 rounded-none">
      {/* Left Node Status */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="h-2 w-2 bg-emerald-500 rounded-none animate-pulse" />
          <span>DHT: 89 nodes</span>
        </span>
        <span className="text-slate-500">|</span>
        <span>
          Tasks: {activeDownloads} Active ({downloads.length} Total)
        </span>
      </div>

      {/* Right Global Speed & Traffic Badges */}
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1 text-[#e44232] font-semibold">
          <Activity className="h-3 w-3" />
          <span>
            D: {formatSpeed(globalSpeed)} ({formatBytes(totalDownloaded)})
          </span>
        </span>

        <span className="flex items-center gap-1 text-cyan-400 font-semibold">
          <span>U: 0 B/s ({formatBytes(totalUploaded)})</span>
        </span>

        <span className="flex items-center gap-1 text-slate-300 border-l border-[#2e2e2e] pl-3">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Connection Normal</span>
        </span>
      </div>
    </footer>
  )
}
