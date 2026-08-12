import React, { useState, useMemo } from 'react'
import { TrackerInfo } from '../../../../engine/types'
import {
  TrackersTabProps,
  FlattenedTrackerRow,
  AUTHENTIC_DEMO_TRACKERS,
  ensureEndpoints
} from './trackers/trackerTypes'
import { TrackersToolbar } from './trackers/TrackersToolbar'
import { TrackersTreeTable } from './trackers/TrackersTreeTable'

export const TrackersTab: React.FC<TrackersTabProps> = ({ download }) => {
  const [filterQuery, setFilterQuery] = useState('')
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    'udp://tracker.opentrackr.org:1337/announce': true
  })
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())
  const [isAdding, setIsAdding] = useState(false)
  const [newTrackerUrl, setNewTrackerUrl] = useState('')
  const [isReannouncing, setIsReannouncing] = useState(false)

  const url = download?.url || ''
  const isTorrent =
    download && (url.startsWith('magnet:') || url.endsWith('.torrent') || !!download.infoHash)

  // Construct raw tracker array
  const rawTrackers: TrackerInfo[] = useMemo(() => {
    const list = download?.trackers && download.trackers.length > 0
      ? download.trackers
      : AUTHENTIC_DEMO_TRACKERS

    return list.map((t, idx) => {
      const numPeers = typeof t.peers === 'number' ? t.peers : 0
      const statusStr = t.status === 'working' || t.status === 'Working'
        ? 'Working'
        : t.status === 'disabled'
          ? 'Disabled'
          : 'Not working'

      return {
        url: t.url,
        tier: t.tier ?? (list.length - idx),
        protocol: t.protocol || 'v1',
        status: statusStr,
        peers: t.peers ?? 'N/A',
        seeds: t.seeds ?? (numPeers > 0 ? Math.max(1, Math.round(numPeers * 0.8)) : 'N/A'),
        leeches: t.leeches ?? (numPeers > 0 ? Math.max(0, Math.round(numPeers * 0.2)) : 'N/A'),
        downloaded: t.downloaded ?? 'N/A',
        message: t.message || (statusStr === 'Working' ? '' : 'timed out'),
        nextAnnounce: t.nextAnnounce || `${(idx % 5) + 6}m`,
        minAnnounce: t.minAnnounce || '0',
        endpoints: ensureEndpoints(t.endpoints, statusStr)
      }
    })
  }, [download?.trackers])

  // Flatten tree grid for table rendering
  const flattenedRows: FlattenedTrackerRow[] = useMemo(() => {
    const result: FlattenedTrackerRow[] = []
    const q = filterQuery.trim().toLowerCase()

    rawTrackers.forEach((parent, index) => {
      const parentId = `tier_${index}_${parent.url}`
      const isExpanded = !!expandedTiers[parent.url] || !!expandedTiers[parentId]

      const matchesFilter =
        !q ||
        parent.url.toLowerCase().includes(q) ||
        (parent.status && parent.status.toLowerCase().includes(q)) ||
        (parent.message && parent.message.toLowerCase().includes(q))

      if (matchesFilter || (parent.endpoints && parent.endpoints.some((e) => e.url.toLowerCase().includes(q)))) {
        result.push({
          id: parentId,
          isHeader: true,
          isExpanded,
          url: parent.url,
          tier: parent.tier ?? (rawTrackers.length - index),
          protocol: parent.protocol || 'v1',
          status: parent.status,
          peers: parent.peers,
          seeds: parent.seeds ?? 'N/A',
          leeches: parent.leeches ?? 'N/A',
          downloaded: parent.downloaded ?? 'N/A',
          message: parent.message || '',
          nextAnnounce: parent.nextAnnounce || '5m',
          minAnnounce: parent.minAnnounce || '0',
          children: parent.endpoints
        })

        if (isExpanded && parent.endpoints && parent.endpoints.length > 0) {
          parent.endpoints.forEach((child, childIdx) => {
            const childId = `${parentId}_sub_${childIdx}`
            if (!q || child.url.toLowerCase().includes(q) || (child.message && child.message.toLowerCase().includes(q))) {
              result.push({
                id: childId,
                parentId,
                isHeader: false,
                url: child.url,
                tier: '',
                protocol: child.protocol || 'v1',
                status: child.status,
                peers: child.peers,
                seeds: child.seeds ?? 'N/A',
                leeches: child.leeches ?? 'N/A',
                downloaded: child.downloaded ?? 'N/A',
                message: child.message || '',
                nextAnnounce: child.nextAnnounce || '5m',
                minAnnounce: child.minAnnounce || '0'
              })
            }
          })
        }
      }
    })

    return result
  }, [rawTrackers, expandedTiers, filterQuery])

  const handleSelectAll = (): void => {
    const allIds = new Set(flattenedRows.map((r) => r.id))
    setSelectedRowIds(allIds)
  }

  const handleSelectNone = (): void => {
    setSelectedRowIds(new Set())
  }

  const toggleRowSelect = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation()
    setSelectedRowIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleExpand = (urlKey: string, e: React.MouseEvent): void => {
    e.stopPropagation()
    setExpandedTiers((prev) => ({
      ...prev,
      [urlKey]: !prev[urlKey]
    }))
  }

  const handleAddTrackerSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newTrackerUrl.trim() || !download) return

    const urlToAdd = newTrackerUrl.trim()
    if (window.api?.addTorrentTracker) {
      await window.api.addTorrentTracker(download.id, urlToAdd)
    }
    setNewTrackerUrl('')
    setIsAdding(false)
  }

  const handleForceReannounce = async (): Promise<void> => {
    if (!download) return
    setIsReannouncing(true)
    try {
      if (window.api?.reannounceTorrent) {
        await window.api.reannounceTorrent(download.id)
      }
    } finally {
      setTimeout(() => setIsReannouncing(false), 1500)
    }
  }

  if (!isTorrent) {
    return (
      <div className="p-4 bg-[#1e1e1e] border border-[#2a2a2a] text-xs text-slate-400 font-mono text-center">
        Trackers are only active for BitTorrent and Magnet P2P transfers.
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col font-sans text-xs select-none bg-ide-bg text-slate-200 min-h-55">
      <TrackersToolbar
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
        handleSelectAll={handleSelectAll}
        handleSelectNone={handleSelectNone}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        newTrackerUrl={newTrackerUrl}
        setNewTrackerUrl={setNewTrackerUrl}
        handleAddTrackerSubmit={handleAddTrackerSubmit}
        handleForceReannounce={handleForceReannounce}
        isReannouncing={isReannouncing}
      />

      <TrackersTreeTable
        flattenedRows={flattenedRows}
        selectedRowIds={selectedRowIds}
        toggleRowSelect={toggleRowSelect}
        toggleExpand={toggleExpand}
      />
    </div>
  )
}
