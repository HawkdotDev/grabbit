import React, { useState } from 'react'
import { DownloadCategory, DownloadPriority } from '../../../engine/types'
import { X, Download, Sliders, Folder } from 'lucide-react'

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
}

export const AddDownloadModal: React.FC<AddDownloadModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultSavePath
}) => {
  const [url, setUrl] = useState('')
  const [filename, setFilename] = useState('')
  const [savePath, setSavePath] = useState(defaultSavePath)
  const [threadCount, setThreadCount] = useState(8)
  const [priority, setPriority] = useState<DownloadPriority>('normal')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!url.trim()) return

    onAdd({
      url: url.trim(),
      filename: filename.trim() || undefined,
      savePath: savePath.trim() || undefined,
      priority,
      threadCount
    })

    setUrl('')
    setFilename('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-sans text-xs">
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-none w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#381c1c] text-[#e44232] rounded-none border border-[#e44232]/20">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Add New Task</h2>
              <p className="text-xs text-slate-400">Multi-threaded HTTP Range Acceleration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-none transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Download URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Download URL <span className="text-[#e44232]">*</span>
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/file.zip"
              className="w-full bg-[#141414] text-slate-100 placeholder-slate-600 text-xs px-3.5 py-2.5 rounded-none border border-[#2e2e2e] focus:outline-none focus:border-[#e44232] font-mono"
            />
          </div>

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
              className="w-full bg-[#141414] text-slate-100 placeholder-slate-600 text-xs px-3.5 py-2.5 rounded-none border border-[#2e2e2e] focus:outline-none focus:border-[#e44232] font-mono"
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
              className="w-full bg-[#141414] text-slate-100 text-xs px-3.5 py-2.5 rounded-none border border-[#2e2e2e] focus:outline-none focus:border-[#e44232] font-mono"
            />
          </div>

          {/* Thread Count & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-[#e44232]" />
                  Thread Count
                </span>
                <span className="font-mono text-[#e44232] font-bold">{threadCount} Threads</span>
              </label>
              <input
                type="range"
                min="1"
                max="32"
                value={threadCount}
                onChange={(e) => setThreadCount(parseInt(e.target.value, 10))}
                className="w-full accent-[#e44232] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DownloadPriority)}
                className="w-full bg-[#141414] text-slate-100 text-xs px-3.5 py-2.5 rounded-none border border-[#2e2e2e] focus:outline-none focus:border-[#e44232] font-mono cursor-pointer"
              >
                <option value="high">High Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e2e2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-none hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#e44232] hover:bg-[#ff4d3d] active:scale-95 rounded-none shadow-lg shadow-[#e44232]/20 transition cursor-pointer"
            >
              Start Accelerated Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
