import React, { useState } from 'react'
import { DownloadItem } from '../../../engine/types'
import { ChunkProgress } from './ChunkProgress'
import {
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image,
  Code,
  Folder,
  Play,
  Pause,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface DownloadCardProps {
  download: DownloadItem
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onOpenHashModal: (download: DownloadItem) => void
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  download,
  onPause,
  onResume,
  onCancel,
  onOpenHashModal
}) => {
  const [showChunks, setShowChunks] = useState(false)

  const getCategoryIcon = (category: string): React.JSX.Element => {
    switch (category) {
      case 'documents':
        return <FileText className="h-5 w-5 text-amber-500" />
      case 'compressed':
        return <Archive className="h-5 w-5 text-purple-400" />
      case 'video':
        return <Film className="h-5 w-5 text-emerald-400" />
      case 'audio':
        return <Music className="h-5 w-5 text-cyan-400" />
      case 'executables':
        return <Cpu className="h-5 w-5 text-teal-400" />
      case 'images':
        return <Image className="h-5 w-5 text-yellow-400" />
      case 'code':
        return <Code className="h-5 w-5 text-indigo-400" />
      default:
        return <Folder className="h-5 w-5 text-slate-400" />
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes <= 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
    return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatEta = (seconds: number): string => {
    if (seconds <= 0 || !isFinite(seconds)) return '--'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const pct =
    download.totalSize > 0
      ? Math.min(100, Math.round((download.downloadedSize / download.totalSize) * 100))
      : download.status === 'completed'
        ? 100
        : 0

  return (
    <div className="bg-[#1e1e1e] rounded-none border border-[#2e2e2e] p-4 shadow-md transition duration-200 hover:border-slate-700/60 font-sans text-xs">
      <div className="flex items-start justify-between gap-4">
        {/* Category Icon & Main Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2.5 bg-[#141414] rounded-none border border-[#2e2e2e] shrink-0">
            {getCategoryIcon(download.category)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-100 truncate" title={download.name}>
                {download.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider ${
                  download.priority === 'high'
                    ? 'bg-rose-950/60 text-rose-400 border border-rose-800/80'
                    : download.priority === 'normal'
                      ? 'bg-white/5 text-slate-300 border border-white/5'
                      : 'bg-[#141414] text-slate-500'
                }`}
              >
                {download.priority}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-1 font-mono" title={download.url}>
              {download.url}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {download.status === 'downloading' && (
            <button
              onClick={() => onPause(download.id)}
              className="p-2 bg-white/5 hover:bg-white/10 text-amber-400 rounded-none border border-white/5 transition cursor-pointer"
              title="Pause Download"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}

          {(download.status === 'paused' || download.status === 'error') && (
            <button
              onClick={() => onResume(download.id)}
              className="p-2 bg-white/5 hover:bg-white/10 text-[#e44232] rounded-none border border-white/5 transition cursor-pointer"
              title="Resume Download"
            >
              <Play className="h-4 w-4" />
            </button>
          )}

          {download.status === 'completed' && (
            <button
              onClick={() => onOpenHashModal(download)}
              className="p-2 bg-white/5 hover:bg-white/10 text-cyan-400 rounded-none border border-white/5 transition cursor-pointer"
              title="Verify Checksum"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => onCancel(download.id)}
            className="p-2 bg-white/5 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-none border border-white/5 transition cursor-pointer"
            title="Cancel & Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Statistics */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {download.status === 'downloading' && (
              <span className="flex items-center gap-1.5 text-[#e44232] font-semibold">
                <span className="h-2 w-2 bg-[#e44232] animate-ping rounded-none" />
                Downloading ({formatSpeed(download.speed)})
              </span>
            )}
            {download.status === 'completed' && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </span>
            )}
            {download.status === 'paused' && (
              <span className="text-amber-400 font-medium">Paused</span>
            )}
            {download.status === 'queued' && (
              <span className="text-slate-400 font-medium">Queued</span>
            )}
            {download.status === 'error' && (
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                {download.error || 'Error'}
              </span>
            )}
          </div>

          <div className="text-slate-400 font-mono text-xs">
            <span>{formatBytes(download.downloadedSize)}</span>
            <span className="mx-1">/</span>
            <span>{formatBytes(download.totalSize)}</span>
            <span className="ml-2 font-bold text-[#e44232]">{pct}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full bg-[#141414] overflow-hidden p-0.5 border border-[#2e2e2e] rounded-none">
          <div
            className={`h-full transition-all duration-300 rounded-none ${
              download.status === 'completed'
                ? 'bg-emerald-500'
                : download.status === 'error'
                  ? 'bg-rose-500'
                  : download.status === 'paused'
                    ? 'bg-amber-500'
                    : 'bg-[#e44232]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Sub-info Bar & Chunk Visualizer Toggle */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Threads: {download.threadCount || 1}</span>
            {download.status === 'downloading' && <span>ETA: {formatEta(download.eta)}</span>}
            {download.checksum && (
              <span className="text-[#e44232] truncate max-w-xs">
                Hash: {download.checksum.substring(0, 16)}...
              </span>
            )}
          </div>

          {download.chunks && download.chunks.length > 0 && (
            <button
              onClick={() => setShowChunks(!showChunks)}
              className="flex items-center gap-1 text-slate-400 hover:text-[#e44232] transition cursor-pointer font-medium"
            >
              <span>{showChunks ? 'Hide Chunks' : 'View Thread Chunks'}</span>
              {showChunks ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Multi-thread Chunk Visualizer Drawer */}
        {showChunks && download.chunks && (
          <ChunkProgress chunks={download.chunks} totalSize={download.totalSize} />
        )}
      </div>
    </div>
  )
}
