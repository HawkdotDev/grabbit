import React from 'react'
import { DownloadItem } from '../../../../engine/types'
import { X, Trash2, FileX, AlertTriangle, GripHorizontal } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'
import { formatBytes } from '../../utils/formatters'

interface ConfirmRemoveModalProps {
  download: DownloadItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string, deleteFiles: boolean) => void
}

export const ConfirmRemoveModal: React.FC<ConfirmRemoveModalProps> = ({
  download,
  isOpen,
  onClose,
  onConfirm
}) => {
  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen || !download) return null

  const handleRemoveTaskOnly = (): void => {
    onConfirm(download.id, false)
    onClose()
  }

  const handleRemoveTaskAndFiles = (): void => {
    onConfirm(download.id, true)
    onClose()
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-200 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Modal Header */}
        <div
          onMouseDown={handleMouseDown}
          className="p-4 border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing bg-ide-bg/80"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-4 w-4 text-slate-500 shrink-0 opacity-70" />
            <div className="p-2 bg-rose-950/50 text-rose-400 rounded-none border border-rose-800/40">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Remove Task Confirmation</h2>
              <p className="text-[11px] text-slate-400">Choose how to remove this download task</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body Info */}
        <div className="p-4 space-y-3">
          <div className="p-3 bg-ide-bg border border-zinc-800 space-y-1">
            <div className="text-xs font-semibold text-slate-200 truncate">{download.name}</div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Size: {formatBytes(download.totalSize || 0)}</span>
              <span className="capitalize text-slate-400">Status: {download.status}</span>
            </div>
            {download.savePath && (
              <div className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-zinc-800/80">
                Path: {download.savePath}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-300">
            Would you like to remove only the task entry from Grabbit or delete the downloaded file(s) from disk as well?
          </p>

          {/* Action Options */}
          <div className="space-y-2 pt-1">
            {/* Option A: Remove Task Only */}
            <button
              onClick={handleRemoveTaskOnly}
              className="w-full p-3 bg-ide-surface hover:bg-white/5 border border-zinc-700/80 hover:border-slate-500 text-left transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 text-slate-200 group-hover:text-theme-accent transition">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Remove Task Only</div>
                  <div className="text-[11px] text-slate-400">
                    Keep downloaded file(s) intact on your hard drive
                  </div>
                </div>
              </div>
            </button>

            {/* Option B: Remove Task & Delete Files */}
            <button
              onClick={handleRemoveTaskAndFiles}
              className="w-full p-3 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/40 hover:border-rose-700/80 text-left transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-900/40 text-rose-400 transition">
                  <FileX className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-rose-300 text-xs">Remove Task &amp; Delete Files</div>
                  <div className="text-[11px] text-rose-400/80">
                    Permanently delete file(s) from your disk
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Footer / Cancel Button */}
        <div className="p-3 bg-ide-bg border-t border-ide-border flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
