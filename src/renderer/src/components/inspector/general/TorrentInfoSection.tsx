import React from 'react'
import { FolderOpen, Copy, Check } from 'lucide-react'
import { DownloadItem } from '../../../../../engine/types'
import { formatBytes, formatDateTime } from '../../../utils/formatters'

interface TorrentInfoSectionProps {
  download: DownloadItem
  totalSize: number
  piecesCount: number
  pieceSize: number
  piecesHave: number
  copiedHash: string | null
  copyToClipboard: (text: string, label: string) => void
}

export const TorrentInfoSection: React.FC<TorrentInfoSectionProps> = React.memo(({
  download,
  totalSize,
  piecesCount,
  pieceSize,
  piecesHave,
  copiedHash,
  copyToClipboard
}) => {
  return (
    <fieldset className="border border-zinc-700/60 bg-ide-surface/30 p-3 relative select-none">
      <legend className="px-1.5 text-[11px] font-semibold text-slate-300 bg-ide-bg border border-zinc-700/60 py-0.5">
        Information
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-1 text-[11px]">
        {/* Column 1 */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400 shrink-0">Total Size:</span>
            <span className="font-mono text-slate-200">{formatBytes(totalSize)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400 shrink-0">Added On:</span>
            <span className="font-mono text-slate-200 truncate">
              {formatDateTime(download.createdAt)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400 shrink-0">Private:</span>
            <span className="font-mono text-slate-200">
              {download.isPrivate ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 shrink-0">Info Hash v1:</span>
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span
                className="font-mono text-slate-200 truncate max-w-44 text-[10px]"
                title={download.infoHash || download.checksum || 'N/A'}
              >
                {download.infoHash || download.checksum || 'N/A'}
              </span>
              {(download.infoHash || download.checksum) && (
                <button
                  onClick={() =>
                    copyToClipboard(
                      download.infoHash || download.checksum || '',
                      'hashv1'
                    )
                  }
                  className="p-0.5 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Copy Info Hash v1"
                >
                  {copiedHash === 'hashv1' ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400 shrink-0">Info Hash v2:</span>
            <span className="font-mono text-slate-200 truncate">
              {download.infoHashV2 || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 shrink-0">Save Path:</span>
            <div className="flex items-center gap-1 overflow-hidden">
              <span className="font-mono text-slate-200 truncate max-w-44" title={download.savePath}>
                {download.savePath}
              </span>
              <button
                onClick={() => window.api?.openFileLocation(download.savePath)}
                className="p-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-zinc-700/60 cursor-pointer shrink-0 transition-colors"
                title="Open Destination Folder"
              >
                <FolderOpen className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400 shrink-0">Comment:</span>
            <span className="font-mono text-slate-200 truncate">{download.comment || ''}</span>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400 shrink-0">Pieces:</span>
            <span className="font-mono text-slate-200 truncate">
              {piecesCount} x {formatBytes(pieceSize)} (have {piecesHave})
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400 shrink-0">Completed On:</span>
            <span className="font-mono text-slate-200 truncate">
              {download.completedAt ? formatDateTime(download.completedAt) : ''}
            </span>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400 shrink-0">Created By:</span>
            <span className="font-mono text-slate-200 truncate">
              {download.createdBy || ''}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-400 shrink-0">Created On:</span>
            <span className="font-mono text-slate-200 truncate">
              {download.createdOn ? formatDateTime(download.createdOn) : ''}
            </span>
          </div>
        </div>
      </div>
    </fieldset>
  )
})
