import { useState, useEffect, useMemo } from 'react'
import {
  DownloadCategory,
  DownloadItem,
  DownloadPriority,
  EngineSettings,
  SpeedSample,
  StatusFilter
} from '../../engine/types'
import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { TaskTableView } from './components/TaskTableView'
import { BottomDetailInspector } from './components/BottomDetailInspector'
import { BottomStatusBar } from './components/BottomStatusBar'
import { AddDownloadModal } from './components/AddDownloadModal'
import { SettingsModal } from './components/SettingsModal'
import { HashModal } from './components/HashModal'

export function App(): React.JSX.Element {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all')
  const [activeCategory, setActiveCategory] = useState<DownloadCategory>('all')
  const [activeTag, setActiveTag] = useState<string>('all')
  const [activeTrackerFilter, setActiveTrackerFilter] = useState<string>('all')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'name' | 'category' | 'tag'>('name')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [speedHistory, setSpeedHistory] = useState<SpeedSample[]>([])
  const [settings, setSettings] = useState<EngineSettings>({
    maxConcurrentDownloads: 5,
    defaultThreadCount: 8,
    maxGlobalSpeedLimitKbps: 0,
    defaultSavePath: 'C:\\Users\\Downloads',
    autoCategorize: true,
    enableNotifications: true,
    startOnBoot: false,
    theme: 'dark'
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [hashModalDownload, setHashModalDownload] = useState<DownloadItem | null>(null)

  // Fetch initial state & setup event listeners
  useEffect(() => {
    if (window.api) {
      window.api.getAllDownloads().then((data) => {
        const list = data || []
        setDownloads(list)
        if (list.length > 0 && !selectedId) {
          const first = list[0]
          if (first) setSelectedId(first.id)
        }
      })

      window.api.getSettings().then((s) => {
        if (s) setSettings(s)
      })
      window.api.getSpeedHistory().then((h) => setSpeedHistory(h || []))

      const unsubProgress = window.api.onDownloadProgress((updated) => {
        setDownloads((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      })

      const unsubAdded = window.api.onDownloadAdded((newDl) => {
        setDownloads((prev) => [newDl, ...prev.filter((d) => d.id !== newDl.id)])
        setSelectedId(newDl.id)
      })

      const unsubUpdated = window.api.onDownloadUpdated((updated) => {
        setDownloads((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      })

      const unsubCompleted = window.api.onDownloadCompleted((updated) => {
        setDownloads((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      })

      const unsubRemoved = window.api.onDownloadRemoved((id) => {
        setDownloads((prev) => prev.filter((d) => d.id !== id))
      })

      const unsubStats = window.api.onStatsTick((sample) => {
        setSpeedHistory((prev) => [...prev.slice(-59), sample])
      })

      return () => {
        unsubProgress()
        unsubAdded()
        unsubUpdated()
        unsubCompleted()
        unsubRemoved()
        unsubStats()
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate total global speed
  const globalSpeed = useMemo(() => {
    return downloads
      .filter((d) => d.status === 'downloading')
      .reduce((acc, d) => acc + (d.speed || 0), 0)
  }, [downloads])

  // Filter downloads by STATUS, CATEGORIES, TAGS, TRACKERS, and SEARCH
  const filteredDownloads = useMemo(() => {
    return downloads.filter((d) => {
      // Status Filter
      if (activeStatusFilter === 'downloading' && d.status !== 'downloading') return false
      if (activeStatusFilter === 'seeding' && d.status !== 'seeding') return false
      if (activeStatusFilter === 'completed' && d.status !== 'completed') return false
      if (activeStatusFilter === 'running' && d.status !== 'downloading' && d.status !== 'seeding')
        return false
      if (activeStatusFilter === 'stopped' && d.status !== 'paused' && d.status !== 'queued')
        return false
      if (activeStatusFilter === 'active' && d.speed === 0 && (d.upSpeed || 0) === 0) return false
      if (activeStatusFilter === 'inactive' && (d.speed > 0 || (d.upSpeed || 0) > 0)) return false
      if (activeStatusFilter === 'stalled' && d.status !== 'stalled') return false
      if (activeStatusFilter === 'checking' && d.status !== 'checking') return false
      if (activeStatusFilter === 'errored' && d.status !== 'error') return false

      // Category Filter
      if (activeCategory !== 'all' && d.category !== activeCategory) return false

      // Tag Filter
      if (activeTag === 'untagged' && d.tags && d.tags.length > 0) return false
      if (
        activeTag !== 'all' &&
        activeTag !== 'untagged' &&
        (!d.tags || !d.tags.includes(activeTag))
      )
        return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (
          filterBy === 'name' &&
          !d.name.toLowerCase().includes(q) &&
          !d.url.toLowerCase().includes(q)
        )
          return false
        if (filterBy === 'category' && !d.category.toLowerCase().includes(q)) return false
        if (filterBy === 'tag' && (!d.tags || !d.tags.some((t) => t.toLowerCase().includes(q))))
          return false
      }

      return true
    })
  }, [downloads, activeStatusFilter, activeCategory, activeTag, searchQuery, filterBy])

  const selectedDownload = useMemo((): DownloadItem | null => {
    return downloads.find((d) => d.id === selectedId) ?? downloads[0] ?? null
  }, [downloads, selectedId])

  // Handlers
  const handleAddDownload = async (args: {
    url: string
    filename?: string
    savePath?: string
    category?: DownloadCategory
    priority?: DownloadPriority
    threadCount?: number
  }): Promise<void> => {
    if (window.api) {
      await window.api.addDownload(args)
    }
  }

  const handlePause = (id: string): void => {
    window.api?.pauseDownload(id)
  }
  const handleResume = (id: string): void => {
    window.api?.resumeDownload(id)
  }
  const handleCancel = (id: string): void => {
    window.api?.cancelDownload(id)
  }

  const handlePauseAll = (): void => {
    downloads
      .filter((d) => d.status === 'downloading')
      .forEach((d) => window.api?.pauseDownload(d.id))
  }

  const handleResumeAll = (): void => {
    downloads
      .filter((d) => d.status === 'paused' || d.status === 'error')
      .forEach((d) => window.api?.resumeDownload(d.id))
  }

  const handleClearCompleted = (): void => {
    downloads
      .filter((d) => d.status === 'completed')
      .forEach((d) => window.api?.cancelDownload(d.id))
  }

  const handleSaveSettings = async (newSettings: Partial<EngineSettings>): Promise<void> => {
    if (window.api) {
      const updated = await window.api.updateSettings(newSettings)
      setSettings(updated)
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#141414] text-slate-100 font-sans antialiased selection:bg-[#e44232] selection:text-white rounded-none">
      {/* Top Window Bar & File Menu Toolbar */}
      <TopBar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onPauseAll={handlePauseAll}
        onResumeAll={handleResumeAll}
        onClearCompleted={handleClearCompleted}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        globalSpeed={globalSpeed}
      />

      {/* Main Content split into Sidebar and Workspace */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        {/* Left Sidebar Filter Tree */}
        <Sidebar
          activeStatusFilter={activeStatusFilter}
          setActiveStatusFilter={setActiveStatusFilter}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
          activeTrackerFilter={activeTrackerFilter}
          setActiveTrackerFilter={setActiveTrackerFilter}
          downloads={downloads}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Center Task Workspace Split (Table on Top, Detail Inspector on Bottom) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Upper Main Task Data Table */}
          <main className="flex-1 min-h-0 overflow-hidden p-2 bg-[#141414]">
            <TaskTableView
              downloads={filteredDownloads}
              selectedId={selectedDownload?.id || null}
              onSelect={(id) => setSelectedId(id)}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
              onOpenHashModal={(item) => setHashModalDownload(item)}
            />
          </main>

          {/* Lower Detail Inspector Tabbed Pane */}
          <BottomDetailInspector download={selectedDownload} speedHistory={speedHistory} />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <BottomStatusBar downloads={downloads} globalSpeed={globalSpeed} />

      {/* Modals */}
      <AddDownloadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDownload}
        defaultSavePath={settings.defaultSavePath}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <HashModal
        download={hashModalDownload}
        isOpen={hashModalDownload !== null}
        onClose={() => setHashModalDownload(null)}
        onVerify={async (id, expectedHash, algo) => {
          return await window.api.verifyHash({ id, expectedHash, algo })
        }}
      />
    </div>
  )
}

export default App
