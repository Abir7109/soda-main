import { useState, useEffect, useRef, useCallback } from 'react'
import SlidePanel from '../SlidePanel'
import { Wrench } from 'lucide-react'

const TOOL_CARDS = [
  { name: 'open_app', label: 'Open App', icon: '📱', desc: 'Launch any application' },
  { name: 'open_browser', label: 'Browse Web', icon: '🌐', desc: 'Open websites & search' },
  { name: 'search_youtube', label: 'YouTube', icon: '🎬', desc: 'Search & play videos' },
  { name: 'web_search_live', label: 'Live Search', icon: '🔍', desc: 'Real-time internet search' },
  { name: 'browse_webpage', label: 'Read Page', icon: '📖', desc: 'Summarize any webpage' },
  { name: 'list_files', label: 'File Browser', icon: '📂', desc: 'Navigate drives & folders' },
  { name: 'open_file', label: 'Open File', icon: '📄', desc: 'Open any file' },
  { name: 'write_file', label: 'Write File', icon: '✏️', desc: 'Create or edit files' },
  { name: 'read_file', label: 'Read File', icon: '📚', desc: 'Read file contents' },
  { name: 'terminal_execute', label: 'Terminal', icon: '💻', desc: 'Run shell commands' },
  { name: 'run_code', label: 'Run Code', icon: '⚡', desc: 'Execute Python/JS' },
  { name: 'control_system', label: 'System Control', icon: '🎛️', desc: 'Volume, brightness, etc.' },
  { name: 'clipboard_read', label: 'Read Clipboard', icon: '📋', desc: 'Paste from clipboard' },
  { name: 'clipboard_write', label: 'Copy to Clipboard', icon: '📎', desc: 'Copy text' },
  { name: 'screenshot', label: 'Screenshot', icon: '📸', desc: 'Capture screen' },
  { name: 'list_processes', label: 'Processes', icon: '📊', desc: 'Top running apps' },
  { name: 'analyze_screen', label: 'Analyze Screen', icon: '👁️', desc: 'AI vision on screen' },
  { name: 'read_screen_text', label: 'OCR Screen', icon: '🔤', desc: 'Read text from screen' },
  { name: 'remember_fact', label: 'Remember', icon: '🧠', desc: 'Store a fact' },
  { name: 'recall_facts', label: 'Recall', icon: '💡', desc: 'Retrieve facts' },
  { name: 'get_user_profile', label: 'Profile', icon: '👤', desc: 'User info' },
  { name: 'set_preference', label: 'Preferences', icon: '⚙️', desc: 'Save settings' },
  { name: 'set_reminder', label: 'Reminder', icon: '⏰', desc: 'Schedule reminders' },
  { name: 'get_weather', label: 'Weather', icon: '🌤️', desc: 'Current weather' },
  { name: 'get_news', label: 'News', icon: '📰', desc: 'Latest headlines' },
  { name: 'get_exchange_rate', label: 'Currency', icon: '💱', desc: 'Exchange rates' },
  { name: 'define_word', label: 'Define', icon: '📖', desc: 'Word definitions' },
  { name: 'get_wikipedia_summary', label: 'Wikipedia', icon: '📚', desc: 'Wikipedia summaries' },
  { name: 'send_whatsapp', label: 'WhatsApp', icon: '💬', desc: 'Send messages' },
  { name: 'send_discord', label: 'Discord', icon: '🎮', desc: 'Send messages' },
  { name: 'close_window', label: 'Close App', icon: '❌', desc: 'Close any app' },
  { name: 'close_panel', label: 'Close Panel', icon: '🚫', desc: 'Dismiss HUD panels' },
  { name: 'execute_command', label: 'Execute', icon: '▶️', desc: 'Run system commands' },
  { name: 'get_system_status', label: 'System Status', icon: '📈', desc: 'CPU, RAM, GPU usage' },
]

export default function ToolShowcasePanel({ visible, tools, onClose }) {
  const [revealedCount, setRevealedCount] = useState(0)
  const scrollRef = useRef(null)
  const autoScrollRef = useRef(true)
  const [autoScroll, setAutoScroll] = useState(true)

  const stopAutoScroll = useCallback(() => {
    setAutoScroll(false)
    autoScrollRef.current = false
  }, [])

  // Reveal cards one by one
  useEffect(() => {
    if (!visible) {
      setRevealedCount(0)
      return
    }
    if (!tools || tools.length === 0) return

    setRevealedCount(0)
    autoScrollRef.current = true
    setAutoScroll(true)
    let i = 0
    const interval = setInterval(() => {
      i++
      setRevealedCount(i)
      if (i >= tools.length) clearInterval(interval)
    }, 80)

    return () => clearInterval(interval)
  }, [visible, tools])

  // Auto-scroll after all cards revealed — one smooth pass
  useEffect(() => {
    if (!visible || !tools || revealedCount < tools.length) return

    const el = scrollRef.current
    if (!el) return

    let scrollIndex = 0
    let timer

    const step = () => {
      if (!autoScrollRef.current) return
      const cards = el.querySelectorAll('.sp-showcase-card')
      if (scrollIndex >= cards.length) return
      cards[scrollIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      scrollIndex++
      timer = setTimeout(step, 500)
    }

    timer = setTimeout(step, 400)
    return () => clearTimeout(timer)
  }, [visible, tools, revealedCount])

  if (!tools || tools.length === 0) return null

  return (
    <SlidePanel
      visible={visible}
      direction="right"
      title="SODA TOOLKIT"
      icon={<Wrench size={11} />}
      accentColor="#00fbfb"
      onClose={onClose}
      autoDismissMs={0}
    >
      <div ref={scrollRef} onMouseDown={stopAutoScroll} onTouchStart={stopAutoScroll}
        style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div className="sp-showcase-grid">
          {tools.map((tool, i) => {
            const card = TOOL_CARDS.find(c => c.name === tool.name) || {
              name: tool.name,
              label: tool.name,
              icon: '🔧',
              desc: tool.desc || ''
            }
            const isRevealed = i < revealedCount
            return (
              <div
                key={card.name}
                className={`sp-showcase-card ${isRevealed ? 'revealed' : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="sp-showcase-icon">{card.icon}</div>
                <div className="sp-showcase-label">{card.label}</div>
                <div className="sp-showcase-desc">{card.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="sp-showcase-count">
        {revealedCount} / {tools.length} tools
        {autoScroll && revealedCount >= tools.length ? ' · Auto-scrolling — touch to stop' : ''}
      </div>
    </SlidePanel>
  )
}
