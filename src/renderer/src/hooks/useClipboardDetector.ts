import { useState, useEffect, useRef, useCallback } from 'react'

export interface ClipboardDetectedLink {
  url: string
  suggestedName: string
}

export interface UseClipboardDetectorReturn {
  detectedLink: ClipboardDetectedLink | null
  dismiss: () => void
  clear: () => void
}

export function useClipboardDetector(
  onDetected?: (link: ClipboardDetectedLink) => void
): UseClipboardDetectorReturn {
  const [detectedLink, setDetectedLink] = useState<ClipboardDetectedLink | null>(null)
  const dismissedSetRef = useRef<Set<string>>(new Set())
  const lastSeenTextRef = useRef<string>('')

  const checkClipboard = useCallback(async (): Promise<void> => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) return
      const text = await navigator.clipboard.readText()
      if (!text || typeof text !== 'string') return

      const trimmed = text.trim()
      if (!trimmed) return

      // If the clipboard content hasn't changed since last check, don't re-trigger
      if (trimmed === lastSeenTextRef.current) return
      lastSeenTextRef.current = trimmed

      // Match HTTP/HTTPS file URLs or Magnet URIs
      const isUrl = /^https?:\/\/[^\s]+$/i.test(trimmed)
      const isMagnet = /^magnet:\?xt=urn:[a-z0-9]+/i.test(trimmed)

      if (isUrl || isMagnet) {
        // If this exact URL has already been dismissed or added, do not show again
        if (dismissedSetRef.current.has(trimmed)) return

        let suggestedName = 'New Download'
        if (isMagnet) {
          suggestedName = 'Magnet Link'
        } else {
          try {
            const parsed = new URL(trimmed)
            const filename = parsed.pathname.split('/').pop()
            if (filename && filename.length > 0) {
              suggestedName = decodeURIComponent(filename)
            }
          } catch {
            // fallback to default
          }
        }

        const linkObj = { url: trimmed, suggestedName }
        setDetectedLink(linkObj)
        if (onDetected) onDetected(linkObj)
      }
    } catch {
      // Clipboard permission denied or read failed quietly
    }
  }, [onDetected])

  useEffect(() => {
    // Initial check on mount
    checkClipboard()

    const interval = setInterval(checkClipboard, 2500)
    window.addEventListener('focus', checkClipboard)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', checkClipboard)
    }
  }, [checkClipboard])

  const dismiss = useCallback((): void => {
    if (detectedLink) {
      dismissedSetRef.current.add(detectedLink.url)
      setDetectedLink(null)
    }
  }, [detectedLink])

  const clear = useCallback((): void => {
    if (detectedLink) {
      dismissedSetRef.current.add(detectedLink.url)
      setDetectedLink(null)
    }
  }, [detectedLink])

  return {
    detectedLink,
    dismiss,
    clear
  }
}
