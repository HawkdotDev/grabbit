import React, { useState } from 'react'
import { DownloadItem } from '../../../engine/types'
import { Terminal as TerminalIcon, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react'

interface TerminalDrawerProps {
  downloads: DownloadItem[]
  globalSpeed: number
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({ downloads, globalSpeed }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'problems' | 'output' | 'debug'>(
    'terminal'
  )
  const [isCollapsed, setIsCollapsed] = useState(false)

  const activeDownloads = downloads.filter((d) => d.status === 'downloading')
  const errorCount = downloads.filter((d) => d.status === 'error').length

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec <= 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
    return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <footer className="bg-ide-surface border-t border-ide-border flex flex-col font-mono text-xs select-none shrink-0">
      {/* Drawer Header Tabs */}
      <div className="h-9 px-4 flex items-center justify-between bg-[#141518] border-b border-[#23252b]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-1.5 py-1 text-xs cursor-pointer ${
              activeTab === 'problems'
                ? 'text-lime-accent font-bold border-b-2 border-lime-accent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>PROBLEMS</span>
            <span className="px-1.5 py-0.2 bg-ide-border rounded-full text-[10px] text-slate-300">
              {errorCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`py-1 text-xs cursor-pointer ${
              activeTab === 'output'
                ? 'text-lime-accent font-bold border-b-2 border-lime-accent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OUTPUT
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1 py-1 text-xs cursor-pointer ${
              activeTab === 'terminal'
                ? 'text-lime-accent font-bold border-b-2 border-lime-accent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="h-3.5 w-3.5" />
            <span>TERMINAL</span>
          </button>

          <button
            onClick={() => setActiveTab('debug')}
            className={`py-1 text-xs cursor-pointer ${
              activeTab === 'debug'
                ? 'text-lime-accent font-bold border-b-2 border-lime-accent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DEBUG CONSOLE
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer"
        >
          {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Terminal Content Body */}
      {!isCollapsed && (
        <div className="h-28 bg-ide-bg p-3 overflow-y-auto space-y-1 text-[11px] text-slate-300 font-mono">
          <div className="text-slate-500">
            [Neobit Kernel v1.0.0] Multithreaded Engine initialized on Bun v1.2.0
          </div>

          {activeDownloads.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <span className="text-lime-accent font-bold">[ENGINE ACTIVE]</span>
              <span className="text-slate-400">Task {d.id}:</span>
              <span className="text-slate-200 font-semibold truncate max-w-xs">{d.name}</span>
              <span className="text-cyan-400">@ {formatSpeed(d.speed)}</span>
              <span className="text-slate-500">({d.threadCount} worker threads pwrite)</span>
            </div>
          ))}

          {downloads.length === 0 && (
            <div className="text-slate-600 italic">
              No active downloads. System idle on port 5173...
            </div>
          )}
        </div>
      )}

      {/* Bottom IDE Status Bar */}
      <div className="h-7 px-4 bg-[#0d0e11] border-t border-[#23252b] flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-lime-accent" />
            <span>Neobit Active</span>
          </span>
          <span>Speed: {formatSpeed(globalSpeed)}</span>
          <span className="flex items-center gap-1 text-rose-400">
            <AlertCircle className="h-3 w-3" />
            <span>{errorCount} errors</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span>Ln 12, Col 6</span>
          <span>Spaces: 4</span>
          <span>UTF-8</span>
          <span>CRLF</span>
          <span className="text-lime-accent">TypeScript</span>
        </div>
      </div>
    </footer>
  )
}
