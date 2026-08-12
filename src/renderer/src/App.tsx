import React, { useState, useEffect, useCallback } from 'react'
import { EngineSettings, DownloadItem, CustomThemeColors } from '../../engine/types'
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
  AddTorrentSourceModal,
  SettingsModal,
  HashModal,
  CreateTorrentModal,
  HotkeysModal,
  AboutModal,
  PluginsModal,
  AutomationsModal,
  ScriptConsoleModal,
  ThemeCustomizerModal,
  EditTrackersModal,
  TorrentOptionsModal,
  RenameModal,
  ConfirmRemoveModal,
  AnalyticsView,
  NetworkView,
  StreamView,
  ClipboardBanner
} from './components'
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts'

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
  const [activeMainView, setActiveMainView] = useState<'home' | 'analytics' | 'network' | 'stream'>('home')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addModalMode, setAddModalMode] = useState<'link' | 'file'>('link')
  const [addModalInitialUrl, setAddModalInitialUrl] = useState('')
  const [isTorrentSourceModalOpen, setIsTorrentSourceModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [hashModalDownload, setHashModalDownload] = useState<DownloadItem | null>(null)
  const [trackersModalDownload, setTrackersModalDownload] = useState<DownloadItem | null>(null)
  const [torrentOptionsModalDownload, setTorrentOptionsModalDownload] =
    useState<DownloadItem | null>(null)
  const [renameModalDownload, setRenameModalDownload] = useState<DownloadItem | null>(null)
  const [removeConfirmDownload, setRemoveConfirmDownload] = useState<DownloadItem | null>(null)

  // Extra Features Modals
  const [isCreateTorrentOpen, setIsCreateTorrentOpen] = useState(false)
  const [isHotkeysOpen, setIsHotkeysOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isPluginsOpen, setIsPluginsOpen] = useState(false)
  const [isAutomationsOpen, setIsAutomationsOpen] = useState(false)
  const [isScriptConsoleOpen, setIsScriptConsoleOpen] = useState(false)
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false)
  const [customColors, setCustomColors] = useState<CustomThemeColors>({
    bg: '#0d0e12',
    surface: '#14151c',
    card: '#1b1c26',
    border: '#272938',
    accent: '#b497ff',
    bright: '#c4b5fd',
    tint: '#2c2244'
  })

  // Layout & Density Preferences
  const [density, setDensity] = useState<'compact' | 'default' | 'comfortable'>('default')
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showInspector, setShowInspector] = useState(true)
  const [showStatusBar, setShowStatusBar] = useState(true)

  const handleOpenAddModal = (mode: 'link' | 'file' = 'link', initialUrl = ''): void => {
    const isTorrent =
      initialUrl &&
      (initialUrl.startsWith('magnet:') ||
        initialUrl.includes('magnet:') ||
        initialUrl.endsWith('.torrent'))
    const effectiveMode = isTorrent ? 'file' : mode

    if (effectiveMode === 'file' && !initialUrl) {
      // Show intermediate torrent source modal first
      setIsTorrentSourceModalOpen(true)
      return
    }
    setAddModalMode(effectiveMode)
    setAddModalInitialUrl(initialUrl)
    setIsAddModalOpen(true)
  }

  const handleTorrentSourceProceed = (source: string): void => {
    setIsTorrentSourceModalOpen(false)
    setAddModalMode('file')
    setAddModalInitialUrl(source)
    setIsAddModalOpen(true)
  }

  const handleRequestRemove = useCallback(
    (id: string): void => {
      const target = downloads.find((d) => d.id === id)
      if (target) {
        setRemoveConfirmDownload(target)
      }
    },
    [downloads]
  )

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
      if (selectedDownload) setRemoveConfirmDownload(selectedDownload)
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

  // ─── Single source of truth: clear inline CSS vars for built-in themes ───
  const CUSTOM_CSS_VARS = [
    '--color-ide-bg',
    '--color-ide-surface',
    '--color-ide-card',
    '--color-ide-border',
    '--color-theme-accent',
    '--color-theme-bright',
    '--color-theme-tint'
  ] as const

  const clearInlineThemeVars = useCallback((): void => {
    const root = document.documentElement
    for (const v of CUSTOM_CSS_VARS) {
      root.style.removeProperty(v)
    }
  }, [])

  const applyInlineThemeVars = useCallback((colors: CustomThemeColors): void => {
    const root = document.documentElement
    root.style.setProperty('--color-ide-bg', colors.bg)
    root.style.setProperty('--color-ide-surface', colors.surface)
    root.style.setProperty('--color-ide-card', colors.card)
    root.style.setProperty('--color-ide-border', colors.border)
    root.style.setProperty('--color-theme-accent', colors.accent)
    root.style.setProperty('--color-theme-bright', colors.bright)
    root.style.setProperty('--color-theme-tint', colors.tint)
  }, [])

  useEffect(() => {
    const currentTheme = settings.theme || 'dark'

    // Always clear inline vars first to ensure a clean slate
    clearInlineThemeVars()

    if (currentTheme === 'custom') {
      // For custom theme, set data-theme to 'dark' as the base, then overlay inline vars
      document.documentElement.setAttribute('data-theme', 'dark')
      applyInlineThemeVars(customColors)
    } else {
      // For built-in themes, just set the data-theme attribute — CSS handles the rest
      document.documentElement.setAttribute('data-theme', currentTheme)
    }
  }, [settings.theme, customColors, clearInlineThemeVars, applyInlineThemeVars])

  // ─── Unified theme change handler (used by MenuBar, Settings, and Customizer) ───
  const handleThemeChange = useCallback((newTheme: string): void => {
    const typedTheme = newTheme as EngineSettings['theme']
    setSettings((prev) => ({ ...prev, theme: typedTheme }))
    // Persist to backend if available
    if (window.api && window.api.updateSettings) {
      window.api.updateSettings({ theme: typedTheme })
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
    handleOpenAddModal('link', url)
    clear()
  }

  return (
    <div
      style={{ zoom: `${zoomLevel}%` }}
      className={`flex flex-col h-screen w-screen overflow-hidden bg-ide-bg text-slate-100 font-sans select-none border border-ide-border rounded-none ${
        density === 'compact' ? 'text-[11px]' : density === 'comfortable' ? 'text-[13px]' : 'text-xs'
      }`}
    >
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
        currentTheme={settings.theme || 'dark'}
        onThemeChange={handleThemeChange}
        density={density}
        onDensityChange={(d) => setDensity(d)}
        zoomLevel={zoomLevel}
        onZoomChange={(z) => setZoomLevel(z)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar((prev) => !prev)}
        showInspector={showInspector}
        onToggleInspector={() => setShowInspector((prev) => !prev)}
        showStatusBar={showStatusBar}
        onToggleStatusBar={() => setShowStatusBar((prev) => !prev)}
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
          onCancel={handleRequestRemove}
        />
      ) : activeMainView === 'network' ? (
        <NetworkView downloads={downloads} speedHistory={speedHistory} globalSpeed={globalSpeed} />
      ) : activeMainView === 'stream' ? (
        <StreamView
          downloads={downloads}
          activeDownloadId={selectedDownload?.id || null}
          onSelectDownload={(id) => setSelectedId(id)}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Left Navigation Sidebar */}
          {showSidebar && (
            <>
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
            </>
          )}

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
                onCancel={handleRequestRemove}
                onOpenHashModal={(item) => setHashModalDownload(item)}
                onOpenTrackersModal={(item) => setTrackersModalDownload(item)}
                onOpenTorrentOptionsModal={(item) => setTorrentOptionsModalDownload(item)}
                onOpenRenameModal={(item) => setRenameModalDownload(item)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterBy={filterBy}
                setFilterBy={setFilterBy}
                onUpdateDownload={handleUpdateDownload}
                onOpenAddModal={handleOpenAddModal}
              />
            </main>

            {/* Bottom Detail Inspector Panel & Resize Handle */}
            {showInspector && (
              <>
                <div
                  onMouseDown={handleInspectorMouseDown}
                  className="h-0.5 cursor-row-resize hover:bg-theme-accent active:bg-theme-bright bg-ide-border transition shrink-0 z-30"
                  title="Drag to resize inspector panel"
                />

                <BottomDetailInspector
                  download={selectedDownload}
                  height={inspectorHeight}
                  speedHistory={speedHistory}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Persistent Bottom Telemetry Status Bar */}
      {showStatusBar && <BottomStatusBar downloads={downloads} globalSpeed={globalSpeed} />}

      {/* Floating Action Modals */}
      <AddTorrentSourceModal
        isOpen={isTorrentSourceModalOpen}
        onClose={() => setIsTorrentSourceModalOpen(false)}
        onProceed={handleTorrentSourceProceed}
      />

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

      <EditTrackersModal
        isOpen={!!trackersModalDownload}
        download={trackersModalDownload}
        onClose={() => setTrackersModalDownload(null)}
      />

      <TorrentOptionsModal
        isOpen={!!torrentOptionsModalDownload}
        download={torrentOptionsModalDownload}
        onClose={() => setTorrentOptionsModalDownload(null)}
        onSave={handleUpdateDownload}
      />

      <RenameModal
        isOpen={!!renameModalDownload}
        download={renameModalDownload}
        onClose={() => setRenameModalDownload(null)}
        onRenamed={(id, newName) => handleUpdateDownload(id, { name: newName })}
      />

      <ConfirmRemoveModal
        isOpen={!!removeConfirmDownload}
        download={removeConfirmDownload}
        onClose={() => setRemoveConfirmDownload(null)}
        onConfirm={(id, deleteFiles) => handleCancel(id, deleteFiles)}
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
          handleThemeChange('custom')
        }}
      />
    </div>
  )
}

export default App
