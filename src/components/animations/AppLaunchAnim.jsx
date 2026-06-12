export default function AppLaunchAnim({ status, variant = 'launch', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const name = data?.name || data?.app || ''
  const result = data?.result || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="app-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="70" cy="70" r="60" fill="url(#app-glow)" />

      <g style={isRunning ? { transformOrigin: '70px 65px', animation: 'soda-app-launch 0.8s ease-out forwards' } : { transformOrigin: '70px 65px', transform: 'scale(1)' }}>
        <rect x="45" y="40" width="50" height="50" rx="12" fill="rgba(0,251,251,0.08)" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="53" y="48" width="14" height="14" rx="3" fill={stroke} fillOpacity="0.25" />
        <rect x="73" y="48" width="14" height="14" rx="3" fill={stroke} fillOpacity="0.2" />
        <rect x="53" y="68" width="14" height="14" rx="3" fill={stroke} fillOpacity="0.2" />
        <rect x="73" y="68" width="14" height="14" rx="3" fill={stroke} fillOpacity="0.15" />
      </g>

      {isRunning && (
        <g>
          <circle cx="70" cy="65" r="30" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.3"
            style={{ animation: 'soda-splash-ring 1s ease-out forwards' }} />
          <circle cx="70" cy="65" r="45" fill="none" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.2"
            style={{ animation: 'soda-splash-ring 1s 0.2s ease-out forwards' }} />
        </g>
      )}

      {isRunning && [
        { x: 70, y: 30, dx: 0, dy: -15 },
        { x: 95, y: 45, dx: 15, dy: -10 },
        { x: 100, y: 65, dx: 18, dy: 0 },
        { x: 95, y: 85, dx: 15, dy: 10 },
        { x: 70, y: 100, dx: 0, dy: 15 },
        { x: 45, y: 85, dx: -15, dy: 10 },
        { x: 40, y: 65, dx: -18, dy: 0 },
        { x: 45, y: 45, dx: -15, dy: -10 },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={stroke} fillOpacity="0.5"
          style={{ animation: `soda-particle 0.8s ${i * 0.05}s ease-out forwards` }} />
      ))}

      {isDone && name && (
        <text x="70" y="115" textAnchor="middle" fill={stroke} fillOpacity="0.45" fontSize="3.5" fontFamily="monospace">
          {name.slice(0, 16)}
        </text>
      )}

      {isDone && !isError && (
        <g>
          <circle cx="70" cy="65" r="22" fill="none" stroke={stroke} strokeWidth="1.5" />
          <polyline points="61,65 67,71 79,59" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
