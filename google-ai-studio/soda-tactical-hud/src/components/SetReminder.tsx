import * as React from 'react';
import { ToolStatus, SetReminderData } from '../types';

interface SetReminderProps {
  status: ToolStatus;
  data?: Partial<SetReminderData>;
}

const defaultData: SetReminderData = {
  title: 'SODA DEPLOYMENT SYNC',
  time: '14:00:00',
};

export default function SetReminder({ status = 'done', data }: SetReminderProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    title: 'NO INCOMING ALARM TIMER SET',
    time: '--:--:--',
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
    animation: 'sodaSweep 3.8s linear infinite',
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
      {/* SODA SET REMINDER CARD */}
      <div style={cardStyle}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes timeFlicker {
            0%, 100% { opacity: 0.9; }
            50% { opacity: 0.5; }
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
            {isError ? 'WARN: TIMEOUT' : isRunning ? 'SYNCING...' : 'EXPIRED'}
          </div>

          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ffb4ab' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'timeFlicker 1.5s infinite' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
              </svg>
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }}>MISSED_WINDOW</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00fbfb" strokeWidth="1.5" style={{
                animation: isRunning ? 'timeFlicker 1s infinite' : 'none',
              }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#00fbfb',
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}>
                {isRunning ? '--:--:--' : mergedData.time}
              </span>
            </div>
          )}
        </div>

        {/* Data Zone */}
        <div style={dataZoneStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${strokeColor}22`, paddingBottom: '3.5px' }}>
              <span style={labelStyle()}>REMINDER_SYNC</span>
              <span style={{ ...valueStyle, color: isError ? '#ffb4ab' : '#00fbfb', textTransform: 'uppercase' }}>
                {mergedData.title}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${strokeColor}15`, paddingBottom: '3px', marginTop: '4px' }}>
              <span style={labelStyle()}>TARGET TIME</span>
              <span style={{ ...valueStyle, textDecoration: isError ? 'line-through' : 'none' }}>
                {mergedData.time}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${strokeColor}15`, paddingBottom: '3px' }}>
              <span style={labelStyle()}>CURRENT TIME</span>
              <span style={{ ...valueStyle, color: isError ? '#ffb4ab' : '#839493' }}>
                14:05:12
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px dashed ${strokeColor}22`, paddingTop: '4px' }}>
            <span style={labelStyle()}>TIME_STATE</span>
            <span style={{ ...valueStyle, color: isError ? '#ffb4ab' : successColor }}>
              {isError ? 'WARPING_MISSED' : isRunning ? 'PENDING' : 'TRIGGERED'}
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
            REAL DATA PIPELINE INPUT [set_reminder]
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
              title: 'NO INCOMING ALARM TIMER SET',
              time: '--:--:--',
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
              title: 'SODA DEPLOYMENT SYNC',
              time: '14:00:00',
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
