import React, { useState, useEffect } from 'react'
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Sliders,
  Zap,
  Minus,
  Square,
  Copy,
  X,
  Search,
  Filter
} from 'lucide-react'

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
  const [isMaximized, setIsMaximized] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    if (window.api) {
      window.api.isWindowMaximized().then(setIsMaximized)
    }
  }, [])

  const handleMinimize = (): void => {
    window.api?.minimizeWindow()
  }

  const handleMaximize = async (): Promise<void> => {
    if (window.api) {
      const state = await window.api.maximizeWindow()
      setIsMaximized(state)
    }
  }

  const handleClose = (): void => {
    window.api?.closeWindow()
  }

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KiB/s', 'MiB/s', 'GiB/s']
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
    return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <header className="bg-[#1e1e1e] border-b border-[#2e2e2e] flex flex-col select-none font-sans rounded-none">
      {/* Upper Window Title & Menu Bar Row */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[#292929] style-drag">
        {/* Left App Logo & Menu Items */}
        <div className="flex items-center gap-4 style-no-drag">
          <div className="flex items-center gap-2 font-bold text-xs text-white">
            <span className="h-2.5 w-2.5 bg-[#009669] rounded-none animate-pulse" />
            <span className="text-[#009669]">Neobit</span>
            <span className="text-slate-400 font-mono text-[11px]">
              [D: {formatSpeed(globalSpeed)}, U: 0 B/s]
            </span>
          </div>

          <div className="h-4 w-px bg-[#2e2e2e]" />

          {/* Top Menu Item Buttons */}
          <div className="flex items-center gap-1 text-xs text-slate-300 font-medium">
            {['File', 'Edit', 'View', 'Tools', 'Help'].map((item) => (
              <div key={item} className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === item ? null : item)}
                  className="px-2.5 py-1 hover:bg-white/10 hover:text-white rounded-none transition cursor-pointer"
                >
                  {item}
                </button>
                {activeMenu === item && (
                  <div className="absolute left-0 top-full mt-1 w-44 bg-[#1e1e1e] border border-[#2e2e2e] shadow-2xl py-1 z-50 rounded-none text-slate-200">
                    <button
                      onClick={() => {
                        onOpenAddModal()
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#063e2c] hover:text-[#009669] text-xs flex items-center gap-2"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add New Torrent/URL
                    </button>
                    <button
                      onClick={() => {
                        onOpenSettingsModal()
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#063e2c] hover:text-[#009669] text-xs flex items-center gap-2"
                    >
                      <Sliders className="h-3.5 w-3.5" /> Options &amp; Settings
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Status & Frameless Window Controls */}
        <div className="flex items-center gap-3 style-no-drag">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 text-xs font-semibold text-[#009669] border border-white/5 rounded-none">
            <Zap className="h-3.5 w-3.5 fill-[#009669]/20" />
            <span>Neobit v1.0.0</span>
          </div>

          <div className="h-4 w-px bg-[#2e2e2e]" />

          {/* Integrated Window Control Action Buttons */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleMinimize}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
              title="Minimize Window"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={handleMaximize}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
              title={isMaximized ? 'Restore Window' : 'Maximize Window'}
            >
              {isMaximized ? <Copy className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-600 rounded-none transition cursor-pointer"
              title="Close Application"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Toolbar Row (Add, Resume, Pause, Clear, Search, Filter) */}
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
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter torrents/files..."
              className="bg-[#1e1e1e] text-slate-100 placeholder-slate-500 text-xs pl-8 pr-3 py-1 border border-[#2e2e2e] focus:outline-none focus:border-[#009669] font-sans w-52 rounded-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#2e2e2e] px-2 py-1 text-xs text-slate-300 rounded-none">
            <Filter className="h-3.5 w-3.5 text-[#009669]" />
            <span className="text-[11px] text-slate-400">Filter by:</span>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'name' | 'category' | 'tag')}
              className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="name" className="bg-[#1e1e1e]">
                Name
              </option>
              <option value="category" className="bg-[#1e1e1e]">
                Category
              </option>
              <option value="tag" className="bg-[#1e1e1e]">
                Tag
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}
