import React from 'react'
import { DownloadStatus } from '../../../../engine/types'

interface ProgressBarCellProps {
  pct: number
  status: DownloadStatus
}

export const ProgressBarCell: React.FC<ProgressBarCellProps> = React.memo(({ pct, status }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-4 bg-slate-950/80 border border-ide-border relative overflow-hidden rounded-none shadow-inner">
        <div
          className={`h-full smooth-gpu transition-all duration-300 ease-out relative ${
            status === 'completed' || status === 'seeding'
              ? 'bg-linear-to-r from-emerald-600 to-emerald-400'
              : status === 'error'
                ? 'bg-linear-to-r from-rose-600 to-rose-400'
                : status === 'paused'
                  ? 'bg-linear-to-r from-amber-600 to-amber-400'
                  : 'bg-linear-to-r from-violet-600 via-purple-500 to-cyan-400 progress-active'
          }`}
          style={{ width: `${pct}%` }}
        >
          {status === 'downloading' && pct > 0 && pct < 100 && (
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 blur-[1px]" />
          )}
        </div>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {pct}%
        </span>
      </div>
    </div>
  )
})

ProgressBarCell.displayName = 'ProgressBarCell'
