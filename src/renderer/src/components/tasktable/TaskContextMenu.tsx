import React, { useState, useEffect, useRef } from 'react'
import {
  Square,
  FastForward,
  Trash2,
  FolderInput,
  Pencil,
  Radio,
  Layers,
  Tag,
  Sliders,
  Zap,
  Eye,
  RotateCw,
  RefreshCw,
  FolderOpen,
  Copy,
  FileDown,
  ChevronRight,
  Check,
  Link,
  Hash,
  Folder,
  FileText,
  Archive,
  Film,
  Music,
  Cpu,
  Image,
  Code2
} from 'lucide-react'
import { DownloadItem, DownloadCategory } from '../../../../engine/types'

export interface TaskContextMenuProps {
  x: number
  y: number
  download: DownloadItem
  onClose: () => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onOpenHashModal: (download: DownloadItem) => void
  onUpdateDownload?: (id: string, updates: Partial<DownloadItem>) => void
}

export const TaskContextMenu: React.FC<TaskContextMenuProps> = ({
  x,
  y,
  download,
  onClose,
  onPause,
  onResume,
  onCancel,
  onOpenHashModal,
  onUpdateDownload
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeSubmenu, setActiveSubmenu] = useState<'category' | 'tags' | 'copy' | null>(null)
  const [autoManagement, setAutoManagement] = useState(true)
  const [superSeeding, setSuperSeeding] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Prevent context menu from clipping off-screen
  const menuWidth = 260
  const menuHeight = 520
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10)
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10)

  const handleOpenFolder = (): void => {
    window.api?.openFileLocation(download.savePath)
    onClose()
  }

  const handlePreviewFile = (): void => {
    window.api?.openFile(download.savePath)
    onClose()
  }

  const handleRename = (): void => {
    const newName = prompt('Rename Task:', download.name)
    if (newName && newName.trim()) {
      onUpdateDownload?.(download.id, { name: newName.trim() })
    }
    onClose()
  }

  const handleSetLocation = (): void => {
    const newPath = prompt('Set Destination Directory Path:', download.savePath)
    if (newPath && newPath.trim()) {
      onUpdateDownload?.(download.id, { savePath: newPath.trim() })
    }
    onClose()
  }

  const handleCopy = (text: string): void => {
    if (text) window.api?.copyToClipboard(text)
    onClose()
  }

  const categoriesList: Array<{ id: DownloadCategory; label: string; icon: React.JSX.Element }> = [
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="h-3.5 w-3.5 text-amber-400" />
    },
    {
      id: 'compressed',
      label: 'Compressed',
      icon: <Archive className="h-3.5 w-3.5 text-purple-400" />
    },
    { id: 'video', label: 'Videos', icon: <Film className="h-3.5 w-3.5 text-emerald-400" /> },
    { id: 'audio', label: 'Audio', icon: <Music className="h-3.5 w-3.5 text-cyan-400" /> },
    { id: 'executables', label: 'Programs', icon: <Cpu className="h-3.5 w-3.5 text-teal-400" /> },
    { id: 'images', label: 'Images', icon: <Image className="h-3.5 w-3.5 text-yellow-400" /> },
    { id: 'code', label: 'Source Code', icon: <Code2 className="h-3.5 w-3.5 text-indigo-400" /> },
    { id: 'other', label: 'Other', icon: <Folder className="h-3.5 w-3.5 text-slate-400" /> }
  ]

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-[150] w-64 bg-ide-surface/95 backdrop-blur-md border border-ide-border rounded-none shadow-2xl py-1 text-xs select-none animate-in fade-in zoom-in-95 duration-100 font-sans text-slate-200"
    >
      {/* 1. Stop / Pause */}
      <button
        onClick={() => {
          onPause(download.id)
          onClose()
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <Square className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
        <span>Stop</span>
      </button>

      {/* 2. Force Start */}
      <button
        onClick={() => {
          onResume(download.id)
          onClose()
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <FastForward className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400 shrink-0" />
        <span>Force Start</span>
      </button>

      {/* 3. Remove */}
      <button
        onClick={() => {
          onCancel(download.id)
          onClose()
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-950/50 hover:text-rose-300 cursor-pointer transition-colors text-left font-medium text-rose-300"
      >
        <Trash2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
        <span>Remove</span>
      </button>

      <div className="my-1 border-t border-ide-border/60" />

      {/* 4. Set location... */}
      <button
        onClick={handleSetLocation}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <FolderInput className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <span>Set location...</span>
      </button>

      {/* 5. Rename... */}
      <button
        onClick={handleRename}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <Pencil className="h-3.5 w-3.5 text-sky-400 shrink-0" />
        <span>Rename...</span>
      </button>

      {/* 6. Edit trackers... */}
      <button
        onClick={() => {
          onOpenHashModal(download)
          onClose()
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <Radio className="h-3.5 w-3.5 text-purple-400 shrink-0" />
        <span>Edit trackers...</span>
      </button>

      {/* 7. Category > */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('category')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <div className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors font-medium">
          <div className="flex items-center gap-2.5">
            <Layers className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Category</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
        </div>

        {/* Category Submenu */}
        {activeSubmenu === 'category' && (
          <div className="absolute left-full top-0 w-44 bg-ide-surface border border-ide-border rounded-none shadow-2xl py-1 text-xs z-[160]">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onUpdateDownload?.(download.id, { category: cat.id })
                  onClose()
                }}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-theme-tint hover:text-theme-accent cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  {cat.icon}
                  <span>{cat.label}</span>
                </div>
                {download.category === cat.id && <Check className="h-3 w-3 text-theme-accent" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 8. Tags > */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('tags')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <div className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors font-medium">
          <div className="flex items-center gap-2.5">
            <Tag className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>Tags</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
        </div>

        {/* Tags Submenu */}
        {activeSubmenu === 'tags' && (
          <div className="absolute left-full top-0 w-40 bg-ide-surface border border-ide-border rounded-none shadow-2xl py-1 text-xs z-[160]">
            {['grabbit', 'untagged'].map((tag) => (
              <button
                key={tag}
                onClick={() => onClose()}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-theme-tint hover:text-theme-accent cursor-pointer text-left"
              >
                <Tag className="h-3 w-3 text-cyan-400" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 9. Automatic Torrent Management */}
      <button
        onClick={() => setAutoManagement(!autoManagement)}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <div className="flex items-center gap-2.5">
          <Sliders className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Automatic Torrent Management</span>
        </div>
        {autoManagement && <Check className="h-3.5 w-3.5 text-theme-accent" />}
      </button>

      <div className="my-1 border-t border-ide-border/60" />

      {/* 10. Torrent options... */}
      <button
        onClick={() => onClose()}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <Sliders className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        <span>Torrent options...</span>
      </button>

      {/* 11. Super seeding mode */}
      <button
        onClick={() => setSuperSeeding(!superSeeding)}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <div className="flex items-center gap-2.5">
          <Zap className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          <span>Super seeding mode</span>
        </div>
        {superSeeding && <Check className="h-3.5 w-3.5 text-theme-accent" />}
      </button>

      <div className="my-1 border-t border-ide-border/60" />

      {/* 12. Preview file... */}
      <button
        onClick={handlePreviewFile}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <Eye className="h-3.5 w-3.5 text-sky-400 shrink-0" />
        <span>Preview file...</span>
      </button>

      <div className="my-1 border-t border-ide-border/60" />

      {/* 13. Force recheck */}
      <button
        onClick={() => {
          onOpenHashModal(download)
          onClose()
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <RotateCw className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span>Force recheck</span>
      </button>

      {/* 14. Force reannounce */}
      <button
        onClick={() => onClose()}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <RefreshCw className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <span>Force reannounce</span>
      </button>

      <div className="my-1 border-t border-ide-border/60" />

      {/* 15. Open destination folder */}
      <button
        onClick={handleOpenFolder}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <FolderOpen className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span>Open destination folder</span>
      </button>

      {/* 16. Copy > */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('copy')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <div className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors font-medium">
          <div className="flex items-center gap-2.5">
            <Copy className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Copy</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
        </div>

        {/* Copy Submenu */}
        {activeSubmenu === 'copy' && (
          <div className="absolute left-full top-0 w-48 bg-ide-surface border border-ide-border rounded-none shadow-2xl py-1 text-xs z-[160]">
            <button
              onClick={() => handleCopy(download.url)}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-theme-tint hover:text-theme-accent cursor-pointer text-left"
            >
              <Link className="h-3 w-3 text-cyan-400" />
              <span>Copy Download Link</span>
            </button>
            {(download.infoHash || download.checksum) && (
              <button
                onClick={() => handleCopy(download.infoHash || download.checksum || '')}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-theme-tint hover:text-theme-accent cursor-pointer text-left"
              >
                <Hash className="h-3 w-3 text-cyan-400" />
                <span>Copy Info Hash</span>
              </button>
            )}
            <button
              onClick={() => handleCopy(download.savePath)}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-theme-tint hover:text-theme-accent cursor-pointer text-left"
            >
              <Folder className="h-3 w-3 text-amber-400" />
              <span>Copy Save Path</span>
            </button>
            <button
              onClick={() => handleCopy(download.name)}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-theme-tint hover:text-theme-accent cursor-pointer text-left"
            >
              <Pencil className="h-3 w-3 text-sky-400" />
              <span>Copy Name</span>
            </button>
          </div>
        )}
      </div>

      {/* 17. Export .torrent... */}
      <button
        onClick={() => {
          window.api?.exportQueue()
          onClose()
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <FileDown className="h-3.5 w-3.5 text-purple-400 shrink-0" />
        <span>Export .torrent...</span>
      </button>
    </div>
  )
}
