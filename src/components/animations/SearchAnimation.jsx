export default function SearchAnimation({ status, variant = 'radar', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const results = data?.results || []

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="search-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="search-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.5" />
        </linearGradient>
        <filter id="search-glow-filter">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="search-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="20" y1="0" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
          <line x1="0" y1="20" x2="20" y2="20" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.04" />
        </pattern>
      </defs>

      <rect x="4" y="4" width="132" height="132" fill="url(#search-grid)"
        style={isRunning ? { animation: 'hud-grid-pulse 4s ease-in-out infinite' } : {}} />

      <circle cx="70" cy="70" r="60" fill="url(#search-glow)" />

      <g stroke={stroke} strokeWidth="1.2" strokeOpacity="0.25" fill="none"
        style={{ animation: 'hud-bracket-in 0.4s ease-out' }}>
        <path d="M 8 14 L 8 8 L 14 8" />
        <path d="M 132 8 L 126 8 L 126 14" />
        <path d="M 8 126 L 8 132 L 14 132" />
        <path d="M 132 126 L 132 132 L 126 132" />
      </g>

      {isRunning && (
        <g>
          <circle cx="70" cy="70" r="48" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="70" cy="70" r="38" fill="none" stroke={stroke} strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="4 4" />
          <g style={{ transformOrigin: '70px 70px', animation: 'hud-rotate 2s linear infinite', willChange: 'transform' }}>
            <path d="M 70 70 L 70 22 A 48 48 0 0 1 110 50 Z" fill="url(#search-sweep)" opacity="0.6" />
            <line x1="70" y1="70" x2="70" y2="22" stroke={stroke} strokeWidth="1.5" filter="url(#search-glow-filter)" />
          </g>
          <circle cx="70" cy="70" r="3" fill={stroke}
            style={{ transformOrigin: '70px 70px', animation: 'hud-pulse 1.2s ease-in-out infinite' }} />
          <circle cx="60" cy="62" r="2" fill={stroke} opacity="0.7" filter="url(#search-glow-filter)" />
          <circle cx="85" cy="55" r="1.5" fill={stroke} opacity="0.5" />
          <circle cx="78" cy="85" r="1.5" fill={stroke} opacity="0.5" />
        </g>
      )}

      {isDone && results.length > 0 && (
        <g>
          {results.slice(0, 5).map((r, i) => (
            <text key={i} x="25" y={35 + i * 20} fill={stroke} fillOpacity={0.7 - i * 0.1}
              fontSize="4.5" fontFamily="monospace" fontWeight="500"
              style={{ animation: `hud-card-in 0.3s ${i * 0.08}s ease-out both` }}>
              {(r.title || r.name || '').slice(0, 24)}
            </text>
          ))}
          {results.length > 5 && (
            <text x="25" y="135" fill={stroke} fillOpacity="0.4" fontSize="3.5" fontFamily="monospace">
              +{results.length - 5} more
            </text>
          )}
        </g>
      )}

      {isDone && results.length === 0 && (
        <g>
          <line x1="92" y1="92" x2="118" y2="118" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <circle cx="88" cy="88" r="14" fill="none" stroke={stroke} strokeWidth="2" />
        </g>
      )}

      {isDone && !isError && (
        <g style={{ animation: 'hud-check-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          <circle cx="118" cy="108" r="7" fill="none" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.6" />
          <polyline points="114,108 117,111 122,105" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
