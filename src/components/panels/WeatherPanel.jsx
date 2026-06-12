import SlidePanel from '../SlidePanel'
import { Cloud } from 'lucide-react'

export default function WeatherPanel({ visible, data, onClose }) {
  if (!data) return null
  if (data.error) {
    return (
      <SlidePanel visible={visible} direction="top" title="WEATHER" icon={<Cloud size={11} />}
        accentColor="#00fbfb" onClose={onClose} autoDismissMs={0}>
        <div className="sp-empty">{data.error}</div>
      </SlidePanel>
    )
  }

  const temp = data.temperature != null ? Math.round(data.temperature) : '--'
  const feels = data.feels_like != null ? Math.round(data.feels_like) : '--'
  const humidity = data.humidity ?? '--'
  const wind = data.wind_speed ?? '--'
  const location = data.location || 'Unknown'

  return (
    <SlidePanel visible={visible} direction="top" title="WEATHER" icon={<Cloud size={11} />}
      accentColor="#00fbfb" onClose={onClose} autoDismissMs={0}>
      <div className="sp-weather-panel">
        <div className="sp-weather-main">
          <div className="sp-weather-icon-wrap">
            <svg viewBox="0 0 60 60" width="60" height="60">
              <circle cx="25" cy="28" r="10" fill="#00fbfb" fillOpacity="0.2" stroke="#00fbfb" strokeWidth="1.5" strokeOpacity="0.6"
                style={{ animation: 'soda-sun-rotate 8s linear infinite', transformOrigin: '25px 28px' }} />
              {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const rad = (deg * Math.PI) / 180
                return <line key={i} x1={25 + 13 * Math.cos(rad)} y1={28 + 13 * Math.sin(rad)}
                  x2={25 + 17 * Math.cos(rad)} y2={28 + 17 * Math.sin(rad)}
                  stroke="#00fbfb" strokeWidth="1.5" strokeOpacity="0.4" />
              })}
              <g style={{ animation: 'soda-cloud-drift 4s ease-in-out infinite' }}>
                <circle cx="42" cy="25" r="6" fill="#00fbfb" fillOpacity="0.08" />
                <circle cx="48" cy="23" r="8" fill="#00fbfb" fillOpacity="0.06" />
                <circle cx="54" cy="26" r="5" fill="#00fbfb" fillOpacity="0.08" />
              </g>
            </svg>
          </div>
          <div className="sp-weather-temp">{temp}°C</div>
          <div className="sp-weather-location">{location}</div>
        </div>
        <div className="sp-weather-details">
          <div className="sp-weather-detail">
            <span className="sp-weather-detail-label">Feels like</span>
            <span className="sp-weather-detail-value">{feels}°</span>
          </div>
          <div className="sp-weather-detail">
            <span className="sp-weather-detail-label">Humidity</span>
            <span className="sp-weather-detail-value">{humidity}%</span>
          </div>
          <div className="sp-weather-detail">
            <span className="sp-weather-detail-label">Wind</span>
            <span className="sp-weather-detail-value">{wind} km/h</span>
          </div>
          {data.weather_code != null && (
            <div className="sp-weather-detail">
              <span className="sp-weather-detail-label">Code</span>
              <span className="sp-weather-detail-value">{data.weather_code}</span>
            </div>
          )}
        </div>
      </div>
    </SlidePanel>
  )
}
