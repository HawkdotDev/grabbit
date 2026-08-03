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
    { id: 'all', label: 'dashboard.tsx' },
    { id: 'downloading', label: 'active_queue.ts' },
    { id: 'completed', label: 'history.log' }
  ]

  return (
    <header className="bg-[#18191d] border-b border-[#2a2d34] flex flex-col select-none">
      {/* Upper Window Control Bar */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[#23252b]">
        {/* Left window controls + Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56] inline-block" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e] inline-block" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f] inline-block" />
          </div>

          <button
            onClick={onOpenAddModal}
            className="p-1 hover:bg-[#252830] text-slate-400 hover:text-white rounded-md transition cursor-pointer"
            title="New Download Task"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* File Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-xs font-mono rounded-t-md flex items-center gap-2 border-t-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#121316] text-[#a3e635] border-[#a3e635] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-[#202228]'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#202228] px-2.5 py-1 rounded-md text-xs font-mono text-[#a3e635] border border-[#2a2d34]">
            <Zap className="h-3.5 w-3.5 fill-[#a3e635]/20" />
            <span>Neobit Engine v1.0</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="h-11 px-4 flex items-center justify-between bg-[#141518]">
        {/* Action Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 bg-[#202228] hover:bg-[#282b33] text-slate-200 text-xs font-mono rounded-lg border border-[#2a2d34] flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#a3e635]" />
            <span>New Task</span>
          </button>

          <button
            onClick={onResumeAll}
            className="px-3 py-1.5 bg-[#202228] hover:bg-[#282b33] text-slate-200 text-xs font-mono rounded-lg border border-[#2a2d34] flex items-center gap-2 transition cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 text-emerald-400" />
            <span>Resume All</span>
          </button>

          <button
            onClick={onPauseAll}
            className="px-3 py-1.5 bg-[#202228] hover:bg-[#282b33] text-slate-200 text-xs font-mono rounded-lg border border-[#2a2d34] flex items-center gap-2 transition cursor-pointer"
          >
            <Pause className="h-3.5 w-3.5 text-amber-400" />
            <span>Pause All</span>
          </button>

          <button
            onClick={onClearCompleted}
            className="px-3 py-1.5 bg-[#202228] hover:bg-[#282b33] text-slate-200 text-xs font-mono rounded-lg border border-[#2a2d34] flex items-center gap-2 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Clear Finished</span>
          </button>

          <button
            onClick={() => setShowSpeedChart(!showSpeedChart)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border flex items-center gap-2 transition cursor-pointer ${
              showSpeedChart
                ? 'bg-[#223311] text-[#a3e635] border-[#446611]'
                : 'bg-[#202228] text-slate-400 border-[#2a2d34] hover:bg-[#282b33]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Bandwidth</span>
          </button>
        </div>

        {/* Settings Action */}
        <button
          onClick={onOpenSettingsModal}
          className="px-3 py-1.5 bg-[#202228] hover:bg-[#282b33] text-slate-300 text-xs font-mono rounded-lg border border-[#2a2d34] flex items-center gap-2 transition cursor-pointer"
        >
          <Sliders className="h-3.5 w-3.5 text-[#a3e635]" />
          <span>Config</span>
        </button>
      </div>
    </header>
  )
}
