import React, { useState } from 'react'
import {
  X,
  Hammer,
  FolderOpen,
  GripHorizontal,
  HardDrive,
  Globe,
  MessageSquare,
  Sparkles,
  Check
} from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface CreateTorrentModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateTorrentModal: React.FC<CreateTorrentModalProps> = ({ isOpen, onClose }) => {
  const [sourcePath, setSourcePath] = useState('')
  const [pieceSizeKb, setPieceSizeKb] = useState(512)
  const [trackers, setTrackers] = useState(
    'udp://tracker.opentrackr.org:1337/announce\nudp://open.demonii.com:1337/announce'
  )
  const [comment, setComment] = useState('Created with Grabbit v0.1.1')
  const [isPrivate, setIsPrivate] = useState(false)
  const [startSeeding, setStartSeeding] = useState(true)

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPath, setGeneratedPath] = useState('')

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const handleBrowseSource = async (): Promise<void> => {
    if (window.api?.selectDirectory) {
      const selected = await window.api.selectDirectory(sourcePath)
      if (selected) setSourcePath(selected)
    }
  }

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!sourcePath) return

    setIsGenerating(true)

    setTimeout(() => {
      setIsGenerating(false)
      const outName = sourcePath.split(/[/\\]/).pop() || 'payload'
      setGeneratedPath(`C:\\Downloads\\${outName}.torrent`)
    }, 1500)
  }

  const inputCls =
    'bg-ide-surface text-slate-100 text-xs px-2.5 py-1.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent/60 font-mono transition'
  const checkboxCls = 'accent-theme-accent cursor-pointer'

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${
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
            <div className="p-1.5 bg-amber-950/40 rounded-none border border-amber-500/25">
              <Hammer className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-xs block">Create Torrent Creator</span>
              <span className="text-[10px] text-slate-500 block">
                Generate and seed a new .torrent file from local payload
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

        {/* Form */}
        <form onSubmit={handleCreate} className="p-4 space-y-3.5 overflow-y-auto max-h-[80vh]">
          {/* Source Selection */}
          <fieldset className="border border-ide-border/60 p-3 rounded-none space-y-2 bg-ide-bg/30">
            <legend className="text-[10px] font-bold text-amber-400/90 px-2 uppercase tracking-widest flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Payload Source
            </legend>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                placeholder="Select a folder or file to package..."
                className={`flex-1 ${inputCls}`}
                required
              />
              <button
                type="button"
                onClick={handleBrowseSource}
                className="px-3 py-1.5 bg-white/4 hover:bg-white/8 border border-ide-border text-slate-300 hover:text-white rounded-none cursor-pointer transition flex items-center gap-1.5"
              >
                <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                <span>Browse</span>
              </button>
            </div>
          </fieldset>

          {/* Piece Size & Seeding Settings */}
          <div className="grid grid-cols-2 gap-3">
            <fieldset className="border border-ide-border/60 p-3 rounded-none space-y-2 bg-ide-bg/30">
              <legend className="text-[10px] font-bold text-amber-400/90 px-2 uppercase tracking-widest">
                Piece Size
              </legend>
              <select
                value={pieceSizeKb}
                onChange={(e) => setPieceSizeKb(Number(e.target.value))}
                className={`w-full ${inputCls}`}
              >
                <option value={64}>64 KiB (Small Files)</option>
                <option value={256}>256 KiB</option>
                <option value={512}>512 KiB (Recommended)</option>
                <option value={1024}>1024 KiB (1 MiB)</option>
                <option value={2048}>2048 KiB (2 MiB)</option>
                <option value={4096}>4096 KiB (4 MiB - Large Files)</option>
              </select>
            </fieldset>

            <fieldset className="border border-ide-border/60 p-3 rounded-none space-y-1.5 bg-ide-bg/30">
              <legend className="text-[10px] font-bold text-amber-400/90 px-2 uppercase tracking-widest">
                Options
              </legend>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={startSeeding}
                  onChange={(e) => setStartSeeding(e.target.checked)}
                  className={checkboxCls}
                />
                <span>Start seeding immediately</span>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className={checkboxCls}
                />
                <span>Private Torrent (Disable DHT/PEX)</span>
              </label>
            </fieldset>
          </div>

          {/* Trackers & Web Seeds */}
          <fieldset className="border border-ide-border/60 p-3 rounded-none space-y-2 bg-ide-bg/30">
            <legend className="text-[10px] font-bold text-amber-400/90 px-2 uppercase tracking-widest flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Announce Trackers (One per line)
            </legend>
            <textarea
              value={trackers}
              onChange={(e) => setTrackers(e.target.value)}
              rows={3}
              className={`w-full ${inputCls} resize-none`}
            />
          </fieldset>

          {/* Comment */}
          <fieldset className="border border-ide-border/60 p-3 rounded-none space-y-2 bg-ide-bg/30">
            <legend className="text-[10px] font-bold text-amber-400/90 px-2 uppercase tracking-widest flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Comment / Description
            </legend>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`w-full ${inputCls}`}
            />
          </fieldset>

          {/* Generated Result Alert */}
          {generatedPath && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-xs truncate">Saved: {generatedPath}</span>
              </div>
              <button
                type="button"
                onClick={() => setGeneratedPath('')}
                className="text-[10px] underline text-emerald-400 hover:text-emerald-200"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-ide-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/6 border border-ide-border/80 rounded-none transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !sourcePath}
              className={`px-5 py-1.5 text-xs font-bold rounded-none transition cursor-pointer flex items-center gap-1.5 ${
                !sourcePath || isGenerating
                  ? 'text-slate-500 bg-white/5 border border-ide-border cursor-not-allowed'
                  : 'text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.97] shadow-lg shadow-amber-400/15'
              }`}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>Packaging Torrent...</span>
                </>
              ) : (
                <>
                  <Hammer className="h-3.5 w-3.5" />
                  <span>Create &amp; Save .torrent</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
