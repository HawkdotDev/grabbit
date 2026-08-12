import React from 'react'
import { DownloadItem } from '../../../../../engine/types'
import { formatBytes, formatSpeed, formatDuration } from '../../../utils/formatters'

interface TransferStatsSectionProps {
  download: DownloadItem
  timeActiveSeconds: number
  seededTimeSeconds: number
  downloadedSize: number
  sessionDownloaded: number
  avgDownSpeed: number
  ratioVal: number
  popularityVal: number
  etaDisplay: string
  sessionUploaded: number
  avgUpSpeed: number
  reannounceDisplay: string
  connectionsCount: number
  maxConnections: number
  seedsCount: number
  totalSeeds: number
  peersCount: number
  totalPeers: number
  lastSeenCompleteStr: string
}

export const TransferStatsSection: React.FC<TransferStatsSectionProps> = React.memo(({
  download,
  timeActiveSeconds,
  seededTimeSeconds,
  downloadedSize,
  sessionDownloaded,
  avgDownSpeed,
  ratioVal,
  popularityVal,
  etaDisplay,
  sessionUploaded,
  avgUpSpeed,
  reannounceDisplay,
  connectionsCount,
  maxConnections,
  seedsCount,
  totalSeeds,
  peersCount,
  totalPeers,
  lastSeenCompleteStr
}) => {
  return (
    <fieldset className="border border-zinc-700/60 bg-ide-surface/30 p-3 relative select-none">
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
  )
})
