import * as React from 'react';
import { ToolStatus, RememberFactData } from '../types';

interface RememberRecallFactProps {
  status: ToolStatus;
  data?: Partial<RememberFactData>;
}

const defaultData: RememberFactData = {
  key: 'User_Session_Role',
  value: 'Secure Tactical Admin Agent',
};

export default function RememberRecallFact({ status = 'done', data }: RememberRecallFactProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    key: '',
    value: '',
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
    animation: 'sodaSweep 3.6s linear infinite',
    pointerEvents: 'none',
    zIndex: 10,
  };

  const labelStyle = (customOpacity = 0.4): React.CSSProperties => ({
    fontSize: '10px',
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
      {/* SODA REMEMBER/RECALL CARD */}
      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes radialGlow {
            0%, 100% { transform: scale(0.9); opacity: 0.3; }
            50% { transform: scale(1.1); opacity: 0.7; }
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
            {isError ? 'ERR_MEM' : isRunning ? 'STORING...' : 'ALLOCATED'}
          </div>

          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ffb4ab' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }}>CLUSTER_MISALIGNED</span>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyInner: 'center' }}>
              {/* Radiating circular memory gates */}
              <div style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                border: '1.5px dashed rgba(0,251,251,0.25)',
                borderRadius: '50%',
                animation: 'radialGlow 3s infinite ease-in-out',
              }} />
              <div style={{
                position: 'absolute',
                width: '74px',
                height: '74px',
                border: '1px solid rgba(0,251,251,0.1)',
                borderRadius: '50%',
              }} />

              {/* Memory Head / Psychology Graphic */}
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#00fbfb" strokeWidth="1.5" style={{ zIndex: 2 }}>
                <path d="M12 2a10 10 0 0 0-7.54 16.59c.2-.2.43-.37.69-.5A5.98 5.98 0 0 1 12 16c2.6 0 4.88 1.65 5.85 2.09A10 10 0 0 0 12 2Z" />
                <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Data Zone */}
        <div style={dataZoneStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${strokeColor}22`, paddingBottom: '3px' }}>
              <span style={labelStyle()}>MEMORY_KEY</span>
              <span style={{ ...valueStyle, color: isError ? '#ffb4ab' : '#00fbfb' }}>
                {isRunning ? 'ALLOCATING...' : mergedData.key}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              <span style={labelStyle(0.35)}>CELL_VALUE /* DATA_BLOCK_VALUE */</span>
              <div style={{
                background: isError ? 'rgba(255,180,171,0.06)' : 'rgba(0,0,0,0.22)',
                border: `1px solid ${strokeColor}15`,
                padding: '6px 8px',
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                color: isError ? '#ffb4ab' : '#ffffff',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}>
                {isError ? 'FAIL: Block aligned 0x7FFA89B2 read check abort.' : isRunning ? 'Storing data string cluster...' : mergedData.value}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: `1px dashed ${strokeColor}22`, paddingTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={labelStyle()}>BLOCK_ADDRESS</span>
              <span style={{ ...valueStyle, color: '#839493', fontFamily: "'JetBrains Mono', monospace" }}>
                0x7FFA89B2
              </span>
            </div>
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
            REAL DATA PIPELINE INPUT [remember_fact / recall_facts]
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
              key: '',
              value: '',
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
              key: 'User_Session_Role',
              value: 'Secure Tactical Admin Agent',
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
