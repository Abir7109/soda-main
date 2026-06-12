export default function TelegramAnim({ status, variant }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <filter id="tg-filter">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="70" cy="70" r="55" fill="url(#tg-glow)" />

      {/* HUD corner brackets */}
      <g stroke={stroke} strokeWidth="1.2" strokeOpacity="0.2" fill="none">
        <path d="M 8 14 L 8 8 L 14 8" />
        <path d="M 132 8 L 126 8 L 126 14" />
        <path d="M 8 126 L 8 132 L 14 132" />
        <path d="M 132 126 L 132 132 L 126 132" />
      </g>

      {/* Paper plane */}
      <g transform="translate(40,42)"
        filter={isRunning ? 'url(#tg-filter)' : undefined}
        style={isRunning ? {
          animation: 'tg-fly 1.2s ease-in-out infinite',
          transformOrigin: '30px 28px'
        } : undefined}>
        <g fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 2 28 L 28 4 L 52 28 L 28 24 Z" strokeOpacity="0.9" />
          <path d="M 28 24 L 38 48 L 28 38 L 18 48 Z" strokeOpacity="0.6" />
          <line x1="28" y1="4" x2="28" y2="24" strokeWidth="1" strokeOpacity="0.4" />
        </g>
        {/* Trail dots */}
        {isRunning && [0,1,2,3,4].map(i => (
          <circle key={i} cx={2 - i * 6} cy={28 + (i % 2 === 0 ? 2 : -2)} r={1.5 - i * 0.2}
            fill={stroke} stroke="none" opacity={0.4 - i * 0.07}
            style={{
              animation: `tg-trail 0.6s ease-out ${i * 0.08}s infinite`,
              willChange: 'opacity, transform'
            }} />
        ))}
      </g>

      {/* Radio waves */}
      {isRunning && (
        <g transform="translate(70,70)" fill="none" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.15">
          <path d="M 0 -28 Q 16 -18 0 -8" style={{ animation: 'tg-wave 1.5s ease-out infinite' }} />
          <path d="M 0 -32 Q 20 -18 0 -4" style={{ animation: 'tg-wave 1.5s ease-out 0.2s infinite' }} />
          <path d="M 0 -36 Q 24 -18 0 0" style={{ animation: 'tg-wave 1.5s ease-out 0.4s infinite' }} />
        </g>
      )}

      {/* Done: check + pulse */}
      {isDone && !isError && (
        <g>
          <circle cx="70" cy="70" r="22" fill={stroke} fillOpacity="0.04" filter="url(#tg-filter)"
            style={{ animation: 'hud-ring-burst 0.6s ease-out forwards' }} />
          <g transform="translate(58,62)" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polyline points="4,12 10,18 20,4"
              style={{ animation: 'hud-check-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} />
          </g>
        </g>
      )}

      {/* Error X */}
      {isError && (
        <g transform="translate(60,60)" stroke={stroke} strokeWidth="2.2" strokeLinecap="round">
          <line x1="0" y1="0" x2="20" y2="20" />
          <line x1="20" y1="0" x2="0" y2="20" />
        </g>
      )}
    </svg>
  )
}
