function formatTime(ts) {
  if (!ts) return '--:--:--'
  const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts)
  if (isNaN(d.getTime())) return String(ts)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function resolveField(data, directKey, nestedPath) {
  if (data && data[directKey]) return data[directKey]
  if (data && nestedPath) {
    const parts = nestedPath.split('.')
    let val = data
    for (const p of parts) {
      val = val?.[p]
    }
    return val
  }
  return null
}

const defaultData = {
  title: 'SODA DEPLOYMENT SYNC',
  time: '14:00:00',
}

export default function AiSchedulerAlarm({ status = 'done', data = null }) {
  const rawTitle = resolveField(data, 'title', 'reminder.message') || defaultData.title
  const rawTime = resolveField(data, 'time', 'reminder.next_fire') || defaultData.time
  const titleVal = typeof rawTime === 'number' && !data?.time ? rawTitle : rawTitle
  const timeVal = typeof rawTime === 'number' ? formatTime(rawTime) : rawTime
  const mergedData = { ...defaultData, title: titleVal, time: timeVal }
  const isError = status === 'error'
  const isRunning = status === 'running' || status === 'pending'
  const stroke = isError ? 'var(--error)' : '#00fbfb'
  const successColor = '#28c840'

  const labelStyle = (opacity = 0.4) => ({
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: isError ? 'var(--error)' : '#00fbfb',
    opacity: isError ? 0.6 : opacity,
    textTransform: 'uppercase',
  })

  const valueStyle = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '12px',
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
        @keyframes sFlicker {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.5; }
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
            animation: 'aiSweep 3.8s linear infinite', pointerEvents: 'none', zIndex: 10,
          }} />
        )}

        <div style={{
          position: 'absolute', top: 8, left: 8,
          border: `1px solid ${stroke}44`, padding: '2px 6px',
          fontSize: '9px', fontWeight: 'bold', color: stroke,
          backgroundColor: isError ? 'rgba(255,180,171,0.15)' : 'rgba(0,251,251,0.08)',
        }}>
          {isError ? 'WARN: TIMEOUT' : isRunning ? 'SYNCING...' : 'EXPIRED'}
        </div>

        {isError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--error)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{ animation: 'sFlicker 1.5s infinite' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
              <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
            </svg>
            <span style={{ fontSize: 10, fontWeight: 'bold', letterSpacing: '0.1em' }}>MISSED_WINDOW</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke='#00fbfb' strokeWidth="1.5"
              style={{ animation: isRunning ? 'sFlicker 1s infinite' : 'none' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 28, fontWeight: 'bold', color: '#00fbfb',
              letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              {isRunning ? '--:--:--' : mergedData.time}
            </span>
          </div>
        )}
      </div>

      {/* Data Zone */}
      <div style={{
        height: '45%', minHeight: 140, padding: 12,
        backgroundColor: 'rgba(8, 16, 16, 0.3)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${stroke}22`, paddingBottom: 3.5 }}>
            <span style={labelStyle()}>REMINDER_SYNC</span>
            <span style={{ ...valueStyle, color: isError ? 'var(--error)' : '#00fbfb', textTransform: 'uppercase' }}>
              {mergedData.title}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${stroke}22`, paddingBottom: 3, marginTop: 4 }}>
            <span style={labelStyle()}>TARGET TIME</span>
            <span style={{ ...valueStyle, textDecoration: isError ? 'line-through' : 'none' }}>{mergedData.time}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${stroke}22`, paddingBottom: 3 }}>
            <span style={labelStyle()}>CURRENT TIME</span>
            <span style={{ ...valueStyle, color: isError ? 'var(--error)' : '#839493' }}>14:05:12</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px dashed ${stroke}22`, paddingTop: 4 }}>
          <span style={labelStyle()}>TIME_STATE</span>
          <span style={{ ...valueStyle, color: isError ? 'var(--error)' : successColor }}>
            {isError ? 'WARPING_MISSED' : isRunning ? 'PENDING' : 'TRIGGERED'}
          </span>
        </div>
      </div>
    </div>
  )
}
