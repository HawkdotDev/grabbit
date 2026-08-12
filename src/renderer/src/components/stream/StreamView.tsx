import React, { useState, useRef, useMemo, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Film,
  Music,
  ExternalLink,
  Zap,
  FileVideo,
  ListVideo
} from 'lucide-react'
import { DownloadItem } from '../../../../engine/types'

interface StreamViewProps {
  downloads: DownloadItem[]
  activeDownloadId?: string | null
  onSelectDownload?: (id: string) => void
}

const MEDIA_EXTENSIONS = [
  '.mp4',
  '.mkv',
  '.webm',
  '.mov',
  '.avi',
  '.m4v',
  '.ts',
  '.mp3',
  '.flac',
  '.wav',
  '.m4a',
  '.aac',
  '.ogg'
]

function isMediaFile(filenameOrPath: string): boolean {
  const lower = filenameOrPath.toLowerCase()
  return MEDIA_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const hrs = Math.floor(mins / 60)
  if (hrs > 0) {
    const remMins = mins % 60
    return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
}

function getItemProgress(d: DownloadItem): number {
  if (d.status === 'completed') return 1
  return d.totalSize > 0 ? d.downloadedSize / d.totalSize : 0
}

export const StreamView: React.FC<StreamViewProps> = React.memo(
  ({ downloads, activeDownloadId, onSelectDownload }) => {
    // Find all downloads containing media files or torrents
    const mediaDownloads = useMemo(() => {
      return downloads.filter((d) => {
        if (d.files && d.files.length > 0) {
          return d.files.some((f) => isMediaFile(f.name || f.path))
        }
        return isMediaFile(d.name || d.savePath || '') || d.infoHash || d.url?.startsWith('magnet:')
      })
    }, [downloads])

    // Currently selected download for streaming
    const [selectedStreamId, setSelectedStreamId] = useState<string | null>(() => {
      if (activeDownloadId && mediaDownloads.some((d) => d.id === activeDownloadId)) {
        return activeDownloadId
      }
      return mediaDownloads.length > 0 ? mediaDownloads[0]?.id || null : null
    })

    // Update if activeDownloadId changes from props
    useEffect(() => {
      if (activeDownloadId && mediaDownloads.some((d) => d.id === activeDownloadId)) {
        setSelectedStreamId(activeDownloadId)
      } else if (!selectedStreamId && mediaDownloads.length > 0) {
        setSelectedStreamId(mediaDownloads[0]?.id || null)
      }
    }, [activeDownloadId, mediaDownloads, selectedStreamId])

    const currentDownload = useMemo(() => {
      return downloads.find((d) => d.id === selectedStreamId) || mediaDownloads[0] || null
    }, [downloads, selectedStreamId, mediaDownloads])

    // Selected sub-file if multi-file torrent
    const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0)

    // Media files inside current selected download
    const currentMediaFiles = useMemo(() => {
      if (!currentDownload) return []
      if (currentDownload.files && currentDownload.files.length > 0) {
        return currentDownload.files.filter((f) => isMediaFile(f.name || f.path))
      }
      return [
        {
          name: currentDownload.name,
          path: currentDownload.savePath,
          size: currentDownload.totalSize,
          downloaded: currentDownload.downloadedSize,
          priority: 'normal' as const
        }
      ]
    }, [currentDownload])

    const activeFile = currentMediaFiles[selectedFileIdx] || currentMediaFiles[0] || null

    // Video player state & refs
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [streamSourceUrl, setStreamSourceUrl] = useState<string>('')

    // Generate local streamable file URL or fallback path
    useEffect(() => {
      if (!currentDownload) {
        setStreamSourceUrl('')
        return
      }

      // If file exists on disk, generate a local file:// URL
      let targetPath = currentDownload.savePath || ''
      if (activeFile && activeFile.path) {
        // If relative path
        if (targetPath.endsWith(activeFile.path)) {
          // already full path
        } else {
          targetPath = `${targetPath}/${activeFile.path}`.replace(/\\/g, '/')
        }
      }

      // Convert windows backslashes to forward slashes for URL format
      const normalizedPath = targetPath.replace(/\\/g, '/')
      const fileUrl = normalizedPath.startsWith('/')
        ? `file://${normalizedPath}`
        : `file:///${normalizedPath}`

      setStreamSourceUrl(fileUrl)
    }, [currentDownload, activeFile])

    const togglePlay = () => {
      if (!videoRef.current) return
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {
          // auto-play or codec fallback
        })
      }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value)
      setCurrentTime(newTime)
      if (videoRef.current) {
        videoRef.current.currentTime = newTime
      }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVol = parseFloat(e.target.value)
      setVolume(newVol)
      setIsMuted(newVol === 0)
      if (videoRef.current) {
        videoRef.current.volume = newVol
        videoRef.current.muted = newVol === 0
      }
    }

    const toggleMute = () => {
      if (!videoRef.current) return
      const nextMuted = !isMuted
      setIsMuted(nextMuted)
      videoRef.current.muted = nextMuted
    }

    const handleFullscreen = () => {
      if (!videoRef.current) return
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen().catch(() => {})
      }
    }

    const handleOpenInExternalPlayer = () => {
      if (!currentDownload?.savePath) return
      let target = currentDownload.savePath
      if (activeFile?.path) {
        target = `${target}/${activeFile.path}`.replace(/\\/g, '/')
      }
      try {
        if (window.api?.openFile) {
          window.api.openFile(target)
        }
      } catch (err) {
        console.error('Failed to open external player:', err)
      }
    }

    const isAudio = activeFile && (activeFile.name || activeFile.path).toLowerCase().match(/\.(mp3|flac|wav|m4a|aac|ogg)$/)

    return (
      <div className="flex-1 flex overflow-hidden bg-slate-950 text-slate-200">
        {/* Left Side: Media Library & Task Queue */}
        <div className="w-80 border-r border-white/5 bg-slate-900/60 backdrop-blur flex flex-col shrink-0">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListVideo className="h-4 w-4 text-theme-accent" />
              <span className="font-semibold text-xs tracking-wide uppercase text-slate-300">
                Media Stream Library
              </span>
            </div>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-theme-accent/15 text-theme-accent border border-theme-accent/25">
              {mediaDownloads.length} Playable
            </span>
          </div>

          {/* Download Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {mediaDownloads.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-500 text-xs">
                <FileVideo className="h-8 w-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="font-medium text-slate-400 mb-1">No streamable media</p>
                <p className="text-[11px] text-slate-600">
                  Download a video or audio torrent to start instant sequential streaming.
                </p>
              </div>
            ) : (
              mediaDownloads.map((d) => {
                const isSelected = d.id === selectedStreamId
                const progressVal = getItemProgress(d)
                const isComplete = progressVal >= 1
                const isDownloading = d.status === 'downloading'

                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedStreamId(d.id)
                      setSelectedFileIdx(0)
                      if (onSelectDownload) onSelectDownload(d.id)
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-theme-accent/10 border-theme-accent/40 shadow-sm'
                        : 'bg-white/2 hover:bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {d.name?.toLowerCase().match(/\.(mp3|flac|wav|m4a|aac|ogg)$/) ? (
                          <Music className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Film className="h-4 w-4 text-cyan-400 shrink-0" />
                        )}
                        <span className="font-medium text-xs truncate text-slate-200">
                          {d.name || 'Unnamed Media'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Status */}
                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isComplete
                            ? 'bg-emerald-400'
                            : isDownloading
                              ? 'bg-linear-to-r from-cyan-500 to-emerald-400'
                              : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, progressVal * 100))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{formatBytes(d.downloadedSize)} / {formatBytes(d.totalSize)}</span>
                      <div className="flex items-center gap-1.5">
                        {isDownloading && (
                          <span className="text-cyan-400 font-semibold">
                            {(d.speed / 1024).toFixed(0)} KB/s
                          </span>
                        )}
                        <span className="font-semibold text-slate-300">
                          {(progressVal * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Player Stage & Stream Controls */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {currentDownload ? (
            <>
              {/* Stream Header */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-theme-accent/15 border border-theme-accent/30 text-theme-accent">
                    {isAudio ? <Music className="h-5 w-5" /> : <Film className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-100 truncate">
                      {activeFile?.name || currentDownload.name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                      <span>{formatBytes(activeFile?.size || currentDownload.totalSize)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <Zap className="h-3 w-3" />
                        Sequential Mode Active
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">
                        {getItemProgress(currentDownload) >= 1 ? 'Ready (Completed)' : 'Streaming in Real-Time'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenInExternalPlayer}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                    title="Open stream in VLC or default media player"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>External Player</span>
                  </button>
                </div>
              </div>

              {/* Player Stage */}
              <div className="flex-1 flex flex-col justify-center items-center relative bg-black/80 p-6 overflow-hidden">
                <div className="w-full max-w-4xl max-h-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative flex items-center justify-center group">
                  {isAudio ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 animate-pulse">
                        <Music className="h-10 w-10" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-200 mb-1">{activeFile?.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{formatTime(currentTime)} / {formatTime(duration)}</p>
                    </div>
                  ) : null}

                  <video
                    ref={videoRef}
                    src={streamSourceUrl}
                    className={`w-full h-full object-contain ${isAudio ? 'hidden' : 'block'}`}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime)
                        setDuration(videoRef.current.duration || 0)
                      }
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />

                  {/* Glassmorphic Overlay Controls */}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-2">
                    {/* Time Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-300">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-theme-accent"
                      />
                      <span className="text-[11px] font-mono text-slate-400">{formatTime(duration)}</span>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="p-2 rounded-full bg-theme-accent text-slate-950 hover:opacity-90 transition cursor-pointer font-bold"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={toggleMute}
                            className="text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="h-4 w-4 text-red-400" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-theme-accent"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Playback Rate */}
                        <select
                          value={playbackRate}
                          onChange={(e) => {
                            const rate = parseFloat(e.target.value)
                            setPlaybackRate(rate)
                            if (videoRef.current) videoRef.current.playbackRate = rate
                          }}
                          className="bg-black/60 border border-white/15 text-slate-300 text-xs px-2 py-1 rounded cursor-pointer font-mono"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={1}>1.0x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2.0x</option>
                        </select>

                        <button
                          type="button"
                          onClick={handleFullscreen}
                          className="text-slate-300 hover:text-white transition cursor-pointer p-1"
                          title="Toggle Fullscreen"
                        >
                          <Maximize className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Files Selector Bar (if multi-file) */}
              {currentMediaFiles.length > 1 && (
                <div className="p-3 border-t border-white/5 bg-slate-900/60 flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">
                    Playlist Files:
                  </span>
                  {currentMediaFiles.map((file, idx) => (
                    <button
                      key={file.path || idx}
                      type="button"
                      onClick={() => setSelectedFileIdx(idx)}
                      className={`px-3 py-1 text-xs font-mono rounded border transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        selectedFileIdx === idx
                          ? 'bg-theme-accent text-slate-950 font-bold border-theme-accent'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      <Film className="h-3 w-3" />
                      <span className="truncate max-w-xs">{file.name || file.path}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                <Play className="h-8 w-8 ml-1" />
              </div>
              <h2 className="text-base font-semibold text-slate-300 mb-1">No Media Stream Selected</h2>
              <p className="text-xs text-slate-500 max-w-sm">
                Select an active download or completed video file from the library to begin streaming.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }
)

StreamView.displayName = 'StreamView'
