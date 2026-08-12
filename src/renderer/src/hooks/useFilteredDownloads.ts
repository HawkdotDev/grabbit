import { useState, useMemo } from 'react'
import { DownloadItem, DownloadCategory, StatusFilter } from '../../../engine/types'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useFilteredDownloads(downloads: DownloadItem[]) {
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all')
  const [activeCategory, setActiveCategory] = useState<DownloadCategory>('all')
  const [activeTag, setActiveTag] = useState<string>('all')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'name' | 'category' | 'tag'>('name')

  const filteredDownloads = useMemo(() => {
    return downloads.filter((d) => {
      // Status Filter
      if (activeStatusFilter === 'downloading' && d.status !== 'downloading') return false
      if (activeStatusFilter === 'seeding' && d.status !== 'seeding') return false
      if (activeStatusFilter === 'completed' && d.status !== 'completed') return false
      if (activeStatusFilter === 'running' && d.status !== 'downloading' && d.status !== 'seeding')
        return false
      if (activeStatusFilter === 'stopped' && d.status !== 'paused' && d.status !== 'queued')
        return false
      if (activeStatusFilter === 'active' && d.speed === 0 && (d.upSpeed || 0) === 0) return false
      if (activeStatusFilter === 'inactive' && (d.speed > 0 || (d.upSpeed || 0) > 0)) return false
      if (activeStatusFilter === 'stalled' && d.status !== 'stalled') return false
      if (activeStatusFilter === 'checking' && d.status !== 'checking') return false
      if (activeStatusFilter === 'errored' && d.status !== 'error') return false

      // Category Filter
      if (activeCategory !== 'all' && d.category !== activeCategory) return false

      // Tag Filter
      if (activeTag === 'untagged' && d.tags && d.tags.length > 0) return false
      if (
        activeTag !== 'all' &&
        activeTag !== 'untagged' &&
        (!d.tags || !d.tags.includes(activeTag))
      )
        return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (
          filterBy === 'name' &&
          !d.name.toLowerCase().includes(q) &&
          !d.url.toLowerCase().includes(q)
        )
          return false
        if (filterBy === 'category' && !d.category.toLowerCase().includes(q)) return false
        if (filterBy === 'tag' && (!d.tags || !d.tags.some((t) => t.toLowerCase().includes(q))))
          return false
      }

      return true
    })
  }, [downloads, activeStatusFilter, activeCategory, activeTag, searchQuery, filterBy])

  return {
    activeStatusFilter,
    setActiveStatusFilter,
    activeCategory,
    setActiveCategory,
    activeTag,
    setActiveTag,
    searchQuery,
    setSearchQuery,
    filterBy,
    setFilterBy,
    filteredDownloads
  }
}
