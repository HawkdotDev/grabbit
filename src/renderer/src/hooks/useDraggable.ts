import React, { useState, useRef, useCallback } from 'react'

export interface UseDraggableResult {
  position: { x: number; y: number }
  isDragging: boolean
  isBlinking: boolean
  handleMouseDown: (e: React.MouseEvent) => void
  handleBackdropClick: (e: React.MouseEvent) => void
  triggerBlink: () => void
  resetPosition: () => void
  modalRef: React.RefObject<HTMLDivElement | null>
}

export function useDraggable(isOpen: boolean): UseDraggableResult {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)

  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef<{
    mouseX: number
    mouseY: number
    initialX: number
    initialY: number
    minX: number
    maxX: number
    minY: number
    maxY: number
  }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
    minX: -Infinity,
    maxX: Infinity,
    minY: -Infinity,
    maxY: Infinity
  })

  const animFrameRef = useRef<number | null>(null)

  // Reset position whenever modal opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setPosition({ x: 0, y: 0 })
      setIsBlinking(false)
    }
  }

  const triggerBlink = useCallback(() => {
    setIsBlinking(true)
    if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current)
    blinkTimerRef.current = setTimeout(() => {
      setIsBlinking(false)
    }, 300)
  }, [])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        triggerBlink()
      }
    },
    [triggerBlink]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only drag with left mouse button
      if (e.button !== 0) return

      // Don't drag if clicking interactive elements inside header
      const target = e.target as HTMLElement
      if (target.closest('button, input, select, textarea, a')) return

      const modalEl = modalRef.current || (target.closest('.bg-ide-surface') as HTMLDivElement)
      if (!modalEl) return

      const rect = modalEl.getBoundingClientRect()
      const margin = 8 // Keeps 8px boundary from window edges

      const currentX = position.x
      const currentY = position.y

      // Compute baseline un-displaced coordinates
      const baseLeft = rect.left - currentX
      const baseTop = rect.top - currentY
      const baseRight = rect.right - currentX
      const baseBottom = rect.bottom - currentY

      const minX = margin - baseLeft
      const maxX = window.innerWidth - margin - baseRight
      const minY = margin - baseTop
      const maxY = window.innerHeight - margin - baseBottom

      isDraggingRef.current = true
      setIsDragging(true)

      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        initialX: currentX,
        initialY: currentY,
        minX,
        maxX,
        minY,
        maxY
      }

      document.body.style.userSelect = 'none'

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (!isDraggingRef.current) return

        const dx = moveEvent.clientX - dragStartRef.current.mouseX
        const dy = moveEvent.clientY - dragStartRef.current.mouseY

        const nextX = dragStartRef.current.initialX + dx
        const nextY = dragStartRef.current.initialY + dy

        const clampedX = Math.max(
          dragStartRef.current.minX,
          Math.min(dragStartRef.current.maxX, nextX)
        )
        const clampedY = Math.max(
          dragStartRef.current.minY,
          Math.min(dragStartRef.current.maxY, nextY)
        )

        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current)
        }

        animFrameRef.current = requestAnimationFrame(() => {
          setPosition({ x: clampedX, y: clampedY })
        })
      }

      const handleMouseUp = (): void => {
        isDraggingRef.current = false
        setIsDragging(false)
        document.body.style.userSelect = ''
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current)
        }
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [position]
  )

  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])

  return {
    position,
    isDragging,
    isBlinking,
    handleMouseDown,
    handleBackdropClick,
    triggerBlink,
    resetPosition,
    modalRef
  }
}
