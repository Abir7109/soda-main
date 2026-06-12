import SlidePanel from '../SlidePanel'
import { Cloud, Newspaper, Info } from 'lucide-react'

const TYPE_CONFIG = {
  weather: { icon: <Cloud size={11} />, title: 'WEATHER', accent: '#00fbfb' },
  news: { icon: <Newspaper size={11} />, title: 'NEWS', accent: '#ffe2ab' },
  info: { icon: <Info size={11} />, title: 'INFO', accent: '#00fbfb' },
  error: { icon: null, title: 'ERROR', accent: '#ffb4ab' },
}

function formatWeather(data) {
  if (!data) return null
  if (data.error) return <div className="sp-error-text">{data.error}</div>
  return (
    <div className="sp-weather">
      {data.location && <div className="sp-weather-location">{data.location}</div>}
      {data.temperature != null && (
        <div className="sp-weather-temp">{Math.round(data.temperature)}°C</div>
      )}
      <div className="sp-weather-details">
        {data.feels_like != null && <span>Feels like {Math.round(data.feels_like)}°</span>}
        {data.humidity != null && <span>Humidity {data.humidity}%</span>}
        {data.wind_speed != null && <span>Wind {data.wind_speed} km/h</span>}
        {data.weather_code != null && <span>Code {data.weather_code}</span>}
      </div>
    </div>
  )
}

function formatNews(data) {
  if (!data) return null
  const results = data.results || []
  if (results.length === 0) return <div className="sp-empty">No news found</div>
  return (
    <div className="sp-news-list">
      {results.map((r, i) => (
        <div key={i} className="sp-news-card" onClick={() => {
          if (r.url) window.open(r.url, '_blank')
        }}>
          <div className="sp-news-title">{r.title}</div>
          {r.description && <div className="sp-news-desc">{r.description}</div>}
          <div className="sp-news-meta">
            {r.source && <span>{r.source}</span>}
            {r.published && <span>{r.published}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatGeneric(data) {
  if (!data) return <div className="sp-empty">No data</div>
  if (typeof data === 'string') return <pre className="sp-output-pre">{data}</pre>
  return <pre className="sp-output-pre">{JSON.stringify(data, null, 2)}</pre>
}

export default function InfoPanel({ visible, type = 'info', data, onClose }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info

  let content = null
  if (type === 'weather') content = formatWeather(data)
  else if (type === 'news') content = formatNews(data)
  else content = formatGeneric(data)

  return (
    <SlidePanel
      visible={visible}
      direction="top"
      title={config.title}
      icon={config.icon}
      accentColor={config.accent}
      onClose={onClose}
      autoDismissMs={0}
    >
      {content}
    </SlidePanel>
  )
}
