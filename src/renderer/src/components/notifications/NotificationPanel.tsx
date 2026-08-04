import React, { useState } from 'react'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Maximize2,
  Minimize2,
  CheckCheck,
  Trash2,
  Search,
  Filter
} from 'lucide-react'

export interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onMarkAsRead: (id?: string) => void
  onClearAll: () => void
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll
}) => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'warning'>('all')

  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    if (filterType === 'unread') return matchesSearch && !n.read
    if (filterType === 'warning')
      return matchesSearch && (n.type === 'warning' || n.type === 'error')
    return matchesSearch
  })

  const getNotificationIcon = (type: NotificationItem['type']): React.JSX.Element => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
      default:
        return <Info className="h-4 w-4 text-cyan-400 shrink-0" />
    }
  }

  // --- FULLSCREEN / MAXIMIZED MODAL MODE ---
  if (isMaximized) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-sans text-xs select-none">
        <div className="bg-ide-surface border border-ide-border rounded-none w-full h-full max-w-5xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="p-4 border-b border-ide-border flex items-center justify-between bg-ide-bg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-theme-tint text-theme-accent border border-theme-accent/20">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-100">Notifications Console</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-theme-tint text-theme-accent font-mono font-bold text-[11px] border border-theme-accent/30">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  System diagnostics, engine events, and download task notifications
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onMarkAsRead()}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold border border-white/5 flex items-center gap-1.5 transition cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4 text-theme-accent" />
                <span>Mark All Read</span>
              </button>

              <button
                onClick={onClearAll}
                className="px-3 py-1.5 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-semibold border border-white/5 flex items-center gap-1.5 transition cursor-pointer"
                title="Clear all notifications"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </button>

              <div className="h-5 w-px bg-ide-border mx-1" />

              <button
                onClick={() => setIsMaximized(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="Restore / Minimize to Dropdown"
              >
                <Minimize2 className="h-5 w-5" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="p-3 bg-ide-surface border-b border-ide-border flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md flex items-center">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notification title or logs..."
                className="w-full bg-ide-bg text-slate-100 placeholder-slate-500 text-xs pl-9 pr-3.5 py-2 border border-ide-border focus:outline-none focus:border-theme-accent font-mono"
              />
            </div>

            <div className="flex items-center gap-1 bg-ide-bg border border-ide-border p-1">
              <Filter className="h-3.5 w-3.5 text-theme-accent ml-2" />
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-theme-accent text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  filterType === 'unread'
                    ? 'bg-theme-accent text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterType('warning')}
                className={`px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  filterType === 'warning'
                    ? 'bg-theme-accent text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Warnings &amp; Alerts
              </button>
            </div>
          </div>

          {/* Notification List View */}
          <div className="flex-1 overflow-y-auto p-4 bg-ide-bg space-y-1.5">
            {filteredNotifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 italic">
                <Bell className="h-10 w-10 stroke-[1.2] text-slate-600 mb-2" />
                <span>No notifications match your current filter.</span>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-3.5 mb-1 flex items-start justify-between gap-4 border transition cursor-pointer ${
                    !n.read
                      ? 'bg-theme-tint/30 border-l-2 border-l-theme-accent border-ide-border/60'
                      : 'bg-ide-surface/60 border-ide-border/40 hover:bg-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-100">{n.title}</h4>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 bg-theme-accent rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[11px] text-slate-400">{n.timestamp}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onMarkAsRead(n.id)
                      }}
                      className="p-1 text-slate-400 hover:text-theme-accent transition cursor-pointer"
                      title={n.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      <CheckCheck
                        className={`h-4 w-4 ${n.read ? 'text-slate-500' : 'text-theme-accent'}`}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- DROPDOWN POPUP MODE ---
  return (
    <>
      {/* Backdrop to close dropdown */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-ide-surface border border-ide-border shadow-2xl z-50 rounded-none overflow-hidden select-none font-sans text-xs animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-3 px-4 border-b border-ide-border flex items-center justify-between bg-ide-bg">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-theme-accent" />
            <h3 className="font-bold text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-theme-tint text-theme-accent font-mono font-bold text-[10px] border border-theme-accent/30">
                {unreadCount} Unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => onMarkAsRead()}
                className="p-1.5 text-slate-400 hover:text-theme-accent transition cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setIsMaximized(true)}
              className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              title="Maximize to Full Screen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List of Unread & Recent Notifications */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-ide-surface">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 italic">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`p-3 mb-1 flex items-start gap-3 border transition cursor-pointer ${
                  !n.read
                    ? 'bg-theme-tint/30 border-l-2 border-l-theme-accent border-ide-border/60'
                    : 'bg-ide-surface/60 border-ide-border/40 hover:bg-white/5 opacity-75'
                }`}
              >
                <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-100 truncate">{n.title}</h4>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 px-3 bg-ide-bg border-t border-ide-border flex items-center justify-between text-[11px]">
          <button
            onClick={() => setIsMaximized(true)}
            className="text-theme-accent hover:underline font-semibold cursor-pointer"
          >
            View all &rarr;
          </button>
          <button
            onClick={onClearAll}
            className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  )
}
