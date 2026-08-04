import React from 'react'
import { DownloadItem } from '../../../../engine/types'
import { formatBytes, formatSpeed } from '../../utils/formatters'

interface GeneralTabProps {
  download: DownloadItem
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ download }) => {
  return (
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
  )
}
