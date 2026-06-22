import { useState, useRef, useEffect, useCallback } from 'react'

export default function WebviewWindow({ webviewRef, url, id }) {
  const [currentUrl, setCurrentUrl] = useState(url)
  const [loading, setLoading] = useState(true)
  const navRef = useRef(null)
  const urlInputRef = useRef(null)
  const iframeRef = useRef(null)

  const handleBack = useCallback(() => {
    try { iframeRef.current?.contentWindow?.history?.back() } catch {}
  }, [])

  const handleForward = useCallback(() => {
    try { iframeRef.current?.contentWindow?.history?.forward() } catch {}
  }, [])

  const handleReload = useCallback(() => {
    if (iframeRef.current) iframeRef.current.src = iframeRef.current.src
  }, [])

  const handleUrlSubmit = useCallback((e) => {
    e.preventDefault()
    let inputUrl = urlInputRef.current?.value || currentUrl
    if (!/^https?:\/\//i.test(inputUrl)) inputUrl = 'https://' + inputUrl
    setCurrentUrl(inputUrl)
    if (iframeRef.current) iframeRef.current.src = inputUrl
  }, [currentUrl])

  const handleIframeLoad = useCallback(() => {
    try {
      const src = iframeRef.current?.contentWindow?.location?.href
      if (src && src !== 'about:blank') setCurrentUrl(src)
    } catch {}
    setLoading(false)
  }, [])

  if (webviewRef) webviewRef.current = iframeRef.current

  return (
    <div className="webview-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="webview-toolbar" ref={navRef}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px',
          background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(0,251,251,0.15)',
          flexShrink: 0,
        }}
      >
        <button className="webview-nav-btn" onClick={handleBack}
          style={{ cursor: 'pointer' }}>◀</button>
        <button className="webview-nav-btn" onClick={handleForward}
          style={{ cursor: 'pointer' }}>▶</button>
        <button className="webview-nav-btn" onClick={handleReload}
          style={{ cursor: 'pointer' }}>
          {loading ? '◉' : '⟳'}
        </button>
        <form onSubmit={handleUrlSubmit} style={{ flex: 1, margin: 0 }}>
          <input ref={urlInputRef} defaultValue={currentUrl}
            className="webview-url-input"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,251,251,0.2)',
              borderRadius: 3, color: '#c8c8c8', fontSize: 11, padding: '2px 6px',
              fontFamily: 'inherit', outline: 'none',
            }}
          />
        </form>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          ref={iframeRef}
          src={url}
          title="webview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  )
}
