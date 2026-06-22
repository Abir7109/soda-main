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

  async executeJS(id, _code) {
    const el = this.webviews.get(id)
    if (!el) return { error: 'webview_not_found' }
    try {
      if (el.contentWindow) {
        const origin = el.src ? new URL(el.src).origin : ''
        if (origin && origin !== window.location.origin) {
          return { error: 'cannot execute JS in cross-origin iframe' }
        }
      }
    } catch {}
    return { error: 'executeJS not supported in browser iframe mode' }
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
    const el = this.webviews.get(id)
    if (!el) return { error: 'webview_not_found' }
    try {
      const src = el.src
      return { success: true, result: { url: src || '', title: el.title || '' } }
    } catch { return { error: 'failed to get url' } }
  }

  async goBack(id) {
    const el = this.webviews.get(id)
    if (!el) return { error: 'webview_not_found' }
    try { el.contentWindow?.history?.back(); return { success: true } }
    catch { return { error: 'cannot go back' } }
  }

  async goForward(id) {
    const el = this.webviews.get(id)
    if (!el) return { error: 'webview_not_found' }
    try { el.contentWindow?.history?.forward(); return { success: true } }
    catch { return { error: 'cannot go forward' } }
  }

  async navigate(id, url) {
    const el = this.webviews.get(id)
    if (!el) return { error: 'webview_not_found' }
    el.src = url
    return new Promise((resolve) => {
      const handler = () => {
        el.removeEventListener('load', handler)
        resolve({ success: true, url: el.src })
      }
      el.addEventListener('load', handler)
    })
  }

  async waitForLoad(id, timeoutMs = 10000) {
    const el = this.webviews.get(id)
    if (!el) return { error: 'webview_not_found' }
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve({ success: false, error: 'timeout' }), timeoutMs)
      const handler = () => {
        clearTimeout(timer)
        el.removeEventListener('load', handler)
        resolve({ success: true, url: el.src })
      }
      el.addEventListener('load', handler)
    })
  }
}

const instance = new WebviewActionService()
export default instance
