import React from 'react'
import { X, Info, ExternalLink, ShieldCheck, Cpu, Code2, GripHorizontal } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'
import appIcon from '../../../../../resources/icon.png'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Title Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-2.5 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <Info className="h-4 w-4 text-theme-accent" />
            <span className="font-bold text-slate-100 text-xs">About Grabbit</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <img src={appIcon} alt="Grabbit Logo" className="w-16 h-16 drop-shadow-xl" />
          <div>
            <h2 className="text-base font-bold text-slate-100 tracking-tight">Grabbit</h2>
            <span className="text-[11px] text-theme-accent font-mono font-semibold block mt-0.5">
              v0.1.1 (Desktop Build)
            </span>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-xs">
              High-performance, hyper-fast desktop download manager &amp; WebTorrent protocol
              engine.
            </p>
          </div>

          {/* Environment Badges */}
          <div className="w-full bg-ide-bg/80 border border-ide-border/80 p-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Cpu className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>Electron v43.3.0</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Code2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>TypeScript v7.0.2</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>WebTorrent v3.0.21</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ExternalLink className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>React v19.2.8</span>
            </div>
          </div>

          {/* License & GitHub */}
          <div className="pt-2 text-center text-[11px] text-slate-500 space-y-1">
            <p>Licensed under Apache-2.0 License</p>
            <p className="font-medium text-slate-400">
              Developed by{' '}
              <a
                href="https://github.com/HawkdotDev"
                target="_blank"
                rel="noreferrer"
                className="text-theme-accent hover:underline"
              >
                HawkdotDev
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
