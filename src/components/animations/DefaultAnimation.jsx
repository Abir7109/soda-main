export default function DefaultAnimation({ status, data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const isIdle = !isRunning && !isDone && !isError
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const toolName = data?.tool || ''
  const result = data?.result || data?.message || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="def-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.12" />
          <stop offset="60%" stopColor={stroke} stopOpacity="0.04" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="def-ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
          <stop offset="50%" stopColor={stroke} stopOpacity="0.8" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.2" />
        </linearGradient>
        <filter id="def-glow-filter">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="def-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="20" y1="0" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
          <line x1="0" y1="20" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect x="4" y="4" width="132" height="132" fill="url(#def-grid)"
        style={isRunning || isDone ? { animation: 'hud-grid-pulse 4s ease-in-out infinite' } : {}} />

      {/* Background glow */}
      <circle cx="70" cy="70" r="60" fill="url(#def-glow)" />

      {/* HUD Corner brackets */}
      <g stroke={stroke} strokeWidth="1.2" strokeOpacity="0.3" fill="none"
        style={{ animation: 'hud-bracket-in 0.4s ease-out' }}>
        <path d="M 8 14 L 8 8 L 14 8" />
        <path d="M 132 8 L 126 8 L 126 14" />
        <path d="M 8 126 L 8 132 L 14 132" />
        <path d="M 132 126 L 132 132 L 126 132" />
      </g>

      {/* Outer ring */}
      <circle cx="70" cy="70" r="42" fill="none" stroke={stroke} strokeWidth="0.5" strokeOpacity="0.12" />

      {/* Segmented ring arcs */}
      <g style={isRunning ? { transformOrigin: '70px 70px', animation: 'hud-rotate 4s linear infinite', willChange: 'transform' } : isIdle ? { transformOrigin: '70px 70px', animation: 'hud-rotate 12s linear infinite', willChange: 'transform' } : {}}>
        <circle cx="70" cy="70" r="42" fill="none" stroke="url(#def-ring-grad)" strokeWidth="1.5"
          strokeDasharray="66 198" opacity="0.6" filter="url(#def-glow-filter)" />
        <circle cx="70" cy="70" r="42" fill="none" stroke={stroke} strokeWidth="1"
          strokeDasharray="8 256" strokeDashoffset="60" opacity="0.3" />
      </g>

      {/* Counter-rotating ring */}
      <g style={isRunning ? { transformOrigin: '70px 70px', animation: 'hud-rotate-reverse 6s linear infinite', willChange: 'transform' } : {}}>
        <circle cx="70" cy="70" r="32" fill="none" stroke={stroke} strokeWidth="0.5" strokeOpacity="0.15"
          strokeDasharray="4 197" />
      </g>

      {/* Orbiting dots with glow trails */}
      <g style={isRunning ? { transformOrigin: '70px 70px', animation: 'hud-rotate 3s linear infinite', willChange: 'transform' } : {}}>
        <circle cx="70" cy="28" r="3" fill={stroke} opacity="0.8" filter="url(#def-glow-filter)" />
        <circle cx="70" cy="28" r="6" fill={stroke} opacity="0.08" />
      </g>

      <g style={isRunning ? { transformOrigin: '70px 70px', animation: 'hud-rotate 4.5s linear infinite reverse', willChange: 'transform' } : {}}>
        <circle cx="112" cy="70" r="2.5" fill={stroke} opacity="0.6" filter="url(#def-glow-filter)" />
        <circle cx="112" cy="70" r="5" fill={stroke} opacity="0.06" />
      </g>

      <g style={isRunning ? { transformOrigin: '70px 70px', animation: 'hud-rotate 3.8s linear infinite', willChange: 'transform' } : { opacity: 0.5 }}>
        <circle cx="70" cy="114" r="2" fill={stroke} opacity="0.5" filter="url(#def-glow-filter)" />
      </g>

      <g style={isRunning ? { transformOrigin: '70px 70px', animation: 'hud-rotate-reverse 5.2s linear infinite', willChange: 'transform' } : {}}>
        <circle cx="26" cy="70" r="1.5" fill={stroke} opacity="0.35" />
      </g>

      {/* Scanning line on running */}
      {isRunning && (
        <g style={{ animation: 'hud-scan-svg 3s ease-in-out infinite', willChange: 'transform' }}>
          <line x1="4" y1="0" x2="136" y2="0" stroke={stroke} strokeWidth="0.5" strokeOpacity="0.08" />
        </g>
      )}

      {/* Center pulse */}
      <circle cx="70" cy="70" r="7" fill="rgba(4, 8, 11, 0.92)" stroke={stroke} strokeWidth="1.2"
        style={isRunning ? { transformOrigin: '70px 70px', animation: 'hud-pulse 2s ease-in-out infinite', willChange: 'transform' } : {}} />

      {/* Done state */}
      {isDone && !isError && (
        <g>
          <circle cx="70" cy="70" r="20" fill={stroke} fillOpacity="0.03" filter="url(#def-glow-filter)"
            style={{ animation: 'hud-ring-burst 0.6s ease-out forwards' }} />
          <circle cx="70" cy="70" r="46" fill="none" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.4"
            strokeDasharray="4 8" />
          <polyline points="62,68 68,74 78,62" fill="none" stroke={stroke} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'hud-check-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} />
        </g>
      )}
      {isDone && toolName && (
        <text x="70" y="105" textAnchor="middle" fill={stroke} fillOpacity="0.5" fontSize="4" fontFamily="monospace"
          style={{ animation: 'hud-card-in 0.3s ease-out' }}>
          {toolName}
        </text>
      )}
      {isDone && result && (
        <text x="70" y="115" textAnchor="middle" fill={stroke} fillOpacity="0.35" fontSize="3" fontFamily="monospace"
          style={{ animation: 'hud-card-in 0.3s ease-out 0.1s both' }}>
          {typeof result === 'string' ? result.slice(0, 18) : 'done'}
        </text>
      )}

      {/* Idle breathing */}
      {isIdle && (
        <circle cx="70" cy="70" r="42" fill="none" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.08"
          style={{ animation: 'hud-idle-breathe 4s ease-in-out infinite' }} />
      )}
    </svg>
  )
}
