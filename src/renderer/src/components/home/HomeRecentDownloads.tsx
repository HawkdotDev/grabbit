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
  FileText
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

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 tracking-tight">Recent downloads</h2>
          {onNavigateToTasks && (
            <button
              onClick={onNavigateToTasks}
              className="text-xs font-bold text-theme-accent hover:text-cyan-300 hover:underline tracking-wider uppercase transition cursor-pointer"
            >
              SEE ALL TASKS &rarr;
            </button>
          )}
        </div>

        {recentDownloads.length === 0 ? (
          <div className="bg-[#191a22] border border-[#272936] rounded-none p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 bg-[#242633] text-slate-400 rounded-none">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">No downloads queued yet</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click Browse or drag a torrent file above to start downloading.
              </p>
            </div>
            <button
              onClick={() => onOpenAddModal('link')}
              className="bg-theme-accent hover:bg-cyan-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-none transition cursor-pointer"
            >
              Add First Download
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDownloads.map((item) => {
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
