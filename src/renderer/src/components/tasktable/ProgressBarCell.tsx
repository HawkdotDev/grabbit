import React from 'react'
import { DownloadStatus } from '../../../../engine/types'

interface ProgressBarCellProps {
  pct: number
  status: DownloadStatus
}

export const ProgressBarCell: React.FC<ProgressBarCellProps> = React.memo(({ pct, status }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3.5 bg-ide-surface border border-ide-border relative overflow-hidden rounded-none">
        <div
          className={`h-full smooth-gpu transition-all duration-300 ease-out ${
            status === 'completed' || status === 'seeding'
              ? 'bg-emerald-400'
              : status === 'error'
                ? 'bg-rose-400'
                : status === 'paused'
                  ? 'bg-amber-300'
                  : 'bg-theme-accent progress-active'
          }`}
          style={{ width: `${pct}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-100 drop-shadow">
          {pct}%
        </span>
      </div>
    </div>
  )
})

ProgressBarCell.displayName = 'ProgressBarCell'
