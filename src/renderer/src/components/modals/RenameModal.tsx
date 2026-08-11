import React, { useState, useEffect, useRef } from 'react'
import { DownloadItem } from '../../../../engine/types'
import { X, Pencil, GripHorizontal } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface RenameModalProps {
  download: DownloadItem | null
  isOpen: boolean
  onClose: () => void
  onRenamed?: (id: string, newName: string) => void
}

export const RenameModal: React.FC<RenameModalProps> = ({
  download,
  isOpen,
  onClose,
  onRenamed
}) => {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  useEffect(() => {
    if (download) {
      setName(download.name || '')
      setError(null)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 50)
    }
  }, [download, isOpen])

  if (!isOpen || !download) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) {
      setError('Task name cannot be empty')
      return
    }

    try {
      if (window.api?.renameDownload) {
        await window.api.renameDownload(download.id, cleanName)
      }
      onRenamed?.(download.id, cleanName)
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Failed to rename task')
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
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${isDragging ? 'transition-none duration-0' : ''
          } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="p-4 border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-4 w-4 text-slate-500 shrink-0 opacity-70" />
            <div className="p-2 bg-sky-950/40 text-sky-400 rounded-none border border-sky-500/30">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Rename Task</h2>
              <p className="text-[10px] text-slate-400">Rename task and relocate destination file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Task Name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              className="w-full bg-ide-bg text-slate-100 text-xs px-3 py-2 border border-ide-border focus:outline-none focus:border-sky-500 font-mono"
            />
            {error && <div className="text-[11px] text-rose-400 font-mono mt-1">{error}</div>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-ide-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-theme-accent text-slate-950 font-bold hover:bg-theme-bright transition cursor-pointer text-xs"
            >
              Save Name
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
