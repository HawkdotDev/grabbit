import React, { useState, useEffect } from 'react'
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Sliders,
  Activity,
  Zap,
  Minus,
  Square,
  Copy,
  X
} from 'lucide-react'

interface TopBarProps {
  onOpenAddModal: () => void
  onPauseAll: () => void
  onResumeAll: () => void
  onClearCompleted: () => void
  onOpenSettingsModal: () => void
  showSpeedChart: boolean
  setShowSpeedChart: (show: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenAddModal,
  onPauseAll,
  onResumeAll,
  onClearCompleted,
  onOpenSettingsModal,
  showSpeedChart,
  setShowSpeedChart,
  activeTab,
  setActiveTab
}) => {
  const [isMaximized, setIsMaximized] = useState(false)

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

  const tabs = [
    { id: 'all', label: 'Inbox Overview' },
    { id: 'downloading', label: 'Active Queue' },
    { id: 'completed', label: 'History' }
  ]

  return (
    <header className="bg-[#1e1e1e] border-b border-[#2e2e2e] flex flex-col select-none font-sans">
      {/* Upper Window Control Bar - Draggable Title Bar */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-[#292929] style-drag">
        {/* Left window controls + Tabs (No drag zone) */}
        <div className="flex items-center gap-5 style-no-drag">
          {/* Square Style Interactive Window Dots */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="h-3 w-3 bg-rose-500 hover:bg-rose-600 transition cursor-pointer flex items-center justify-center group rounded-none"
              title="Close"
            >
              <X className="h-2 w-2 text-rose-950 opacity-0 group-hover:opacity-100 transition stroke-[3]" />
            </button>

            <button
              onClick={handleMinimize}
              className="h-3 w-3 bg-amber-500 hover:bg-amber-600 transition cursor-pointer flex items-center justify-center group rounded-none"
              title="Minimize"
            >
              <Minus className="h-2 w-2 text-amber-950 opacity-0 group-hover:opacity-100 transition stroke-[3]" />
            </button>

            <button
              onClick={handleMaximize}
              className="h-3 w-3 bg-emerald-500 hover:bg-emerald-600 transition cursor-pointer flex items-center justify-center group rounded-none"
              title="Maximize / Restore"
            >
              <Square className="h-2 w-2 text-emerald-950 opacity-0 group-hover:opacity-100 transition stroke-[3]" />
            </button>
          </div>

          <div className="h-4 w-px bg-[#2e2e2e]" />

          {/* File Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-none flex items-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#381c1c] text-[#e44232]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-none ${isActive ? 'bg-[#e44232]' : 'bg-slate-500'}`}
                  />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Status & Window Controls (No drag zone) */}
        <div className="flex items-center gap-3 style-no-drag">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 text-xs font-semibold text-[#e44232] border border-white/5 rounded-none">
            <Zap className="h-3.5 w-3.5 fill-[#e44232]/20" />
            <span>Neobit Engine</span>
          </div>

          <div className="h-4 w-px bg-[#2e2e2e]" />

          {/* Integrated Window Control Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleMinimize}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer rounded-none"
              title="Minimize Window"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={handleMaximize}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer rounded-none"
              title={isMaximized ? 'Restore Window' : 'Maximize Window'}
            >
              {isMaximized ? <Copy className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-600 transition cursor-pointer rounded-none"
              title="Close Application"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="h-12 px-4 flex items-center justify-between bg-[#141414]">
        {/* Action Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 bg-[#e44232] hover:bg-[#ff4d3d] active:scale-95 text-white text-xs font-semibold shadow-md shadow-[#e44232]/20 flex items-center gap-2 transition cursor-pointer rounded-none"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add task</span>
          </button>

          <button
            onClick={onResumeAll}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/5 flex items-center gap-2 transition cursor-pointer rounded-none"
          >
            <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>Resume All</span>
          </button>

          <button
            onClick={onPauseAll}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/5 flex items-center gap-2 transition cursor-pointer rounded-none"
          >
            <Pause className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
            <span>Pause All</span>
          </button>

          <button
            onClick={onClearCompleted}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/5 flex items-center gap-2 transition cursor-pointer rounded-none"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Clear Finished</span>
          </button>

          <button
            onClick={() => setShowSpeedChart(!showSpeedChart)}
            className={`px-3 py-1.5 text-xs font-semibold border flex items-center gap-2 transition cursor-pointer rounded-none ${
              showSpeedChart
                ? 'bg-[#381c1c] text-[#e44232] border-[#e44232]/30'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Bandwidth Chart</span>
          </button>
        </div>

        {/* Settings Action */}
        <button
          onClick={onOpenSettingsModal}
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/5 flex items-center gap-2 transition cursor-pointer rounded-none"
        >
          <Sliders className="h-3.5 w-3.5 text-[#e44232]" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  )
}
