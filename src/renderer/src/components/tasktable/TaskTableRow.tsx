import React from 'react'
import {
  Play,
  Pause,
  X,
  ShieldCheck,
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image,
  Code,
  Folder
} from 'lucide-react'
import { DownloadItem } from '../../../../engine/types'
import { ProgressBarCell } from './ProgressBarCell'
import { TaskStatusBadge } from './TaskStatusBadge'

interface TaskTableRowProps {
  item: DownloadItem
  index: number
  isSelected: boolean
  onSelect: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onOpenHashModal: (download: DownloadItem) => void
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

const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const formatSpeed = (bytesPerSec?: number): string => {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KiB/s', 'MiB/s', 'GiB/s']
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
  return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const formatEta = (seconds: number): string => {
  if (seconds <= 0 || !isFinite(seconds)) return '∞'
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export const TaskTableRow: React.FC<TaskTableRowProps> = React.memo(
  ({ item, index, isSelected, onSelect, onPause, onResume, onCancel, onOpenHashModal }) => {
    const pct =
      item.totalSize > 0
        ? Math.min(100, Math.round((item.downloadedSize / item.totalSize) * 100))
        : item.status === 'completed'
          ? 100
          : 0

    return (
      <tr
        onClick={() => onSelect(item.id)}
        className={`transition cursor-pointer ${
          isSelected ? 'bg-theme-tint text-white font-semibold' : 'hover:bg-white/5 text-slate-300'
        }`}
      >
        <td className="p-2 text-center text-slate-500 font-mono">{index + 1}</td>
        <td className="p-2.5 font-medium truncate max-w-xs">
          <div className="flex items-center gap-2">
            {getCategoryIcon(item.category)}
            <span className="truncate">{item.name}</span>
          </div>
        </td>
        <td className="p-2.5 text-right font-mono text-slate-300">{formatBytes(item.totalSize)}</td>

        <td className="p-2.5 font-mono">
          <ProgressBarCell pct={pct} status={item.status} />
        </td>

        <td className="p-2.5 font-medium">
          <TaskStatusBadge status={item.status} />
        </td>

        <td className="p-2.5 text-right font-mono text-slate-400">
          {item.seedsCount || 0} ({item.peersCount || 0})
        </td>
        <td className="p-2.5 text-right font-mono text-cyan-400 font-bold">
          {formatSpeed(item.speed)}
        </td>
        <td className="p-2.5 text-right font-mono text-slate-400">{formatSpeed(item.upSpeed)}</td>
        <td className="p-2.5 text-right font-mono text-slate-400 font-semibold">
          {formatEta(item.eta)}
        </td>
        <td className="p-2.5 font-mono text-[11px] text-slate-400 truncate max-w-30">
          {item.infoHash || item.checksum || 'N/A'}
        </td>

        <td className="p-2.5 text-center">
          <div className="flex items-center justify-center gap-1">
            {item.status === 'downloading' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPause(item.id)
                }}
                className="p-1 text-amber-400 hover:bg-white/10 rounded-none cursor-pointer"
                title="Pause"
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
            )}

            {(item.status === 'paused' || item.status === 'error') && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onResume(item.id)
                }}
                className="p-1 text-theme-accent hover:bg-white/10 rounded-none cursor-pointer"
                title="Resume"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenHashModal(item)
              }}
              className="p-1 text-cyan-400 hover:bg-white/10 rounded-none cursor-pointer"
              title="Verify Hash"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onCancel(item.id)
              }}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-none cursor-pointer"
              title="Delete Task"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
    )
  }
)

TaskTableRow.displayName = 'TaskTableRow'
