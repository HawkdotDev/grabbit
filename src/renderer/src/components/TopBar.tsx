import React from 'react'
import { Plus, Play, Pause, Trash2, Sliders, Activity, Zap } from 'lucide-react'

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
  const tabs = [
    { id: 'all', label: 'Inbox Overview' },
    { id: 'downloading', label: 'Active Queue' },
    { id: 'completed', label: 'History' }
  ]

  return (
    <header className="bg-[#1e1e1e] border-b border-[#2e2e2e] flex flex-col select-none font-sans">
      {/* Upper Window Control Bar */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-[#292929]">
        {/* Left window controls + Tabs */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#381c1c] text-[#e44232]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#e44232]' : 'bg-slate-500'}`}
                  />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full text-xs font-semibold text-[#e44232] border border-white/5">
            <Zap className="h-3.5 w-3.5 fill-[#e44232]/20" />
            <span>Neobit Engine Active</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="h-12 px-4 flex items-center justify-between bg-[#141414]">
        {/* Action Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 bg-[#e44232] hover:bg-[#ff4d3d] active:scale-95 text-white text-xs font-semibold rounded-lg shadow-md shadow-[#e44232]/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add task</span>
          </button>

          <button
            onClick={onResumeAll}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-lg border border-white/5 flex items-center gap-2 transition cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>Resume All</span>
          </button>

          <button
            onClick={onPauseAll}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-lg border border-white/5 flex items-center gap-2 transition cursor-pointer"
          >
            <Pause className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
            <span>Pause All</span>
          </button>

          <button
            onClick={onClearCompleted}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-lg border border-white/5 flex items-center gap-2 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Clear Finished</span>
          </button>

          <button
            onClick={() => setShowSpeedChart(!showSpeedChart)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-2 transition cursor-pointer ${
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
          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg border border-white/5 flex items-center gap-2 transition cursor-pointer"
        >
          <Sliders className="h-3.5 w-3.5 text-[#e44232]" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  )
}
