import React from 'react'
import { DownloadItem } from '../../../../engine/types'

interface HttpSourcesTabProps {
  download: DownloadItem
}

export const HttpSourcesTab: React.FC<HttpSourcesTabProps> = ({ download }) => {
  return (
    <div className="space-y-2 font-mono">
      <div className="p-2.5 bg-ide-surface border border-ide-border flex items-center justify-between">
        <span className="text-theme-accent font-semibold">{download.url}</span>
        <span className="text-emerald-400 font-bold">Primary Range Source OK</span>
      </div>
    </div>
  )
}
