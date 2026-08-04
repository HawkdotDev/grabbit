import React from 'react'
import { SlidersHorizontal, Share2, Settings } from 'lucide-react'

interface NetworkFilterBarProps {
  activeFilter: 'all' | 'downloads' | 'uploads' | 'peers'
  setActiveFilter: (filter: 'all' | 'downloads' | 'uploads' | 'peers') => void
  chartType: 'area' | 'bar'
  setChartType: (mode: 'area' | 'bar') => void
}

export const NetworkFilterBar: React.FC<NetworkFilterBarProps> = React.memo(
  ({ activeFilter, setActiveFilter, chartType, setChartType }) => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-950 font-extrabold shadow-md'
                : 'bg-[#222430] hover:bg-[#2c2e3d] text-slate-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('downloads')}
            className={`px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeFilter === 'downloads'
                ? 'bg-white text-slate-950 font-extrabold shadow-md'
                : 'bg-[#222430] hover:bg-[#2c2e3d] text-slate-300'
            }`}
          >
            Downloads
          </button>
          <button
            onClick={() => setActiveFilter('uploads')}
            className={`px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeFilter === 'uploads'
                ? 'bg-white text-slate-950 font-extrabold shadow-md'
                : 'bg-[#222430] hover:bg-[#2c2e3d] text-slate-300'
            }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setActiveFilter('peers')}
            className={`px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeFilter === 'peers'
                ? 'bg-white text-slate-950 font-extrabold shadow-md'
                : 'bg-[#222430] hover:bg-[#2c2e3d] text-slate-300'
            }`}
          >
            Peers
          </button>
          <div className="p-1.5 bg-[#222430] text-slate-400 hover:text-white cursor-pointer ml-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType(chartType === 'area' ? 'bar' : 'area')}
            className="px-3 py-1.5 bg-[#222430] hover:bg-[#2c2e3d] text-slate-300 transition cursor-pointer text-xs font-semibold"
            title="Toggle Graph Mode"
          >
            {chartType === 'area' ? 'Bar Chart' : 'Smooth Curve'}
          </button>
          <button
            className="p-2 bg-[#222430] hover:bg-[#2c2e3d] text-slate-300 transition cursor-pointer"
            title="Export Telemetry Data"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            className="p-2 bg-[#222430] hover:bg-[#2c2e3d] text-slate-300 transition cursor-pointer"
            title="Graph Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }
)

NetworkFilterBar.displayName = 'NetworkFilterBar'
