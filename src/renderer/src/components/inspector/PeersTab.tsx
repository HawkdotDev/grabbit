import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  PeersTabProps,
  PeerRowData,
  PeerColumnId,
  COUNTRY_FLAG_MAP
} from './peers/peerTypes'
import { PeersToolbar } from './peers/PeersToolbar'
import { PeersTable } from './peers/PeersTable'

export type { PeerColumnId, ColumnDef } from './peers/peerTypes'
export { ALL_PEER_COLUMNS } from './peers/peerTypes'

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
      // ignore parse error
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
        // ignore storage error
      }
      return next
    })
  }

  const showAllColumns = () => {
    const resetState: Record<PeerColumnId, boolean> = {
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
    setVisibleColumns(resetState)
    try {
      localStorage.setItem('neobit_peers_visible_columns', JSON.stringify(resetState))
    } catch (e) {}
  }

  const url = download?.url || ''
  const isTorrent =
    download && (url.startsWith('magnet:') || url.endsWith('.torrent') || !!download.infoHash)

  // Transform live download.peersInfo into structured PeerRowData
  const rawPeers: PeerRowData[] = useMemo(() => {
    if (!download?.peersInfo || download.peersInfo.length === 0) {
      return []
    }

    return download.peersInfo.map((p, idx) => {
      const cCode = (p.country || '').toUpperCase()
      const flag = COUNTRY_FLAG_MAP[cCode] || '🌐'

      return {
        id: `${p.ip}_${p.port}_${idx}`,
        country: cCode,
        countryFlag: flag,
        ip: p.ip,
        port: p.port,
        connection: p.connection || 'BT',
        flags: p.flags || 'H',
        client: p.clientName || 'BitTorrent Peer',
        progress: (p.progress ?? 0) * 100,
        downSpeed: p.downloadSpeed || 0,
        upSpeed: p.uploadSpeed || 0,
        reqs: p.reqs || '0 | 0',
        downloaded: p.downloaded || 0,
        uploaded: p.uploaded || 0,
        peerDlSpeed: p.peerDlSpeed || 0,
        relevance: (p.relevance ?? 0) * 100,
        files: p.files || (download?.files && download.files.length > 0 ? (download.files[0]?.name || download.files[0]?.path || 'All files') : 'All files'),
        choked: p.choked ?? true
      }
    })
  }, [download?.peersInfo, download?.files])

  // Filter peers by search query
  const filteredPeers = useMemo(() => {
    if (!filterQuery.trim()) return rawPeers
    const q = filterQuery.toLowerCase()
    return rawPeers.filter(
      (p) =>
        p.ip.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.connection.toLowerCase().includes(q) ||
        p.flags.toLowerCase().includes(q)
    )
  }, [rawPeers, filterQuery])

  const handleSelectAll = (): void => {
    setSelectedPeerIds(new Set(filteredPeers.map((p) => p.id)))
  }

  const handleSelectNone = (): void => {
    setSelectedPeerIds(new Set())
  }

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

    const peerAddr = newPeerAddress.trim()
    if (window.api?.addTorrentPeer) {
      await window.api.addTorrentPeer(download.id, peerAddr)
    }
    setNewPeerAddress('')
    setIsAddingPeer(false)
  }

  const activeColumnCount = useMemo(() => {
    return Object.values(visibleColumns).filter(Boolean).length
  }, [visibleColumns])

  if (!isTorrent) {
    return (
      <div className="p-4 bg-[#1e1e1e] border border-[#2a2a2a] text-xs text-slate-400 font-mono text-center">
        Peer wire telemetry is only available for active BitTorrent and Magnet P2P transfers.
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col font-sans text-xs select-none bg-ide-bg text-slate-200 min-h-55">
      <PeersToolbar
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
        selectedPeerCount={selectedPeerIds.size}
        handleSelectAll={handleSelectAll}
        handleSelectNone={handleSelectNone}
        isAddingPeer={isAddingPeer}
        setIsAddingPeer={setIsAddingPeer}
        newPeerAddress={newPeerAddress}
        setNewPeerAddress={setNewPeerAddress}
        handleAddPeerSubmit={handleAddPeerSubmit}
        showColumnMenu={showColumnMenu}
        setShowColumnMenu={setShowColumnMenu}
        columnMenuRef={columnMenuRef}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        showAllColumns={showAllColumns}
        activeColumnCount={activeColumnCount}
      />

      <PeersTable
        filteredPeers={filteredPeers}
        selectedPeerIds={selectedPeerIds}
        toggleSelectPeer={toggleSelectPeer}
        visibleColumns={visibleColumns}
        setShowColumnMenu={setShowColumnMenu}
        activeColumnCount={activeColumnCount}
      />
    </div>
  )
}
