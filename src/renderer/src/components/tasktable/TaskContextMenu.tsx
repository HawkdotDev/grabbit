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
  availableTags?: string[]
  onClose: () => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onOpenHashModal: (download: DownloadItem) => void
  onOpenTrackersModal?: (download: DownloadItem) => void
  onOpenTorrentOptionsModal?: (download: DownloadItem) => void
  onOpenRenameModal?: (download: DownloadItem) => void
  onUpdateDownload?: (id: string, updates: Partial<DownloadItem>) => void
}

export const TaskContextMenu: React.FC<TaskContextMenuProps> = ({
  x,
  y,
  download,
  availableTags = [],
  onClose,
  onPause,
  onResume,
  onCancel,
  onOpenHashModal,
  onOpenTrackersModal,
  onOpenTorrentOptionsModal,
  onOpenRenameModal,
  onUpdateDownload
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeSubmenu, setActiveSubmenu] = useState<'category' | 'tags' | 'copy' | null>(null)
  const [autoManagement, setAutoManagement] = useState(
    () => download.managementMode !== 'manual'
  )
  const [superSeeding, setSuperSeeding] = useState(() => download.superSeeding ?? false)
  const [customTagInput, setCustomTagInput] = useState('')
  const [showCustomTagInput, setShowCustomTagInput] = useState(false)

  const handleToggleSuperSeeding = async (): Promise<void> => {
    const nextVal = !superSeeding
    setSuperSeeding(nextVal)
    if (window.api?.updateTorrentOptions) {
      await window.api.updateTorrentOptions(download.id, { superSeeding: nextVal })
    }
    onUpdateDownload?.(download.id, { superSeeding: nextVal })
  }

  const handleToggleAutoManagement = async (): Promise<void> => {
    const nextMode: 'manual' | 'automatic' = autoManagement ? 'manual' : 'automatic'
    setAutoManagement(!autoManagement)
    if (window.api?.updateTorrentOptions) {
      await window.api.updateTorrentOptions(download.id, { managementMode: nextMode })
    }
    onUpdateDownload?.(download.id, { managementMode: nextMode })
  }

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
    onClose()
    if (onOpenRenameModal) {
      onOpenRenameModal(download)
    }
  }

  const handleSetLocation = async (): Promise<void> => {
    onClose()
    if (window.api?.selectDirectory) {
      const chosenPath = await window.api.selectDirectory(download.savePath)
      if (chosenPath) {
        if (window.api?.setDownloadLocation) {
          await window.api.setDownloadLocation(download.id, chosenPath)
        }
        onUpdateDownload?.(download.id, { savePath: chosenPath })
      }
    }
  }

  const handleCopy = (text: string): void => {
    if (text) window.api?.copyToClipboard(text)
    onClose()
  }

  const handleForceReannounce = async (): Promise<void> => {
    if (window.api?.reannounceTorrent) {
      await window.api.reannounceTorrent(download.id)
    }
    onClose()
  }

  const handleToggleTag = async (tag: string): Promise<void> => {
    const cleanTag = tag.trim()
    if (!cleanTag) return

    if (window.api?.toggleDownloadTag) {
      await window.api.toggleDownloadTag(download.id, cleanTag)
    }

    const current = download.tags || []
    const nextTags = current.includes(cleanTag)
      ? current.filter((t) => t !== cleanTag)
      : [...current, cleanTag]
    onUpdateDownload?.(download.id, { tags: nextTags })
  }

  const handleAddCustomTag = (e: React.FormEvent): void => {
    e.preventDefault()
    if (customTagInput.trim()) {
      handleToggleTag(customTagInput.trim())
      setCustomTagInput('')
      setShowCustomTagInput(false)
    }
  }

  const defaultTagOptions = ['work', 'iso', 'media', 'software', 'archives', 'grabbit', 'untagged']
  const allTagOptions = Array.from(
    new Set([...defaultTagOptions, ...(download.tags || []), ...availableTags])
  )

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
      className="fixed z-150 w-64 bg-ide-surface/95 backdrop-blur-md border border-ide-border rounded-none shadow-2xl py-1 text-xs select-none animate-in fade-in zoom-in-95 duration-100 font-sans text-slate-200"
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
          onClose()
          if (onOpenTrackersModal) {
            onOpenTrackersModal(download)
          } else {
            onOpenHashModal(download)
          }
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
          <div className="absolute left-full top-0 w-44 bg-ide-surface border border-ide-border rounded-none shadow-2xl py-1 text-xs z-160">
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
          <div className="absolute left-full top-0 w-48 bg-ide-surface border border-ide-border rounded-none shadow-2xl py-1 text-xs z-160 max-h-64 overflow-y-auto">
            {allTagOptions.map((tag) => {
              const isAssigned = (download.tags || []).includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-theme-tint hover:text-theme-accent cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Tag className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{tag}</span>
                  </div>
                  {isAssigned && <Check className="h-3.5 w-3.5 text-theme-accent shrink-0" />}
                </button>
              )
            })}

            <div className="border-t border-ide-border/60 my-1" />

            {showCustomTagInput ? (
              <form onSubmit={handleAddCustomTag} className="p-1.5 flex gap-1">
                <input
                  type="text"
                  autoFocus
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  placeholder="New tag..."
                  className="w-full bg-ide-bg text-slate-100 text-[11px] px-1.5 py-1 border border-ide-border focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-theme-accent text-slate-950 font-bold text-[10px] cursor-pointer"
                >
                  Add
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomTagInput(true)}
                className="w-full px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 cursor-pointer text-left font-mono text-[11px]"
              >
                + Add Custom Tag...
              </button>
            )}
          </div>
        )}
      </div>

      {/* 9. Automatic Torrent Management */}
      <button
        onClick={handleToggleAutoManagement}
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
        onClick={() => {
          onClose()
          if (onOpenTorrentOptionsModal) {
            onOpenTorrentOptionsModal(download)
          }
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-theme-tint hover:text-theme-accent cursor-pointer transition-colors text-left font-medium"
      >
        <Sliders className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        <span>Torrent options...</span>
      </button>

      {/* 11. Super seeding mode */}
      <button
        onClick={handleToggleSuperSeeding}
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
        onClick={handleForceReannounce}
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
          <div className="absolute left-full top-0 w-48 bg-ide-surface border border-ide-border rounded-none shadow-2xl py-1 text-xs z-160">
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
        onClick={async () => {
          if (window.api?.exportTorrentFile) {
            await window.api.exportTorrentFile(download.id)
          }
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
