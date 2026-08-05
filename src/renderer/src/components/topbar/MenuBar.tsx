import React, { useState } from 'react'
import {
  Plus,
  Sliders,
  Download,
  Upload,
  Play,
  Pause,
  Trash2,
  CheckSquare,
  Home,
  Activity,
  Network,
  Maximize2,
  Zap,
  ShieldCheck,
  Folder,
  Server,
  BookOpen,
  RefreshCw,
  Info,
  FileUp
} from 'lucide-react'

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

  const renderDropdownContent = (item: string): React.JSX.Element => {
    switch (item) {
      case 'File':
        return (
          <>
            <button
              onClick={() => {
                onOpenAddModal('link')
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Plus className="h-3.5 w-3.5 text-theme-accent" /> Add URL / Link
            </button>
            <button
              onClick={() => {
                onOpenAddModal('file')
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <FileUp className="h-3.5 w-3.5 text-emerald-300" /> Add Torrent File
            </button>
            <div className="border-t border-ide-border my-1" />
            <button
              onClick={() => {
                handleExport()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Download className="h-3.5 w-3.5 text-purple-300" /> Export Queue State
            </button>
            <button
              onClick={() => {
                handleImport()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Upload className="h-3.5 w-3.5 text-sky-300" /> Import Queue State
            </button>
            <div className="border-t border-ide-border my-1" />
            <button
              onClick={() => {
                onOpenSettingsModal()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Sliders className="h-3.5 w-3.5 text-amber-200" /> Preferences &amp; Settings
            </button>
          </>
        )

      case 'Edit':
        return (
          <>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Play className="h-3.5 w-3.5 text-emerald-300" /> Resume All Tasks
            </button>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Pause className="h-3.5 w-3.5 text-amber-200" /> Pause All Tasks
            </button>
            <div className="border-t border-ide-border my-1" />
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-300" /> Clear Completed Tasks
            </button>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <CheckSquare className="h-3.5 w-3.5 text-violet-300" /> Select All Tasks
            </button>
          </>
        )

      case 'View':
        return (
          <>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Home className="h-3.5 w-3.5 text-sky-300" /> Home Dashboard
            </button>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Activity className="h-3.5 w-3.5 text-theme-accent" /> Tasks Workspace
            </button>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Network className="h-3.5 w-3.5 text-cyan-300" /> Network Telemetry
            </button>
            <div className="border-t border-ide-border my-1" />
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Maximize2 className="h-3.5 w-3.5 text-slate-300" /> Toggle Window Fullscreen
            </button>
          </>
        )

      case 'Tools':
        return (
          <>
            <button
              onClick={() => {
                onOpenSettingsModal()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Zap className="h-3.5 w-3.5 text-theme-accent" /> Bandwidth Speed Limiter
            </button>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Checksum / Hash Verifier
            </button>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Folder className="h-3.5 w-3.5 text-amber-200" /> Category &amp; Path Manager
            </button>
            <div className="border-t border-ide-border my-1" />
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Server className="h-3.5 w-3.5 text-cyan-300" /> IPC Remote Control Gateway
            </button>
          </>
        )

      case 'Help':
        return (
          <>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <BookOpen className="h-3.5 w-3.5 text-sky-300" /> Documentation &amp; User Guide
            </button>
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-300" /> Check for Updates...
            </button>
            <div className="border-t border-ide-border my-1" />
            <button
              onClick={() => setActiveMenu(null)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium"
            >
              <Info className="h-3.5 w-3.5 text-theme-accent" /> About Grabbit v0.1.0
            </button>
          </>
        )

      default:
        return <></>
    }
  }

  return (
    <div className="flex items-center gap-1 text-xs text-slate-300 font-medium style-no-drag">
      {['File', 'Edit', 'View', 'Tools', 'Help'].map((item) => (
        <div key={item} className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === item ? null : item)}
            className={`px-2.5 py-1 rounded-none transition cursor-pointer flex items-center leading-none ${
              activeMenu === item
                ? 'bg-theme-tint text-theme-accent font-semibold'
                : 'hover:bg-white/10 hover:text-white'
            }`}
          >
            {item}
          </button>
          {activeMenu === item && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
              <div className="absolute left-0 top-full mt-1 w-52 bg-ide-surface border border-ide-border shadow-2xl py-1 z-50 rounded-none text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                {renderDropdownContent(item)}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
