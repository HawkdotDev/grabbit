import React from 'react'
import { DownloadItem, SpeedSample } from '../../../engine/types'
import { HomeDashboard } from './HomeDashboard'

interface AnalyticsViewProps {
  downloads: DownloadItem[]
  speedHistory: SpeedSample[]
  globalSpeed: number
  onOpenAddModal?: (mode?: 'link' | 'file') => void
  onNavigateToTasks?: () => void
  onSelectDownload?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onCancel?: (id: string) => void
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = React.memo((props) => {
  return <HomeDashboard {...props} onOpenAddModal={props.onOpenAddModal || (() => {})} />
})

AnalyticsView.displayName = 'AnalyticsView'
