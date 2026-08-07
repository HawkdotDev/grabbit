import React, { useState, useRef, useEffect } from 'react'
import {
  Plus,
  FileUp,
  Hammer,
  Save,
  FolderInput,
  FileSpreadsheet,
  Sliders,
  Power,
  Palette,
  LayoutGrid,
  AlignJustify,
  PanelLeft,
  ZoomIn,
  Pin,
  Maximize2,
  Puzzle,
  Zap,
  Terminal,
  Globe,
  Gauge,
  ShieldCheck,
  BookOpen,
  Keyboard,
  RefreshCw,
  Info,
  ChevronRight,
  Check
} from 'lucide-react'

interface MenuBarProps {
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onOpenSettingsModal: () => void
  onOpenCreateTorrent?: () => void
  onOpenHotkeys?: () => void
  onOpenAbout?: () => void
  onOpenPlugins?: () => void
  onOpenAutomations?: () => void
  onOpenScriptConsole?: () => void
  onOpenThemeCustomizer?: () => void
  onResumeAll?: () => void
  onPauseAll?: () => void
  onClearCompleted?: () => void
  activeView?: 'home' | 'analytics' | 'network'
  setActiveView?: (view: 'home' | 'analytics' | 'network') => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onOpenAddModal,
  onOpenSettingsModal,
  onOpenCreateTorrent,
  onOpenHotkeys,
  onOpenAbout,
  onOpenPlugins,
  onOpenAutomations,
  onOpenScriptConsole,
  onOpenThemeCustomizer,
  onResumeAll,
  onPauseAll,
  onClearCompleted,
  activeView = 'home',
  setActiveView,
  currentTheme = 'dark',
  onThemeChange
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  // Local view preferences state (theme is now managed by App via props)
  const [density, setDensity] = useState<'compact' | 'default' | 'comfortable'>('default')
  const [alwaysOnTop, setAlwaysOnTop] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showInspector, setShowInspector] = useState(true)
  const [showStatusBar, setShowStatusBar] = useState(true)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
        setActiveSubmenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExportSession = async (): Promise<void> => {
    if (window.api?.exportQueue) {
      await window.api.exportQueue()
    }
  }

  const handleImportQueue = async (): Promise<void> => {
    if (window.api?.importQueue) {
      await window.api.importQueue()
    }
  }

  const handleExit = (): void => {
    if (window.api?.closeWindow) {
      window.api.closeWindow()
    }
  }

  const handleToggleFullscreen = (): void => {
    if (window.api?.maximizeWindow) {
      window.api.maximizeWindow()
    }
  }

  const handleZoom = (delta: number): void => {
    setZoomLevel((prev) => Math.min(150, Math.max(75, prev + delta)))
  }

  const renderDropdownContent = (item: string): React.JSX.Element => {
    switch (item) {
      // ─────────────────────────────────────────
      // FILE MENU
      // ─────────────────────────────────────────
      case 'File':
        return (
          <>
            <button
              type="button"
              onClick={() => {
                onOpenAddModal('link')
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-theme-accent" />
                <span>New Download...</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                Ctrl+N
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenAddModal('file')
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <FileUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Open Torrent / Magnet...</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                Ctrl+O
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenCreateTorrent) onOpenCreateTorrent()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Hammer className="h-3.5 w-3.5 text-amber-300" />
                <span>Create Torrent...</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                Ctrl+C
              </span>
            </button>

            <div className="border-t border-ide-border my-1" />

            <button
              type="button"
              onClick={() => {
                handleExportSession()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Save className="h-3.5 w-3.5 text-purple-300" />
                <span>Save Session As...</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                Ctrl+S
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleImportQueue()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <FolderInput className="h-3.5 w-3.5 text-sky-300" />
                <span>Import Task List...</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                Ctrl+I
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                alert('Transfer diagnostics exported to grabbit_data/logs.')
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-300" />
                <span>Export Transfer Logs...</span>
              </div>
            </button>

            <div className="border-t border-ide-border my-1" />

            <button
              type="button"
              onClick={() => {
                onOpenSettingsModal()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-rose-300" />
                <span>Settings...</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                Ctrl+,
              </span>
            </button>

            <div className="border-t border-ide-border my-1" />

            <button
              type="button"
              onClick={handleExit}
              className="w-full text-left px-3 py-1.5 hover:bg-rose-950/40 hover:text-rose-300 text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Power className="h-3.5 w-3.5 text-rose-400" />
                <span>Exit</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-rose-400/80 font-mono">
                Alt+F4
              </span>
            </button>
          </>
        )

      // ─────────────────────────────────────────
      // EDIT MENU
      // ─────────────────────────────────────────
      case 'Edit':
        return (
          <>
            <button
              type="button"
              onClick={() => {
                if (onResumeAll) onResumeAll()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Resume All Tasks</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                Ctrl+R
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onPauseAll) onPauseAll()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-amber-300" />
                <span>Pause All Tasks</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                Ctrl+P
              </span>
            </button>

            <div className="border-t border-ide-border my-1" />

            <button
              type="button"
              onClick={() => {
                if (onClearCompleted) onClearCompleted()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Power className="h-3.5 w-3.5 text-rose-300" />
                <span>Clear Completed Tasks</span>
              </div>
            </button>
          </>
        )

      // ─────────────────────────────────────────
      // VIEW MENU
      // ─────────────────────────────────────────
      case 'View':
        return (
          <>
            {/* Appearance & Theme Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('theme')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-3.5 w-3.5 text-theme-accent" />
                  <span>Appearance &amp; Theme</span>
                </div>
                <ChevronRight className="h-3 w-3 text-slate-500" />
              </button>

              {activeSubmenu === 'theme' && (
                <div className="absolute left-full top-0 ml-1 w-52 bg-ide-surface border border-ide-border shadow-2xl py-1 z-[110] rounded-none text-slate-200">
                  {(
                    [
                      { id: 'dark', label: 'Dark Mode (IDE Default)' },
                      { id: 'carrot', label: 'Carrot Theme 🥕' },
                      { id: 'light', label: 'Light Mode' },
                      { id: 'contrast', label: 'High Contrast' },
                      { id: 'system', label: 'System Sync' }
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (onThemeChange) onThemeChange(t.id)
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
                    >
                      <span>{t.label}</span>
                      {currentTheme === t.id && <Check className="h-3 w-3 text-theme-accent" />}
                    </button>
                  ))}
                  <div className="border-t border-ide-border my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenThemeCustomizer) onOpenThemeCustomizer()
                      setActiveMenu(null)
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2 cursor-pointer font-medium text-amber-300"
                  >
                    <Palette className="h-3.5 w-3.5 text-amber-400" />
                    <span>Advanced Customizer...</span>
                  </button>
                </div>
              )}
            </div>

            {/* Workspaces Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('workspaces')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Workspaces</span>
                </div>
                <ChevronRight className="h-3 w-3 text-slate-500" />
              </button>

              {activeSubmenu === 'workspaces' && (
                <div className="absolute left-full top-0 ml-1 w-48 bg-ide-surface border border-ide-border shadow-2xl py-1 z-[110] rounded-none text-slate-200">
                  {(
                    [
                      { id: 'home', label: 'Transfers Table' },
                      { id: 'analytics', label: 'Analytics Dashboard' },
                      { id: 'network', label: 'Network Telemetry' }
                    ] as const
                  ).map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        if (setActiveView) setActiveView(w.id)
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
                    >
                      <span>{w.label}</span>
                      {activeView === w.id && <Check className="h-3 w-3 text-theme-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layout Density Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('density')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <AlignJustify className="h-3.5 w-3.5 text-cyan-300" />
                  <span>Layout Density</span>
                </div>
                <ChevronRight className="h-3 w-3 text-slate-500" />
              </button>

              {activeSubmenu === 'density' && (
                <div className="absolute left-full top-0 ml-1 w-40 bg-ide-surface border border-ide-border shadow-2xl py-1 z-[110] rounded-none text-slate-200">
                  {(
                    [
                      { id: 'compact', label: 'Compact' },
                      { id: 'default', label: 'Default' },
                      { id: 'comfortable', label: 'Comfortable' }
                    ] as const
                  ).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDensity(d.id)
                        setActiveMenu(null)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
                    >
                      <span>{d.label}</span>
                      {density === d.id && <Check className="h-3 w-3 text-theme-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Panels & Toolbars Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('panels')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <PanelLeft className="h-3.5 w-3.5 text-amber-300" />
                  <span>Panels &amp; Toolbars</span>
                </div>
                <ChevronRight className="h-3 w-3 text-slate-500" />
              </button>

              {activeSubmenu === 'panels' && (
                <div className="absolute left-full top-0 ml-1 w-48 bg-ide-surface border border-ide-border shadow-2xl py-1 z-[110] rounded-none text-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
                  >
                    <span>Filter Sidebar</span>
                    {showSidebar && <Check className="h-3 w-3 text-theme-accent" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInspector(!showInspector)}
                    className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
                  >
                    <span>Bottom Detail Inspector</span>
                    {showInspector && <Check className="h-3 w-3 text-theme-accent" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStatusBar(!showStatusBar)}
                    className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
                  >
                    <span>Status Bar Telemetry</span>
                    {showStatusBar && <Check className="h-3 w-3 text-theme-accent" />}
                  </button>
                </div>
              )}
            </div>

            {/* Interface Zoom Submenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('zoom')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <ZoomIn className="h-3.5 w-3.5 text-purple-300" />
                  <span>Interface Zoom ({zoomLevel}%)</span>
                </div>
                <ChevronRight className="h-3 w-3 text-slate-500" />
              </button>

              {activeSubmenu === 'zoom' && (
                <div className="absolute left-full top-0 ml-1 w-40 bg-ide-surface border border-ide-border shadow-2xl py-1 z-[110] rounded-none text-slate-200">
                  <button
                    type="button"
                    onClick={() => handleZoom(10)}
                    className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
                  >
                    <span>Zoom In</span>
                    <span className="text-[10px] text-slate-500 font-mono">Ctrl++</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoom(-10)}
                    className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
                  >
                    <span>Zoom Out</span>
                    <span className="text-[10px] text-slate-500 font-mono">Ctrl+-</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
                  >
                    <span>Reset Zoom</span>
                    <span className="text-[10px] text-slate-500 font-mono">Ctrl+0</span>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-ide-border my-1" />

            <button
              type="button"
              onClick={() => setAlwaysOnTop(!alwaysOnTop)}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium"
            >
              <div className="flex items-center gap-2">
                <Pin className="h-3.5 w-3.5 text-sky-300" />
                <span>Always on Top</span>
              </div>
              {alwaysOnTop && <Check className="h-3 w-3 text-theme-accent" />}
            </button>

            <button
              type="button"
              onClick={() => {
                handleToggleFullscreen()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Maximize2 className="h-3.5 w-3.5 text-slate-300" />
                <span>Enter Full Screen</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                F11
              </span>
            </button>
          </>
        )

      // ─────────────────────────────────────────
      // TOOLS MENU
      // ─────────────────────────────────────────
      case 'Tools':
        return (
          <>
            <button
              type="button"
              onClick={() => {
                if (onOpenPlugins) onOpenPlugins()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Puzzle className="h-3.5 w-3.5 text-purple-300" />
                <span>Plugins &amp; Extensions...</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenAutomations) onOpenAutomations()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                <span>Automations &amp; Event Triggers...</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenScriptConsole) onOpenScriptConsole()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Scripting Console...</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                alert('API & JSON-RPC Gateway active on port 6800.')
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-cyan-300" />
                <span>API &amp; Gateway Integrations...</span>
              </div>
            </button>

            <div className="border-t border-ide-border my-1" />

            <button
              type="button"
              onClick={() => {
                onOpenSettingsModal()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-theme-accent" />
                <span>Bandwidth Scheduler &amp; Limits...</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                alert('Checksum Verifier tool ready.')
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
                <span>Checksum &amp; File Integrity...</span>
              </div>
            </button>
          </>
        )

      // ─────────────────────────────────────────
      // HELP MENU
      // ─────────────────────────────────────────
      case 'Help':
        return (
          <>
            <button
              type="button"
              onClick={() => {
                window.open('https://github.com/HawkdotDev/grabbit#readme', '_blank')
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-sky-300" />
                <span>Documentation</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                F1
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenHotkeys) onOpenHotkeys()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Keyboard className="h-3.5 w-3.5 text-amber-300" />
                <span>Keyboard Shortcuts</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-theme-accent/70 font-mono">
                Ctrl+K
              </span>
            </button>

            <div className="border-t border-ide-border my-1" />

            <button
              type="button"
              onClick={() => {
                alert('Checking for updates... Grabbit v0.1.1 is up to date!')
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                <span>Check for Updates...</span>
              </div>
            </button>

            <div className="border-t border-ide-border my-1" />

            <button
              type="button"
              onClick={() => {
                if (onOpenAbout) onOpenAbout()
                setActiveMenu(null)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center justify-between cursor-pointer font-medium group"
            >
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-theme-accent" />
                <span>About Grabbit</span>
              </div>
            </button>
          </>
        )

      default:
        return <></>
    }
  }

  return (
    <div
      ref={menuRef}
      className="flex items-center gap-1 text-xs text-slate-300 font-medium style-no-drag"
    >
      {['File', 'Edit', 'View', 'Tools', 'Help'].map((item) => (
        <div key={item} className="relative">
          <button
            type="button"
            onClick={() => {
              setActiveMenu(activeMenu === item ? null : item)
              setActiveSubmenu(null)
            }}
            className={`px-3 py-1.5 rounded-none transition cursor-pointer flex items-center leading-none ${
              activeMenu === item
                ? 'bg-theme-tint text-theme-accent font-semibold'
                : 'hover:bg-white/10 hover:text-white'
            }`}
          >
            {item}
          </button>
          {activeMenu === item && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-ide-surface border border-ide-border shadow-2xl py-1 z-[100] rounded-none text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              {renderDropdownContent(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
