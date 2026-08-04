import React, { useState } from 'react'
import { DownloadItem } from '../../../../engine/types'
import { Globe, Radio, CheckCircle2 } from 'lucide-react'

interface TrackersTabProps {
  download?: DownloadItem | null
}

export const TrackersTab: React.FC<TrackersTabProps> = ({ download }) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'trackerless' | 'working'>('all')

  const defaultTrackers = [
    { url: 'udp://tracker.grabbit.io:6969/announce', status: 'working', peers: 45 },
    { url: 'https://tracker.openbittorrent.com:443/announce', status: 'working', peers: 12 },
    { url: 'udp://tracker.opentrackr.org:1337/announce', status: 'working', peers: 88 },
    { url: 'udp://tracker.coppersurfer.tk:6969/announce', status: 'disabled', peers: 0 }
  ]

  const trackers = download?.trackers || defaultTrackers

  const trackerlessServices = [
    {
      name: 'DHT (Distributed Hash Table)',
      status: 'working',
      nodes: 342,
      message: 'IPv4 / IPv6 Active'
    },
    { name: 'PeX (Peer Exchange)', status: 'working', nodes: 56, message: 'UtPex Protocol' },
    {
      name: 'LSD (Local Peer Discovery)',
      status: 'working',
      nodes: 3,
      message: 'Multicast 239.192.152.143'
    }
  ]

  const filteredTrackers = trackers.filter((tr) => {
    if (activeSubTab === 'working') return tr.status === 'working'
    return true
  })

  return (
    <div className="w-full space-y-2 font-sans text-xs select-none">
      {/* Sub-tabs Header Bar */}
      <div className="flex items-center gap-1.5 rounded-none">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer rounded-none border ${
            activeSubTab === 'all'
              ? 'bg-theme-accent text-white border-theme-accent font-bold shadow-sm'
              : 'bg-ide-bg text-slate-300 border-ide-border hover:bg-white/10 hover:text-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>All Trackers</span>
          <span className="px-1.5 py-0.2 bg-black/30 font-mono text-[9px]">{trackers.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trackerless')}
          className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer rounded-none border ${
            activeSubTab === 'trackerless'
              ? 'bg-theme-accent text-white border-theme-accent font-bold shadow-sm'
              : 'bg-ide-bg text-slate-300 border-ide-border hover:bg-white/10 hover:text-white'
          }`}
        >
          <Radio className="h-3.5 w-3.5 text-cyan-400" />
          <span>Trackerless (DHT/PeX)</span>
          <span className="px-1.5 py-0.2 bg-black/30 font-mono text-[9px]">
            {trackerlessServices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('working')}
          className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer rounded-none border ${
            activeSubTab === 'working'
              ? 'bg-theme-accent text-white border-theme-accent font-bold shadow-sm'
              : 'bg-ide-bg text-slate-300 border-ide-border hover:bg-white/10 hover:text-white'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Working Trackers</span>
          <span className="px-1.5 py-0.2 bg-black/30 font-mono text-[9px]">
            {trackers.filter((t) => t.status === 'working').length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeSubTab === 'trackerless' ? (
        <table className="w-full text-left font-mono border border-ide-border rounded-none">
          <thead className="bg-ide-surface border-b border-ide-border text-slate-300">
            <tr>
              <th className="p-2 border-r border-[#292929]">Service Name</th>
              <th className="p-2 border-r border-[#292929]">Status</th>
              <th className="p-2 border-r border-[#292929] text-right">Nodes / Peers</th>
              <th className="p-2 text-right">Protocol Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {trackerlessServices.map((st, idx) => (
              <tr key={idx} className="hover:bg-white/5">
                <td className="p-2 font-bold text-slate-200">{st.name}</td>
                <td className="p-2">
                  <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px]">
                    {st.status}
                  </span>
                </td>
                <td className="p-2 text-right text-theme-accent font-bold">{st.nodes}</td>
                <td className="p-2 text-right text-slate-400">{st.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="w-full text-left font-mono border border-ide-border rounded-none">
          <thead className="bg-ide-surface border-b border-ide-border text-slate-300">
            <tr>
              <th className="p-2 border-r border-[#292929]">#</th>
              <th className="p-2 border-r border-[#292929]">Tracker URL</th>
              <th className="p-2 border-r border-[#292929]">Status</th>
              <th className="p-2 border-r border-[#292929] text-right">Peers</th>
              <th className="p-2 text-right">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424]">
            {filteredTrackers.map((tr, idx) => (
              <tr key={idx} className="hover:bg-white/5">
                <td className="p-2 text-slate-500">{idx + 1}</td>
                <td className="p-2 text-cyan-400">{tr.url}</td>
                <td className="p-2">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] border ${
                      tr.status === 'working'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {tr.status}
                  </span>
                </td>
                <td className="p-2 text-right font-bold text-slate-200">{tr.peers}</td>
                <td className="p-2 text-right text-slate-400">
                  {tr.status === 'working' ? 'Announce OK' : 'Disabled'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
