import React from 'react'
import { AppLogo } from './AppLogo'
import { MenuBar } from './MenuBar'
import { HeaderActions } from './HeaderActions'
import { WindowControls } from './WindowControls'
import { QuickActionGroup } from './QuickActionGroup'

interface TopBarProps {
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onPauseAll: () => void
  onResumeAll: () => void
  onClearCompleted: () => void
  onOpenSettingsModal: () => void
  onOpenCreateTorrent?: () => void
  onOpenHotkeys?: () => void
  onOpenAbout?: () => void
  onOpenPlugins?: () => void
  onOpenAutomations?: () => void
  onOpenScriptConsole?: () => void
  onOpenThemeCustomizer?: () => void
  activeView: 'home' | 'analytics' | 'network' | 'stream'
  setActiveView: (view: 'home' | 'analytics' | 'network' | 'stream') => void
  globalSpeed?: number
  currentTheme?: string
  onThemeChange?: (theme: string) => void
  density?: 'compact' | 'default' | 'comfortable'
  onDensityChange?: (d: 'compact' | 'default' | 'comfortable') => void
  zoomLevel?: number
  onZoomChange?: (z: number) => void
  showSidebar?: boolean
  onToggleSidebar?: () => void
  showInspector?: boolean
  onToggleInspector?: () => void
  showStatusBar?: boolean
  onToggleStatusBar?: () => void
}

export const TopBar: React.FC<TopBarProps> = React.memo(
  ({
    onOpenAddModal,
    onPauseAll,
    onResumeAll,
    onClearCompleted,
    onOpenSettingsModal,
    onOpenCreateTorrent,
    onOpenHotkeys,
    onOpenAbout,
    onOpenPlugins,
    onOpenAutomations,
    onOpenScriptConsole,
    onOpenThemeCustomizer,
    activeView,
    setActiveView,
    currentTheme,
    onThemeChange,
    density,
    onDensityChange,
    zoomLevel,
    onZoomChange,
    showSidebar,
    onToggleSidebar,
    showInspector,
    onToggleInspector,
    showStatusBar,
    onToggleStatusBar
  }) => {
    return (
      <header className="bg-ide-surface border-b border-ide-border flex flex-col select-none font-sans rounded-none relative z-50">
        {/* Upper Window Title & Menu Bar Row */}
        <div className="h-10 pl-3 pr-1.5 flex items-center justify-between border-b border-[#292929] style-drag">
          {/* Left App Logo & Menu Items */}
          <div className="flex items-center gap-4 style-no-drag">
            <AppLogo />
            <div className="h-4 w-px bg-ide-border" />
            <MenuBar
              onOpenAddModal={onOpenAddModal}
              onOpenSettingsModal={onOpenSettingsModal}
              onOpenCreateTorrent={onOpenCreateTorrent}
              onOpenHotkeys={onOpenHotkeys}
              onOpenAbout={onOpenAbout}
              onOpenPlugins={onOpenPlugins}
              onOpenAutomations={onOpenAutomations}
              onOpenScriptConsole={onOpenScriptConsole}
              onOpenThemeCustomizer={onOpenThemeCustomizer}
              onResumeAll={onResumeAll}
              onPauseAll={onPauseAll}
              onClearCompleted={onClearCompleted}
              activeView={activeView}
              setActiveView={setActiveView}
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              density={density}
              onDensityChange={onDensityChange}
              zoomLevel={zoomLevel}
              onZoomChange={onZoomChange}
              showSidebar={showSidebar}
              onToggleSidebar={onToggleSidebar}
              showInspector={showInspector}
              onToggleInspector={onToggleInspector}
              showStatusBar={showStatusBar}
              onToggleStatusBar={onToggleStatusBar}
            />
          </div>

          {/* Right Status & Frameless Window Controls */}
          <div className="flex items-center gap-3 style-no-drag">
            <HeaderActions onOpenSettingsModal={onOpenSettingsModal} />
            <div className="h-4 w-px bg-ide-border" />
            <WindowControls />
          </div>
        </div>

        {/* Action Toolbar Row */}
        <div className="h-11 px-3 flex items-center justify-between bg-ide-bg">
          <QuickActionGroup
            onOpenAddModal={onOpenAddModal}
            onClearCompleted={onClearCompleted}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        </div>
      </header>
    )
  }
)

TopBar.displayName = 'TopBar'
