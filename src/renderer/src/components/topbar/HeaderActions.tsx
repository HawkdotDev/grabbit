import React, { useState } from 'react'
import {
  Settings,
  Bell,
  User,
  Server,
  Key,
  Activity,
  LogOut
} from 'lucide-react'
import { NotificationPanel, NotificationItem } from '../notifications/NotificationPanel'
import { ProfileGatewayModal, ProfileGatewayTab } from '../modals/ProfileGatewayModal'

interface HeaderActionsProps {
  onOpenSettingsModal: () => void
}

export const HeaderActions: React.FC<HeaderActionsProps> = React.memo(({ onOpenSettingsModal }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileModalTab, setProfileModalTab] = useState<ProfileGatewayTab>('gateway')
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'welcome',
      title: 'Grabbit Engine Active',
      message: 'Multi-threaded chunk engine and WebTorrent swarm ready.',
      timestamp: 'Just now',
      read: true,
      type: 'info'
    }
  ])

  React.useEffect(() => {
    const unsubAdded = window.api?.onDownloadAdded?.((download) => {
      setNotifications((prev) => [
        {
          id: `added_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          title: 'Download Queued',
          message: `${download.name || 'New download'} added to transfer queue.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: 'info'
        },
        ...prev.slice(0, 49)
      ])
    })

    const unsubCompleted = window.api?.onDownloadCompleted?.((download) => {
      const sizeMb = ((download.totalSize || 0) / 1048576).toFixed(1)
      setNotifications((prev) => [
        {
          id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          title: 'Download Completed',
          message: `${download.name} (${sizeMb} MB) finished downloading successfully.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: 'success'
        },
        ...prev.slice(0, 49)
      ])
    })

    const unsubError = window.api?.onDownloadError?.((data) => {
      setNotifications((prev) => [
        {
          id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          title: 'Download Interrupted',
          message: data.error || 'Transfer failed due to a network or connection error.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: 'error'
        },
        ...prev.slice(0, 49)
      ])
    })

    return () => {
      if (unsubAdded) unsubAdded()
      if (unsubCompleted) unsubCompleted()
      if (unsubError) unsubError()
    }
  }, [])

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
      {/* Settings Button (Directly opens Preferences Popup) */}
      <button
        onClick={() => {
          onOpenSettingsModal()
          setIsProfileOpen(false)
          setIsNotificationOpen(false)
        }}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer rounded-none"
        title="Settings & Preferences"
      >
        <Settings className="h-4 w-4 text-theme-accent" />
      </button>

      {/* Notifications Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setIsNotificationOpen((prev) => !prev)
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
            <div className="fixed inset-0 z-90" onClick={() => setIsProfileOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-ide-surface border border-ide-border shadow-2xl py-1 z-100 rounded-none text-slate-200 animate-in fade-in zoom-in-95 duration-150">
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
                onClick={() => {
                  setProfileModalTab('gateway')
                  setIsProfileModalOpen(true)
                  setIsProfileOpen(false)
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Server className="h-4 w-4 text-cyan-300" />
                <span>Remote Control Server</span>
              </button>

              <button
                onClick={() => {
                  setProfileModalTab('tokens')
                  setIsProfileModalOpen(true)
                  setIsProfileOpen(false)
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Key className="h-4 w-4 text-amber-200" />
                <span>API Keys &amp; Tokens</span>
              </button>

              <button
                onClick={() => {
                  setProfileModalTab('browser')
                  setIsProfileModalOpen(true)
                  setIsProfileOpen(false)
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-theme-tint hover:text-theme-accent text-xs flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <Activity className="h-4 w-4 text-emerald-300" />
                <span>Active Browser Connections</span>
              </button>

              <div className="border-t border-ide-border my-1" />

              <button
                onClick={() => {
                  setProfileModalTab('lock')
                  setIsProfileModalOpen(true)
                  setIsProfileOpen(false)
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-950/40 hover:text-rose-300 text-xs flex items-center gap-2.5 cursor-pointer font-medium text-slate-400"
              >
                <LogOut className="h-4 w-4 text-rose-300" />
                <span>Lock / Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Profile Gateway Dialog */}
      <ProfileGatewayModal
        isOpen={isProfileModalOpen}
        initialTab={profileModalTab}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  )
})

HeaderActions.displayName = 'HeaderActions'
