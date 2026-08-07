import { useEffect } from 'react'

export interface GlobalShortcutsHandlers {
  onNewDownload?: () => void
  onOpenTorrent?: () => void
  onCreateTorrent?: () => void
  onSaveSession?: () => void
  onImportTaskList?: () => void
  onExportLogs?: () => void
  onOpenSettings?: () => void
  onExitApp?: () => void
  onToggleFullscreen?: () => void
  onOpenDoc?: () => void
  onOpenHotkeys?: () => void
  onOpenAbout?: () => void
  onSwitchView?: (view: 'home' | 'analytics' | 'network') => void
  onSelectAll?: () => void
  onDeleteSelected?: () => void
  onTogglePauseSelected?: () => void
}

export function useGlobalShortcuts(handlers: GlobalShortcutsHandlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Don't intercept shortcut combinations if user is typing in an input or textarea
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      if (isInput && e.key !== 'Escape' && !e.key.startsWith('F')) {
        return
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey

      // Ctrl+N -> New Download (HTTP)
      if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handlers.onNewDownload?.()
        return
      }

      // Ctrl+O -> Open Torrent / Magnet
      if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        handlers.onOpenTorrent?.()
        return
      }

      // Ctrl+Shift+C -> Create Torrent Wizard
      if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        handlers.onCreateTorrent?.()
        return
      }

      // Ctrl+S -> Save Session As
      if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handlers.onSaveSession?.()
        return
      }

      // Ctrl+I -> Import Task List
      if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        handlers.onImportTaskList?.()
        return
      }

      // Ctrl+, -> Settings
      if (ctrlOrCmd && e.key === ',') {
        e.preventDefault()
        handlers.onOpenSettings?.()
        return
      }

      // Ctrl+K -> Hotkeys Index
      if (ctrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        handlers.onOpenHotkeys?.()
        return
      }

      // F1 -> Documentation
      if (e.key === 'F1') {
        e.preventDefault()
        handlers.onOpenDoc?.()
        return
      }

      // F11 -> Toggle Fullscreen
      if (e.key === 'F11') {
        e.preventDefault()
        handlers.onToggleFullscreen?.()
        return
      }

      // Ctrl+1 / Ctrl+2 / Ctrl+3 -> Workspace Switching
      if (ctrlOrCmd && e.key === '1') {
        e.preventDefault()
        handlers.onSwitchView?.('home')
        return
      }
      if (ctrlOrCmd && e.key === '2') {
        e.preventDefault()
        handlers.onSwitchView?.('analytics')
        return
      }
      if (ctrlOrCmd && e.key === '3') {
        e.preventDefault()
        handlers.onSwitchView?.('network')
        return
      }

      // Delete key -> Delete selected task
      if (e.key === 'Delete' && !isInput) {
        e.preventDefault()
        handlers.onDeleteSelected?.()
        return
      }

      // Space key -> Toggle Pause/Resume selected task
      if (e.key === ' ' && !isInput) {
        e.preventDefault()
        handlers.onTogglePauseSelected?.()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
