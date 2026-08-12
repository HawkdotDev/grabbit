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
        className={`w-full flex items-center justify-between px-2.5 py-2 transition cursor-pointer text-[13px] font-medium rounded-none ${
          isActive
            ? 'bg-theme-tint text-theme-accent font-semibold'
            : 'text-slate-300/90 hover:bg-white/5 hover:text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`flex items-center transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'
            }`}
          >
            {icon}
          </span>
          <span>{label}</span>
        </div>
        <span className="font-mono text-xs text-slate-400/80">({count})</span>
      </button>
    )
  }
)

SidebarFilterItem.displayName = 'SidebarFilterItem'
