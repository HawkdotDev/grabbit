import React, { useState } from 'react'
import { DownloadItem } from '../../../engine/types'
import {
  Play,
  Pause,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image,
  Code,
  Folder,
  ArrowUpDown
} from 'lucide-react'

interface TaskTableViewProps {
  downloads: DownloadItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onOpenHashModal: (download: DownloadItem) => void
}

type SortField =
  'name' | 'totalSize' | 'downloadedSize' | 'status' | 'speed' | 'upSpeed' | 'eta' | 'ratio'

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  downloads,
  selectedId,
  onSelect,
  onPause,
  onResume,
  onCancel,
  onOpenHashModal
}) => {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const sortedDownloads = [...downloads].sort((a, b) => {
    let valA = a[sortField] ?? 0
    let valB = b[sortField] ?? 0
    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()

    if (valA < valB) return sortAsc ? -1 : 1
    if (valA > valB) return sortAsc ? 1 : -1
    return 0
  })

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

  return (
    <div className="w-full h-full flex flex-col bg-[#141414] font-sans text-xs select-none overflow-hidden rounded-none">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full border-collapse text-left font-sans">
          {/* Table Header */}
          <thead className="sticky top-0 z-10 bg-[#1e1e1e] border-b border-[#2e2e2e] text-[11px] font-semibold text-slate-300">
            <tr>
              <th className="p-2 w-8 text-center border-r border-[#292929]">#</th>
              <th
                onClick={() => handleSort('name')}
                className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929]"
              >
                <div className="flex items-center justify-between gap-1">
                  <span>Name</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('totalSize')}
                className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-24 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Size</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th className="p-2.5 border-r border-[#292929] w-48">Progress</th>
              <th
                onClick={() => handleSort('status')}
                className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-28"
              >
                <div className="flex items-center justify-between gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th className="p-2.5 border-r border-[#292929] w-24 text-right">Seeds (Peers)</th>
              <th
                onClick={() => handleSort('speed')}
                className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-24 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Down Speed</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('upSpeed')}
                className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-24 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Up Speed</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('eta')}
                className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-20 text-right"
              >
                <span>ETA</span>
              </th>
              <th className="p-2.5 border-r border-[#292929] w-36 font-mono">Info Hash</th>
              <th className="p-2.5 w-24 text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Rows */}
          <tbody className="divide-y divide-[#242424] text-slate-200">
            {sortedDownloads.map((d, index) => {
              const isSelected = selectedId === d.id
              const pct =
                d.totalSize > 0
                  ? Math.min(100, Math.round((d.downloadedSize / d.totalSize) * 100))
                  : d.status === 'completed'
                    ? 100
                    : 0

              let statusText = d.status.toString()
              if (d.status === 'downloading') statusText = 'Downloading'
              if (d.status === 'completed') statusText = 'Completed'
              if (d.status === 'seeding') statusText = 'Seeding'
              if (d.status === 'paused') statusText = 'Paused'
              if (d.status === 'error') statusText = 'Errored'
              if (d.status === 'stalled') statusText = 'Stalled'

              return (
                <tr
                  key={d.id}
                  onClick={() => onSelect(d.id)}
                  className={`transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#063e2c] text-white font-semibold'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <td className="p-2 text-center text-slate-500 font-mono">{index + 1}</td>
                  <td className="p-2.5 font-medium truncate max-w-xs">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(d.category)}
                      <span className="truncate">{d.name}</span>
                    </div>
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-300">
                    {formatBytes(d.totalSize)}
                  </td>

                  {/* Inline Progress Bar Cell */}
                  <td className="p-2.5 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3.5 bg-[#1e1e1e] border border-[#2e2e2e] relative overflow-hidden rounded-none">
                        <div
                          className={`h-full transition-all duration-300 ${
                            d.status === 'completed' || d.status === 'seeding'
                              ? 'bg-emerald-600'
                              : d.status === 'error'
                                ? 'bg-rose-600'
                                : d.status === 'paused'
                                  ? 'bg-amber-600'
                                  : 'bg-[#009669]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-100 drop-shadow">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status Cell */}
                  <td className="p-2.5 font-medium">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[11px] ${
                        d.status === 'completed' || d.status === 'seeding'
                          ? 'text-emerald-400 font-bold'
                          : d.status === 'downloading'
                            ? 'text-[#009669] font-bold'
                            : d.status === 'error'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                      }`}
                    >
                      {d.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                      {d.status === 'error' && <AlertCircle className="h-3 w-3" />}
                      <span>{statusText}</span>
                    </span>
                  </td>

                  <td className="p-2.5 text-right font-mono text-slate-400">
                    {d.seedsCount || 0} ({d.peersCount || 0})
                  </td>
                  <td className="p-2.5 text-right font-mono text-cyan-400 font-bold">
                    {formatSpeed(d.speed)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-400">
                    {formatSpeed(d.upSpeed)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-400 font-semibold">
                    {formatEta(d.eta)}
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                    {d.infoHash || d.checksum || 'N/A'}
                  </td>

                  {/* Row Actions */}
                  <td className="p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {d.status === 'downloading' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onPause(d.id)
                          }}
                          className="p-1 text-amber-400 hover:bg-white/10 rounded-none cursor-pointer"
                          title="Pause"
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {(d.status === 'paused' || d.status === 'error') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onResume(d.id)
                          }}
                          className="p-1 text-[#009669] hover:bg-white/10 rounded-none cursor-pointer"
                          title="Resume"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenHashModal(d)
                        }}
                        className="p-1 text-cyan-400 hover:bg-white/10 rounded-none cursor-pointer"
                        title="Verify Hash"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onCancel(d.id)
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
            })}

            {downloads.length === 0 && (
              <tr>
                <td colSpan={11} className="p-8 text-center text-slate-500 italic">
                  No items in current queue. Click &quot;+ Add task&quot; to start accelerating
                  downloads.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
