import React, { useState } from 'react'
import { DownloadItem } from '../../../engine/types'
import { formatSpeed, formatBytes, formatEta } from '../utils/formatters'
import {
  ArrowUp,
  ArrowDown,
  HardDrive,
  Upload,
  Plus,
  Copy,
  Info,
  Pause,
  Play,
  CheckCircle,
  Zap,
  Check,
  FileText
} from 'lucide-react'

interface HomeDashboardProps {
  downloads: DownloadItem[]
  globalSpeed: number
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onNavigateToTasks?: () => void
  onSelectDownload?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onCancel?: (id: string) => void
}

export const HomeDashboard: React.FC<HomeDashboardProps> = React.memo(
  ({
    downloads,
    globalSpeed,
    onOpenAddModal,
    onNavigateToTasks,
    onSelectDownload,
    onPause,
    onResume
  }) => {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    // Calculate aggregated metrics
    const totalDownloadedBytes = downloads.reduce((acc, d) => acc + d.downloadedSize, 0)
    const totalUploadedBytes = downloads.reduce((acc, d) => acc + (d.uploadedSize || 0), 0)
    const totalSize = downloads.reduce((acc, d) => acc + d.totalSize, 0)

    const usedPercentage =
      totalSize > 0 ? Math.min(100, Math.round((totalDownloadedBytes / totalSize) * 100)) : 0

    // Recent items sorted by newest created
    const recentDownloads = [...downloads].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4)

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

    return (
      <div className="flex-1 flex flex-col h-full bg-[#121317] text-slate-100 p-2 md:p-4 overflow-y-auto font-sans text-xs select-none space-y-2 relative rounded-none">
        {/* Top Header & Telemetry Status */}
        {/* <div className="flex items-center justify-between pb-2 border-b border-[#22242e]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Dashboard Overview
            </h1>
            <p className="text-xs text-slate-400">
              Live multi-threaded engine metrics &amp; active task workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono bg-[#1c1d25] px-3.5 py-1.5 rounded-none border border-[#2a2c38]">
              <span className="h-2 w-2 bg-emerald-400 rounded-none animate-ping" />
              <span className="text-slate-300 text-[11px]">Engine Active</span>
            </div>
          </div>
        </div> */}

        {/* Top Pastel Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Bytes Uploaded */}
          <div className="bg-[#bfe3f7] text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="bg-black/10 p-2 rounded-none flex items-center justify-center">
                <ArrowUp className="h-4 w-4 text-[#0f172a]" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider opacity-60 uppercase">
                UPLOADED
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
                {formatBytes(totalUploadedBytes)}
              </div>
              <div className="text-xs font-medium text-[#0f172a]/70 mt-0.5">Bytes uploaded</div>
            </div>
          </div>

          {/* Card 2: Bytes Downloaded */}
          <div className="bg-[#c4d5fd] text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="bg-black/10 p-2 rounded-none flex items-center justify-center">
                <ArrowDown className="h-4 w-4 text-[#0f172a]" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider opacity-60 uppercase">
                DOWNLOADED
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
                {formatBytes(totalDownloadedBytes)}
              </div>
              <div className="text-xs font-medium text-[#0f172a]/70 mt-0.5">Bytes downloaded</div>
            </div>
          </div>

          {/* Card 3: Storage Used */}
          <div className="bg-[#c5c5fc] text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="bg-black/10 p-2 rounded-none flex items-center justify-center">
                <HardDrive className="h-4 w-4 text-[#0f172a]" />
              </div>
              <div className="bg-black/15 font-mono text-[11px] font-bold px-2 py-0.5 rounded-none">
                {usedPercentage}%
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
                {formatBytes(totalDownloadedBytes)}
              </div>
              <div className="text-xs font-medium text-[#0f172a]/70 mt-0.5">
                Used of {formatBytes(totalSize || 1024 * 1024 * 1024)}
              </div>
            </div>
          </div>

          {/* Card 4: Drag & Drop Torrent / File Card */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => onOpenAddModal('link')}
            className={`p-5 rounded-none flex flex-col items-center justify-center text-center h-38 transition cursor-pointer border border-dashed ${
              isDragging
                ? 'bg-theme-tint border-theme-accent scale-102'
                : 'bg-[#1b1c23] border-[#303342] hover:border-slate-500 hover:bg-[#20222b]'
            }`}
          >
            <div className="bg-[#272935] p-2 rounded-none mb-1.5 text-slate-300">
              <Upload className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase mb-1">
              FILE / TORRENT LINK
            </span>
            <p className="text-xs font-medium text-slate-200 mb-2">
              Drag &amp; Drop torrent files here or
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenAddModal('file')
              }}
              className="bg-[#292b38] hover:bg-[#343747] text-slate-200 text-xs font-semibold px-4 py-1 rounded-none border border-[#3b3e52] transition cursor-pointer"
            >
              Browse
            </button>
          </div>
        </div>

        {/* Main Content Split: Recent Downloads (Left) & Real-time Throughput (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Recent Torrents / Downloads */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Recent downloads
              </h2>
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
                            <h3 className="font-bold text-slate-100 text-xs truncate">
                              {item.name}
                            </h3>

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

                      {/* Integrated Sleek Progress Bar */}
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

          {/* Right Column: Engine & Transfer Status Overview */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Zap className="h-4 w-4 text-theme-accent" />
              Engine &amp; Queue Overview
            </h2>

            <div className="bg-[#1a1b23] border border-[#272936] rounded-none p-5 space-y-5">
              {/* Live Speed Banner */}
              <div className="flex items-center justify-between border-b border-[#282a38] pb-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    Current Transfer Speed
                  </span>
                  <span className="font-mono text-lg font-bold text-theme-accent">
                    {formatSpeed(globalSpeed)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] bg-theme-tint text-theme-accent px-2 py-1 border border-theme-accent/30">
                  <span className="h-1.5 w-1.5 bg-emerald-400 animate-pulse" />
                  <span>Engine Online</span>
                </div>
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#21232e] border border-[#2e303f] p-3 rounded-none">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Active Tasks
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-100">
                    {
                      downloads.filter((d) => d.status === 'downloading' || d.status === 'seeding')
                        .length
                    }
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {downloads.filter((d) => d.status === 'completed').length} completed
                  </span>
                </div>

                <div className="bg-[#21232e] border border-[#2e303f] p-3 rounded-none">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    DHT Network
                  </span>
                  <div className="text-lg font-bold font-mono text-cyan-400">89 Nodes</div>
                  <span className="text-[10px] text-slate-400">Peer discovery ready</span>
                </div>

                <div className="bg-[#21232e] border border-[#2e303f] p-3 rounded-none">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Worker Threads
                  </span>
                  <div className="text-lg font-bold font-mono text-purple-400">32 Threads</div>
                  <span className="text-[10px] text-slate-400">Zero-copy cache</span>
                </div>

                <div className="bg-[#21232e] border border-[#2e303f] p-3 rounded-none">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Speed Limit
                  </span>
                  <div className="text-lg font-bold font-mono text-emerald-400">Unlimited</div>
                  <span className="text-[10px] text-slate-400">Max throughput</span>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-2 border-t border-[#282a38] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Queue Management</span>
                {onNavigateToTasks && (
                  <button
                    onClick={onNavigateToTasks}
                    className="text-[11px] font-bold text-slate-300 hover:text-white bg-[#252734] hover:bg-[#303344] px-3 py-1.5 rounded-none border border-[#383b4e] transition cursor-pointer"
                  >
                    Open Workspace &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button (+) */}
        <button
          onClick={() => onOpenAddModal('link')}
          className="fixed bottom-14 right-8 z-50 bg-[#b9cefd] hover:bg-[#a6c1fd] text-[#0f172a] p-4 rounded-none shadow-2xl transition duration-200 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 border border-white/20"
          title="Add New Download Task"
        >
          <Plus className="h-6 w-6 stroke-3" />
        </button>
      </div>
    )
  }
)

HomeDashboard.displayName = 'HomeDashboard'
