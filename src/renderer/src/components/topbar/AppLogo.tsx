import React from 'react'

export const AppLogo: React.FC = React.memo(() => {
  return (
    <div className="flex items-center gap-2 font-bold text-xs text-white">
      <span className="h-2.5 w-2.5 bg-theme-accent rounded-none animate-pulse" />
      <span className="text-theme-accent">Neobit</span>
      <span className="text-slate-400 font-mono text-[11px]">v0.0.2</span>
    </div>
  )
})

AppLogo.displayName = 'AppLogo'
