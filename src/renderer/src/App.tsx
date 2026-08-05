import React, { useState, useEffect } from 'react'
import { EngineSettings, DownloadItem } from '../../engine/types'
import { useDownloads } from './hooks/useDownloads'
import { useFilteredDownloads } from './hooks/useFilteredDownloads'
import { useResizablePanes } from './hooks/useResizablePanes'
import { useClipboardDetector } from './hooks/useClipboardDetector'

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
  NetworkView,
  ClipboardBanner
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
    handleClearCompleted,
    handleVerifyHash
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
    useResizablePanes(230, 240)

  // 4. Navigation & Modals State
  const [activeMainView, setActiveMainView] = useState<'home' | 'analytics' | 'network'>('home')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [hashModalDownload, setHashModalDownload] = useState<DownloadItem | null>(null)

  // 5. Clipboard Detector Hook
  const { detectedLink, dismiss, clear } = useClipboardDetector()

  // 6. Settings State
  const [settings, setSettings] = useState<EngineSettings>({
    defaultSavePath: 'C:\\Downloads\\Grabbit',
    maxConcurrentDownloads: 5,
    defaultThreadCount: 8,
    maxGlobalSpeedLimitKbps: 0,
    autoCategorize: true,
    enableNotifications: true,
    theme: 'dark',
    startOnBoot: false
  })

  useEffect(() => {
    if (window.api && window.api.getSettings) {
      window.api.getSettings().then((s) => {
        if (s) setSettings(s)
      })
    }
  }, [])

  const handleSaveSettings = async (newSettings: Partial<EngineSettings>): Promise<void> => {
    if (window.api && window.api.updateSettings) {
      const updated = await window.api.updateSettings(newSettings)
      if (updated) setSettings(updated)
    }
    setIsSettingsModalOpen(false)
  }

  const handleAddFromClipboard = (url: string): void => {
    handleAddDownload({ url })
    clear()
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-ide-bg text-slate-100 font-sans select-none border border-ide-border rounded-none">
      {/* Top Application Header & Navigation Toolbar */}
      <TopBar
        activeView={activeMainView}
        setActiveView={setActiveMainView}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onResumeAll={handleResumeAll}
        onPauseAll={handlePauseAll}
        onClearCompleted={handleClearCompleted}
      />

      {/* Clipboard Link Auto-Detector Banner */}
      <ClipboardBanner
        detectedLink={detectedLink}
        onAdd={handleAddFromClipboard}
        onDismiss={dismiss}
      />

      {/* Main Workspace Body */}
      {activeMainView === 'home' ? (
        <AnalyticsView
          downloads={downloads}
          speedHistory={speedHistory}
          globalSpeed={globalSpeed}
          onOpenAddModal={() => setIsAddModalOpen(true)}
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
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterBy={filterBy}
                setFilterBy={setFilterBy}
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

      {/* Persistent Bottom Telemetry Status Bar */}
      <BottomStatusBar downloads={downloads} globalSpeed={globalSpeed} />

      {/* Floating Action Modals */}
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
        isOpen={!!hashModalDownload}
        onClose={() => setHashModalDownload(null)}
        download={hashModalDownload}
        onVerify={(id, expectedHash, algo) => handleVerifyHash(id, expectedHash, algo)}
      />
    </div>
  )
}

export default App
