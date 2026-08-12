import React, { useState } from 'react'
import { X, Keyboard, Search, GripHorizontal } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface HotkeysModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutItem {
  category: string
  label: string
  shortcut: string
  description: string
}

const SHORTCUTS: ShortcutItem[] = [
  {
    category: 'File Operations',
    label: 'New Download',
    shortcut: 'Ctrl + N',
    description: 'Add HTTP, HTTPS, or media download to the queue.'
  },
  {
    category: 'File Operations',
    label: 'Open Torrent / Magnet',
    shortcut: 'Ctrl + O',
    description: 'Load external .torrent files or magnet URIs.'
  },
  {
    category: 'File Operations',
    label: 'Create Torrent Wizard',
    shortcut: 'Ctrl + Shift + C',
    description: 'Generate and seed a new .torrent file.'
  },
  {
    category: 'File Operations',
    label: 'Save Session As',
    shortcut: 'Ctrl + S',
    description: 'Export current download queue state to file.'
  },
  {
    category: 'File Operations',
    label: 'Import Task List',
    shortcut: 'Ctrl + I',
    description: 'Load an external queue session into engine.'
  },
  {
    category: 'File Operations',
    label: 'Settings / Preferences',
    shortcut: 'Ctrl + ,',
    description: 'Open global preferences pane.'
  },
  {
    category: 'Navigation & Workspaces',
    label: 'Transfers Table View',
    shortcut: 'Ctrl + 1',
    description: 'Switch main workspace view to task table.'
  },
  {
    category: 'Navigation & Workspaces',
    label: 'Analytics Dashboard',
    shortcut: 'Ctrl + 2',
    description: 'Switch main workspace view to analytics.'
  },
  {
    category: 'Navigation & Workspaces',
    label: 'Network Telemetry',
    shortcut: 'Ctrl + 3',
    description: 'Switch main workspace view to live graph.'
  },
  {
    category: 'Navigation & Workspaces',
    label: 'Toggle Full Screen',
    shortcut: 'F11',
    description: 'Toggle borderless window fullscreen view.'
  },
  {
    category: 'Task Controls',
    label: 'Select All Tasks',
    shortcut: 'Ctrl + A',
    description: 'Select all tasks in the active workspace.'
  },
  {
    category: 'Task Controls',
    label: 'Delete Selected Task',
    shortcut: 'Delete',
    description: 'Remove selected download task from queue.'
  },
  {
    category: 'Task Controls',
    label: 'Pause / Resume Task',
    shortcut: 'Space',
    description: 'Toggle pause or resume state for selected item.'
  },
  {
    category: 'Help & Information',
    label: 'Keyboard Shortcuts Index',
    shortcut: 'Ctrl + K',
    description: 'Displays this searchable hotkey reference.'
  },
  {
    category: 'Help & Information',
    label: 'User Documentation',
    shortcut: 'F1',
    description: 'Opens online documentation and guide.'
  }
]

export const HotkeysModal: React.FC<HotkeysModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const filtered = SHORTCUTS.filter(
    (s) =>
      s.label.toLowerCase().includes(query.toLowerCase()) ||
      s.shortcut.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${isDragging ? 'transition-none duration-0' : ''
          } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Title Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-2.5 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <div className="p-1.5 bg-sky-950/40 rounded-none border border-sky-500/25">
              <Keyboard className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-xs block">
                Keyboard Shortcuts Index
              </span>
              <span className="text-[10px] text-slate-500 block">
                Quick reference guide for all application hotkeys
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Header */}
        <div className="p-3 bg-ide-bg/60 border-b border-ide-border/80 flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shortcuts (e.g., Ctrl+N, Torrent, Delete)..."
            className="w-full bg-ide-surface text-slate-100 text-xs px-2.5 py-1.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 font-mono transition"
            autoFocus
          />
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No shortcuts found matching &quot;{query}&quot;
            </div>
          ) : (
            <div className="divide-y divide-ide-border/40">
              {filtered.map((item, idx) => (
                <div
                  key={idx}
                  className="py-2.5 flex items-center justify-between gap-4 hover:bg-white/3 px-2 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-xs">{item.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-ide-bg border border-ide-border text-slate-400 font-mono">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
                      {item.description}
                    </span>
                  </div>
                  <kbd className="px-2.5 py-1 bg-ide-bg border border-ide-border/90 rounded-none text-theme-accent font-mono text-[11px] font-bold shrink-0 shadow-xs">
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
