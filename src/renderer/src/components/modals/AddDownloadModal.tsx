import React, { useState } from 'react'
import { DownloadCategory, DownloadPriority } from '../../../../engine/types'
import {
  X,
  Minus,
  Square,
  Folder,
  FolderOpen,
  Search,
  ChevronRight,
  ChevronDown,
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

export const AddDownloadModal: React.FC<AddDownloadModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultSavePath,
  initialUrl = ''
}) => {
  const [url] = useState(
    initialUrl ||
      'magnet:?xt=urn:btih:004c2474042e2d9785bf0c097f69328e1a7fec86&dn=House.of.the.Dragon.S03E07.1080p.x265-ELITE'
  )
  const [filename] = useState('House.of.the.Dragon.S03E07.1080p.x265-ELITE')
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

  const [fileFilter, setFileFilter] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    f_root: true,
    f_sub: false
  })

  // Exact file structure matching user's image
  const [filesTree, setFilesTree] = useState<FileTreeNode[]>([
    {
      id: 'f_root',
      name: 'House.of.the.Dragon.S03E07.1080p.x265-ELITE',
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
          name: 'House.of.the.Dragon.S03E07.1080p.x265-ELITE.mkv',
          size: 957614080, // 913.2 MiB
          selected: true,
          priority: 'normal',
          type: 'file'
        },
        {
          id: 'f_nfo',
          name: 'House.of.the.Dragon.S03E07.1080p.x265-ELITE.nfo',
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

  const toggleSelectAll = (select: boolean): void => {
    const updateRecursive = (nodes: FileTreeNode[]): FileTreeNode[] => {
      return nodes.map((node) => ({
        ...node,
        selected: select,
        children: node.children ? updateRecursive(node.children) : undefined
      }))
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

  const inputStyle =
    'bg-[#191a1d] text-[#e1e2e6] text-[11px] px-2 py-1 border border-[#33353a] focus:outline-none focus:border-[#4d78cc] rounded-[2px] transition font-sans'
  const selectStyle =
    'bg-[#191a1d] text-[#e1e2e6] text-[11px] px-2 py-0.5 border border-[#33353a] focus:outline-none focus:border-[#4d78cc] rounded-[2px] cursor-pointer font-sans'
  const fieldsetStyle =
    'border border-[#2f3136] p-2.5 rounded-[3px] bg-[#141517]/90 relative mt-2.5'
  const legendStyle = 'text-[11px] text-[#b8bac2] px-1 font-normal select-none -ml-1'
  const checkboxStyle =
    'h-3.5 w-3.5 rounded-[2px] bg-[#191a1d] border border-[#3f4248] text-[#3b82f6] accent-[#3b82f6] cursor-pointer'

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[1px] flex items-center justify-center p-2 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-[#1c1d21] text-[#d6d8df] border border-[#2e3036] rounded-[4px] w-full max-w-[940px] shadow-2xl overflow-hidden flex flex-col ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Window Title Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="h-8 px-2.5 bg-[#17181b] border-b border-[#292a2f] flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {/* qB Blue Icon */}
            <div className="h-4 w-4 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-[10px] shadow-sm shrink-0">
              qb
            </div>
            <span className="text-[12px] font-normal text-[#e6e8ee] truncate">{filename}</span>
          </div>

          <div className="flex items-center gap-0.5 style-no-drag">
            <button
              type="button"
              className="h-6 w-8 flex items-center justify-center text-[#8e929b] hover:text-white hover:bg-white/10 rounded-[2px] transition cursor-pointer"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="h-6 w-8 flex items-center justify-center text-[#8e929b] hover:text-white hover:bg-white/10 rounded-[2px] transition cursor-pointer"
            >
              <Square className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-6 w-8 flex items-center justify-center text-[#8e929b] hover:text-white hover:bg-[#c42b1c] rounded-[2px] transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Main Content: Split Left (Options) and Right (File View) */}
        <form onSubmit={handleSubmit} className="p-3 flex flex-col gap-3 bg-[#18191c]">
          <div className="grid grid-cols-12 gap-3 items-start">
            {/* ─── LEFT COLUMN (Options & Info) ─── */}
            <div className="col-span-12 md:col-span-5 flex flex-col gap-2.5">
              {/* Torrent Management Mode */}
              <div className="flex items-center justify-between text-[11px]">
                <label className="text-[#c2c5cd]">Torrent Management Mode:</label>
                <select
                  value={managementMode}
                  onChange={(e) => setManagementMode(e.target.value as 'manual' | 'automatic')}
                  className={`${selectStyle} w-28`}
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>

              {/* Save at Fieldset */}
              <fieldset className={fieldsetStyle}>
                <legend className={legendStyle}>Save at</legend>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={savePath}
                      onChange={(e) => setSavePath(e.target.value)}
                      className={`flex-1 ${inputStyle}`}
                    />
                    <select
                      className={`${selectStyle} px-1 w-6 text-center`}
                      onChange={(e) => setSavePath(e.target.value)}
                      value=""
                    >
                      <option value="" disabled hidden></option>
                      <option value="C:\Users\dwaip\Downloads">Downloads</option>
                      <option value="C:\Users\dwaip\Videos">Videos</option>
                      <option value="D:\Torrents">Torrents</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleBrowseSavePath}
                      className="px-2 py-1 bg-[#232429] hover:bg-[#2c2e35] border border-[#383a42] text-[#e1e2e6] rounded-[2px] cursor-pointer transition flex items-center justify-center shrink-0"
                      title="Browse Save Path"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-[#60a5fa]" />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 text-[11px] text-[#c2c5cd] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useIncompletePath}
                        onChange={(e) => setUseIncompletePath(e.target.checked)}
                        className={checkboxStyle}
                      />
                      <span>Use another path for incomplete torrent</span>
                    </label>

                    {useIncompletePath && (
                      <div className="flex items-center gap-1.5 pl-5 pt-0.5">
                        <input
                          type="text"
                          value={incompleteSavePath}
                          onChange={(e) => setIncompleteSavePath(e.target.value)}
                          className={`flex-1 ${inputStyle}`}
                        />
                        <button
                          type="button"
                          onClick={handleBrowseIncompletePath}
                          className="px-2 py-1 bg-[#232429] hover:bg-[#2c2e35] border border-[#383a42] text-[#e1e2e6] rounded-[2px] cursor-pointer transition flex items-center justify-center shrink-0"
                        >
                          <FolderOpen className="h-3.5 w-3.5 text-[#60a5fa]" />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <label className="flex items-center gap-1.5 text-[11px] text-[#c2c5cd] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberPath}
                          onChange={(e) => setRememberPath(e.target.checked)}
                          className={checkboxStyle}
                        />
                        <span>Remember last used save path</span>
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Torrent Options Fieldset */}
              <fieldset className={fieldsetStyle}>
                <legend className={legendStyle}>Torrent options</legend>
                <div className="space-y-2 text-[11px]">
                  {/* Category */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[#c2c5cd]">Category:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as DownloadCategory)}
                      className={`${selectStyle} flex-1 max-w-[170px]`}
                    >
                      <option value="other"></option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="documents">Documents</option>
                      <option value="compressed">Compressed</option>
                      <option value="executables">Programs</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <label className="flex items-center gap-1.5 text-[11px] text-[#c2c5cd] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setAsDefaultCategory}
                        onChange={(e) => setSetAsDefaultCategory(e.target.checked)}
                        className={checkboxStyle}
                      />
                      <span>Set as default category</span>
                    </label>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[#c2c5cd]">Tags:</label>
                    <div className="flex-1 flex gap-1 items-center">
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="Click [...] button to add/remove tags."
                        className={`flex-1 ${inputStyle} placeholder:text-[#63666f]`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const tag = prompt('Add tag:', tagsInput)
                          if (tag !== null) setTagsInput(tag)
                        }}
                        className="px-2 py-0.5 bg-[#232429] hover:bg-[#2c2e35] border border-[#383a42] text-[#b8bac2] text-[11px] rounded-[2px] cursor-pointer"
                      >
                        ...
                      </button>
                    </div>
                  </div>

                  {/* Checkbox Rows Matching Image */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[#c2c5cd]">
                      <input
                        type="checkbox"
                        checked={startTorrent}
                        onChange={(e) => setStartTorrent(e.target.checked)}
                        className={checkboxStyle}
                      />
                      <span>Start torrent</span>
                    </label>

                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[#a0a3ad] text-[10.5px]">Stop condition:</span>
                      <select
                        value={stopCondition}
                        onChange={(e) =>
                          setStopCondition(e.target.value as 'none' | 'metadata' | 'files')
                        }
                        className={`${selectStyle} text-[10.5px] px-1.5 py-0.5`}
                      >
                        <option value="none">None</option>
                        <option value="metadata">Metadata received</option>
                        <option value="files">Files checked</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[#c2c5cd]">
                      <input
                        type="checkbox"
                        checked={addToTopQueue}
                        onChange={(e) => setAddToTopQueue(e.target.checked)}
                        className={checkboxStyle}
                      />
                      <span>Add to top of queue</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[#c2c5cd]">
                      <input
                        type="checkbox"
                        checked={skipHashCheck}
                        onChange={(e) => setSkipHashCheck(e.target.checked)}
                        className={checkboxStyle}
                      />
                      <span>Skip hash check</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[#c2c5cd]">
                      <input
                        type="checkbox"
                        checked={sequentialDownload}
                        onChange={(e) => setSequentialDownload(e.target.checked)}
                        className={checkboxStyle}
                      />
                      <span>Download in sequential order</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[#c2c5cd]">
                      <input
                        type="checkbox"
                        checked={firstLastPiecesFirst}
                        onChange={(e) => setFirstLastPiecesFirst(e.target.checked)}
                        className={checkboxStyle}
                      />
                      <span>Download first and last pieces first</span>
                    </label>
                  </div>

                  {/* Content layout */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#c2c5cd]">Content layout:</span>
                    <select
                      value={contentLayout}
                      onChange={(e) =>
                        setContentLayout(e.target.value as 'original' | 'subfolder' | 'nosubfolder')
                      }
                      className={`${selectStyle} w-36`}
                    >
                      <option value="original">Original</option>
                      <option value="subfolder">Create subfolder</option>
                      <option value="nosubfolder">Don't create subfolder</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Torrent information Fieldset */}
              <fieldset className={fieldsetStyle}>
                <legend className={legendStyle}>Torrent information</legend>
                <div className="space-y-1 text-[11px] text-[#c2c5cd] font-sans">
                  <div className="flex">
                    <span className="w-24 text-[#8f939e]">Size:</span>
                    <span>
                      943.4 MiB{' '}
                      <span className="text-[#888b94]">(Free space on disk: 31.34 GiB)</span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-[#8f939e]">Date:</span>
                    <span className="text-[#b0b3bc]">Not available</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-[#8f939e] shrink-0">Info hash v1:</span>
                    <span className="font-mono text-[10.5px] text-[#b0b3bc] truncate select-all">
                      004c2474042e2d9785bf0c097f69328e1a7fec86
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-[#8f939e]">Info hash v2:</span>
                    <span className="text-[#b0b3bc]">N/A</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-[#8f939e]">Comment:</span>
                    <span className="text-[#b0b3bc]"></span>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* ─── RIGHT COLUMN (File View & Selection Tree) ─── */}
            <div className="col-span-12 md:col-span-7 flex flex-col bg-[#141517] border border-[#2a2c31] rounded-[3px] h-[450px]">
              {/* Toolbar: Select All / Select None & Search */}
              <div className="p-2 border-b border-[#25272c] flex items-center justify-between shrink-0 bg-[#16171a]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(true)}
                    className="px-2.5 py-1 bg-[#24252a] hover:bg-[#2e3036] border border-[#383a42] text-[#d6d8df] text-[11px] rounded-[2px] cursor-pointer transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(false)}
                    className="px-2.5 py-1 bg-[#24252a] hover:bg-[#2e3036] border border-[#383a42] text-[#d6d8df] text-[11px] rounded-[2px] cursor-pointer transition"
                  >
                    Select None
                  </button>
                </div>

                <div className="relative w-48">
                  <Search className="h-3 w-3 text-[#727681] absolute left-2 top-2 pointer-events-none" />
                  <input
                    type="text"
                    value={fileFilter}
                    onChange={(e) => setFileFilter(e.target.value)}
                    placeholder="Filter files..."
                    className="w-full bg-[#1c1d21] text-[#e1e2e6] placeholder-[#656872] text-[11px] pl-7 pr-2 py-1 rounded-[2px] border border-[#33353a] focus:outline-none focus:border-[#4d78cc] font-sans"
                  />
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 bg-[#1b1c20] border-b border-[#25272c] text-[11px] font-normal text-[#a6aab5] px-2 py-1.5 select-none shrink-0">
                <div className="col-span-7 flex items-center gap-1">
                  <span>Name</span>
                  <ChevronDown className="h-3 w-3 text-[#727681]" />
                </div>
                <div className="col-span-2 text-right pr-2">Total Size</div>
                <div className="col-span-3 text-left pl-2">Download Priority</div>
              </div>

              {/* File Tree Rows (Exact Representation of the Screenshot) */}
              <div className="flex-1 overflow-y-auto overflow-x-auto text-[11.5px] font-sans bg-[#131416]">
                {filesTree.map((rootNode) => (
                  <div key={rootNode.id} className="divide-y divide-[#1e2025]">
                    {/* Root Folder Row */}
                    <div className="grid grid-cols-12 items-center px-2 py-1 hover:bg-[#1f2025] transition cursor-pointer select-none">
                      <div className="col-span-7 flex items-center gap-1.5 overflow-hidden">
                        <button
                          type="button"
                          onClick={(e) => toggleFolder(rootNode.id, e)}
                          className="p-0.5 text-[#8a8e99] hover:text-white"
                        >
                          {expandedFolders[rootNode.id] ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <input
                          type="checkbox"
                          checked={rootNode.selected}
                          onChange={() => toggleNodeSelect(rootNode.id)}
                          className={checkboxStyle}
                        />
                        <Folder className="h-4 w-4 text-[#eab308] shrink-0 fill-[#eab308]/20" />
                        <span className="truncate text-[#e6e8ee] font-medium">{rootNode.name}</span>
                      </div>
                      <div className="col-span-2 text-right pr-2 font-mono text-[11px] text-[#c2c5cd]">
                        {formatBytes(rootNode.size)}
                      </div>
                      <div className="col-span-3 text-left pl-2">
                        <span className="text-[#a0a4af] text-[11px]">Normal</span>
                      </div>
                    </div>

                    {/* Children Items */}
                    {expandedFolders[rootNode.id] &&
                      rootNode.children?.map((child) => (
                        <React.Fragment key={child.id}>
                          {child.type === 'folder' ? (
                            // Subfolder (Screens)
                            <div className="grid grid-cols-12 items-center px-2 py-1 hover:bg-[#1f2025] transition cursor-pointer select-none pl-6">
                              <div className="col-span-7 flex items-center gap-1.5 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={(e) => toggleFolder(child.id, e)}
                                  className="p-0.5 text-[#8a8e99] hover:text-white"
                                >
                                  {expandedFolders[child.id] ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <input
                                  type="checkbox"
                                  checked={child.selected}
                                  onChange={() => toggleNodeSelect(child.id)}
                                  className={checkboxStyle}
                                />
                                <Folder className="h-3.5 w-3.5 text-[#eab308] shrink-0 fill-[#eab308]/20" />
                                <span className="truncate text-[#d6d8df]">{child.name}</span>
                              </div>
                              <div className="col-span-2 text-right pr-2 font-mono text-[11px] text-[#c2c5cd]">
                                {formatBytes(child.size)}
                              </div>
                              <div className="col-span-3 text-left pl-2">
                                <span className="text-[#a0a4af] text-[11px]">Normal</span>
                              </div>
                            </div>
                          ) : child.name.endsWith('.mkv') ? (
                            // Video File (.mkv)
                            <div className="grid grid-cols-12 items-center px-2 py-1 hover:bg-[#1f2025] transition cursor-pointer select-none pl-8">
                              <div className="col-span-7 flex items-center gap-1.5 overflow-hidden">
                                <input
                                  type="checkbox"
                                  checked={child.selected}
                                  onChange={() => toggleNodeSelect(child.id)}
                                  className={checkboxStyle}
                                />
                                {/* Traffic Cone / Film Icon */}
                                <div className="h-3.5 w-3.5 bg-[#f97316]/20 border border-[#f97316]/40 text-[#f97316] flex items-center justify-center text-[9px] font-bold rounded-[1px] shrink-0">
                                  🎬
                                </div>
                                <span className="truncate text-[#e6e8ee]">{child.name}</span>
                              </div>
                              <div className="col-span-2 text-right pr-2 font-mono text-[11px] text-[#c2c5cd]">
                                {formatBytes(child.size)}
                              </div>
                              <div className="col-span-3 text-left pl-2">
                                <select
                                  value={child.priority}
                                  onChange={(e) =>
                                    updateFilePriority(child.id, e.target.value as DownloadPriority)
                                  }
                                  className="bg-transparent text-[#a0a4af] text-[11px] focus:outline-none cursor-pointer"
                                >
                                  <option value="normal" className="bg-[#18191c]">
                                    Normal
                                  </option>
                                  <option value="high" className="bg-[#18191c]">
                                    High
                                  </option>
                                  <option value="low" className="bg-[#18191c]">
                                    Low
                                  </option>
                                  <option value="ignore" className="bg-[#18191c]">
                                    Do not download
                                  </option>
                                </select>
                              </div>
                            </div>
                          ) : (
                            // Document / NFO File
                            <div className="grid grid-cols-12 items-center px-2 py-1 hover:bg-[#1f2025] transition cursor-pointer select-none pl-8">
                              <div className="col-span-7 flex items-center gap-1.5 overflow-hidden">
                                <input
                                  type="checkbox"
                                  checked={child.selected}
                                  onChange={() => toggleNodeSelect(child.id)}
                                  className={checkboxStyle}
                                />
                                {/* Blue text / doc icon */}
                                <div className="h-3.5 w-3.5 bg-[#3b82f6]/20 border border-[#3b82f6]/40 text-[#60a5fa] flex items-center justify-center text-[9px] font-bold rounded-[1px] shrink-0">
                                  📄
                                </div>
                                <span className="truncate text-[#e6e8ee]">{child.name}</span>
                              </div>
                              <div className="col-span-2 text-right pr-2 font-mono text-[11px] text-[#c2c5cd]">
                                {formatBytes(child.size)}
                              </div>
                              <div className="col-span-3 text-left pl-2">
                                <span className="text-[#a0a4af] text-[11px]">Normal</span>
                              </div>
                            </div>
                          )}

                          {/* Nested Screen Images (if expanded) */}
                          {child.type === 'folder' &&
                            expandedFolders[child.id] &&
                            child.children?.map((nested) => (
                              <div
                                key={nested.id}
                                className="grid grid-cols-12 items-center px-2 py-1 hover:bg-[#1f2025] transition cursor-pointer select-none pl-12"
                              >
                                <div className="col-span-7 flex items-center gap-1.5 overflow-hidden">
                                  <input
                                    type="checkbox"
                                    checked={nested.selected}
                                    onChange={() => toggleNodeSelect(nested.id)}
                                    className={checkboxStyle}
                                  />
                                  <FileText className="h-3.5 w-3.5 text-[#38bdf8] shrink-0" />
                                  <span className="truncate text-[#d6d8df]">{nested.name}</span>
                                </div>
                                <div className="col-span-2 text-right pr-2 font-mono text-[11px] text-[#c2c5cd]">
                                  {formatBytes(nested.size)}
                                </div>
                                <div className="col-span-3 text-left pl-2">
                                  <span className="text-[#a0a4af] text-[11px]">Normal</span>
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

          {/* ─── Bottom Footer Bar ─── */}
          <div className="pt-2 flex items-center justify-between border-t border-[#26282e] text-[11px]">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[#c2c5cd] cursor-pointer">
                <input
                  type="checkbox"
                  checked={neverShowAgain}
                  onChange={(e) => setNeverShowAgain(e.target.checked)}
                  className={checkboxStyle}
                />
                <span>Never show again</span>
              </label>

              <span className="text-[#7c808c]">Metadata retrieval complete</span>

              <button
                type="button"
                onClick={() => {
                  window.api?.exportQueue()
                }}
                className="px-2.5 py-1 bg-[#232429] hover:bg-[#2c2e35] border border-[#383a42] text-[#d6d8df] rounded-[2px] cursor-pointer transition"
              >
                Save as .torrent file...
              </button>
            </div>

            {/* OK & Cancel Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-medium text-xs rounded-[2px] cursor-pointer transition shadow-sm"
              >
                OK
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-1 bg-[#2a2b30] hover:bg-[#34363d] border border-[#3d4049] text-[#e1e2e6] font-medium text-xs rounded-[2px] cursor-pointer transition"
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
