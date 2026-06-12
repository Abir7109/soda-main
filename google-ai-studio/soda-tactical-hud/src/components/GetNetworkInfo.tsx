import * as React from 'react';
import { ToolStatus, GetNetworkInfoData } from '../types';

interface GetNetworkInfoProps {
  status: ToolStatus;
  data?: Partial<GetNetworkInfoData>;
}

const defaultData: GetNetworkInfoData = {
  ip: '192.168.1.1',
  city: 'London',
  country: 'UK',
  isp: 'SodaNet',
};

export default function GetNetworkInfo({ status = 'done', data }: GetNetworkInfoProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    ip: '0.0.0.0',
    city: 'OFFLINE',
    country: 'WAIT',
    isp: 'DISCONNECTED',
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
    animation: 'sodaSweep 3.1s linear infinite',
    pointerEvents: 'none',
    zIndex: 10,
  };

  const labelStyle = (customOpacity = 0.4): React.CSSProperties => ({
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: isError ? '#ffb4ab' : '#00fbfb',
    opacity: isError ? 0.6 : customOpacity,
    textTransform: 'uppercase',
  });

  const valueStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    color: isError ? '#ffb4ab' : '#dbe4e3',
    opacity: isError ? 0.85 : 0.85,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
      {/* SODA NETWORK INFO CARD */}
      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes netPulse {
            0% { transform: scale(0.85); opacity: 0.1; }
            50% { opacity: 0.5; }
            100% { transform: scale(1.3); opacity: 0; }
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
            {isError ? 'ERR_SYS' : isRunning ? 'RESOLVING' : 'CONNECTED'}
          </div>

          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ffb4ab' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="1" y1="12" x2="23" y2="12" />
                <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }}>OFFLINE: NO_GATEWAY</span>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Pulsing radar rings */}
              <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                border: '2px solid rgba(0,251,251,0.5)',
                borderRadius: '50%',
                animation: 'netPulse 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite',
              }} />
              <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                border: '1px solid rgba(0,251,251,0.2)',
                borderRadius: '50%',
                animation: 'netPulse 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite',
                animationDelay: '1s',
              }} />

              {/* Globe Icon */}
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#00fbfb" strokeWidth="1.5" style={{ zIndex: 2 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
          )}
        </div>

        {/* Data Zone */}
        <div style={dataZoneStyle}>
          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: '3px' }}>
                <span style={labelStyle(0.6)}>LOC_IP</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>0.0.0.0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: '3px' }}>
                <span style={labelStyle(0.6)}>GATEWAY</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>NULL</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '3px' }}>
                <span style={labelStyle(0.6)}>ERROR_STATE</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>NET_DISCONNECTED</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              {[
                { label: 'IP ADDRESS', value: isRunning ? 'RESOLVING...' : mergedData.ip },
                { label: 'ISP PROVIDER', value: isRunning ? 'LOCATING...' : mergedData.isp },
                { label: 'CITY', value: isRunning ? 'SCANNING...' : mergedData.city },
                { label: 'COUNTRY', value: isRunning ? 'SCANNING...' : mergedData.country },
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
            REAL DATA PIPELINE INPUT [get_network_info]
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
              ip: '0.0.0.0',
              city: 'OFFLINE',
              country: 'WAIT',
              isp: 'DISCONNECTED',
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
              ip: '192.168.1.1',
              city: 'London',
              country: 'UK',
              isp: 'SodaNet',
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
