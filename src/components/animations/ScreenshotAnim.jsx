export default function ScreenshotAnim({ status, variant = 'capture', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const filename = data?.filename || data?.file || ''
  const size = data?.size || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ss-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="70" cy="70" r="60" fill="url(#ss-glow)" />

      <rect x="22" y="30" width="96" height="72" rx="4" fill="rgba(0,251,251,0.03)" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.6" />
      <rect x="26" y="34" width="88" height="60" rx="2" fill={stroke} fillOpacity="0.03" />

      {isRunning && (
        <line x1="26" y1="34" x2="114" y2="34" stroke={stroke} strokeWidth="2" strokeOpacity="0.6"
          style={{ animation: 'soda-scan 1.5s linear infinite' }}>
          <animate attributeName="y1" values="34;94;34" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="y2" values="34;94;34" dur="1.5s" repeatCount="indefinite" />
        </line>
      )}

      {isRunning && (
        <g style={{ animation: 'soda-flash 0.3s ease-out forwards' }}>
          <circle cx="70" cy="66" r="30" fill={stroke} fillOpacity="0.15" />
        </g>
      )}

      {[42, 50, 58, 66, 74, 82].map((y, i) => (
        <rect key={i} x="32" y={y} width={40 + (i % 3) * 12} height="2.5" rx="1" fill={stroke} fillOpacity="0.15" />
      ))}

      <rect x="55" y="102" width="30" height="4" rx="2" fill={stroke} fillOpacity="0.2" />
      <rect x="66" y="106" width="8" height="6" fill={stroke} fillOpacity="0.15" />

      {isDone && filename && (
        <text x="70" y="125" textAnchor="middle" fill={stroke} fillOpacity="0.4" fontSize="3" fontFamily="monospace">
          {filename.slice(0, 18)}
        </text>
      )}

      {isDone && !isError && (
        <g>
          <circle cx="70" cy="66" r="20" fill="none" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.5"
            style={{ animation: 'soda-ring-pulse 1s ease-out' }} />
          <circle cx="70" cy="66" r="8" fill="none" stroke={stroke} strokeWidth="1.5" />
          <polyline points="66,66 69,69 74,63" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
