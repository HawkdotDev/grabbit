import React from 'react'
import { DownloadCategory, DownloadItem } from '../../../engine/types'
import {
  Plus,
  Search,
  Inbox,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image as ImageIcon,
  Code2,
  Download
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
  onOpenAddModal
}) => {
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true)

  const getCount = (cat: string): number => {
    if (cat === 'all') return downloads.length
    if (cat === 'downloading') return downloads.filter((d) => d.status === 'downloading').length
    if (cat === 'completed') return downloads.filter((d) => d.status === 'completed').length
    if (cat === 'paused') return downloads.filter((d) => d.status === 'paused').length
    return downloads.filter((d) => d.category === cat).length
  }

  const getCategoryIcon = (id: string): React.JSX.Element => {
    switch (id) {
      case 'documents':
        return <FileText className="h-4 w-4 text-amber-500" />
      case 'compressed':
        return <Archive className="h-4 w-4 text-purple-400" />
      case 'video':
        return <Film className="h-4 w-4 text-emerald-400" />
      case 'audio':
        return <Music className="h-4 w-4 text-cyan-400" />
      case 'executables':
        return <Cpu className="h-4 w-4 text-teal-400" />
      case 'images':
        return <ImageIcon className="h-4 w-4 text-yellow-400" />
      case 'code':
        return <Code2 className="h-4 w-4 text-indigo-400" />
      default:
        return <Folder className="h-4 w-4 text-slate-400" />
    }
  }

  const mainNav = [
    { id: 'all', label: 'Inbox', icon: Inbox },
    { id: 'downloading', label: 'Active Queue', icon: Download },
    { id: 'completed', label: 'Completed', icon: Clock },
    { id: 'paused', label: 'Paused', icon: Calendar }
  ]

  const categories = [
    { id: 'documents', label: 'Documents' },
    { id: 'compressed', label: 'Archives' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
    { id: 'executables', label: 'Executables' },
    { id: 'images', label: 'Images' },
    { id: 'code', label: 'Code' }
  ]

  return (
    <aside className="w-64 bg-[#1e1e1e] border-r border-[#2e2e2e] flex flex-col justify-between h-full select-none font-sans text-sm p-3">
      <div className="space-y-4">
        {/* + Add Task Button matching image */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onOpenAddModal}
            className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 active:scale-[0.98] text-[#e44232] rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
          >
            <span className="h-5 w-5 rounded-full bg-[#e44232]/20 flex items-center justify-center text-[#e44232]">
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
            </span>
            <span>Add task</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
            Ctrl N
          </span>
        </div>

        {/* Navigation Section */}
        <div className="space-y-0.5">
          {/* Quick Search */}
          <button
            onClick={onOpenAddModal}
            className="w-full flex items-center gap-3 px-2.5 py-2 text-slate-300 hover:bg-white/5 rounded-lg transition cursor-pointer font-medium text-sm"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <span>Search</span>
          </button>

          {/* Main Views */}
          {mainNav.map((item) => {
            const Icon = item.icon
            const count = getCount(item.id)
            const isActive = activeCategory === item.id

            return (
              <button
                key={item.id}
                onClick={() =>
                  setActiveCategory(
                    item.id as DownloadCategory | 'downloading' | 'completed' | 'paused'
                  )
                }
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition cursor-pointer font-medium text-sm ${
                  isActive
                    ? 'bg-[#381c1c] text-[#e44232] font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#e44232]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#e44232]/20 text-[#e44232]' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Projects / Categories Section */}
        <div className="pt-2 border-t border-[#2e2e2e]">
          <button
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-slate-400 hover:text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            <span>My Categories</span>
            {isProjectsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {isProjectsOpen && (
            <div className="space-y-0.5 mt-1">
              {categories.map((cat) => {
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
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition cursor-pointer text-sm font-medium ${
                      isActive
                        ? 'bg-[#381c1c] text-[#e44232] font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(cat.id)}
                      <span>{cat.label}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer System Info */}
      <div className="pt-3 border-t border-[#2e2e2e] flex items-center justify-between text-xs text-slate-400 px-2 font-medium">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#e44232] animate-pulse" />
          <span>Neobit Engine</span>
        </div>
        <span className="font-mono text-slate-300">v1.0.0</span>
      </div>
    </aside>
  )
}
