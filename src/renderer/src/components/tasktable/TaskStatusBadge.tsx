import React from 'react'
import { DownloadStatus } from '../../../../engine/types'

interface TaskStatusBadgeProps {
  status: DownloadStatus
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = React.memo(({ status }) => {
  let statusText = status.toString()
  if (status === 'downloading') statusText = 'Downloading'
  if (status === 'completed') statusText = 'Completed'
  if (status === 'seeding') statusText = 'Seeding'
  if (status === 'paused') statusText = 'Paused'
  if (status === 'error') statusText = 'Errored'
  if (status === 'stalled') statusText = 'Stalled'
  if (status === 'checking') statusText = 'Checking'

  const getDotStyle = (): string => {
    switch (status) {
      case 'downloading':
        return 'bg-violet-400 animate-ping opacity-75'
      case 'seeding':
      case 'completed':
        return 'bg-emerald-400'
      case 'paused':
        return 'bg-amber-400'
      case 'error':
        return 'bg-rose-400'
      case 'stalled':
        return 'bg-amber-500'
      case 'checking':
        return 'bg-sky-400 animate-ping opacity-75'
      default:
        return 'bg-slate-400'
    }
  }

  const getDotSolidStyle = (): string => {
    switch (status) {
      case 'downloading':
        return 'bg-violet-400'
      case 'seeding':
      case 'completed':
        return 'bg-emerald-400'
      case 'paused':
        return 'bg-amber-400'
      case 'error':
        return 'bg-rose-400'
      case 'stalled':
        return 'bg-amber-500'
      case 'checking':
        return 'bg-sky-400'
      default:
        return 'bg-slate-400'
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-medium border border-white/5 ${
        status === 'completed' || status === 'seeding'
          ? 'text-emerald-300 bg-emerald-950/30 border-emerald-500/20'
          : status === 'downloading'
            ? 'text-violet-300 bg-violet-950/30 border-violet-500/20'
            : status === 'error'
              ? 'text-rose-300 bg-rose-950/30 border-rose-500/20'
              : status === 'paused'
                ? 'text-amber-300 bg-amber-950/30 border-amber-500/20'
                : 'text-slate-300 bg-slate-800/40 border-slate-700/30'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {(status === 'downloading' || status === 'checking') && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${getDotStyle()}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${getDotSolidStyle()}`} />
      </span>
      <span>{statusText}</span>
    </span>
  )
})

TaskStatusBadge.displayName = 'TaskStatusBadge'
