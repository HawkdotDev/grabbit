import React from 'react'
import { Home, Activity, Network } from 'lucide-react'
import { AddDropdown } from './AddDropdown'

interface QuickActionGroupProps {
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onClearCompleted?: () => void
  activeView: 'home' | 'analytics' | 'network'
  setActiveView: (view: 'home' | 'analytics' | 'network') => void
}

export const QuickActionGroup: React.FC<QuickActionGroupProps> = React.memo(
  ({ onOpenAddModal, activeView, setActiveView }) => {
    return (
      <div className="flex items-center gap-2 py-1">
        <AddDropdown onOpenAddModal={onOpenAddModal} />

        <button
          onClick={() => setActiveView('home')}
          className={`px-2.5 py-1 text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer rounded-none ${
            activeView === 'home'
              ? 'bg-theme-accent text-white border-theme-accent font-bold shadow-sm'
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
              ? 'bg-theme-accent text-white border-theme-accent font-bold shadow-sm'
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
              ? 'bg-theme-accent text-white border-theme-accent font-bold shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
          }`}
          title="Switch to Network Telemetry & Throughput Graph"
        >
          <Network className="h-3.5 w-3.5" />
          <span>Network</span>
        </button>
      </div>
    )
  }
)

QuickActionGroup.displayName = 'QuickActionGroup'
