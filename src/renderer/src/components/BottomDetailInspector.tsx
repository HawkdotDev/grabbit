import React, { useState } from 'react'
import { DownloadItem, SpeedSample } from '../../../engine/types'
import { ChunkProgress } from './ChunkProgress'
import { GeneralTab } from './inspector/GeneralTab'
import { TrackersTab } from './inspector/TrackersTab'
import { ContentFilesTab } from './inspector/ContentFilesTab'
import { HttpSourcesTab } from './inspector/HttpSourcesTab'
import { Info, Globe, Users, Link, FileText } from 'lucide-react'

interface BottomDetailInspectorProps {
  height?: number
  download: DownloadItem | null
  speedHistory: SpeedSample[]
}

export const BottomDetailInspector: React.FC<BottomDetailInspectorProps> = React.memo(
  ({ height = 240, download }) => {
    const [activeTab, setActiveTab] = useState<
      'general' | 'trackers' | 'peers' | 'sources' | 'content'
    >('general')

    const tabs = [
      { id: 'general', label: 'General', icon: Info },
      { id: 'trackers', label: 'Trackers', icon: Globe },
      { id: 'peers', label: 'Peers / Threads', icon: Users },
      { id: 'sources', label: 'HTTP Sources', icon: Link },
      { id: 'content', label: 'Content / Files', icon: FileText }
    ]

    return (
      <div
        style={{ height }}
        className="bg-ide-surface border-t border-ide-border flex flex-col font-sans text-xs select-none shrink-0"
      >
        {/* Bottom Tab Bar */}
        <div className="h-9 px-3 bg-ide-bg border-b border-[#292929] flex items-center justify-between">
          <div className="flex items-center gap-1">
            {tabs.map((t) => {
              const Icon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() =>
                    setActiveTab(t.id as 'general' | 'trackers' | 'peers' | 'sources' | 'content')
                  }
                  className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer rounded-none border-b-2 ${
                    isActive
                      ? 'border-theme-accent text-theme-accent bg-theme-tint font-bold'
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
        <div className="flex-1 overflow-y-auto px-3 py-2 bg-ide-bg text-slate-300 font-sans">
          {activeTab === 'trackers' ? (
            <TrackersTab download={download} />
          ) : !download ? (
            <div className="h-full flex items-center justify-center text-slate-500 italic text-xs">
              Select a task in the table above to view detailed diagnostics and peers.
            </div>
          ) : (
            <>
              {activeTab === 'general' && <GeneralTab download={download} />}
              {activeTab === 'peers' && (
                <ChunkProgress chunks={download.chunks} totalSize={download.totalSize} />
              )}
              {activeTab === 'sources' && <HttpSourcesTab download={download} />}
              {activeTab === 'content' && <ContentFilesTab download={download} />}
            </>
          )}
        </div>
      </div>
    )
  }
)

BottomDetailInspector.displayName = 'BottomDetailInspector'
