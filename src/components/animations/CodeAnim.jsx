export default function CodeAnim({ status, variant = 'exec', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const code = data?.code || data?.content || ''
  const language = data?.language || ''
  const codeLines = code.split('\n').filter(Boolean)

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="code-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <filter id="code-glow-filter">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="code-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="20" y1="0" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
          <line x1="0" y1="20" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
        </pattern>
      </defs>

      <rect x="4" y="4" width="132" height="132" fill="url(#code-grid)"
        style={isRunning ? { animation: 'hud-grid-pulse 4s ease-in-out infinite' } : {}} />

      <circle cx="70" cy="70" r="60" fill="url(#code-glow)" />

      <g stroke={stroke} strokeWidth="1.2" strokeOpacity="0.25" fill="none"
        style={{ animation: 'hud-bracket-in 0.4s ease-out' }}>
        <path d="M 8 14 L 8 8 L 14 8" />
        <path d="M 132 8 L 126 8 L 126 14" />
        <path d="M 8 126 L 8 132 L 14 132" />
        <path d="M 132 126 L 132 132 L 126 132" />
      </g>

      <text x="30" y="78" fill={stroke} fillOpacity="0.5" fontSize="28" fontFamily="monospace" fontWeight="700"
        style={isRunning ? { animation: 'hud-signal 1s ease-in-out infinite' } : {}}>
        {'{'}
      </text>
      <text x="100" y="78" fill={stroke} fillOpacity="0.5" fontSize="28" fontFamily="monospace" fontWeight="700"
        style={isRunning ? { animation: 'hud-signal 1s 0.5s ease-in-out infinite' } : {}}>
        {'}'}
      </text>

      {isDone && codeLines.length > 0 && codeLines.slice(0, 5).map((line, i) => (
        <text key={i} x="42" y={48 + i * 12} fill={stroke} fillOpacity={0.6 - i * 0.08} fontSize="3.5" fontFamily="monospace"
          style={{ animation: `hud-card-in 0.2s ${i * 0.05}s ease-out both` }}>
          {line.slice(0, 16)}
        </text>
      ))}
      {isDone && codeLines.length > 5 && (
        <text x="42" y="112" fill={stroke} fillOpacity="0.3" fontSize="3" fontFamily="monospace">
          +{codeLines.length - 5} lines
        </text>
      )}

      {isRunning && [45, 55, 65, 75, 85].map((y, i) => (
        <g key={i} style={{ animation: `hud-card-in 0.3s ${i * 0.1}s ease-out both` }}>
          <rect x="42" y={y} width={10 + i * 10} height="3" rx="1" fill={stroke} fillOpacity="0.2" />
        </g>
      ))}

      {isRunning && (
        <g style={{ transformOrigin: '70px 70px', animation: 'soda-code-arrow 1.5s ease-in-out infinite' }}>
          <polygon points="64,100 76,100 70,110" fill={stroke} fillOpacity="0.6" />
          <line x1="70" y1="90" x2="70" y2="100" stroke={stroke} strokeWidth="2" strokeOpacity="0.6" />
        </g>
      )}

      {variant === 'exec' && isRunning && (
        <g style={{ transformOrigin: '70px 115px', animation: 'hud-glow-pulse 1.5s ease-in-out infinite' }}>
          <polygon points="66,110 78,115 66,120" fill={stroke} fillOpacity="0.5" filter="url(#code-glow-filter)" />
        </g>
      )}

      {isDone && language && (
        <text x="70" y="120" textAnchor="middle" fill={stroke} fillOpacity="0.35" fontSize="3" fontFamily="monospace">
          {language}
        </text>
      )}

      {isDone && !isError && (
        <g style={{ animation: 'hud-check-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          <circle cx="70" cy="70" r="16" fill={stroke} fillOpacity="0.03" filter="url(#code-glow-filter)" />
          <circle cx="70" cy="70" r="22" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.3" />
          <polyline points="61,70 67,76 79,64" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
