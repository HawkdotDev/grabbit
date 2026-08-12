import React from 'react'
import { Home, Activity, Network, Film } from 'lucide-react'
import { AddDropdown } from './AddDropdown'

interface QuickActionGroupProps {
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onClearCompleted?: () => void
  activeView: 'home' | 'analytics' | 'network' | 'stream'
  setActiveView: (view: 'home' | 'analytics' | 'network' | 'stream') => void
}

export const QuickActionGroup: React.FC<QuickActionGroupProps> = React.memo(
  ({ onOpenAddModal, activeView, setActiveView }) => {
    return (
      <div className="w-full flex items-center justify-between py-1">
        {/* Left Side: View Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('home')}
            className={`px-2.5 py-1 text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer rounded-none ${
              activeView === 'home'
                ? 'bg-theme-accent text-slate-950 border-theme-accent font-bold shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title="Switch to Home Dashboard"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`px-2.5 py-1 text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer rounded-none ${
              activeView === 'analytics'
                ? 'bg-theme-accent text-slate-950 border-theme-accent font-bold shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title="Switch to Downloads & Tasks Workspace"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveView('network')}
            className={`px-2.5 py-1 text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer rounded-none ${
              activeView === 'network'
                ? 'bg-theme-accent text-slate-950 border-theme-accent font-bold shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title="Switch to Network Telemetry & Throughput Graph"
          >
            <Network className="h-3.5 w-3.5" />
            <span>Network</span>
          </button>

          <button
            onClick={() => setActiveView('stream')}
            className={`px-2.5 py-1 text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer rounded-none ${
              activeView === 'stream'
                ? 'bg-theme-accent text-slate-950 border-theme-accent font-bold shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title="Switch to Media Stream & Live Player"
          >
            <Film className="h-3.5 w-3.5" />
            <span>Stream</span>
          </button>
        </div>

        {/* Opposite Side: + Add Button */}
        <AddDropdown onOpenAddModal={onOpenAddModal} />
      </div>
    )
  }
)

QuickActionGroup.displayName = 'QuickActionGroup'
