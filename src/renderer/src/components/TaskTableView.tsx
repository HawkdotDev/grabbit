import React, { useState, useCallback, useMemo } from 'react'
import { DownloadItem } from '../../../engine/types'
import { TaskTableHeader, SortField } from './tasktable/TaskTableHeader'
import { TaskTableRow } from './tasktable/TaskTableRow'

interface TaskTableViewProps {
  downloads: DownloadItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onOpenHashModal: (download: DownloadItem) => void
}

export const TaskTableView: React.FC<TaskTableViewProps> = React.memo(
  ({ downloads, selectedId, onSelect, onPause, onResume, onCancel, onOpenHashModal }) => {
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
