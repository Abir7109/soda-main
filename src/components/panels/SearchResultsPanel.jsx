import { useEffect, useRef, useState, useCallback } from 'react'
import SlidePanel from '../SlidePanel'
import { Search } from 'lucide-react'

export default function SearchResultsPanel({ visible, query, results, onClose, onOpenUrl }) {
  const scrollRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const autoScrollRef = useRef(true)

  const stopAutoScroll = useCallback(() => {
    setAutoScroll(false)
    autoScrollRef.current = false
  }, [])

  useEffect(() => {
    if (!visible || !results || results.length === 0) return
    autoScrollRef.current = true
    setAutoScroll(true)

    const el = scrollRef.current
    if (!el) return

    let scrollIndex = 0
    const itemEls = () => el.querySelectorAll('.sp-result-card')
    let timer

    const step = () => {
      if (!autoScrollRef.current) return
      const cards = itemEls()
      if (scrollIndex >= cards.length) return
      cards[scrollIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      scrollIndex++
      timer = setTimeout(step, 600)
    }

    timer = setTimeout(step, 400)
    return () => clearTimeout(timer)
  }, [visible, results])

  return (
    <SlidePanel
      visible={visible}
      direction="right"
      title="SEARCH RESULTS"
      icon={<Search size={11} />}
      accentColor="#00fbfb"
      onClose={onClose}
      autoDismissMs={0}
    >
      {query && (
        <div className="sp-search-query">
          <span className="sp-label">QUERY</span>
          <span className="sp-value">{query}</span>
        </div>
      )}

      <div ref={scrollRef} onMouseDown={stopAutoScroll} onTouchStart={stopAutoScroll}
        style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {!results || results.length === 0 ? (
          <div className="sp-empty">Searching...</div>
        ) : (
          <div className="sp-results-list">
            {results.map((r, i) => (
              <div key={i} className="sp-result-card" onClick={() => {
                if (r.url && onOpenUrl) onOpenUrl(r.url)
              }}>
                <div className="sp-result-number">{i + 1}</div>
                <div className="sp-result-content">
                  <div className="sp-result-title">{r.title || 'Untitled'}</div>
                  {r.url && <div className="sp-result-url">{r.url}</div>}
                  {r.snippet && <div className="sp-result-snippet">{r.snippet}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {results && results.length > 0 && (
        <div className="sp-search-prompt">
          {autoScroll ? 'Auto-scrolling — touch to stop · ' : ''}
          Click a result or tell SODA which one to open
        </div>
      )}
    </SlidePanel>
  )
}
