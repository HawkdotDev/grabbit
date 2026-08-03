import { useState, useEffect, useMemo } from 'react'
import {
  DownloadCategory,
  DownloadItem,
  DownloadPriority,
  EngineSettings,
  SpeedSample
} from '../../engine/types'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { SpeedChart } from './components/SpeedChart'
import { DownloadCard } from './components/DownloadCard'
import { AddDownloadModal } from './components/AddDownloadModal'
import { SettingsModal } from './components/SettingsModal'
import { HashModal } from './components/HashModal'
import { Download, Inbox } from 'lucide-react'

export function App(): React.JSX.Element {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [activeCategory, setActiveCategory] = useState<
    DownloadCategory | 'downloading' | 'completed' | 'paused'
  >('all')
  const [searchQuery, setSearchQuery] = useState('')
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

  const [showSpeedChart, setShowSpeedChart] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [hashModalDownload, setHashModalDownload] = useState<DownloadItem | null>(null)

  // Fetch initial state & setup event listeners
  useEffect(() => {
    if (window.api) {
      window.api.getAllDownloads().then((data) => setDownloads(data || []))
      window.api.getSettings().then((s) => {
        if (s) setSettings(s)
      })
      window.api.getSpeedHistory().then((h) => setSpeedHistory(h || []))

      const unsubProgress = window.api.onDownloadProgress((updated) => {
        setDownloads((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      })

      const unsubAdded = window.api.onDownloadAdded((newDl) => {
        setDownloads((prev) => [newDl, ...prev.filter((d) => d.id !== newDl.id)])
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
  }, [])

  // Calculate total global speed
  const globalSpeed = useMemo(() => {
    return downloads
      .filter((d) => d.status === 'downloading')
      .reduce((acc, d) => acc + (d.speed || 0), 0)
  }, [downloads])

  // Filter downloads
  const filteredDownloads = useMemo(() => {
    return downloads.filter((d) => {
      // Category filter
      let matchesCat = true
      if (activeCategory === 'downloading') matchesCat = d.status === 'downloading'
      else if (activeCategory === 'completed') matchesCat = d.status === 'completed'
      else if (activeCategory === 'paused') matchesCat = d.status === 'paused'
      else if (activeCategory !== 'all') matchesCat = d.category === activeCategory

      // Search query filter
      let matchesSearch = true
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        matchesSearch = d.name.toLowerCase().includes(q) || d.url.toLowerCase().includes(q)
      }

      return matchesCat && matchesSearch
    })
  }, [downloads, activeCategory, searchQuery])

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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        downloads={downloads}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        globalSpeed={globalSpeed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-950">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onPauseAll={handlePauseAll}
          onResumeAll={handleResumeAll}
          onClearCompleted={handleClearCompleted}
          showSpeedChart={showSpeedChart}
          setShowSpeedChart={setShowSpeedChart}
        />

        {/* Scrollable Downloads View */}
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Live Speed Graph */}
          {showSpeedChart && <SpeedChart history={speedHistory} />}

          {/* Download List */}
          {filteredDownloads.length > 0 ? (
            <div className="space-y-3.5">
              {filteredDownloads.map((download) => (
                <DownloadCard
                  key={download.id}
                  download={download}
                  onPause={handlePause}
                  onResume={handleResume}
                  onCancel={handleCancel}
                  onOpenHashModal={(item) => setHashModalDownload(item)}
                />
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-slate-900/40 rounded-2xl border border-slate-800/80 border-dashed">
              <div className="p-4 bg-slate-900 rounded-full border border-slate-800 text-slate-500 mb-3">
                <Inbox className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">No downloads found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Click the button below or paste a URL to start an accelerated multi-threaded
                download.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-900/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Add First Download
              </button>
            </div>
          )}
        </main>
      </div>

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
