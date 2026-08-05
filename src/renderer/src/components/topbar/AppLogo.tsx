import React from 'react'
import logoSvg from '../../assets/icon.svg'

export const AppLogo: React.FC = React.memo(() => {
  return (
    <div className="flex items-center gap-2 font-bold text-xs text-white leading-none">
      <img src={logoSvg} alt="Grabbit Logo" className="h-4 w-4 shrink-0 block object-contain" />
      <span className="text-theme-accent leading-none">Grabbit</span>
      <span className="text-slate-400 font-mono text-[11px] leading-none">v0.0.2</span>
    </div>
  )
})

AppLogo.displayName = 'AppLogo'
