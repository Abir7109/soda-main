import * as React from 'react';
import { ToolStatus, OpenAppData } from '../types';

interface AppControlProps {
  status: ToolStatus;
  mode?: 'open' | 'close';
  data?: Partial<OpenAppData>;
}

const defaultData: OpenAppData = {
  name: 'SodaTerminal.exe',
};

export default function AppControl({ status = 'done', mode = 'open', data }: AppControlProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    name: 'NULL_PROCESS.EXE',
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
    animation: 'sodaSweep 2.9s linear infinite',
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
      {/* SODA APP CONTROL CARD */}
      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes ringExpand {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes blockPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
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
            {isError ? 'ERR_PROC' : isRunning ? 'WORKING' : 'NOMINAL'}
          </div>

          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ffb4ab' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="m15 9-6 6M9 9l6 6" />
                <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }}>EXEC_SIGKILL</span>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Expanding Pulse Rings */}
              {isRunning && (
                <>
                  <div style={{
                    position: 'absolute',
                    width: '64px',
                    height: '64px',
                    border: '2px solid rgba(0,251,251,0.6)',
                    borderRadius: '50%',
                    animation: 'ringExpand 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }} />
                  <div style={{
                    position: 'absolute',
                    width: '64px',
                    height: '64px',
                    border: '2px solid rgba(0,251,251,0.3)',
                    borderRadius: '50%',
                    animation: 'ringExpand 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                    animationDelay: '0.8s',
                  }} />
                </>
              )}

              {/* Terminal Box Graphic inside Ring */}
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                backgroundColor: 'rgba(8,16,16,0.92)',
                border: '1.5px solid #00fbfb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(0,251,251,0.15)',
                zIndex: 2,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00fbfb" strokeWidth="1.5">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <polyline points="8 12 11 15 16 10" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Data Zone */}
        <div style={dataZoneStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${strokeColor}22`, paddingBottom: '3.5px' }}>
              <span style={labelStyle()}>TARGET APP</span>
              <span style={{ ...valueStyle, color: isError ? '#ffb4ab' : '#00fbfb' }}>
                {isRunning ? 'RESOLVING_BIN...' : mergedData.name}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${strokeColor}15`, paddingBottom: '3px', marginTop: '4px' }}>
              <span style={labelStyle()}>PID IDENTIFIER</span>
              <span style={valueStyle}>
                {isError ? 'COREDUMP' : isRunning ? 'ALLOCATING...' : '0xFA39C2_EXEC'}
              </span>
            </div>

            {/* Segmented memory loader bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={labelStyle(0.35)}>MEMORY ALLOC LOAD</span>
                <span style={{ fontSize: '10px', color: isError ? '#ffb4ab' : '#00fbfb', fontWeight: 'bold' }}>
                  {isError ? '0%' : isRunning ? '45%' : '100%'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '2px', height: '6px', width: '100%' }}>
                {Array.from({ length: 12 }).map((_, idx) => {
                  const filled = !isError && (isRunning ? idx < 5 : true);
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        backgroundColor: filled ? '#00fbfb' : 'rgba(0,251,251,0.06)',
                        animation: isRunning ? 'blockPulse 1.2s infinite ease-in-out' : 'none',
                        animationDelay: `${idx * 0.08}s`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px dashed ${strokeColor}22`, paddingTop: '4px' }}>
            <span style={labelStyle()}>PROCESS_STATE</span>
            <span style={{
              ...valueStyle,
              color: isError ? '#ffb4ab' : successColor,
              animation: isRunning ? 'blockPulse 1s infinite alternate' : 'none'
            }}>
              {isError ? 'CRASHED_ABORTED' : isRunning ? `${mode === 'open' ? 'LAUNCHING...' : 'TERMINATING...'}` : 'ONLINE_STABLE'}
            </span>
          </div>
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
            REAL DATA PIPELINE INPUT [{mode === 'open' ? 'open_app' : 'close_window'}]
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
              name: 'NULL_PROCESS.EXE',
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
              name: 'SodaTerminal.exe',
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
