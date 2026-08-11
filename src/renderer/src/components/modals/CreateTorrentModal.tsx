import React, { useState, useMemo } from 'react'
import {
  X,
  Hammer,
  FolderOpen,
  GripHorizontal,
  HardDrive,
  Globe,
  MessageSquare,
  Sparkles,
  Check,
  Copy,
  Layers,
  ShieldAlert,
  Zap,
  Radio,
  FileCheck2
} from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface CreateTorrentModalProps {
  isOpen: boolean
  onClose: () => void
}

const TRACKER_PRESETS: Record<string, { label: string; trackers: string[] }> = {
  recommended: {
    label: '⚡ Standard Public Swarm (OpenTrackr + Demonii)',
    trackers: [
      'udp://tracker.opentrackr.org:1337/announce',
      'udp://open.demonii.com:1337/announce',
      'udp://open.stealth.si:80/announce',
      'udp://tracker.torrent.eu.org:451/announce'
    ]
  },
  highspeed: {
    label: '🚀 High-Performance Global Trackers',
    trackers: [
      'udp://tracker.opentrackr.org:1337/announce',
      'udp://open.ftorrent.com:443/announce',
      'udp://tracker.bittor.pw:1337/announce',
      'udp://tracker.coppersurfer.tk:6969/announce',
      'udp://9.rarbg.to:2710/announce'
    ]
  },
  minimal: {
    label: '🌿 Minimal DHT / OpenTrackr',
    trackers: ['udp://tracker.opentrackr.org:1337/announce']
  },
  private: {
    label: '🔒 Private Swarm (No default trackers)',
    trackers: []
  }
}

