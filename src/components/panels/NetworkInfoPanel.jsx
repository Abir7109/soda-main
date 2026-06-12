import SlidePanel from '../SlidePanel'
import { Wifi } from 'lucide-react'

export default function NetworkInfoPanel({ visible, data, onClose }) {
  if (!data) return null
  if (data.error) {
    return (
      <SlidePanel visible={visible} direction="top" title="NETWORK" icon={<Wifi size={11} />}
        accentColor="#00fbfb" onClose={onClose} autoDismissMs={0}>
        <div className="sp-empty">{data.error}</div>
      </SlidePanel>
    )
  }

  const ip = data.ip || data.query || '--'
  const city = data.city || '--'
  const region = data.region || ''
  const country = data.country || data.country_name || '--'
  const org = data.org || data.isp || ''
  const loc = data.loc || data.location || ''
  const timezone = data.timezone || ''

  return (
    <SlidePanel visible={visible} direction="top" title="NETWORK" icon={<Wifi size={11} />}
      accentColor="#00fbfb" onClose={onClose} autoDismissMs={0}>
      <div className="sp-network-panel">
        <div className="sp-network-ip">
          <svg viewBox="0 0 50 50" width="40" height="40" style={{ animation: 'soda-pin-bounce 2s ease-in-out infinite' }}>
            <circle cx="25" cy="20" r="12" fill="none" stroke="#00fbfb" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="25" cy="20" r="8" fill="none" stroke="#00fbfb" strokeWidth="0.8" strokeOpacity="0.2" />
            <circle cx="25" cy="18" r="4" fill="#00fbfb" fillOpacity="0.3" />
            <polygon points="25,22 22,30 28,30" fill="#00fbfb" fillOpacity="0.3" />
          </svg>
          <div className="sp-network-ip-text">{ip}</div>
        </div>
        <div className="sp-network-details">
          <div className="sp-network-row">
            <span className="sp-network-label">Location</span>
            <span className="sp-network-value">{[city, region, country].filter(Boolean).join(', ')}</span>
          </div>
          {org && (
            <div className="sp-network-row">
              <span className="sp-network-label">ISP</span>
              <span className="sp-network-value">{org}</span>
            </div>
          )}
          {timezone && (
            <div className="sp-network-row">
              <span className="sp-network-label">Timezone</span>
              <span className="sp-network-value">{timezone}</span>
            </div>
          )}
          {loc && (
            <div className="sp-network-row">
              <span className="sp-network-label">Coords</span>
              <span className="sp-network-value">{loc}</span>
            </div>
          )}
        </div>
      </div>
    </SlidePanel>
  )
}
