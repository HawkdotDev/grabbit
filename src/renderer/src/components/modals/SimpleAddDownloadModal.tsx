import React, { useState } from 'react'
import { DownloadCategory, DownloadPriority } from '../../../../engine/types'
import {
  X,
  Link as LinkIcon,
  FolderOpen,
  GripHorizontal,
  Zap,
  HardDrive,
  Gauge,
  ArrowDownToLine,
  FileText
} from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface SimpleAddDownloadModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (args: {
    url: string
    filename?: string
    savePath?: string
    category?: DownloadCategory
    priority?: DownloadPriority
    threadCount?: number
    tags?: string[]
    startPaused?: boolean
    addToTopQueue?: boolean
    sequentialDownload?: boolean
    firstLastPiecesFirst?: boolean
    skipHashCheck?: boolean
    stopCondition?: 'none' | 'metadata' | 'files'
    contentLayout?: 'original' | 'subfolder' | 'nosubfolder'
    managementMode?: 'manual' | 'automatic'
  }) => void
  defaultSavePath: string
  initialMode?: 'link' | 'file'
  initialUrl?: string
}

export const SimpleAddDownloadModal: React.FC<SimpleAddDownloadModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultSavePath,
  initialMode = 'link',
  initialUrl = ''
}) => {
  const [url, setUrl] = useState(initialUrl)
  const [filename, setFilename] = useState('')
  const [savePath, setSavePath] = useState(defaultSavePath)
  const [useIncompletePath, setUseIncompletePath] = useState(false)
  const [incompleteSavePath, setIncompleteSavePath] = useState(defaultSavePath + '\\Incomplete')
  const [rememberPath, setRememberPath] = useState(true)

  const [category, setCategory] = useState<DownloadCategory>('other')
  const [threadCount, setThreadCount] = useState(8)
  const [priority, setPriority] = useState<DownloadPriority>('normal')
  const [startImmediately, setStartImmediately] = useState(true)
  const [addToTopQueue, setAddToTopQueue] = useState(false)

  const [prevSyncKey, setPrevSyncKey] = useState('')
  const currentSyncKey = `${isOpen}-${initialMode}-${initialUrl}`

  if (currentSyncKey !== prevSyncKey) {
    setPrevSyncKey(currentSyncKey)
    if (isOpen) {
      if (initialUrl) {
        setUrl(initialUrl)
        const parsed = initialUrl.split('/').pop()?.split('?')[0]
        if (parsed) {
          try {
            setFilename(decodeURIComponent(parsed))
          } catch {
            setFilename(parsed)
          }
        }
      }
    }
  }

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const targetUrl = url.trim()
    if (!targetUrl) return

    onAdd({
      url: targetUrl,
      filename: filename.trim() || undefined,
      savePath: savePath.trim() || undefined,
      category,
      priority,
      threadCount,
      addToTopQueue,
      startPaused: !startImmediately
    })

    setUrl('')
    setFilename('')
    onClose()
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

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/35 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${isDragging ? 'transition-none duration-0' : ''
          } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* ─── Title Bar ─── */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-2.5 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <div className="p-1.5 bg-theme-tint/80 rounded-none border border-theme-accent/25">
              <LinkIcon className="h-4 w-4 text-theme-accent" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-100 text-xs truncate block">
                {filename || 'Add Download'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {url || 'Enter a URL to begin'}
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
          {/* Source Input Area */}
          <div className="bg-ide-bg/80 p-3.5 border border-ide-border/80 space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="h-3 w-3 text-theme-accent/70" />
                Download URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  const val = e.target.value
                  setUrl(val)
                  if (!filename && val) {
                    try {
                      const u = new URL(val)
                      const pathSegments = u.pathname.split('/')
                      const lastSegment = pathSegments[pathSegments.length - 1]
                      if (lastSegment && lastSegment.includes('.')) {
                        setFilename(decodeURIComponent(lastSegment))
                      }
                    } catch {
                      // ignore
                    }
                  }
                }}
                placeholder="https://example.com/file.zip"
                className="w-full bg-ide-surface text-slate-100 text-xs px-2.5 py-1.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 font-mono transition"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-emerald-400/70" />
                Filename (Optional)
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Custom filename"
                className="w-full bg-ide-surface text-slate-100 text-xs px-2.5 py-1.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 font-mono transition"
              />
            </div>
          </div>

          {/* ─── Save Path ─── */}
          <fieldset className="border border-ide-border/60 p-3 rounded-none space-y-2.5 bg-ide-bg/30">
            <legend className="text-[10px] font-bold text-theme-accent/90 px-2 uppercase tracking-widest">
              <HardDrive className="h-3 w-3 inline-block mr-1 -mt-0.5 opacity-70" />
              Save Path
            </legend>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={savePath}
                onChange={(e) => setSavePath(e.target.value)}
                className="flex-1 bg-ide-surface text-slate-100 text-xs px-2.5 py-1.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 font-mono transition"
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

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                <input
                  type="checkbox"
                  checked={rememberPath}
                  onChange={(e) => setRememberPath(e.target.checked)}
                  className="accent-theme-accent cursor-pointer"
                />
                <span>Remember path</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                <input
                  type="checkbox"
                  checked={useIncompletePath}
                  onChange={(e) => setUseIncompletePath(e.target.checked)}
                  className="accent-theme-accent cursor-pointer"
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
                  className="flex-1 bg-ide-surface text-slate-100 text-xs px-2.5 py-1 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 font-mono transition"
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

          {/* ─── Acceleration Options ─── */}
          <fieldset className="border border-ide-border/60 p-3 rounded-none space-y-3 bg-ide-bg/30">
            <legend className="text-[10px] font-bold text-theme-accent/90 px-2 uppercase tracking-widest">
              <Zap className="h-3 w-3 inline-block mr-1 -mt-0.5 opacity-70" />
              Transfer Options
            </legend>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DownloadCategory)}
                  className="w-full bg-ide-surface border border-ide-border text-slate-100 text-xs px-2 py-1.5 rounded-none focus:outline-none focus:border-theme-accent/60 font-mono cursor-pointer transition"
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
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as DownloadPriority)}
                  className="w-full bg-ide-surface border border-ide-border text-slate-100 text-xs px-2 py-1.5 rounded-none focus:outline-none focus:border-theme-accent/60 font-mono cursor-pointer transition"
                >
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Thread Count */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-ide-border/40">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Gauge className="h-3 w-3 text-theme-accent/60" />
                <span className="font-medium">Worker Threads</span>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="range"
                  min="1"
                  max="32"
                  value={threadCount}
                  onChange={(e) => setThreadCount(parseInt(e.target.value, 10))}
                  className="w-28 accent-theme-accent cursor-pointer"
                />
                <span className="font-mono text-theme-accent font-bold text-xs min-w-10 text-right">
                  {threadCount}
                </span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-5 text-[11px] text-slate-400 pt-1.5 border-t border-ide-border/40">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                <input
                  type="checkbox"
                  checked={startImmediately}
                  onChange={(e) => setStartImmediately(e.target.checked)}
                  className="accent-theme-accent cursor-pointer"
                />
                <span>Start immediately</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition">
                <input
                  type="checkbox"
                  checked={addToTopQueue}
                  onChange={(e) => setAddToTopQueue(e.target.checked)}
                  className="accent-theme-accent cursor-pointer"
                />
                <span>Add to top of queue</span>
              </label>
            </div>
          </fieldset>

          {/* ─── Info Bar ─── */}
          <div className="flex items-center justify-between px-3 py-2 bg-ide-bg/60 border border-ide-border/40 text-[10px] text-slate-500 font-mono">
            <span>
              Protocol: <span className="text-emerald-400/80 font-semibold">HTTPS Multi-Chunk</span>
            </span>
            <span>
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* ─── Action Bar ─── */}
          <div className="flex items-center justify-end gap-2 pt-1 shrink-0">
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
              Download
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
