import React from 'react'
import { ArrowUpDown } from 'lucide-react'

export type SortField =
  'name' | 'totalSize' | 'downloadedSize' | 'status' | 'speed' | 'upSpeed' | 'eta' | 'ratio'

interface TaskTableHeaderProps {
  onSort: (field: SortField) => void
}

export const TaskTableHeader: React.FC<TaskTableHeaderProps> = React.memo(({ onSort }) => {
  return (
    <thead className="sticky top-0 z-10 bg-ide-surface border-b border-ide-border text-[11px] font-semibold text-slate-300">
      <tr>
        <th className="p-2 w-8 text-center border-r border-[#292929]">#</th>
        <th
          onClick={() => onSort('name')}
          className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929]"
        >
          <div className="flex items-center justify-between gap-1">
            <span>Name</span>
            <ArrowUpDown className="h-3 w-3 text-slate-500" />
          </div>
        </th>
        <th
          onClick={() => onSort('totalSize')}
          className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-24 text-right"
        >
          <div className="flex items-center justify-end gap-1">
            <span>Size</span>
            <ArrowUpDown className="h-3 w-3 text-slate-500" />
          </div>
        </th>
        <th className="p-2.5 border-r border-[#292929] w-48">Progress</th>
        <th
          onClick={() => onSort('status')}
          className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-28"
        >
          <div className="flex items-center justify-between gap-1">
            <span>Status</span>
            <ArrowUpDown className="h-3 w-3 text-slate-500" />
          </div>
        </th>
        <th className="p-2.5 border-r border-[#292929] w-24 text-right">Seeds (Peers)</th>
        <th
          onClick={() => onSort('speed')}
          className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-24 text-right"
        >
          <div className="flex items-center justify-end gap-1">
            <span>Down Speed</span>
            <ArrowUpDown className="h-3 w-3 text-slate-500" />
          </div>
        </th>
        <th
          onClick={() => onSort('upSpeed')}
          className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-24 text-right"
        >
          <div className="flex items-center justify-end gap-1">
            <span>Up Speed</span>
            <ArrowUpDown className="h-3 w-3 text-slate-500" />
          </div>
        </th>
        <th
          onClick={() => onSort('eta')}
          className="p-2.5 cursor-pointer hover:bg-white/5 border-r border-[#292929] w-20 text-right"
        >
          <span>ETA</span>
        </th>
        <th className="p-2.5 border-r border-[#292929] w-36 font-mono">Info Hash</th>
        <th className="p-2.5 w-24 text-center">Actions</th>
      </tr>
    </thead>
  )
})

TaskTableHeader.displayName = 'TaskTableHeader'
