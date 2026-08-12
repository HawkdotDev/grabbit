import React, { RefObject } from 'react'
import { Search, Plus, ShieldAlert, Eye, EyeOff, Columns, Check, RotateCcw } from 'lucide-react'
import { ALL_PEER_COLUMNS, PeerColumnId } from './peerTypes'

interface PeersToolbarProps {
  filterQuery: string
  setFilterQuery: (query: string) => void
  selectedPeerCount: number
  handleSelectAll: () => void
  handleSelectNone: () => void
  isAddingPeer: boolean
  setIsAddingPeer: (adding: boolean) => void
  newPeerAddress: string
  setNewPeerAddress: (address: string) => void
  handleAddPeerSubmit: (e: React.FormEvent) => void
  showColumnMenu: boolean
  setShowColumnMenu: React.Dispatch<React.SetStateAction<boolean>>
  columnMenuRef: RefObject<HTMLDivElement | null>
  visibleColumns: Record<PeerColumnId, boolean>
  toggleColumn: (id: PeerColumnId) => void
  showAllColumns: () => void
  activeColumnCount: number
}

export const PeersToolbar: React.FC<PeersToolbarProps> = React.memo(({
  filterQuery,
  setFilterQuery,
  selectedPeerCount,
  handleSelectAll,
  handleSelectNone,
  isAddingPeer,
  setIsAddingPeer,
  newPeerAddress,
  setNewPeerAddress,
  handleAddPeerSubmit,
  showColumnMenu,
  setShowColumnMenu,
  columnMenuRef,
  visibleColumns,
  toggleColumn,
  showAllColumns,
  activeColumnCount
}) => {
  return (
    <>
      <div className="p-1.5 bg-ide-surface border-b border-ide-border flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSelectAll}
            className="px-2.5 py-0.5 text-[11px] font-medium bg-ide-bg hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="px-2.5 py-0.5 text-[11px] font-medium bg-ide-bg hover:bg-white/10 text-slate-300 border border-ide-border transition cursor-pointer"
          >
            Select None
          </button>

          <button
            onClick={() => setIsAddingPeer(!isAddingPeer)}
            className="ml-2 px-2 py-0.5 text-[11px] font-medium bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            <span>Add Peer</span>
          </button>

          {selectedPeerCount > 0 && (
            <button
              onClick={handleSelectNone}
              className="px-2 py-0.5 text-[11px] font-medium bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-600/40 transition cursor-pointer flex items-center gap-1"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Ban Selected ({selectedPeerCount})</span>
            </button>
          )}

          {/* Column Menu Popover */}
          <div className="relative ml-2" ref={columnMenuRef}>
            <button
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className={`px-2 py-0.5 text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                showColumnMenu
                  ? 'bg-theme-tint text-theme-accent border-theme-accent'
                  : 'bg-ide-bg hover:bg-white/10 text-slate-300 border-ide-border'
              }`}
              title="Show or hide table columns"
            >
              <Columns className="h-3 w-3" />
              <span>Columns ({activeColumnCount}/15)</span>
            </button>

            {showColumnMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-ide-surface border border-ide-border shadow-2xl z-50 p-2 flex flex-col gap-1 rounded-none text-xs">
                <div className="flex items-center justify-between px-1.5 py-1 border-b border-ide-border/70 text-slate-300 font-semibold text-[11px]">
                  <span>Show / Hide Columns</span>
                  <button
                    onClick={showAllColumns}
                    className="text-[10px] text-theme-accent hover:underline flex items-center gap-0.5"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Show All</span>
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto flex flex-col gap-0.5 py-1">
                  {ALL_PEER_COLUMNS.map((col) => {
                    const isVisible = visibleColumns[col.id] !== false
                    return (
                      <button
                        key={col.id}
                        onClick={() => toggleColumn(col.id)}
                        className={`w-full flex items-center justify-between px-2 py-1 text-[11px] rounded-none transition text-left cursor-pointer ${
                          isVisible
                            ? 'text-slate-100 hover:bg-white/10'
                            : 'text-slate-500 hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isVisible ? (
                            <Eye className="h-3 w-3 text-theme-accent" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-slate-600" />
                          )}
                          <span>{col.label}</span>
                        </span>
                        {isVisible && <Check className="h-3 w-3 text-theme-accent" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Search Input */}
        <div className="relative flex items-center">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter peers..."
            className="w-48 bg-ide-bg text-slate-100 text-[11px] pl-7 pr-2 py-0.5 border border-ide-border focus:outline-none focus:border-theme-accent font-sans"
          />
        </div>
      </div>

      {/* Add Peer Form */}
      {isAddingPeer && (
        <form onSubmit={handleAddPeerSubmit} className="p-2 bg-ide-surface border-b border-ide-border flex items-center gap-2">
          <input
            type="text"
            value={newPeerAddress}
            onChange={(e) => setNewPeerAddress(e.target.value)}
            placeholder="192.168.1.100:6881"
            className="flex-1 bg-ide-bg text-slate-100 font-mono text-xs px-2 py-1 border border-ide-border focus:outline-none focus:border-theme-accent"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 bg-theme-tint text-theme-accent border border-theme-accent/50 font-bold hover:bg-theme-accent/20 transition cursor-pointer text-xs"
          >
            Add Peer
          </button>
        </form>
      )}
    </>
  )
})
