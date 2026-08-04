import { useState, useEffect, useCallback } from 'react'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useResizablePanes(initialSidebarWidth = 240, initialInspectorHeight = 240) {
  const [sidebarWidth, setSidebarWidth] = useState(initialSidebarWidth)
  const [inspectorHeight, setInspectorHeight] = useState(initialInspectorHeight)

  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false)
  const [isDraggingInspector, setIsDraggingInspector] = useState(false)

  const handleSidebarMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault()
    setIsDraggingSidebar(true)
  }

  const handleInspectorMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault()
    setIsDraggingInspector(true)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent): void => {
      if (isDraggingSidebar) {
        const newWidth = Math.min(500, Math.max(160, e.clientX))
        setSidebarWidth(newWidth)
      }
      if (isDraggingInspector) {
        const newHeight = Math.min(600, Math.max(100, window.innerHeight - e.clientY - 28))
        setInspectorHeight(newHeight)
      }
    },
    [isDraggingSidebar, isDraggingInspector]
  )

  const handleMouseUp = useCallback((): void => {
    setIsDraggingSidebar(false)
    setIsDraggingInspector(false)
  }, [])

  useEffect(() => {
    if (isDraggingSidebar || isDraggingInspector) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingSidebar, isDraggingInspector, handleMouseMove, handleMouseUp])

  return {
    sidebarWidth,
    inspectorHeight,
    handleSidebarMouseDown,
    handleInspectorMouseDown
  }
}
