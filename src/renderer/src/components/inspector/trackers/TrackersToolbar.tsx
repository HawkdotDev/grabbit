import React from 'react'
import { Search, Plus, RefreshCw } from 'lucide-react'

interface TrackersToolbarProps {
  filterQuery: string
  setFilterQuery: (q: string) => void
  handleSelectAll: () => void
  handleSelectNone: () => void
  isAdding: boolean
  setIsAdding: (adding: boolean) => void
  newTrackerUrl: string
  setNewTrackerUrl: (url: string) => void
  handleAddTrackerSubmit: (e: React.FormEvent) => void
  handleForceReannounce: () => void
  isReannouncing: boolean
}

export const TrackersToolbar: React.FC<TrackersToolbarProps> = React.memo(({
  filterQuery,
  setFilterQuery,
  handleSelectAll,
  handleSelectNone,
  isAdding,
  setIsAdding,
  newTrackerUrl,
  setNewTrackerUrl,
  handleAddTrackerSubmit,
  handleForceReannounce,
  isReannouncing
}) => {
  return (
    <>
      <div className="p-1.5 bg-ide-surface border-b border-ide-border flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSelectAll}
            className="px-2.5 py-0.5 text-[11px] font-medium bg-ide-bg hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="px-2.5 py-0.5 text-[11px] font-medium bg-ide-bg hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer"
          >
            Select None
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="ml-2 px-2 py-0.5 text-[11px] font-medium bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            <span>Add Tracker</span>
          </button>

          <button
            onClick={handleForceReannounce}
            disabled={isReannouncing}
            className="px-2 py-0.5 text-[11px] font-medium bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-600/40 transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isReannouncing ? 'animate-spin' : ''}`} />
            <span>Reannounce</span>
          </button>
        </div>

        {/* Filter Search Input */}
        <div className="relative flex items-center">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter trackers..."
            className="w-48 bg-ide-bg text-slate-100 text-[11px] pl-7 pr-2 py-0.5 border border-ide-border focus:outline-none focus:border-theme-accent font-sans"
          />
        </div>
      </div>

      {/* Add Tracker Form */}
      {isAdding && (
        <form onSubmit={handleAddTrackerSubmit} className="p-2 bg-ide-surface border-b border-ide-border flex items-center gap-2">
          <input
            type="text"
            value={newTrackerUrl}
            onChange={(e) => setNewTrackerUrl(e.target.value)}
            placeholder="udp://tracker.example.com:1337/announce"
            className="flex-1 bg-ide-bg text-slate-100 font-mono text-xs px-2 py-1 border border-ide-border focus:outline-none focus:border-theme-accent"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 bg-theme-tint text-theme-accent border border-theme-accent/50 font-bold hover:bg-theme-accent/20 transition cursor-pointer text-xs"
          >
            Add
          </button>
        </form>
      )}
    </>
  )
})
