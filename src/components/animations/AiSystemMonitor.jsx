const defaultData = {
  cpu_percent: 68,
  ram_percent: 42,
  ram_total_gb: 32,
  ram_used_gb: 12,
  disk_percent: 48,
  disk_total_gb: 1000,
  disk_used_gb: 450,
  cpu_count: 16,
  os: 'SodaOS',
  os_version: 'v1.2',
  hostname: 'soda-node-01',
  python: '3.11.2',
  battery_percent: 88,
  battery_charging: true,
}

export default function AiSystemMonitor({ status = 'done', data = null }) {
  const mergedData = { ...defaultData, ...data }
  const isError = status === 'error'
  const isRunning = status === 'running' || status === 'pending'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const successColor = '#28c840'

  const labelStyle = (opacity = 0.4) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: isError ? 'var(--error)' : '#00fbfb',
    opacity: isError ? 0.6 : opacity,
    textTransform: 'uppercase',
  })

  const valueStyle = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    color: isError ? 'var(--error)' : '#dbe4e3',
    opacity: 0.85,
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 380,
      backgroundColor: 'rgba(4, 8, 11, 0.95)',
      border: `1px solid ${stroke}22`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'JetBrains Mono', monospace",
      transition: 'all 0.4s ease-out',
      opacity: isRunning ? 0.6 : 1,
    }}>
      <style>{`
        @keyframes aiSweep {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes aiPulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
      `}</style>

      {/* Animation Zone */}
      <div style={{
        height: '55%', minHeight: 180,
        borderBottom: `1px solid ${stroke}22`,
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: isError ? 'rgba(255, 180, 171, 0.03)' : 'rgba(0, 251, 251, 0.01)',
        overflow: 'hidden',
      }}>
        {isRunning && (
          <div style={{
            position: 'absolute', left: 0, width: '100%', height: '1px',
            backgroundColor: stroke, boxShadow: `0 0 4px ${stroke}`,
            animation: 'aiSweep 3.5s linear infinite', pointerEvents: 'none', zIndex: 10,
          }} />
        )}

        <div style={{
          position: 'absolute', top: 8, left: 8,
          border: `1px solid ${stroke}44`, padding: '2px 6px',
          fontSize: '9px', fontWeight: 'bold', color: stroke,
          backgroundColor: isError ? 'rgba(255,180,171,0.15)' : 'rgba(0,251,251,0.08)',
        }}>
          {status.toUpperCase()}
        </div>

        {isError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--error)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 'bold', letterSpacing: '0.05em' }}>CRITICAL KERNEL PANIC</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, width: '100%' }}>
              {['CPU', 'RAM'].map((label, idx) => {
                const val = idx === 0 ? mergedData.cpu_percent : mergedData.ram_percent
                return (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ position: 'relative', width: 60, height: 60 }}>
                      <svg width="60" height="60" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke={`${stroke}15`} strokeWidth="3" />
                        <circle cx="18" cy="18" r="16" fill="none"
                          stroke={isRunning ? '#00fbfb' : successColor} strokeWidth="3"
                          strokeDasharray="100"
                          strokeDashoffset={100 - (isRunning ? 25 : val)}
                          strokeLinecap="square"
                          style={{ transition: 'stroke-dashoffset 0.8s ease-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 'bold', color: isRunning ? '#00fbfb' : '#28c840' }}>
                          {isRunning ? (idx === 0 ? 'SCAN' : 'LOAD') : `${val}%`}
                        </span>
                      </div>
                    </div>
                    <span style={labelStyle(0.5)}>{label}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ width: '100%', maxWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={labelStyle(0.5)}>DISK STORAGE</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: isRunning ? stroke : successColor }}>
                  {isRunning ? '--%' : `${mergedData.disk_percent}%`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 2, height: 6, width: '100%' }}>
                {Array.from({ length: 10 }).map((_, index) => {
                  const filled = !isRunning && index / 10 < mergedData.disk_percent / 100
                  return (
                    <div key={index} style={{
                      flex: 1,
                      backgroundColor: filled ? successColor : `${stroke}22`,
                      animation: isRunning ? 'aiPulse 1.2s infinite ease-in-out' : 'none',
                      animationDelay: `${index * 0.1}s`,
                    }} />
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Zone */}
      <div style={{
        height: '45%', minHeight: 140, padding: 12,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        backgroundColor: 'rgba(8, 16, 16, 0.3)',
      }}>
        {isError ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, justifyContent: 'center' }}>
            {[
              { label: 'STATUS', val: 'FAILURE' },
              { label: 'ERROR_CODE', val: '0xEA4240_KERN' },
              { label: 'MSG', val: 'SYSTEM HALTED' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: 3 }}>
                <span style={labelStyle(0.6)}>{r.label}</span>
                <span style={{ ...valueStyle, color: 'var(--error)', fontSize: 11 }}>{r.val}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            {[
              { label: 'OS', val: isRunning ? 'SCANNING...' : `${mergedData.os} ${mergedData.os_version}` },
              { label: 'HOST', val: isRunning ? 'SCANNING...' : mergedData.hostname },
              { label: 'CORES', val: isRunning ? 'SCANNING...' : `${mergedData.cpu_count} Thread vCPUs` },
              { label: 'RAM', val: isRunning ? 'SCANNING...' : `${mergedData.ram_used_gb}/${mergedData.ram_total_gb} GB` },
              { label: 'DISK', val: isRunning ? 'SCANNING...' : `${mergedData.disk_used_gb}/${mergedData.disk_total_gb} GB` },
              { label: 'PYTHON', val: isRunning ? 'SCANNING...' : mergedData.python },
            ].map((row, idx) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                borderBottom: idx === 5 ? 'none' : `1px dashed ${stroke}22`,
                paddingBottom: 3,
                opacity: isRunning ? 0.35 : 1,
                transition: 'all 0.4s ease-out',
                transitionDelay: `${idx * 0.06}s`,
              }}>
                <span style={labelStyle()}>{row.label}</span>
                <span style={valueStyle}>{row.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
