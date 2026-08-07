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
  SimpleAddDownloadModal,
  SettingsModal,
  HashModal,
  CreateTorrentModal,
  HotkeysModal,
  AboutModal,
  PluginsModal,
  AutomationsModal,
  ScriptConsoleModal,
  ThemeCustomizerModal,
  AnalyticsView,
  NetworkView,
  ClipboardBanner
} from './components'
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts'
import { CustomThemeColors, PRESET_THEMES } from './components/modals/ThemeCustomizerModal'

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
    handleVerifyHash,
    handleUpdateDownload
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
  const [addModalMode, setAddModalMode] = useState<'link' | 'file'>('link')
  const [addModalInitialUrl, setAddModalInitialUrl] = useState('')
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [hashModalDownload, setHashModalDownload] = useState<DownloadItem | null>(null)

  // Extra Features Modals
  const [isCreateTorrentOpen, setIsCreateTorrentOpen] = useState(false)
  const [isHotkeysOpen, setIsHotkeysOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isPluginsOpen, setIsPluginsOpen] = useState(false)
  const [isAutomationsOpen, setIsAutomationsOpen] = useState(false)
  const [isScriptConsoleOpen, setIsScriptConsoleOpen] = useState(false)
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false)
  const [customColors, setCustomColors] = useState<CustomThemeColors>(
    PRESET_THEMES['carrot']!.colors
  )

  const handleOpenAddModal = (mode: 'link' | 'file' = 'link', initialUrl = ''): void => {
    setAddModalMode(mode)
    setAddModalInitialUrl(initialUrl)
    setIsAddModalOpen(true)
  }

  // Bind Global Application Keyboard Shortcuts
  useGlobalShortcuts({
    onNewDownload: () => handleOpenAddModal('link'),
    onOpenTorrent: () => handleOpenAddModal('file'),
    onCreateTorrent: () => setIsCreateTorrentOpen(true),
    onSaveSession: () => window.api?.exportQueue(),
    onImportTaskList: () => window.api?.importQueue(),
    onExportLogs: () => window.api?.exportLogs(),
    onOpenSettings: () => setIsSettingsModalOpen(true),
    onOpenHotkeys: () => setIsHotkeysOpen(true),
    onOpenDoc: () => window.open('https://github.com/HawkdotDev/grabbit#readme', '_blank'),
    onToggleFullscreen: () => window.api?.toggleFullscreen(),
    onSwitchView: (v) => setActiveMainView(v),
    onDeleteSelected: () => {
      if (selectedDownload) handleCancel(selectedDownload.id)
    },
    onTogglePauseSelected: () => {
      if (selectedDownload) {
        if (selectedDownload.status === 'downloading') {
          handlePause(selectedDownload.id)
        } else {
          handleResume(selectedDownload.id)
        }
      }
    }
  })

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

  useEffect(() => {
    const currentTheme = settings.theme || 'dark'
    document.documentElement.setAttribute('data-theme', currentTheme)

    if (currentTheme === 'custom' && customColors) {
      document.documentElement.style.setProperty('--color-ide-bg', customColors.bg)
      document.documentElement.style.setProperty('--color-ide-surface', customColors.surface)
      document.documentElement.style.setProperty('--color-ide-card', customColors.card)
      document.documentElement.style.setProperty('--color-ide-border', customColors.border)
      document.documentElement.style.setProperty('--color-theme-accent', customColors.accent)
      document.documentElement.style.setProperty('--color-theme-bright', customColors.bright)
      document.documentElement.style.setProperty('--color-theme-tint', customColors.tint)
    } else {
      document.documentElement.style.removeProperty('--color-ide-bg')
      document.documentElement.style.removeProperty('--color-ide-surface')
      document.documentElement.style.removeProperty('--color-ide-card')
      document.documentElement.style.removeProperty('--color-ide-border')
      document.documentElement.style.removeProperty('--color-theme-accent')
      document.documentElement.style.removeProperty('--color-theme-bright')
      document.documentElement.style.removeProperty('--color-theme-tint')
    }
  }, [settings.theme, customColors])

  const handleSaveSettings = async (newSettings: Partial<EngineSettings>): Promise<void> => {
    if (window.api && window.api.updateSettings) {
      const updated = await window.api.updateSettings(newSettings)
      if (updated) setSettings(updated)
    }
    setIsSettingsModalOpen(false)
  }

  const handleAddFromClipboard = (url: string): void => {
    handleOpenAddModal('link', url)
    clear()
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-ide-bg text-slate-100 font-sans select-none border border-ide-border rounded-none">
      {/* Top Application Header & Navigation Toolbar */}
      <TopBar
        activeView={activeMainView}
        setActiveView={setActiveMainView}
        onOpenAddModal={handleOpenAddModal}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenCreateTorrent={() => setIsCreateTorrentOpen(true)}
        onOpenHotkeys={() => setIsHotkeysOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenPlugins={() => setIsPluginsOpen(true)}
        onOpenAutomations={() => setIsAutomationsOpen(true)}
        onOpenScriptConsole={() => setIsScriptConsoleOpen(true)}
        onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
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
          onOpenAddModal={handleOpenAddModal}
          onSelectDownload={(id) => setSelectedId(id)}
          onPause={handlePause}
          onResume={handleResume}
          onCancel={handleCancel}
        />
      ) : activeMainView === 'network' ? (
        <NetworkView downloads={downloads} speedHistory={speedHistory} globalSpeed={globalSpeed} />
      ) : (
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Left Navigation Sidebar */}
          <Sidebar
            downloads={downloads}
            activeStatusFilter={activeStatusFilter}
            setActiveStatusFilter={setActiveStatusFilter}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            activeTag={activeTag}
            setActiveTag={setActiveTag}
            width={sidebarWidth}
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
                onUpdateDownload={handleUpdateDownload}
                onOpenAddModal={handleOpenAddModal}
              />
            </main>

            {/* Horizontal Resize Handle between Task Table and Bottom Detail Inspector */}
            <div
              onMouseDown={handleInspectorMouseDown}
              className="h-0.5 cursor-row-resize hover:bg-theme-accent active:bg-theme-bright bg-ide-border transition shrink-0 z-30"
              title="Drag to resize inspector panel"
            />

            {/* Lower Detail Inspector Panel */}
            <BottomDetailInspector
              download={selectedDownload}
              height={inspectorHeight}
              speedHistory={speedHistory}
            />
          </div>
        </div>
      )}

      {/* Persistent Bottom Telemetry Status Bar */}
      <BottomStatusBar downloads={downloads} globalSpeed={globalSpeed} />

      {/* Floating Action Modals */}
      {addModalMode === 'file' ? (
        <AddDownloadModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddDownload}
          defaultSavePath={settings.defaultSavePath}
          initialMode="file"
          initialUrl={addModalInitialUrl}
        />
      ) : (
        <SimpleAddDownloadModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddDownload}
          defaultSavePath={settings.defaultSavePath}
          initialMode="link"
          initialUrl={addModalInitialUrl}
        />
      )}

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

      <CreateTorrentModal
        isOpen={isCreateTorrentOpen}
        onClose={() => setIsCreateTorrentOpen(false)}
      />

      <HotkeysModal isOpen={isHotkeysOpen} onClose={() => setIsHotkeysOpen(false)} />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <PluginsModal isOpen={isPluginsOpen} onClose={() => setIsPluginsOpen(false)} />

      <AutomationsModal isOpen={isAutomationsOpen} onClose={() => setIsAutomationsOpen(false)} />

      <ScriptConsoleModal
        isOpen={isScriptConsoleOpen}
        onClose={() => setIsScriptConsoleOpen(false)}
      />

      <ThemeCustomizerModal
        isOpen={isThemeCustomizerOpen}
        onClose={() => setIsThemeCustomizerOpen(false)}
        currentColors={customColors}
        onSave={(newColors) => {
          setCustomColors(newColors)
          handleSaveSettings({ theme: 'custom' })
        }}
      />
    </div>
  )
}

export default App
