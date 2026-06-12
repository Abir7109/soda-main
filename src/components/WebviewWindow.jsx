import { useState, useRef, useEffect, useCallback } from 'react'

export default function WebviewWindow({ webviewRef, url, id }) {
  const [currentUrl, setCurrentUrl] = useState(url)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [loading, setLoading] = useState(true)
  const navRef = useRef(null)
  const urlInputRef = useRef(null)

  useEffect(() => {
    const wv = webviewRef.current
    if (!wv) return

    const onNav = (e) => {
      setCurrentUrl(e.url)
      try { setCanGoBack(wv.canGoBack()) } catch {}
      try { setCanGoForward(wv.canGoForward()) } catch {}
      setLoading(false)
    }
    const onStart = () => setLoading(true)
    const onStop = () => setLoading(false)

    wv.addEventListener('did-navigate', onNav)
    wv.addEventListener('did-navigate-in-page', onNav)
    wv.addEventListener('did-start-loading', onStart)
    wv.addEventListener('did-stop-loading', onStop)

    setLoading(true)

    return () => {
      wv.removeEventListener('did-navigate', onNav)
      wv.removeEventListener('did-navigate-in-page', onNav)
      wv.removeEventListener('did-start-loading', onStart)
      wv.removeEventListener('did-stop-loading', onStop)
    }
  }, [webviewRef])

  const handleBack = useCallback(() => {
    const wv = webviewRef.current
    if (wv && wv.canGoBack()) wv.goBack()
  }, [webviewRef])

  const handleForward = useCallback(() => {
    const wv = webviewRef.current
    if (wv && wv.canGoForward()) wv.goForward()
  }, [webviewRef])

  const handleReload = useCallback(() => {
    const wv = webviewRef.current
    if (wv) wv.reload()
  }, [webviewRef])

  const handleUrlSubmit = useCallback((e) => {
    e.preventDefault()
    const wv = webviewRef.current
    if (!wv) return
    let inputUrl = urlInputRef.current?.value || currentUrl
    if (!/^https?:\/\//i.test(inputUrl)) inputUrl = 'https://' + inputUrl
    wv.loadURL(inputUrl)
  }, [webviewRef, currentUrl])

  return (
    <div className="webview-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="webview-toolbar" ref={navRef}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px',
          background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(0,251,251,0.15)',
          flexShrink: 0,
        }}
      >
        <button className="webview-nav-btn" onClick={handleBack} disabled={!canGoBack}
          style={{ opacity: canGoBack ? 1 : 0.3, cursor: canGoBack ? 'pointer' : 'default' }}>
          ◀
        </button>
        <button className="webview-nav-btn" onClick={handleForward} disabled={!canGoForward}
          style={{ opacity: canGoForward ? 1 : 0.3, cursor: canGoForward ? 'pointer' : 'default' }}>
          ▶
        </button>
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
        <webview
          ref={webviewRef}
          src={url}
          style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
          allowpopups
        />
      </div>
    </div>
  )
}
