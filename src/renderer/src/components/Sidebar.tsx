import React from 'react'
import { DownloadCategory, DownloadItem } from '../../../engine/types'
import {
  Download,
  CheckCircle2,
  PauseCircle,
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image,
  Code,
  Folder,
  Plus,
  Settings,
  Activity,
  Layers
} from 'lucide-react'

interface SidebarProps {
  activeCategory: DownloadCategory | 'downloading' | 'completed' | 'paused'
  setActiveCategory: (cat: DownloadCategory | 'downloading' | 'completed' | 'paused') => void
  downloads: DownloadItem[]
  onOpenAddModal: () => void
  onOpenSettingsModal: () => void
  globalSpeed: number
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  setActiveCategory,
  downloads,
  onOpenAddModal,
  onOpenSettingsModal,
  globalSpeed
}) => {
  const getCount = (cat: string): number => {
    if (cat === 'all') return downloads.length
    if (cat === 'downloading') return downloads.filter((d) => d.status === 'downloading').length
    if (cat === 'completed') return downloads.filter((d) => d.status === 'completed').length
    if (cat === 'paused') return downloads.filter((d) => d.status === 'paused').length
    return downloads.filter((d) => d.category === cat).length
  }

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
    return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const categories = [
    { id: 'all', label: 'All Downloads', icon: Layers },
    { id: 'downloading', label: 'Downloading', icon: Download },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'paused', label: 'Paused', icon: PauseCircle },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'compressed', label: 'Archives', icon: Archive },
    { id: 'video', label: 'Videos', icon: Film },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'executables', label: 'Executables', icon: Cpu },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'other', label: 'Other Files', icon: Folder }
  ]

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-full select-none">
      {/* Top Header */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-none">neobit</h1>
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                Accelerator
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-3">
          <button
            onClick={onOpenAddModal}
            className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            New Download
          </button>
        </div>

        {/* Category List */}
        <nav className="px-2 py-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-260px)]">
          {categories.map((cat) => {
            const Icon = cat.icon
            const count = getCount(cat.id)
            const isActive = activeCategory === cat.id

            return (
              <button
                key={cat.id}
                onClick={() =>
                  setActiveCategory(
                    cat.id as DownloadCategory | 'downloading' | 'completed' | 'paused'
                  )
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer Info & Settings */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Speed</span>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">
            {formatSpeed(globalSpeed)}
          </span>
        </div>

        <button
          onClick={onOpenSettingsModal}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition duration-150 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span>Preferences &amp; Engine Settings</span>
        </button>
      </div>
    </aside>
  )
}
