export default function SearchSendAnim({ status, variant }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ss-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <filter id="ss-filter">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="ss-doc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <circle cx="70" cy="70" r="55" fill="url(#ss-glow)" />

      {/* HUD corner brackets */}
      <g stroke={stroke} strokeWidth="1.2" strokeOpacity="0.2" fill="none">
        <path d="M 8 14 L 8 8 L 14 8" />
        <path d="M 132 8 L 126 8 L 126 14" />
        <path d="M 8 126 L 8 132 L 14 132" />
        <path d="M 132 126 L 132 132 L 126 132" />
      </g>

      {/* Magnifying glass (search) */}
      <g transform="translate(30,22)"
        style={isRunning ? {
          animation: 'ss-search 1.4s ease-in-out infinite',
          transformOrigin: '20px 20px'
        } : undefined}>
        <circle cx="18" cy="18" r="10" fill="none" stroke={stroke} strokeWidth="1.8" strokeOpacity="0.7" />
        <line x1="25" y1="25" x2="33" y2="33" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
      </g>

      {/* Document being created */}
      <g transform="translate(52,44)"
        style={isRunning ? {
          animation: 'ss-doc-in 0.6s ease-out forwards'
        } : isDone ? {
          animation: 'ss-doc-out 0.5s ease-in forwards'
        } : undefined}>
        <rect x="0" y="0" width="36" height="44" rx="3" fill="url(#ss-doc)" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.6" />
        <line x1="8" y1="12" x2="28" y2="12" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.4" />
        <line x1="8" y1="18" x2="28" y2="18" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.4" />
        <line x1="8" y1="24" x2="22" y2="24" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.3" />
        <line x1="8" y1="30" x2="26" y2="30" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.3" />
        {/* Corner fold */}
        <path d="M 28 0 L 36 8 L 28 8 Z" fill={stroke} fillOpacity="0.08" stroke={stroke} strokeWidth="0.6" />
      </g>

      {/* Paper plane (Telegram send) */}
      <g transform="translate(74,76)"
        style={isRunning ? {
          animation: 'ss-fly 1.2s ease-in-out infinite',
          transformOrigin: '14px 14px'
        } : isDone ? {
          animation: 'ss-fly-out 0.5s ease-out forwards',
          transformOrigin: '14px 14px'
        } : undefined}>
        <g fill="none" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 2 14 L 14 2 L 26 14 L 14 12 Z" strokeOpacity="0.8" />
          <path d="M 14 12 L 19 24 L 14 19 L 9 24 Z" strokeOpacity="0.5" />
        </g>
        {isRunning && (
          <circle cx="0" cy="14" r="1.2" fill={stroke} opacity="0.3"
            style={{ animation: 'ss-trail 0.5s ease-out infinite' }} />
        )}
      </g>

      {/* Done: check + ring */}
      {isDone && !isError && (
        <g transform="translate(70,70)">
          <circle cx="0" cy="0" r="28" fill={stroke} fillOpacity="0.04" filter="url(#ss-filter)"
            style={{ animation: 'hud-ring-burst 0.6s ease-out forwards' }} />
          <g transform="translate(-12,-8)" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polyline points="4,12 10,18 22,4"
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

      <style>{`
        @keyframes ss-search {
          0%, 100% { transform: translate(30px,22px) rotate(0deg); }
          50% { transform: translate(30px,22px) rotate(8deg); }
        }
        @keyframes ss-doc-in {
          0% { opacity: 0; transform: translate(52px,60px) scale(0.8); }
          100% { opacity: 1; transform: translate(52px,44px) scale(1); }
        }
        @keyframes ss-doc-out {
          0% { opacity: 1; transform: translate(52px,44px) scale(1); }
          100% { opacity: 0; transform: translate(52px,30px) scale(0.9); }
        }
        @keyframes ss-fly {
          0%, 100% { transform: translate(74px,76px) translate(0,0); }
          50% { transform: translate(74px,76px) translate(6px,-4px); }
        }
        @keyframes ss-fly-out {
          0% { opacity: 1; transform: translate(74px,76px) scale(1); }
          100% { opacity: 0; transform: translate(90px,60px) scale(0.6); }
        }
        @keyframes ss-trail {
          0% { opacity: 0.4; transform: translate(0,0); }
          100% { opacity: 0; transform: translate(-8px,2px); }
        }
      `}</style>
    </svg>
  )
}
