import React, { useState } from 'react'
import { DownloadItem, SpeedSample } from '../../../../engine/types'
import { SpeedChart } from '../common/SpeedChart'
import { NetworkFilterBar } from './NetworkFilterBar'
import { NetworkGraph } from './NetworkGraph'
import { NetworkMetricsGrid } from './NetworkMetricsGrid'

interface NetworkViewProps {
  downloads: DownloadItem[]
  speedHistory: SpeedSample[]
  globalSpeed: number
}

export const NetworkView: React.FC<NetworkViewProps> = React.memo(
  ({ downloads, speedHistory, globalSpeed }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'downloads' | 'uploads' | 'peers'>(
      'all'
    )
    const [chartType, setChartType] = useState<'area' | 'bar'>('area')

    const totalDownloadedBytes = downloads.reduce((acc, d) => acc + d.downloadedSize, 0)
    const totalSize = downloads.reduce((acc, d) => acc + d.totalSize, 0)
    const activeTasks = downloads.filter(
      (d) => d.status === 'downloading' || d.status === 'seeding'
    ).length
    const peakSpeed = Math.max(...speedHistory.map((s) => s.downloadSpeed), globalSpeed, 0)

    const samples =
      speedHistory.length > 0
        ? speedHistory
        : [
            {
              timestamp: Date.now(),
              downloadSpeed: globalSpeed,
              uploadSpeed: downloads.reduce((acc, d) => acc + (d.upSpeed || 0), 0)
            }
          ]

    return (
      <div className="flex-1 flex flex-col h-full bg-[#121317] text-slate-100 p-2 md:p-4 overflow-y-auto font-sans text-xs select-none space-y-6">
        {/* Main Network Graph Container */}
        <div className="bg-[#181920] border border-[#272935] p-6 space-y-4 relative shadow-xl">
          <NetworkFilterBar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            chartType={chartType}
            setChartType={setChartType}
          />

          {chartType === 'bar' ? (
            <div className="h-72 w-full pt-4">
              <SpeedChart history={speedHistory} />
            </div>
          ) : (
            <NetworkGraph samples={samples} globalSpeed={globalSpeed} />
          )}

          {/* Bottom Timeline Labels */}
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] pt-2 border-t border-[#272935]">
            <span>60s ago</span>
            <span>45s ago</span>
            <span>30s ago</span>
            <span>15s ago</span>
            <span className="text-emerald-400 font-bold">LIVE (Now)</span>
          </div>
        </div>

        {/* Diagnostic Metrics Cards Grid */}
        <NetworkMetricsGrid
          globalSpeed={globalSpeed}
          peakSpeed={peakSpeed}
          totalDownloadedBytes={totalDownloadedBytes}
          totalSize={totalSize}
          activeTasks={activeTasks}
        />
      </div>
    )
  }
)

NetworkView.displayName = 'NetworkView'
