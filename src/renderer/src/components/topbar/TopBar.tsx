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
  activeView: 'home' | 'analytics' | 'network'
  setActiveView: (view: 'home' | 'analytics' | 'network') => void
  globalSpeed?: number
}

export const TopBar: React.FC<TopBarProps> = React.memo(
  ({ onOpenAddModal, onClearCompleted, onOpenSettingsModal, activeView, setActiveView }) => {
    return (
      <header className="bg-ide-surface border-b border-ide-border flex flex-col select-none font-sans rounded-none">
        {/* Upper Window Title & Menu Bar Row */}
        <div className="h-10 pl-3 pr-1.5 flex items-center justify-between border-b border-[#292929] style-drag">
          {/* Left App Logo & Menu Items */}
          <div className="flex items-center gap-4 style-no-drag">
            <AppLogo />
            <div className="h-4 w-px bg-ide-border" />
            <MenuBar onOpenAddModal={onOpenAddModal} onOpenSettingsModal={onOpenSettingsModal} />
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
