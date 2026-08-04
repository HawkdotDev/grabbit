import React, { useMemo } from 'react'
import { DownloadItem } from '../../../engine/types'
import { Activity, ShieldCheck } from 'lucide-react'

interface BottomStatusBarProps {
  downloads: DownloadItem[]
  globalSpeed: number
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = React.memo(
  ({ downloads, globalSpeed }) => {
    const { activeDownloads, totalUploaded, totalDownloaded } = useMemo(() => {
      let active = 0
      let uploaded = 0
      let downloaded = 0
      downloads.forEach((d) => {
        if (d.status === 'downloading') active++
        uploaded += d.uploadedSize || 0
        downloaded += d.downloadedSize || 0
      })
      return { activeDownloads: active, totalUploaded: uploaded, totalDownloaded: downloaded }
    }, [downloads])

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
      <footer className="h-7 px-4 bg-ide-bg border-t border-ide-border flex items-center justify-between font-mono text-[11px] text-slate-400 select-none shrink-0 rounded-none">
        {/* Left Node Status */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2 w-2 bg-theme-accent rounded-none animate-pulse" />
            <span>DHT: 89 nodes</span>
          </span>
          <span className="text-slate-500">|</span>
          <span>
            Tasks: {activeDownloads} Active ({downloads.length} Total)
          </span>
        </div>

        {/* Right Global Speed & Traffic Badges */}
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1 text-theme-accent font-semibold">
            <Activity className="h-3 w-3" />
            <span>
              D: {formatSpeed(globalSpeed)} ({formatBytes(totalDownloaded)})
            </span>
          </span>

          <span className="flex items-center gap-1 text-cyan-400 font-semibold">
            <span>U: 0 B/s ({formatBytes(totalUploaded)})</span>
          </span>

          <span className="flex items-center gap-1 text-slate-300 border-l border-ide-border pl-3">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>Connection Normal</span>
          </span>
        </div>
      </footer>
    )
  }
)

BottomStatusBar.displayName = 'BottomStatusBar'
