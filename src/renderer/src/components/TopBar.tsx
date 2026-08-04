import React from 'react'
import { Plus, Play, Pause, Trash2, Sliders, Zap } from 'lucide-react'
import { MenuBar } from './topbar/MenuBar'
import { WindowControls } from './topbar/WindowControls'
import { SearchFilterBar } from './topbar/SearchFilterBar'
import { formatSpeed } from '../utils/formatters'

interface TopBarProps {
  onOpenAddModal: () => void
  onPauseAll: () => void
  onResumeAll: () => void
  onClearCompleted: () => void
  onOpenSettingsModal: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterBy: 'name' | 'category' | 'tag'
  setFilterBy: (f: 'name' | 'category' | 'tag') => void
  globalSpeed: number
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenAddModal,
  onPauseAll,
  onResumeAll,
  onClearCompleted,
  onOpenSettingsModal,
  searchQuery,
  setSearchQuery,
  filterBy,
  setFilterBy,
  globalSpeed
}) => {
  return (
    <header className="bg-[#1e1e1e] border-b border-[#2e2e2e] flex flex-col select-none font-sans rounded-none">
      {/* Upper Window Title & Menu Bar Row */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[#292929] style-drag">
        {/* Left App Logo & Menu Items */}
        <div className="flex items-center gap-4 style-no-drag">
          <div className="flex items-center gap-2 font-bold text-xs text-white">
            <span className="h-2.5 w-2.5 bg-[#009669] rounded-none animate-pulse" />
            <span className="text-[#009669]">Neobit</span>
            <span className="text-slate-400 font-mono text-[11px]">v0.0.1</span>
          </div>

          <div className="h-4 w-px bg-[#2e2e2e]" />

          {/* Top Menu Dropdowns */}
          <MenuBar onOpenAddModal={onOpenAddModal} onOpenSettingsModal={onOpenSettingsModal} />
        </div>

        {/* Right Status & Frameless Window Controls */}
        <div className="flex items-center gap-3 style-no-drag">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 text-xs font-semibold text-[#009669] border border-white/5 rounded-none font-mono">
            <Zap className="h-3.5 w-3.5 fill-[#009669]/20" />
            <span>[D: {formatSpeed(globalSpeed)}, U: 0 B/s]</span>
          </div>

          <div className="h-4 w-px bg-[#2e2e2e]" />

          {/* Integrated Window Control Buttons */}
          <WindowControls />
        </div>
      </div>

      {/* Action Toolbar Row */}
      <div className="h-11 px-3 flex items-center justify-between bg-[#141414]">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1 bg-[#009669] hover:bg-[#059669] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer rounded-none"
            title="Add New Download"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add task</span>
          </button>

          <button
            onClick={onResumeAll}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition cursor-pointer rounded-none"
            title="Resume All Downloads"
          >
            <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>Resume All</span>
          </button>

          <button
            onClick={onPauseAll}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition cursor-pointer rounded-none"
            title="Pause All Downloads"
          >
            <Pause className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
            <span>Pause All</span>
          </button>

          <button
            onClick={onClearCompleted}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition cursor-pointer rounded-none"
            title="Remove Finished Tasks"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Clear Finished</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition cursor-pointer rounded-none"
            title="Options & Preferences"
          >
            <Sliders className="h-3.5 w-3.5 text-[#009669]" />
            <span>Options</span>
          </button>
        </div>

        {/* Right Search Input & Filter Dropdown */}
        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
        />
      </div>
    </header>
  )
}
