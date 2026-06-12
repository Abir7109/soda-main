const defaultData = {
  command: 'soda compile --env=production',
  output: `> SODA compiler initialized.\n> loading local system dependencies...\n> linking static objects...\n> compiled successfully.\n> socket connection: nominal.`,
  success: true,
}

export default function AiTerminalCompiler({ status = 'running', data = null }) {
  const mergedData = { ...defaultData, ...data }
  const isError = status === 'error'
  const isRunning = status === 'running' || status === 'pending'
  const stroke = isError ? 'var(--error)' : '#00fbfb'

  const labelStyle = (opacity = 0.4) => ({
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: isError ? 'var(--error)' : '#00fbfb',
    opacity: isError ? 0.6 : opacity,
    textTransform: 'uppercase',
  })

  return (
    <div style={{
      width: '100%',
      maxWidth: 380,
      backgroundColor: 'rgba(4, 8, 11, 0.95)',
      border: `1px solid ${stroke}22`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'JetBrains Mono', monospace",
      transition: 'all 0.4s ease-out',
      opacity: isRunning ? 0.6 : 1,
      position: 'relative',
    }}>
      <style>{`
        @keyframes aiSweep {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes tBlink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* HUD Corner brackets */}
      <div style={{ position: 'absolute', top: 4, left: 4, width: 10, height: 10, borderTop: `1px solid ${stroke}44`, borderLeft: `1px solid ${stroke}44`, pointerEvents: 'none', zIndex: 20 }} />
      <div style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderTop: `1px solid ${stroke}44`, borderRight: `1px solid ${stroke}44`, pointerEvents: 'none', zIndex: 20 }} />
      <div style={{ position: 'absolute', bottom: 4, left: 4, width: 10, height: 10, borderBottom: `1px solid ${stroke}44`, borderLeft: `1px solid ${stroke}44`, pointerEvents: 'none', zIndex: 20 }} />
      <div style={{ position: 'absolute', bottom: 4, right: 4, width: 10, height: 10, borderBottom: `1px solid ${stroke}44`, borderRight: `1px solid ${stroke}44`, pointerEvents: 'none', zIndex: 20 }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
        backgroundImage: `linear-gradient(${stroke} 1px, transparent 1px), linear-gradient(90deg, ${stroke} 1px, transparent 1px)`,
        backgroundSize: '20px 20px', zIndex: 1,
      }} />

      {/* Animation Zone */}
      <div style={{
        height: '55%', minHeight: 180,
        borderBottom: `1px solid ${stroke}22`,
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: isError ? 'rgba(255, 180, 171, 0.03)' : 'rgba(0, 251, 251, 0.02)',
        overflow: 'hidden',
      }}>
        {isRunning && (
          <div style={{
            position: 'absolute', left: 0, width: '100%', height: '1px',
            backgroundColor: stroke, boxShadow: `0 0 4px ${stroke}`,
            animation: 'aiSweep 2.5s linear infinite', pointerEvents: 'none', zIndex: 10,
          }} />
        )}

        <div style={{
          position: 'absolute', top: 8, left: 8,
          border: `1px solid ${stroke}44`, padding: '2px 6px',
          fontSize: '9px', fontWeight: 'bold', color: stroke,
          backgroundColor: isError ? 'rgba(255,180,171,0.15)' : 'rgba(0,251,251,0.08)',
          zIndex: 15,
        }}>
          {isError ? 'ERR_SYS' : isRunning ? 'EXECUTING' : 'READY'}
        </div>

        {isError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--error)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m21 16-5-5-5 5" /><path d="m11 11-5 5" />
              <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
            </svg>
            <span style={{ fontSize: 10, fontWeight: 'bold', letterSpacing: '0.1em' }}>EXEC_ABORTED</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke='#00fbfb' strokeWidth="1.5">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" style={{ animation: 'tBlink 1s infinite' }} />
            </svg>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 'bold', color: '#00fbfb', letterSpacing: '0.05em' }}>
              {isRunning ? 'EXEC TASK_042' : 'TASK COMPLETE'}
            </span>
          </div>
        )}
      </div>

      {/* Data Zone */}
      <div style={{
        height: '45%', minHeight: 140, padding: 12,
        backgroundColor: 'rgba(8, 16, 16, 0.3)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 5,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${stroke}22`, paddingBottom: 6 }}>
          <span style={labelStyle()}>{isError ? 'ABORTED' : 'CONSOLE OUTPUT'}</span>
          <span style={{ fontSize: 9, opacity: 0.6, color: '#dbe4e3' }}>
            {isError ? 'FAIL_TR' : mergedData.success ? 'OK' : 'ERR'}
          </span>
        </div>

        <div style={{
          fontSize: 11, color: isError ? 'var(--error)' : '#00fbfb',
          background: 'rgba(0,0,0,0.3)', padding: '4px 6px',
          borderLeft: `2px solid ${stroke}`, marginTop: 4,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          $ {mergedData.command}
        </div>

        <div style={{
          flex: 1, marginTop: 6, padding: 4,
          fontSize: 10, lineHeight: 1.4,
          color: isError ? 'var(--error)' : '#ffffff', opacity: isError ? 0.9 : 0.85,
          whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', monospace",
          overflowY: 'auto',
        }}>
          {isError ? (
            <span style={{ color: 'var(--error)' }}>
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
              &gt; executing task sequence <span style={{ animation: 'tBlink 1s infinite', color: '#00fbfb' }}>_</span>
            </>
          ) : (
            mergedData.output
          )}
        </div>
      </div>
    </div>
  )
}
