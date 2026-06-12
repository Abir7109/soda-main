import * as React from 'react';
import { ToolStatus, TerminalExecuteData } from '../types';

interface TerminalExecuteProps {
  status: ToolStatus;
  data?: Partial<TerminalExecuteData>;
}

const defaultData: TerminalExecuteData = {
  command: 'soda compile --env=production',
  output: `> SODA compiler initialized.\n> loading local system dependencies...\n> linking static objects...\n> compiled successfully in 412ms.\n> socket connection: nominal.`,
  success: true,
  duration_ms: 412,
};

export default function TerminalExecute({ status = 'running', data }: TerminalExecuteProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    command: '',
    output: 'AWAITING DISCONNECTED RAW CLIENT TERMINAL SEQUENCE...',
    success: true,
    duration_ms: 0,
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
    background: isError ? 'rgba(255, 180, 171, 0.03)' : 'rgba(0, 251, 251, 0.02)',
    overflow: 'hidden',
  };

  const dataZoneStyle: React.CSSProperties = {
    height: '45%',
    padding: '12px',
    backgroundColor: 'rgba(8, 16, 16, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  };

  const scanningLineStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '1px',
    backgroundColor: strokeColor,
    boxShadow: `0 0 4px ${strokeColor}`,
    animation: 'sodaSweep 2.5s linear infinite',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
      {/* SODA TERMINAL CARD */}
      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes termBlink {
            0%, 100% { opacity: 0; }
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
            {isError ? 'ERR_SYS' : isRunning ? 'EXECUTING' : 'READY'}
          </div>

          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ffb4ab' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="m21 16-5-5-5 5" />
                <path d="m11 11-5 5" />
                <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }}>EXEC_ABORTED</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00fbfb" strokeWidth="1.5">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" style={{ animation: 'termBlink 1s infinite' }} />
              </svg>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#00fbfb',
                letterSpacing: '0.05em'
              }}>
                {isRunning ? 'EXEC TASK_042' : 'TASK COMPLETE'}
              </span>
            </div>
          )}
        </div>

        {/* Data Zone */}
        <div style={dataZoneStyle}>
          {/* Header element of Data Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${strokeColor}22`, paddingBottom: '6px' }}>
            <span style={labelStyle()}>{isError ? 'ABORTED' : 'CONSOLE OUTPUT'}</span>
            <span style={{ fontSize: '9px', opacity: 0.6, color: '#dbe4e3' }}>
              {isError ? 'FAIL_TR' : `ms: ${mergedData.duration_ms}`}
            </span>
          </div>

          {/* Prompt command display */}
          <div style={{
            fontSize: '11px',
            color: isError ? '#ffb4ab' : '#00fbfb',
            background: 'rgba(0,0,0,0.3)',
            padding: '4px 6px',
            borderLeft: `2px solid ${strokeColor}`,
            marginTop: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            $ {mergedData.command}
          </div>

          {/* Terminal output box */}
          <div style={{
            flex: 1,
            marginTop: '6px',
            padding: '4px',
            fontSize: '10px',
            lineHeight: '1.4',
            color: isError ? '#ffb4ab' : '#ffffff',
            opacity: isError ? 0.9 : 0.85,
            whiteSpace: 'pre-wrap',
            fontFamily: "'JetBrains Mono', monospace",
            overflowY: 'auto',
          }}>
            {isError ? (
              <span style={{ color: '#ffb4ab' }}>
                $ {mergedData.command}{'\n'}
                CRITICAL EXCEPTION:{'\n'}
                &gt; Process exited with exit code 1.{'\n'}
                &gt; Permission denied: cannot bind socket.{'\n'}
                &gt; Aborting compiler thread.
              </span>
            ) : isRunning ? (
              <>
                &gt; system boot success...{'\n'}
                &gt; initializing execution thread...{'\n'}
                &gt; executing task sequence <span style={{ animation: 'termBlink 1s infinite', color: '#00fbfb' }}>_</span>
              </>
            ) : (
              mergedData.output
            )}
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
            REAL DATA PIPELINE INPUT [terminal_execute]
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
              command: '',
              output: 'AWAITING DISCONNECTED RAW CLIENT TERMINAL SEQUENCE...',
              success: true,
              duration_ms: 0,
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
              command: 'soda compile --env=production',
              output: `> SODA compiler initialized.\n> loading local system dependencies...\n> linking static objects...\n> compiled successfully in 412ms.\n> socket connection: nominal.`,
              success: true,
              duration_ms: 412,
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
