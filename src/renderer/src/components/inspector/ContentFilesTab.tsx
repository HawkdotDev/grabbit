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
          {files.map((f, idx) => (
            <tr key={idx} className="hover:bg-white/5">
              <td className="p-2 font-medium">{f.path}</td>
              <td className="p-2 text-right">{formatBytes(f.size)}</td>
              <td className="p-2 text-right text-emerald-400">{formatBytes(f.downloaded)}</td>
              <td className="p-2 text-center text-slate-400 uppercase">{f.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
