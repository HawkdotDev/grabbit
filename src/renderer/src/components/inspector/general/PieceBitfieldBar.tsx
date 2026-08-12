import React from 'react'

interface PieceBitfieldBarProps {
  progressPct: number
  availabilityVal: number
  pieceSlices: number[]
  availSlices: number[]
}

export const PieceBitfieldBar: React.FC<PieceBitfieldBarProps> = React.memo(({
  progressPct,
  availabilityVal,
  pieceSlices,
  availSlices
}) => {
  return (
    <div className="bg-ide-surface/50 p-2.5 border border-ide-border space-y-2 select-none">
      {/* Downloaded Piece Map Bar */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-medium text-slate-300 w-20 shrink-0">Downloaded:</span>
        <div className="flex-1 bg-ide-bg border border-ide-border h-4.5 relative overflow-hidden flex flex-col">
          {/* Top Slim Blue Overall Progress Line */}
          <div
            className="h-1 bg-blue-500 transition-all duration-300 shrink-0 z-10"
            style={{ width: `${progressPct.toFixed(1)}%` }}
          />
          {/* Piece Bitfield Visualizer Grid */}
          <div className="flex-1 flex items-stretch w-full overflow-hidden bg-ide-bg">
            {pieceSlices.map((val, idx) => (
              <div
                key={idx}
                className={`flex-1 border-r border-ide-bg/30 ${
                  val >= 1
                    ? 'bg-theme-accent'
                    : val > 0
                    ? 'bg-theme-accent/50'
                    : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-200 shrink-0 w-16 text-right">
          {progressPct.toFixed(1)} %
        </span>
      </div>

      {/* Swarm Availability Heatmap Bar */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-medium text-slate-300 w-20 shrink-0">Availability:</span>
        <div className="flex-1 bg-ide-bg border border-ide-border h-4 relative overflow-hidden flex items-stretch">
          {availSlices.map((avail, idx) => (
            <div
              key={idx}
              className={`flex-1 ${
                avail > 0
                  ? 'bg-emerald-500/80 border-r border-ide-bg/20'
                  : 'bg-ide-surface/60 border-r border-ide-bg'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-200 shrink-0 w-16 text-right">
          {availabilityVal.toFixed(3)}
        </span>
      </div>
    </div>
  )
})
