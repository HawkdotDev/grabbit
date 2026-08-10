import React, { useState } from 'react'
import { X, Terminal, GripHorizontal, Play, RotateCcw } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'

interface ScriptConsoleModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESETS: Record<string, string> = {
  'downloads-summary': `// Inspect all downloads and active speeds
const downloads = downloadManager.getDownloads();
console.log("Total downloads:", downloads.length);
downloads.forEach(d => {
  console.log(\`[\${d.status}] \${d.name} - \${(d.downloadedSize / 1048576).toFixed(2)} MB / \${(d.totalSize / 1048576).toFixed(2)} MB (Speed: \${(d.speed / 1024).toFixed(1)} KB/s)\`);
});
return { count: downloads.length, timestamp: Date.now() };`,

  'queue-stats': `// Query queue manager statistics
const stats = downloadManager.getQueueStats();
console.log("Queue Statistics:", stats);
return stats;`,

  'engine-settings': `// View engine configuration & storage
const settings = downloadManager.getSettings();
console.log("Engine Settings:", settings);
return settings;`,

  'storage-inspect': `// Inspect grabbit_data storage files
const storageDir = path.join(process.cwd(), 'grabbit_data');
if (fs.existsSync(storageDir)) {
  const files = fs.readdirSync(storageDir);
  console.log("Storage Files:", files);
  return files;
} else {
  console.log("Storage directory path:", storageDir);
}`
}

export const ScriptConsoleModal: React.FC<ScriptConsoleModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState<string>(PRESETS['downloads-summary'] || '')
  const [output, setOutput] = useState<Array<{ type: 'log' | 'warn' | 'error' | 'info'; text: string }>>([
    { type: 'info', text: '[System] Backend scripting sandbox ready. Select a preset or type JavaScript below.' }
  ])
  const [isRunning, setIsRunning] = useState(false)

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const handleRun = async (): Promise<void> => {
    setIsRunning(true)
    setOutput((prev) => [...prev, { type: 'info', text: `> Executing script in engine sandbox...` }])

    try {
      if (window.api?.executeScript) {
        const res = await window.api.executeScript(code)

        if (res.logs && res.logs.length > 0) {
          setOutput((prev) => [
            ...prev,
            ...res.logs.map((l) => ({ type: l.type, text: l.message || '' }))
          ])
        }

        if (res.result !== undefined) {
          setOutput((prev) => [...prev, { type: 'log', text: `Result: ${res.result}` }])
        }

        if (res.success) {
          setOutput((prev) => [
            ...prev,
            { type: 'info', text: `✔ Finished successfully in ${res.executionTimeMs}ms.` }
          ])
        } else {
          setOutput((prev) => [
            ...prev,
            { type: 'error', text: `✖ Error (${res.executionTimeMs}ms): ${res.error || 'Execution failed'}` }
          ])
        }
      } else {
        const fn = new Function(`return (async () => { ${code} })()`)
        const result = await fn()
        setOutput((prev) => [
          ...prev,
          { type: 'info', text: `✔ Executed in renderer: ${String(result)}` }
        ])
      }
    } catch (err: unknown) {
      setOutput((prev) => [
        ...prev,
        { type: 'error', text: `✖ Error: ${(err as Error).message || String(err)}` }
      ])
    } finally {
      setIsRunning(false)
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
              <span className="font-bold text-slate-100 text-xs block">Scripting Console &amp; REPL</span>
              <span className="text-[10px] text-slate-500 block">
                Execute custom automation scripts directly against Grabbit engine sandbox
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

        {/* Presets & Actions Toolbar */}
        <div className="p-2 bg-slate-950 border-b border-ide-border/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] text-slate-500 font-mono">Presets:</span>
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCode(PRESETS[key] || '')}
                className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 rounded-none border border-ide-border font-mono cursor-pointer"
              >
                {key}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setOutput([])}
              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={handleRun}
              className="px-3 py-1 bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 rounded-none transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="h-3 w-3 fill-slate-950" />
              <span>{isRunning ? 'Running...' : 'Run Script'}</span>
            </button>
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="p-3 bg-slate-950 border-b border-ide-border/80 flex flex-col gap-2">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={7}
            className="w-full bg-ide-surface text-emerald-300 font-mono text-xs p-3 rounded-none border border-ide-border focus:outline-none focus:border-emerald-500/60 resize-none"
          />
        </div>

        {/* Console Log Output */}
        <div className="p-3 bg-slate-950/90 font-mono text-[11px] h-44 overflow-y-auto space-y-1 text-slate-300 border-t border-ide-border/60">
          {output.map((item, i) => (
            <div
              key={i}
              className={`leading-tight ${
                item.type === 'error'
                  ? 'text-rose-400'
                  : item.type === 'warn'
                    ? 'text-amber-400'
                    : item.type === 'info'
                      ? 'text-sky-400'
                      : 'text-emerald-300'
              }`}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
