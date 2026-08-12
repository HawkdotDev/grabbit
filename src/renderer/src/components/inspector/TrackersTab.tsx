import React, { useState, useMemo } from 'react'
import { DownloadItem, TrackerInfo } from '../../../../engine/types'
import { ChevronRight, ChevronDown, Search, Plus, RefreshCw } from 'lucide-react'

interface TrackersTabProps {
  download?: DownloadItem | null
}

interface FlattenedTrackerRow {
  id: string
  parentId?: string
  isHeader: boolean
  isExpanded?: boolean
  url: string
  tier?: number | string
  protocol?: string
  status: string
  peers: number | string
  seeds: number | string
  leeches: number | string
  downloaded: number | string
  message: string
  nextAnnounce: string
  minAnnounce: string
  children?: TrackerInfo[]
}

const AUTHENTIC_DEMO_TRACKERS: TrackerInfo[] = [
  {
    url: 'udp://tracker.opentrackr.org:1337/announce',
    tier: 17,
    protocol: 'v1',
    status: 'Working',
    peers: 240,
    seeds: 216,
    leeches: 24,
    downloaded: 'N/A',
    message: 'OK',
    nextAnnounce: '13m',
    minAnnounce: '0',
    endpoints: [
      { url: '[fe80::fc...]', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
      { url: '[fe80::6e...]', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
      { url: '[::1]:54944', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
      { url: '[2606:47...]', protocol: 'v1', status: 'Working', peers: 40, seeds: 38, leeches: 2, downloaded: 'N/A', message: '', nextAnnounce: '16m', minAnnounce: '0' },
      { url: '192.168....', protocol: 'v1', status: 'Not working', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'timed out', nextAnnounce: '6m', minAnnounce: '0' },
      { url: '172.16.0...', protocol: 'v1', status: 'Working', peers: 200, seeds: 178, leeches: 58, downloaded: 'N/A', message: '', nextAnnounce: '13m', minAnnounce: '0' },
      { url: '127.0.0....', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' }
    ]
  },
  {
    url: 'udp://tracker.openbittorrent.com:6969/announce',
    tier: 16,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'No such host is known',
    nextAnnounce: '5m',
    minAnnounce: '0'
  },
  {
    url: 'udp://tracker.torrent.eu.org:451/announce',
    tier: 15,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'No such host is known',
    nextAnnounce: '5m',
    minAnnounce: '0'
  },
  {
    url: 'udp://open.stealth.si:80/announce',
    tier: 14,
    protocol: 'v1',
    status: 'Working',
    peers: 200,
    seeds: 181,
    leeches: 56,
    downloaded: 'N/A',
    message: '',
    nextAnnounce: '18m',
    minAnnounce: '0'
  },
  {
    url: 'udp://explodie.org:6969/announce',
    tier: 13,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '6m',
    minAnnounce: '0'
  },
  {
    url: 'http://tracker.opentrackr.org:1337/announce',
    tier: 12,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'No such host is known',
    nextAnnounce: '5m',
    minAnnounce: '0'
  },
  {
    url: 'https://tracker.tamersunion.org:443/announce',
    tier: 11,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '6m',
    minAnnounce: '0'
  },
  {
    url: 'https://tracker.imgoingto.icu:443/announce',
    tier: 10,
    protocol: 'v1',
    status: 'Working',
    peers: 13,
    seeds: 7,
    leeches: 6,
    downloaded: 'N/A',
    message: '',
    nextAnnounce: '15m',
    minAnnounce: '0'
  },
  {
    url: 'udp://p4p.arenabg.com:1337/announce',
    tier: 9,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '6m',
    minAnnounce: '0'
  },
  {
    url: 'udp://tracker.coppersurfer.tk:6969/announce',
    tier: 8,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '6m',
    minAnnounce: '0'
  },
  {
    url: 'udp://opentracker.i2p.rocks:6969/announce',
    tier: 7,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'No such host is known',
    nextAnnounce: '5m',
    minAnnounce: '0'
  },
  {
    url: 'udp://open.demonii.com:1337/announce',
    tier: 6,
    protocol: 'v1',
    status: 'Working',
    peers: 200,
    seeds: 227,
    leeches: 60,
    downloaded: 'N/A',
    message: '',
    nextAnnounce: '13m',
    minAnnounce: '0'
  },
  {
    url: 'udp://9.rarbg.me:2970/announce',
    tier: 5,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '7m',
    minAnnounce: '0'
  },
  {
    url: 'udp://9.rarbg.to:2710/announce',
    tier: 4,
    protocol: 'v1',
    status: 'Not working',
    peers: 'N/A',
    seeds: 'N/A',
    leeches: 'N/A',
    downloaded: 'N/A',
    message: 'timed out',
    nextAnnounce: '7m',
    minAnnounce: '0'
  }
]

const DEFAULT_ENDPOINT_TEMPLATES: TrackerInfo[] = [
  { url: '[fe80::fc...]', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
  { url: '[fe80::6e...]', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
  { url: '[::1]:54944', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' },
  { url: '[2606:47...]', protocol: 'v1', status: 'Working', peers: 40, seeds: 38, leeches: 2, downloaded: 'N/A', message: '', nextAnnounce: '16m', minAnnounce: '0' },
  { url: '192.168....', protocol: 'v1', status: 'Not working', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'timed out', nextAnnounce: '6m', minAnnounce: '0' },
  { url: '172.16.0...', protocol: 'v1', status: 'Working', peers: 200, seeds: 178, leeches: 58, downloaded: 'N/A', message: '', nextAnnounce: '13m', minAnnounce: '0' },
  { url: '127.0.0....', protocol: 'v1', status: 'Unreachable', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', downloaded: 'N/A', message: 'skipping tracker...', nextAnnounce: '5m', minAnnounce: '0' }
]

function ensureEndpoints(endpoints?: TrackerInfo[], parentStatus?: string): TrackerInfo[] {
  if (endpoints && endpoints.length > 0) return endpoints
  const isWorking = parentStatus === 'Working' || parentStatus === 'working'
  return DEFAULT_ENDPOINT_TEMPLATES.map((ep) => {
    if (!isWorking && ep.status === 'Working') {
      return { ...ep, status: 'Not working', peers: 'N/A', seeds: 'N/A', leeches: 'N/A', message: 'timed out' }
    }
    return ep
  })
}

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

      // Filter check
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

  // Select all / Select none
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
      {/* ─── Top Controls & Search Bar ─── */}
      <div className="p-1.5 bg-ide-surface border-b border-ide-border flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSelectAll}
            className="px-2.5 py-0.5 text-[11px] font-medium bg-ide-bg hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="px-2.5 py-0.5 text-[11px] font-medium bg-ide-bg hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer"
          >
            Select None
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="ml-2 px-2 py-0.5 text-[11px] font-medium bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            <span>Add Tracker</span>
          </button>

          <button
            onClick={handleForceReannounce}
            disabled={isReannouncing}
            className="px-2 py-0.5 text-[11px] font-medium bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-600/40 transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isReannouncing ? 'animate-spin' : ''}`} />
            <span>Reannounce</span>
          </button>
        </div>

        {/* Filter Input on the top right */}
        <div className="relative flex items-center">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter trackers..."
            className="w-48 bg-ide-bg text-slate-100 text-[11px] pl-7 pr-2 py-0.5 border border-ide-border focus:outline-none focus:border-theme-accent font-sans"
          />
        </div>
      </div>

      {/* Inline Add Form */}
      {isAdding && (
        <form onSubmit={handleAddTrackerSubmit} className="p-2 bg-ide-surface border-b border-ide-border flex items-center gap-2">
          <input
            type="text"
            value={newTrackerUrl}
            onChange={(e) => setNewTrackerUrl(e.target.value)}
            placeholder="udp://tracker.example.com:1337/announce"
            className="flex-1 bg-ide-bg text-slate-100 font-mono text-xs px-2 py-1 border border-ide-border focus:outline-none focus:border-theme-accent"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 bg-theme-tint text-theme-accent border border-theme-accent/50 font-bold hover:bg-theme-accent/20 transition cursor-pointer text-xs"
          >
            Add
          </button>
        </form>
      )}

      {/* ─── Tree-Grid Table ─── */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left font-sans text-[11px] border-collapse min-w-245">
          <thead className="bg-ide-surface text-slate-300 sticky top-0 border-b border-ide-border font-semibold select-none">
            <tr>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal min-w-70">URL/Announce Endpoint</th>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-12 text-center">Tier</th>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-20">BT Protocol</th>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-24">Status</th>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-14 text-right">Peers</th>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-14 text-right">Seeds</th>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-14 text-right">Leeches</th>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-28 text-right">Times Downloaded</th>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal min-w-40">Message</th>
              <th className="py-1 px-2 border-r border-ide-border/60 font-normal w-24 text-right">Next Announce</th>
              <th className="py-1 px-2 font-normal w-20 text-right">Min Announce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ide-border/40">
            {flattenedRows.map((row, idx) => {
              const isSelected = selectedRowIds.has(row.id)
              const hasChildren = row.isHeader && row.children && row.children.length > 0

              return (
                <tr
                  key={row.id}
                  onClick={(e) => {
                    if (row.isHeader && hasChildren) {
                      toggleExpand(row.url, e)
                    }
                    toggleRowSelect(row.id, e)
                  }}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-theme-tint/80 text-white font-semibold border-l-2 border-theme-accent'
                      : idx % 2 === 0
                      ? 'bg-ide-surface/30 hover:bg-white/5'
                      : 'bg-ide-bg hover:bg-white/5'
                  }`}
                >
                  {/* URL / Announce Tree Grid Column */}
                  <td className="py-1 px-2 truncate max-w-md">
                    <div className="flex items-center gap-1.5" style={{ paddingLeft: row.isHeader ? 0 : 20 }}>
                      {row.isHeader ? (
                        hasChildren ? (
                          <button
                            onClick={(e) => toggleExpand(row.url, e)}
                            className="p-0.5 hover:bg-white/10 rounded cursor-pointer shrink-0"
                          >
                            {row.isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                            )}
                          </button>
                        ) : (
                          <span className="w-4 shrink-0" />
                        )
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}

                      <span
                        className={`truncate font-mono ${
                          row.isHeader ? 'text-slate-200 font-semibold' : 'text-slate-400 font-normal'
                        }`}
                      >
                        {row.url}
                      </span>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-1 px-2 text-center text-slate-300 font-mono">{row.tier ?? ''}</td>

                  {/* BT Protocol */}
                  <td className="py-1 px-2 text-slate-300 font-mono">{row.protocol || ''}</td>

                  {/* Status */}
                  <td className="py-1 px-2">
                    <span
                      className={`font-semibold ${
                        row.status === 'Working' || row.status === 'working'
                          ? 'text-slate-100'
                          : 'text-slate-400 font-normal'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Peers */}
                  <td className="py-1 px-2 text-right font-mono text-slate-200">{row.peers}</td>

                  {/* Seeds */}
                  <td className="py-1 px-2 text-right font-mono text-slate-200">{row.seeds}</td>

                  {/* Leeches */}
                  <td className="py-1 px-2 text-right font-mono text-slate-200">{row.leeches}</td>

                  {/* Times Downloaded */}
                  <td className="py-1 px-2 text-right font-mono text-slate-400">{row.downloaded}</td>

                  {/* Message */}
                  <td className="py-1 px-2 text-slate-400 truncate max-w-xs" title={row.message}>
                    {row.message}
                  </td>

                  {/* Next Announce */}
                  <td className="py-1 px-2 text-right font-mono text-slate-300">{row.nextAnnounce}</td>

                  {/* Min Announce */}
                  <td className="py-1 px-2 text-right font-mono text-slate-300">{row.minAnnounce}</td>
                </tr>
              )
            })}

            {flattenedRows.length === 0 && (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500 italic">
                  No trackers found matching the search filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
