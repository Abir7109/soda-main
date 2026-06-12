import * as React from 'react';
import { ToolStatus, ScreenshotData } from '../types';

interface ScreenshotProps {
  status: ToolStatus;
  data?: Partial<ScreenshotData>;
}

const defaultData: ScreenshotData = {
  filename: 'soda_hud_viewport_capture.png',
};

export default function Screenshot({ status = 'done', data }: ScreenshotProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    filename: 'AWAITING_CAPTURE.PNG',
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
    animation: 'sodaSweep 2.8s linear infinite',
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
      {/* SODA SCREENSHOT CAPTURE CARD */}
      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes screenFlicker {
            0% { opacity: 0.15; }
            50% { opacity: 0.25; }
            100% { opacity: 0.15; }
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
            {isError ? 'ABORTED' : isRunning ? 'SYS_CAPTURE' : 'nominal'}
          </div>

          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ffb4ab' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="2,2" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
                <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }}>BUFFER_OVERFLOW</span>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {/* Camera Frame boundaries decoration */}
              <div style={{
                position: 'absolute',
                width: '100px',
                height: '70px',
                border: '1px solid rgba(0,251,251,0.15)',
                boxShadow: isRunning ? '0 0 10px rgba(0,251,251,0.1)' : 'none',
              }} />
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                width: '6px',
                height: '6px',
                borderTop: '2px solid #00fbfb',
                borderLeft: '2px solid #00fbfb',
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '6px',
                height: '6px',
                borderBottom: '2px solid #00fbfb',
                borderRight: '2px solid #00fbfb',
              }} />

              {/* Viewport capture display icon */}
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00fbfb" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 17L15 11" strokeDasharray="3,3" />
                <circle cx="12" cy="12" r="3" />
              </svg>

              <span style={{
                fontSize: '9px',
                fontFamily: "'JetBrains Mono', monospace",
                opacity: 0.5,
                letterSpacing: '0.05em'
              }}>
                {isRunning ? 'BUFFERING GRID...' : 'VIEWPORT_READY'}
              </span>
            </div>
          )}
        </div>

        {/* Data Zone */}
        <div style={dataZoneStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${strokeColor}22`, paddingBottom: '3.5px' }}>
              <span style={labelStyle()}>VIEW_TARGET</span>
              <span style={{ ...valueStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                {isRunning ? 'DISPATCHING...' : mergedData.filename}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${strokeColor}15`, paddingBottom: '3px', marginTop: '4px' }}>
              <span style={labelStyle()}>RESOLUTION</span>
              <span style={valueStyle}>
                1920x1080 (4K DOWN_SAMPLE)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <span style={labelStyle(0.3)}>COMPILED OUT /* METADATA */</span>
              <div style={{
                background: isError ? 'rgba(255,180,171,0.06)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${strokeColor}22`,
                padding: '4px 6px',
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                color: isError ? '#ffb4ab' : '#839493',
                height: '24px',
              }}>
                {isError ? 'BUFFER_OVERFLOW @ 0x8F9A2B (DUMPED)' : isRunning ? 'Allocating buffers...' : 'CHANNELS: RGB. COMPRESSION: Nominal.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px dashed ${strokeColor}22`, paddingTop: '4px' }}>
            <span style={labelStyle()}>SYS_STATUS</span>
            <span style={{ ...valueStyle, color: isError ? '#ffb4ab' : successColor, fontSize: '10px' }}>
              {isError ? 'ABORTED' : isRunning ? 'STREAMING...' : 'ONLINE'}
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
            REAL DATA PIPELINE INPUT [screenshot]
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
              filename: 'AWAITING_CAPTURE.PNG',
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
              filename: 'soda_hud_viewport_capture.png',
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
