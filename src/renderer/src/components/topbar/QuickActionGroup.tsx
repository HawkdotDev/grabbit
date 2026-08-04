import React from 'react'
import { Home, Activity, Trash2 } from 'lucide-react'
import { AddDropdown } from './AddDropdown'

interface QuickActionGroupProps {
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onClearCompleted: () => void
  activeView: 'home' | 'analytics'
  setActiveView: (view: 'home' | 'analytics') => void
}

export const QuickActionGroup: React.FC<QuickActionGroupProps> = React.memo(
  ({ onOpenAddModal, onClearCompleted, activeView, setActiveView }) => {
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
          title="Switch to Home View (Tasks Workspace)"
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
          title="Switch to Engine Analytics & Diagnostics View"
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Analytics</span>
        </button>

        <button
          onClick={onClearCompleted}
          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition cursor-pointer rounded-none"
          title="Remove Finished Tasks"
        >
          <Trash2 className="h-3.5 w-3.5 text-slate-400" />
          <span>Clear Finished</span>
        </button>
      </div>
    )
  }
)

QuickActionGroup.displayName = 'QuickActionGroup'
