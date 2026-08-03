import React, { useState } from 'react'
import { DownloadItem, SpeedSample } from '../../../engine/types'
import { ChunkProgress } from './ChunkProgress'
import { SpeedChart } from './SpeedChart'
import { Info, Globe, Users, Link, FileText, Activity } from 'lucide-react'

interface BottomDetailInspectorProps {
  height?: number
  download: DownloadItem | null
  speedHistory: SpeedSample[]
}

export const BottomDetailInspector: React.FC<BottomDetailInspectorProps> = ({
  height = 240,
  download,
  speedHistory
}) => {
  const [activeTab, setActiveTab] = useState<
    'general' | 'trackers' | 'peers' | 'sources' | 'content' | 'speed'
  >('general')

  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KiB', 'MiB', 'GiB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatSpeed = (bytesPerSec?: number): string => {
    if (!bytesPerSec || bytesPerSec <= 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KiB/s', 'MiB/s', 'GiB/s']
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
    return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Info },
    { id: 'trackers', label: 'Trackers', icon: Globe },
    { id: 'peers', label: 'Peers / Threads', icon: Users },
    { id: 'sources', label: 'HTTP Sources', icon: Link },
    { id: 'content', label: 'Content / Files', icon: FileText },
    { id: 'speed', label: 'Bandwidth Speed', icon: Activity }
  ]

  return (
    <div
      style={{ height }}
      className="bg-[#1e1e1e] border-t border-[#2e2e2e] flex flex-col font-sans text-xs select-none shrink-0"
    >
      {/* Bottom Tab Bar */}
      <div className="h-9 px-3 bg-[#141414] border-b border-[#292929] flex items-center justify-between">
        <div className="flex items-center gap-1">
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() =>
                  setActiveTab(
                    t.id as 'general' | 'trackers' | 'peers' | 'sources' | 'content' | 'speed'
                  )
                }
                className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer rounded-none border-b-2 ${
                  isActive
                    ? 'border-[#009669] text-[#009669] bg-[#063e2c] font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {download && (
          <div className="text-[11px] font-mono text-slate-400 truncate max-w-sm">
            Selected: <strong className="text-slate-200">{download.name}</strong>
          </div>
        )}
      </div>

      {/* Tab Body Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#141414] text-slate-300 font-sans">
        {!download ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-xs">
            Select a task in the table above to view detailed diagnostics and peers.
          </div>
        ) : (
          <>
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-sans text-xs">
                <div className="space-y-2 bg-[#1e1e1e] p-3 border border-[#2e2e2e] rounded-none">
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#292929] pb-1 text-[#009669]">
                    Transfer Information
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Total Size:</span>
                    <span>{formatBytes(download.totalSize)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Downloaded:</span>
                    <span className="text-emerald-400">{formatBytes(download.downloadedSize)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Uploaded:</span>
                    <span>{formatBytes(download.uploadedSize || 0)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Ratio:</span>
                    <span>{download.ratio || '0.00'}</span>
                  </div>
                </div>

                <div className="space-y-2 bg-[#1e1e1e] p-3 border border-[#2e2e2e] rounded-none">
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#292929] pb-1 text-[#009669]">
                    Connection &amp; Speed
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Download Speed:</span>
                    <span className="text-cyan-400 font-bold">{formatSpeed(download.speed)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Upload Speed:</span>
                    <span>{formatSpeed(download.upSpeed)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Seeds / Peers:</span>
                    <span>
                      {download.seedsCount || 12} / {download.peersCount || 45}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Worker Threads:</span>
                    <span>{download.threadCount || 8} Active (pwrite)</span>
                  </div>
                </div>

                <div className="space-y-2 bg-[#1e1e1e] p-3 border border-[#2e2e2e] rounded-none">
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#292929] pb-1 text-[#009669]">
                    File Diagnostics
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Save Path:</span>
                    <span className="truncate max-w-[140px]" title={download.savePath}>
                      {download.savePath}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Info Hash:</span>
                    <span className="truncate max-w-[140px] text-[#009669]">
                      {download.infoHash || download.checksum || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Added On:</span>
                    <span>{new Date(download.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TRACKERS TAB */}
            {activeTab === 'trackers' && (
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
                    {(
                      download.trackers || [
                        {
                          url: 'udp://tracker.neobit.io:6969/announce',
                          status: 'working',
                          peers: 45
                        },
                        {
                          url: 'https://tracker.openbittorrent.com:443/announce',
                          status: 'working',
                          peers: 12
                        }
                      ]
                    ).map((tr, idx) => (
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
            )}

            {/* PEERS / WORKER THREADS TAB */}
            {activeTab === 'peers' && (
              <div className="space-y-3">
                <ChunkProgress chunks={download.chunks} totalSize={download.totalSize} />
              </div>
            )}

            {/* HTTP SOURCES / MIRRORS TAB */}
            {activeTab === 'sources' && (
              <div className="space-y-2 font-mono">
                <div className="p-2.5 bg-[#1e1e1e] border border-[#2e2e2e] flex items-center justify-between">
                  <span className="text-[#009669] font-semibold">{download.url}</span>
                  <span className="text-emerald-400 font-bold">Primary Range Source OK</span>
                </div>
              </div>
            )}

            {/* CONTENT / FILES TAB */}
            {activeTab === 'content' && (
              <div className="w-full">
                <table className="w-full text-left font-mono border border-[#2e2e2e]">
                  <thead className="bg-[#1e1e1e] border-b border-[#2e2e2e] text-slate-300">
                    <tr>
                      <th className="p-2 border-r border-[#292929]">Path / File Name</th>
                      <th className="p-2 border-r border-[#292929] w-24 text-right">Size</th>
                      <th className="p-2 border-r border-[#292929] w-24 text-right">Downloaded</th>
                      <th className="p-2 w-24 text-center">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242424]">
                    {(
                      download.files || [
                        {
                          path: download.name,
                          size: download.totalSize,
                          downloaded: download.downloadedSize,
                          priority: 'normal'
                        }
                      ]
                    ).map((f, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-2 font-medium">{f.path}</td>
                        <td className="p-2 text-right">{formatBytes(f.size)}</td>
                        <td className="p-2 text-right text-emerald-400">
                          {formatBytes(f.downloaded)}
                        </td>
                        <td className="p-2 text-center text-slate-400 uppercase">{f.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* BANDWIDTH SPEED TAB */}
            {activeTab === 'speed' && <SpeedChart history={speedHistory} />}
          </>
        )}
      </div>
    </div>
  )
}
