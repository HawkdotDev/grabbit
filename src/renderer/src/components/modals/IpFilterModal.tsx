import React, { useState } from 'react'
import { X, Plus, Trash2, ShieldAlert, FolderOpen, RefreshCw } from 'lucide-react'
import { IpFilterEntry } from '../../../../engine/types'
import { useDraggable } from '../../hooks/useDraggable'

interface IpFilterModalProps {
  isOpen: boolean
  onClose: () => void
  ipFilterPath: string
  ipFilterApplyToTrackers: boolean
  bannedIps: IpFilterEntry[]
  onSave: (data: {
    ipFilterPath: string
    ipFilterApplyToTrackers: boolean
    bannedIps: IpFilterEntry[]
  }) => void
}

export const IpFilterModal: React.FC<IpFilterModalProps> = ({
  isOpen,
  onClose,
  ipFilterPath: initialPath,
  ipFilterApplyToTrackers: initialApplyToTrackers,
  bannedIps: initialBannedIps,
  onSave
}) => {
  const [filterPath, setFilterPath] = useState(initialPath || '')
  const [applyToTrackers, setApplyToTrackers] = useState(initialApplyToTrackers ?? true)
  const [entries, setEntries] = useState<IpFilterEntry[]>(initialBannedIps || [])

  const [newIp, setNewIp] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const handleBrowsePath = async () => {
    if (window.api?.selectDirectory) {
      const selected = await window.api.selectDirectory(filterPath)
      if (selected) setFilterPath(selected)
    }
  }

  const handleAddRule = () => {
    if (!newIp.trim()) return
    const newEntry: IpFilterEntry = {
      id: String(Date.now()),
      ipOrRange: newIp.trim(),
      description: newDesc.trim() || 'Manual Ban'
    }
    setEntries((prev) => [...prev, newEntry])
    setNewIp('')
    setNewDesc('')
  }

  const handleRemoveRule = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAll = () => {
    setEntries([])
  }

  const handleSave = () => {
    onSave({
      ipFilterPath: filterPath,
      ipFilterApplyToTrackers: applyToTrackers,
      bannedIps: entries
    })
    onClose()
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-60 bg-slate-950/60 flex items-center justify-center p-3 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-2xl h-130 shadow-2xl overflow-hidden flex flex-col font-sans text-slate-100 ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="h-9 px-3 bg-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
        >
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>IP Filter & Banned IP Addresses</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* External Filter File */}
          <div className="bg-ide-card p-3 border border-ide-border space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">
              Filter File Path (.dat, .p2p, .p2b files)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filterPath}
                onChange={(e) => setFilterPath(e.target.value)}
                placeholder="C:/path/to/ipfilter.dat"
                className="flex-1 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
              />
              <button
                type="button"
                onClick={handleBrowsePath}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-ide-border text-slate-200 flex items-center gap-1 text-xs cursor-pointer"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>Browse</span>
              </button>
              <button
                type="button"
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-ide-border text-slate-200 flex items-center gap-1 text-xs cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reload</span>
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={applyToTrackers}
                onChange={(e) => setApplyToTrackers(e.target.checked)}
                className="rounded border-ide-border bg-ide-bg text-theme-accent focus:ring-0"
              />
              <span className="text-xs text-slate-300">Apply IP filter rules to trackers</span>
            </label>
          </div>

          {/* Manual Banned IP List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Banned IP Addresses / Subnet Ranges</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-rose-400 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Add New Rule Bar */}
            <div className="flex items-center gap-2 bg-ide-card p-2 border border-ide-border">
              <input
                type="text"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="IP / CIDR (e.g. 192.168.1.50 or 10.0.0.0/16)"
                className="w-1/2 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Reason / Note"
                className="flex-1 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-sans"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1 bg-theme-accent text-slate-950 font-bold hover:brightness-110 flex items-center gap-1 text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List Table */}
            <div className="border border-ide-border bg-ide-bg h-48 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-ide-border text-slate-400 font-medium">
                    <th className="p-2 border-r border-ide-border">IP Address / Range</th>
                    <th className="p-2 border-r border-ide-border">Description</th>
                    <th className="p-2 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ide-border/50 text-slate-200">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500 italic">
                        No banned IP rules defined.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/5">
                        <td className="p-2 border-r border-ide-border font-mono text-amber-400">
                          {entry.ipOrRange}
                        </td>
                        <td className="p-2 border-r border-ide-border text-slate-300">
                          {entry.description || '-'}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRule(entry.id)}
                            className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-11 px-4 bg-ide-bg border-t border-ide-border flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-ide-border cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1 bg-theme-accent text-slate-950 font-bold hover:brightness-110 cursor-pointer"
          >
            Save IP Filters
          </button>
        </div>
      </div>
    </div>
  )
}
