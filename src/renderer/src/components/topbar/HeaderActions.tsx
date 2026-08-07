import React, { useState } from 'react'
import {
  Settings,
  Bell,
  User,
  Sliders,
  Zap,
  Folder,
  Server,
  Key,
  Activity,
  LogOut
} from 'lucide-react'
import { NotificationPanel, NotificationItem } from '../notifications/NotificationPanel'

interface HeaderActionsProps {
  onOpenSettingsModal: () => void
}

export const HeaderActions: React.FC<HeaderActionsProps> = React.memo(({ onOpenSettingsModal }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Download Task Completed',
      message: 'Ubuntu 24.04 LTS Desktop ISO (5.8 GB) finished downloading and verified checksum.',
      timestamp: '2 mins ago',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Zero-Copy Allocation',
      message: 'Pre-allocated disk buffer for Linux_Kernel_6.8.tar.xz (1.2 GB).',
      timestamp: '15 mins ago',
      read: false,
      type: 'info'
    },
    {
      id: '3',
      title: 'Bandwidth Peak Reached',
      message: 'Engine achieved peak acceleration of 48.2 MB/s with 32 active worker threads.',
      timestamp: '1 hour ago',
      read: false,
      type: 'success'
    },
    {
      id: '4',
      title: 'Tracker Timeout Notice',
      message: 'udp://tracker.openbittorrent.com:443 timed out. Switched to DHT peer discovery.',
      timestamp: '3 hours ago',
      read: true,
      type: 'warning'
    }
  ])

  const handleMarkAsRead = (id?: string): void => {
    setNotifications((prev) =>
      prev.map((n) => (id ? (n.id === id ? { ...n, read: true } : n) : { ...n, read: true }))
    )
  }

  const handleClearNotifications = (): void => {
    setNotifications([])
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* Settings Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setIsSettingsOpen((prev) => !prev)
            setIsProfileOpen(false)
            setIsNotificationOpen(false)
          }}
          className={`p-2 transition cursor-pointer rounded-none ${
            isSettingsOpen
              ? 'text-white bg-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Settings & Preferences"
        >
          <Settings className="h-4 w-4" />
        </button>

        {isSettingsOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-ide-surface border border-ide-border shadow-2xl py-1 z-50 rounded-none text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-ide-border/50">
                Quick Preferences
              </div>

              <button
                onClick={() => {
                  setIsSettingsOpen(false)
                  onOpenSettingsModal()
                }}
                className="w-full text-left px-3 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Sliders className="h-4 w-4 text-theme-accent" />
                <div>
                  <div className="font-bold text-slate-100">Engine Preferences</div>
                  <div className="text-[10px] text-slate-400">
                    All download &amp; thread settings
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(false)
                  onOpenSettingsModal()
                }}
                className="w-full text-left px-3 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 cursor-pointer font-medium border-t border-ide-border/50"
              >
                <Zap className="h-4 w-4 text-amber-200" />
                <div>
                  <div className="font-bold text-slate-100">Speed &amp; Bandwidth</div>
                  <div className="text-[10px] text-slate-400">Global rate limiters</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(false)
                  onOpenSettingsModal()
                }}
                className="w-full text-left px-3 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 cursor-pointer font-medium border-t border-ide-border/50"
              >
                <Folder className="h-4 w-4 text-sky-300" />
                <div>
                  <div className="font-bold text-slate-100">Storage Directories</div>
                  <div className="text-[10px] text-slate-400">
                    Default save paths &amp; categories
                  </div>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Notifications Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setIsNotificationOpen((prev) => !prev)
            setIsSettingsOpen(false)
            setIsProfileOpen(false)
          }}
          className={`p-2 transition cursor-pointer rounded-none relative ${
            isNotificationOpen
              ? 'text-white bg-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {notifications.some((n) => !n.read) && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-theme-accent rounded-none animate-pulse" />
          )}
        </button>

        <NotificationPanel
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearNotifications}
        />
      </div>

      {/* User Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setIsProfileOpen((prev) => !prev)
            setIsSettingsOpen(false)
            setIsNotificationOpen(false)
          }}
          className={`p-2 transition cursor-pointer rounded-none ${
            isProfileOpen
              ? 'text-white bg-white/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="User Profile & Gateway"
        >
          <User className="h-4 w-4" />
        </button>

        {isProfileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-ide-surface border border-ide-border shadow-2xl py-1 z-50 rounded-none text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Header */}
              <div className="p-3 border-b border-ide-border flex items-center gap-3">
                <div className="w-8 h-8 bg-theme-tint text-theme-accent border border-theme-accent/30 font-bold flex items-center justify-center text-xs rounded-none">
                  H
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-100 truncate">HawkdotDev</div>
                  <div className="text-[10px] font-mono text-theme-accent">
                    Remote Gateway :6800
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Server className="h-4 w-4 text-cyan-300" />
                <span>Remote Control Server</span>
              </button>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Key className="h-4 w-4 text-amber-200" />
                <span>API Keys &amp; Tokens</span>
              </button>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Activity className="h-4 w-4 text-emerald-300" />
                <span>Active Browser Connections</span>
              </button>

              <div className="border-t border-ide-border my-1" />

              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-950/40 hover:text-rose-300 text-xs flex items-center gap-2.5 cursor-pointer font-medium text-slate-400"
              >
                <LogOut className="h-4 w-4 text-rose-300" />
                <span>Lock / Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
})

HeaderActions.displayName = 'HeaderActions'
