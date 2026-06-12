import * as React from 'react';
import { ToolStatus, ListFilesData } from '../types';

interface ListFilesProps {
  status: ToolStatus;
  data?: Partial<ListFilesData>;
}

const defaultData: ListFilesData = {
  path: '/var/log/soda',
  items: [
    { name: 'telemetry_dump.bin', type: 'file', size: '142 MB', modified: '2026-06-03 14:15:22' },
    { name: 'security_audit.log', type: 'file', size: '22 KB', modified: '2026-06-03 12:00:00' },
    { name: 'configs/', type: 'directory', size: '--', modified: '2026-05-30 09:12:44' },
    { name: 'assets/', type: 'directory', size: '--', modified: '2026-05-28 11:23:19' },
  ],
};

export default function ListFiles({ status = 'done', data }: ListFilesProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    path: '',
    items: [],
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
    overflow: 'hidden',
  };

  const scanningLineStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '1px',
    backgroundColor: strokeColor,
    boxShadow: `0 0 4px ${strokeColor}`,
    animation: 'sodaSweep 3.2s linear infinite',
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
    fontSize: '11px',
    fontWeight: 700,
    color: isError ? '#ffb4ab' : '#dbe4e3',
    opacity: isError ? 0.85 : 0.85,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
      {/* SODA LIST FILES CARD */}
      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes folderPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); opacity: 0.8; }
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
            {isError ? 'ERR_AUTH' : isRunning ? 'INDEXING' : 'READY'}
          </div>

          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ffb4ab' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h8.5L20 7.5V22H4Z" strokeDasharray="3,3" />
                <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }}>EACCES: DENIED</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              animation: isRunning ? 'folderPulse 1.8s infinite ease-in-out' : 'none'
            }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#00fbfb" strokeWidth="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                {!isRunning && <path d="M12 11h3m-3 4h5" strokeWidth="1" strokeLinecap="round" />}
              </svg>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#00fbfb',
                letterSpacing: '0.05em'
              }}>
                {isRunning ? 'POLLING DIR_LOG' : 'FILE STREAM LOCAL'}
              </span>
            </div>
          )}
        </div>

        {/* Data Zone */}
        <div style={dataZoneStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Folder directory Path indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${strokeColor}22`, paddingBottom: '4px' }}>
              <span style={labelStyle()}>INDEX_PATH</span>
              <span style={{ ...valueStyle, fontSize: '10px', color: isError ? '#ffb4ab' : '#00fbfb', fontFamily: "'JetBrains Mono', monospace" }}>
                {isRunning ? 'READING...' : mergedData.path}
              </span>
            </div>

            {/* List entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px', height: '110px', overflowY: 'hidden' }}>
              {isError ? (
                <div style={{ color: '#ffb4ab', fontSize: '10px', padding: '10px', border: '1px border-dashed rgba(255,180,171,0.2)' }}>
                  CRITICAL FAULT: Permission denied to access folder path &quot;{mergedData.path}&quot;. Please verify SODA key config credentials.
                </div>
              ) : (
                mergedData.items.map((item, idx) => (
                  <div
                    key={item.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      fontSize: '10px',
                      opacity: isRunning ? 0.35 : 0.85,
                      borderBottom: '1px dashed rgba(0,251,251,0.04)',
                      paddingBottom: '2px',
                      fontFamily: "'JetBrains Mono', monospace",
                      transition: 'all 0.4s ease-out',
                      transitionDelay: `${idx * 0.06}s`,
                    }}
                  >
                    <span style={{
                      color: item.type === 'directory' ? '#00fbfb' : '#ffffff',
                      textDecoration: isRunning ? 'line-through' : 'none'
                    }}>
                      {isRunning ? '---' : item.name}
                    </span>
                    <span style={{ fontSize: '9px', color: '#839493' }}>
                      {isRunning ? '--' : item.size === '--' ? 'DIR' : item.size}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px dashed ${strokeColor}22`, paddingTop: '4px' }}>
            <span style={labelStyle()}>SYS_STATUS</span>
            <span style={{ ...valueStyle, color: isError ? '#ffb4ab' : successColor, fontSize: '10px' }}>
              {isError ? 'ABORTED' : isRunning ? 'CATALOGING...' : 'ONLINE_SYNCHRONIZED'}
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
            REAL DATA PIPELINE INPUT [list_files]
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
              path: '',
              items: [],
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
              path: '/var/log/soda',
              items: [
                { name: 'telemetry_dump.bin', type: 'file', size: '142 MB', modified: '2026-06-03 14:15:22' },
                { name: 'security_audit.log', type: 'file', size: '22 KB', modified: '2026-06-03 12:00:00' },
                { name: 'configs/', type: 'directory', size: '--', modified: '2026-05-30 09:12:44' },
                { name: 'assets/', type: 'directory', size: '--', modified: '2026-05-28 11:23:19' },
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
