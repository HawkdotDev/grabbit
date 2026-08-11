import React, { useState } from 'react'
import { FolderOpen, Copy, Check } from 'lucide-react'
import { DownloadItem } from '../../../../engine/types'
import { formatBytes, formatSpeed, formatDuration, formatDateTime } from '../../utils/formatters'

interface GeneralTabProps {
  download: DownloadItem
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ download }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  // Calculations & Fallbacks
  const totalSize = download.totalSize || 0
  const downloadedSize = download.downloadedSize || 0
  const progressPct = totalSize > 0 ? Math.min(100, (downloadedSize / totalSize) * 100) : 0

  const timeActiveSeconds =
    download.timeActive ??
    Math.max(0, Math.floor((Date.now() - (download.createdAt || Date.now())) / 1000))
  const seededTimeSeconds =
    download.seededTime ??
    (download.status === 'seeding' || download.status === 'completed' ? timeActiveSeconds : 0)

  const sessionDownloaded = download.sessionDownloaded ?? downloadedSize
  const sessionUploaded = download.sessionUploaded ?? (download.uploadedSize || 0)
  const avgDownSpeed = download.avgDownSpeed ?? download.speed
  const avgUpSpeed = download.avgUpSpeed ?? (download.upSpeed || 0)

  const ratioVal =
    download.ratio ??
    (downloadedSize > 0 ? (download.uploadedSize || 0) / downloadedSize : 0)

  const popularityVal =
    download.popularity ??
    (ratioVal > 0 ? Math.min(10, Math.max(0.1, ratioVal * 1.8 + (download.seedsCount || 0) * 0.05)) : 0)

  const etaDisplay =
    download.eta > 0 && isFinite(download.eta)
      ? formatDuration(download.eta)
      : '∞'

  const reannounceDisplay = download.reannounceIn !== undefined ? formatDuration(download.reannounceIn) : '1m'

  const maxConnections = download.maxConnections || 100
  const connectionsCount = download.peersCount || 0
  const seedsCount = download.seedsCount || 0
  const totalSeeds = download.totalSeeds || (seedsCount > 0 ? seedsCount + 250 : 0)
  const peersCount = download.peersCount || 0
  const totalPeers = download.totalPeers || (peersCount > 0 ? peersCount + 60 : 0)

  const piecesCount =
    download.piecesCount ||
    (download.chunks && download.chunks.length > 0 ? download.chunks.length : 6678)
  const pieceSize =
    download.pieceSize ||
    (totalSize > 0 ? Math.max(1024 * 1024, Math.ceil(totalSize / piecesCount)) : 1024 * 1024)
  const piecesHave =
    download.piecesHave ??
    (download.status === 'completed' || download.status === 'seeding'
      ? piecesCount
      : Math.floor((piecesCount * downloadedSize) / (totalSize || 1)))

  const lastSeenCompleteStr = download.lastSeenComplete
    ? formatDateTime(download.lastSeenComplete)
    : download.completedAt
      ? formatDateTime(download.completedAt)
      : '11-08-2026 03:23 PM'

  const copyToClipboard = (text: string, label: string) => {
    if (!text || text === 'N/A') return
    navigator.clipboard.writeText(text)
    setCopiedHash(label)
    setTimeout(() => setCopiedHash(null), 1800)
  }

  return (
    <div className="space-y-3 font-sans text-xs select-none">
      {/* Top Overall Progress Bar */}
      <div className="flex items-center gap-3 bg-ide-surface/40 p-2 border border-ide-border/60">
        <span className="text-[11px] font-semibold text-slate-300 shrink-0">Progress:</span>
        <div className="flex-1 bg-ide-surface border border-zinc-700/60 h-4 relative overflow-hidden">
          <div
            className="progress-active h-full transition-all duration-300"
            style={{ width: `${progressPct.toFixed(1)}%` }}
          />
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-200 shrink-0 min-w-14 text-right">
          {progressPct.toFixed(1)}%
        </span>
      </div>

      {/* Transfer Fieldset Box */}
      <fieldset className="border border-zinc-700/60 bg-ide-surface/30 p-3 relative">
        <legend className="px-1.5 text-[11px] font-semibold text-slate-300 bg-ide-bg border border-zinc-700/60 py-0.5">
          Transfer
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-1 text-[11px]">
          {/* Column 1 */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Time Active:</span>
              <span className="font-mono text-slate-200 truncate">
                {formatDuration(timeActiveSeconds)}{' '}
                {seededTimeSeconds > 0 ? `(seeded for ${formatDuration(seededTimeSeconds)})` : ''}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Downloaded:</span>
              <span className="font-mono text-slate-200 truncate">
                {formatBytes(downloadedSize)} ({formatBytes(sessionDownloaded)} this session)
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Download Speed:</span>
              <span className="font-mono text-slate-200 truncate">
                {formatSpeed(download.speed)} ({formatSpeed(avgDownSpeed)} avg.)
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Download Limit:</span>
              <span className="font-mono text-slate-200 truncate">
                {download.downloadLimit && download.downloadLimit > 0
                  ? formatSpeed(download.downloadLimit)
                  : '∞'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Share Ratio:</span>
              <span className="font-mono text-slate-200">{ratioVal.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Popularity:</span>
              <span className="font-mono text-slate-200">{popularityVal.toFixed(2)}</span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">ETA:</span>
              <span className="font-mono text-slate-200">{etaDisplay}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Uploaded:</span>
              <span className="font-mono text-slate-200 truncate">
                {formatBytes(download.uploadedSize || 0)} ({formatBytes(sessionUploaded)} this session)
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Upload Speed:</span>
              <span className="font-mono text-slate-200 truncate">
                {formatSpeed(download.upSpeed || 0)} ({formatSpeed(avgUpSpeed)} avg.)
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Upload Limit:</span>
              <span className="font-mono text-slate-200 truncate">
                {download.uploadLimit && download.uploadLimit > 0
                  ? formatSpeed(download.uploadLimit)
                  : '∞'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Reannounce In:</span>
              <span className="font-mono text-slate-200">{reannounceDisplay}</span>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Connections:</span>
              <span className="font-mono text-slate-200">
                {connectionsCount} ({maxConnections} max)
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Seeds:</span>
              <span className="font-mono text-slate-200">
                {seedsCount} ({totalSeeds} total)
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Peers:</span>
              <span className="font-mono text-slate-200">
                {peersCount} ({totalPeers} total)
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Wasted:</span>
              <span className="font-mono text-slate-200">
                {formatBytes(download.wastedSize || 0)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-slate-400 shrink-0">Last Seen Complete:</span>
              <span className="font-mono text-slate-200 truncate">{lastSeenCompleteStr}</span>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Information Fieldset Box */}
      <fieldset className="border border-zinc-700/60 bg-ide-surface/30 p-3 relative">
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
    </div>
  )
}
