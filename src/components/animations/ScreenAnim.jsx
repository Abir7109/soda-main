export default function ScreenAnim({ status, variant = 'analyze', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const result = data?.result || data?.text || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="scr-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="scr-scan" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0" />
          <stop offset="50%" stopColor={stroke} stopOpacity="0.5" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="70" cy="70" r="60" fill="url(#scr-glow)" />

      <rect x="20" y="25" width="100" height="75" rx="3" fill="rgba(0,251,251,0.03)" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.6" />

      {[35, 45, 55, 65, 75, 85].map((y, i) => (
        <rect key={i} x="26" y={y} width={50 + (i % 3) * 12} height="4" rx="1" fill={stroke} fillOpacity="0.1" />
      ))}

      {isRunning && (
        <rect x="20" y="25" width="100" height="8" fill="url(#scr-scan)"
          style={{ animation: 'soda-scan 2s linear infinite' }}>
          <animate attributeName="y" values="25;92;25" dur="2s" repeatCount="indefinite" />
        </rect>
      )}

      {variant === 'ocr' && isRunning && (
        <g>
          <rect x="125" y="30" width="12" height="60" rx="2" fill="rgba(0,251,251,0.05)" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.3" />
          {[36, 44, 52, 60, 68, 76, 84].map((y, i) => (
            <rect key={i} x="128" y={y} width={6 + (i % 2) * 3} height="2" rx="0.5" fill={stroke} fillOpacity="0.3"
              style={{ animation: `soda-item-slide 0.2s ${i * 0.1}s ease-out both` }} />
          ))}
        </g>
      )}

      {variant === 'analyze' && isRunning && (
        <g style={{ transformOrigin: '70px 62px', animation: 'soda-crosshair 2s ease-in-out infinite' }}>
          <circle cx="70" cy="62" r="15" fill="none" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4 2" />
          <line x1="70" y1="44" x2="70" y2="48" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="70" y1="76" x2="70" y2="80" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="52" y1="62" x2="56" y2="62" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="84" y1="62" x2="88" y2="62" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5" />
        </g>
      )}

      <rect x="55" y="100" width="30" height="3" rx="1.5" fill={stroke} fillOpacity="0.2" />
      <rect x="65" y="103" width="10" height="5" fill={stroke} fillOpacity="0.15" />

      {isDone && result && (
        <text x="70" y="120" textAnchor="middle" fill={stroke} fillOpacity="0.35" fontSize="3" fontFamily="monospace">
          {result.slice(0, 22)}
        </text>
      )}

      {isDone && !isError && (
        <g>
          <circle cx="110" cy="100" r="8" fill="none" stroke={stroke} strokeWidth="1.5" />
          <polyline points="106,100 109,103 114,97" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
