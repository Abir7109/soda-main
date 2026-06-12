import { useState, useRef, useCallback, useEffect } from 'react'

export default function FloatingWindow({
  id,
  title = 'WINDOW',
  initialX = 200,
  initialY = 100,
  width = 480,
  height = 360,
  children,
  onClose,
  zIndex = 100,
  onFocus,
  onPositionChange,
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const dragRef = useRef(null)
  const dragOrigin = useRef(null)
  const winRef = useRef(null)

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
  }, [pos])

  const handleMouseMove = useCallback((e) => {
    if (!dragOrigin.current) return
    const dx = e.clientX - dragOrigin.current.mx
    const dy = e.clientY - dragOrigin.current.my
    setPos({
      x: dragOrigin.current.ox + dx,
      y: dragOrigin.current.oy + dy,
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    dragOrigin.current = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    if (onPositionChange) onPositionChange(id, pos.x, pos.y)
  }, [handleMouseMove, id, pos, onPositionChange])

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleHeaderClick = useCallback(() => {
    if (onFocus) onFocus(id)
  }, [id, onFocus])

  return (
    <div
      ref={winRef}
      className="floating-window"
      style={{
        left: pos.x,
        top: pos.y,
        width,
        height,
        zIndex,
      }}
      onMouseDown={handleHeaderClick}
    >
      <div className="floating-window-glow" />
      <div className="floating-window-border" />
      <div
        className="floating-window-header"
        onMouseDown={handleMouseDown}
      >
        <div className="floating-window-dots">
          <span className="floating-window-dot" style={{ background: '#ff5f57' }} />
          <span className="floating-window-dot" style={{ background: '#febc2e' }} />
          <span className="floating-window-dot" style={{ background: '#28c840' }} />
        </div>
        <span className="floating-window-title">{title}</span>
        <button className="floating-window-close" onClick={() => onClose && onClose(id)}>✕</button>
      </div>
      <div className="floating-window-body">
        {children}
      </div>
    </div>
  )
}
