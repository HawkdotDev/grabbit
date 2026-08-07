import React, { useState } from 'react'
import { DownloadCategory, DownloadPriority } from '../../../../engine/types'
import {
  X,
  Minus,
  Square,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  GripHorizontal,
  HardDrive,
  Settings2,
  Info,
  Check,
  FileText
} from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface FileTreeNode {
  id: string
  name: string
  size: number
  selected: boolean
  priority: DownloadPriority
  type: 'file' | 'folder'
  children?: FileTreeNode[]
}

interface AddDownloadModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (args: {
    url: string
    filename?: string
    savePath?: string
    category?: DownloadCategory
    priority?: DownloadPriority
    threadCount?: number
  }) => void
  defaultSavePath: string
  initialMode?: 'link' | 'file'
  initialUrl?: string
}

// Exact yellow folder icon matching image
const FolderIcon: React.FC = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6.5C3 5.67 3.67 5 4.5 5H9.08C9.55 5 9.99 5.22 10.27 5.59L11.5 7.23C11.78 7.6 12.22 7.82 12.69 7.82H19.5C20.33 7.82 21 8.49 21 9.32V17.5C21 18.33 20.33 19 19.5 19H4.5C3.67 19 3 18.33 3 17.5V6.5Z"
      fill="#eab308"
    />
    <path
      d="M3 9.5C3 8.67 3.67 8 4.5 8H19.5C20.33 8 21 8.67 21 9.5V17.5C21 18.33 20.33 19 19.5 19H4.5C3.67 19 3 18.33 3 17.5V9.5Z"
      fill="#facc15"
    />
  </svg>
)

// Exact VLC Traffic Cone Icon matching image
const VlcConeIcon: React.FC = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M10.8 2.8C11.3 1.8 12.7 1.8 13.2 2.8L14.7 6.2H9.3L10.8 2.8Z" fill="#f97316" />
    <path d="M8.8 7.5L7.4 10.8H16.6L15.2 7.5H8.8Z" fill="#ffffff" />
    <path d="M6.9 12H17.1L15.8 15H8.2L6.9 12Z" fill="#f97316" />
    <path d="M7.7 16H16.3L15.2 18.5H8.8L7.7 16Z" fill="#ffffff" />
    <path
      d="M3 21C3 20.45 3.45 20 4 20H20C20.55 20 21 20.45 21 21C21 21.55 20.55 22 20 22H4C3.45 22 3 21.55 3 21Z"
      fill="#ea580c"
    />
    <path d="M5.5 19.5L6.5 17.2H17.5L18.5 19.5H5.5Z" fill="#ea580c" />
  </svg>
)

// Exact Blue Document NFO Icon matching image
const NfoDocIcon: React.FC = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="3" width="16" height="18" rx="2" fill="#3b82f6" />
    <path d="M8 8H16M8 12H16M8 16H13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="15.5" cy="15.5" r="2.5" fill="#60a5fa" />
    <path
      d="M15.5 14.5V16.5M15.5 13.5H15.51"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

