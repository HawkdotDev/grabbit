import React, { useState } from 'react'
import { Plus, Sliders } from 'lucide-react'

interface MenuBarProps {
  onOpenAddModal: () => void
  onOpenSettingsModal: () => void
}

export const MenuBar: React.FC<MenuBarProps> = ({ onOpenAddModal, onOpenSettingsModal }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-1 text-xs text-slate-300 font-medium style-no-drag">
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
  )
}
