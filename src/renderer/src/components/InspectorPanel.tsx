import React from 'react'
import { DownloadItem } from '../../../engine/types'
import { AlertCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react'

interface InspectorPanelProps {
  downloads: DownloadItem[]
  onResumeAll: () => void
  onClearCompleted: () => void
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  downloads,
  onResumeAll,
  onClearCompleted
}) => {
  const activeCount = downloads.filter((d) => d.status === 'downloading').length
  const completedCount = downloads.filter((d) => d.status === 'completed').length
  const errorDownloads = downloads.filter((d) => d.status === 'error')

  return (
    <aside className="w-80 bg-ide-surface border-l border-ide-border p-4 flex flex-col gap-4 font-mono text-xs select-none shrink-0">
      {/* Inspector Header */}
      <div className="bg-ide-bg p-3 rounded-xl border border-ide-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-lime-accent animate-spin" />
          <span className="font-bold text-slate-200">Tasks Evaluated</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#202228] text-lime-accent font-bold">
          {downloads.length}
        </span>
      </div>

      {/* Issues / Error List Card */}
      <div className="bg-ide-bg p-3 rounded-xl border border-ide-border space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-bold border-b border-[#23252b] pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span>Task Diagnostics</span>
          </div>
          <span className="text-slate-500">{errorDownloads.length} issues</span>
        </div>

        {errorDownloads.length > 0 ? (
          errorDownloads.map((err) => (
            <div
              key={err.id}
              className="p-2 bg-[#202228] rounded-lg border border-rose-950 text-rose-300 space-y-1"
            >
              <div className="font-bold truncate">{err.name}</div>
              <div className="text-[10px] text-slate-400">{err.error || 'Network error'}</div>
            </div>
          ))
        ) : (
          <div className="py-3 text-center text-slate-500 text-[11px] italic">
            No errors detected in download queue.
          </div>
        )}
      </div>

      {/* Quick Summary Cards */}
      <div className="bg-ide-bg p-3 rounded-xl border border-ide-border space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-bold">
          <span>Engine Status</span>
          <span className="text-lime-accent">32 Threads Ready</span>
        </div>

        <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span>Active Streams:</span>
            <span className="text-cyan-400 font-bold">{activeCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Completed Files:</span>
            <span className="text-emerald-400 font-bold">{completedCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Direct pwrite Mode:</span>
            <span className="text-lime-accent font-bold">ENABLED</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button (Vibrant Neon Lime as in image) */}
      <div className="mt-auto space-y-2">
        <button
          onClick={onResumeAll}
          className="w-full py-3 px-4 bg-lime-bright hover:bg-[#b8e600] active:scale-95 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-lime-bright/10 transition duration-150 cursor-pointer font-sans"
        >
          <Zap className="h-4 w-4 fill-slate-950" />
          <span>Accelerate All Tasks</span>
        </button>

        {completedCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="w-full py-2 px-3 bg-[#202228] hover:bg-[#282b33] text-slate-300 rounded-xl border border-ide-border font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer font-sans"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Clean Completed Tasks</span>
          </button>
        )}
      </div>
    </aside>
  )
}
