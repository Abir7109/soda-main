import SlidePanel from '../SlidePanel'
import { Activity, Cpu, MemoryStick, HardDrive, Battery, Monitor, Globe, Terminal } from 'lucide-react'

function GaugeRing({ value, max, label, color = '#00fbfb', size = 70 }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const r = size * 0.4
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference
  return (
    <div className="sp-gauge">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3" strokeOpacity="0.1" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3" strokeOpacity="0.7"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fill={color} fillOpacity="0.9" fontSize={size * 0.14} fontFamily="Space Grotesk" fontWeight="700">
          {Math.round(pct)}%
        </text>
        <text x={size / 2} y={size / 2 + 10} textAnchor="middle" fill={color} fillOpacity="0.45" fontSize={size * 0.07} fontFamily="JetBrains Mono">
          {label}
        </text>
      </svg>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="sp-sys-row">
      <span className="sp-sys-row-icon">{Icon && <Icon size={10} />}</span>
      <span className="sp-sys-row-label">{label}</span>
      <span className="sp-sys-row-value">{value}</span>
    </div>
  )
}

export default function SystemStatusPanel({ visible, data, onClose }) {
  if (!data) return null
  if (data.error) {
    return (
      <SlidePanel visible={visible} direction="right" title="SYSTEM STATUS" icon={<Activity size={11} />}
        accentColor="#00fbfb" onClose={onClose} autoDismissMs={0}>
        <div className="sp-empty">{data.error}</div>
      </SlidePanel>
    )
  }

  const cpu = data.cpu_percent ?? 0
  const ram = data.ram_percent ?? 0
  const disk = data.disk_percent ?? null
  const gpu = data.gpu_percent ?? null
  const battery = data.battery_percent ?? null
  const charging = data.battery_charging ?? null

  return (
    <SlidePanel visible={visible} direction="right" title="SYSTEM STATUS" icon={<Activity size={11} />}
      accentColor="#00fbfb" onClose={onClose} autoDismissMs={0}>
      <div className="sp-sysstatus-panel">
        <div className="sp-sysstatus-gauges">
          <GaugeRing value={cpu} max={100} label="CPU" />
          <GaugeRing value={ram} max={100} label="RAM" />
          {gpu != null && <GaugeRing value={gpu} max={100} label="GPU" color="#ffe2ab" />}
        </div>

        {disk != null && (
          <div className="sp-sysstatus-bar-wrap">
            <div className="sp-sysstatus-bar-label">DISK {Math.round(disk)}%</div>
            <div className="sp-sysstatus-bar">
              <div className="sp-sysstatus-bar-fill" style={{ width: `${disk}%` }} />
            </div>
          </div>
        )}

        {battery != null && (
          <div className="sp-sysstatus-battery">
            <Battery size={12} className={charging ? 'sp-battery-charging' : ''} />
            <span>{Math.round(battery)}%</span>
            {charging && <span className="sp-battery-status">Charging</span>}
          </div>
        )}

        <div className="sp-sysstatus-section">
          <div className="sp-sysstatus-section-title">System</div>
          <InfoRow icon={Monitor} label="OS" value={`${data.os || ''} ${data.os_version ? data.os_version.slice(0, 8) : ''}`} />
          <InfoRow icon={Globe} label="Host" value={data.hostname || '—'} />
          <InfoRow icon={Terminal} label="Python" value={data.python || '—'} />
          {data.machine && <InfoRow icon={Cpu} label="Arch" value={data.machine} />}
        </div>

        <div className="sp-sysstatus-section">
          <div className="sp-sysstatus-section-title">Hardware</div>
          {data.cpu_count && <InfoRow icon={Cpu} label="Cores" value={`${data.cpu_count} CPUs`} />}
          {data.ram_total_gb != null && <InfoRow icon={MemoryStick} label="RAM" value={`${data.ram_total_gb} GB total`} />}
          {data.ram_used_gb != null && <InfoRow icon={MemoryStick} label="Used" value={`${data.ram_used_gb} GB`} />}
          {data.disk_total_gb != null && <InfoRow icon={HardDrive} label="Disk" value={`${data.disk_total_gb} GB total`} />}
          {data.disk_used_gb != null && <InfoRow icon={HardDrive} label="Used" value={`${data.disk_used_gb} GB`} />}
        </div>
      </div>
    </SlidePanel>
  )
}
