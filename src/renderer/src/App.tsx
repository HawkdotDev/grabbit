import { useState, useEffect } from 'react'
import { EngineSettings, DownloadItem } from '../../engine/types'
import { useDownloads } from './hooks/useDownloads'
import { useFilteredDownloads } from './hooks/useFilteredDownloads'
import { useResizablePanes } from './hooks/useResizablePanes'

import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { TaskTableView } from './components/TaskTableView'
import { BottomDetailInspector } from './components/BottomDetailInspector'
import { BottomStatusBar } from './components/BottomStatusBar'
import { AddDownloadModal } from './components/AddDownloadModal'
import { SettingsModal } from './components/SettingsModal'
import { HashModal } from './components/HashModal'

export function App(): React.JSX.Element {
  // 1. Download State & Handlers Hook
  const {
    downloads,
    setSelectedId,
    selectedDownload,
    speedHistory,
    globalSpeed,
    handleAddDownload,
    handlePause,
    handleResume,
    handleCancel,
    handlePauseAll,
    handleResumeAll,
    handleClearCompleted
  } = useDownloads()

  // 2. Filter State Hook
  const {
    activeStatusFilter,
    setActiveStatusFilter,
    activeCategory,
    setActiveCategory,
    activeTag,
    setActiveTag,
    activeTrackerFilter,
    setActiveTrackerFilter,
    searchQuery,
    setSearchQuery,
    filterBy,
    setFilterBy,
    filteredDownloads
  } = useFilteredDownloads(downloads)

  // 3. Resizable Panes Hook
  const { sidebarWidth, inspectorHeight, handleSidebarMouseDown, handleInspectorMouseDown } =
    useResizablePanes(240, 240)

  // Engine Settings & Modal State
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

  useEffect(() => {
    if (window.api) {
      window.api.getSettings().then((s) => {
        if (s) setSettings(s)
      })
    }
  }, [])

  const handleSaveSettings = async (newSettings: Partial<EngineSettings>): Promise<void> => {
    if (window.api) {
      const updated = await window.api.updateSettings(newSettings)
      setSettings(updated)
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#141414] text-slate-100 font-sans antialiased selection:bg-[#009669] selection:text-white rounded-none">
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

      {/* Main Content split into Sidebar and Workspace with Resizable Splitters */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        {/* Left Resizable Sidebar Filter Tree */}
        <Sidebar
          width={sidebarWidth}
          activeStatusFilter={activeStatusFilter}
          setActiveStatusFilter={setActiveStatusFilter}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
          activeTrackerFilter={activeTrackerFilter}
          setActiveTrackerFilter={setActiveTrackerFilter}
          downloads={downloads}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onToggleAnalytics={() => setIsSettingsModalOpen(true)}
        />

        {/* Vertical Resize Handle between Sidebar and Workspace */}
        <div
          onMouseDown={handleSidebarMouseDown}
          className="w-[2px] cursor-col-resize hover:bg-[#009669] active:bg-[#059669] bg-[#2e2e2e] transition shrink-0 z-30"
          title="Drag to resize sidebar"
        />

        {/* Center Task Workspace Split (Table on Top, Detail Inspector on Bottom) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Upper Main Task Data Table */}
          <main className="flex-1 min-h-0 overflow-hidden p-0 bg-[#141414]">
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

          {/* Horizontal Resize Handle between Task Table and Bottom Detail Inspector */}
          <div
            onMouseDown={handleInspectorMouseDown}
            className="h-[2px] cursor-row-resize hover:bg-[#009669] active:bg-[#059669] bg-[#2e2e2e] transition shrink-0 z-30"
            title="Drag to resize inspector pane"
          />

          {/* Lower Resizable Detail Inspector Tabbed Pane */}
          <BottomDetailInspector
            height={inspectorHeight}
            download={selectedDownload}
            speedHistory={speedHistory}
          />
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
