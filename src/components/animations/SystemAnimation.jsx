export default function SystemAnimation({ status, data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const os = data?.os || data?.platform || ''
  const host = data?.hostname || ''
  const cpu = data?.cpu_percent ?? data?.cpu ?? ''

  const satellites = [
    { angle: 0, size: 3 },
    { angle: 72, size: 2.5 },
    { angle: 144, size: 2 },
    { angle: 216, size: 2.5 },
    { angle: 288, size: 3 }
  ]

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sys-core-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="70" cy="70" r="50" fill="url(#sys-core-grad)" />

      <ellipse cx="70" cy="70" rx="55" ry="20" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.4" />
      <ellipse cx="70" cy="70" rx="55" ry="20" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.3" transform="rotate(60 70 70)" />
      <ellipse cx="70" cy="70" rx="55" ry="20" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.3" transform="rotate(-60 70 70)" />

      <g style={isRunning ? { transformOrigin: '70px 70px', animation: 'soda-orbit 4s linear infinite', willChange: 'transform' } : {}}>
        {satellites.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180
          const x = 70 + 55 * Math.cos(rad)
          const y = 70 + 20 * Math.sin(rad)
          return <circle key={i} cx={x} cy={y} r={s.size} fill={stroke} opacity="0.9" />
        })}
      </g>
      <g style={isRunning ? { transformOrigin: '70px 70px', animation: 'soda-orbit 6s linear infinite reverse', willChange: 'transform' } : {}}>
        {satellites.map((s, i) => {
          const rad = ((s.angle + 36) * Math.PI) / 180
          const x = 70 + 55 * Math.cos(rad)
          const y = 70 + 20 * Math.sin(rad)
          return <circle key={i} cx={x} cy={y} r="1.5" fill={stroke} opacity="0.5" />
        })}
      </g>

      <circle cx="70" cy="70" r="10" fill="rgba(4, 8, 11, 0.9)" stroke={stroke} strokeWidth="1.5" />
      <circle cx="70" cy="70" r="3" fill={stroke} />

      {isDone && (os || host) && (
        <g>
          <text x="70" y="98" textAnchor="middle" fill={stroke} fillOpacity="0.5" fontSize="3.5" fontFamily="monospace">
            {os.slice(0, 12) || host.slice(0, 12)}
          </text>
          {cpu !== '' && (
            <text x="70" y="108" textAnchor="middle" fill={stroke} fillOpacity="0.35" fontSize="3" fontFamily="monospace">
              CPU {Math.round(cpu)}%
            </text>
          )}
        </g>
      )}
      {isDone && !isError && (
        <circle cx="70" cy="70" r="60" fill="none" stroke={stroke} strokeWidth="1" strokeOpacity="0.5" />
      )}
    </svg>
  )
}
