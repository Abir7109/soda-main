export default function MessageAnimation({ status, data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const fill = isError ? 'rgba(255, 180, 171, 0.3)' : 'rgba(0, 251, 251, 0.3)'
  const message = data?.message || data?.result || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="msg-trail-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      <path d="M 30 110 Q 60 90 90 60 T 120 20" fill="none" stroke="url(#msg-trail-grad)" strokeWidth="2"
        strokeDasharray="100" strokeDashoffset="100"
        style={isRunning ? { animation: 'soda-plane-trail 2s ease-in infinite' } : {}} />

      <g style={isRunning ? { transformOrigin: 'center', animation: 'soda-plane-fly 2s ease-in infinite', willChange: 'transform' } : {}}>
        <path d="M 30 110 L 50 100 L 38 95 L 45 90 Z" fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      </g>

      <g opacity={isRunning ? 0.3 : 1}>
        <rect x="100" y="18" width="22" height="16" rx="2" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.6" />
        <line x1="104" y1="24" x2="118" y2="24" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5" />
        <line x1="104" y1="28" x2="115" y2="28" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5" />
      </g>

      {isDone && message && (
        <text x="70" y="118" textAnchor="middle" fill={stroke} fillOpacity="0.4" fontSize="3.5" fontFamily="monospace">
          {message.slice(0, 22)}
        </text>
      )}

      {isDone && !isError && (
        <g>
          <circle cx="111" cy="26" r="14" fill="none" stroke={stroke} strokeWidth="1.5" />
          <polyline points="105,26 109,30 117,22" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  )
}
