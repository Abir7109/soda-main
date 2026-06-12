import { useEffect, useState } from 'react'
import socket from '../services/SocketService'
import Sound from '../services/SoundService'
import { Cpu, MemoryStick, HardDrive, Battery, Activity } from 'lucide-react'

function fmtBytes(mb) {
  if (mb == null) return '—'
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)}G`
  return `${mb.toFixed(0)}M`
}

export default function SystemStatsWidget() {
  const [stats, setStats] = useState(null)
  const [expanded, setExpanded] = useState(true)
  const [lastFetch, setLastFetch] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchStats = () => {
      if (!socket.connected) return
      socket.emit('force_tool', { tool: 'get_system_status', args: {} })
    }
    const onResult = (data) => {
      if (!mounted || !data || data.tool !== 'get_system_status') return
      const r = data.result || {}
      setStats(r)
      setLastFetch(Date.now())
    }
    socket.on('tool_result', onResult)
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
      socket.off('tool_result', onResult)
    }
  }, [])

  if (!stats) {
    return (
      <div className="stats-widget">
        <div className="stats-widget-header">
          <Activity size={10} />
          <span>STATS</span>
        </div>
        <div className="stats-widget-empty">collecting...</div>
      </div>
    )
  }

  const ramPct = stats.ram_percent || 0
  const diskPct = stats.disk_percent || 0
  const batPct = stats.battery_percent
  const charging = stats.battery_charging

  return (
    <div className="stats-widget">
      <div className="stats-widget-header" onClick={() => Sound.click() || setExpanded(p => !p)}>
        <Activity size={10} />
        <span>SYSTEM</span>
        {lastFetch && <span className="stats-widget-age">{Math.floor((Date.now() - lastFetch) / 1000)}s</span>}
      </div>
      {expanded && (
        <div className="stats-widget-body">
          <div className="stats-row">
            <Cpu size={10} />
            <span className="stats-label">CPU</span>
            <span className="stats-value">{stats.cpu_count || '—'}c</span>
          </div>
          <div className="stats-row">
            <MemoryStick size={10} />
            <span className="stats-label">RAM</span>
            <span className="stats-value">{fmtBytes(stats.ram_used_gb)}/{fmtBytes(stats.ram_total_gb)}</span>
            <div className="stats-bar" style={{ '--pct': `${ramPct}%` }} />
          </div>
          <div className="stats-row">
            <HardDrive size={10} />
            <span className="stats-label">DSK</span>
            <span className="stats-value">{fmtBytes(stats.disk_used_gb)}/{fmtBytes(stats.disk_total_gb)}</span>
            <div className="stats-bar" style={{ '--pct': `${diskPct}%` }} />
          </div>
          {batPct != null && (
            <div className="stats-row">
              <Battery size={10} />
              <span className="stats-label">BAT</span>
              <span className="stats-value">{batPct}%{charging ? '⚡' : ''}</span>
              <div className="stats-bar" style={{ '--pct': `${batPct}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
