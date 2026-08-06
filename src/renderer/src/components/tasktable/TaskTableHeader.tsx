import React from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { SortField, ColumnKey, ColumnWidths, MIN_COLUMN_WIDTHS } from './types'

export type { SortField, ColumnKey, ColumnWidths }

interface TaskTableHeaderProps {
  onSort: (field: SortField) => void
  sortField: SortField
  sortAsc: boolean
  columnWidths: ColumnWidths
  onResizeStart: (e: React.MouseEvent, column: ColumnKey) => void
}

export const TaskTableHeader: React.FC<TaskTableHeaderProps> = React.memo(
  ({ onSort, sortField, sortAsc, columnWidths, onResizeStart }) => {
    const renderSortIcon = (field: SortField): React.JSX.Element => {
      if (sortField !== field) {
        return <ArrowUpDown className="h-3 w-3 text-slate-500 opacity-60 shrink-0" />
      }
      return sortAsc ? (
        <ArrowUp className="h-3 w-3 text-theme-accent font-bold shrink-0" />
      ) : (
        <ArrowDown className="h-3 w-3 text-theme-accent font-bold shrink-0" />
      )
    }

    const renderHeader = (
      colKey: ColumnKey,
      label: string,
      sortKey?: SortField,
      alignRight = false,
      isLast = false
    ): React.JSX.Element => {
      const isSorted = sortKey && sortField === sortKey

      return (
        <th
          key={colKey}
          style={{ width: columnWidths[colKey], minWidth: MIN_COLUMN_WIDTHS[colKey] }}
          onClick={() => sortKey && onSort(sortKey)}
          className={`relative py-2.5 px-2.5 select-none group border-r border-ide-border/50 transition-colors ${
            sortKey ? 'cursor-pointer hover:bg-white/5' : ''
          } ${isSorted ? 'bg-theme-tint/30 text-theme-accent' : ''} ${
            alignRight ? 'text-right' : 'text-left'
          }`}
        >
          <div
            className={`flex items-center gap-1 overflow-hidden ${
              alignRight ? 'justify-end' : 'justify-between'
            }`}
          >
            <span className="truncate">{label}</span>
            {sortKey && renderSortIcon(sortKey)}
          </div>

          {!isLast && (
            <div
              onMouseDown={(e) => onResizeStart(e, colKey)}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-theme-accent/70 group-hover:bg-slate-600/40 transition-colors z-20"
              title="Drag to resize column"
            />
          )}
        </th>
      )
    }

    return (
      <thead className="sticky top-0 z-10 bg-ide-surface/95 backdrop-blur border-b border-ide-border text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
        <tr>
          <th
            style={{ width: columnWidths.num, minWidth: MIN_COLUMN_WIDTHS.num }}
            className="relative py-2.5 px-2 text-center border-r border-ide-border/50 text-slate-400 font-mono select-none group"
          >
            <span>#</span>
            <div
              onMouseDown={(e) => onResizeStart(e, 'num')}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-theme-accent/70 group-hover:bg-slate-600/40 transition-colors z-20"
              title="Drag to resize column"
            />
          </th>

          {renderHeader('name', 'Name', 'name')}
          {renderHeader('totalSize', 'Size', 'totalSize', true)}
          {renderHeader('progress', 'Progress')}
          {renderHeader('status', 'Status', 'status')}
          {renderHeader('seeds', 'Seeds / Peers', undefined, true)}
          {renderHeader('speed', 'Down Speed', 'speed', true)}
          {renderHeader('upSpeed', 'Up Speed', 'upSpeed', true)}
          {renderHeader('eta', 'ETA', 'eta', true)}
          {renderHeader('infoHash', 'Info Hash')}
          {renderHeader('actions', 'Actions', undefined, false, true)}
        </tr>
      </thead>
    )
  }
)

TaskTableHeader.displayName = 'TaskTableHeader'
