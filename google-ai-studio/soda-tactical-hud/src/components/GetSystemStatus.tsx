import * as React from 'react';
import { ToolStatus, SystemStatusData } from '../types';

interface GetSystemStatusProps {
  status: ToolStatus;
  data?: Partial<SystemStatusData>;
}

// Default mock SODA values when no real data is passed
const defaultData: SystemStatusData = {
  cpu_percent: 68,
  ram_percent: 42,
  ram_total_gb: 32,
  ram_used_gb: 12,
  disk_percent: 48,
  disk_total_gb: 1000,
  disk_used_gb: 450,
  cpu_count: 16,
  os: 'SodaOS',
  os_version: 'v1.2',
  hostname: 'soda-node-01',
  python: '3.11.2',
  battery_percent: 88,
  battery_charging: true,
};

export default function GetSystemStatus({ status = 'done', data }: GetSystemStatusProps) {
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(data || {
    cpu_percent: 0,
    ram_percent: 0,
    ram_total_gb: 0,
    ram_used_gb: 0,
    disk_percent: 0,
    disk_total_gb: 0,
    disk_used_gb: 0,
    cpu_count: 0,
    os: 'AWAITING_STREAM',
    os_version: 'v0.0',
    hostname: 'OFFLINE_NODE',
    python: '',
    battery_percent: 0,
    battery_charging: false,
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

  // SODA Design Tokens
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
    animation: 'sodaSweep 3.5s linear infinite',
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
      {/* SODA SYSTEM STATUS CARD */}
      <div style={cardStyle}>
        {/* CSS KEYFRAMES */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sodaSweep {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes sodaPulse {
            0% { opacity: 0.3; }
            50% { opacity: 0.8; }
            100% { opacity: 0.3; }
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
            {status.toUpperCase()}
          </div>

          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ffb4ab' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.05em' }}>CRITICAL KERNEL PANIC</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', padding: '0 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', width: '100%' }}>
                {/* CPU Ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <svg width="60" height="60" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke={`${strokeColor}15`} strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke={isRunning ? '#00fbfb' : successColor}
                        strokeWidth="3"
                        strokeDasharray="100"
                        strokeDashoffset={100 - (isRunning ? 25 : mergedData.cpu_percent)}
                        strokeLinecap="square"
                        style={{
                          transition: 'stroke-dashoffset 0.8s ease-out',
                          transform: 'rotate(-90deg)',
                          transformOrigin: '50% 50%',
                        }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: isRunning ? '#00fbfb' : '#28c840'
                      }}>{isRunning ? 'SCAN' : `${mergedData.cpu_percent}%`}</span>
                    </div>
                  </div>
                  <span style={labelStyle(0.5)}>CPU</span>
                </div>

                {/* RAM Ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <svg width="60" height="60" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke={`${strokeColor}15`} strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke={isRunning ? '#00fbfb' : successColor}
                        strokeWidth="3"
                        strokeDasharray="100"
                        strokeDashoffset={100 - (isRunning ? 40 : mergedData.ram_percent)}
                        strokeLinecap="square"
                        style={{
                          transition: 'stroke-dashoffset 0.8s ease-out',
                          transform: 'rotate(-90deg)',
                          transformOrigin: '50% 50%',
                        }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: isRunning ? '#00fbfb' : '#28c840'
                      }}>{isRunning ? 'LOAD' : `${mergedData.ram_percent}%`}</span>
                    </div>
                  </div>
                  <span style={labelStyle(0.5)}>RAM</span>
                </div>
              </div>

              {/* Disk Segmented Progress Line */}
              <div style={{ width: '100%', maxWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={labelStyle(0.5)}>DISK STORAGE</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', color: isRunning ? strokeColor : successColor }}>
                    {isRunning ? '--%' : `${mergedData.disk_percent}%`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2px', height: '6px', width: '100%' }}>
                  {Array.from({ length: 10 }).map((_, index) => {
                    const filled = !isRunning && index / 10 < mergedData.disk_percent / 100;
                    return (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          backgroundColor: filled ? successColor : `${strokeColor}22`,
                          animation: isRunning ? `sodaPulse 1.2s infinite ease-in-out` : 'none',
                          animationDelay: `${index * 0.1}s`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Zone (45%) */}
        <div style={dataZoneStyle}>
          {isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: '3px' }}>
                <span style={labelStyle(0.6)}>STATUS</span>
                <span style={{ ...valueStyle, color: '#ffb4ab' }}>FAILURE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,180,171,0.2)', paddingBottom: '3px' }}>
                <span style={labelStyle(0.6)}>ERROR_CODE</span>
                <span style={{ ...valueStyle, color: '#ffb4ab', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>0xEA4240_KERN</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '3px' }}>
                <span style={labelStyle(0.6)}>MSG</span>
                <span style={{ ...valueStyle, color: '#ffb4ab', fontSize: '11px' }}>SYSTEM HALTED</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              {[
                { label: 'OS', value: isRunning ? 'SCANNING...' : `${mergedData.os} ${mergedData.os_version}` },
                { label: 'HOST', value: isRunning ? 'SCANNING...' : mergedData.hostname },
                { label: 'CORES', value: isRunning ? 'SCANNING...' : `${mergedData.cpu_count} Thread vCPUs` },
                { label: 'RAM', value: isRunning ? 'SCANNING...' : `${mergedData.ram_used_gb}/${mergedData.ram_total_gb} GB` },
                { label: 'DISK', value: isRunning ? 'SCANNING...' : `${mergedData.disk_used_gb}/${mergedData.disk_total_gb} GB` },
                { label: 'PYTHON', value: isRunning ? 'SCANNING...' : mergedData.python },
              ].map((row, idx) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderBottom: idx === 5 ? 'none' : '1px dashed rgba(0,251,251,0.08)',
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
            REAL DATA PIPELINE INPUT [get_system_status]
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
              cpu_percent: 0,
              ram_percent: 0,
              ram_total_gb: 0,
              ram_used_gb: 0,
              disk_percent: 0,
              disk_total_gb: 0,
              disk_used_gb: 0,
              cpu_count: 0,
              os: 'AWAITING_STREAM',
              os_version: 'v0.0',
              hostname: 'OFFLINE_NODE',
              python: '',
              battery_percent: 0,
              battery_charging: false,
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
              cpu_percent: 68,
              ram_percent: 42,
              ram_total_gb: 32,
              ram_used_gb: 12,
              disk_percent: 48,
              disk_total_gb: 1000,
              disk_used_gb: 450,
              cpu_count: 16,
              os: 'SodaOS',
              os_version: 'v1.2',
              hostname: 'soda-node-01',
              python: '3.11.2',
              battery_percent: 88,
              battery_charging: true,
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
