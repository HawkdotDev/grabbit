import React, { useState } from 'react'
import { X, Zap, GripHorizontal, Plus, Trash2 } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface AutomationsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface RuleItem {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
}

export const AutomationsModal: React.FC<AutomationsModalProps> = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState<RuleItem[]>([
    {
      id: 'r1',
      name: 'Auto-Unpack Archives',
      trigger: 'On Download Complete',
      action: 'Extract compressed archive to target folder',
      enabled: true
    },
    {
      id: 'r2',
      name: 'Execute Shell Script',
      trigger: 'On Download Complete',
      action: 'Run custom post-processing script',
      enabled: false
    },
    {
      id: 'r3',
      name: 'Post Webhook Event',
      trigger: 'On Error / Fail',
      action: 'Send HTTP POST payload to remote server',
      enabled: true
    }
  ])

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const toggleRule = (id: string): void => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  const deleteRule = (id: string): void => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4 select-none font-sans text-xs"
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
          className="px-4 py-2.5 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <div className="p-1.5 bg-amber-950/40 rounded-none border border-amber-500/25">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-xs block">
                Automations &amp; Event Triggers
              </span>
              <span className="text-[10px] text-slate-500 block">
                Configure event-driven post-processing rules and webhooks
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

        {/* Action Header */}
        <div className="p-3 bg-ide-bg/60 border-b border-ide-border/80 flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold">
            Active Event Rules ({rules.length})
          </span>
          <button
            type="button"
            onClick={() => {
              const newRule: RuleItem = {
                id: `r_${Date.now()}`,
                name: 'New Custom Rule',
                trigger: 'On Download Complete',
                action: 'Play Notification Sound',
                enabled: true
              }
              setRules([...rules, newRule])
            }}
            className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 rounded-none transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Rule</span>
          </button>
        </div>

        {/* Rules List */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-ide-bg/70 border border-ide-border/80 p-3.5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-xs">{rule.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-amber-950/40 border border-amber-500/20 text-amber-400 font-mono">
                    {rule.trigger}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">{rule.action}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleRule(rule.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-none cursor-pointer transition ${
                    rule.enabled
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-500 border border-ide-border'
                  }`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteRule(rule.id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-950/30 rounded-none transition cursor-pointer"
                  title="Delete Rule"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
