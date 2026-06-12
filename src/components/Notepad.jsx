import { useState, useRef, useCallback, useEffect } from 'react'
import socket from '../services/SocketService'

export default function Notepad({ id, initialTabs = [] }) {
  const [tabs, setTabs] = useState(() => {
    if (initialTabs.length > 0) return initialTabs
    return [{ id: 'tab_1', title: 'notes', content: '', dirty: false }]
  })
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'tab_1')
  const tabCounterRef = useRef(initialTabs.length > 0 ? initialTabs.length + 1 : 2)
  const textareaRef = useRef(null)
  const tabsRef = useRef(tabs)
  tabsRef.current = tabs

  const currentTab = tabs.find(t => t.id === activeTab)

  const updateTab = useCallback((tabId, patch) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, ...patch } : t))
  }, [])

  const handleChange = useCallback((e) => {
    const val = e.target.value
    updateTab(activeTab, { content: val, dirty: true })
  }, [activeTab, updateTab])

  const addTab = useCallback((title) => {
    const newId = 'tab_' + tabCounterRef.current++
    setTabs(prev => [...prev, { id: newId, title: title || 'notes', content: '', dirty: false }])
    setActiveTab(newId)
  }, [])

  const closeTab = useCallback((tabId) => {
    setTabs(prev => {
      const filtered = prev.filter(t => t.id !== tabId)
      if (filtered.length === 0) {
        const newId = 'tab_' + tabCounterRef.current++
        return [{ id: newId, title: 'notes', content: '', dirty: false }]
      }
      return filtered
    })
    setActiveTab(prev => {
      if (prev === tabId) {
        const remaining = tabs.filter(t => t.id !== tabId)
        return remaining.length > 0 ? remaining[0].id : 'tab_1'
      }
      return prev
    })
  }, [tabs])

  const renameTab = useCallback((tabId, newTitle) => {
    updateTab(tabId, { title: newTitle })
  }, [updateTab])

  const saveTab = useCallback(() => {
    if (!currentTab || !currentTab.content.trim()) return
    const filename = currentTab.title.replace(/[^a-zA-Z0-9_-]/g, '_') + '.txt'
    socket.emit('notepad_save', { id, tabId: activeTab, filename, content: currentTab.content })
    updateTab(activeTab, { dirty: false })
  }, [currentTab, activeTab, id, updateTab])

  const saveAllTabs = useCallback(() => {
    tabs.forEach(t => {
      if (!t.content.trim()) return
      const filename = t.title.replace(/[^a-zA-Z0-9_-]/g, '_') + '.txt'
      socket.emit('notepad_save', { id, tabId: t.id, filename, content: t.content })
    })
    setTabs(prev => prev.map(t => ({ ...t, dirty: false })))
  }, [tabs, id])

  // Listen for AI-driven write/read events
  useEffect(() => {
    const onWrite = (data) => {
      if (!data) return
      const tabTitle = data.tab || 'notes'
      const content = data.content || ''
      const mode = data.mode || 'append'
      setTabs(prev => {
        const existing = prev.find(t => t.title === tabTitle)
        if (existing) {
          return prev.map(t =>
            t.title === tabTitle
              ? { ...t, content: mode === 'replace' ? content : t.content + '\n' + content, dirty: true }
              : t
          )
        } else {
          const newId = 'tab_' + tabCounterRef.current++
          const newTab = { id: newId, title: tabTitle, content, dirty: true }
          setActiveTab(newId)
          return [...prev, newTab]
        }
      })
    }

    const onRead = (data) => {
      if (!data || !data.id) return
      const tabTitle = data.tab || ''
      const allTabs = tabsRef.current
      if (tabTitle) {
        const tab = allTabs.find(t => t.title === tabTitle)
        socket.emit('notepad_read_result', { id: data.id, content: tab ? tab.content : `Tab '${tabTitle}' not found` })
      } else {
        const names = allTabs.map(t => t.title).join(', ')
        socket.emit('notepad_read_result', { id: data.id, content: names || 'No tabs' })
      }
    }

    socket.on('notepad_write', onWrite)
    socket.on('notepad_read', onRead)
    return () => {
      socket.off('notepad_write', onWrite)
      socket.off('notepad_read', onRead)
    }
  }, [])

  return (
    <div className="notepad">
      <div className="notepad-tabs">
        <div className="notepad-tabs-scroll">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`notepad-tab ${tab.id === activeTab ? 'notepad-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <input
                className="notepad-tab-title"
                value={tab.title}
                onChange={e => renameTab(tab.id, e.target.value)}
                onClick={e => e.stopPropagation()}
                spellCheck={false}
              />
              {tab.dirty && <span className="notepad-tab-dirty">●</span>}
              <button className="notepad-tab-close" onClick={e => { e.stopPropagation(); closeTab(tab.id) }}>✕</button>
            </div>
          ))}
        </div>
        <button className="notepad-tab-add" onClick={() => addTab()} title="New tab">+</button>
      </div>
      <div className="notepad-body">
        <textarea
          ref={textareaRef}
          className="notepad-textarea"
          value={currentTab?.content || ''}
          onChange={handleChange}
          placeholder="Write notes here..."
          spellCheck={false}
        />
      </div>
      <div className="notepad-footer">
        <span className="notepad-footer-info">
          {currentTab?.content.length || 0} chars
          {currentTab?.dirty ? ' • unsaved' : ' • saved'}
        </span>
        <div className="notepad-footer-actions">
          <button className="notepad-btn" onClick={saveTab} disabled={!currentTab?.dirty}>Save Tab</button>
          <button className="notepad-btn" onClick={saveAllTabs}>Save All</button>
        </div>
      </div>
    </div>
  )
}
