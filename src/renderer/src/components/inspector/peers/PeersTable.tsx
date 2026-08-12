import React from 'react'
import { formatBytes, formatSpeed } from '../../../utils/formatters'
import { PeerColumnId, PeerRowData } from './peerTypes'

interface PeersTableProps {
  filteredPeers: PeerRowData[]
  selectedPeerIds: Set<string>
  toggleSelectPeer: (id: string, e: React.MouseEvent) => void
  visibleColumns: Record<PeerColumnId, boolean>
  setShowColumnMenu: (show: boolean) => void
  activeColumnCount: number
}

export const PeersTable: React.FC<PeersTableProps> = React.memo(({
  filteredPeers,
  selectedPeerIds,
  toggleSelectPeer,
  visibleColumns,
  setShowColumnMenu,
  activeColumnCount
}) => {
  return (
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
                {visibleColumns.country !== false && (
                  <td className="py-1 px-2 flex items-center gap-1.5 truncate">
                    <span className="text-base leading-none">{peer.countryFlag}</span>
                    <span className="text-slate-300 font-mono text-[10px]">{peer.country || 'N/A'}</span>
                  </td>
                )}
                {visibleColumns.ip !== false && (
                  <td className="py-1 px-2 font-mono text-slate-200 font-medium truncate max-w-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{peer.ip}</span>
                      {peer.isTopTier && (
                        <span className="px-1 py-0.5 text-[9px] font-sans font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0" title="Top 24 Active Swarm Seeder">
                          Top 24
                        </span>
                      )}
                    </div>
                  </td>
                )}
                {visibleColumns.port !== false && (
                  <td className="py-1 px-2 text-right font-mono text-slate-300">{peer.port || ''}</td>
                )}
                {visibleColumns.connection !== false && (
                  <td className="py-1 px-2 font-mono text-slate-300">{peer.connection}</td>
                )}
                {visibleColumns.client !== false && (
                  <td className="py-1 px-2 font-sans text-slate-300 truncate max-w-xs">{peer.client}</td>
                )}
                {visibleColumns.flags !== false && (
                  <td className="py-1 px-2 font-mono text-slate-200 font-semibold">{peer.flags}</td>
                )}
                {visibleColumns.progress !== false && (
                  <td className="py-1 px-2 text-right font-mono text-slate-300">{peer.progress.toFixed(1)}%</td>
                )}
                {visibleColumns.downSpeed !== false && (
                  <td className="py-1 px-2 text-right font-mono text-slate-200">
                    {peer.downSpeed > 0 ? formatSpeed(peer.downSpeed) : ''}
                  </td>
                )}
                {visibleColumns.upSpeed !== false && (
                  <td className="py-1 px-2 text-right font-mono text-slate-200">
                    {peer.upSpeed > 0 ? formatSpeed(peer.upSpeed) : ''}
                  </td>
                )}
                {visibleColumns.reqs !== false && (
                  <td className="py-1 px-2 text-center font-mono text-slate-300">{peer.reqs}</td>
                )}
                {visibleColumns.uploaded !== false && (
                  <td className="py-1 px-2 text-right font-mono text-slate-300">
                    {peer.uploaded > 0 ? formatBytes(peer.uploaded) : ''}
                  </td>
                )}
                {visibleColumns.downloaded !== false && (
                  <td className="py-1 px-2 text-right font-mono text-slate-300">
                    {peer.downloaded > 0 ? formatBytes(peer.downloaded) : ''}
                  </td>
                )}
                {visibleColumns.peerDlSpeed !== false && (
                  <td className="py-1 px-2 text-right font-mono text-slate-200">
                    {peer.peerDlSpeed > 0 ? formatSpeed(peer.peerDlSpeed) : ''}
                  </td>
                )}
                {visibleColumns.relevance !== false && (
                  <td className="py-1 px-2 text-right font-mono text-slate-300">{peer.relevance.toFixed(1)}%</td>
                )}
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
  )
})
