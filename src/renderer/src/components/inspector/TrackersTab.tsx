import React from 'react'
import { DownloadItem } from '../../../../engine/types'

interface TrackersTabProps {
  download: DownloadItem
}

export const TrackersTab: React.FC<TrackersTabProps> = ({ download }) => {
  const trackers = download.trackers || [
    { url: 'udp://tracker.neobit.io:6969/announce', status: 'working', peers: 45 },
    { url: 'https://tracker.openbittorrent.com:443/announce', status: 'working', peers: 12 }
  ]

  return (
    <div className="w-full">
      <table className="w-full text-left font-mono border border-[#2e2e2e] rounded-none">
        <thead className="bg-[#1e1e1e] border-b border-[#2e2e2e] text-slate-300">
          <tr>
            <th className="p-2 border-r border-[#292929]">#</th>
            <th className="p-2 border-r border-[#292929]">Tracker URL</th>
            <th className="p-2 border-r border-[#292929]">Status</th>
            <th className="p-2 border-r border-[#292929] text-right">Peers</th>
            <th className="p-2 text-right">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#242424]">
          {trackers.map((tr, idx) => (
            <tr key={idx} className="hover:bg-white/5">
              <td className="p-2 text-slate-500">{idx + 1}</td>
              <td className="p-2 text-cyan-400">{tr.url}</td>
              <td className="p-2">
                <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px]">
                  {tr.status}
                </span>
              </td>
              <td className="p-2 text-right">{tr.peers}</td>
              <td className="p-2 text-right text-slate-400">Announce OK</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
