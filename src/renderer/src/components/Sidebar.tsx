import React, { useMemo } from 'react'
import { DownloadCategory, DownloadItem, StatusFilter } from '../../../engine/types'
import {
  Inbox,
  Folder,
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image as ImageIcon,
  Code2,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Play,
  Activity,
  Search,
  Sliders
} from 'lucide-react'
import { SidebarSection } from './sidebar/SidebarSection'
import { SidebarFilterItem } from './sidebar/SidebarFilterItem'

interface SidebarProps {
  width?: number
  activeStatusFilter: StatusFilter
  setActiveStatusFilter: (status: StatusFilter) => void
  activeCategory: DownloadCategory
  setActiveCategory: (cat: DownloadCategory) => void
  activeTag: string
  setActiveTag: (tag: string) => void
  downloads: DownloadItem[]
  onOpenSettingsModal?: () => void
  onToggleAnalytics?: () => void
}

export const Sidebar: React.FC<SidebarProps> = React.memo(
  ({
    width = 240,
    activeStatusFilter,
    setActiveStatusFilter,
    activeCategory,
    setActiveCategory,
    activeTag,
    setActiveTag,
    downloads,
    onOpenSettingsModal,
    onToggleAnalytics
  }) => {
    // Memoize status counts map
    const statusCounts = useMemo(() => {
      const counts: Record<StatusFilter, number> = {
        all: downloads.length,
        downloading: 0,
        seeding: 0,
        completed: 0,
        running: 0,
        stopped: 0,
        active: 0,
        inactive: 0,
        stalled: 0,
        checking: 0,
        errored: 0
      }

      downloads.forEach((d) => {
        if (d.status === 'downloading') counts.downloading = (counts.downloading || 0) + 1
        if (d.status === 'seeding') counts.seeding = (counts.seeding || 0) + 1
        if (d.status === 'completed') counts.completed = (counts.completed || 0) + 1
        if (d.status === 'downloading' || d.status === 'seeding')
          counts.running = (counts.running || 0) + 1
        if (d.status === 'paused' || d.status === 'queued')
          counts.stopped = (counts.stopped || 0) + 1
        if (d.speed > 0 || (d.upSpeed || 0) > 0) counts.active = (counts.active || 0) + 1
        if (d.speed === 0 && (d.upSpeed || 0) === 0) counts.inactive = (counts.inactive || 0) + 1
        if (d.status === 'stalled') counts.stalled = (counts.stalled || 0) + 1
        if (d.status === 'checking') counts.checking = (counts.checking || 0) + 1
        if (d.status === 'error') counts.errored = (counts.errored || 0) + 1
      })

      return counts
    }, [downloads])

    // Memoize category counts map
    const categoryCounts = useMemo(() => {
      const counts: Record<DownloadCategory, number> = {
        all: downloads.length,
        other: 0,
        documents: 0,
        compressed: 0,
        video: 0,
        audio: 0,
        executables: 0,
        images: 0,
        code: 0
      }

      downloads.forEach((d) => {
        const cat = d.category in counts ? d.category : 'other'
        counts[cat] = (counts[cat] || 0) + 1
      })

      return counts
    }, [downloads])

    const statusItems: Array<{ id: StatusFilter; label: string; icon: React.JSX.Element }> =
      useMemo(
        () => [
          { id: 'all', label: 'All', icon: <Inbox className="h-3.5 w-3.5 text-slate-400" /> },
          {
            id: 'downloading',
            label: 'Downloading',
            icon: <Activity className="h-3.5 w-3.5 text-theme-accent" />
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
          {
            id: 'stopped',
            label: 'Stopped',
            icon: <Pause className="h-3.5 w-3.5 text-amber-400" />
          },
          {
            id: 'active',
            label: 'Active',
            icon: <Activity className="h-3.5 w-3.5 text-emerald-400" />
          },
          {
            id: 'inactive',
            label: 'Inactive',
            icon: <Pause className="h-3.5 w-3.5 text-slate-500" />
          },
          {
            id: 'stalled',
            label: 'Stalled',
            icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          },
          {
            id: 'checking',
            label: 'Checking',
            icon: <Search className="h-3.5 w-3.5 text-indigo-400" />
          },
          {
            id: 'errored',
            label: 'Errored',
            icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          }
        ],
        []
      )

    const categories: Array<{ id: DownloadCategory; label: string; icon: React.JSX.Element }> =
      useMemo(
        () => [
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
          {
            id: 'images',
            label: 'Images',
            icon: <ImageIcon className="h-3.5 w-3.5 text-yellow-400" />
          },
          { id: 'code', label: 'Code', icon: <Code2 className="h-3.5 w-3.5 text-indigo-400" /> }
        ],
        []
      )

    return (
      <aside
        style={{ width }}
        className="bg-ide-surface flex flex-col justify-between h-full select-none font-sans text-xs p-2 overflow-y-auto shrink-0 rounded-none"
      >
        <div className="space-y-3">
          {/* Top Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettingsModal}
              className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 active:scale-[0.98] text-slate-200 border border-white/5 rounded-none font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Open Preferences & Engine Settings"
            >
              <Sliders className="h-3.5 w-3.5 text-theme-accent" />
              <span>Settings</span>
            </button>

            <button
              onClick={onToggleAnalytics}
              className="flex-1 py-1.5 px-2 bg-theme-tint hover:bg-[#064e37] active:scale-[0.98] text-theme-accent border border-theme-accent/30 rounded-none font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Toggle Bandwidth & Engine Diagnostics"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Analytics</span>
            </button>
          </div>

          {/* STATUS FILTER SECTION */}
          <SidebarSection title="STATUS">
            {statusItems.map((st) => (
              <SidebarFilterItem
                key={st.id}
                id={st.id}
                label={st.label}
                icon={st.icon}
                count={statusCounts[st.id] || 0}
                isActive={activeStatusFilter === st.id}
                onClick={() => setActiveStatusFilter(st.id)}
              />
            ))}
          </SidebarSection>

          {/* CATEGORIES SECTION */}
          <SidebarSection title="CATEGORIES">
            {categories.map((cat) => (
              <SidebarFilterItem
                key={cat.id}
                id={cat.id}
                label={cat.label}
                icon={cat.icon}
                count={categoryCounts[cat.id] || 0}
                isActive={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </SidebarSection>

          {/* TAGS SECTION */}
          <SidebarSection title="TAGS">
            {[
              { id: 'all', label: 'All' },
              { id: 'untagged', label: 'Untagged' },
              { id: 'neobit', label: 'neobit' }
            ].map((tg) => (
              <SidebarFilterItem
                key={tg.id}
                id={tg.id}
                label={tg.label}
                icon={<Tag className="h-3.5 w-3.5 text-cyan-400" />}
                count={downloads.length}
                isActive={activeTag === tg.id}
                onClick={() => setActiveTag(tg.id)}
              />
            ))}
          </SidebarSection>
        </div>
      </aside>
    )
  }
)

Sidebar.displayName = 'Sidebar'
