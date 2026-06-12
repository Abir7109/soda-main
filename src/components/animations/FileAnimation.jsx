export default function FileAnimation({ status, data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const filename = data?.name || data?.file || ''
  const content = data?.content || data?.result || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="file-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.6" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.1" />
        </linearGradient>
        <filter id="file-glow-filter">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="file-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="20" y1="0" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
          <line x1="0" y1="20" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
        </pattern>
      </defs>

      <rect x="4" y="4" width="132" height="132" fill="url(#file-grid)"
        style={isRunning ? { animation: 'hud-grid-pulse 4s ease-in-out infinite' } : {}} />

      <g stroke={stroke} strokeWidth="1.2" strokeOpacity="0.25" fill="none"
        style={{ animation: 'hud-bracket-in 0.4s ease-out' }}>
        <path d="M 8 14 L 8 8 L 14 8" />
        <path d="M 132 8 L 126 8 L 126 14" />
        <path d="M 8 126 L 8 132 L 14 132" />
        <path d="M 132 126 L 132 132 L 126 132" />
      </g>

      <polygon points="50,30 90,30 100,40 100,110 50,110" fill="rgba(0,251,251,0.05)" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.7"
        filter={isRunning ? 'url(#file-glow-filter)' : undefined} />
      <polyline points="85,30 85,40 100,40" fill="none" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.7" />

      {[42, 52, 62, 72, 82, 92].map((y, i) => {
        const widthPercent = isDone ? 80 : isRunning ? 30 + (i * 10) : 60
        const revealStyle = isRunning
          ? { transformOrigin: 'left', animation: `soda-typewriter-reveal 1.2s ${i * 0.15}s steps(1) both`, willChange: 'transform' }
          : {}
        return (
          <rect key={i} x="58" y={y} height="3" rx="1"
            fill={isError ? 'var(--error)' : 'url(#file-line-grad)'}
            width={widthPercent * 0.3} style={revealStyle} />
        )
      })}

      {isRunning && (
        <rect x="90" y="92" width="2" height="6" fill={stroke} className="soda-cursor" />
      )}

      {isDone && filename && (
        <text x="55" y="108" fill={stroke} fillOpacity="0.5" fontSize="3" fontFamily="monospace">
          {filename.slice(0, 15)}
        </text>
      )}

      {isDone && !isError && (
        <g style={{ animation: 'hud-check-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          <circle cx="120" cy="115" r="10" fill="none" stroke={stroke} strokeWidth="1.5" />
          <circle cx="120" cy="115" r="14" fill={stroke} fillOpacity="0.03" filter="url(#file-glow-filter)" />
        </g>
      )}
    </svg>
  )
}
