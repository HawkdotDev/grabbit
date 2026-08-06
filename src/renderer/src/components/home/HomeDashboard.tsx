import React from 'react'
import { DownloadItem } from '../../../../engine/types'
import { Plus } from 'lucide-react'
import { HomeMetricCards } from './HomeMetricCards'
import { HomeRecentDownloads } from './HomeRecentDownloads'
import { HomeEngineOverview } from './HomeEngineOverview'

interface HomeDashboardProps {
  downloads: DownloadItem[]
  globalSpeed: number
  onOpenAddModal: (mode?: 'link' | 'file') => void
  onNavigateToTasks?: () => void
  onSelectDownload?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onCancel?: (id: string) => void
}

export const HomeDashboard: React.FC<HomeDashboardProps> = React.memo(
  ({
    downloads,
    globalSpeed,
    onOpenAddModal,
    onNavigateToTasks,
    onSelectDownload,
    onPause,
    onResume,
    onCancel
  }) => {
    const totalDownloadedBytes = downloads.reduce((acc, d) => acc + d.downloadedSize, 0)
    const totalUploadedBytes = downloads.reduce((acc, d) => acc + (d.uploadedSize || 0), 0)
    const totalSize = downloads.reduce((acc, d) => acc + d.totalSize, 0)

    const recentDownloads = [...downloads].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4)

    return (
      <div className="flex-1 flex flex-col h-full bg-ide-bg text-slate-100 p-2 md:p-4 overflow-y-auto font-sans text-xs select-none space-y-6 relative rounded-none">
        {/* Top Metric Cards */}
        <HomeMetricCards
          totalDownloadedBytes={totalDownloadedBytes}
          totalUploadedBytes={totalUploadedBytes}
          totalSize={totalSize}
          globalSpeed={globalSpeed}
          activeTasksCount={downloads.filter((d) => d.status === 'downloading').length}
        />

        {/* Main Content Split: Recent Downloads & Engine Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HomeRecentDownloads
              recentDownloads={recentDownloads}
              onOpenAddModal={onOpenAddModal}
              onNavigateToTasks={onNavigateToTasks}
              onSelectDownload={onSelectDownload}
              onPause={onPause}
              onResume={onResume}
              onCancel={onCancel}
            />
          </div>

          <div>
            <HomeEngineOverview
              downloads={downloads}
              globalSpeed={globalSpeed}
              onNavigateToTasks={onNavigateToTasks}
            />
          </div>
        </div>

        {/* Floating Action Button (+) */}
        <button
          onClick={() => onOpenAddModal('link')}
          className="fixed bottom-14 right-8 z-50 bg-[#b9cefd] hover:bg-[#a6c1fd] text-[#0f172a] p-4 rounded-none shadow-2xl transition duration-200 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 border border-white/20"
          title="Add New Download Task"
        >
          <Plus className="h-6 w-6 stroke-3" />
        </button>
      </div>
    )
  }
)

HomeDashboard.displayName = 'HomeDashboard'
