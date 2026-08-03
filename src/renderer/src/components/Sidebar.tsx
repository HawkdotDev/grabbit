import React from 'react'
import { DownloadCategory, DownloadItem } from '../../../engine/types'
import {
  Folder,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image as ImageIcon,
  Code2,
  Home,
  Layers,
  CheckCircle2,
  PauseCircle,
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
  const [isToolsOpen, setIsToolsOpen] = React.useState(true)
  const [isExplorerOpen, setIsExplorerOpen] = React.useState(true)

  const getCount = (cat: string): number => {
    if (cat === 'all') return downloads.length
    if (cat === 'downloading') return downloads.filter((d) => d.status === 'downloading').length
    if (cat === 'completed') return downloads.filter((d) => d.status === 'completed').length
    if (cat === 'paused') return downloads.filter((d) => d.status === 'paused').length
    return downloads.filter((d) => d.category === cat).length
  }

  const getExtensionIcon = (id: string): React.JSX.Element => {
    switch (id) {
      case 'all':
        return <Layers className="h-4 w-4 text-lime-accent" />
      case 'downloading':
        return <Download className="h-4 w-4 text-cyan-400" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-amber-400" />
      case 'documents':
        return <FileText className="h-4 w-4 text-amber-500" />
      case 'compressed':
        return <Archive className="h-4 w-4 text-purple-400" />
      case 'video':
        return <Film className="h-4 w-4 text-lime-accent" />
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

  const categories = [
    { id: 'all', label: 'product.json' },
    { id: 'downloading', label: 'script.py' },
    { id: 'completed', label: 'main.html' },
    { id: 'paused', label: 'mailer.php' },
    { id: 'documents', label: 'index.html' },
    { id: 'compressed', label: 'archive.zip' },
    { id: 'video', label: 'video.mkv' },
    { id: 'audio', label: 'audio.mp3' },
    { id: 'executables', label: 'ngrok.exe' },
    { id: 'images', label: 'banner.png' },
    { id: 'code', label: 'index.css' }
  ]

  return (
    <aside className="w-64 bg-ide-surface border-r border-ide-border flex flex-col justify-between h-full select-none font-mono text-xs">
      <div>
        {/* Top Dropdown Pill */}
        <div className="p-3 border-b border-[#23252b]">
          <button className="w-full bg-[#202228] hover:bg-[#282b33] text-slate-200 px-3 py-2 rounded-xl border border-ide-border flex items-center justify-between transition cursor-pointer">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-lime-accent" />
              <span className="font-bold text-xs">Neobit Workspace</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        {/* Create Task & Search Button */}
        <div className="p-3 flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="flex-1 bg-[#202228] hover:bg-[#282b33] text-slate-200 py-2 px-3 rounded-xl border border-ide-border flex items-center justify-center gap-2 transition cursor-pointer font-sans font-semibold text-xs"
          >
            <Plus className="h-4 w-4 text-lime-accent" />
            <span>Create new task</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="p-2 bg-[#202228] hover:bg-[#282b33] text-slate-400 hover:text-white rounded-xl border border-ide-border transition cursor-pointer"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Explorer Header */}
        <div className="px-4 py-1.5 flex items-center justify-between text-slate-400 font-sans font-bold text-xs uppercase tracking-wider">
          <span>Explorer</span>
          <button
            onClick={() => setIsExplorerOpen(!isExplorerOpen)}
            className="text-slate-500 hover:text-slate-300"
          >
            {isExplorerOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* File Tree Navigation */}
        {isExplorerOpen && (
          <nav className="px-2 py-1 space-y-0.5 overflow-y-auto max-h-[calc(100vh-280px)]">
            {/* Tools Folder */}
            <div>
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className="w-full flex items-center gap-2 px-2 py-1 text-slate-300 hover:bg-[#202228] rounded-md transition cursor-pointer"
              >
                {isToolsOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                )}
                <Folder className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                <span className="font-semibold text-slate-200">categories</span>
              </button>

              {isToolsOpen && (
                <div className="pl-6 space-y-0.5 mt-0.5">
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
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                          isActive
                            ? 'bg-[#252830] text-lime-accent font-bold border border-lime-accent/30'
                            : 'text-slate-300 hover:bg-[#202228] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {getExtensionIcon(cat.id)}
                          <span className="truncate">{cat.id}</span>
                        </div>
                        {count > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ide-border text-lime-accent">
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </aside>
  )
}
