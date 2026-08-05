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
  Folder,
  ArrowDown,
  ArrowUp
} from 'lucide-react'
import { DownloadItem } from '../../../../engine/types'
import { ProgressBarCell } from './ProgressBarCell'
import { TaskStatusBadge } from './TaskStatusBadge'
import { ColumnWidths, MIN_COLUMN_WIDTHS } from './TaskTableHeader'

interface TaskTableRowProps {
  item: DownloadItem
  index: number
  isSelected: boolean
  columnWidths: ColumnWidths
  onSelect: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onOpenHashModal: (download: DownloadItem) => void
}

const getCategoryIcon = (category: string): React.JSX.Element => {
  switch (category) {
    case 'documents':
      return <FileText className="h-4 w-4 text-amber-400 shrink-0" />
    case 'compressed':
      return <Archive className="h-4 w-4 text-purple-400 shrink-0" />
    case 'video':
      return <Film className="h-4 w-4 text-emerald-400 shrink-0" />
    case 'audio':
      return <Music className="h-4 w-4 text-cyan-400 shrink-0" />
    case 'executables':
      return <Cpu className="h-4 w-4 text-teal-400 shrink-0" />
    case 'images':
      return <Image className="h-4 w-4 text-yellow-400 shrink-0" />
    case 'code':
      return <Code className="h-4 w-4 text-indigo-400 shrink-0" />
    default:
      return <Folder className="h-4 w-4 text-slate-400 shrink-0" />
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
  ({
    item,
    index,
    isSelected,
    columnWidths,
    onSelect,
    onPause,
    onResume,
    onCancel,
    onOpenHashModal
  }) => {
    const pct =
      item.totalSize > 0
        ? Math.min(100, Math.round((item.downloadedSize / item.totalSize) * 100))
        : item.status === 'completed'
          ? 100
          : 0

    return (
      <tr
        onClick={() => onSelect(item.id)}
        className={`transition-colors cursor-pointer border-l-2 ${
          isSelected
            ? 'border-theme-accent bg-theme-tint/70 text-white font-semibold'
            : 'border-transparent hover:bg-white/4 text-slate-300'
        }`}
      >
        <td
          style={{ width: columnWidths.num, minWidth: MIN_COLUMN_WIDTHS.num }}
          className="p-2.5 text-center text-slate-500 font-mono text-[11px] truncate"
        >
          {index + 1}
        </td>
        <td
          style={{ width: columnWidths.name, minWidth: MIN_COLUMN_WIDTHS.name }}
          className="p-2.5 font-medium truncate"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {getCategoryIcon(item.category)}
            <span className="truncate text-slate-200">{item.name}</span>
          </div>
        </td>
        <td
          style={{ width: columnWidths.totalSize, minWidth: MIN_COLUMN_WIDTHS.totalSize }}
          className="p-2.5 text-right font-mono text-slate-300 text-xs truncate"
        >
          {formatBytes(item.totalSize)}
        </td>

        <td
          style={{ width: columnWidths.progress, minWidth: MIN_COLUMN_WIDTHS.progress }}
          className="p-2.5 font-mono"
        >
          <ProgressBarCell pct={pct} status={item.status} />
        </td>

        <td
          style={{ width: columnWidths.status, minWidth: MIN_COLUMN_WIDTHS.status }}
          className="p-2.5 font-medium truncate"
        >
          <TaskStatusBadge status={item.status} />
        </td>

        <td
          style={{ width: columnWidths.seeds, minWidth: MIN_COLUMN_WIDTHS.seeds }}
          className="p-2.5 text-right font-mono text-slate-400 text-xs truncate"
        >
          {item.seedsCount || 0}{' '}
          <span className="text-slate-500 text-[11px]">({item.peersCount || 0})</span>
        </td>
        <td
          style={{ width: columnWidths.speed, minWidth: MIN_COLUMN_WIDTHS.speed }}
          className="p-2.5 text-right font-mono text-cyan-400 font-bold text-xs truncate"
        >
          <div className="flex items-center justify-end gap-1">
            {item.speed && item.speed > 0 ? (
              <ArrowDown className="h-3 w-3 text-cyan-400 animate-pulse shrink-0" />
            ) : null}
            <span className="truncate">{formatSpeed(item.speed)}</span>
          </div>
        </td>
        <td
          style={{ width: columnWidths.upSpeed, minWidth: MIN_COLUMN_WIDTHS.upSpeed }}
          className="p-2.5 text-right font-mono text-slate-400 text-xs truncate"
        >
          <div className="flex items-center justify-end gap-1">
            {item.upSpeed && item.upSpeed > 0 ? (
              <ArrowUp className="h-3 w-3 text-emerald-400 shrink-0" />
            ) : null}
            <span className="truncate">{formatSpeed(item.upSpeed)}</span>
          </div>
        </td>
        <td
          style={{ width: columnWidths.eta, minWidth: MIN_COLUMN_WIDTHS.eta }}
          className="p-2.5 text-right font-mono text-slate-400 font-semibold text-xs truncate"
        >
          {formatEta(item.eta)}
        </td>
        <td
          style={{ width: columnWidths.infoHash, minWidth: MIN_COLUMN_WIDTHS.infoHash }}
          className="p-2.5 font-mono text-[11px] text-slate-400 truncate"
        >
          {item.infoHash || item.checksum || 'N/A'}
        </td>

        <td
          style={{ width: columnWidths.actions, minWidth: MIN_COLUMN_WIDTHS.actions }}
          className="p-2.5 text-center"
        >
          <div className="flex items-center justify-center gap-1">
            {item.status === 'downloading' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPause(item.id)
                }}
                className="p-1.5 text-amber-400 hover:bg-white/10 hover:border-amber-500/30 border border-transparent rounded-none cursor-pointer transition-colors"
                title="Pause Download"
              >
                <Pause className="h-3.5 w-3.5 fill-current" />
              </button>
            )}

            {(item.status === 'paused' || item.status === 'error') && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onResume(item.id)
                }}
                className="p-1.5 text-theme-accent hover:bg-white/10 hover:border-theme-accent/30 border border-transparent rounded-none cursor-pointer transition-colors"
                title="Resume Download"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenHashModal(item)
              }}
              className="p-1.5 text-cyan-400 hover:bg-white/10 hover:border-cyan-500/30 border border-transparent rounded-none cursor-pointer transition-colors"
              title="Verify Checksum / Hash"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onCancel(item.id)
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/30 border border-transparent rounded-none cursor-pointer transition-colors"
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
