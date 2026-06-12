export default function CloseAnim({ status, variant = 'window', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const name = data?.name || data?.app || data?.window || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="close-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="70" cy="70" r="60" fill="url(#close-glow)" />

      <g style={isRunning ? { transformOrigin: '70px 65px', animation: 'soda-close-shrink 0.8s ease-in forwards' } : { transformOrigin: '70px 65px' }}>
        {variant === 'window' ? (
          <rect x="25" y="30" width="90" height="70" rx="4" fill="rgba(0,251,251,0.04)" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.5" />
        ) : (
          <rect x="30" y="35" width="80" height="60" rx="3" fill="rgba(0,251,251,0.04)" stroke={stroke} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 2" />
        )}
        <rect x={variant === 'window' ? 25 : 30} y={variant === 'window' ? 30 : 35}
          width={variant === 'window' ? 90 : 80} height="10" rx={variant === 'window' ? 4 : 3}
          fill={stroke} fillOpacity="0.06" />
        {[48, 56, 64, 72, 80].map((y, i) => (
          <rect key={i} x="35" y={y} width={60 - i * 5} height="3" rx="1" fill={stroke} fillOpacity={0.2 - i * 0.03} />
        ))}
      </g>

      <g style={isRunning ? { transformOrigin: '70px 65px', animation: 'soda-x-appear 0.5s 0.3s ease-out both' } : { opacity: isDone ? 1 : 0 }}>
        <circle cx="70" cy="65" r="15" fill="rgba(0,251,251,0.05)" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="63" y1="58" x2="77" y2="72" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <line x1="77" y1="58" x2="63" y2="72" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </g>

      {isDone && name && (
        <text x="70" y="120" textAnchor="middle" fill={stroke} fillOpacity="0.4" fontSize="3" fontFamily="monospace">
          {name.slice(0, 18)}
        </text>
      )}

      {isDone && !isError && (
        <text x="70" y="110" textAnchor="middle" fill={stroke} fillOpacity="0.5" fontSize="4" fontFamily="monospace">
          {variant === 'window' ? 'App closed' : 'Panel closed'}
        </text>
      )}
    </svg>
  )
}
