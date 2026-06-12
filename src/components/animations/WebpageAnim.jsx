export default function WebpageAnim({ status, variant = 'load', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const url = data?.url || ''
  const title = data?.title || data?.content?.slice(0, 40) || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="web-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="web-load" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.8" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <circle cx="70" cy="70" r="60" fill="url(#web-glow)" />

      <rect x="20" y="25" width="100" height="85" rx="5" fill="rgba(0,251,251,0.03)" stroke={stroke} strokeWidth="1" strokeOpacity="0.5" />

      <rect x="20" y="25" width="100" height="14" rx="5" fill={stroke} fillOpacity="0.06" />
      <circle cx="28" cy="32" r="2" fill="#ff5f57" fillOpacity="0.7" />
      <circle cx="35" cy="32" r="2" fill="#febc2e" fillOpacity="0.7" />
      <circle cx="42" cy="32" r="2" fill="#28c840" fillOpacity="0.7" />

      {isRunning && (
        <g>
          {variant === 'open' ? (
            <g style={{ transformOrigin: '70px 60px', animation: 'soda-spin 3s linear infinite' }}>
              <circle cx="70" cy="60" r="12" fill="none" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.4" />
              <ellipse cx="70" cy="60" rx="12" ry="6" fill="none" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.3" />
              <line x1="70" y1="48" x2="70" y2="72" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.3" />
            </g>
          ) : (
            <rect x="20" y="42" width="100" height="2" fill={stroke} fillOpacity="0.12">
              <animate attributeName="x" from="-100" to="100" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="width" values="40;80;40" dur="1.5s" repeatCount="indefinite" />
            </rect>
          )}
          {[50, 58, 66, 74, 82, 90].map((y, i) => (
            <g key={i} style={{ animation: `soda-item-slide 0.3s ${i * 0.1}s ease-out both` }}>
              <rect x="26" y={y} width={18 + i * 10} height="3" rx="1.5" fill={stroke} fillOpacity="0.1" />
              {i % 2 === 0 && <rect x="26" y={y + 4} width={10 + i * 8} height="2" rx="1" fill={stroke} fillOpacity="0.06" />}
            </g>
          ))}
        </g>
      )}

      {isDone && (url || title) && (
        <g>
          <rect x="50" y="29" width="62" height="6" rx="2" fill={stroke} fillOpacity="0.06" stroke={stroke} strokeWidth="0.3" strokeOpacity="0.3" />
          <text x="54" y="34" fill={stroke} fillOpacity="0.5" fontSize="3" fontFamily="monospace">
            {url ? url.slice(0, 30) : 'https://...'}
          </text>
          <text x="26" y="52" fill={stroke} fillOpacity="0.8" fontSize="5" fontFamily="Space Grotesk" fontWeight="600">
            {(title || url || 'Page loaded').slice(0, 22)}
          </text>
          {(data?.images || []).slice(0, 3).map((img, i) => (
            <rect key={i} x={26 + i * 29} y={58} width="25" height="18" rx="2" fill={stroke} fillOpacity="0.04" stroke={stroke} strokeWidth="0.5" strokeOpacity="0.3"
              style={{ animation: `soda-item-slide 0.3s ${i * 0.1}s ease-out both` }} />
          ))}
          <rect x="26" y="82" width="88" height="3" rx="1.5" fill={stroke} fillOpacity="0.08" />
          <rect x="26" y="88" width="60" height="2" rx="1" fill={stroke} fillOpacity="0.05" />
          <rect x="26" y="93" width="72" height="2" rx="1" fill={stroke} fillOpacity="0.05" />
        </g>
      )}

      {isDone && !url && !isError && (
        <g>
          <circle cx="110" cy="100" r="8" fill="none" stroke={stroke} strokeWidth="1.5" />
          <polyline points="106,100 109,103 114,97" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
