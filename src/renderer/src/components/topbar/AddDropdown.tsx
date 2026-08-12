import React, { useState } from 'react'
import { Plus, ChevronDown, Link, FileUp } from 'lucide-react'

interface AddDropdownProps {
  onOpenAddModal: (mode?: 'link' | 'file') => void
}

export const AddDropdown: React.FC<AddDropdownProps> = React.memo(({ onOpenAddModal }) => {
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsAddDropdownOpen((prev) => !prev)}
        className="px-3 py-1 bg-theme-accent hover:bg-theme-bright active:scale-95 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer rounded-none"
        title="Add New Download Task"
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        <span>Add</span>
        <ChevronDown
          className={`h-3.5 w-3.5 ml-0.5 transition-transform duration-200 ${
            isAddDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isAddDropdownOpen && (
        <>
          <div className="fixed inset-0 z-90" onClick={() => setIsAddDropdownOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-ide-surface border border-ide-border shadow-2xl py-1 z-100 rounded-none text-slate-200 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => {
                setIsAddDropdownOpen(false)
                onOpenAddModal('link')
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 transition cursor-pointer font-medium"
            >
              <Link className="h-4 w-4 text-theme-accent" />
              <div>
                <div className="font-bold text-slate-100">Add URL / Link</div>
                <div className="text-[10px] text-slate-400">Direct HTTP / HTTPS URL</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsAddDropdownOpen(false)
                onOpenAddModal('file')
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 border-t border-ide-border/50 transition cursor-pointer font-medium"
            >
              <FileUp className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="font-bold text-slate-100">Add Torrent / File</div>
                <div className="text-[10px] text-slate-400">Local .torrent or Metalink</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
})

AddDropdown.displayName = 'AddDropdown'
