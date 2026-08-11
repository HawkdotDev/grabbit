import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  GripHorizontal,
  Magnet,
  FileUp,
  ArrowRight,
  Link as LinkIcon,
  Clipboard,
  Sparkles
} from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface AddTorrentSourceModalProps {
  isOpen: boolean
  onClose: () => void
  onProceed: (source: string) => void
}

export const AddTorrentSourceModal: React.FC<AddTorrentSourceModalProps> = ({
  isOpen,
  onClose,
  onProceed
}) => {
  const [input, setInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  // Reset state when modal opens
  const [prevOpen, setPrevOpen] = useState(false)
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen)
    if (isOpen) {
      setInput('')
      setSelectedFile(null)
      setIsDragOver(false)
    }
  }

  // Auto-focus the input when modal opens
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const isMagnet = input.trim().startsWith('magnet:')
  const isUrl =
    input.trim().startsWith('http://') ||
    input.trim().startsWith('https://') ||
    input.trim().startsWith('magnet:')
  const hasInput = input.trim().length > 0 || selectedFile !== null

  const handlePaste = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setInput(text)
    } catch {
      // Clipboard API may not be available
    }
  }

  const handleFileBrowse = (): void => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Electron adds webkitRelativePath / path to File objects
      const filePath = (file as File & { path?: string }).path || file.name
      setInput(filePath)
    }
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file && (file.name.endsWith('.torrent') || file.name.endsWith('.metalink'))) {
      setSelectedFile(file)
      const filePath = (file as File & { path?: string }).path || file.name
      setInput(filePath)
    }

    // Check for text (magnet links dragged from browser)
    const text = e.dataTransfer.getData('text/plain')
    if (text && (text.startsWith('magnet:') || text.startsWith('http'))) {
      setInput(text)
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!hasInput) return

    const source = input.trim()
    onProceed(source)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && hasInput) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${isDragging ? 'transition-none duration-0' : ''
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
              <Magnet className="h-4 w-4 text-theme-accent" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-100 text-xs truncate block">
                Add Torrent
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Paste a magnet link, URL, or select a .torrent file
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

        {/* ─── Body ─── */}
        <form onSubmit={handleSubmit} className="flex-1 p-4 flex flex-col gap-3.5">
          {/* Source Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <LinkIcon className="h-3 w-3 text-theme-accent/70" />
              Magnet Link / Torrent URL
            </label>
            <div className="flex gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (selectedFile) setSelectedFile(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder="magnet:?xt=urn:btih:... or https://..."
                className="flex-1 bg-ide-bg text-slate-100 text-xs px-2.5 py-2 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 font-mono transition placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="px-2.5 py-2 bg-white/4 hover:bg-white/8 border border-ide-border text-slate-400 hover:text-white rounded-none cursor-pointer transition"
                title="Paste from clipboard"
              >
                <Clipboard className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Source type indicator */}
            {input.trim() && (
              <div className="flex items-center gap-1.5 text-[10px] px-1">
                <Sparkles className="h-3 w-3 text-theme-accent/60" />
                <span className="text-slate-500">
                  Detected:{' '}
                  <span className="text-theme-accent font-semibold">
                    {isMagnet
                      ? 'Magnet Link'
                      : isUrl
                        ? 'Torrent URL'
                        : input.endsWith('.torrent')
                          ? 'Torrent File Path'
                          : 'Unknown source'}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex-1 h-px bg-ide-border/60" />
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-ide-border/60" />
          </div>

          {/* File Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileBrowse}
            className={`relative border-2 border-dashed rounded-none p-5 text-center cursor-pointer transition-all duration-200 ${isDragOver
                ? 'border-theme-accent bg-theme-tint/30 scale-[1.01]'
                : selectedFile
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-ide-border/60 bg-ide-bg/40 hover:border-ide-border hover:bg-ide-bg/60'
              }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`p-2.5 rounded-none border transition-colors ${isDragOver
                    ? 'bg-theme-tint border-theme-accent/40'
                    : selectedFile
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white/3 border-ide-border/40'
                  }`}
              >
                <FileUp
                  className={`h-5 w-5 transition-colors ${isDragOver
                      ? 'text-theme-accent'
                      : selectedFile
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-xs font-semibold text-emerald-400">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-300 font-medium">
                    Drop a <span className="text-theme-accent font-semibold">.torrent</span> file
                    here
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    or click to browse for a file
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hidden file input fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".torrent,.metalink"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* ─── Action Bar ─── */}
          <div className="flex items-center justify-between pt-1 shrink-0">
            <span className="text-[10px] text-slate-600 font-mono">
              Step 1 of 2 — Source Selection
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/6 border border-ide-border/80 rounded-none transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!hasInput}
                className={`px-5 py-1.5 text-xs font-bold rounded-none shadow-lg transition cursor-pointer flex items-center gap-1.5 ${hasInput
                    ? 'text-slate-950 bg-theme-accent hover:bg-theme-bright active:scale-[0.97] shadow-theme-accent/15'
                    : 'text-slate-500 bg-slate-800 border border-ide-border cursor-not-allowed shadow-none'
                  }`}
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
