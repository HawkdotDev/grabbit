import React, { useState } from 'react'
import { Settings, Bell, User } from 'lucide-react'
import { NotificationPanel, NotificationItem } from '../notifications/NotificationPanel'

interface HeaderActionsProps {
  onOpenSettingsModal: () => void
}

export const HeaderActions: React.FC<HeaderActionsProps> = React.memo(({ onOpenSettingsModal }) => {
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
      <button
        onClick={onOpenSettingsModal}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer rounded-none"
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      <div className="relative">
        <button
          onClick={() => setIsNotificationOpen((prev) => !prev)}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer rounded-none relative"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {notifications.some((n) => !n.read) && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-theme-accent rounded-full animate-pulse" />
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

      <button
        className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer rounded-none"
        title="User Profile"
      >
        <User className="h-4 w-4" />
      </button>
    </div>
  )
})

HeaderActions.displayName = 'HeaderActions'
