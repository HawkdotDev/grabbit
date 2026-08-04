import React from 'react'
import { DownloadItem, SpeedSample } from '../../../engine/types'
import { SpeedChart } from './SpeedChart'
import { formatSpeed, formatBytes } from '../utils/formatters'
import {
  Activity,
  Zap,
  HardDrive,
  Cpu,
  ShieldCheck,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react'

interface AnalyticsViewProps {
  downloads: DownloadItem[]
  speedHistory: SpeedSample[]
  globalSpeed: number
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = React.memo(
  ({ downloads, speedHistory, globalSpeed }) => {
    const totalDownloadedBytes = downloads.reduce((acc, d) => acc + d.downloadedSize, 0)
    const totalSize = downloads.reduce((acc, d) => acc + d.totalSize, 0)
    const activeTasksCount = downloads.filter(
      (d) => d.status === 'downloading' || d.status === 'seeding'
    ).length
    const peakSpeed = Math.max(...speedHistory.map((s) => s.downloadSpeed), globalSpeed, 0)

    return (
      <div className="flex-1 flex flex-col h-full bg-ide-bg p-6 overflow-y-auto font-sans text-xs select-none space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-ide-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-theme-tint text-theme-accent border border-theme-accent/30">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">
                Engine Analytics &amp; Diagnostics
              </h1>
              <p className="text-xs text-slate-400">
                Real-time multi-threaded bandwidth, disk I/O pool, and network thread telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono bg-ide-surface px-3 py-1.5 border border-ide-border">
            <span className="h-2 w-2 bg-theme-accent rounded-full animate-ping" />
            <span className="text-slate-300">Live Telemetry Active</span>
          </div>
        </div>

        {/* Top Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Current Speed */}
          <div className="bg-ide-surface border border-ide-border p-4 space-y-2">
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

          {/* Card 2: Peak Speed */}
          <div className="bg-ide-surface border border-ide-border p-4 space-y-2">
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

          {/* Card 3: Total Transferred */}
          <div className="bg-ide-surface border border-ide-border p-4 space-y-2">
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

          {/* Card 4: Active Worker Pool */}
          <div className="bg-ide-surface border border-ide-border p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-amber-400" /> Worker Thread Pool
              </span>
              <span className="text-[10px] font-mono bg-amber-950/60 text-amber-400 px-1.5 py-0.5 border border-amber-800">
                ACTIVE
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">
              {activeTasksCount} Tasks
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Copy File Handle Cache</span>
            </div>
          </div>
        </div>

        {/* Real-time Bandwidth Chart Panel */}
        <div className="bg-ide-surface border border-ide-border p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-ide-border pb-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-theme-accent" />
              Real-time Throughput Sampling (1s Interval)
            </h3>
            <span className="font-mono text-slate-400 text-[11px]">60 History Samples</span>
          </div>

          <div className="h-64 w-full">
            <SpeedChart history={speedHistory} />
          </div>
        </div>
      </div>
    )
  }
)

AnalyticsView.displayName = 'AnalyticsView'
