import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import socket from '../../services/SocketService'
import WebviewActionService from '../../services/WebviewActionService'

const PHASES = [
  { id: 0, name: 'UPLINK INIT',        start: 0,     dur: 3000 },
  { id: 1, name: 'REGION LOCK',        start: 3000,  dur: 4000 },
  { id: 2, name: 'SOURCE UPLINK',      start: 7000,  dur: 5000 },
  { id: 3, name: 'NEWS WALL',          start: 12000, dur: 8000 },
  { id: 4, name: 'SHOWCASE',           start: 20000, dur: Infinity },
  { id: 5, name: 'DIGEST',             start: Infinity, dur: Infinity },
]

const TITLE_TEXT = 'LIVE INTEL NEWSROOM'
const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi']
const DEFAULT_SOURCES = ['Reuters', 'BBC', 'Al Jazeera', 'AP News', 'The Daily Star']

const CAT_COLORS = {
  bangladesh: 'bangladesh', politics: 'politics', weather: 'weather',
  economy: 'economy', sports: 'sports', technology: 'technology', world: 'world',
}

function getCategory(raw) {
  const r = (raw || '').toLowerCase()
  for (const [k] of Object.entries(CAT_COLORS)) {
    if (r.includes(k)) return CAT_COLORS[k]
  }
  return 'world'
}

function getImpact(idx, total) {
  if (idx === 0) return 'high'
  if (idx < total * 0.3) return 'high'
  if (idx < total * 0.7) return 'medium'
  return 'low'
}

