import { useState, useEffect } from 'react'
import { EngineSettings, DownloadItem } from '../../engine/types'
import { useDownloads } from './hooks/useDownloads'
import { useFilteredDownloads } from './hooks/useFilteredDownloads'
import { useResizablePanes } from './hooks/useResizablePanes'

import {
  TopBar,
  Sidebar,
  TaskTableView,
  BottomDetailInspector,
  BottomStatusBar,
  AddDownloadModal,
  SettingsModal,
  HashModal,
  AnalyticsView,
  NetworkView
} from './components'

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

  const [activeMainView, setActiveMainView] = useState<'home' | 'analytics' | 'network'>('home')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addModalInitialMode, setAddModalInitialMode] = useState<'link' | 'file'>('link')
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [hashModalDownload, setHashModalDownload] = useState<DownloadItem | null>(null)

  const handleOpenAddModal = (mode: 'link' | 'file' = 'link'): void => {
    setAddModalInitialMode(mode)
    setIsAddModalOpen(true)
  }

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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-ide-bg text-slate-100 font-sans antialiased selection:bg-theme-accent selection:text-white rounded-none">
      {/* Top Window Bar & File Menu Toolbar */}
      <TopBar
        onOpenAddModal={handleOpenAddModal}
        onPauseAll={handlePauseAll}
        onResumeAll={handleResumeAll}
        onClearCompleted={handleClearCompleted}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        activeView={activeMainView}
        setActiveView={setActiveMainView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        globalSpeed={globalSpeed}
      />

      {/* Main View Area: Home vs Network vs Analytics (Tasks Workspace) */}
      {activeMainView === 'home' ? (
        <AnalyticsView
          downloads={downloads}
          speedHistory={speedHistory}
          globalSpeed={globalSpeed}
          onOpenAddModal={handleOpenAddModal}
          onNavigateToTasks={() => setActiveMainView('analytics')}
          onSelectDownload={(id) => setSelectedId(id)}
          onPause={handlePause}
          onResume={handleResume}
          onCancel={handleCancel}
        />
      ) : activeMainView === 'network' ? (
        <NetworkView downloads={downloads} speedHistory={speedHistory} globalSpeed={globalSpeed} />
      ) : (
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
            downloads={downloads}
            onResumeAll={handleResumeAll}
            onPauseAll={handlePauseAll}
          />

          {/* Vertical Resize Handle between Sidebar and Workspace */}
          <div
            onMouseDown={handleSidebarMouseDown}
            className="w-0.5 cursor-col-resize hover:bg-theme-accent active:bg-theme-bright bg-ide-border transition shrink-0 z-30"
            title="Drag to resize sidebar"
          />

          {/* Center Task Workspace Split (Table on Top, Detail Inspector on Bottom) */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Upper Main Task Data Table */}
            <main className="flex-1 min-h-0 overflow-hidden p-0 bg-ide-bg">
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
              className="h-0.5 cursor-row-resize hover:bg-theme-accent active:bg-theme-bright bg-ide-border transition shrink-0 z-30"
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
      )}

      {/* Bottom Status Bar */}
      <BottomStatusBar downloads={downloads} globalSpeed={globalSpeed} />

      {/* Modals */}
      <AddDownloadModal
        key={`${isAddModalOpen}-${addModalInitialMode}`}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDownload}
        defaultSavePath={settings.defaultSavePath}
        initialMode={addModalInitialMode}
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
