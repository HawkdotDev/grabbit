import React from 'react'
import { ArrowUp, ArrowDown, HardDrive, Zap } from 'lucide-react'
import { formatBytes, formatSpeed } from '../../utils/formatters'

interface HomeMetricCardsProps {
  totalDownloadedBytes: number
  totalUploadedBytes: number
  totalSize: number
  globalSpeed?: number
  activeTasksCount?: number
}

export const HomeMetricCards: React.FC<HomeMetricCardsProps> = React.memo(
  ({
    totalDownloadedBytes,
    totalUploadedBytes,
    totalSize,
    globalSpeed = 0,
    activeTasksCount = 0
  }) => {
    const usedPercentage =
      totalSize > 0 ? Math.min(100, Math.round((totalDownloadedBytes / totalSize) * 100)) : 0

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bytes Uploaded */}
        <div className="bg-pastel-sky text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
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
        <div className="bg-pastel-lavender text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
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
        <div className="bg-pastel-rose text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
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

        {/* Card 4: Active Speed & Throughput Card */}
        <div className="bg-pastel-peach text-[#0f172a] p-5 rounded-none flex flex-col justify-between h-38 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="bg-black/10 p-2 rounded-none flex items-center justify-center">
              <Zap className="h-4 w-4 text-[#0f172a]" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider opacity-60 uppercase">
              ACCELERATION
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
              {formatSpeed(globalSpeed)}
            </div>
            <div className="text-xs font-medium text-[#0f172a]/70 mt-0.5">
              {activeTasksCount} active download tasks
            </div>
          </div>
        </div>
      </div>
    )
  }
)

HomeMetricCards.displayName = 'HomeMetricCards'
