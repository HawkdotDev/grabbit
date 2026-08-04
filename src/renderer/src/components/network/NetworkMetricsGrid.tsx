import React from 'react'
import { formatSpeed, formatBytes } from '../../utils/formatters'
import {
  Zap,
  Activity,
  HardDrive,
  Cpu,
  ShieldCheck,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react'

interface NetworkMetricsGridProps {
  globalSpeed: number
  peakSpeed: number
  totalDownloadedBytes: number
  totalSize: number
  activeTasks: number
}

export const NetworkMetricsGrid: React.FC<NetworkMetricsGridProps> = React.memo(
  ({ globalSpeed, peakSpeed, totalDownloadedBytes, totalSize, activeTasks }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Speed */}
        <div className="bg-[#181920] border border-[#272935] p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-xs flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-theme-accent" /> Current Speed
            </span>
            <span className="text-[10px] font-mono bg-theme-tint text-theme-accent px-1.5 py-0.5">
              100ms IPC
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-theme-accent">
            {formatSpeed(globalSpeed)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Throttled IPC Channel</span>
          </div>
        </div>

        {/* Peak Speed */}
        <div className="bg-[#181920] border border-[#272935] p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-xs flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-cyan-400" /> Peak Acceleration
            </span>
            <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-1.5 py-0.5 border border-cyan-800">
              MAX
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {formatSpeed(peakSpeed)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowUpCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span>32 Active Worker Threads</span>
          </div>
        </div>

        {/* Total Transferred */}
        <div className="bg-[#181920] border border-[#272935] p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-xs flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-purple-400" /> Data Transferred
            </span>
            <span className="text-[10px] font-mono bg-purple-950/60 text-purple-400 px-1.5 py-0.5 border border-purple-800">
              DISK
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {formatBytes(totalDownloadedBytes)}
          </div>
          <div className="text-[11px] text-slate-400">
            Out of {formatBytes(totalSize)} total queued
          </div>
        </div>

        {/* Worker Pool */}
        <div className="bg-[#181920] border border-[#272935] p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-xs flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-amber-400" /> Worker Thread Pool
            </span>
            <span className="text-[10px] font-mono bg-amber-950/60 text-amber-400 px-1.5 py-0.5 border border-amber-800">
              ACTIVE
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{activeTasks} Tasks</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Zero-Copy File Handle Cache</span>
          </div>
        </div>
      </div>
    )
  }
)

NetworkMetricsGrid.displayName = 'NetworkMetricsGrid'
