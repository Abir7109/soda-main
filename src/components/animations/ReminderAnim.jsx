export default function ReminderAnim({ status, variant = 'set', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const title = data?.title || data?.name || ''
  const time = data?.time || data?.due || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rem-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="70" cy="70" r="60" fill="url(#rem-glow)" />

      <circle cx="70" cy="65" r="30" fill="rgba(0,251,251,0.03)" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.6" />

      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 70 + 26 * Math.cos(rad)
        const y1 = 65 + 26 * Math.sin(rad)
        const x2 = 70 + 29 * Math.cos(rad)
        const y2 = 65 + 29 * Math.sin(rad)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="1" strokeOpacity="0.4" />
      })}

      <line x1="70" y1="65" x2="70" y2="45" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.7"
        style={isRunning ? { transformOrigin: '70px 65px', animation: 'soda-clock-hour 4s linear infinite' } : {}} />
      <line x1="70" y1="65" x2="70" y2="40" stroke={stroke} strokeWidth="1" strokeOpacity="0.5"
        style={isRunning ? { transformOrigin: '70px 65px', animation: 'soda-clock-minute 2s linear infinite' } : {}} />
      <circle cx="70" cy="65" r="2" fill={stroke} fillOpacity="0.6" />

      {variant === 'set' && (
        <g style={isRunning ? { transformOrigin: '100px 40px', animation: 'soda-bell-ring 0.5s ease-in-out infinite' } : {}}>
          <path d="M 94 45 Q 94 35 100 35 Q 106 35 106 45 L 106 50 L 94 50 Z" fill={stroke} fillOpacity="0.2" stroke={stroke} strokeWidth="1" strokeOpacity="0.5" />
          <circle cx="100" cy="53" r="2" fill={stroke} fillOpacity="0.5" />
        </g>
      )}

      {variant === 'list' && [90, 100, 110].map((y, i) => (
        <g key={i} style={isRunning ? { animation: `soda-item-slide 0.3s ${i * 0.1}s ease-out both` } : {}}>
          <rect x="40" y={y} width="60" height="4" rx="2" fill={stroke} fillOpacity="0.15" />
          <circle cx="46" cy={y + 2} r="1.5" fill={stroke} fillOpacity="0.4" />
        </g>
      ))}

      {isDone && title && (
        <text x="70" y="108" textAnchor="middle" fill={stroke} fillOpacity="0.4" fontSize="3.5" fontFamily="monospace">
          {title.slice(0, 18)}
        </text>
      )}

      {isDone && !isError && (
        <g>
          <circle cx="70" cy="65" r="35" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.3" />
          <polyline points="60,65 67,72 80,58" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
