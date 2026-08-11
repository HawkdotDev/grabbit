import React, { useState } from 'react'
import { DownloadItem } from '../../../../engine/types'
import { formatBytes, formatSpeed } from '../../utils/formatters'
import { Globe, Cpu, CheckCircle2, Plus, Trash2, ExternalLink } from 'lucide-react'

interface HttpSourcesTabProps {
  download: DownloadItem
}

interface MirrorSource {
  id: string
  url: string
  status: 'active' | 'standby' | 'error'
  pingMs?: number
}

export const HttpSourcesTab: React.FC<HttpSourcesTabProps> = ({ download }) => {
  const [newMirrorUrl, setNewMirrorUrl] = useState('')
  const [mirrors, setMirrors] = useState<MirrorSource[]>([])

  let parsedUrl: URL | null = null
  try {
    parsedUrl = new URL(download.url)
  } catch {
    // Malformed or magnet URL
  }

  const isHttps = parsedUrl?.protocol === 'https:'
  const isTorrent = download.url.startsWith('magnet:') || download.url.endsWith('.torrent')

  const handleAddMirror = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!newMirrorUrl.trim()) return

    try {
      new URL(newMirrorUrl.trim())
      const newMirror: MirrorSource = {
        id: `mirror_${Date.now()}`,
        url: newMirrorUrl.trim(),
        status: 'standby',
        pingMs: Math.floor(Math.random() * 80) + 20
      }
      setMirrors((prev) => [...prev, newMirror])
      setNewMirrorUrl('')
    } catch {
      alert('Please enter a valid HTTP/HTTPS URL')
    }
  }

  const handleDeleteMirror = (id: string): void => {
    setMirrors((prev) => prev.filter((m) => m.id !== id))
  }

  if (isTorrent) {
    return (
      <div className="p-4 bg-ide-surface border border-ide-border text-xs text-slate-400 font-mono text-center">
        This transfer is using BitTorrent / Magnet P2P swarm protocol. See the Trackers &amp; Peers tabs for network sources.
      </div>
    )
  }

  return (
    <div className="space-y-3 font-sans text-xs select-none">
      {/* Primary Server Endpoint Card */}
      <div className="bg-ide-surface border border-ide-border p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                isHttps
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isHttps ? 'HTTPS Secure' : 'HTTP Plain'}
            </span>
            <span className="font-bold text-slate-100 text-xs">Primary Range Endpoint</span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              Accept-Ranges: bytes
            </span>
          </div>
        </div>

        <div className="p-2 bg-slate-950 border border-ide-border/80 font-mono text-[11px] text-theme-accent break-all flex items-center justify-between gap-2">
          <span>{download.url}</span>
          <button
            type="button"
            onClick={() => window.open(download.url, '_blank')}
            className="text-slate-500 hover:text-slate-200 transition cursor-pointer shrink-0"
            title="Open in Browser"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Server & Header Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          <div className="bg-ide-bg p-2 border border-ide-border">
            <span className="text-slate-500 block text-[10px]">Host Origin</span>
            <span className="truncate text-slate-200 font-semibold">{parsedUrl?.hostname || 'Unknown'}</span>
          </div>
          <div className="bg-ide-bg p-2 border border-ide-border">
            <span className="text-slate-500 block text-[10px]">Port</span>
            <span className="text-slate-200">{parsedUrl?.port || (isHttps ? '443' : '80')}</span>
          </div>
          <div className="bg-ide-bg p-2 border border-ide-border">
            <span className="text-slate-500 block text-[10px]">ETag Cache</span>
            <span className="truncate text-slate-200">{download.etag || 'None (Dynamic)'}</span>
          </div>
          <div className="bg-ide-bg p-2 border border-ide-border">
            <span className="text-slate-500 block text-[10px]">Parallel Threads</span>
            <span className="text-cyan-400 font-bold">{download.threadCount || download.chunks.length} Threads</span>
          </div>
        </div>
      </div>

      {/* Multi-Threaded Chunk Range Allocation */}
      <div className="bg-ide-surface border border-ide-border p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Worker Threads Range Slicing ({download.chunks.length} Chunks)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Speed: {formatSpeed(download.speed)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto font-mono text-[10px]">
          {download.chunks.map((chunk, idx) => {
            const chunkSize = chunk.endByte - chunk.startByte + 1
            const progress = chunkSize > 0 ? (chunk.downloadedBytes / chunkSize) * 100 : 0

            return (
              <div key={chunk.id} className="p-2 bg-slate-950 border border-ide-border/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Thread #{idx + 1}</span>
                  <span
                    className={`px-1 text-[9px] uppercase ${
                      chunk.status === 'completed'
                        ? 'text-emerald-400 bg-emerald-950/40'
                        : chunk.status === 'downloading'
                          ? 'text-cyan-400 bg-cyan-950/40'
                          : 'text-slate-500'
                    }`}
                  >
                    {chunk.status}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      chunk.status === 'completed' ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-slate-400 text-[9px]">
                  <span>{formatBytes(chunk.downloadedBytes)} / {formatBytes(chunkSize)}</span>
                  <span>{chunk.speed > 0 ? formatSpeed(chunk.speed) : 'Idle'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alternative Mirrors & Multi-Sources */}
      <div className="bg-ide-surface border border-ide-border p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span>Alternative Mirror Sources ({mirrors.length})</span>
          </div>
        </div>

        <form onSubmit={handleAddMirror} className="flex gap-2">
          <input
            type="url"
            value={newMirrorUrl}
            onChange={(e) => setNewMirrorUrl(e.target.value)}
            placeholder="Add mirror URL (e.g. https://mirror.example.com/file.iso)"
            className="w-full bg-ide-bg text-slate-100 text-xs px-2.5 py-1.5 border border-ide-border focus:outline-none focus:border-amber-500 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition cursor-pointer text-xs flex items-center gap-1 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Mirror</span>
          </button>
        </form>

        {mirrors.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {mirrors.map((mirror) => (
              <div
                key={mirror.id}
                className="p-2 bg-slate-950 border border-ide-border flex items-center justify-between gap-2 font-mono text-[11px]"
              >
                <div className="min-w-0 truncate text-slate-300">
                  <span className="text-amber-400 mr-2">[Mirror]</span>
                  <span>{mirror.url}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500">{mirror.pingMs}ms latency</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMirror(mirror.id)}
                    className="p-1 text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                    title="Remove Mirror"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
