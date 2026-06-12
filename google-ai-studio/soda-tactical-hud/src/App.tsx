import * as React from 'react';
import { ToolStatus } from './types';

// Importing SODA Tactical HUD Components
import GetSystemStatus from './components/GetSystemStatus';
import GetWeather from './components/GetWeather';
import TerminalExecute from './components/TerminalExecute';
import WebSearchLive from './components/WebSearchLive';
import ListFiles from './components/ListFiles';
import RunCode from './components/RunCode';
import RememberRecallFact from './components/RememberRecallFact';
import SetReminder from './components/SetReminder';
import GetNetworkInfo from './components/GetNetworkInfo';
import Screenshot from './components/Screenshot';
import AppControl from './components/AppControl';

export default function App() {
  // Central status store for each interactive SODA tool
  const [statuses, setStatuses] = React.useState<Record<string, ToolStatus>>({
    system_status: 'done',
    weather: 'done',
    terminal_execute: 'running',
    web_search_live: 'done',
    list_files: 'done',
    run_code: 'done',
    remember_fact: 'done',
    recall_facts: 'pending',
    set_reminder: 'done',
    network_info: 'done',
    screenshot: 'error',
    open_app: 'running',
    close_window: 'done',
  });

  // UI state for clock and active filters
  const [currentTime, setCurrentTime] = React.useState<string>(new Date().toISOString());
  const [globalStatusFilter, setGlobalStatusFilter] = React.useState<ToolStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  // Clock ticks to show real-time stream active activity
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to change individual status
  const cycleStatus = (key: string) => {
    const states: ToolStatus[] = ['pending', 'running', 'done', 'error'];
    const currentIdx = states.indexOf(statuses[key]);
    const nextIdx = (currentIdx + 1) % states.length;
    setStatuses(prev => ({
      ...prev,
      [key]: states[nextIdx],
    }));
  };

  // Helper to force all to a state
  const forceAllStatuses = (status: ToolStatus) => {
    const updated = { ...statuses };
    Object.keys(updated).forEach(key => {
      updated[key] = status;
    });
    setStatuses(updated);
  };

  // Tool specifications mapping for quick rendering and documentation
  const toolList = [
    {
      id: 'system_status',
      name: 'get_system_status',
      title: 'TOOL 01: SYSTEM MONITOR',
      component: (status: ToolStatus) => <GetSystemStatus status={status} />,
      desc: 'Retrieves CPU, RAM load matrices & local Disk allocations.',
    },
    {
      id: 'weather',
      name: 'get_weather',
      title: 'TOOL 02: WEATHER DIAGNOSTICS',
      component: (status: ToolStatus) => <GetWeather status={status} />,
      desc: 'Connects to SODA weather array for geo meteorological reports.',
    },
    {
      id: 'terminal_execute',
      name: 'terminal_execute',
      title: 'TOOL 03: TERMINAL COMPILER',
      component: (status: ToolStatus) => <TerminalExecute status={status} />,
      desc: 'Executes secure raw sandboxed instructions and pipes output.',
    },
    {
      id: 'web_search_live',
      name: 'web_search_live',
      title: 'TOOL 04: WEB SCAN RADAR',
      component: (status: ToolStatus) => <WebSearchLive status={status} />,
      desc: 'Performs non-cached scans across external index databases.',
    },
    {
      id: 'list_files',
      name: 'list_files',
      title: 'TOOL 05: FILE SYSTEM INDEXER',
      component: (status: ToolStatus) => <ListFiles status={status} />,
      desc: 'Queries specific directories to output tree listings.',
    },
    {
      id: 'run_code',
      name: 'run_code',
      title: 'TOOL 06: MULTI-LANG RUNTIME',
      component: (status: ToolStatus) => <RunCode status={status} />,
      desc: 'Evaluates and executes active python/javascript syntax frames.',
    },
    {
      id: 'remember_fact',
      name: 'remember_fact',
      title: 'TOOL 07: MEMORY FACT WRITE',
      component: (status: ToolStatus) => <RememberRecallFact status={status} />,
      desc: 'Stores key-value data nodes within SODA OS memory cluster.',
    },
    {
      id: 'recall_facts',
      name: 'recall_facts',
      title: 'TOOL 08: MEMORY FACT READ',
      component: (status: ToolStatus) => <RememberRecallFact status={status} />,
      desc: 'Recalls key-value data nodes within SODA OS memory cluster.',
    },
    {
      id: 'set_reminder',
      name: 'set_reminder',
      title: 'TOOL 09: SCHEDULER ALARM',
      component: (status: ToolStatus) => <SetReminder status={status} />,
      desc: 'Spawns local tracking reminders and countdown telemetry.',
    },
    {
      id: 'network_info',
      name: 'get_network_info',
      title: 'TOOL 10: NETWORK ROUTER DIAG',
      component: (status: ToolStatus) => <GetNetworkInfo status={status} />,
      desc: 'Exposes telemetry matching localized IP and gateway channels.',
    },
    {
      id: 'screenshot',
      name: 'screenshot',
      title: 'TOOL 11: VIEWPORT CAPTURE',
      component: (status: ToolStatus) => <Screenshot status={status} />,
      desc: 'Takes screen-frame buffers of the active display matrix.',
    },
    {
      id: 'open_app',
      name: 'open_app',
      title: 'TOOL 12: SERVICE SPARKER',
      component: (status: ToolStatus) => <AppControl status={status} mode="open" />,
      desc: 'Initiates binary process and binds execution threads.',
    },
    {
      id: 'close_window',
      name: 'close_window',
      title: 'TOOL 13: SERVICE TERMINATOR',
      component: (status: ToolStatus) => <AppControl status={status} mode="close" />,
      desc: 'Force terminates open thread wrappers safely.',
    },
  ];

  // Filters tools list according to selected category or search keyword
  const filteredTools = toolList.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tool.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = globalStatusFilter === 'all' || statuses[tool.id] === globalStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#04080b',
      backgroundImage: `
        linear-gradient(rgba(0, 251, 251, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 251, 251, 0.02) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px',
      color: '#dbe4e3',
      fontFamily: "'JetBrains Mono', monospace",
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      {/* SODA OS HEADER CONSOLE */}
      <header style={{
        borderBottom: '1px solid rgba(0, 251, 251, 0.15)',
        paddingBottom: '16px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#00fbfb',
              boxShadow: '0 0 8px #00fbfb',
              borderRadius: '0',
            }} />
            <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.2em', color: '#00fbfb' }}>SODA CONTROL GRID</span>
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '36px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            margin: '4px 0 0 0',
            lineHeight: 1.1,
          }}>
            SODA_TACTICAL_HUD
          </h1>
          <p style={{ fontSize: '12px', color: '#839493', margin: '4px 0 0 0', opacity: 0.8 }}>
            System state viewer for Google Stitch generated HUD layouts. Click individual chips to toggle state flags.
          </p>
        </div>

        {/* Real-time Telemetry values clock */}
        <div style={{
          textAlign: 'right',
          borderLeft: '2px solid rgba(0, 251, 251, 0.2)',
          paddingLeft: '16px',
        }}>
          <span style={{ fontSize: '10px', color: '#00fbfb', opacity: 0.5, display: 'block', letterSpacing: '0.05em' }}>
            SYSTEM TIME DIRECT STREAM / UTC
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#dbe4e3',
          }}>
            {currentTime}
          </span>
        </div>
      </header>

      {/* DASHBOARD MASTER CONTROL INTERACTION DECK */}
      <section style={{
        backgroundColor: 'rgba(4, 8, 11, 0.95)',
        border: '1px solid rgba(0, 251, 251, 0.13)',
        padding: '16px',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Status filtering tools */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00fbfb', opacity: 0.6 }}>FILTER STATUS:</span>
          {(['all', 'done', 'running', 'pending', 'error'] as const).map(f => (
            <button
              key={f}
              onClick={() => setGlobalStatusFilter(f)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '4px 10px',
                border: `1px solid ${globalStatusFilter === f ? '#00fbfb' : 'rgba(0,251,251,0.15)'}`,
                backgroundColor: globalStatusFilter === f ? 'rgba(0,251,251,0.12)' : 'rgba(0,0,0,0.5)',
                color: globalStatusFilter === f ? '#00fbfb' : '#839493',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Global status assignment bypass */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00fbfb', opacity: 0.6 }}>BATCH FORCE STATE:</span>
          {(['done', 'running', 'pending', 'error'] as const).map(target => (
            <button
              key={target}
              onClick={() => forceAllStatuses(target)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                fontWeight: 'bold',
                padding: '4px 8px',
                border: '1px solid rgba(0, 251, 251, 0.25)',
                color: target === 'error' ? '#ffb4ab' : target === 'done' ? '#28c840' : '#00fbfb',
                backgroundColor: 'rgba(0,0,0,0.4)',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,251,251,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'; }}
            >
              All {target}
            </button>
          ))}
        </div>

        {/* Live Search text input filter */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00fbfb', opacity: 0.6 }}>SEARCH:</span>
          <input
            type="text"
            placeholder="Search API tool keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              backgroundColor: 'rgba(4, 8, 11, 0.4)',
              border: '1px solid rgba(0, 251, 251, 0.3)',
              color: '#ffffff',
              padding: '4px 8px',
              outline: 'none',
              width: '180px',
            }}
          />
        </div>
      </section>

      {/* TACTICAL HUD MODULES RENDERING GRID */}
      <h2 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#00fbfb',
        borderBottom: '1px solid rgba(0, 251, 251, 0.08)',
        paddingBottom: '8px',
        marginBottom: '20px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        LIVE_SUITE_CHANNELS ({filteredTools.length} MODULES DETECTED)
      </h2>

      {filteredTools.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          border: '1px dashed rgba(255, 180, 171, 0.3)',
          backgroundColor: 'rgba(255, 180, 171, 0.02)',
          color: '#ffb4ab',
        }}>
          &gt; SIGNAL FAULT: No active HUD modules matched selection telemetry. Reset search filters.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
          {filteredTools.map(tool => {
            const currentStatus = statuses[tool.id];
            const isError = currentStatus === 'error';
            const statusColor = isError ? '#ffb4ab' : currentStatus === 'done' ? '#28c840' : '#00fbfb';

            return (
              <div
                key={tool.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'center',
                  background: 'rgba(4, 8, 11, 0.2)',
                  border: '1px solid rgba(0, 251, 251, 0.04)',
                  padding: '16px',
                  position: 'relative',
                }}
              >
                {/* SODA Frame Header decorations */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '320px',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(0,251,251,0.06)',
                  paddingBottom: '8px',
                  marginBottom: '4px',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff' }}>{tool.title}</span>
                    <span style={{ fontSize: '9px', color: '#839493' }}>{tool.name}</span>
                  </div>

                  {/* Status clicker toggle device to showcase design */}
                  <button
                    onClick={() => cycleStatus(tool.id)}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: statusColor,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      border: `1px solid ${statusColor}44`,
                      padding: '3px 6px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                    title="Click to cycle status: pending -> running -> done -> error"
                  >
                    STATUS: {currentStatus}
                  </button>
                </div>

                {/* SODA Canvas Card implementation element */}
                <div style={{ position: 'relative' }}>
                  {tool.component(currentStatus)}
                </div>

                {/* Info and helper deck under tool */}
                <div style={{ width: '320px', fontSize: '9.5px', color: '#839493', lineHeight: '1.4' }}>
                  <span style={{ color: '#00fbfb', fontWeight: 'bold' }}>INFO: </span>
                  {tool.desc}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SODA HUD FOOTER CONTROLLER TELEMETRY LAYER */}
      <footer style={{
        marginTop: '64px',
        borderTop: '1px solid rgba(0, 251, 251, 0.15)',
        paddingTop: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: '#839493',
      }}>
        <span>SODA TACTICAL CONSOLE COCKPIT INTERACTIVE PLATFORM</span>
        <span>STITCH DESIGN SPEC v2.4.0_STABLE</span>
      </footer>
    </div>
  );
}
