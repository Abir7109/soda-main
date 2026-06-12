export default function MemoryAnim({ status, variant = 'store', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const accent = '#b388ff'
  const key = data?.key || data?.name || ''
  const value = data?.value || data?.content || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mem-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.08" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <filter id="mem-glow-filter">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="mem-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="20" y1="0" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
          <line x1="0" y1="20" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect x="4" y="4" width="132" height="132" fill="url(#mem-grid)"
        style={isRunning ? { animation: 'hud-grid-pulse 4s ease-in-out infinite' } : {}} />

      <circle cx="70" cy="70" r="60" fill="url(#mem-glow)" />

      {/* HUD Corner brackets */}
      <g stroke={stroke} strokeWidth="1.2" strokeOpacity="0.25" fill="none"
        style={{ animation: 'hud-bracket-in 0.4s ease-out' }}>
        <path d="M 8 14 L 8 8 L 14 8" />
        <path d="M 132 8 L 126 8 L 126 14" />
        <path d="M 8 126 L 8 132 L 14 132" />
        <path d="M 132 126 L 132 132 L 126 132" />
      </g>

      {/* Data streams flowing inward (running only) */}
      {isRunning && (
        <g>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180
            const x1 = 70 + 55 * Math.cos(rad)
            const y1 = 70 + 55 * Math.sin(rad)
            const x2 = 70 + 25 * Math.cos(rad)
            const y2 = 70 + 25 * Math.sin(rad)
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={i % 2 === 0 ? stroke : accent}
                strokeWidth="1.2"
                strokeOpacity="0.4"
                strokeLinecap="round"
                filter="url(#mem-glow-filter)"
                style={{
                  animation: `hud-stream-in ${1.5 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                  willChange: 'opacity'
                }}
              />
            )
          })}
        </g>
      )}

      {/* Neural network paths */}
      <g style={isRunning ? { transformOrigin: '70px 65px', animation: 'hud-idle-breathe 2s ease-in-out infinite', willChange: 'transform' } : {}}>
        <path d="M 55 45 Q 35 55 35 70 Q 35 85 55 95" fill="none" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.5" filter="url(#mem-glow-filter)" />
        <path d="M 85 45 Q 105 55 105 70 Q 105 85 85 95" fill="none" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.5" filter="url(#mem-glow-filter)" />
        <path d="M 55 45 Q 70 35 85 45" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.4" />
        <path d="M 55 95 Q 70 105 85 95" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.4" />
      </g>

      {/* Neural nodes */}
      {[
        { x: 50, y: 55 }, { x: 45, y: 70 }, { x: 50, y: 85 },
        { x: 90, y: 55 }, { x: 95, y: 70 }, { x: 90, y: 85 },
        { x: 70, y: 50 }, { x: 70, y: 80 },
      ].map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="2.5" fill={stroke} fillOpacity="0.4"
          filter={isRunning ? 'url(#mem-glow-filter)' : undefined}
          style={isRunning ? { animation: `hud-node-pulse 1.5s ${i * 0.2}s ease-in-out infinite`, willChange: 'r, opacity' } : {}} />
      ))}

      {/* Signal connections */}
      {isRunning && (
        <g stroke={stroke} strokeWidth="0.5" strokeOpacity="0.3">
          <line x1="50" y1="55" x2="70" y2="50" style={{ animation: 'hud-signal 1s 0s ease-in-out infinite' }} />
          <line x1="90" y1="55" x2="70" y2="50" style={{ animation: 'hud-signal 1s 0.3s ease-in-out infinite' }} />
          <line x1="45" y1="70" x2="70" y2="80" style={{ animation: 'hud-signal 1s 0.6s ease-in-out infinite' }} />
          <line x1="95" y1="70" x2="70" y2="80" style={{ animation: 'hud-signal 1s 0.9s ease-in-out infinite' }} />
        </g>
      )}

      {/* Directional arrows with glow */}
      {variant === 'store' && isRunning && (
        <g style={{ animation: 'soda-arrow-in 1.2s ease-in-out infinite' }}>
          <polygon points="110,65 120,70 110,75" fill={stroke} fillOpacity="0.5" filter="url(#mem-glow-filter)" />
        </g>
      )}
      {variant === 'recall' && isRunning && (
        <g style={{ animation: 'soda-arrow-out 1.2s ease-in-out infinite' }}>
          <polygon points="20,65 10,70 20,75" fill={stroke} fillOpacity="0.5" filter="url(#mem-glow-filter)" />
        </g>
      )}

      {/* Done state */}
      {isDone && !isError && (
        <g style={{ animation: 'hud-card-in 0.3s ease-out' }}>
          <circle cx="70" cy="70" r="22" fill={stroke} fillOpacity="0.03" filter="url(#mem-glow-filter)"
            style={{ animation: 'hud-ring-burst 0.6s ease-out forwards' }} />
          <circle cx="70" cy="70" r="18" fill="none" stroke={stroke} strokeWidth="1.5" />
          <polyline points="62,70 68,76 78,64" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"
            style={{ animation: 'hud-check-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} />
        </g>
      )}
      {isDone && key && (
        <text x="70" y="118" textAnchor="middle" fill={stroke} fillOpacity="0.4" fontSize="3" fontFamily="monospace"
          style={{ animation: 'hud-card-in 0.3s ease-out 0.1s both' }}>
          {key.slice(0, 18)}
        </text>
      )}
    </svg>
  )
}
