class WebviewActionService {
  constructor() {
    this.webviews = new Map()
    this.pendingActions = new Map()
  }

  register(id, webviewElement) {
    this.webviews.set(id, webviewElement)
  }

  unregister(id) {
    this.webviews.delete(id)
    this.pendingActions.delete(id)
  }

  get(id) {
    return this.webviews.get(id) || null
  }

  getAllIds() {
    return Array.from(this.webviews.keys())
  }

  async executeJS(id, code) {
    const wv = this.webviews.get(id)
    if (!wv) return { error: 'webview_not_found' }
    try {
      const result = await wv.executeJavaScript(code)
      return { success: true, result }
    } catch (err) {
      return { error: err.message }
    }
  }

  async click(id, selector) {
    return this.executeJS(id, `
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return { error: 'element not found' };
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
        el.click();
        return { success: true, tag: el.tagName, text: (el.textContent || '').trim().slice(0, 100) };
      })()
    `)
  }

  async type(id, selector, text) {
    return this.executeJS(id, `
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return { error: 'element not found' };
        el.focus();
        el.value = '';
        el.value = ${JSON.stringify(text)};
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true };
      })()
    `)
  }

  async scroll(id, selector, x, y) {
    if (selector) {
      return this.executeJS(id, `
        (() => {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return { error: 'element not found' };
          el.scrollBy({ left: ${x || 0}, top: ${y || 200}, behavior: 'smooth' });
          return { success: true, scrollX: el.scrollLeft, scrollY: el.scrollTop };
        })()
      `)
    }
    const dy = y || 200
    return this.executeJS(id, `
      (() => {
        const scrollEl = document.scrollingElement || document.documentElement;
        scrollEl.scrollBy({ left: ${x || 0}, top: ${dy}, behavior: 'smooth' });
        return { success: true, scrollX: window.scrollX, scrollY: window.scrollY };
      })()
    `)
  }

  async scrollTo(id, selector) {
    if (!selector) return this.scroll(id, null, 0, 500)
    return this.executeJS(id, `
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return { error: 'element not found' };
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return { success: true, tag: el.tagName };
      })()
    `)
  }

  async getContent(id) {
    return this.executeJS(id, `
      (() => {
        const scrollEl = document.scrollingElement || document.documentElement;
        return {
          title: document.title,
          url: location.href,
          text: document.body.innerText.slice(0, 8000),
          scrollY: scrollEl.scrollTop,
          scrollHeight: scrollEl.scrollHeight,
          clientHeight: scrollEl.clientHeight,
          links: Array.from(document.querySelectorAll('a[href]')).map(a => ({
            text: (a.textContent || '').trim().slice(0, 80),
            href: a.href
          })).slice(0, 50)
        }
      })()
    `)
  }

  async getUrl(id) {
    return this.executeJS(id, `{ url: location.href, title: document.title }`)
  }

  async goBack(id) {
    return this.executeJS(id, `window.history.back(); { success: true }`)
  }

  async goForward(id) {
    return this.executeJS(id, `window.history.forward(); { success: true }`)
  }

  async navigate(id, url) {
    const wv = this.webviews.get(id)
    if (!wv) return { error: 'webview_not_found' }
    return new Promise((resolve) => {
      const handler = () => {
        wv.removeEventListener('did-finish-load', handler)
        resolve({ success: true, url: wv.getURL(), title: wv.getTitle() })
      }
      wv.addEventListener('did-finish-load', handler)
      wv.loadURL(url)
    })
  }

  async waitForLoad(id, timeoutMs = 10000) {
    const wv = this.webviews.get(id)
    if (!wv) return { error: 'webview_not_found' }
    if (wv.isLoading && !wv.isLoading()) return { success: true, loaded: true }
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve({ success: false, error: 'timeout' }), timeoutMs)
      const handler = () => {
        clearTimeout(timer)
        wv.removeEventListener('did-finish-load', handler)
        resolve({ success: true, url: wv.getURL(), title: wv.getTitle() })
      }
      wv.addEventListener('did-finish-load', handler)
    })
  }
}

const instance = new WebviewActionService()
export default instance