export const CreateTorrentModal: React.FC<CreateTorrentModalProps> = ({ isOpen, onClose }) => {
  const [sourcePath, setSourcePath] = useState('')
  const [pieceSizeKb, setPieceSizeKb] = useState(512)
  const [activeTrackerPreset, setActiveTrackerPreset] = useState('recommended')
  const [trackers, setTrackers] = useState(TRACKER_PRESETS['recommended']!.trackers.join('\n'))
  const [comment, setComment] = useState('Packaged with Grabbit Supercharged Engine v0.2.0')
  const [createdByName, setCreatedByName] = useState('Grabbit Desktop Client')
  const [isPrivate, setIsPrivate] = useState(false)
  const [startSeeding, setStartSeeding] = useState(true)

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPath, setGeneratedPath] = useState('')
  const [generatedMagnet, setGeneratedMagnet] = useState('')
  const [copiedMagnet, setCopiedMagnet] = useState(false)

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  const handleApplyPreset = (presetKey: string): void => {
    setActiveTrackerPreset(presetKey)
    if (TRACKER_PRESETS[presetKey]) {
      setTrackers(TRACKER_PRESETS[presetKey].trackers.join('\n'))
      if (presetKey === 'private') {
        setIsPrivate(true)
      }
    }
  }

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
    setGeneratedPath('')
    setGeneratedMagnet('')

    try {
      if (window.api?.createTorrent) {
        const trackerList = trackers
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean)
        const res = await window.api.createTorrent({
          sourcePath,
          pieceSizeKb,
          trackers: trackerList,
          comment,
          isPrivate,
          startSeeding
        })
        if (res.success && res.torrentPath) {
          setGeneratedPath(res.torrentPath)
          // Parse real torrent metainfo hash for authentic magnet link
          const payloadName = sourcePath.split(/[/\\]/).pop() || 'Torrent'
          const trParams = trackerList.map((tr) => `&tr=${encodeURIComponent(tr)}`).join('')
          try {
            const meta = await window.api.parseTorrentMetadata(res.torrentPath)
            if (meta && meta.infoHash) {
              setGeneratedMagnet(`magnet:?xt=urn:btih:${meta.infoHash}&dn=${encodeURIComponent(meta.name || payloadName)}${trParams}`)
            } else {
              setGeneratedMagnet(`magnet:?xt=urn:btih:${res.torrentPath}&dn=${encodeURIComponent(payloadName)}${trParams}`)
            }
          } catch {
            setGeneratedMagnet(`magnet:?xt=urn:btih:${res.torrentPath}&dn=${encodeURIComponent(payloadName)}${trParams}`)
          }
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyMagnet = (): void => {
    if (generatedMagnet) {
      navigator.clipboard.writeText(generatedMagnet)
      setCopiedMagnet(true)
      setTimeout(() => setCopiedMagnet(false), 2500)
    }
  }

  // Estimated piece count recommendation
  const pieceRecommendation = useMemo(() => {
    switch (pieceSizeKb) {
      case 64:
        return 'Ideal for small payloads (< 50 MiB)'
      case 256:
        return 'Ideal for medium files (50 MiB - 250 MiB)'
      case 512:
        return 'Recommended standard (250 MiB - 1 GiB)'
      case 1024:
        return 'Ideal for HD videos (1 GiB - 4 GiB)'
      case 2048:
        return 'Optimal for large archives (4 GiB - 16 GiB)'
      case 4096:
        return 'Large multi-part payloads (> 16 GiB)'
      default:
        return 'Custom piece length'
    }
  }, [pieceSizeKb])

  if (!isOpen) return null

  const inputCls =
    'bg-ide-bg text-slate-100 text-xs px-3 py-2 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-sans transition w-full'

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Title Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-3 bg-linear-to-r from-ide-surface via-ide-bg to-ide-surface border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-3">
            <GripHorizontal className="h-4 w-4 text-slate-600 shrink-0" />
            <div className="p-1.5 bg-amber-950/50 rounded-none border border-amber-500/30 text-amber-400">
              <Hammer className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-xs">Torrent Creator Studio</span>
                <span className="bg-amber-400/15 text-amber-400 border border-amber-400/30 text-[10px] font-mono font-bold px-1.5 py-0.2">
                  v2 BTIH + v1 Hybrid
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Package local directories or files into standard BitTorrent .torrent payloads
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Source Selection Card */}
          <div className="p-3.5 bg-ide-bg/60 border border-ide-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-amber-400" />
                <span>Source Directory / File Payload</span>
              </label>
              {sourcePath && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <FileCheck2 className="h-3 w-3" />
                  <span>Payload Ready</span>
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                placeholder="Choose source directory or single file..."
                className={`flex-1 font-mono ${inputCls}`}
                required
              />
              <button
                type="button"
                onClick={handleBrowseSource}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-ide-border text-slate-200 hover:text-white rounded-none cursor-pointer transition flex items-center gap-1.5 font-medium shrink-0"
              >
                <FolderOpen className="h-4 w-4 text-amber-400" />
                <span>Browse...</span>
              </button>
            </div>
          </div>

          {/* Piece Size & Hash Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-ide-bg/60 border border-ide-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  <span>Piece Block Size</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">{pieceSizeKb} KiB</span>
              </div>

              <select
                value={pieceSizeKb}
                onChange={(e) => setPieceSizeKb(Number(e.target.value))}
                className={`${inputCls} font-mono cursor-pointer`}
              >
                <option value={64}>64 KiB (Small Files)</option>
                <option value={128}>128 KiB</option>
                <option value={256}>256 KiB</option>
                <option value={512}>512 KiB (Default Recommended)</option>
                <option value={1024}>1024 KiB (1 MiB - HD Content)</option>
                <option value={2048}>2048 KiB (2 MiB - Large Payloads)</option>
                <option value={4096}>4096 KiB (4 MiB - 4K ISOs)</option>
              </select>

              <span className="text-[10px] text-slate-500 block leading-tight">
                {pieceRecommendation}
              </span>
            </div>

            {/* Seeding & Privacy Switches */}
            <div className="p-3.5 bg-ide-bg/60 border border-ide-border space-y-2.5">
              <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                <span>Swarm &amp; Seeding Options</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={startSeeding}
                  onChange={(e) => setStartSeeding(e.target.checked)}
                  className="h-4 w-4 accent-theme-accent rounded-none"
                />
                <span className="font-medium">Start seeding immediately on creation</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 accent-rose-400 rounded-none"
                />
                <span className="text-rose-300 font-medium flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Private Torrent (Strict DHT &amp; PEX Disabled)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Tracker Presets & Announce URLs */}
          <div className="p-3.5 bg-ide-bg/60 border border-ide-border space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                <span>Announce Tracker URLs</span>
              </label>
              <span className="text-[10px] text-slate-500">
                {trackers.split('\n').filter(Boolean).length} trackers configured
              </span>
            </div>

            {/* Tracker Presets Toolbar */}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TRACKER_PRESETS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleApplyPreset(key)}
                  className={`px-2.5 py-1 text-[10px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                    activeTrackerPreset === key
                      ? 'bg-theme-tint text-theme-accent border-theme-accent/60 font-bold'
                      : 'bg-ide-surface text-slate-400 border-ide-border hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Zap className="h-2.5 w-2.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <textarea
              value={trackers}
              onChange={(e) => {
                setTrackers(e.target.value)
                setActiveTrackerPreset('custom')
              }}
              rows={3}
              placeholder="udp://tracker.example.com:1337/announce"
              className={`w-full font-mono text-[11px] resize-none ${inputCls}`}
            />
          </div>

          {/* Comment & Created By Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-ide-bg/60 border border-ide-border space-y-1.5">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-slate-400" />
                <span>Comment / Description</span>
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Torrent description note..."
                className={inputCls}
              />
            </div>

            <div className="p-3 bg-ide-bg/60 border border-ide-border space-y-1.5">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Created By Identifier</span>
              </label>
              <input
                type="text"
                value={createdByName}
                onChange={(e) => setCreatedByName(e.target.value)}
                placeholder="Grabbit Client v0.1.1"
                className={inputCls}
              />
            </div>
          </div>

          {/* Generated Result & Magnet Link Card */}
          {generatedPath && (
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between text-emerald-300">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-emerald-500/20 rounded-none border border-emerald-500/40">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">.torrent Packaged Successfully!</span>
                    <span className="font-mono text-[10px] text-emerald-400/90 truncate block max-w-md">
                      {generatedPath}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setGeneratedPath('')}
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              {generatedMagnet && (
                <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-slate-300 truncate max-w-sm">
                    {generatedMagnet}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMagnet}
                    className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold rounded-none cursor-pointer transition flex items-center gap-1 shrink-0"
                  >
                    {copiedMagnet ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Magnet URI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="pt-3 flex items-center justify-between border-t border-ide-border">
            <span className="text-[10px] text-slate-500">
              Compatible with BitTorrent v1, v2, and WebTorrent Swarms
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/4 hover:bg-white/8 border border-ide-border rounded-none transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || !sourcePath}
                className={`px-5 py-2 text-xs font-bold rounded-none transition cursor-pointer flex items-center gap-2 ${
                  !sourcePath || isGenerating
                    ? 'text-slate-500 bg-white/5 border border-ide-border cursor-not-allowed'
                    : 'text-slate-950 bg-theme-accent hover:bg-theme-bright active:scale-[0.98] shadow-lg shadow-theme-accent/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Packaging &amp; Hashing Pieces...</span>
                  </>
                ) : (
                  <>
                    <Hammer className="h-4 w-4" />
                    <span>Create &amp; Package .torrent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
