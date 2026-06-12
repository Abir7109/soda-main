import * as React from 'react';
import { ToolStatus, WebSearchLiveData } from '../types';

interface WebSearchLiveProps {
  status: ToolStatus;
  data?: Partial<WebSearchLiveData>;
}

const defaultData: WebSearchLiveData = {
  query: 'Soda tactical specs',
  results: [
    { title: 'SODA HUD Documentation v2.4', url: 'https://soda-docs.io/v2.4', snippet: 'Complete technical reference for SODA OS and modular HUD widgets.' },
    { title: 'Cybernetic HUD Overlays & Stitch UI', url: 'https://github.com/soda/stitch', snippet: 'Open source asset designs and modular layouts for modern tactile UI.' },
    { title: 'Low-latency System Monitoring Hardware', url: 'https://soda-tactical.org', snippet: 'Secure telemetry servers and tactical visualization tools.' },
  ],
};

export default function WebSearchLive({ status = 'done', data }: WebSearchLiveProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    query: '',
    results: [],
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
  const successColor = '#28c840';

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
    justifyInner: 'center',
    justifyContent: 'center',
    background: isError ? 'rgba(255, 180, 171, 0.03)' : 'rgba(0, 251, 251, 0.01)',
    overflow: 'hidden',
  };

  const dataZoneStyle: React.CSSProperties = {
    height: '45%',
    padding: '12px',
    backgroundColor: 'rgba(8, 16, 16, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const scanningLineStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '1px',
    backgroundColor: strokeColor,
    boxShadow: `0 0 4px ${strokeColor}`,
    animation: 'sodaSweep 3s linear infinite',
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
      {/* SODA WEB SEARCH CARD */}
      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes searchRotate {
            100% { transform: rotate(360deg); }
          }
          @keyframes searchPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.15); opacity: 1; }
          }
        ` }} />

        {/* Animation Zone (55%) */}
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
            {isError ? 'ERR_SYS' : isRunning ? 'SEARCHING' : 'DONE'}
          </div>

          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ffb4ab' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" strokeDasharray="3,3" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2.5" />
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }}>SEARCH_FAILED</span>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer Rotator ring if in searching or finished */}
              <div style={{
                position: 'absolute',
                inset: 0,
                border: `1.5px dashed ${strokeColor}44`,
                borderRadius: '50%',
                animation: isRunning ? 'searchRotate 4s linear infinite' : 'searchRotate 15s linear infinite',
              }} />
              {/* Inner ring */}
              <div style={{
                position: 'absolute',
                inset: '16px',
                border: `1px solid ${strokeColor}11`,
                borderRadius: '50%',
              }} />
              {/* Spinning scanning arc */}
              {isRunning && (
                <div style={{
                  position: 'absolute',
                  inset: '8px',
                  border: '2px solid transparent',
                  borderTopColor: strokeColor,
                  borderRadius: '50%',
                  animation: 'searchRotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                }} />
              )}
              {/* Magnifying Glass Icon */}
              <div style={{
                animation: isRunning ? 'searchPulse 1.5s infinite ease-in-out' : 'all 0.4s ease-out'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Data Zone */}
        <div style={dataZoneStyle}>
          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: '3.5px' }}>
                <span style={labelStyle(0.6)}>QUERY</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>ERR_INVALID_REQ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: '3.5px' }}>
                <span style={labelStyle(0.6)}>MATCHES</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>0 OUT OF 0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '3.5px' }}>
                <span style={labelStyle(0.6)}>NETWORK_STATE</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>DNS_RESOLUTION_FAIL</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,251,251,0.08)', paddingBottom: '3px' }}>
                <span style={labelStyle()}>SYS_QUERY</span>
                <span style={{ ...valueStyle, color: '#00fbfb', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  $ &quot;{mergedData.query}&quot;
                </span>
              </div>

              {[
                { label: 'RESULTS COUNT', value: isRunning ? 'COUNTING...' : '1,420 FOUND', color: isRunning ? '#839493' : successColor },
                { label: 'PRIMARY DOMAIN', value: isRunning ? 'RESOLVING...' : 'soda-docs.io', color: '#dbe4e3' },
                { label: 'QUERY LATENCY', value: isRunning ? '-- ms' : '42 ms', color: '#dbe4e3' },
                { label: 'SSL ENCRYPTED', value: isRunning ? '--' : 'TRUE', color: successColor },
              ].map((row, idx) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderBottom: idx === 3 ? 'none' : '1px dashed rgba(0,251,251,0.08)',
                    paddingBottom: '3px',
                    opacity: isRunning ? 0.35 : 1,
                    transition: 'all 0.4s ease-out',
                    transitionDelay: `${idx * 0.06}s`,
                  }}
                >
                  <span style={labelStyle()}>{row.label}</span>
                  <span style={{ ...valueStyle, color: row.color }}>{row.value}</span>
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
            REAL DATA PIPELINE INPUT [web_search_live]
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
              query: '',
              results: [],
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
              query: 'Soda tactical specs',
              results: [
                { title: 'SODA HUD Documentation v2.4', url: 'https://soda-docs.io/v2.4', snippet: 'Complete technical reference for SODA OS and modular HUD widgets.' },
                { title: 'Cybernetic HUD Overlays & Stitch UI', url: 'https://github.com/soda/stitch', snippet: 'Open source asset designs and modular layouts for modern tactile UI.' },
                { title: 'Low-latency System Monitoring Hardware', url: 'https://soda-tactical.org', snippet: 'Secure telemetry servers and tactical visualization tools.' },
              ],
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
