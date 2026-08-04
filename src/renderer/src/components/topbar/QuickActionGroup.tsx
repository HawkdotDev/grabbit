import React from 'react'
import { Play, Pause, Trash2, Sliders } from 'lucide-react'
import { AddDropdown } from './AddDropdown'

interface QuickActionGroupProps {
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onPauseAll: () => void
  onResumeAll: () => void
  onClearCompleted: () => void
  onOpenSettingsModal: () => void
}

export const QuickActionGroup: React.FC<QuickActionGroupProps> = React.memo(
  ({ onOpenAddModal, onPauseAll, onResumeAll, onClearCompleted, onOpenSettingsModal }) => {
    return (
      <div className="flex items-center gap-2 py-1">
        <AddDropdown onOpenAddModal={onOpenAddModal} />

        <button
          onClick={onResumeAll}
          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition cursor-pointer rounded-none"
          title="Resume All Downloads"
        >
          <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/20" />
          <span>Resume</span>
        </button>

        <button
          onClick={onPauseAll}
          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition cursor-pointer rounded-none"
          title="Pause All Downloads"
        >
          <Pause className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
          <span>Pause</span>
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
          <Sliders className="h-3.5 w-3.5 text-theme-accent" />
          <span>Options</span>
        </button>
      </div>
    )
  }
)

QuickActionGroup.displayName = 'QuickActionGroup'
