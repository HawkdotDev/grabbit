import React, { useState, useMemo, useEffect, useRef } from 'react'
import { DownloadItem } from '../../../../engine/types'
import { formatBytes, formatSpeed } from '../../utils/formatters'
import { Search, Plus, ShieldAlert, Eye, EyeOff, Columns, Check, RotateCcw } from 'lucide-react'

interface PeersTabProps {
  download?: DownloadItem | null
}

interface PeerRowData {
  id: string
  country: string
  countryFlag: string
  ip: string
  port: number | string
  connection: string
  flags: string
  client: string
  progress: number
  downSpeed: number
  upSpeed: number
  reqs: string
  downloaded: number
  uploaded: number
  peerDlSpeed: number
  relevance: number
  files: string
  choked: boolean
}

export type PeerColumnId =
  | 'country'
  | 'ip'
  | 'port'
  | 'connection'
  | 'client'
  | 'flags'
  | 'progress'
  | 'downSpeed'
  | 'upSpeed'
  | 'reqs'
  | 'uploaded'
  | 'downloaded'
  | 'peerDlSpeed'
  | 'relevance'
  | 'files'

export interface ColumnDef {
  id: PeerColumnId
  label: string
}

export const ALL_PEER_COLUMNS: ColumnDef[] = [
  { id: 'country', label: 'Country/Region' },
  { id: 'ip', label: 'IP/Address' },
  { id: 'port', label: 'Port' },
  { id: 'connection', label: 'Connection' },
  { id: 'client', label: 'Client' },
  { id: 'flags', label: 'Flags' },
  { id: 'progress', label: '% (Progress)' },
  { id: 'downSpeed', label: 'Down Speed' },
  { id: 'upSpeed', label: 'Up Speed' },
  { id: 'reqs', label: 'Reqs' },
  { id: 'uploaded', label: 'Uploaded' },
  { id: 'downloaded', label: 'Downloaded' },
  { id: 'peerDlSpeed', label: 'Peer dl. Speed' },
  { id: 'relevance', label: 'Relevance' },
  { id: 'files', label: 'Files' }
]

const COUNTRY_FLAG_MAP: Record<string, string> = {
  NL: '🇳🇱',
  MX: '🇲🇽',
  HU: '🇭🇺',
  CA: '🇨🇦',
  AU: '🇦🇺',
  US: '🇺🇸',
  DE: '🇩🇪',
  GB: '🇬🇧',
  FR: '🇫🇷',
  SE: '🇸🇪',
  JP: '🇯🇵',
  BR: '🇧🇷'
}

