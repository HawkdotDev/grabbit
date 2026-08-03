import React from 'react'
import { Search, Play, Pause, Trash2, Activity } from 'lucide-react'

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  onPauseAll: () => void
  onResumeAll: () => void
  onClearCompleted: () => void
  showSpeedChart: boolean
  setShowSpeedChart: (show: boolean) => void
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onPauseAll,
  onResumeAll,
  onClearCompleted,
  showSpeedChart,
  setShowSpeedChart
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between select-none">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search downloads by name or URL..."
          className="w-full bg-slate-950 text-slate-200 placeholder-slate-500 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 transition duration-150"
        />
      </div>

      {/* Global Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResumeAll}
          title="Resume All Paused"
          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition cursor-pointer"
        >
          <Play className="h-4 w-4 fill-emerald-400/20" />
          <span>Resume All</span>
        </button>

        <button
          onClick={onPauseAll}
          title="Pause All Active"
          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition cursor-pointer"
        >
          <Pause className="h-4 w-4 fill-amber-400/20" />
          <span>Pause All</span>
        </button>

        <button
          onClick={onClearCompleted}
          title="Clear Completed Downloads"
          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear Finished</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        <button
          onClick={() => setShowSpeedChart(!showSpeedChart)}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
            showSpeedChart
              ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
              : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:bg-slate-700'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Bandwidth Graph</span>
        </button>
      </div>
    </header>
  )
}
