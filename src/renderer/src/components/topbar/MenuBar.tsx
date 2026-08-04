import React, { useState } from 'react'
import { Plus, Sliders, Download, Upload } from 'lucide-react'

interface MenuBarProps {
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onOpenSettingsModal: () => void
}

export const MenuBar: React.FC<MenuBarProps> = ({ onOpenAddModal, onOpenSettingsModal }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleExport = async (): Promise<void> => {
    if (window.api && window.api.exportQueue) {
      await window.api.exportQueue()
    }
  }

  const handleImport = async (): Promise<void> => {
    if (window.api && window.api.importQueue) {
      await window.api.importQueue()
    }
  }

  return (
    <div className="flex items-center gap-3 text-xs text-slate-300 font-medium style-no-drag">
      {['File', 'Edit', 'View', 'Tools', 'Help'].map((item) => (
        <div key={item} className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === item ? null : item)}
            className="px-4 py-1.5 hover:bg-white/10 hover:text-white rounded-none transition cursor-pointer"
          >
            {item}
          </button>
          {activeMenu === item && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-ide-surface border border-ide-border shadow-2xl py-1 z-50 rounded-none text-slate-200">
              <button
                onClick={() => {
                  onOpenAddModal()
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add New Task/URL
              </button>
              <button
                onClick={() => {
                  handleExport()
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Export Queue State
              </button>
              <button
                onClick={() => {
                  handleImport()
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" /> Import Queue State
              </button>
              <div className="border-t border-ide-border my-1" />
              <button
                onClick={() => {
                  onOpenSettingsModal()
                  setActiveMenu(null)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5" /> Options &amp; Settings
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
