import SlidePanel from '../SlidePanel'
import { Newspaper } from 'lucide-react'

export default function NewsPanel({ visible, data, onClose }) {
  if (!data) return null
  const results = data.results || []
  if (results.length === 0) {
    return (
      <SlidePanel visible={visible} direction="top" title="NEWS" icon={<Newspaper size={11} />}
        accentColor="#ffe2ab" onClose={onClose} autoDismissMs={0}>
        <div className="sp-empty">No news found</div>
      </SlidePanel>
    )
  }

  return (
    <SlidePanel visible={visible} direction="top" title="NEWS" icon={<Newspaper size={11} />}
      accentColor="#ffe2ab" onClose={onClose} autoDismissMs={0}>
      <div className="sp-news-panel">
        {results.slice(0, 5).map((r, i) => (
          <div key={i} className="sp-news-panel-card" onClick={() => r.url && window.open(r.url, '_blank')}
            style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="sp-news-panel-index">{i + 1}</div>
            <div className="sp-news-panel-content">
              <div className="sp-news-panel-title">{r.title}</div>
              {r.description && <div className="sp-news-panel-desc">{r.description}</div>}
              <div className="sp-news-panel-meta">
                {r.source && <span className="sp-news-panel-source">{r.source}</span>}
                {r.published && <span className="sp-news-panel-date">{r.published}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlidePanel>
  )
}
