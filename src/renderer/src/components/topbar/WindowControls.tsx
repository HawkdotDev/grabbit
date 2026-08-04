import React, { useState, useEffect } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'

export const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (window.api) {
      window.api.isWindowMaximized().then(setIsMaximized)
    }
  }, [])

  const handleMinimize = (): void => {
    window.api?.minimizeWindow()
  }

  const handleMaximize = async (): Promise<void> => {
    if (window.api) {
      const state = await window.api.maximizeWindow()
      setIsMaximized(state)
    }
  }

  const handleClose = (): void => {
    window.api?.closeWindow()
  }

  return (
    <div className="flex items-center gap-0.5 style-no-drag">
      <button
        onClick={handleMinimize}
        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
        title="Minimize Window"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={handleMaximize}
        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
        title={isMaximized ? 'Restore Window' : 'Maximize Window'}
      >
        {isMaximized ? <Copy className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
      </button>

      <button
        onClick={handleClose}
        className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-600 rounded-none transition cursor-pointer"
        title="Close Application"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
