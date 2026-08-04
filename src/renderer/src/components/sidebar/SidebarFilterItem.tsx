import React from 'react'

interface SidebarFilterItemProps {
  id: string
  label: string
  icon: React.JSX.Element
  count: number
  isActive: boolean
  onClick: () => void
}

export const SidebarFilterItem: React.FC<SidebarFilterItemProps> = React.memo(
  ({ label, icon, count, isActive, onClick }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-2 py-1.5 transition cursor-pointer text-xs font-medium rounded-none ${
          isActive
            ? 'bg-theme-tint text-theme-accent font-semibold'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">({count})</span>
      </button>
    )
  }
)

SidebarFilterItem.displayName = 'SidebarFilterItem'
