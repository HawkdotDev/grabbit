import React, { useState } from 'react'
import { X, Plus, Trash2, Rss, FolderOpen, Edit2 } from 'lucide-react'
import { RssAutoDownloadRule, DownloadCategory } from '../../../../engine/types'
import { useDraggable } from '../../hooks/useDraggable'

interface RssRulesManagerModalProps {
  isOpen: boolean
  onClose: () => void
  rules: RssAutoDownloadRule[]
  onSave: (rules: RssAutoDownloadRule[]) => void
}

export const RssRulesManagerModal: React.FC<RssRulesManagerModalProps> = ({
  isOpen,
  onClose,
  rules: initialRules,
  onSave
}) => {
  const [ruleList, setRuleList] = useState<RssAutoDownloadRule[]>(initialRules || [])
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(
    initialRules?.[0]?.id || null
  )

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const selectedRule = ruleList.find((r) => r.id === selectedRuleId) || null

  const handleAddRule = () => {
    const newRule: RssAutoDownloadRule = {
      id: String(Date.now()),
      name: `New Rule #${ruleList.length + 1}`,
      mustContain: '',
      mustNotContain: '',
      episodeFilter: '',
      useSmartEpisodeFilter: true,
      category: 'all',
      savePath: '',
      applyToFeeds: ['All Feeds'],
      ignoreMatchesDuration: '0 hours',
      addPaused: false
    }
    setRuleList((prev) => [...prev, newRule])
    setSelectedRuleId(newRule.id)
  }

  const handleRemoveRule = (id: string) => {
    setRuleList((prev) => prev.filter((r) => r.id !== id))
    if (selectedRuleId === id) {
      setSelectedRuleId(ruleList.find((r) => r.id !== id)?.id || null)
    }
  }

  const handleClearAll = () => {
    setRuleList([])
    setSelectedRuleId(null)
  }

  const handleRenameRule = (id: string) => {
    const r = ruleList.find((item) => item.id === id)
    if (!r) return
    const newName = prompt('Enter new rule name:', r.name)
    if (newName && newName.trim()) {
      updateRule(id, { name: newName.trim() })
    }
  }

  const updateRule = (id: string, updates: Partial<RssAutoDownloadRule>) => {
    setRuleList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const handleBrowsePath = async () => {
    if (!selectedRule) return
    if (window.api?.selectDirectory) {
      const selected = await window.api.selectDirectory(selectedRule.savePath)
      if (selected) updateRule(selectedRule.id, { savePath: selected })
    }
  }

  const handleSave = () => {
    onSave(ruleList)
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
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-3xl h-140 shadow-2xl overflow-hidden flex flex-col font-sans text-slate-100 ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="h-9 px-3 bg-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
        >
          <div className="flex items-center gap-2 text-orange-400 font-bold">
            <Rss className="h-4 w-4" />
            <span>RSS Torrent Auto Downloader Rules Manager</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Split: Left Rule List, Right Rule Editor */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-ide-bg">
          {/* Left Panel: Rule List */}
          <div className="w-56 border-r border-ide-border flex flex-col shrink-0 bg-ide-surface">
            <div className="p-2 border-b border-ide-border flex items-center justify-between gap-1 bg-ide-bg">
              <span className="font-semibold text-slate-200 text-xs">Rule List</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-2 py-0.5 bg-theme-accent text-slate-950 font-bold hover:brightness-110 flex items-center gap-0.5 text-[11px] cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-1.5 py-0.5 text-rose-400 hover:bg-rose-950/30 text-[11px] cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-ide-border/40">
              {ruleList.length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic text-xs">
                  No rules configured. Click &quot;Add&quot; to create one.
                </div>
              ) : (
                ruleList.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRuleId(r.id)}
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer group ${
                      selectedRuleId === r.id
                        ? 'bg-theme-tint text-theme-accent border-l-2 border-theme-accent font-semibold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate flex-1 text-xs">{r.name}</span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRenameRule(r.id)
                        }}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveRule(r.id)
                        }}
                        className="text-slate-400 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel: Rule Settings Editor */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ide-surface">
            {selectedRule ? (
              <>
                <div className="border-b border-ide-border pb-2 flex items-center justify-between">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <span>Editing Rule:</span>
                    <span className="text-theme-accent">{selectedRule.name}</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Must Contain */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Must Contain (Regular Expressions / Text field)
                    </label>
                    <input
                      type="text"
                      value={selectedRule.mustContain}
                      onChange={(e) => updateRule(selectedRule.id, { mustContain: e.target.value })}
                      placeholder="e.g. 1080p|720p or Show.Name"
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs focus:border-theme-accent font-mono"
                    />
                  </div>

                  {/* Must Not Contain */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Must Not Contain (Regular Expressions / Text field)
                    </label>
                    <input
                      type="text"
                      value={selectedRule.mustNotContain}
                      onChange={(e) => updateRule(selectedRule.id, { mustNotContain: e.target.value })}
                      placeholder="e.g. SAMPLE|Trailer|CAM"
                      className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs focus:border-theme-accent font-mono"
                    />
                  </div>

                  {/* Episode Filter & Smart Episode Filter */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Episode Filter (syntax e.g. 1x01-05; 2x01;)
                      </label>
                      <input
                        type="text"
                        value={selectedRule.episodeFilter}
                        onChange={(e) => updateRule(selectedRule.id, { episodeFilter: e.target.value })}
                        placeholder="1x01-05; 2x01;"
                        className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2.5 py-1 text-xs focus:border-theme-accent font-mono"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRule.useSmartEpisodeFilter}
                          onChange={(e) =>
                            updateRule(selectedRule.id, { useSmartEpisodeFilter: e.target.checked })
                          }
                          className="rounded border-ide-border bg-ide-bg text-theme-accent focus:ring-0"
                        />
                        <span className="text-xs text-slate-200">Use Smart Episode Filter</span>
                      </label>
                    </div>
                  </div>

                  {/* Category & Differentiation Path */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Assign Category
                      </label>
                      <select
                        value={selectedRule.category}
                        onChange={(e) =>
                          updateRule(selectedRule.id, { category: e.target.value as DownloadCategory })
                        }
                        className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent cursor-pointer"
                      >
                        <option value="all">All / Default</option>
                        <option value="video">Movies & TV (Video)</option>
                        <option value="audio">Music (Audio)</option>
                        <option value="compressed">Archives (Compressed)</option>
                        <option value="documents">Documents</option>
                        <option value="executables">Executables & Software</option>
                        <option value="images">Images</option>
                        <option value="code">Source Code</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Save to Differentiation Path
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={selectedRule.savePath}
                          onChange={(e) => updateRule(selectedRule.id, { savePath: e.target.value })}
                          placeholder="Default save path if empty"
                          className="flex-1 bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleBrowsePath}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-ide-border text-slate-200 flex items-center gap-1 text-xs cursor-pointer"
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Apply Rule to Feeds & Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Apply Rule to Feeds
                      </label>
                      <select
                        value={selectedRule.applyToFeeds[0] || 'All Feeds'}
                        onChange={(e) => updateRule(selectedRule.id, { applyToFeeds: [e.target.value] })}
                        className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent cursor-pointer"
                      >
                        <option value="All Feeds">All Active Feeds</option>
                        <option value="Linux ISO Feeds">Linux ISO Feeds</option>
                        <option value="Media Releases">Media Releases</option>
                        <option value="Software Updates">Software Updates</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Ignore Subsequent Matches For
                      </label>
                      <select
                        value={selectedRule.ignoreMatchesDuration}
                        onChange={(e) => updateRule(selectedRule.id, { ignoreMatchesDuration: e.target.value })}
                        className="w-full bg-ide-bg border border-ide-border text-slate-100 px-2 py-1 text-xs focus:border-theme-accent cursor-pointer"
                      >
                        <option value="0 hours">0 Hours (Don&apos;t ignore)</option>
                        <option value="12 hours">12 Hours</option>
                        <option value="24 hours">1 Day (24 Hours)</option>
                        <option value="7 days">7 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Add Paused */}
                  <div className="pt-2 border-t border-ide-border/50">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRule.addPaused}
                        onChange={(e) => updateRule(selectedRule.id, { addPaused: e.target.checked })}
                        className="rounded border-ide-border bg-ide-bg text-theme-accent focus:ring-0"
                      />
                      <span className="text-xs text-slate-200">Add torrents in paused state</span>
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <p>Select a rule from the left panel or create a new one.</p>
              </div>
            )}
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
            Save RSS Rules
          </button>
        </div>
      </div>
    </div>
  )
}
