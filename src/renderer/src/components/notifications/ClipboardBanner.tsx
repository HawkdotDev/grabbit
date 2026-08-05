import React from 'react'
import { Link, Download, X } from 'lucide-react'
import { ClipboardDetectedLink } from '../../hooks/useClipboardDetector'

interface ClipboardBannerProps {
  detectedLink: ClipboardDetectedLink | null
  onAdd: (url: string) => void
  onDismiss: () => void
}

export const ClipboardBanner: React.FC<ClipboardBannerProps> = ({
  detectedLink,
  onAdd,
  onDismiss
}) => {
  if (!detectedLink) return null

  return (
    <div className="bg-emerald-950/80 border-b border-emerald-300/30 px-4 py-2 text-xs flex items-center justify-between font-mono animate-in slide-in-from-top-2 duration-200 z-50">
      <div className="flex items-center gap-2 overflow-hidden mr-4">
        <Link className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
        <span className="text-emerald-200 font-bold shrink-0">Clipboard Link Detected:</span>
        <span className="text-slate-200 truncate">{detectedLink.url}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onAdd(detectedLink.url)}
          className="bg-emerald-300 hover:bg-emerald-200 text-slate-950 px-2.5 py-1 flex items-center gap-1 font-bold cursor-pointer transition-colors"
        >
          <Download className="h-3 w-3" />
          <span>Add Task</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-white cursor-pointer transition-colors"
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
