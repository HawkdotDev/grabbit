import React, { useState } from 'react'
import { DownloadCategory, DownloadPriority } from '../../../../engine/types'
import { X, Download, Sliders, Folder, Link as LinkIcon, FileUp, FolderOpen } from 'lucide-react'

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
}

export const AddDownloadModal: React.FC<AddDownloadModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultSavePath,
  initialMode = 'link'
}) => {
  const [mode, setMode] = useState<'link' | 'file'>(initialMode)
  const [url, setUrl] = useState('')
  const [localFilePath, setLocalFilePath] = useState('')
  const [filename, setFilename] = useState('')
  const [savePath, setSavePath] = useState(defaultSavePath)
  const [threadCount, setThreadCount] = useState(8)
  const [priority, setPriority] = useState<DownloadPriority>('normal')

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      // @ts-ignore - Electron file object has a path property
      setLocalFilePath(file.path || file.name)
      if (!filename) {
        setFilename(file.name)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const targetUrl = mode === 'link' ? url.trim() : localFilePath.trim()
    if (!targetUrl) return

    onAdd({
      url: targetUrl,
      filename: filename.trim() || undefined,
      savePath: savePath.trim() || undefined,
      priority,
      threadCount
    })

    setUrl('')
    setLocalFilePath('')
    setFilename('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-sans text-xs">
      <div className="bg-ide-surface border border-ide-border rounded-none w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-ide-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-theme-tint text-theme-accent rounded-none border border-theme-accent/20">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Add New Download</h2>
              <p className="text-xs text-slate-400">Multi-threaded HTTP & Range Acceleration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-none transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-ide-border bg-ide-bg">
          <button
            type="button"
            onClick={() => setMode('link')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer rounded-none ${
              mode === 'link'
                ? 'border-theme-accent text-theme-accent bg-theme-tint/50 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>URL / Download Link</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer rounded-none ${
              mode === 'file'
                ? 'border-theme-accent text-theme-accent bg-theme-tint/50 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="h-4 w-4" />
            <span>Torrent / Local File</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'link' ? (
            /* Download URL Input */
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Download URL <span className="text-theme-accent">*</span>
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/file.zip"
                className="w-full bg-ide-bg text-slate-100 placeholder-slate-600 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono"
              />
            </div>
          ) : (
            /* Local File / Torrent Picker */
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Torrent or Metalink File <span className="text-theme-accent">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={localFilePath}
                  onChange={(e) => setLocalFilePath(e.target.value)}
                  placeholder="Select or paste path to .torrent or .meta file"
                  className="flex-1 bg-ide-bg text-slate-100 placeholder-slate-600 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono"
                />
                <label className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-ide-border font-semibold flex items-center gap-1.5 cursor-pointer rounded-none transition shrink-0">
                  <FolderOpen className="h-4 w-4 text-theme-accent" />
                  <span>Browse</span>
                  <input
                    type="file"
                    accept=".torrent,.meta,.metalink"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Custom Filename */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Filename (Optional)
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Leave empty for auto-detection"
              className="w-full bg-ide-bg text-slate-100 placeholder-slate-600 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono"
            />
          </div>

          {/* Save Directory */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Folder className="h-3.5 w-3.5 text-slate-400" />
              Save Path
            </label>
            <input
              type="text"
              value={savePath}
              onChange={(e) => setSavePath(e.target.value)}
              className="w-full bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono"
            />
          </div>

          {/* Thread Count & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-theme-accent" />
                  Thread Count
                </span>
                <span className="font-mono text-theme-accent font-bold">{threadCount} Threads</span>
              </label>
              <input
                type="range"
                min="1"
                max="32"
                value={threadCount}
                onChange={(e) => setThreadCount(parseInt(e.target.value, 10))}
                className="w-full accent-theme-accent cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DownloadPriority)}
                className="w-full bg-ide-bg text-slate-100 text-xs px-3.5 py-2.5 rounded-none border border-ide-border focus:outline-none focus:border-theme-accent font-mono cursor-pointer"
              >
                <option value="high">High Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ide-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-none hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-theme-accent hover:bg-theme-bright active:scale-95 rounded-none shadow-lg shadow-theme-accent/20 transition cursor-pointer"
            >
              Start Accelerated Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
