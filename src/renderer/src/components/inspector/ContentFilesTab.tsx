import React from 'react'
import { DownloadItem } from '../../../../engine/types'
import { formatBytes } from '../../utils/formatters'

interface ContentFilesTabProps {
  download: DownloadItem
}

export const ContentFilesTab: React.FC<ContentFilesTabProps> = ({ download }) => {
  const files = download.files || [
    {
      path: download.name,
      size: download.totalSize,
      downloaded: download.downloadedSize,
      priority: 'normal'
    }
  ]

  return (
    <div className="w-full">
      <table className="w-full text-left font-mono border border-ide-border">
        <thead className="bg-ide-surface border-b border-ide-border text-slate-300">
          <tr>
            <th className="p-2 border-r border-[#292929]">Path / File Name</th>
            <th className="p-2 border-r border-[#292929] w-24 text-right">Size</th>
            <th className="p-2 border-r border-[#292929] w-24 text-right">Downloaded</th>
            <th className="p-2 w-24 text-center">Priority</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#242424]">
          {files.map((f, idx) => (
            <tr key={idx} className="hover:bg-white/5">
              <td className="p-2 font-medium text-slate-200">{f.path}</td>
              <td className="p-2 text-right text-slate-300">{formatBytes(f.size)}</td>
              <td className="p-2 text-right text-emerald-400 font-semibold">
                {formatBytes(f.downloaded)}
              </td>
              <td className="p-2 text-center">
                <select
                  value={f.priority}
                  onChange={async (e) => {
                    const newPrio = e.target.value as 'high' | 'normal' | 'low' | 'ignore'
                    await window.api?.setTorrentFilePriority(download.id, f.path, newPrio)
                  }}
                  className="bg-ide-surface border border-ide-border text-slate-200 text-[11px] px-1.5 py-0.5 rounded-none font-mono cursor-pointer focus:outline-none focus:border-theme-accent"
                >
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                  <option value="ignore">Skip / Don&apos;t Download</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
