import { useState, useEffect } from 'react'

export interface ClipboardDetectedLink {
  url: string
  suggestedName: string
}

export function useClipboardDetector(onDetected?: (link: ClipboardDetectedLink) => void) {
  const [detectedLink, setDetectedLink] = useState<ClipboardDetectedLink | null>(null)
  const [dismissedUrls, setDismissedUrls] = useState<Set<string>>(new Set())

  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) return
        const text = await navigator.clipboard.readText()
        if (!text || typeof text !== 'string') return

        const trimmed = text.trim()

        // Match HTTP/HTTPS file URLs or Magnet URIs
        const isUrl = /^https?:\/\/[^\s]+$/i.test(trimmed)
        const isMagnet = /^magnet:\?xt=urn:[a-z0-9]+/i.test(trimmed)

        if (isUrl || isMagnet) {
          if (dismissedUrls.has(trimmed)) return

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
    }

    const interval = setInterval(checkClipboard, 3000)
    window.addEventListener('focus', checkClipboard)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', checkClipboard)
    }
  }, [dismissedUrls, onDetected])

  const dismiss = () => {
    if (detectedLink) {
      setDismissedUrls((prev) => new Set(prev).add(detectedLink.url))
      setDetectedLink(null)
    }
  }

  const clear = () => {
    setDetectedLink(null)
  }

  return {
    detectedLink,
    dismiss,
    clear
  }
}
