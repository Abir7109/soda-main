import SlidePanel from '../SlidePanel'
import { BarChart3 } from 'lucide-react'

export default function ProcessListPanel({ visible, data, onClose }) {
  if (!data) return null
  if (data.error) {
    return (
      <SlidePanel visible={visible} direction="right" title="PROCESSES" icon={<BarChart3 size={11} />}
        accentColor="#00fbfb" onClose={onClose} autoDismissMs={0}>
        <div className="sp-empty">{data.error}</div>
      </SlidePanel>
    )
  }

  const processes = data.processes || data || []
  const list = Array.isArray(processes) ? processes : []

  return (
    <SlidePanel visible={visible} direction="right" title="PROCESSES" icon={<BarChart3 size={11} />}
      accentColor="#00fbfb" onClose={onClose} autoDismissMs={0}>
      <div className="sp-process-panel">
        {list.slice(0, 10).map((p, i) => {
          const name = p.name || p.process || `Process ${i + 1}`
          const mem = p.memory_percent ?? p.memory ?? 0
          const cpu = p.cpu_percent ?? p.cpu ?? 0
          const memBar = Math.min(mem, 100)
          const cpuBar = Math.min(cpu, 100)
          return (
            <div key={i} className="sp-process-row" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="sp-process-name">{name}</div>
              <div className="sp-process-bars">
                <div className="sp-process-bar-wrap">
                  <div className="sp-process-bar-label">MEM</div>
                  <div className="sp-process-bar">
                    <div className="sp-process-bar-fill sp-process-bar-mem" style={{ width: `${memBar}%` }} />
                  </div>
                  <div className="sp-process-bar-value">{mem.toFixed(1)}%</div>
                </div>
                <div className="sp-process-bar-wrap">
                  <div className="sp-process-bar-label">CPU</div>
                  <div className="sp-process-bar">
                    <div className="sp-process-bar-fill sp-process-bar-cpu" style={{ width: `${cpuBar}%` }} />
                  </div>
                  <div className="sp-process-bar-value">{cpu.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </SlidePanel>
  )
}
