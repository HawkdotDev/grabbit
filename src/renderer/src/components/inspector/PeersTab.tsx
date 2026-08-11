import React from 'react'
import { DownloadItem } from '../../../../engine/types'
import { Users, ArrowDown, ArrowUp, Shield } from 'lucide-react'
import { formatBytes, formatSpeed } from '../../utils/formatters'

interface PeersTabProps {
  download?: DownloadItem | null
}

export const PeersTab: React.FC<PeersTabProps> = ({ download }) => {
  const [appVersion, setAppVersion] = React.useState('0.3.0')

  React.useEffect(() => {
    window.api?.getAppVersion?.().then((v) => {
      if (v) setAppVersion(v)
    }).catch(() => {})
  }, [])

  if (!download) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-500 italic text-xs font-mono">
        No task selected to inspect peer connections.
      </div>
    )
  }

  const url = typeof download.url === 'string' ? download.url : ''
  const isTorrent =
    !!download.infoHash ||
    url.startsWith('magnet:') ||
    url.includes('magnet:') ||
    url.endsWith('.torrent') ||
    (Array.isArray(download.trackers) && download.trackers.length > 0)

  if (!isTorrent) {
    return (
      <div className="p-6 bg-ide-surface/60 border border-ide-border text-center space-y-2 select-none font-sans">
        <Users className="h-8 w-8 text-slate-600 mx-auto stroke-[1.5]" />
        <h4 className="text-sm font-semibold text-slate-200">P2P Swarm Peers Disabled</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Swarm peer discovery is exclusive to BitTorrent &amp; Magnet P2P transfers. This task is a direct HTTP/HTTPS stream. Switch to the <strong className="text-theme-accent">Threads</strong> tab to inspect multi-threaded chunk streams.
        </p>
      </div>
    )
  }

  const peersList = Array.isArray(download.peersInfo) ? download.peersInfo : []
  const seedsCount = typeof download.seedsCount === 'number' ? download.seedsCount : 0
  const peersCount = typeof download.peersCount === 'number' ? download.peersCount : 0
  const speed = typeof download.speed === 'number' ? download.speed : 0
  const upSpeed = typeof download.upSpeed === 'number' ? download.upSpeed : 0
  const uploadedSize = typeof download.uploadedSize === 'number' ? download.uploadedSize : 0
  const ratioRaw = typeof download.ratio === 'number' ? download.ratio : parseFloat(String(download.ratio || 0))
  const ratioVal = isNaN(ratioRaw) ? 0 : ratioRaw
  const trackersCount = Array.isArray(download.trackers) ? download.trackers.length : 0

  return (
    <div className="space-y-3 font-sans text-xs select-none">
      {/* Top Swarm Peers Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ide-surface/50 p-2.5 border border-ide-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Seeds / Peers</div>
            <div className="font-mono font-bold text-slate-200">
              {seedsCount} Seeds | {peersCount} Peers
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowDown className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Down Speed</div>
            <div className="font-mono font-bold text-emerald-400">{formatSpeed(speed)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUp className="h-4 w-4 text-blue-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Up Speed</div>
            <div className="font-mono font-bold text-blue-400">
              {formatSpeed(upSpeed)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Uploaded / Ratio</div>
            <div className="font-mono font-bold text-slate-200">
              {formatBytes(uploadedSize)} ({ratioVal.toFixed(2)})
            </div>
          </div>
        </div>
      </div>

      {/* Peers Table */}
      {peersList.length === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center border border-zinc-800 bg-ide-surface/30 text-center p-4">
          <Users className="h-6 w-6 text-slate-600 mb-1" />
          <span className="text-xs text-slate-400 font-medium">
            {download.status === 'downloading' || download.status === 'seeding'
              ? 'Connecting to active swarm peers...'
              : 'Start task to connect to swarm peers.'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono mt-1">
            Trackers: {trackersCount} configured | DHT & PEX mesh active
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto border border-zinc-700/60 bg-ide-surface/40">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-ide-bg/90 border-b border-zinc-700/60 text-slate-400 text-[11px]">
                <th className="p-2 font-medium">Peer Address</th>
                <th className="p-2 font-medium">Client Agent</th>
                <th className="p-2 font-medium text-right">Down Speed</th>
                <th className="p-2 font-medium text-right">Up Speed</th>
                <th className="p-2 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {peersList.map((peer: any, idx: number) => {
                if (!peer || typeof peer !== 'object') return null
                const ipStr = typeof peer.ip === 'string' ? peer.ip : 'Swarm Peer'
                const portNum = typeof peer.port === 'number' ? peer.port : 6881
                const clientNameStr = typeof peer.clientName === 'string' ? peer.clientName : 'BitTorrent Peer'
                const downSpeedNum = typeof peer.downloadSpeed === 'number' ? peer.downloadSpeed : 0
                const upSpeedNum = typeof peer.uploadSpeed === 'number' ? peer.uploadSpeed : 0
                const isChoked = !!peer.choked

                return (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="p-2 text-slate-200 font-bold">
                      {ipStr}:{portNum}
                    </td>
                    <td className="p-2 text-slate-300">{clientNameStr}</td>
                    <td className="p-2 text-right text-emerald-400 font-semibold">
                      {downSpeedNum > 0 ? formatSpeed(downSpeedNum) : '0 B/s'}
                    </td>
                    <td className="p-2 text-right text-blue-400 font-semibold">
                      {upSpeedNum > 0 ? formatSpeed(upSpeedNum) : '0 B/s'}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                          isChoked
                            ? 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
                            : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                        }`}
                      >
                        {isChoked ? 'Choked' : 'Unchoked'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 pt-1 px-1 gap-2">
        <span>Swarm Peer Identification: Active (BEP 10 Extended Handshake & Azureus Peer ID Decoding)</span>
        <span>
          Local Client Identity:{' '}
          <span className="text-theme-accent font-semibold">Grabbit v{appVersion}</span>
        </span>
      </div>
    </div>
  )
}
