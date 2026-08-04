import React from 'react'
import { Search, Filter } from 'lucide-react'

interface SearchFilterBarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterBy: 'name' | 'category' | 'tag'
  setFilterBy: (f: 'name' | 'category' | 'tag') => void
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterBy,
  setFilterBy
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter torrents/files..."
          className="bg-[#1e1e1e] text-slate-100 placeholder-slate-500 text-xs pl-8 pr-3 py-1 border border-[#2e2e2e] focus:outline-none focus:border-[#009669] font-sans w-52 rounded-none"
        />
      </div>

      <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#2e2e2e] px-2 py-1 text-xs text-slate-300 rounded-none">
        <Filter className="h-3.5 w-3.5 text-[#009669]" />
        <span className="text-[11px] text-slate-400">Filter by:</span>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as 'name' | 'category' | 'tag')}
          className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs"
        >
          <option value="name" className="bg-[#1e1e1e]">
            Name
          </option>
          <option value="category" className="bg-[#1e1e1e]">
            Category
          </option>
          <option value="tag" className="bg-[#1e1e1e]">
            Tag
          </option>
        </select>
      </div>
    </div>
  )
}
