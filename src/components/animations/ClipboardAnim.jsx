export default function ClipboardAnim({ status, variant = 'read', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const text = data?.text || data?.content || ''
  const textLines = text.split('\n').filter(Boolean)

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="clip-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="70" cy="70" r="60" fill="url(#clip-glow)" />

      <rect x="38" y="30" width="64" height="80" rx="4" fill="rgba(0,251,251,0.04)" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.6" />
      <rect x="52" y="24" width="36" height="12" rx="4" fill="rgba(0,251,251,0.08)" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.7" />
      <circle cx="70" cy="30" r="3" fill={stroke} fillOpacity="0.3" stroke={stroke} strokeWidth="1" strokeOpacity="0.5" />

      {isDone && textLines.length > 0 && textLines.slice(0, 6).map((line, i) => (
        <text key={i} x="46" y={52 + i * 12} fill={stroke} fillOpacity={0.5 - i * 0.05} fontSize="3.5" fontFamily="monospace"
          style={{ animation: `soda-item-slide 0.2s ${i * 0.05}s ease-out both` }}>
          {line.slice(0, 16)}
        </text>
      ))}
      {isDone && textLines.length > 6 && (
        <text x="46" y="126" fill={stroke} fillOpacity="0.3" fontSize="3" fontFamily="monospace">
          +{textLines.length - 6}
        </text>
      )}

      {isRunning && [48, 56, 64, 72, 80, 88, 96].map((y, i) => (
        <g key={i} style={{ animation: `soda-item-slide 0.2s ${i * 0.06}s ease-out both` }}>
          <rect x="46" y={y} width={8 + i * 7} height="2.5" rx="1" fill={stroke} fillOpacity="0.25" />
        </g>
      ))}

      {isRunning && variant === 'read' && (
        <g style={{ animation: 'soda-arrow-in 1s ease-in-out infinite' }}>
          <polygon points="90,65 100,70 90,75" fill={stroke} fillOpacity="0.6" />
          <line x1="100" y1="70" x2="115" y2="70" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.5" />
        </g>
      )}
      {isRunning && variant === 'write' && (
        <g style={{ animation: 'soda-arrow-out 1s ease-in-out infinite' }}>
          <line x1="115" y1="70" x2="100" y2="70" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.5" />
          <polygon points="100,65 90,70 100,75" fill={stroke} fillOpacity="0.6" />
        </g>
      )}

      {isDone && !isError && (
        <g>
          <circle cx="105" cy="95" r="8" fill="none" stroke={stroke} strokeWidth="1.5" />
          <polyline points="101,95 104,98 109,92" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
