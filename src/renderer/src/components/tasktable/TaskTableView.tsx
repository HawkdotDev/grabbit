import React, { useState, useCallback, useMemo } from 'react'
import { DownloadItem } from '../../../../engine/types'
import { TaskTableHeader, SortField } from './TaskTableHeader'
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
          <table className="w-full border-collapse text-left font-sans">
            <TaskTableHeader onSort={handleSort} />

            <tbody className="divide-y divide-[#242424] text-slate-200">
              {sortedDownloads.map((d, index) => (
                <TaskTableRow
                  key={d.id}
                  item={d}
                  index={index}
                  isSelected={selectedId === d.id}
                  onSelect={onSelect}
                  onPause={onPause}
                  onResume={onResume}
                  onCancel={onCancel}
                  onOpenHashModal={onOpenHashModal}
                />
              ))}

              {downloads.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 italic">
                    No items in current queue. Click &quot;+ Add task&quot; to start accelerating
                    downloads.
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
