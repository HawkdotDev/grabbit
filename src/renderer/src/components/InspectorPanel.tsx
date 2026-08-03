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
    <aside className="w-80 bg-[#1e1e1e] border-l border-[#2e2e2e] p-4 flex flex-col gap-4 font-sans text-xs select-none shrink-0">
      {/* Inspector Header */}
      <div className="bg-[#141414] p-3.5 border border-[#2e2e2e] flex items-center justify-between rounded-none">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-[#e44232] animate-spin" />
          <span className="font-semibold text-slate-200">Tasks Evaluated</span>
        </div>
        <span className="px-2.5 py-0.5 bg-[#381c1c] text-[#e44232] font-mono font-bold rounded-none">
          {downloads.length}
        </span>
      </div>

      {/* Issues / Error List Card */}
      <div className="bg-[#141414] p-3.5 border border-[#2e2e2e] space-y-2 rounded-none">
        <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-[#292929] pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span>Task Diagnostics</span>
          </div>
          <span className="text-slate-500 font-mono">{errorDownloads.length} issues</span>
        </div>

        {errorDownloads.length > 0 ? (
          errorDownloads.map((err) => (
            <div
              key={err.id}
              className="p-2.5 bg-rose-950/20 border border-rose-900/40 text-rose-300 space-y-1 rounded-none"
            >
              <div className="font-semibold truncate">{err.name}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {err.error || 'Network error'}
              </div>
            </div>
          ))
        ) : (
          <div className="py-3 text-center text-slate-500 text-xs italic">
            No issues detected in current queue.
          </div>
        )}
      </div>

      {/* Quick Summary Cards */}
      <div className="bg-[#141414] p-3.5 border border-[#2e2e2e] space-y-2.5 rounded-none">
        <div className="flex items-center justify-between text-slate-200 font-semibold">
          <span>Engine Status</span>
          <span className="text-[#e44232] font-mono">32 Threads</span>
        </div>

        <div className="space-y-2 pt-1 text-xs text-slate-400 font-medium">
          <div className="flex items-center justify-between">
            <span>Active Streams:</span>
            <span className="text-cyan-400 font-mono font-semibold">{activeCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Completed Files:</span>
            <span className="text-emerald-400 font-mono font-semibold">{completedCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Direct pwrite Mode:</span>
            <span className="text-[#e44232] font-semibold">ENABLED</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-auto space-y-2">
        <button
          onClick={onResumeAll}
          className="w-full py-3 px-4 bg-[#e44232] hover:bg-[#ff4d3d] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#e44232]/20 transition duration-150 cursor-pointer font-sans rounded-none"
        >
          <Zap className="h-4 w-4 fill-white" />
          <span>Accelerate All Tasks</span>
        </button>

        {completedCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer font-sans rounded-none"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Clean Finished Tasks</span>
          </button>
        )}
      </div>
    </aside>
  )
}
