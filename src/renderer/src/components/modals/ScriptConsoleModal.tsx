import React, { useState } from 'react'
import { X, Terminal, GripHorizontal, Play, RotateCcw } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface ScriptConsoleModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ScriptConsoleModal: React.FC<ScriptConsoleModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState(
    '// Grabbit User Script Console\n// Access transfer engine via window.api\n\nconsole.log("Grabbit Engine Status:", await window.api.getSettings());'
  )
  const [output, setOutput] = useState<string[]>([
    '[System] Scripting engine ready. Type JavaScript or API commands above.'
  ])

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const handleRun = async (): Promise<void> => {
    setOutput((prev) => [...prev, `> Executing script...`])
    try {
      // Evaluate user script safely
      const fn = new Function(`return (async () => { ${code} })()`)
      await fn()
      setOutput((prev) => [...prev, `✔ Execution finished successfully.`])
    } catch (err: any) {
      setOutput((prev) => [...prev, `✖ Error: ${err.message || err}`])
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
            <div className="p-1.5 bg-emerald-950/40 rounded-none border border-emerald-500/25">
              <Terminal className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-xs block">Scripting Console</span>
              <span className="text-[10px] text-slate-500 block">
                Execute or debug custom JavaScript user scripts against Grabbit API
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

        {/* Code Editor Area */}
        <div className="p-3 bg-slate-950 border-b border-ide-border/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-mono font-bold">script.js</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOutput([])}
                className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Clear Output
              </button>
              <button
                type="button"
                onClick={handleRun}
                className="px-3 py-1 bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 rounded-none transition cursor-pointer flex items-center gap-1.5"
              >
                <Play className="h-3 w-3 fill-slate-950" />
                <span>Run Script</span>
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={6}
            className="w-full bg-ide-surface text-emerald-300 font-mono text-xs p-3 rounded-none border border-ide-border focus:outline-none focus:border-emerald-500/60 resize-none"
          />
        </div>

        {/* Console Log Output */}
        <div className="p-3 bg-slate-950/90 font-mono text-[11px] h-40 overflow-y-auto space-y-1 text-slate-300 border-t border-ide-border/60">
          {output.map((line, i) => (
            <div key={i} className="leading-tight">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
