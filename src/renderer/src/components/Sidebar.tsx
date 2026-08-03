import React, { useState } from 'react'
import { DownloadCategory, DownloadItem, StatusFilter } from '../../../engine/types'
import {
  Plus,
  Inbox,
  Folder,
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image as ImageIcon,
  Code2,
  ChevronDown,
  ChevronRight,
  Globe,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Play,
  Activity,
  Search
} from 'lucide-react'

interface SidebarProps {
  width?: number
  activeStatusFilter: StatusFilter
  setActiveStatusFilter: (status: StatusFilter) => void
  activeCategory: DownloadCategory
  setActiveCategory: (cat: DownloadCategory) => void
  activeTag: string
  setActiveTag: (tag: string) => void
  activeTrackerFilter: string
  setActiveTrackerFilter: (tracker: string) => void
  downloads: DownloadItem[]
  onOpenAddModal: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  width = 240,
  activeStatusFilter,
  setActiveStatusFilter,
  activeCategory,
  setActiveCategory,
  activeTag,
  setActiveTag,
  activeTrackerFilter,
  setActiveTrackerFilter,
  downloads,
  onOpenAddModal
}) => {
  const [isStatusOpen, setIsStatusOpen] = useState(true)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true)
  const [isTagsOpen, setIsTagsOpen] = useState(true)
  const [isTrackersOpen, setIsTrackersOpen] = useState(true)

  // Status Filter Counts
  const getStatusCount = (status: StatusFilter): number => {
    if (status === 'all') return downloads.length
    if (status === 'downloading') return downloads.filter((d) => d.status === 'downloading').length
    if (status === 'seeding') return downloads.filter((d) => d.status === 'seeding').length
    if (status === 'completed') return downloads.filter((d) => d.status === 'completed').length
    if (status === 'running')
      return downloads.filter((d) => d.status === 'downloading' || d.status === 'seeding').length
    if (status === 'stopped')
      return downloads.filter((d) => d.status === 'paused' || d.status === 'queued').length
    if (status === 'active')
      return downloads.filter((d) => d.speed > 0 || (d.upSpeed || 0) > 0).length
    if (status === 'inactive')
      return downloads.filter((d) => d.speed === 0 && (d.upSpeed || 0) === 0).length
    if (status === 'stalled') return downloads.filter((d) => d.status === 'stalled').length
    if (status === 'checking') return downloads.filter((d) => d.status === 'checking').length
    if (status === 'errored') return downloads.filter((d) => d.status === 'error').length
    return 0
  }

  // Category Counts
  const getCategoryCount = (cat: string): number => {
    if (cat === 'all') return downloads.length
    if (cat === 'other') return downloads.filter((d) => d.category === 'other').length
    return downloads.filter((d) => d.category === cat).length
  }

  const statusItems: Array<{ id: StatusFilter; label: string; icon: React.JSX.Element }> = [
    { id: 'all', label: 'All', icon: <Inbox className="h-3.5 w-3.5 text-slate-400" /> },
    {
      id: 'downloading',
      label: 'Downloading',
      icon: <Activity className="h-3.5 w-3.5 text-[#e44232]" />
    },
    {
      id: 'seeding',
      label: 'Seeding',
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
    },
    { id: 'running', label: 'Running', icon: <Play className="h-3.5 w-3.5 text-cyan-400" /> },
    { id: 'stopped', label: 'Stopped', icon: <Pause className="h-3.5 w-3.5 text-amber-400" /> },
    { id: 'active', label: 'Active', icon: <Activity className="h-3.5 w-3.5 text-emerald-400" /> },
    { id: 'inactive', label: 'Inactive', icon: <Pause className="h-3.5 w-3.5 text-slate-500" /> },
    {
      id: 'stalled',
      label: 'Stalled',
      icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
    },
    { id: 'checking', label: 'Checking', icon: <Search className="h-3.5 w-3.5 text-indigo-400" /> },
    {
      id: 'errored',
      label: 'Errored',
      icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
    }
  ]

  const categories: Array<{ id: DownloadCategory; label: string; icon: React.JSX.Element }> = [
    { id: 'all', label: 'All', icon: <Folder className="h-3.5 w-3.5 text-slate-400" /> },
    {
      id: 'other',
      label: 'Uncategorized',
      icon: <Folder className="h-3.5 w-3.5 text-slate-500" />
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="h-3.5 w-3.5 text-amber-500" />
    },
    {
      id: 'compressed',
      label: 'Archives',
      icon: <Archive className="h-3.5 w-3.5 text-purple-400" />
    },
    { id: 'video', label: 'Videos', icon: <Film className="h-3.5 w-3.5 text-emerald-400" /> },
    { id: 'audio', label: 'Audio', icon: <Music className="h-3.5 w-3.5 text-cyan-400" /> },
    {
      id: 'executables',
      label: 'Executables',
      icon: <Cpu className="h-3.5 w-3.5 text-teal-400" />
    },
    { id: 'images', label: 'Images', icon: <ImageIcon className="h-3.5 w-3.5 text-yellow-400" /> },
    { id: 'code', label: 'Code', icon: <Code2 className="h-3.5 w-3.5 text-indigo-400" /> }
  ]

  return (
    <aside
      style={{ width }}
      className="bg-[#1e1e1e] border-r border-[#2e2e2e] flex flex-col justify-between h-full select-none font-sans text-xs p-2 overflow-y-auto shrink-0 rounded-none"
    >
      <div className="space-y-3">
        {/* + Add Task Button matching Todoist coral red style */}
        <button
          onClick={onOpenAddModal}
          className="w-full py-2 px-3 bg-[#e44232] hover:bg-[#ff4d3d] active:scale-[0.98] text-white rounded-none font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#e44232]/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add task</span>
        </button>

        {/* STATUS FILTER SECTION */}
        <div className="border-t border-[#2e2e2e] pt-2">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="w-full flex items-center justify-between px-2 py-1 text-slate-400 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer"
          >
            <span>STATUS</span>
            {isStatusOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          {isStatusOpen && (
            <div className="space-y-0.5 mt-1">
              {statusItems.map((st) => {
                const count = getStatusCount(st.id)
                const isActive = activeStatusFilter === st.id
                return (
                  <button
                    key={st.id}
                    onClick={() => setActiveStatusFilter(st.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 transition cursor-pointer text-xs font-medium rounded-none ${
                      isActive
                        ? 'bg-[#381c1c] text-[#e44232] font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {st.icon}
                      <span>{st.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">({count})</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* CATEGORIES SECTION */}
        <div className="border-t border-[#2e2e2e] pt-2">
          <button
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            className="w-full flex items-center justify-between px-2 py-1 text-slate-400 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer"
          >
            <span>CATEGORIES</span>
            {isCategoriesOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          {isCategoriesOpen && (
            <div className="space-y-0.5 mt-1">
              {categories.map((cat) => {
                const count = getCategoryCount(cat.id)
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 transition cursor-pointer text-xs font-medium rounded-none ${
                      isActive
                        ? 'bg-[#381c1c] text-[#e44232] font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">({count})</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* TAGS SECTION */}
        <div className="border-t border-[#2e2e2e] pt-2">
          <button
            onClick={() => setIsTagsOpen(!isTagsOpen)}
            className="w-full flex items-center justify-between px-2 py-1 text-slate-400 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer"
          >
            <span>TAGS</span>
            {isTagsOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          {isTagsOpen && (
            <div className="space-y-0.5 mt-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'untagged', label: 'Untagged' },
                { id: 'neobit', label: 'neobit' }
              ].map((tg) => {
                const isActive = activeTag === tg.id
                return (
                  <button
                    key={tg.id}
                    onClick={() => setActiveTag(tg.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 transition cursor-pointer text-xs font-medium rounded-none ${
                      isActive
                        ? 'bg-[#381c1c] text-[#e44232] font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{tg.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      ({downloads.length})
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* TRACKERS SECTION */}
        <div className="border-t border-[#2e2e2e] pt-2">
          <button
            onClick={() => setIsTrackersOpen(!isTrackersOpen)}
            className="w-full flex items-center justify-between px-2 py-1 text-slate-400 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer"
          >
            <span>TRACKERS</span>
            {isTrackersOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          {isTrackersOpen && (
            <div className="space-y-0.5 mt-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'trackerless', label: 'Trackerless' },
                { id: 'working', label: 'Working Trackers' }
              ].map((tr) => {
                const isActive = activeTrackerFilter === tr.id
                return (
                  <button
                    key={tr.id}
                    onClick={() => setActiveTrackerFilter(tr.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 transition cursor-pointer text-xs font-medium rounded-none ${
                      isActive
                        ? 'bg-[#381c1c] text-[#e44232] font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-[#e44232]" />
                      <span>{tr.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      ({downloads.length})
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
