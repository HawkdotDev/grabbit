import React, { useState, useEffect, useRef } from 'react'
import { DownloadItem, SpeedSample } from '../../../../engine/types'
import { GeneralTab } from './GeneralTab'
import { TrackersTab } from './TrackersTab'
import { ContentFilesTab } from './ContentFilesTab'
import { HttpSourcesTab } from './HttpSourcesTab'
import { PeersTab } from './PeersTab'
import { ThreadsTab } from './ThreadsTab'
import { GraphsTab } from './GraphsTab'
import { Info, Globe, Users, Cpu, Link, FileText, LineChart, ChevronDown, ChevronUp, Settings2, Eye, EyeOff, Check, RotateCcw } from 'lucide-react'

interface BottomDetailInspectorProps {
  height?: number
  download: DownloadItem | null
  speedHistory: SpeedSample[]
}

class InspectorErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; errorMsg: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message || 'Component render exception' }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Inspector Tab Error]', error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-ide-surface border border-zinc-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-200">Inspector Diagnostics Notice</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{this.state.errorMsg}</div>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, errorMsg: '' })}
            className="px-2.5 py-1 bg-theme-tint hover:bg-white/10 text-theme-accent border border-theme-accent/40 font-bold transition cursor-pointer"
          >
            Retry Tab
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export type InspectorTabId = 'general' | 'peers' | 'threads' | 'trackers' | 'sources' | 'content' | 'graphs'

interface TabConfig {
  id: InspectorTabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const ALL_INSPECTOR_TABS: TabConfig[] = [
  { id: 'general', label: 'General', icon: Info },
  { id: 'trackers', label: 'Trackers', icon: Globe },
  { id: 'peers', label: 'Peers', icon: Users },
  { id: 'sources', label: 'HTTP Sources', icon: Link },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'graphs', label: 'Graphs', icon: LineChart },
  { id: 'threads', label: 'Threads', icon: Cpu }
]

export const BottomDetailInspector: React.FC<BottomDetailInspectorProps> = React.memo(
  ({ height = 240, download, speedHistory = [] }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [activeTab, setActiveTab] = useState<InspectorTabId>('general')
    const [showTabSettings, setShowTabSettings] = useState(false)
    const settingsRef = useRef<HTMLDivElement>(null)

    // Tab visibility state persisted in localStorage
    const [visibleTabs, setVisibleTabs] = useState<Record<InspectorTabId, boolean>>(() => {
      try {
        const saved = localStorage.getItem('neobit_inspector_visible_tabs')
        if (saved) return JSON.parse(saved)
      } catch (e) {}
      return {
        content: true,
        general: true,
        peers: true,
        trackers: true,
        graphs: true,
        threads: true,
        sources: true
      }
    })

    // Click outside to close tab settings popover
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
          setShowTabSettings(false)
        }
      }
      if (showTabSettings) {
        document.addEventListener('mousedown', handleClickOutside)
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [showTabSettings])

    const toggleTabVisibility = (id: InspectorTabId) => {
      setVisibleTabs((prev) => {
        const next = { ...prev, [id]: !prev[id] }
        try {
          localStorage.setItem('neobit_inspector_visible_tabs', JSON.stringify(next))
        } catch (e) {}
        return next
      })
    }

    const resetAllTabsVisible = () => {
      const allOn: Record<InspectorTabId, boolean> = {
        content: true,
        general: true,
        peers: true,
        trackers: true,
        graphs: true,
        threads: true,
        sources: true
      }
      setVisibleTabs(allOn)
      try {
        localStorage.setItem('neobit_inspector_visible_tabs', JSON.stringify(allOn))
      } catch (e) {}
    }

    const visibleTabList = ALL_INSPECTOR_TABS.filter((t) => visibleTabs[t.id] !== false)

    return (
      <div
        style={{ height: isCollapsed ? 36 : height }}
        className="bg-ide-surface border-t border-ide-border flex flex-col font-sans text-xs select-none shrink-0 transition-all duration-200"
      >
        {/* Bottom Tab Bar Header */}
        <div className="h-9 px-3 bg-ide-bg border-b border-[#292929] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            {visibleTabList.map((t) => {
              const Icon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id)
                    if (isCollapsed) setIsCollapsed(false)
                  }}
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

          <div className="flex items-center gap-3">
            {download && (
              <div className="text-[11px] font-mono text-slate-400 truncate max-w-sm hidden sm:block">
                Selected: <strong className="text-slate-200">{download.name}</strong>
              </div>
            )}

            {/* Tab Visibility Settings Menu */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowTabSettings((prev) => !prev)}
                className={`p-1.5 transition cursor-pointer rounded-none ${
                  showTabSettings
                    ? 'text-theme-accent bg-theme-tint'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Configure visible inspector tabs"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </button>

              {showTabSettings && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-ide-surface border border-ide-border shadow-2xl z-50 p-2 flex flex-col gap-1 rounded-none text-xs">
                  <div className="flex items-center justify-between px-1.5 py-1 border-b border-ide-border/70 text-slate-300 font-semibold text-[11px]">
                    <span>Inspector Tabs</span>
                    <button
                      onClick={resetAllTabsVisible}
                      className="text-[10px] text-theme-accent hover:underline flex items-center gap-0.5"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-0.5 py-1">
                    {ALL_INSPECTOR_TABS.map((t) => {
                      const isVisible = visibleTabs[t.id] !== false
                      const Icon = t.icon
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggleTabVisibility(t.id)}
                          className={`w-full flex items-center justify-between px-2 py-1 text-[11px] rounded-none transition text-left cursor-pointer ${
                            isVisible
                              ? 'text-slate-100 hover:bg-white/10'
                              : 'text-slate-500 hover:bg-white/5'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {isVisible ? (
                              <Eye className="h-3 w-3 text-theme-accent" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-slate-600" />
                            )}
                            <Icon className="h-3 w-3 text-slate-400" />
                            <span>{t.label}</span>
                          </span>
                          {isVisible && <Check className="h-3 w-3 text-theme-accent" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Collapse / Expand Arrow Button on the Right */}
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer rounded-none"
              title={isCollapsed ? 'Expand Bottom Inspector' : 'Collapse Bottom Inspector'}
            >
              {isCollapsed ? (
                <ChevronUp className="h-4 w-4 text-theme-accent" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Body Container (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className={`flex-1 overflow-y-auto bg-ide-bg text-slate-300 font-sans ${activeTab === 'general' ? 'p-3' : 'p-0'}`}>
            <InspectorErrorBoundary key={activeTab}>
              {activeTab === 'trackers' ? (
                <TrackersTab download={download} />
              ) : activeTab === 'graphs' ? (
                <GraphsTab download={download} speedHistory={speedHistory} />
              ) : !download ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic text-xs p-4">
                  Select a task in the table above to view detailed diagnostics and peers.
                </div>
              ) : (
                <>
                  {activeTab === 'general' && <GeneralTab download={download} />}
                  {activeTab === 'peers' && <PeersTab download={download} />}
                  {activeTab === 'threads' && <ThreadsTab download={download} />}
                  {activeTab === 'sources' && <HttpSourcesTab download={download} />}
                  {activeTab === 'content' && <ContentFilesTab download={download} />}
                </>
              )}
            </InspectorErrorBoundary>
          </div>
        )}
      </div>
    )
  }
)

BottomDetailInspector.displayName = 'BottomDetailInspector'
