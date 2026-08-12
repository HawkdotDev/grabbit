import { useEffect, useRef } from 'react'

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
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

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
        handlersRef.current.onNewDownload?.()
        return
      }

      // Ctrl+O -> Open Torrent / Magnet
      if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        handlersRef.current.onOpenTorrent?.()
        return
      }

      // Ctrl+Shift+C -> Create Torrent Wizard
      if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        handlersRef.current.onCreateTorrent?.()
        return
      }

      // Ctrl+S -> Save Session As
      if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handlersRef.current.onSaveSession?.()
        return
      }

      // Ctrl+I -> Import Task List
      if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        handlersRef.current.onImportTaskList?.()
        return
      }

      // Ctrl+, -> Settings
      if (ctrlOrCmd && e.key === ',') {
        e.preventDefault()
        handlersRef.current.onOpenSettings?.()
        return
      }

      // Ctrl+K -> Hotkeys Index
      if (ctrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        handlersRef.current.onOpenHotkeys?.()
        return
      }

      // F1 -> Documentation
      if (e.key === 'F1') {
        e.preventDefault()
        handlersRef.current.onOpenDoc?.()
        return
      }

      // F11 -> Toggle Fullscreen
      if (e.key === 'F11') {
        e.preventDefault()
        handlersRef.current.onToggleFullscreen?.()
        return
      }

      // Ctrl+1 / Ctrl+2 / Ctrl+3 -> Workspace Switching
      if (ctrlOrCmd && e.key === '1') {
        e.preventDefault()
        handlersRef.current.onSwitchView?.('home')
        return
      }
      if (ctrlOrCmd && e.key === '2') {
        e.preventDefault()
        handlersRef.current.onSwitchView?.('analytics')
        return
      }
      if (ctrlOrCmd && e.key === '3') {
        e.preventDefault()
        handlersRef.current.onSwitchView?.('network')
        return
      }

      // Delete key -> Delete selected task
      if (e.key === 'Delete' && !isInput) {
        e.preventDefault()
        handlersRef.current.onDeleteSelected?.()
        return
      }

      // Space key -> Toggle Pause/Resume selected task
      if (e.key === ' ' && !isInput) {
        e.preventDefault()
        handlersRef.current.onTogglePauseSelected?.()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
