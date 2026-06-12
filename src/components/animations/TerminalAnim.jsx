export default function TerminalAnim({ status, variant = 'type', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const cmd = data?.command || ''
  const output = data?.output || ''
  const outLines = output.split('\n').filter(Boolean)

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="term-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.12" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <filter id="term-glow-filter">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="term-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="20" y1="0" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
          <line x1="0" y1="20" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
        </pattern>
      </defs>

      <rect x="4" y="4" width="132" height="132" fill="url(#term-grid)"
        style={isRunning ? { animation: 'hud-grid-pulse 4s ease-in-out infinite' } : {}} />

      <circle cx="70" cy="70" r="60" fill="url(#term-glow)" />

      <g stroke={stroke} strokeWidth="1.2" strokeOpacity="0.25" fill="none"
        style={{ animation: 'hud-bracket-in 0.4s ease-out' }}>
        <path d="M 8 14 L 8 8 L 14 8" />
        <path d="M 132 8 L 126 8 L 126 14" />
        <path d="M 8 126 L 8 132 L 14 132" />
        <path d="M 132 126 L 132 132 L 126 132" />
      </g>

      <rect x="20" y="25" width="100" height="85" rx="2" fill={stroke} fillOpacity="0.04" stroke={stroke} strokeWidth="1" strokeOpacity="0.4" />

      {isRunning && (
        <g>
          <text x="26" y="44" fill={stroke} fillOpacity="0.6" fontSize="4" fontFamily="monospace" fontWeight="600">{'>'}_</text>
          <rect x="30" y="48" width="70" height="3" rx="1" fill={stroke} fillOpacity="0.06">
            <animate attributeName="width" values="70;80;70" dur="1s" repeatCount="indefinite" />
          </rect>
          <rect x="26" y="56" width="60" height="2.5" rx="1" fill={stroke} fillOpacity="0.08" />
          <rect x="26" y="62" width="45" height="2.5" rx="1" fill={stroke} fillOpacity="0.06" />
          <rect x="26" y="68" width="55" height="2.5" rx="1" fill={stroke} fillOpacity="0.08" />
          <rect x="26" y="75" width="8" height="2.5" rx="1" fill={stroke} fillOpacity="0.8"
            style={{ animation: 'hud-signal 0.8s step-end infinite' }} />
        </g>
      )}

      {isDone && (cmd || outLines.length > 0) && (
        <g>
          <text x="26" y="42" fill={stroke} fillOpacity="0.9" fontSize="4" fontFamily="monospace" fontWeight="600">
            {'>'} {cmd.slice(0, 28)}
          </text>
          {outLines.slice(0, 5).map((line, i) => (
            <text key={i} x="26" y={52 + i * 12} fill={stroke} fillOpacity={0.6 - i * 0.08} fontSize="3.5" fontFamily="monospace"
              style={{ animation: `hud-card-in 0.25s ${i * 0.06}s ease-out both` }}>
              {line.slice(0, 28)}
            </text>
          ))}
          {outLines.length > 5 && (
            <text x="26" y="112" fill={stroke} fillOpacity="0.35" fontSize="3" fontFamily="monospace">
              +{outLines.length - 5} lines
            </text>
          )}
          {data?.success === false && (
            <text x="26" y="105" fill="#ffb4ab" fillOpacity="0.8" fontSize="3.5" fontFamily="monospace">exit code 1</text>
          )}
        </g>
      )}

      {isDone && !cmd && outLines.length === 0 && !isError && (
        <g style={{ animation: 'hud-check-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          <text x="26" y="58" fill={stroke} fillOpacity="0.6" fontSize="4.5" fontFamily="monospace" fontWeight="600">Done</text>
          <circle cx="110" cy="100" r="7" fill="none" stroke={stroke} strokeWidth="1.5" />
          <polyline points="106,100 109,103 114,97" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
