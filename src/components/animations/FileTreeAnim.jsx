export default function FileTreeAnim({ status, variant = 'list', data = null }) {
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const items = data?.items || []
  const path = data?.path || ''

  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ft-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.12" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="70" cy="70" r="60" fill="url(#ft-glow)" />

      {isRunning && (
        <g>
          <path d="M 30 28 L 40 28 L 44 34 L 60 34 L 60 40 L 30 40 Z" fill={stroke} fillOpacity="0.06" stroke={stroke} strokeWidth="1" strokeOpacity="0.4" />
          <rect x="30" y="28" width="14" height="6" fill={stroke} fillOpacity="0.04" stroke={stroke} strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="60" y1="34" x2="60" y2="40" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.3"
            style={{ transformOrigin: '60px 34px', animation: 'soda-folder-open 0.6s ease-out' }} />
          {[48, 56, 64, 72].map((y, i) => (
            <g key={i} style={{ animation: `soda-item-slide 0.3s ${i * 0.1}s ease-out both` }}>
              {(i === 0 || i === 2) ? (
                <path d={`M 36 ${y} L 36 ${y+4} L 42 ${y+4} L 46 ${y+8} L 62 ${y+8} L 62 ${y+4} L 44 ${y+4} L 40 ${y} Z`}
                  fill={stroke} fillOpacity="0.05" stroke={stroke} strokeWidth="0.6" strokeOpacity="0.3" />
              ) : (
                <rect x="40" y={y} width="12 + i * 6" height="7" rx="1" fill={stroke} fillOpacity="0.03" stroke={stroke} strokeWidth="0.5" strokeOpacity="0.2" />
              )}
              <rect x="38" y={y} width={3} height={i === 1 || i === 3 ? 7 : 8} fill={stroke} fillOpacity="0.15" />
            </g>
          ))}
        </g>
      )}

      {isDone && items.length > 0 && (
        <g>
          <path d="M 28 28 L 38 28 L 42 34 L 62 34 L 62 40 L 28 40 Z" fill={stroke} fillOpacity="0.06" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.5" />
          <text x="28" y="38" fill={stroke} fillOpacity="0.5" fontSize="3" fontFamily="monospace" fontWeight="600">
            {path ? path.split('\\').pop().slice(0, 12) || 'root' : 'root'}
          </text>
          {items.slice(0, 8).map((item, i) => (
            <g key={i} style={{ animation: `soda-item-slide 0.25s ${i * 0.05}s ease-out both` }}>
              <text x="34" y={52 + i * 10} fill={stroke} fillOpacity={0.6 - i * 0.05} fontSize="3.5" fontFamily="monospace">
                {item.type === 'folder' || item.type === 'dir' ? '\u25B6 ' : '  '}
                {(item.name || '').slice(0, 18)}
              </text>
            </g>
          ))}
          {items.length > 8 && (
            <text x="34" y="140" fill={stroke} fillOpacity="0.35" fontSize="3" fontFamily="monospace">
              +{items.length - 8} items
            </text>
          )}
        </g>
      )}

      {isDone && items.length === 0 && !isError && (
        <g>
          <path d="M 40 35 L 50 35 L 54 40 L 70 40 L 70 45 L 40 45 Z" fill={stroke} fillOpacity="0.06" stroke={stroke} strokeWidth="1" strokeOpacity="0.4" />
          <text x="50" y="72" fill={stroke} fillOpacity="0.5" fontSize="4" fontFamily="monospace">empty</text>
        </g>
      )}
    </svg>
  )
}
