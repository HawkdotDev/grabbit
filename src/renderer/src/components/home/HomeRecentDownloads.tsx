import React, { useState } from 'react'
import { DownloadItem } from '../../../../engine/types'
import { formatSpeed, formatBytes, formatEta } from '../../utils/formatters'
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Info,
  Pause,
  Play,
  CheckCircle,
  Check,
  FileText,
  Search,
  Filter,
  Upload
} from 'lucide-react'

interface HomeRecentDownloadsProps {
  recentDownloads: DownloadItem[]
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onNavigateToTasks?: () => void
  onSelectDownload?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
}

export const HomeRecentDownloads: React.FC<HomeRecentDownloadsProps> = React.memo(
  ({ recentDownloads, onOpenAddModal, onNavigateToTasks, onSelectDownload, onPause, onResume }) => {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isDragging, setIsDragging] = useState(false)

    const handleCopyUrl = (id: string, url: string, e: React.MouseEvent): void => {
      e.stopPropagation()
      navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }

    const getFileExt = (name: string): string => {
      const parts = name.split('.')
      if (parts.length > 1) {
        const ext = parts.pop()?.toUpperCase() || 'FILE'
        return ext.length <= 4 ? ext : ext.slice(0, 4)
      }
      return 'FILE'
    }

    const handleDragOver = (e: React.DragEvent): void => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (): void => {
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent): void => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onOpenAddModal('file')
      } else {
        onOpenAddModal('link')
      }
    }

    const filteredDownloads = recentDownloads.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.url.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter
      return matchesSearch && matchesStatus
    })

    return (
      <div className="space-y-4">
        {/* Header Row: Title & Search/Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-100 tracking-tight">Recent downloads</h2>

          {/* Search & Filter Controls opposite Recent downloads */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search downloads..."
                className="bg-[#191a22] border border-[#272936] text-slate-200 text-xs pl-8 pr-2.5 py-1.5 rounded-none focus:outline-none focus:border-theme-accent font-mono w-36 sm:w-48"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#191a22] border border-[#272936] px-2.5 py-1.5 rounded-none text-xs text-slate-300">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-200 font-mono text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#191a22]">
                  All Status
                </option>
                <option value="downloading" className="bg-[#191a22]">
                  Downloading
                </option>
                <option value="completed" className="bg-[#191a22]">
                  Completed
                </option>
                <option value="paused" className="bg-[#191a22]">
                  Paused
                </option>
                <option value="seeding" className="bg-[#191a22]">
                  Seeding
                </option>
              </select>
            </div>

            {onNavigateToTasks && (
              <button
                onClick={onNavigateToTasks}
                className="text-xs font-bold text-theme-accent hover:text-cyan-300 hover:underline tracking-wider uppercase transition cursor-pointer ml-1"
              >
                SEE ALL TASKS &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Drag & Drop Card - Spacious & Prominent */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => onOpenAddModal('link')}
          className={`p-6 sm:p-8 rounded-none flex flex-col items-center justify-center text-center space-y-3 transition cursor-pointer border border-dashed ${
            isDragging
              ? 'bg-theme-tint border-theme-accent scale-[1.01] shadow-lg'
              : 'bg-[#191a22] border-[#272936] hover:border-violet-300/40 hover:bg-[#1f202b]'
          }`}
        >
          <div className="bg-[#262835] p-3.5 rounded-none text-theme-accent shrink-0 border border-theme-accent/20">
            <Upload className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">
              Drag &amp; Drop torrent files or paste download links
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Drop .torrent, .meta files or click to paste direct HTTP / HTTPS download URLs
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenAddModal('file')
            }}
            className="bg-theme-accent hover:bg-theme-bright text-slate-950 text-xs font-bold px-5 py-2 rounded-none transition cursor-pointer shrink-0 shadow-md"
          >
            Browse Local Files
          </button>
        </div>

        {filteredDownloads.length === 0 ? (
          <div className="bg-[#191a22] border border-[#272936] rounded-none p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2.5 bg-[#242633] text-slate-400 rounded-none">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">No downloads queued yet</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Use the drop zone above or click Browse to start your first download task.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDownloads.map((item) => {
              const pct =
                item.totalSize > 0
                  ? Math.min(100, Math.round((item.downloadedSize / item.totalSize) * 100))
                  : 0

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectDownload) onSelectDownload(item.id)
                    if (onNavigateToTasks) onNavigateToTasks()
                  }}
                  className="bg-[#1a1b23] hover:bg-[#20212c] border border-[#272936] hover:border-[#383a4c] rounded-none p-4 transition cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* File Extension Thumbnail Pill */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 bg-[#262835] border border-[#36384a] rounded-none flex items-center justify-center shrink-0">
                        <span className="font-mono font-bold text-xs text-theme-accent">
                          {getFileExt(item.name)}
                        </span>
                      </div>

                      {/* Name and Meta Stats */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-100 text-xs truncate">{item.name}</h3>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <ArrowUp className="h-3 w-3 text-cyan-400" />
                            {formatSpeed(item.upSpeed || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ArrowDown className="h-3 w-3 text-emerald-400" />
                            {formatSpeed(item.speed)}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="font-mono text-slate-300">
                            {item.status === 'downloading'
                              ? formatEta(item.eta)
                              : item.status === 'seeding'
                                ? 'Seeding'
                                : item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleCopyUrl(item.id, item.url, e)}
                        className="p-2 bg-[#252734] hover:bg-[#303344] text-slate-300 rounded-none transition cursor-pointer"
                        title="Copy URL"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectDownload) onSelectDownload(item.id)
                          if (onNavigateToTasks) onNavigateToTasks()
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#252734] hover:bg-[#303344] text-slate-300 rounded-none text-[11px] font-semibold transition cursor-pointer"
                        title="View Info"
                      >
                        <Info className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">INFO</span>
                      </button>

                      {item.status === 'downloading' && onPause && (
                        <button
                          onClick={() => onPause(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-none text-[11px] font-bold transition cursor-pointer"
                          title="Pause"
                        >
                          <Pause className="h-3.5 w-3.5" />
                          <span>PAUSE</span>
                        </button>
                      )}

                      {item.status === 'paused' && onResume && (
                        <button
                          onClick={() => onResume(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-none text-[11px] font-bold transition cursor-pointer"
                          title="Resume"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>RESUME</span>
                        </button>
                      )}

                      {item.status === 'completed' && (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded-none text-[11px] font-semibold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>DONE</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{formatBytes(item.downloadedSize)}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#13141a] rounded-none overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.status === 'completed'
                            ? 'bg-emerald-400'
                            : item.status === 'seeding'
                              ? 'bg-cyan-400'
                              : 'bg-theme-accent'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)

HomeRecentDownloads.displayName = 'HomeRecentDownloads'
