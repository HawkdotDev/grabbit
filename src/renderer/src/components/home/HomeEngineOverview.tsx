import React from 'react'
import { DownloadItem } from '../../../../engine/types'
import { formatSpeed } from '../../utils/formatters'

interface HomeEngineOverviewProps {
  downloads: DownloadItem[]
  globalSpeed: number
  onNavigateToTasks?: () => void
}

export const HomeEngineOverview: React.FC<HomeEngineOverviewProps> = React.memo(
  ({ downloads, globalSpeed, onNavigateToTasks }) => {
    const activeTasksCount = downloads.filter(
      (d) => d.status === 'downloading' || d.status === 'seeding'
    ).length
    const completedTasksCount = downloads.filter((d) => d.status === 'completed').length

    return (
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
          Overview
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
              <div className="text-lg font-bold font-mono text-slate-100">{activeTasksCount}</div>
              <span className="text-[10px] text-slate-400">{completedTasksCount} completed</span>
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
    )
  }
)

HomeEngineOverview.displayName = 'HomeEngineOverview'
