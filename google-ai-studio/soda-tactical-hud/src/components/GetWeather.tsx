import * as React from 'react';
import { ToolStatus, WeatherData } from '../types';

interface GetWeatherProps {
  status: ToolStatus;
  data?: Partial<WeatherData>;
}

const defaultData: WeatherData = {
  temperature: 25,
  feels_like: 27,
  humidity: 68,
  wind_speed: 12.5,
  pressure: 1013,
  location: 'Tokyo, JP',
  description: 'Nominal Clear Skies',
};

export default function GetWeather({ status = 'done', data }: GetWeatherProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    temperature: 0,
    feels_like: 0,
    humidity: 0,
    wind_speed: 0,
    pressure: 0,
    location: 'OFFLINE_NODE',
    description: 'AWAITING WEATHER TELEMETRY',
  }, null, 2));

  const [parsedData, setParsedData] = React.useState<any>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setParsedData(parsed);
      setParseError(null);
    } catch (e: any) {
      setParseError(e.message);
    }
  }, [jsonText]);

  const activeData = data || parsedData;
  const mergedData = { ...defaultData, ...activeData };
  const isError = status === 'error';
  const isRunning = status === 'running' || status === 'pending';

  const strokeColor = isError ? '#ffb4ab' : '#00fbfb';

  const cardStyle: React.CSSProperties = {
    width: '320px',
    height: '380px',
    backgroundColor: 'rgba(4, 8, 11, 0.95)',
    border: `1px solid ${strokeColor}22`,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.4s ease-out',
    opacity: isRunning ? 0.6 : 1,
  };

  const animZoneStyle: React.CSSProperties = {
    height: '55%',
    borderBottom: `1px solid ${strokeColor}22`,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: isError ? 'rgba(255, 180, 171, 0.03)' : 'rgba(0, 251, 251, 0.01)',
    overflow: 'hidden',
  };

  const dataZoneStyle: React.CSSProperties = {
    height: '45%',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8, 16, 16, 0.3)',
  };

  const scanningLineStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '1px',
    backgroundColor: strokeColor,
    boxShadow: `0 0 4px ${strokeColor}`,
    animation: 'sodaSweep 4s linear infinite',
    pointerEvents: 'none',
    zIndex: 10,
  };

  const labelStyle = (customOpacity = 0.4): React.CSSProperties => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: isError ? '#ffb4ab' : '#00fbfb',
    opacity: isError ? 0.6 : customOpacity,
    textTransform: 'uppercase',
  });

  const valueStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    color: isError ? '#ffb4ab' : '#dbe4e3',
    opacity: isError ? 0.85 : 0.85,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
      {/* SODA WEATHER CARD */}
      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes sdcPulse {
            0% { opacity: 0.4; transform: scale(0.96); }
            50% { opacity: 0.9; transform: scale(1.04); }
            100% { opacity: 0.4; transform: scale(0.96); }
          }
          @keyframes sdcRotate {
            100% { transform: rotate(360deg); }
          }
        ` }} />

        {/* Animation Zone */}
        <div style={animZoneStyle}>
          {isRunning && <div style={scanningLineStyle} />}

          {/* SODA Status Label Chip Top Left */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            border: `1px solid ${strokeColor}44`,
            padding: '2px 6px',
            fontSize: '9px',
            fontWeight: 'bold',
            color: strokeColor,
            backgroundColor: isError ? 'rgba(255,180,171,0.15)' : 'rgba(0,251,251,0.08)',
          }}>
            {isError ? 'ERR_CONN' : status === 'running' || status === 'pending' ? 'FETCHING' : 'LOCAL'}
          </div>

          {isError ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffb4ab" strokeWidth="1.5" className="flicker">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" strokeDasharray="4,4" />
                <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold', color: '#ffb4ab' }}>--°C</span>
                <span style={{ fontSize: '9px', opacity: 0.5 }}>TIMED_OUT</span>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animation: isRunning ? 'sdcPulse 2s infinite ease-in-out' : 'none'
            }}>
              {/* Animated Weather SVG Icon */}
              <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00fbfb" strokeWidth="1.5" style={{
                  animation: !isRunning ? 'sdcRotate 16s linear infinite' : 'none',
                }}>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
                {/* Cloud overlay */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(4,8,11,0.9)" stroke="#00fbfb" strokeWidth="1.5" style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '-6px',
                }}>
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>

              {/* Temperature text */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '52px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 'bold',
                  lineHeight: 1,
                  color: '#00fbfb',
                }}>
                  {isRunning ? '--°' : `${mergedData.temperature}°C`}
                </span>
                <span style={{
                  fontSize: '10px',
                  opacity: 0.6,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  {isRunning ? 'MEASURING' : mergedData.description}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Data Zone */}
        <div style={dataZoneStyle}>
          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: '3px' }}>
                <span style={labelStyle(0.6)}>LOCATION</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>ERR_NO_LOC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: '3px' }}>
                <span style={labelStyle(0.6)}>METEOROLOGY</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>UNREACHABLE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '3px' }}>
                <span style={labelStyle(0.6)}>STATUS</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>CONNECTION_TIMEOUT</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              {[
                { label: 'LOCATION', value: isRunning ? 'SCANNING...' : mergedData.location },
                { label: 'FEELS LIKE', value: isRunning ? '--' : `${mergedData.feels_like}°C` },
                { label: 'HUMIDITY', value: isRunning ? '--' : `${mergedData.humidity}%` },
                { label: 'WIND SPEED', value: isRunning ? '--' : `${mergedData.wind_speed} km/h` },
                { label: 'PRESSURE', value: isRunning ? '--' : `${mergedData.pressure} hPa` },
              ].map((row, idx) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderBottom: idx === 4 ? 'none' : '1px dashed rgba(0,251,251,0.08)',
                    paddingBottom: '3.5px',
                    opacity: isRunning ? 0.35 : 1,
                    transition: 'all 0.4s ease-out',
                    transitionDelay: `${idx * 0.06}s`,
                  }}
                >
                  <span style={labelStyle()}>{row.label}</span>
                  <span style={valueStyle}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HIGHLIGHT: EDITABLE REAL DATA INPUT TEXT BOX */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '320px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{
            fontSize: '9px',
            fontFamily: "'JetBrains Mono', monospace",
            color: strokeColor,
            opacity: 0.8,
            fontWeight: 'bold',
            letterSpacing: '0.05em'
          }}>
            REAL DATA PIPELINE INPUT [get_weather]
          </label>
          <span style={{
            fontSize: '8px',
            color: parseError ? '#ffb4ab' : '#28c840',
            fontWeight: 'bold',
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            {parseError ? '[!] JSON ERROR' : '[✓] STREAM NOMINAL'}
          </span>
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="// Pass custom data fields here as JSON string..."
          style={{
            width: '100%',
            height: '92px',
            backgroundColor: 'rgba(4, 8, 11, 0.75)',
            border: `1px solid ${parseError ? '#ffb4ab' : strokeColor}44`,
            fontSize: '10px',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#dbe4e3',
            padding: '6px',
            resize: 'vertical',
            outline: 'none',
          }}
        />
        {parseError && (
          <div style={{ fontSize: '8px', color: '#ffb4ab', fontFamily: "'JetBrains Mono', monospace" }}>
            * Syntax Error: {parseError}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
          <button
            onClick={() => setJsonText(JSON.stringify({
              temperature: 0,
              feels_like: 0,
              humidity: 0,
              wind_speed: 0,
              pressure: 0,
              location: 'OFFLINE_NODE',
              description: 'AWAITING WEATHER TELEMETRY',
            }, null, 2))}
            style={{
              fontSize: '8px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#ffb4ab',
              backgroundColor: 'rgba(255, 180, 171, 0.05)',
              border: '1px solid rgba(255, 180, 171, 0.2)',
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            CLEAR DATA
          </button>
          <button
            onClick={() => setJsonText(JSON.stringify({
              temperature: 25,
              feels_like: 27,
              humidity: 68,
              wind_speed: 12.5,
              pressure: 1013,
              location: 'Tokyo, JP',
              description: 'Nominal Clear Skies',
            }, null, 2))}
            style={{
              fontSize: '8px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#00fbfb',
              backgroundColor: 'rgba(0, 251, 251, 0.05)',
              border: '1px solid rgba(0, 251, 251, 0.2)',
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            LOAD TEMPLATE
          </button>
        </div>
      </div>
    </div>
  );
}