export default function WorkflowNewsBriefing({ data, onComplete }) {
  const [ctrlArticleIdx, setCtrlArticleIdx] = useState(0)
  const [switching, setSwitching] = useState(false)
  const [showcaseActive, setShowcaseActive] = useState(false)
  const tids = useRef([])
  const rafs = useRef([])
  const hudRef = useRef(null)
  const webviewRef = useRef(null)
  const currentPid = useRef(-1)
  const startTime = useRef(0)
  const titleIdx = useRef(0)
  const dataRef = useRef(data)
  dataRef.current = data
  const shutdownRef = useRef(false)
  const safetyTimerRef = useRef(null)
  const ctrlArticleIdxRef = useRef(0)
  const showcaseActiveRef = useRef(false)
  const WEBVIEW_ID = 'news-briefing'

  const articles = data?.articles || []
  const query = data?.query || ''

  const articleSources = useMemo(() => {
    const seen = new Set()
    const sources = []
    for (const a of articles) {
      const s = (a.source || '').trim()
      if (s && !seen.has(s.toLowerCase())) {
        seen.add(s.toLowerCase())
        sources.push(s)
      }
    }
    return sources.length ? sources : DEFAULT_SOURCES
  }, [articles])

  const sourcesRef = useRef(articleSources)
  sourcesRef.current = articleSources

  const ct = useCallback((fn, delay) => {
    if (shutdownRef.current) return -1
    const id = setTimeout(fn, delay)
    tids.current.push(id)
    return id
  }, [])

  useEffect(() => {
    return () => {
      shutdownRef.current = true
      tids.current.forEach(clearTimeout)
      rafs.current.forEach(cancelAnimationFrame)
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    }
  }, [])

  const activeArticle = ctrlArticleIdx >= 0 && articles.length > 0
    ? articles[Math.min(ctrlArticleIdx, articles.length - 1)]
    : null

  useEffect(() => {
    console.log('[NewsBriefing] MOUNT', Date.now())
    return () => console.log('[NewsBriefing] UNMOUNT', Date.now())
  }, [])

  useEffect(() => {
    if (!activeArticle?.url) return
    const hasExisting = !!webviewRef.current?.querySelector('iframe.wfn-article-frame')
    if (hasExisting) setSwitching(true)
    const tid = setTimeout(() => {
      const container = webviewRef.current
      if (!container) return
      const old = container.querySelector('iframe.wfn-article-frame')
      if (old) {
        WebviewActionService.unregister(WEBVIEW_ID)
        old.remove()
      }
      const ifr = document.createElement('iframe')
      ifr.src = activeArticle.url
      ifr.className = 'wfn-article-frame'
      ifr.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups')
      ifr.style.width = '100%'
      ifr.style.height = '100%'
      ifr.style.border = 'none'
      ifr.style.background = '#fff'
      container.appendChild(ifr)
      WebviewActionService.register(WEBVIEW_ID, ifr)
      setSwitching(false)
    }, hasExisting ? 350 : 50)
    return () => { clearTimeout(tid); setSwitching(false) }
  }, [activeArticle])

  function resetSafetyTimer() {
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    if (shutdownRef.current) return
    const items = dataRef.current?.articles || []
    if (!showcaseActiveRef.current || items.length === 0) return
    safetyTimerRef.current = setTimeout(() => {
      if (shutdownRef.current) return
      const idx = ctrlArticleIdxRef.current
      if (idx < items.length - 1) {
        setCtrlArticleIdx(idx + 1)
        ctrlArticleIdxRef.current = idx + 1
        resetSafetyTimer()
      } else if (currentPid.current < 5) {
        setShowcaseActive(false)
        showcaseActiveRef.current = false
        hide(e('.wfn-showcase'))
        show(e('.wfn-digest'))
        populateDigest()
        currentPid.current = 5
        ct(() => { if (onComplete) onComplete() }, 6000)
      }
    }, 20000)
  }

  useEffect(() => {
    if (showcaseActive) {
      showcaseActiveRef.current = true
      resetSafetyTimer()
    } else {
      showcaseActiveRef.current = false
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    }
  }, [showcaseActive])

  const e = (sel) => hudRef.current && hudRef.current.querySelector(sel)

  function show(el) { if (el) el.classList.add('active') }
  function hide(el) { if (el) el.classList.remove('active') }

  function populateWall() {
    const grid = e('.wfn-wall-grid')
    if (!grid) return
    grid.innerHTML = ''
    const items = dataRef.current?.articles || []
    if (!items.length) {
      grid.innerHTML = '<div style="color:rgba(0,240,255,0.15);font-size:11px;text-align:center;padding:40px;letter-spacing:2px">NO STORIES FOUND</div>'
      return
    }
    items.slice(0, 8).forEach((a, i) => {
      const card = document.createElement('div')
      const cat = getCategory(a.category || a.source)
      const imp = getImpact(i, items.length)
      card.className = 'wfn-card'
      card.innerHTML = `
        <span class="wfn-cat ${cat}">${(a.category || 'World').toUpperCase()}</span>
        <div class="wfn-headline">${a.title || ''}</div>
        <div class="wfn-meta"><span>${a.source || ''}</span><span>${formatTime(a.published)}</span></div>
        <span class="wfn-impact ${imp}">${imp.toUpperCase()}</span>
      `
      grid.appendChild(card)
      ct(() => card.classList.add('active'), i * 200 + 200)
    })
  }

  function populateDigest() {
    const items = dataRef.current?.articles || []
    const total = e('.wfn-digest .total')
    if (total) total.textContent = String(items.length)
  }

  function startTitleType() {
    const el = e('.wfn-title .text')
    if (!el) return
    el.textContent = ''
    titleIdx.current = 0
    function type() {
      if (titleIdx.current < TITLE_TEXT.length) {
        el.textContent += TITLE_TEXT[titleIdx.current]
        titleIdx.current++
        ct(type, 60)
      } else {
        const cur = e('.wfn-title .cursor')
        if (cur) cur.classList.add('done')
      }
    }
    ct(type, 300)
  }

  function activatePhase(pid) {
    currentPid.current = pid
    switch (pid) {
      case 0:
        show(e('.wfn-grid'))
        ct(() => show(e('.wfn-scanline')), 600)
        show(e('.wfn-title'))
        show(e('.wfn-live-tag'))
        show(e('.wfn-showcase'))
        if (query) {
          const q = e('.wfn-query .q')
          if (q) q.textContent = query
          show(e('.wfn-query'))
        }
        startTitleType()
        break
      case 1:
        show(e('.wfn-map-area'))
        CITIES.forEach((c, i) => {
          ct(() => {
            const pin = e(`.wfn-pin.${c.toLowerCase()}`)
            const lab = e(`.wfn-pin-label.${c.toLowerCase()}`)
            if (pin) show(pin)
            if (lab) show(lab)
          }, i * 300)
        })
        break
      case 2:
        hide(e('.wfn-map-area'))
        show(e('.wfn-sources'))
        sourcesRef.current.forEach((s, i) => {
          ct(() => show(e('.wfn-source-row.' + s.toLowerCase().replace(/\s+/g, '-'))), i * 400)
        })
        break
      case 3:
        hide(e('.wfn-sources'))
        show(e('.wfn-wall'))
        populateWall()
        show(e('.wfn-ticker'))
        break
      case 4:
        hide(e('.wfn-wall'))
        ctrlArticleIdxRef.current = 0
        showcaseActiveRef.current = true
        setShowcaseActive(true)
        show(e('.wfn-showcase'))
        setCtrlArticleIdx(0)
        break
      case 5:
        setShowcaseActive(false)
        hide(e('.wfn-showcase'))
        show(e('.wfn-digest'))
        populateDigest()
        ct(() => { if (onComplete) onComplete() }, 6000)
        break
    }
  }

  useEffect(() => {
    startTime.current = performance.now()
    currentPid.current = -1

    function tick(now) {
      try {
        const elapsed = now - startTime.current
        const pid = PHASES.reduce((acc, p) => (elapsed >= p.start ? p.id : acc), 0)
        if (pid !== currentPid.current) {
          activatePhase(pid)
        }
        if (pid < 5) {
          rafs.current.push(requestAnimationFrame(tick))
        }
      } catch (err) {
        console.warn('[news-briefing] tick error:', err)
      }
    }
    rafs.current.push(requestAnimationFrame(tick))

      const handleControl = (payload) => {
        if (!payload || shutdownRef.current) return
        const { action, index } = payload
        const items = dataRef.current?.articles || []

        if (action === 'complete') {
          if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
          if (currentPid.current < 5) {
            setShowcaseActive(false)
            showcaseActiveRef.current = false
            hide(e('.wfn-showcase'))
            show(e('.wfn-digest'))
            populateDigest()
            currentPid.current = 5
            ct(() => { if (onComplete) onComplete() }, 6000)
          }
          return
        }

        if (!items.length) return

        setCtrlArticleIdx(prev => {
          let next
          if (action === 'goto' && typeof index === 'number') {
            next = Math.max(0, Math.min(index, items.length - 1))
          } else if (action === 'next') {
            next = prev < 0 ? 0 : Math.min(prev + 1, items.length - 1)
          } else if (action === 'prev') {
            next = prev <= 0 ? 0 : Math.max(prev - 1, 0)
          } else {
            return prev
          }
          ctrlArticleIdxRef.current = next
          resetSafetyTimer()
          return next
        })
      }

    socket.on('news_briefing_control', handleControl)

    const handleWebviewAction = async (data) => {
      if (!data || !data.id || !data.action) return
      if (data.id !== WEBVIEW_ID) return
      const { action, params } = data
      const wvId = WEBVIEW_ID
      let result
      switch (action) {
        case 'click': result = await WebviewActionService.click(wvId, params?.selector); break
        case 'type': result = await WebviewActionService.type(wvId, params?.selector, params?.text); break
        case 'scroll': result = await WebviewActionService.scroll(wvId, params?.selector, params?.x, params?.y); break
        case 'scrollTo': result = await WebviewActionService.scrollTo(wvId, params?.selector); break
        case 'getContent': result = await WebviewActionService.getContent(wvId); break
        case 'getUrl': result = await WebviewActionService.getUrl(wvId); break
        case 'goBack': result = await WebviewActionService.goBack(wvId); break
        case 'goForward': result = await WebviewActionService.goForward(wvId); break
        case 'navigate': result = await WebviewActionService.navigate(wvId, params?.url); break
        case 'waitForLoad': result = await WebviewActionService.waitForLoad(wvId, params?.timeout); break
        case 'executeJS': result = await WebviewActionService.executeJS(wvId, params?.code); break
        default: result = { error: `unknown action: ${action}` }
      }
      socket.emit('webview_action_result', { id: data.id, action, result })
    }

    socket.on('webview_action', handleWebviewAction)

    return () => {
      WebviewActionService.unregister(WEBVIEW_ID)
      socket.off('news_briefing_control', handleControl)
      socket.off('webview_action', handleWebviewAction)
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
      tids.current.forEach(clearTimeout)
      rafs.current.forEach(cancelAnimationFrame)
      tids.current = []
      rafs.current = []
    }
  }, [])

  const goNext = useCallback(() => {
    if (!articles.length || ctrlArticleIdx < 0) return
    setCtrlArticleIdx(prev => Math.min(prev + 1, articles.length - 1))
  }, [articles.length, ctrlArticleIdx])

  const goPrev = useCallback(() => {
    if (!articles.length || ctrlArticleIdx < 0) return
    setCtrlArticleIdx(prev => Math.max(prev - 1, 0))
  }, [articles.length, ctrlArticleIdx])

  const handleExit = useCallback(() => {
    if (shutdownRef.current) return
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    if (onComplete) onComplete()
  }, [onComplete])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleExit() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleExit])

  function formatTime(pub) {
    if (!pub) return ''
    try {
      const d = new Date(pub)
      const now = Date.now()
      const diff = Math.floor((now - d.getTime()) / 60000)
      if (diff < 60) return diff + 'm ago'
      if (diff < 1440) return Math.floor(diff / 60) + 'h ago'
      return Math.floor(diff / 1440) + 'd ago'
    } catch { return '' }
  }

  return (
    <div className="wfn-hud" ref={hudRef}>
      <div className="wfn-grid"></div>
      <div className="wfn-scanline"></div>

      <button className="wfn-exit-btn" onClick={handleExit}>⊠ EXIT</button>
      <div className="wfn-live-tag"><span className="wfn-live-dot"></span>LIVE</div>
      <div className="wfn-title"><span className="text"></span><span className="cursor"></span></div>
      <div className="wfn-query">QUERY: <span className="q"></span></div>

      <div className="wfn-map-area">
        <div className="wfn-map-outline">🗺</div>
        <div className="wfn-map-label">REGION LOCKED</div>
        {CITIES.map(c => (
          <div key={c}>
            <div className={`wfn-pin ${c.toLowerCase()}`}
              style={{ left: (30 + Math.random() * 60) + '%', top: (20 + Math.random() * 60) + '%' }} />
            <div className={`wfn-pin-label ${c.toLowerCase()}`}
              style={{ left: (30 + Math.random() * 60) + '%', top: (20 + Math.random() * 60 + 8) + '%' }}>{c}</div>
          </div>
        ))}
      </div>

      <div className="wfn-sources">
        {articleSources.map(s => (
          <div key={s} className={`wfn-source-row ${s.toLowerCase().replace(/\s+/g, '-')}`}>
            <span>{s}</span>
            <div className="wfn-source-line"><div className="dot"></div></div>
            <span className="wfn-source-check">● CONNECTED</span>
          </div>
        ))}
      </div>

      <div className="wfn-wall">
        <div className="wfn-wall-grid"></div>
      </div>

      <div className="wfn-showcase">
        {ctrlArticleIdx >= 0 && articles.length > 0 && activeArticle ? (
          <div className="wfn-showcase-panel">
            <div className="wfn-showcase-header">
              <span className="wfn-counter">STORY {ctrlArticleIdx + 1} / {articles.length}</span>
              <span className={`wfn-cat ${getCategory(activeArticle.category || activeArticle.source)}`}>
                {(activeArticle.category || 'World').toUpperCase()}
              </span>
              <span className="wfn-source-label">{activeArticle.source || ''}</span>
              <span className="wfn-time-label">{formatTime(activeArticle.published)}</span>
            </div>
            <div className={`wfn-webview${switching ? ' switching' : ''}`} ref={webviewRef}></div>
            <div className="wfn-showcase-nav">
              <button className="wfn-nav-btn" onClick={goPrev} disabled={ctrlArticleIdx <= 0}>◄ PREV</button>
              <span className="wfn-nav-url">{activeArticle.source || activeArticle.url ? (activeArticle.source || (activeArticle.url || '').replace(/^https?:\/\//, '').substring(0, 40)) : 'No URL'}</span>
              <button className="wfn-nav-btn" onClick={goNext} disabled={ctrlArticleIdx >= articles.length - 1}>NEXT ►</button>
            </div>
          </div>
        ) : ctrlArticleIdx >= 0 && articles.length === 0 ? (
          <div className="wfn-showcase-empty">NO STORIES AVAILABLE — CHECK CONNECTION</div>
        ) : null}
      </div>

      <div className="wfn-digest">
        <div className="title">■ NEWS DIGEST COMPLETE</div>
        <div className="stat">STORIES REVIEWED: <span className="total">0</span></div>
        <div className="stat">SOURCES SCANNED: <span>{articleSources.length}</span></div>
        <div className="stat">OVERALL STATUS: <span style={{color:'var(--wfn-cyan)'}}>MODERATE ACTIVITY</span></div>
      </div>

      <div className="wfn-ticker">
        <div className="wfn-ticker-text">
          {articles.slice(0, 8).map((a, i) => (
            <span key={i}><span className="hl">●</span> {a.title || ''} &nbsp;&nbsp;&nbsp;</span>
          ))}
        </div>
      </div>
    </div>
  )
}
