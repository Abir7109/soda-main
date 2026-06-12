const WMO_LABELS = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing Rime Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
  80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with Hail',
}

const defaultData = {
  temperature: 25,
  feels_like: 27,
  humidity: 68,
  wind_speed: 12.5,
  wind_direction: 220,
  precipitation: 0.0,
  cloud_cover: 30,
  weather_code: 0,
  location: 'Tokyo',
  is_day: true,
}

export default function AiWeatherDiagnostics({ status = 'done', data = null }) {
  const mergedData = { ...defaultData, ...data }
  const isError = status === 'error'
  const isRunning = status === 'running' || status === 'pending'
  const stroke = isError ? 'var(--error)' : '#00fbfb'

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
        @keyframes wPulse {
          0% { opacity: 0.4; transform: scale(0.96); }
          50% { opacity: 0.9; transform: scale(1.04); }
          100% { opacity: 0.4; transform: scale(0.96); }
        }
        @keyframes wRotate {
          100% { transform: rotate(360deg); }
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
            animation: 'aiSweep 4s linear infinite', pointerEvents: 'none', zIndex: 10,
          }} />
        )}

        <div style={{
          position: 'absolute', top: 8, left: 8,
          border: `1px solid ${stroke}44`, padding: '2px 6px',
          fontSize: '9px', fontWeight: 'bold', color: stroke,
          backgroundColor: isError ? 'rgba(255,180,171,0.15)' : 'rgba(0,251,251,0.08)',
        }}>
          {isError ? 'ERR_CONN' : status === 'running' || status === 'pending' ? 'FETCHING' : 'LOCAL'}
        </div>

        {isError ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffb4ab" strokeWidth="1.5">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" strokeDasharray="4,4" />
              <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 24, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold', color: 'var(--error)' }}>--°C</span>
              <span style={{ fontSize: 9, opacity: 0.5 }}>TIMED_OUT</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, animation: isRunning ? 'wPulse 2s infinite ease-in-out' : 'none' }}>
            <div style={{ position: 'relative', width: 64, height: 64 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke='#00fbfb' strokeWidth="1.5"
                style={{ animation: !isRunning ? 'wRotate 16s linear infinite' : 'none' }}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(4,8,11,0.9)" stroke='#00fbfb' strokeWidth="1.5"
                style={{ position: 'absolute', bottom: 2, right: -6 }}>
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 52, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold', lineHeight: 1, color: '#00fbfb' }}>
                {isRunning ? '--°' : `${mergedData.temperature}°C`}
              </span>
              <span style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {isRunning ? 'MEASURING' : (mergedData.description || WMO_LABELS[mergedData.weather_code] || 'Unknown')}
              </span>
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
              { label: 'LOCATION', val: 'ERR_NO_LOC' },
              { label: 'METEOROLOGY', val: 'UNREACHABLE' },
              { label: 'STATUS', val: 'CONNECTION_TIMEOUT' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: 3 }}>
                <span style={labelStyle(0.6)}>{r.label}</span>
                <span style={{ ...valueStyle, color: 'var(--error)' }}>{r.val}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            {[
              { label: 'LOCATION', val: isRunning ? 'SCANNING...' : mergedData.location },
              { label: 'FEELS LIKE', val: isRunning ? '--' : `${mergedData.feels_like}°C` },
              { label: 'HUMIDITY', val: isRunning ? '--' : `${mergedData.humidity}%` },
              { label: 'WIND', val: isRunning ? '--' : `${mergedData.wind_speed} km/h ${mergedData.wind_direction}°` },
              { label: 'CLOUD', val: isRunning ? '--' : `${mergedData.cloud_cover}% · ${mergedData.precipitation ?? 0}mm` },
            ].map((row, idx) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                borderBottom: idx === 4 ? 'none' : `1px dashed ${stroke}22`,
                paddingBottom: 3.5,
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
