import React from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
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

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[11px] ${
        status === 'completed' || status === 'seeding'
          ? 'text-emerald-400 font-bold'
          : status === 'downloading'
            ? 'text-theme-accent'
            : status === 'error'
              ? 'text-rose-400'
              : 'text-amber-400'
      }`}
    >
      {status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'error' && <AlertCircle className="h-3 w-3" />}
      <span>{statusText}</span>
    </span>
  )
})

TaskStatusBadge.displayName = 'TaskStatusBadge'
