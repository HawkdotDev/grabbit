import React from 'react'
import { DownloadItem } from '../../../engine/types'
import {
  Play,
  Pause,
  X,
  Sliders,
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image,
  Code,
  Folder,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface DownloadCardProps {
  download: DownloadItem
  isSelected: boolean
  onSelect: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onOpenHashModal: (download: DownloadItem) => void
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  download,
  isSelected,
  onSelect,
  onPause,
  onResume,
  onCancel,
  onOpenHashModal
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes <= 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 KB/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
    return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatEta = (seconds: number): string => {
    if (seconds <= 0 || !isFinite(seconds)) return 'Calculating...'
    if (seconds < 60) return `${seconds}s remaining`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s remaining`
  }

  const getCategoryIcon = (category: string): React.JSX.Element => {
    switch (category) {
      case 'documents':
        return <FileText className="h-4 w-4 text-amber-500" />
      case 'compressed':
        return <Archive className="h-4 w-4 text-purple-400" />
      case 'video':
        return <Film className="h-4 w-4 text-emerald-400" />
      case 'audio':
        return <Music className="h-4 w-4 text-cyan-400" />
      case 'executables':
        return <Cpu className="h-4 w-4 text-teal-400" />
      case 'images':
        return <Image className="h-4 w-4 text-yellow-400" />
      case 'code':
        return <Code className="h-4 w-4 text-indigo-400" />
      default:
        return <Folder className="h-4 w-4 text-slate-400" />
    }
  }

  const pct =
    download.totalSize > 0
      ? Math.min(100, Math.round((download.downloadedSize / download.totalSize) * 100))
      : download.status === 'completed'
        ? 100
        : 0

  return (
    <div
      onClick={() => onSelect(download.id)}
      className={`p-4 border transition duration-150 cursor-pointer select-none font-sans text-xs rounded-none ${
        isSelected
          ? 'bg-[#1e1e1e] border-[#009669] shadow-lg shadow-[#009669]/5'
          : 'bg-[#141414] border-[#2e2e2e] hover:border-slate-700 hover:bg-[#181818]'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        {/* Title & Icon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-white/5 border border-white/5 rounded-none shrink-0">
            {getCategoryIcon(download.category)}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-100 truncate">{download.name}</h3>
            <p className="text-[11px] text-slate-400 truncate max-w-sm font-mono mt-0.5">
              {download.url}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {download.status === 'downloading' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPause(download.id)
              }}
              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-none border border-amber-500/20 transition cursor-pointer"
              title="Pause Download"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}

          {(download.status === 'paused' || download.status === 'error') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onResume(download.id)
              }}
              className="p-2 bg-[#063e2c] hover:bg-[#064e37] text-[#009669] rounded-none border border-[#009669]/30 transition cursor-pointer"
              title="Resume Download"
            >
              <Play className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenHashModal(download)
            }}
            className="p-2 bg-white/5 hover:bg-white/10 text-[#009669] rounded-none border border-white/5 transition cursor-pointer"
            title="Verify Checksum / Hash"
          >
            <Sliders className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onCancel(download.id)
            }}
            className="p-2 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-none border border-white/5 transition cursor-pointer"
            title="Delete Download"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Speed & ETA Row */}
      <div className="flex items-center justify-between text-xs font-mono mb-2">
        <div className="flex items-center gap-3">
          {download.status === 'downloading' && (
            <span className="flex items-center gap-1.5 text-[#009669] font-semibold">
              <span className="h-2 w-2 bg-[#009669] animate-ping rounded-none" />
              <span>{formatSpeed(download.speed)}</span>
            </span>
          )}

          {download.status === 'completed' && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Completed</span>
            </span>
          )}

          {download.status === 'paused' && (
            <span className="text-amber-400 font-semibold">Paused</span>
          )}

          {download.status === 'error' && (
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <AlertCircle className="h-4 w-4" />
              <span>Errored</span>
            </span>
          )}

          <span className="text-slate-400">
            {formatBytes(download.downloadedSize)} / {formatBytes(download.totalSize)}
          </span>
        </div>

        <div className="text-slate-400">
          {download.status === 'downloading' ? (
            formatEta(download.eta)
          ) : (
            <span className="ml-2 font-bold text-[#009669]">{pct}%</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#1e1e1e] border border-[#2e2e2e] relative overflow-hidden rounded-none">
        <div
          className={`h-full transition-all duration-300 rounded-none ${
            download.status === 'completed'
              ? 'bg-emerald-500'
              : download.status === 'error'
                ? 'bg-rose-500'
                : download.status === 'paused'
                  ? 'bg-amber-500'
                  : 'bg-[#009669]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Storage Path Footer */}
      <div className="flex items-center justify-between mt-3 text-[11px] font-mono border-t border-[#2e2e2e] pt-2">
        <div className="text-slate-400 truncate max-w-xs" title={download.savePath}>
          Path: <span className="text-slate-300">{download.savePath}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenHashModal(download)
          }}
          className="flex items-center gap-1 text-slate-400 hover:text-[#009669] transition cursor-pointer font-medium"
        >
          <span>Verify Integrity</span>
        </button>
      </div>
    </div>
  )
}