export const AddDownloadModal: React.FC<AddDownloadModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultSavePath,
  initialUrl = ''
}) => {
  const [url] = useState(
    initialUrl ||
      'magnet:?xt=urn:btih:004c2474042e2d9785bf0c097f69328e1a7fec86&dn=House.of.the.Dragon.S03E07.1080p.x265-ELiTE'
  )
  const [filename] = useState('House.of.the.Dragon.S03E07.1080p.x265-ELiTE')
  const [savePath, setSavePath] = useState(defaultSavePath || 'C:\\Users\\dwaip\\Videos')
  const [managementMode, setManagementMode] = useState<'manual' | 'automatic'>('manual')
  const [useIncompletePath, setUseIncompletePath] = useState(false)
  const [incompleteSavePath, setIncompleteSavePath] = useState(
    (defaultSavePath || 'C:\\Users\\dwaip\\Videos') + '\\Incomplete'
  )
  const [rememberPath, setRememberPath] = useState(true)

  const [category, setCategory] = useState<DownloadCategory>('video')
  const [setAsDefaultCategory, setSetAsDefaultCategory] = useState(false)
  const [tagsInput, setTagsInput] = useState('')
  const [startTorrent, setStartTorrent] = useState(true)
  const [stopCondition, setStopCondition] = useState<'none' | 'metadata' | 'files'>('none')
  const [addToTopQueue, setAddToTopQueue] = useState(false)
  const [skipHashCheck, setSkipHashCheck] = useState(false)
  const [sequentialDownload, setSequentialDownload] = useState(false)
  const [firstLastPiecesFirst, setFirstLastPiecesFirst] = useState(false)
  const [contentLayout, setContentLayout] = useState<'original' | 'subfolder' | 'nosubfolder'>(
    'original'
  )
  const [neverShowAgain, setNeverShowAgain] = useState(false)

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    f_root: true,
    f_sub: false
  })

  // Exact file structure matching user's image
  const [filesTree, setFilesTree] = useState<FileTreeNode[]>([
    {
      id: 'f_root',
      name: 'House.of.the.Dragon.S03E07.1080p.x265-ELiTE',
      size: 989347840, // 943.4 MiB
      selected: true,
      priority: 'normal',
      type: 'folder',
      children: [
        {
          id: 'f_sub',
          name: 'Screens',
          size: 31562137, // 30.1 MiB
          selected: true,
          priority: 'normal',
          type: 'folder',
          children: [
            {
              id: 'f_screen1',
              name: 'screenshot1.png',
              size: 15781068,
              selected: true,
              priority: 'normal',
              type: 'file'
            },
            {
              id: 'f_screen2',
              name: 'screenshot2.png',
              size: 15781069,
              selected: true,
              priority: 'normal',
              type: 'file'
            }
          ]
        },
        {
          id: 'f_mkv',
          name: 'House.of.the.Dragon.S03E07.1080p.x265-ELiTE.mkv',
          size: 957614080, // 913.2 MiB
          selected: true,
          priority: 'normal',
          type: 'file'
        },
        {
          id: 'f_nfo',
          name: 'House.of.the.Dragon.S03E07.1080p.x265-ELiTE.nfo',
          size: 1228, // 1.2 KiB
          selected: true,
          priority: 'normal',
          type: 'file'
        }
      ]
    }
  ])

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  const handleBrowseSavePath = async (): Promise<void> => {
    if (window.api?.selectDirectory) {
      const selected = await window.api.selectDirectory(savePath)
      if (selected) setSavePath(selected)
    }
  }

  const handleBrowseIncompletePath = async (): Promise<void> => {
    if (window.api?.selectDirectory) {
      const selected = await window.api.selectDirectory(incompleteSavePath)
      if (selected) setIncompleteSavePath(selected)
    }
  }

  const toggleFolder = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation()
    setExpandedFolders((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const toggleNodeSelect = (nodeId: string): void => {
    const updateRecursive = (nodes: FileTreeNode[]): FileTreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          const nextSelected = !node.selected
          const updateChildren = (children?: FileTreeNode[]): FileTreeNode[] | undefined => {
            if (!children) return undefined
            return children.map((c) => ({
              ...c,
              selected: nextSelected,
              children: updateChildren(c.children)
            }))
          }
          return {
            ...node,
            selected: nextSelected,
            children: updateChildren(node.children)
          }
        }
        if (node.children) {
          return {
            ...node,
            children: updateRecursive(node.children)
          }
        }
        return node
      })
    }
    setFilesTree((prev) => updateRecursive(prev))
  }

  const updateFilePriority = (nodeId: string, prio: DownloadPriority): void => {
    const updateRecursive = (nodes: FileTreeNode[]): FileTreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, priority: prio }
        }
        if (node.children) {
          return { ...node, children: updateRecursive(node.children) }
        }
        return node
      })
    }
    setFilesTree((prev) => updateRecursive(prev))
  }

  const formatBytes = (bytes: number): string => {
    if (bytes <= 0) return '0 B'
    const k = 1024
    if (bytes < k) return `${bytes} B`
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KiB`
    if (bytes < k * k * k) return `${(bytes / (k * k)).toFixed(1)} MiB`
    return `${(bytes / (k * k * k)).toFixed(1)} GiB`
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onAdd({
      url: url || 'magnet:?xt=urn:btih:004c2474042e2d9785bf0c097f69328e1a7fec86',
      filename,
      savePath,
      category,
      priority: 'normal',
      threadCount: 8
    })
    onClose()
  }

  if (!isOpen) return null

  const inputCls =
    'bg-ide-bg text-slate-100 text-xs px-2.5 py-1.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-sans transition w-full'
  const selectCls =
    'bg-ide-bg text-slate-100 text-xs px-2 py-1 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent cursor-pointer font-sans transition'
  const fieldsetCls = 'border border-ide-border p-3 rounded-none bg-ide-bg/30 relative space-y-2'
  const legendCls =
    'text-[10px] font-bold text-theme-accent uppercase tracking-wider px-1.5 select-none -ml-1'

  // Custom rounded-rectangle blue checkbox matching reference image
  const renderCheckbox = (checked: boolean, onChange: () => void): React.JSX.Element => (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={`h-4 w-4 rounded-[4px] border flex items-center justify-center cursor-pointer select-none transition shrink-0 ${
        checked
          ? 'bg-[#3b82f6] border-[#3b82f6] text-white shadow-sm'
          : 'bg-[#262626] border-[#4a4a4a] hover:border-slate-400'
      }`}
    >
      {checked && <Check className="h-3 w-3 stroke-[3]" />}
    </div>
  )

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Themed Window Header with Drag Grip */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-2.5 bg-linear-to-r from-ide-surface via-ide-bg to-ide-surface border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <GripHorizontal className="h-4 w-4 text-slate-500 shrink-0" />
            <div className="p-1.5 bg-theme-tint text-theme-accent rounded-none border border-theme-accent/20 flex items-center justify-center font-bold text-[10px] shrink-0">
              qb
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-100 text-xs truncate block">{filename}</span>
              <span className="text-[10px] text-slate-400 block truncate">
                Configure torrent payload, destination storage, and individual file selection
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 style-no-drag shrink-0">
            <button
              type="button"
              className="h-6 w-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="h-6 w-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
            >
              <Square className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-6 w-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/80 rounded-none transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Form: 2-Column Split matching the reference layout */}
        <form
          onSubmit={handleSubmit}
          className="p-4 flex flex-col gap-3.5 overflow-y-auto bg-ide-surface"
        >
          <div className="grid grid-cols-12 gap-3.5 items-start">
            {/* ─── LEFT PANEL (Torrent Settings & Options) ─── */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
              {/* Torrent Management Mode */}
              <div className="flex items-center justify-between text-xs bg-ide-bg/50 px-3 py-2 border border-ide-border">
                <label className="text-slate-300 font-semibold">Torrent Management Mode:</label>
                <select
                  value={managementMode}
                  onChange={(e) => setManagementMode(e.target.value as 'manual' | 'automatic')}
                  className={`${selectCls} w-32`}
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>

              {/* Save at Fieldset */}
              <fieldset className={fieldsetCls}>
                <legend className={legendCls}>
                  <HardDrive className="h-3 w-3 inline mr-1 -mt-0.5" />
                  Save at
                </legend>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={savePath}
                      onChange={(e) => setSavePath(e.target.value)}
                      className={`flex-1 font-mono ${inputCls}`}
                    />
                    <select
                      className={`${selectCls} px-1.5 text-center`}
                      onChange={(e) => setSavePath(e.target.value)}
                      value=""
                      title="Quick Save Locations"
                    >
                      <option value="" disabled hidden></option>
                      <option value="C:\Users\dwaip\Downloads">Downloads</option>
                      <option value="C:\Users\dwaip\Videos">Videos</option>
                      <option value="D:\Torrents">Torrents</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleBrowseSavePath}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-ide-border text-slate-200 hover:text-white rounded-none cursor-pointer transition flex items-center justify-center shrink-0"
                      title="Browse Save Path"
                    >
                      <FolderOpen className="h-4 w-4 text-theme-bright" />
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useIncompletePath}
                        onChange={(e) => setUseIncompletePath(e.target.checked)}
                        className="h-4 w-4 accent-theme-accent cursor-pointer rounded-none"
                      />
                      <span>Use another path for incomplete torrent</span>
                    </label>

                    {useIncompletePath && (
                      <div className="flex items-center gap-2 pl-6">
                        <input
                          type="text"
                          value={incompleteSavePath}
                          onChange={(e) => setIncompleteSavePath(e.target.value)}
                          className={`flex-1 font-mono ${inputCls}`}
                        />
                        <button
                          type="button"
                          onClick={handleBrowseIncompletePath}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-ide-border text-slate-200 rounded-none cursor-pointer transition"
                        >
                          <FolderOpen className="h-4 w-4 text-cyan-400" />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end pt-0.5">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberPath}
                          onChange={(e) => setRememberPath(e.target.checked)}
                          className="h-4 w-4 accent-theme-accent cursor-pointer rounded-none"
                        />
                        <span>Remember last used save path</span>
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Torrent options Fieldset */}
              <fieldset className={fieldsetCls}>
                <legend className={legendCls}>
                  <Settings2 className="h-3 w-3 inline mr-1 -mt-0.5" />
                  Torrent options
                </legend>
                <div className="space-y-2.5 text-xs">
                  {/* Category */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-slate-300 font-medium">Category:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as DownloadCategory)}
                      className={`${selectCls} flex-1 max-w-[200px]`}
                    >
                      <option value="other">Uncategorized</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="documents">Documents</option>
                      <option value="compressed">Compressed</option>
                      <option value="executables">Programs</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setAsDefaultCategory}
                        onChange={(e) => setSetAsDefaultCategory(e.target.checked)}
                        className="h-4 w-4 accent-theme-accent cursor-pointer rounded-none"
                      />
                      <span>Set as default category</span>
                    </label>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-slate-300 font-medium">Tags:</label>
                    <div className="flex-1 flex gap-1.5 items-center">
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Click [...] button to add/remove tags."
                        className={`flex-1 ${inputCls} placeholder:text-slate-500`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const tag = prompt('Add tag:', tagsInput)
                          if (tag !== null) setTagsInput(tag)
                        }}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-ide-border text-slate-300 font-bold rounded-none cursor-pointer transition"
                      >
                        ...
                      </button>
                    </div>
                  </div>

                  {/* Checkbox Rows Matching Reference Layout */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1 border-t border-ide-border/50">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={startTorrent}
                        onChange={(e) => setStartTorrent(e.target.checked)}
                        className="h-4 w-4 accent-theme-accent cursor-pointer rounded-none"
                      />
                      <span>Start torrent</span>
                    </label>

                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-slate-400 text-[11px]">Stop condition:</span>
                      <select
                        value={stopCondition}
                        onChange={(e) =>
                          setStopCondition(e.target.value as 'none' | 'metadata' | 'files')
                        }
                        className={`${selectCls} text-[11px] px-1.5 py-0.5`}
                      >
                        <option value="none">None</option>
                        <option value="metadata">Metadata received</option>
                        <option value="files">Files checked</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={addToTopQueue}
                        onChange={(e) => setAddToTopQueue(e.target.checked)}
                        className="h-4 w-4 accent-theme-accent cursor-pointer rounded-none"
                      />
                      <span>Add to top of queue</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={skipHashCheck}
                        onChange={(e) => setSkipHashCheck(e.target.checked)}
                        className="h-4 w-4 accent-theme-accent cursor-pointer rounded-none"
                      />
                      <span>Skip hash check</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={sequentialDownload}
                        onChange={(e) => setSequentialDownload(e.target.checked)}
                        className="h-4 w-4 accent-theme-accent cursor-pointer rounded-none"
                      />
                      <span>Download in sequential order</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={firstLastPiecesFirst}
                        onChange={(e) => setFirstLastPiecesFirst(e.target.checked)}
                        className="h-4 w-4 accent-theme-accent cursor-pointer rounded-none"
                      />
                      <span>Download first and last pieces first</span>
                    </label>
                  </div>

                  {/* Content layout */}
                  <div className="flex items-center justify-between pt-1 border-t border-ide-border/50">
                    <span className="text-slate-300 font-medium">Content layout:</span>
                    <select
                      value={contentLayout}
                      onChange={(e) =>
                        setContentLayout(e.target.value as 'original' | 'subfolder' | 'nosubfolder')
                      }
                      className={`${selectCls} w-44`}
                    >
                      <option value="original">Original</option>
                      <option value="subfolder">Create subfolder</option>
                      <option value="nosubfolder">Don't create subfolder</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Torrent information Fieldset */}
              <fieldset className={fieldsetCls}>
                <legend className={legendCls}>
                  <Info className="h-3 w-3 inline mr-1 -mt-0.5" />
                  Torrent information
                </legend>
                <div className="space-y-1.5 text-xs text-slate-300 font-sans">
                  <div className="flex justify-between">
                    <span className="w-24 text-slate-400">Size:</span>
                    <span className="text-slate-200 font-mono">
                      943.4 MiB{' '}
                      <span className="text-slate-500 font-sans">
                        (Free space on disk: 31.34 GiB)
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-24 text-slate-400">Date:</span>
                    <span className="text-slate-300">Not available</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-24 text-slate-400 shrink-0">Info hash v1:</span>
                    <span className="font-mono text-[11px] text-theme-bright truncate select-all">
                      004c2474042e2d9785bf0c097f69328e1a7fec86
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-24 text-slate-400">Info hash v2:</span>
                    <span className="text-slate-400">N/A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-24 text-slate-400">Comment:</span>
                    <span className="text-slate-400"></span>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* ─── RIGHT PANEL: File Browser (Exact Match to Image) ─── */}
            <div className="col-span-12 lg:col-span-7 flex flex-col bg-[#242424] border border-[#333333] rounded-none h-[490px]">
              {/* Header Row: Name (with caret), Total Size, Download Priority */}
              <div className="grid grid-cols-12 bg-[#202020] border-b border-[#303030] text-[12px] font-normal text-[#d1d5db] px-3 py-2 select-none shrink-0">
                <div className="col-span-7 flex items-center justify-between pr-4">
                  <span>Name</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#9ca3af]" />
                </div>
                <div className="col-span-2 text-right pr-2">Total Size</div>
                <div className="col-span-3 text-left pl-3">Download Priority</div>
              </div>

              {/* File Browser Canvas (Exact match to screenshot) */}
              <div className="flex-1 overflow-y-auto overflow-x-auto text-[13px] font-sans bg-[#2b2b2b] p-2 space-y-1">
                {filesTree.map((rootNode) => (
                  <div key={rootNode.id} className="space-y-1">
                    {/* Row 1: Root Folder (House.of.the.Dragon.S03E07.1080p.x265-ELiTE) */}
                    <div className="grid grid-cols-12 items-center py-1 px-1 hover:bg-[#383838] transition cursor-pointer select-none rounded-[2px]">
                      <div className="col-span-7 flex items-center gap-2 overflow-hidden">
                        <button
                          type="button"
                          onClick={(e) => toggleFolder(rootNode.id, e)}
                          className="p-0.5 text-[#d1d5db] hover:text-white"
                        >
                          {expandedFolders[rootNode.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        {renderCheckbox(rootNode.selected, () => toggleNodeSelect(rootNode.id))}
                        <FolderIcon />
                        <span className="truncate text-[#f3f4f6] font-normal text-[13px]">
                          {rootNode.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-right pr-2 text-[13px] text-[#e5e7eb] font-normal">
                        {formatBytes(rootNode.size)}
                      </div>
                      <div className="col-span-3 text-left pl-3">
                        <span className="text-[#f3f4f6] text-[13px]">Normal</span>
                      </div>
                    </div>

                    {/* Children Items */}
                    {expandedFolders[rootNode.id] &&
                      rootNode.children?.map((child) => (
                        <React.Fragment key={child.id}>
                          {child.type === 'folder' ? (
                            // Row 2: Subfolder (Screens)
                            <div className="grid grid-cols-12 items-center py-1 px-1 hover:bg-[#383838] transition cursor-pointer select-none rounded-[2px] pl-6">
                              <div className="col-span-7 flex items-center gap-2 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={(e) => toggleFolder(child.id, e)}
                                  className="p-0.5 text-[#d1d5db] hover:text-white"
                                >
                                  {expandedFolders[child.id] ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                {renderCheckbox(child.selected, () => toggleNodeSelect(child.id))}
                                <FolderIcon />
                                <span className="truncate text-[#f3f4f6] font-normal text-[13px]">
                                  {child.name}
                                </span>
                              </div>
                              <div className="col-span-2 text-right pr-2 text-[13px] text-[#e5e7eb] font-normal">
                                {formatBytes(child.size)}
                              </div>
                              <div className="col-span-3 text-left pl-3">
                                <span className="text-[#f3f4f6] text-[13px]">Normal</span>
                              </div>
                            </div>
                          ) : child.name.endsWith('.mkv') ? (
                            // Row 3: Video File (.mkv with VLC Cone Icon)
                            <div className="grid grid-cols-12 items-center py-1 px-1 hover:bg-[#383838] transition cursor-pointer select-none rounded-[2px] pl-10">
                              <div className="col-span-7 flex items-center gap-2 overflow-hidden">
                                {renderCheckbox(child.selected, () => toggleNodeSelect(child.id))}
                                <VlcConeIcon />
                                <span className="truncate text-[#f3f4f6] font-normal text-[13px]">
                                  {child.name}
                                </span>
                              </div>
                              <div className="col-span-2 text-right pr-2 text-[13px] text-[#e5e7eb] font-normal">
                                {formatBytes(child.size)}
                              </div>
                              <div className="col-span-3 text-left pl-3">
                                <select
                                  value={child.priority}
                                  onChange={(e) =>
                                    updateFilePriority(child.id, e.target.value as DownloadPriority)
                                  }
                                  className="bg-transparent text-[#f3f4f6] text-[13px] focus:outline-none cursor-pointer"
                                >
                                  <option value="normal" className="bg-[#242424]">
                                    Normal
                                  </option>
                                  <option value="high" className="bg-[#242424]">
                                    High
                                  </option>
                                  <option value="low" className="bg-[#242424]">
                                    Low
                                  </option>
                                  <option value="ignore" className="bg-[#242424]">
                                    Do not download
                                  </option>
                                </select>
                              </div>
                            </div>
                          ) : (
                            // Row 4: Document File (.nfo with Blue Doc Icon)
                            <div className="grid grid-cols-12 items-center py-1 px-1 hover:bg-[#383838] transition cursor-pointer select-none rounded-[2px] pl-10">
                              <div className="col-span-7 flex items-center gap-2 overflow-hidden">
                                {renderCheckbox(child.selected, () => toggleNodeSelect(child.id))}
                                <NfoDocIcon />
                                <span className="truncate text-[#f3f4f6] font-normal text-[13px]">
                                  {child.name}
                                </span>
                              </div>
                              <div className="col-span-2 text-right pr-2 text-[13px] text-[#e5e7eb] font-normal">
                                {formatBytes(child.size)}
                              </div>
                              <div className="col-span-3 text-left pl-3">
                                <span className="text-[#f3f4f6] text-[13px]">Normal</span>
                              </div>
                            </div>
                          )}

                          {/* Nested Screen Images (if Screens folder is expanded) */}
                          {child.type === 'folder' &&
                            expandedFolders[child.id] &&
                            child.children?.map((nested) => (
                              <div
                                key={nested.id}
                                className="grid grid-cols-12 items-center py-1 px-1 hover:bg-[#383838] transition cursor-pointer select-none rounded-[2px] pl-14"
                              >
                                <div className="col-span-7 flex items-center gap-2 overflow-hidden">
                                  {renderCheckbox(nested.selected, () =>
                                    toggleNodeSelect(nested.id)
                                  )}
                                  <FileText className="h-4 w-4 text-[#38bdf8] shrink-0" />
                                  <span className="truncate text-[#e5e7eb] font-normal text-[13px]">
                                    {nested.name}
                                  </span>
                                </div>
                                <div className="col-span-2 text-right pr-2 text-[13px] text-[#e5e7eb] font-normal">
                                  {formatBytes(nested.size)}
                                </div>
                                <div className="col-span-3 text-left pl-3">
                                  <span className="text-[#f3f4f6] text-[13px]">Normal</span>
                                </div>
                              </div>
                            ))}
                        </React.Fragment>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Bottom Footer Action Bar ─── */}
          <div className="pt-3 flex items-center justify-between border-t border-ide-border text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={neverShowAgain}
                  onChange={(e) => setNeverShowAgain(e.target.checked)}
                  className="h-4 w-4 accent-theme-accent cursor-pointer rounded-none"
                />
                <span>Never show again</span>
              </label>

              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                Metadata retrieval complete
              </span>

              <button
                type="button"
                onClick={() => {
                  window.api?.exportQueue()
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-ide-border text-slate-300 hover:text-white rounded-none cursor-pointer transition"
              >
                Save as .torrent file...
              </button>
            </div>

            {/* Themed Primary OK & Cancel Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="submit"
                className="px-6 py-2 bg-theme-accent hover:bg-theme-bright text-slate-950 font-bold text-xs rounded-none cursor-pointer transition shadow-lg shadow-theme-accent/20 active:scale-[0.98] flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>OK</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-ide-border text-slate-300 hover:text-white font-medium text-xs rounded-none cursor-pointer transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