export const PeersTab: React.FC<PeersTabProps> = ({ download }) => {
  const [filterQuery, setFilterQuery] = useState('')
  const [selectedPeerIds, setSelectedPeerIds] = useState<Set<string>>(new Set())
  const [newPeerAddress, setNewPeerAddress] = useState('')
  const [isAddingPeer, setIsAddingPeer] = useState(false)
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const columnMenuRef = useRef<HTMLDivElement>(null)

  // Column visibility state persisted in localStorage
  const [visibleColumns, setVisibleColumns] = useState<Record<PeerColumnId, boolean>>(() => {
    try {
      const saved = localStorage.getItem('neobit_peers_visible_columns')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      // ignore JSON parse error
    }
    return {
      country: true,
      ip: true,
      port: true,
      connection: true,
      client: true,
      flags: true,
      progress: true,
      downSpeed: true,
      upSpeed: true,
      reqs: true,
      uploaded: true,
      downloaded: true,
      peerDlSpeed: true,
      relevance: true,
      files: true
    }
  })

  // Close column menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false)
      }
    }
    if (showColumnMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColumnMenu])

  const toggleColumn = (id: PeerColumnId) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem('neobit_peers_visible_columns', JSON.stringify(next))
      } catch (e) {
        // ignore storage errors
      }
      return next
    })
  }

  const showAllColumns = () => {
    const allOn: Record<PeerColumnId, boolean> = {
      country: true,
      ip: true,
      port: true,
      connection: true,
      client: true,
      flags: true,
      progress: true,
      downSpeed: true,
      upSpeed: true,
      reqs: true,
      uploaded: true,
      downloaded: true,
      peerDlSpeed: true,
      relevance: true,
      files: true
    }
    setVisibleColumns(allOn)
    try {
      localStorage.setItem('neobit_peers_visible_columns', JSON.stringify(allOn))
    } catch (e) {}
  }

  const activeColumnCount = useMemo(() => {
    return Object.values(visibleColumns).filter(Boolean).length
  }, [visibleColumns])

  const url = download?.url || ''
  const isTorrent =
    download && (url.startsWith('magnet:') || url.endsWith('.torrent') || !!download.infoHash)

  // Construct raw peer list from download telemetry — no fallbacks, real data only
  const peersList: PeerRowData[] = useMemo(() => {
    if (download?.peersInfo && download.peersInfo.length > 0) {
      return download.peersInfo.map((p, idx) => {
        const countryCode = (p.country || '').toUpperCase()
        const flag = countryCode ? (COUNTRY_FLAG_MAP[countryCode] || '🌐') : '🌐'
        return {
          id: `peer_${idx}_${p.ip}`,
          country: p.countryName || countryCode || '',
          countryFlag: flag,
          ip: p.ip || '0.0.0.0',
          port: p.port || 0,
          connection: p.connection || 'BT',
          flags: p.flags || 'H',
          client: p.clientName || '',
          progress: p.progress ?? 0.0,
          downSpeed: p.downloadSpeed || 0,
          upSpeed: p.uploadSpeed || 0,
          reqs: p.reqs || '0 | 0',
          uploaded: p.uploaded || 0,
          downloaded: p.downloaded || 0,
          peerDlSpeed: p.peerDlSpeed || 0,
          relevance: p.relevance ?? 0.0,
          files: p.files || '[Multiple files]',
          choked: !!p.choked
        }
      })
    }
    return []
  }, [download?.peersInfo])

  // Filtered peer list
  const filteredPeers = useMemo(() => {
    const q = filterQuery.trim().toLowerCase()
    if (!q) return peersList
    return peersList.filter(
      (p) =>
        p.ip.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.connection.toLowerCase().includes(q) ||
        p.flags.toLowerCase().includes(q)
    )
  }, [peersList, filterQuery])

  const toggleSelectPeer = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation()
    setSelectedPeerIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddPeerSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newPeerAddress.trim() || !download) return

    const peerStr = newPeerAddress.trim()
    if (window.api?.addTorrentPeer) {
      await window.api.addTorrentPeer(download.id, peerStr)
    }
    setNewPeerAddress('')
    setIsAddingPeer(false)
  }

  if (!isTorrent) {
    return (
      <div className="p-4 bg-[#1e1e1e] border border-[#2a2a2a] text-xs text-slate-400 font-mono text-center">
        Swarm peer connections are only active for BitTorrent and Magnet P2P transfers.
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col font-sans text-xs select-none bg-ide-bg text-slate-200 min-h-55">
      {/* ─── Action Bar & Filter Controls ─── */}
      <div className="p-1.5 bg-ide-surface border-b border-ide-border flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedPeerIds(new Set(filteredPeers.map((p) => p.id)))}
            className="px-2.5 py-0.5 text-[11px] font-medium bg-ide-bg hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer"
          >
            Select All
          </button>
          <button
            onClick={() => setSelectedPeerIds(new Set())}
            className="px-2.5 py-0.5 text-[11px] font-medium bg-ide-bg hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer"
          >
            Select None
          </button>

          <button
            onClick={() => setIsAddingPeer(!isAddingPeer)}
            className="ml-2 px-2 py-0.5 text-[11px] font-medium bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            <span>Add Peer</span>
          </button>

          {selectedPeerIds.size > 0 && (
            <button
              onClick={() => setSelectedPeerIds(new Set())}
              className="px-2 py-0.5 text-[11px] font-medium bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-600/40 transition cursor-pointer flex items-center gap-1"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Ban Selected ({selectedPeerIds.size})</span>
            </button>
          )}

          {/* ─── Hide / Show Columns Popover Menu ─── */}
          <div className="relative ml-2" ref={columnMenuRef}>
            <button
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className={`px-2 py-0.5 text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                showColumnMenu
                  ? 'bg-theme-tint text-theme-accent border-theme-accent'
                  : 'bg-ide-bg hover:bg-white/10 text-slate-300 border-ide-border'
              }`}
              title="Show or hide table columns"
            >
              <Columns className="h-3 w-3" />
              <span>Columns ({activeColumnCount}/15)</span>
            </button>

            {showColumnMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-ide-surface border border-ide-border shadow-2xl z-50 p-2 flex flex-col gap-1 rounded-none text-xs">
                <div className="flex items-center justify-between px-1.5 py-1 border-b border-ide-border/70 text-slate-300 font-semibold text-[11px]">
                  <span>Show / Hide Columns</span>
                  <button
                    onClick={showAllColumns}
                    className="text-[10px] text-theme-accent hover:underline flex items-center gap-0.5"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Show All</span>
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto flex flex-col gap-0.5 py-1">
                  {ALL_PEER_COLUMNS.map((col) => {
                    const isVisible = visibleColumns[col.id] !== false
                    return (
                      <button
                        key={col.id}
                        onClick={() => toggleColumn(col.id)}
                        className={`w-full flex items-center justify-between px-2 py-1 text-[11px] rounded-none transition text-left cursor-pointer ${
                          isVisible
                            ? 'text-slate-100 hover:bg-white/10'
                            : 'text-slate-500 hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isVisible ? (
                            <Eye className="h-3 w-3 text-theme-accent" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-slate-600" />
                          )}
                          <span>{col.label}</span>
                        </span>
                        {isVisible && <Check className="h-3 w-3 text-theme-accent" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative flex items-center">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter peers..."
            className="w-48 bg-ide-bg text-slate-100 text-[11px] pl-7 pr-2 py-0.5 border border-ide-border focus:outline-none focus:border-theme-accent font-sans"
          />
        </div>
      </div>

      {/* Add Peer Form */}
      {isAddingPeer && (
        <form onSubmit={handleAddPeerSubmit} className="p-2 bg-ide-surface border-b border-ide-border flex items-center gap-2">
          <input
            type="text"
            value={newPeerAddress}
            onChange={(e) => setNewPeerAddress(e.target.value)}
            placeholder="192.168.1.100:6881"
            className="flex-1 bg-ide-bg text-slate-100 font-mono text-xs px-2 py-1 border border-ide-border focus:outline-none focus:border-theme-accent"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 bg-theme-tint text-theme-accent border border-theme-accent/50 font-bold hover:bg-theme-accent/20 transition cursor-pointer text-xs"
          >
            Add Peer
          </button>
        </form>
      )}

      {/* ─── Peers Table (Configurable Columns) ─── */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left font-sans text-[11px] border-collapse min-w-245">
          <thead
            onContextMenu={(e) => {
              e.preventDefault()
              setShowColumnMenu(true)
            }}
            className="bg-ide-surface text-slate-300 sticky top-0 border-b border-ide-border font-semibold select-none cursor-pointer"
            title="Right-click to toggle column visibility"
          >
            <tr>
              {visibleColumns.country !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-24">Country/Region</th>
              )}
              {visibleColumns.ip !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal min-w-44">IP/Address</th>
              )}
              {visibleColumns.port !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-16 text-right">Port</th>
              )}
              {visibleColumns.connection !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-20">Connection</th>
              )}
              {visibleColumns.client !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal min-w-36">Client</th>
              )}
              {visibleColumns.flags !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-16">Flags</th>
              )}
              {visibleColumns.progress !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-16 text-right">%</th>
              )}
              {visibleColumns.downSpeed !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-24 text-right">Down Speed</th>
              )}
              {visibleColumns.upSpeed !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-24 text-right">Up Speed</th>
              )}
              {visibleColumns.reqs !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-16 text-center">Reqs</th>
              )}
              {visibleColumns.uploaded !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-24 text-right">Uploaded</th>
              )}
              {visibleColumns.downloaded !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-24 text-right">Downloaded</th>
              )}
              {visibleColumns.peerDlSpeed !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-24 text-right">Peer dl.</th>
              )}
              {visibleColumns.relevance !== false && (
                <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-20 text-right">Relevance</th>
              )}
              {visibleColumns.files !== false && (
                <th className="py-1 px-2 font-normal min-w-28">Files</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ide-border/40">
            {filteredPeers.map((peer, idx) => {
              const isSelected = selectedPeerIds.has(peer.id)

              return (
                <tr
                  key={peer.id}
                  onClick={(e) => toggleSelectPeer(peer.id, e)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-theme-tint/80 text-white font-semibold border-l-2 border-theme-accent'
                      : idx % 2 === 0
                      ? 'bg-ide-surface/30 hover:bg-white/5'
                      : 'bg-ide-bg hover:bg-white/5'
                  }`}
                >
                  {/* Country Flag & Code */}
                  {visibleColumns.country !== false && (
                    <td className="py-1 px-2 flex items-center gap-1.5 truncate">
                      <span className="text-base leading-none">{peer.countryFlag}</span>
                      <span className="text-slate-300 font-mono text-[10px]">{peer.country || 'N/A'}</span>
                    </td>
                  )}

                  {/* IP Address */}
                  {visibleColumns.ip !== false && (
                    <td className="py-1 px-2 font-mono text-slate-200 font-medium truncate max-w-xs">{peer.ip}</td>
                  )}

                  {/* Port */}
                  {visibleColumns.port !== false && (
                    <td className="py-1 px-2 text-right font-mono text-slate-300">{peer.port || ''}</td>
                  )}

                  {/* Connection */}
                  {visibleColumns.connection !== false && (
                    <td className="py-1 px-2 font-mono text-slate-300">{peer.connection}</td>
                  )}

                  {/* Client Agent */}
                  {visibleColumns.client !== false && (
                    <td className="py-1 px-2 font-sans text-slate-300 truncate max-w-xs">{peer.client}</td>
                  )}

                  {/* Flags */}
                  {visibleColumns.flags !== false && (
                    <td className="py-1 px-2 font-mono text-slate-200 font-semibold">{peer.flags}</td>
                  )}

                  {/* Progress % */}
                  {visibleColumns.progress !== false && (
                    <td className="py-1 px-2 text-right font-mono text-slate-300">{peer.progress.toFixed(1)}%</td>
                  )}

                  {/* Down Speed */}
                  {visibleColumns.downSpeed !== false && (
                    <td className="py-1 px-2 text-right font-mono text-slate-200">
                      {peer.downSpeed > 0 ? formatSpeed(peer.downSpeed) : ''}
                    </td>
                  )}

                  {/* Up Speed */}
                  {visibleColumns.upSpeed !== false && (
                    <td className="py-1 px-2 text-right font-mono text-slate-200">
                      {peer.upSpeed > 0 ? formatSpeed(peer.upSpeed) : ''}
                    </td>
                  )}

                  {/* Reqs */}
                  {visibleColumns.reqs !== false && (
                    <td className="py-1 px-2 text-center font-mono text-slate-300">{peer.reqs}</td>
                  )}

                  {/* Uploaded */}
                  {visibleColumns.uploaded !== false && (
                    <td className="py-1 px-2 text-right font-mono text-slate-300">
                      {peer.uploaded > 0 ? formatBytes(peer.uploaded) : ''}
                    </td>
                  )}

                  {/* Downloaded */}
                  {visibleColumns.downloaded !== false && (
                    <td className="py-1 px-2 text-right font-mono text-slate-300">
                      {peer.downloaded > 0 ? formatBytes(peer.downloaded) : ''}
                    </td>
                  )}

                  {/* Peer dl. */}
                  {visibleColumns.peerDlSpeed !== false && (
                    <td className="py-1 px-2 text-right font-mono text-slate-200">
                      {peer.peerDlSpeed > 0 ? formatSpeed(peer.peerDlSpeed) : ''}
                    </td>
                  )}

                  {/* Relevance */}
                  {visibleColumns.relevance !== false && (
                    <td className="py-1 px-2 text-right font-mono text-slate-300">{peer.relevance.toFixed(1)}%</td>
                  )}

                  {/* Files */}
                  {visibleColumns.files !== false && (
                    <td className="py-1 px-2 text-slate-400 truncate max-w-xs">{peer.files}</td>
                  )}
                </tr>
              )
            })}

            {filteredPeers.length === 0 && (
              <tr>
                <td colSpan={Math.max(1, activeColumnCount)} className="py-8 text-center text-slate-500 italic">
                  No peers connected or matching the filter query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
