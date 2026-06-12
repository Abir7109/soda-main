export default function GitDeployAnim({ status, variant = 'deploy' }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const showGitHub = variant === 'branch'
  const showDeploy = variant === 'deploy'

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="git-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
        <filter id="git-filter">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="70" cy="70" r="55" fill="url(#git-glow)" />

      {/* HUD Corner brackets */}
      <g stroke={stroke} strokeWidth="1.2" strokeOpacity="0.2" fill="none"
        style={{ animation: 'hud-bracket-in 0.4s ease-out' }}>
        <path d="M 8 14 L 8 8 L 14 8" />
        <path d="M 132 8 L 126 8 L 126 14" />
        <path d="M 8 126 L 8 132 L 14 132" />
        <path d="M 132 126 L 132 132 L 126 132" />
      </g>

      {/* GitHub Octocat Mark / rocket */}
      {showGitHub && (
        <g transform="translate(35,38)" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
          filter={isRunning ? 'url(#git-filter)' : undefined}>
          {/* GitHub Octocat silhouette: circle head + cat ears + body */}
          <circle cx="35" cy="28" r="16" />
          <path d="M 25 18 L 27 10 Q 35 14 43 10 L 45 18" />
          <path d="M 21 34 Q 18 46 25 52 Q 30 56 35 50 Q 40 56 45 52 Q 52 46 49 34" />
          {/* Eyes */}
          <circle cx="29" cy="25" r="1.8" fill={stroke} stroke="none" />
          <circle cx="41" cy="25" r="1.8" fill={stroke} stroke="none" />
          {/* Arm reaching */}
          <path d="M 49 34 Q 58 32 60 38 Q 54 42 52 44" strokeWidth="1" />
          {/* Pulse ring */}
          {isRunning && (
            <circle cx="35" cy="32" r="22" stroke={stroke} strokeWidth="0.6" strokeOpacity="0.3"
              style={{ animation: 'hud-ring-burst 2s ease-out infinite' }} />
          )}
        </g>
      )}

      {/* Deploy rocket */}
      {showDeploy && (
        <g transform="translate(56,48)" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"
          filter={isRunning ? 'url(#git-filter)' : undefined}>
          <line x1="14" y1="32" x2="14" y2="0" strokeWidth="1.8" />
          <polyline points="6,8 14,0 22,8" strokeLinejoin="round" />
          <line x1="0" y1="32" x2="28" y2="32" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M 4 36 Q 14 46 24 36" strokeWidth="1.2" strokeOpacity="0.5" />
          {isRunning && (
            <g strokeWidth="0.8" strokeOpacity="0.3">
              <line x1="10" y1="38" x2="10" y2="44" style={{ animation: 'hud-stream-in 0.8s ease-in infinite' }} />
              <line x1="14" y1="40" x2="14" y2="48" style={{ animation: 'hud-stream-in 0.8s ease-in 0.15s infinite' }} />
              <line x1="18" y1="38" x2="18" y2="44" style={{ animation: 'hud-stream-in 0.8s ease-in 0.3s infinite' }} />
            </g>
          )}
        </g>
      )}

      {/* Orbital dots */}
      {isRunning && [0,1,2,3].map(i => (
        <g key={i}
          style={{
            transformOrigin: '70px 70px',
            animation: `hud-rotate ${3 + i * 0.5}s linear infinite`,
            animationDelay: `${i * 0.8}s`,
            willChange: 'transform'
          }}
        >
          <circle cx="70" cy="22" r={`${1.5 + i * 0.3}`} fill={stroke} stroke="none" opacity={0.5 - i * 0.08} />
        </g>
      ))}

      {/* Done check */}
      {isDone && !isError && (
        <g>
          <circle cx="70" cy="70" r="22" fill={stroke} fillOpacity="0.04" filter="url(#git-filter)"
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
