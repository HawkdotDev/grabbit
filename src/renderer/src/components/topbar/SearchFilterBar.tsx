import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  Filter,
  Columns3,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Eye,
  CheckSquare
} from 'lucide-react'
import {
  ColumnKey,
  VisibleColumns,
  DEFAULT_VISIBLE_COLUMNS,
  COLUMN_LABELS
} from '../tasktable/types'

interface SearchFilterBarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterBy: 'name' | 'category' | 'tag'
  setFilterBy: (f: 'name' | 'category' | 'tag') => void
  visibleColumns?: VisibleColumns
  onToggleColumn?: (key: ColumnKey) => void
  onSelectAllColumns?: () => void
  onResetDefaultColumns?: () => void
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterBy,
  setFilterBy,
  visibleColumns = DEFAULT_VISIBLE_COLUMNS,
  onToggleColumn,
  onSelectAllColumns,
  onResetDefaultColumns
}) => {
  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsColumnsDropdownOpen(false)
      }
    }
    if (isColumnsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isColumnsDropdownOpen])

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length
  const totalCount = Object.keys(visibleColumns).length

  return (
    <div className="flex items-center gap-2 relative select-none">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter torrents/files..."
          className="bg-ide-surface text-slate-100 placeholder-slate-500 text-xs pl-8 pr-3 py-1 border border-ide-border focus:outline-none focus:border-theme-accent font-sans w-52 rounded-none transition"
        />
      </div>

      {/* Filter Target Selector */}
      <div className="flex items-center gap-1.5 bg-ide-surface border border-ide-border px-2.5 py-1 text-xs text-slate-300 rounded-none">
        <Filter className="h-3.5 w-3.5 text-theme-accent shrink-0" />
        <span className="text-[11px] text-slate-400">By:</span>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as 'name' | 'category' | 'tag')}
          className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs"
        >
          <option value="name" className="bg-ide-surface">
            Name
          </option>
          <option value="category" className="bg-ide-surface">
            Category
          </option>
          <option value="tag" className="bg-ide-surface">
            Tag
          </option>
        </select>
      </div>

      {/* Columns to Show in Table Filter Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsColumnsDropdownOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-none cursor-pointer transition ${
            isColumnsDropdownOpen
              ? 'bg-theme-tint text-theme-accent border-theme-accent/60 font-semibold'
              : 'bg-ide-surface border-ide-border text-slate-300 hover:text-white hover:border-slate-500'
          }`}
          title="Select what columns to show in the table"
        >
          <Columns3 className="h-3.5 w-3.5 text-theme-bright shrink-0" />
          <span>Columns</span>
          <span className="text-[10px] bg-ide-bg px-1.5 py-0.2 rounded-none text-slate-400 font-mono border border-ide-border">
            {visibleCount}/{totalCount}
          </span>
        </button>

        {/* Columns Customizer Dropdown Popover */}
        {isColumnsDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-ide-surface border border-ide-border shadow-2xl p-2 z-50 rounded-none text-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-2">
            <div className="flex items-center justify-between px-1.5 py-1 border-b border-ide-border">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-theme-accent" />
                <span className="font-bold text-xs text-slate-100">Table Columns</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{visibleCount} visible</span>
            </div>

            {/* Quick Actions: Select All / Reset */}
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => onSelectAllColumns?.()}
                className="hover:text-theme-accent flex items-center gap-1 cursor-pointer transition"
              >
                <CheckSquare className="h-3 w-3" />
                <span>Show All</span>
              </button>
              <button
                type="button"
                onClick={() => onResetDefaultColumns?.()}
                className="hover:text-theme-accent flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Column Checkboxes List */}
            <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
              {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((key) => {
                const isChecked = visibleColumns[key] !== false
                return (
                  <label
                    key={key}
                    onClick={(e) => {
                      e.preventDefault()
                      onToggleColumn?.(key)
                    }}
                    className={`flex items-center justify-between px-2 py-1 text-xs cursor-pointer select-none transition ${
                      isChecked
                        ? 'bg-ide-bg text-slate-100 hover:bg-white/5'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3.5 w-3.5 flex items-center justify-center border transition ${
                          isChecked
                            ? 'bg-theme-accent border-theme-accent text-slate-950 font-bold'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-3" />}
                      </div>
                      <span className="text-xs">{COLUMN_LABELS[key]}</span>
                    </div>

                    <Eye
                      className={`h-3 w-3 ${isChecked ? 'text-theme-bright' : 'text-slate-600'}`}
                    />
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
