import React, { useState, useCallback } from 'react'
import { DownloadCategory, DownloadPriority } from '../../../../engine/types'
import {
  X,
  Folder,
  FileUp,
  FolderOpen,
  GripHorizontal,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  FileText,
  Film,
  Image,
  Save,
  HardDrive,
  Settings2,
  Gauge,
  ArrowDownToLine,
  Link as LinkIcon,
  Upload
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

export const AddDownloadModal: React.FC<AddDownloadModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultSavePath,
  initialMode = 'link',
  initialUrl = ''
}) => {
  // Step: 1 = source picker, 2 = full options
  const [step, setStep] = useState<1 | 2>(1)
  const [url, setUrl] = useState(initialUrl)
  const [localFilePath, setLocalFilePath] = useState('')
  const [filename, setFilename] = useState('')

  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState(false)

  const [prevSyncKey, setPrevSyncKey] = useState('')
  const currentSyncKey = `${isOpen}-${initialMode}-${initialUrl}`

  if (currentSyncKey !== prevSyncKey) {
    setPrevSyncKey(currentSyncKey)
    if (isOpen) {
      setStep(1)
      setLocalFilePath('')
      setUrl(initialUrl || '')
      setFilename('')
      setIsDragOver(false)
    }
  }

  const [savePath, setSavePath] = useState(defaultSavePath)
  const [managementMode, setManagementMode] = useState<'manual' | 'automatic'>('manual')
  const [useIncompletePath, setUseIncompletePath] = useState(false)
  const [incompleteSavePath, setIncompleteSavePath] = useState(defaultSavePath + '\\Incomplete')
  const [rememberPath, setRememberPath] = useState(true)

  const [category, setCategory] = useState<DownloadCategory>('other')
  const [setAsDefaultCategory, setSetAsDefaultCategory] = useState(false)
  const [tagsInput, setTagsInput] = useState('grabbit')
  const [startTorrent, setStartTorrent] = useState(true)
  const [stopCondition, setStopCondition] = useState<'none' | 'metadata' | 'files'>('none')
  const [addToTopQueue, setAddToTopQueue] = useState(false)
  const [skipHashCheck, setSkipHashCheck] = useState(false)
  const [sequentialDownload, setSequentialDownload] = useState(false)
  const [firstLastPiecesFirst, setFirstLastPiecesFirst] = useState(false)
  const [contentLayout, setContentLayout] = useState<'original' | 'subfolder' | 'nosubfolder'>(
    'original'
  )
  const [priority, setPriority] = useState<DownloadPriority>('normal')
  const [threadCount, setThreadCount] = useState(8)
  const [neverShowAgain, setNeverShowAgain] = useState(false)

  const [fileFilter, setFileFilter] = useState('')
  const [isFolderExpanded, setIsFolderExpanded] = useState(true)

  const [filesTree, setFilesTree] = useState<FileTreeNode[]>([
    {
      id: 'f_root',
      name: 'House.of.the.Dragon.S03E07.1080p.x265-ELITE',
      size: 989347840,
      selected: true,
      priority: 'normal',
      type: 'folder',
      children: [
        {
          id: 'f_sub',
          name: 'Screens',
          size: 31562137,
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
          name: 'House.of.the.Dragon.S03E07.1080p.x265-ELITE.mkv',
          size: 957614080,
          selected: true,
          priority: 'normal',
          type: 'file'
        },
        {
          id: 'f_nfo',
          name: 'House.of.the.Dragon.S03E07.1080p.x265-ELITE.nfo',
          size: 1228,
          selected: true,
          priority: 'normal',
          type: 'file'
        }
      ]
    }
  ])

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  function buildFileTreeFromPaths(
    files: Array<{ name: string; path: string; size: number }>,
    rootName: string
  ): FileTreeNode[] {
    if (!files || files.length === 0) {
      return [
        {
          id: 'f_root',
          name: rootName || 'Torrent Payload',
          size: 0,
          selected: true,
          priority: 'normal',
          type: 'folder',
          children: []
        }
      ]
    }

    const rootNode: FileTreeNode = {
      id: 'f_root',
      name: rootName || 'Torrent Payload',
      size: files.reduce((acc, f) => acc + f.size, 0),
      selected: true,
      priority: 'normal',
      type: 'folder',
      children: []
    }

    files.forEach((file, index) => {
      const rawPath = file.path || file.name
      const parts = rawPath.replace(/\\/g, '/').split('/').filter(Boolean)

      if (parts.length > 1 && parts[0] === rootName) {
        parts.shift()
      }

      let currentLevel = rootNode.children!

      parts.forEach((part, partIndex) => {
        const isFile = partIndex === parts.length - 1
        const existing = currentLevel.find((n) => n.name === part)

        if (existing) {
          if (!isFile) {
            if (!existing.children) existing.children = []
            currentLevel = existing.children
          }
        } else {
          const newNode: FileTreeNode = {
            id: `node_${index}_${partIndex}`,
            name: part,
            size: isFile ? file.size : 0,
            selected: true,
            priority: 'normal',
            type: isFile ? 'file' : 'folder',
            ...(isFile ? {} : { children: [] })
          }
          currentLevel.push(newNode)
          if (!isFile) {
            currentLevel = newNode.children!
          }
        }
      })
    })

    function calcSize(node: FileTreeNode): number {
      if (node.type === 'file') return node.size
      if (node.children) {
        node.size = node.children.reduce((acc, child) => acc + calcSize(child), 0)
      }
      return node.size
    }

    calcSize(rootNode)
    return [rootNode]
  }

  const processSourceMetadata = useCallback(async (sourcePathOrUrl: string) => {
    if (!sourcePathOrUrl || !window.api?.parseTorrentMetadata) return
    try {
      const meta = await window.api.parseTorrentMetadata(sourcePathOrUrl)
      if (meta.name) setFilename(meta.name)
      if (meta.files && meta.files.length > 0) {
        const tree = buildFileTreeFromPaths(meta.files, meta.name)
        setFilesTree(tree)
      } else {
        setFilesTree([
          {
            id: 'f_root',
            name: meta.name || 'Torrent Payload',
            size: meta.totalSize || 0,
            selected: true,
            priority: 'normal',
            type: 'folder',
            children: []
          }
        ])
      }
    } catch (err) {
      console.warn('Failed to parse torrent metadata:', err)
    }
  }, [])

  const processFile = useCallback(
    (file: File): void => {
      // @ts-ignore - Electron file object has a path property
      const pathVal = file.path || file.name
      setLocalFilePath(pathVal)
      if (!filename) {
        setFilename(file.name.replace(/\.[^/.]+$/, ''))
      }
      processSourceMetadata(pathVal)
    },
    [filename, processSourceMetadata]
  )

  const handleDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const file = e.dataTransfer.files?.[0]
      if (
        file &&
        (file.name.endsWith('.torrent') ||
          file.name.endsWith('.meta') ||
          file.name.endsWith('.metalink'))
      ) {
        processFile(file)
        setStep(2)
      }
    },
    [processFile]
  )

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
      setStep(2)
    }
  }

  const handleBrowseSavePath = async (): Promise<void> => {
    if (window.api?.selectDirectory) {
      const selected = await window.api.selectDirectory(savePath)
      if (selected) setSavePath(selected)
    } else {
      const path = prompt('Enter save directory path:', savePath)
      if (path) setSavePath(path)
    }
  }

  const handleStep1Continue = (): void => {
    const source = url.trim() || localFilePath.trim()
    if (!source) return
    processSourceMetadata(source)
    setStep(2)
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const targetUrl = url.trim() || localFilePath.trim()
    if (!targetUrl) return

    onAdd({
      url: targetUrl,
      filename: filename.trim() || undefined,
      savePath: savePath.trim() || undefined,
      category,
      priority,
      threadCount
    })

    setUrl('')
    setLocalFilePath('')
    setFilename('')
    setStep(1)
    onClose()
  }

  const formatBytes = (bytes: number): string => {
    if (bytes <= 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const toggleSelectAll = (select: boolean): void => {
    const updateNodes = (nodes: FileTreeNode[]): FileTreeNode[] =>
      nodes.map((n) => ({
        ...n,
        selected: select,
        children: n.children ? updateNodes(n.children) : undefined
      }))
    setFilesTree((prev) => updateNodes(prev))
  }

  const toggleNodeSelect = (nodeId: string): void => {
    const updateNodes = (nodes: FileTreeNode[]): FileTreeNode[] =>
      nodes.map((n) => {
        if (n.id === nodeId) {
          const nextSel = !n.selected
          return {
            ...n,
            selected: nextSel,
            children: n.children ? updateNodesSelection(n.children, nextSel) : undefined
          }
        }
        if (n.children) {
          return { ...n, children: updateNodes(n.children) }
        }
        return n
      })

    const updateNodesSelection = (nodes: FileTreeNode[], select: boolean): FileTreeNode[] =>
      nodes.map((n) => ({
        ...n,
        selected: select,
        children: n.children ? updateNodesSelection(n.children, select) : undefined
      }))

    setFilesTree((prev) => updateNodes(prev))
  }

  const updateFilePriority = (nodeId: string, prio: DownloadPriority): void => {
    const updateNodes = (nodes: FileTreeNode[]): FileTreeNode[] =>
      nodes.map((n) => {
        if (n.id === nodeId) {
          return { ...n, priority: prio }
        }
        if (n.children) {
          return { ...n, children: updateNodes(n.children) }
        }
        return n
      })
    setFilesTree((prev) => updateNodes(prev))
  }

  const inputCls =
    'bg-ide-surface text-slate-100 text-xs px-2.5 py-1.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 focus:shadow-[0_0_0_1px_rgba(180,151,255,0.15)] font-mono transition'
  const selectCls = `${inputCls} cursor-pointer`
  const checkboxCls = 'accent-theme-accent cursor-pointer'

  const hasSource = !!(url.trim() || localFilePath.trim())

  // ─────────────────────────────────────────
  // STEP 1: Source Picker
  // ─────────────────────────────────────────
  if (step === 1) {
    return (
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 bg-slate-950/35 flex items-center justify-center p-4 select-none font-sans text-xs"
      >
        <div
          ref={modalRef}
          style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
          className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${
            isDragging ? 'transition-none duration-0' : ''
          } ${isBlinking ? 'animate-modal-blink' : ''}`}
        >
          {/* Title Bar */}
          <div
            onMouseDown={handleMouseDown}
            className="px-4 py-2.5 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
              <div className="p-1.5 bg-emerald-950/40 rounded-none border border-emerald-500/25">
                <FileUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold text-slate-100 text-xs block">Add Torrent</span>
                <span className="text-[10px] text-slate-500 block">
                  Step 1 — Select torrent source
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-none p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                isDragOver
                  ? 'border-emerald-400/60 bg-emerald-950/20'
                  : 'border-ide-border/60 bg-ide-bg/40 hover:border-slate-500/60 hover:bg-ide-bg/60'
              }`}
            >
              <label className="flex flex-col items-center gap-3 cursor-pointer w-full">
                <div
                  className={`p-4 rounded-full transition-all ${
                    isDragOver ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  <Upload
                    className={`h-8 w-8 transition-transform ${isDragOver ? 'scale-110 -translate-y-1' : ''}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-200">
                    {isDragOver ? 'Drop your torrent file here' : 'Drag & drop a .torrent file'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    or{' '}
                    <span className="text-theme-accent/80 font-medium underline underline-offset-2">
                      browse your computer
                    </span>
                  </p>
                </div>
                <input
                  type="file"
                  accept=".torrent,.meta,.metalink"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {localFilePath && (
                <div className="w-full mt-2 px-3 py-2 bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-300 truncate font-mono">
                    {localFilePath}
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-ide-border/50" />
              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                or paste a link
              </span>
              <div className="flex-1 h-px bg-ide-border/50" />
            </div>

            {/* Magnet / URL Input */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="h-3 w-3 text-theme-accent/60" />
                Magnet Link or URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="magnet:?xt=urn:btih:... or https://..."
                className={`w-full ${inputCls}`}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-5 pb-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/6 border border-ide-border/80 rounded-none transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStep1Continue}
              disabled={!hasSource}
              className={`px-5 py-1.5 text-xs font-bold rounded-none transition cursor-pointer flex items-center gap-1.5 ${
                hasSource
                  ? 'text-slate-950 bg-theme-accent hover:bg-theme-bright active:scale-[0.97] shadow-lg shadow-theme-accent/15'
                  : 'text-slate-500 bg-white/5 border border-ide-border cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────
  // STEP 2: Full Options
  // ─────────────────────────────────────────
  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/35 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh] ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* ─── Title Bar ─── */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-2.5 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <button
              type="button"
              onClick={() => setStep(1)}
              className="p-1 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-none transition cursor-pointer"
              title="Back to source selection"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="p-1.5 bg-emerald-950/40 rounded-none border border-emerald-500/25">
              <FileUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-100 text-xs truncate block">
                {filename || localFilePath || 'Add Torrent'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Step 2 — Configure options • {localFilePath || url || 'No source'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ─── Form ─── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {/* Source Summary Bar */}
          <div className="bg-ide-bg/80 px-3.5 py-2.5 border border-ide-border/80 flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-emerald-400/70 shrink-0" />
            <span className="text-xs text-slate-300 truncate font-mono flex-1">
              {localFilePath || url}
            </span>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[10px] text-theme-accent/70 hover:text-theme-accent font-medium shrink-0 transition cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* ─── 2-Column Layout ─── */}
          <div className="grid grid-cols-12 gap-3 flex-1 min-h-105">
            {/* LEFT: Settings */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
              {/* Save Path */}
              <fieldset className="border border-ide-border/60 p-3 rounded-none space-y-2.5 bg-ide-bg/30">
                <legend className="text-[10px] font-bold text-theme-accent/90 px-2 uppercase tracking-widest">
                  <HardDrive className="h-3 w-3 inline-block mr-1 -mt-0.5 opacity-70" />
                  Save Path
                </legend>

                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-slate-400 font-medium">Management:</label>
                  <select
                    value={managementMode}
                    onChange={(e) => setManagementMode(e.target.value as 'manual' | 'automatic')}
                    className={`${selectCls} w-28`}
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={savePath}
                    onChange={(e) => setSavePath(e.target.value)}
                    className={`flex-1 ${inputCls}`}
                  />
                  <button
                    type="button"
                    onClick={handleBrowseSavePath}
                    className="px-2.5 py-1.5 bg-white/4 hover:bg-white/8 border border-ide-border text-slate-300 hover:text-white rounded-none cursor-pointer transition"
                    title="Browse..."
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-amber-400/90" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 text-[11px] text-slate-400">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={rememberPath}
                      onChange={(e) => setRememberPath(e.target.checked)}
                      className={checkboxCls}
                    />
                    <span>Remember path</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={useIncompletePath}
                      onChange={(e) => setUseIncompletePath(e.target.checked)}
                      className={checkboxCls}
                    />
                    <span>Separate incomplete path</span>
                  </label>
                </div>

                {useIncompletePath && (
                  <div className="flex gap-1.5 pl-4 border-l-2 border-theme-accent/20">
                    <input
                      type="text"
                      value={incompleteSavePath}
                      onChange={(e) => setIncompleteSavePath(e.target.value)}
                      className={`flex-1 ${inputCls}`}
                    />
                    <button
                      type="button"
                      className="px-2 py-1 bg-white/4 hover:bg-white/8 border border-ide-border text-slate-300 rounded-none cursor-pointer transition"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-cyan-400/80" />
                    </button>
                  </div>
                )}
              </fieldset>

              {/* Torrent Options */}
              <fieldset className="border border-ide-border/60 p-3 rounded-none space-y-2.5 bg-ide-bg/30">
                <legend className="text-[10px] font-bold text-theme-accent/90 px-2 uppercase tracking-widest">
                  <Settings2 className="h-3 w-3 inline-block mr-1 -mt-0.5 opacity-70" />
                  Torrent Options
                </legend>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as DownloadCategory)}
                      className={`w-full ${selectCls}`}
                    >
                      <option value="other">Uncategorized</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="documents">Documents</option>
                      <option value="compressed">Compressed</option>
                      <option value="executables">Programs</option>
                      <option value="images">Images</option>
                      <option value="code">Source Code</option>
                    </select>

                    <label className="flex items-center gap-1.5 cursor-pointer pt-1 text-[10px] text-slate-500 hover:text-slate-400 transition">
                      <input
                        type="checkbox"
                        checked={setAsDefaultCategory}
                        onChange={(e) => setSetAsDefaultCategory(e.target.checked)}
                        className={checkboxCls}
                      />
                      <span>Set as default</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      Tags
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Add tags..."
                        className={`flex-1 ${inputCls}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const tag = prompt('Add tag:', tagsInput)
                          if (tag) setTagsInput(tag)
                        }}
                        className="px-1.5 py-1 bg-white/4 hover:bg-white/8 border border-ide-border text-slate-400 text-xs font-bold rounded-none cursor-pointer transition"
                      >
                        ···
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-500">Priority:</span>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as DownloadPriority)}
                        className={`${selectCls} text-[11px] px-1.5 py-0.5`}
                      >
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Start / Stop */}
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-ide-border/40">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={startTorrent}
                      onChange={(e) => setStartTorrent(e.target.checked)}
                      className={checkboxCls}
                    />
                    <span>Start torrent</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Stop when:</span>
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
                </div>

                {/* Checkbox Grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-slate-400 pt-1.5 border-t border-ide-border/40">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={addToTopQueue}
                      onChange={(e) => setAddToTopQueue(e.target.checked)}
                      className={checkboxCls}
                    />
                    <span>Add to top of queue</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={skipHashCheck}
                      onChange={(e) => setSkipHashCheck(e.target.checked)}
                      className={checkboxCls}
                    />
                    <span>Skip hash check</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={sequentialDownload}
                      onChange={(e) => setSequentialDownload(e.target.checked)}
                      className={checkboxCls}
                    />
                    <span>Sequential download</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                    <input
                      type="checkbox"
                      checked={firstLastPiecesFirst}
                      onChange={(e) => setFirstLastPiecesFirst(e.target.checked)}
                      className={checkboxCls}
                    />
                    <span>First &amp; last pieces first</span>
                  </label>
                </div>

                {/* Content Layout & Threads */}
                <div className="flex items-center justify-between pt-1.5 border-t border-ide-border/40 text-[11px]">
                  <span className="text-slate-500">Content layout:</span>
                  <select
                    value={contentLayout}
                    onChange={(e) =>
                      setContentLayout(e.target.value as 'original' | 'subfolder' | 'nosubfolder')
                    }
                    className={`${selectCls} text-[11px] px-1.5 py-0.5`}
                  >
                    <option value="original">Original</option>
                    <option value="subfolder">Create subfolder</option>
                    <option value="nosubfolder">Don&apos;t create subfolder</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-ide-border/40 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Gauge className="h-3 w-3 text-theme-accent/60" />
                    <span>Threads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="32"
                      value={threadCount}
                      onChange={(e) => setThreadCount(parseInt(e.target.value, 10))}
                      className="w-20 accent-theme-accent cursor-pointer"
                    />
                    <span className="font-mono text-theme-accent font-bold text-xs min-w-6 text-right">
                      {threadCount}
                    </span>
                  </div>
                </div>
              </fieldset>

              {/* Torrent Info */}
              <div className="border border-ide-border/40 p-3 rounded-none space-y-1 bg-ide-bg/20 font-mono text-[10px] text-slate-500">
                <div className="flex justify-between">
                  <span>Total Size:</span>
                  <span className="text-slate-300">
                    943.4 MiB <span className="text-slate-600">(Free: 31.34 GiB)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Info Hash v1:</span>
                  <span
                    className="text-theme-accent/70 truncate max-w-40"
                    title="004c2474042e2d9785bf0c097f69328e1a7fec86"
                  >
                    004c2474042e...1a7fec86
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Added:</span>
                  <span className="text-slate-400">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: File Selection Tree */}
            <div className="col-span-12 lg:col-span-7 flex flex-col bg-ide-bg/40 border border-ide-border/60 p-3 rounded-none">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-ide-border/50 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(true)}
                    className="px-2.5 py-1 bg-white/4 hover:bg-white/8 border border-ide-border text-slate-300 hover:text-white text-[11px] font-medium rounded-none cursor-pointer transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(false)}
                    className="px-2.5 py-1 bg-white/4 hover:bg-white/8 border border-ide-border text-slate-300 hover:text-white text-[11px] font-medium rounded-none cursor-pointer transition"
                  >
                    Select None
                  </button>
                </div>

                <div className="relative w-44">
                  <Search className="h-3 w-3 text-slate-600 absolute left-2 top-1.5" />
                  <input
                    type="text"
                    value={fileFilter}
                    onChange={(e) => setFileFilter(e.target.value)}
                    placeholder="Filter files..."
                    className="w-full bg-ide-surface text-slate-100 placeholder-slate-600 text-[11px] pl-7 pr-2 py-1 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 font-mono transition"
                  />
                </div>
              </div>

              {/* File Tree Table */}
              <div className="flex-1 overflow-x-auto overflow-y-auto border border-ide-border/50 bg-ide-surface/50">
                <table className="w-full border-collapse text-left font-sans text-xs">
                  <thead className="sticky top-0 z-10 bg-ide-bg border-b border-ide-border/60 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-2 w-8 text-center border-r border-ide-border/30">#</th>
                      <th className="p-2 border-r border-ide-border/30">Name</th>
                      <th className="p-2 w-24 text-right border-r border-ide-border/30">Size</th>
                      <th className="p-2 w-24 text-center">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ide-border/20 font-mono text-[12px]">
                    {filesTree.map((rootNode) => (
                      <React.Fragment key={rootNode.id}>
                        <tr className="bg-white/2 hover:bg-white/4 transition">
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={rootNode.selected}
                              onChange={() => toggleNodeSelect(rootNode.id)}
                              className={checkboxCls}
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setIsFolderExpanded(!isFolderExpanded)}
                                className="p-0.5 text-slate-500 hover:text-slate-300 transition"
                              >
                                {isFolderExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <Folder className="h-4 w-4 text-amber-400/80 shrink-0" />
                              <span className="font-medium text-slate-200 truncate max-w-xs">
                                {rootNode.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 text-right text-slate-400">
                            {formatBytes(rootNode.size)}
                          </td>
                          <td className="p-2 text-center text-slate-500 text-[11px] font-sans">
                            Normal
                          </td>
                        </tr>

                        {isFolderExpanded &&
                          rootNode.children?.map((child) => (
                            <React.Fragment key={child.id}>
                              <tr className="hover:bg-white/4 transition">
                                <td className="p-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={child.selected}
                                    onChange={() => toggleNodeSelect(child.id)}
                                    className={checkboxCls}
                                  />
                                </td>
                                <td className="p-2">
                                  <div className="flex items-center gap-1.5 pl-6">
                                    {child.type === 'folder' ? (
                                      <Folder className="h-3.5 w-3.5 text-amber-400/70 shrink-0" />
                                    ) : child.name.endsWith('.mkv') ? (
                                      <Film className="h-3.5 w-3.5 text-emerald-400/80 shrink-0" />
                                    ) : child.name.endsWith('.nfo') ? (
                                      <FileText className="h-3.5 w-3.5 text-amber-400/70 shrink-0" />
                                    ) : (
                                      <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                    )}
                                    <span className="text-slate-300 truncate max-w-xs">
                                      {child.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-2 text-right text-slate-400">
                                  {formatBytes(child.size)}
                                </td>
                                <td className="p-2 text-center">
                                  <select
                                    value={child.priority}
                                    onChange={(e) =>
                                      updateFilePriority(
                                        child.id,
                                        e.target.value as DownloadPriority
                                      )
                                    }
                                    className="bg-ide-bg border border-ide-border/50 text-slate-200 text-[11px] px-1 py-0.5 rounded-none font-sans cursor-pointer transition focus:outline-none focus:border-theme-accent/60"
                                  >
                                    <option value="high">High</option>
                                    <option value="normal">Normal</option>
                                    <option value="low">Low</option>
                                  </select>
                                </td>
                              </tr>

                              {child.type === 'folder' &&
                                child.children?.map((nested) => (
                                  <tr key={nested.id} className="hover:bg-white/4 transition">
                                    <td className="p-2 text-center">
                                      <input
                                        type="checkbox"
                                        checked={nested.selected}
                                        onChange={() => toggleNodeSelect(nested.id)}
                                        className={checkboxCls}
                                      />
                                    </td>
                                    <td className="p-2">
                                      <div className="flex items-center gap-1.5 pl-12">
                                        <Image className="h-3.5 w-3.5 text-yellow-400/70 shrink-0" />
                                        <span className="text-slate-400 truncate max-w-xs">
                                          {nested.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-right text-slate-400">
                                      {formatBytes(nested.size)}
                                    </td>
                                    <td className="p-2 text-center">
                                      <select
                                        value={nested.priority}
                                        onChange={(e) =>
                                          updateFilePriority(
                                            nested.id,
                                            e.target.value as DownloadPriority
                                          )
                                        }
                                        className="bg-ide-bg border border-ide-border/50 text-slate-200 text-[11px] px-1 py-0.5 rounded-none font-sans cursor-pointer transition focus:outline-none focus:border-theme-accent/60"
                                      >
                                        <option value="high">High</option>
                                        <option value="normal">Normal</option>
                                        <option value="low">Low</option>
                                      </select>
                                    </td>
                                  </tr>
                                ))}
                            </React.Fragment>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ─── Bottom Action Bar ─── */}
          <div className="flex items-center justify-between pt-2 border-t border-ide-border/50 shrink-0">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500 hover:text-slate-400 transition">
                <input
                  type="checkbox"
                  checked={neverShowAgain}
                  onChange={(e) => setNeverShowAgain(e.target.checked)}
                  className={checkboxCls}
                />
                <span>Don&apos;t show this dialog</span>
              </label>

              <span className="text-[10px] text-emerald-500/80 font-mono font-medium">
                ● Metadata OK
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.api?.exportQueue()
                }}
                className="px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/6 border border-ide-border/80 rounded-none cursor-pointer transition flex items-center gap-1.5"
              >
                <Save className="h-3 w-3 text-purple-400/70" />
                <span>Save .torrent</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/6 border border-ide-border/80 rounded-none transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-1.5 text-xs font-bold text-slate-950 bg-theme-accent hover:bg-theme-bright active:scale-[0.97] rounded-none shadow-lg shadow-theme-accent/15 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Add Torrent
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
