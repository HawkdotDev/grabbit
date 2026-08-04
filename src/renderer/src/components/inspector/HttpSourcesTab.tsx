import React from 'react'
import { DownloadItem } from '../../../../engine/types'

interface HttpSourcesTabProps {
  download: DownloadItem
}

export const HttpSourcesTab: React.FC<HttpSourcesTabProps> = ({ download }) => {
  return (
    <div className="space-y-2 font-mono">
      <div className="p-2.5 bg-[#1e1e1e] border border-[#2e2e2e] flex items-center justify-between">
        <span className="text-[#009669] font-semibold">{download.url}</span>
        <span className="text-emerald-400 font-bold">Primary Range Source OK</span>
      </div>
    </div>
  )
}
