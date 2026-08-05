import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface SidebarSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export const SidebarSection: React.FC<SidebarSectionProps> = React.memo(
  ({ title, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
      <div className="border-t border-ide-border pt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 text-slate-400/80 font-bold text-xs uppercase tracking-wider transition cursor-pointer hover:text-slate-300/90"
        >
          <span>{title}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 opacity-50" />
          ) : (
            <ChevronRight className="h-4 w-4 opacity-50" />
          )}
        </button>

        {isOpen && <div className="space-y-0.5 mt-1">{children}</div>}
      </div>
    )
  }
)

SidebarSection.displayName = 'SidebarSection'
