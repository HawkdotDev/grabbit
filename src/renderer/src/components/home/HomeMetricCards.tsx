import React, { useState } from 'react'
import { ArrowUp, ArrowDown, HardDrive, Upload } from 'lucide-react'
import { formatBytes } from '../../utils/formatters'

interface HomeMetricCardsProps {
  totalDownloadedBytes: number
  totalUploadedBytes: number
  totalSize: number
  onOpenAddModal: (mode?: 'link' | 'file') => void
}

export const HomeMetricCards: React.FC<HomeMetricCardsProps> = React.memo(
  ({ totalDownloadedBytes, totalUploadedBytes, totalSize, onOpenAddModal }) => {
    const [isDragging, setIsDragging] = useState(false)

    const usedPercentage =
      totalSize > 0 ? Math.min(100, Math.round((totalDownloadedBytes / totalSize) * 100)) : 0

    const handleDragOver = (e: React.DragEvent): void => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (): void => {
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent): void => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onOpenAddModal('file')
      } else {
        onOpenAddModal('link')
      }
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bytes Uploaded */}
        <div className="bg-[#bfe3f7] text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="bg-black/10 p-2 rounded-none flex items-center justify-center">
              <ArrowUp className="h-4 w-4 text-[#0f172a]" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider opacity-60 uppercase">
              UPLOADED
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
              {formatBytes(totalUploadedBytes)}
            </div>
            <div className="text-xs font-medium text-[#0f172a]/70 mt-0.5">Bytes uploaded</div>
          </div>
        </div>

        {/* Card 2: Bytes Downloaded */}
        <div className="bg-[#c4d5fd] text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="bg-black/10 p-2 rounded-none flex items-center justify-center">
              <ArrowDown className="h-4 w-4 text-[#0f172a]" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider opacity-60 uppercase">
              DOWNLOADED
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
              {formatBytes(totalDownloadedBytes)}
            </div>
            <div className="text-xs font-medium text-[#0f172a]/70 mt-0.5">Bytes downloaded</div>
          </div>
        </div>

        {/* Card 3: Storage Used */}
        <div className="bg-[#c5c5fc] text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="bg-black/10 p-2 rounded-none flex items-center justify-center">
              <HardDrive className="h-4 w-4 text-[#0f172a]" />
            </div>
            <div className="bg-black/15 font-mono text-[11px] font-bold px-2 py-0.5 rounded-none">
              {usedPercentage}%
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
              {formatBytes(totalDownloadedBytes)}
            </div>
            <div className="text-xs font-medium text-[#0f172a]/70 mt-0.5">
              Used of {formatBytes(totalSize || 1024 * 1024 * 1024)}
            </div>
          </div>
        </div>

        {/* Card 4: Drag & Drop Torrent / File Card */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => onOpenAddModal('link')}
          className={`p-5 rounded-none flex flex-col items-center justify-center text-center h-38 transition cursor-pointer border border-dashed ${
            isDragging
              ? 'bg-theme-tint border-theme-accent scale-102'
              : 'bg-[#1b1c23] border-[#303342] hover:border-slate-500 hover:bg-[#20222b]'
          }`}
        >
          <div className="bg-[#272935] p-2 rounded-none mb-1.5 text-slate-300">
            <Upload className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase mb-1">
            FILE / TORRENT LINK
          </span>
          <p className="text-xs font-medium text-slate-200 mb-2">
            Drag &amp; Drop torrent files here or
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenAddModal('file')
            }}
            className="bg-[#292b38] hover:bg-[#343747] text-slate-200 text-xs font-semibold px-4 py-1 rounded-none border border-[#3b3e52] transition cursor-pointer"
          >
            Browse
          </button>
        </div>
      </div>
    )
  }
)

HomeMetricCards.displayName = 'HomeMetricCards'
