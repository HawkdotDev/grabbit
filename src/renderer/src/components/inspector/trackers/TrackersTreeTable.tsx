import React from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { FlattenedTrackerRow } from './trackerTypes'

interface TrackersTreeTableProps {
  flattenedRows: FlattenedTrackerRow[]
  selectedRowIds: Set<string>
  toggleRowSelect: (id: string, e: React.MouseEvent) => void
  toggleExpand: (urlKey: string, e: React.MouseEvent) => void
}

export const TrackersTreeTable: React.FC<TrackersTreeTableProps> = React.memo(({
  flattenedRows,
  selectedRowIds,
  toggleRowSelect,
  toggleExpand
}) => {
  return (
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

                <td className="py-1 px-2 text-center text-slate-300 font-mono">{row.tier ?? ''}</td>
                <td className="py-1 px-2 text-slate-300 font-mono">{row.protocol || ''}</td>
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
                <td className="py-1 px-2 text-right font-mono text-slate-200">{row.peers}</td>
                <td className="py-1 px-2 text-right font-mono text-slate-200">{row.seeds}</td>
                <td className="py-1 px-2 text-right font-mono text-slate-200">{row.leeches}</td>
                <td className="py-1 px-2 text-right font-mono text-slate-400">{row.downloaded}</td>
                <td className="py-1 px-2 text-slate-400 truncate max-w-xs" title={row.message}>
                  {row.message}
                </td>
                <td className="py-1 px-2 text-right font-mono text-slate-300">{row.nextAnnounce}</td>
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
  )
})
