import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  DownloadItem,
  DownloadCategory,
  DownloadPriority,
  SpeedSample
} from '../../../engine/types'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [speedHistory, setSpeedHistory] = useState<SpeedSample[]>([])

  useEffect(() => {
    if (window.api) {
      window.api.getAllDownloads().then((data) => {
        const list = data || []
        setDownloads(list)
        if (list.length > 0 && !selectedId) {
          const first = list[0]
          if (first) setSelectedId(first.id)
        }
      })

      window.api.getSpeedHistory().then((h) => setSpeedHistory(h || []))

      const unsubProgress = window.api.onDownloadProgress((updated) => {
        setDownloads((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      })

      const unsubAdded = window.api.onDownloadAdded((newDl) => {
        setDownloads((prev) => [newDl, ...prev.filter((d) => d.id !== newDl.id)])
        setSelectedId(newDl.id)
      })

      const unsubUpdated = window.api.onDownloadUpdated((updated) => {
        setDownloads((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      })

      const unsubCompleted = window.api.onDownloadCompleted((updated) => {
        setDownloads((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      })

      const unsubRemoved = window.api.onDownloadRemoved((id) => {
        setDownloads((prev) => prev.filter((d) => d.id !== id))
      })

      const unsubStats = window.api.onStatsTick((sample) => {
        setSpeedHistory((prev) => [...prev.slice(-59), sample])
      })

      return () => {
        unsubProgress()
        unsubAdded()
        unsubUpdated()
        unsubCompleted()
        unsubRemoved()
        unsubStats()
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const globalSpeed = useMemo(() => {
    return downloads
      .filter((d) => d.status === 'downloading')
      .reduce((acc, d) => acc + (d.speed || 0), 0)
  }, [downloads])

  const selectedDownload = useMemo((): DownloadItem | null => {
    return downloads.find((d) => d.id === selectedId) ?? downloads[0] ?? null
  }, [downloads, selectedId])

  const handleAddDownload = useCallback(
    async (args: {
      url: string
      filename?: string
      savePath?: string
      category?: DownloadCategory
      priority?: DownloadPriority
      threadCount?: number
    }): Promise<void> => {
      if (window.api) {
        await window.api.addDownload(args)
      }
    },
    []
  )

  const handlePause = useCallback((id: string): void => {
    window.api?.pauseDownload(id)
  }, [])

  const handleResume = useCallback((id: string): void => {
    window.api?.resumeDownload(id)
  }, [])

  const handleCancel = useCallback((id: string): void => {
    window.api?.cancelDownload(id)
  }, [])

  const handlePauseAll = useCallback((): void => {
    setDownloads((prev) => {
      prev.filter((d) => d.status === 'downloading').forEach((d) => window.api?.pauseDownload(d.id))
      return prev
    })
  }, [])

  const handleResumeAll = useCallback((): void => {
    setDownloads((prev) => {
      prev
        .filter((d) => d.status === 'paused' || d.status === 'error')
        .forEach((d) => window.api?.resumeDownload(d.id))
      return prev
    })
  }, [])

  const handleClearCompleted = useCallback((): void => {
    setDownloads((prev) => {
      prev.filter((d) => d.status === 'completed').forEach((d) => window.api?.cancelDownload(d.id))
      return prev
    })
  }, [])

  const handleVerifyHash = useCallback(
    async (
      id: string,
      expectedHash: string,
      algo: 'md5' | 'sha256' | 'sha512'
    ): Promise<{ matches: boolean; actualHash: string }> => {
      if (window.api && window.api.verifyHash) {
        return await window.api.verifyHash({ id, expectedHash, algo })
      }
      return { matches: false, actualHash: '' }
    },
    []
  )

  return {
    downloads,
    selectedId,
    setSelectedId,
    selectedDownload,
    speedHistory,
    globalSpeed,
    handleAddDownload,
    handlePause,
    handleResume,
    handleCancel,
    handlePauseAll,
    handleResumeAll,
    handleClearCompleted,
    handleVerifyHash
  }
}
