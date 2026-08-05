import React, { useState, useCallback, useMemo } from 'react'
import { Inbox } from 'lucide-react'
import { DownloadItem } from '../../../../engine/types'
import {
  TaskTableHeader,
  SortField,
  ColumnKey,
  ColumnWidths,
  DEFAULT_COLUMN_WIDTHS,
  MIN_COLUMN_WIDTHS
} from './TaskTableHeader'
import { TaskTableRow } from './TaskTableRow'
import { SearchFilterBar } from '../topbar/SearchFilterBar'

interface TaskTableViewProps {
  downloads: DownloadItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onOpenHashModal: (download: DownloadItem) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterBy: 'name' | 'category' | 'tag'
  setFilterBy: (f: 'name' | 'category' | 'tag') => void
}

export const TaskTableView: React.FC<TaskTableViewProps> = React.memo(
  ({
    downloads,
    selectedId,
    onSelect,
    onPause,
    onResume,
    onCancel,
    onOpenHashModal,
    searchQuery,
    setSearchQuery,
    filterBy,
    setFilterBy
  }) => {
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortAsc, setSortAsc] = useState(true)
    const [columnWidths, setColumnWidths] = useState<ColumnWidths>(DEFAULT_COLUMN_WIDTHS)

    const handleSort = useCallback((field: SortField): void => {
      setSortField((prevField) => {
        if (prevField === field) {
          setSortAsc((prevAsc) => !prevAsc)
          return field
        } else {
          setSortAsc(true)
          return field
        }
      })
    }, [])

    const handleResizeStart = useCallback(
      (e: React.MouseEvent, column: ColumnKey): void => {
        e.preventDefault()
        e.stopPropagation()

        const startX = e.clientX
        const startWidth = columnWidths[column]
        const minWidth = MIN_COLUMN_WIDTHS[column]

        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        const handleMouseMove = (moveEvent: MouseEvent): void => {
          const dx = moveEvent.clientX - startX
          const newWidth = Math.max(minWidth, startWidth + dx)
          setColumnWidths((prev) => ({
            ...prev,
            [column]: newWidth
          }))
        }

        const handleMouseUp = (): void => {
          document.body.style.cursor = ''
          document.body.style.userSelect = ''
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
      },
      [columnWidths]
    )

    const sortedDownloads = useMemo(() => {
      return [...downloads].sort((a, b) => {
        let valA = a[sortField] ?? 0
        let valB = b[sortField] ?? 0
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()

        if (valA < valB) return sortAsc ? -1 : 1
        if (valA > valB) return sortAsc ? 1 : -1
        return 0
      })
    }, [downloads, sortField, sortAsc])

    return (
      <div className="w-full h-full flex flex-col bg-ide-bg font-sans text-xs select-none overflow-hidden rounded-none">
        {/* Strip above Tasks Table */}
        <div className="h-13 px-4 bg-ide-surface border-b border-ide-border flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-xs text-slate-100 uppercase tracking-wider">
              Tasks Queue
            </span>
            <span className="bg-theme-tint text-theme-accent font-mono text-[11px] px-2 py-0.5 font-bold border border-theme-accent/20">
              {downloads.length} {downloads.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <SearchFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
          />
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full border-collapse text-left font-sans table-fixed">
            <TaskTableHeader
              onSort={handleSort}
              sortField={sortField}
              sortAsc={sortAsc}
              columnWidths={columnWidths}
              onResizeStart={handleResizeStart}
            />

            <tbody className="divide-y divide-ide-border/50 text-slate-200">
              {sortedDownloads.map((d, index) => (
                <TaskTableRow
                  key={d.id}
                  item={d}
                  index={index}
                  isSelected={selectedId === d.id}
                  columnWidths={columnWidths}
                  onSelect={onSelect}
                  onPause={onPause}
                  onResume={onResume}
                  onCancel={onCancel}
                  onOpenHashModal={onOpenHashModal}
                />
              ))}

              {downloads.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-none bg-theme-tint/40 border border-theme-accent/30 flex items-center justify-center text-theme-accent shadow-lg shadow-purple-950/20">
                        <Inbox className="h-6 w-6 opacity-90" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm text-slate-200">No tasks in queue</h4>
                        <p className="text-xs text-slate-400">
                          Your download queue is empty. Click &quot;+ Add task&quot; or paste a link
                          to start supercharged multi-threaded downloads.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

TaskTableView.displayName = 'TaskTableView'
