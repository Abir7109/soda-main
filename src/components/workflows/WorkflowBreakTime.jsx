import { useEffect, useRef, useCallback } from 'react'

const PHASES = [
  { id: 0, name: 'STAND DOWN ALERT',       start: 0,    dur: 360  },
  { id: 1, name: 'TITLE SEQUENCE',         start: 360,  dur: 360  },
  { id: 2, name: 'AMBIENT SCENE',          start: 720, dur: 540 },
  { id: 3, name: 'ACTIVITY CARDS',         start: 1260, dur: 540 },
  { id: 4, name: 'MUSIC AMBIENCE',         start: 1800, dur: 540 },
  { id: 5, name: 'COUNTDOWN TIMER',        start: 2340, dur: 1035 },
  { id: 6, name: 'SUMMARY & IDLE',         start: 3375, dur: 1125 },
]

const TOTAL_DURATION = 4500

const ACTIVITIES = [
  { icon: '🧘', title: 'Stretch', time: '2m', desc: 'Loosen up' },
  { icon: '💧', title: 'Hydrate', time: '1m', desc: 'Drink water' },
  { icon: '🚶', title: 'Walk', time: '5m', desc: 'Get some air' },
  { icon: '👁', title: 'Eye Rest', time: '2m', desc: 'Look away' },
]

const MUSIC_GENRES = [
  { icon: '🎧', genre: 'Lo-Fi Beats', desc: 'Chill beats' },
  { icon: '🌿', genre: 'Nature Sound', desc: 'Forest rain' },
  { icon: '🎹', genre: 'Classical', desc: 'Focus piano' },
  { icon: '🌊', genre: 'Ocean Waves', desc: 'Calm surf' },
]

export default function WorkflowBreakTime({ data, onComplete }) {
  const tids = useRef([])
  const rafs = useRef([])
  const hudRef = useRef(null)
  const phaseLabelRef = useRef(null)
  const timelineFillRef = useRef(null)
  const timelineProgressRef = useRef(null)
  const gridBgRef = useRef(null)
  const scanlineCrtRef = useRef(null)
  const flashRef = useRef(null)
  const hudFrameRef = useRef(null)
  const edgeGlowRefs = useRef([])
  const badgeRef = useRef(null)
  const titleRef = useRef(null)
  const ambientRef = useRef(null)
  const activitiesRef = useRef(null)
  const musicRef = useRef(null)
  const timerCircleRef = useRef(null)
  const timerTextRef = useRef(null)
  const summaryTextRef = useRef(null)
  const idleStateRef = useRef(null)
  const idleAvatarRef = useRef(null)
  const idleGreetingRef = useRef(null)
  const idleInputRef = useRef(null)
  const idleWfBarRef = useRef(null)

  const currentPhase = useRef(-1)
  const startTime = useRef(0)

  const ct = useCallback(function() {
    const id = setTimeout(...arguments)
    tids.current.push(id)
    return id
  }, [])

  const raf = useCallback(function() {
    const id = requestAnimationFrame(...arguments)
    rafs.current.push(id)
    return id
  }, [])

  useEffect(() => {
    return () => {
      tids.current.forEach(clearTimeout)
      rafs.current.forEach(cancelAnimationFrame)
    }
  }, [])

  function setPhaseRef(p, elapsed) {
    const phase = PHASES.find(p2 => p2.id === p) || PHASES[0]
    if (phaseLabelRef.current) phaseLabelRef.current.textContent = `■ ${phase.name}`
    const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100)
    if (timelineFillRef.current) timelineFillRef.current.style.width = pct + '%'
    if (timelineProgressRef.current) timelineProgressRef.current.style.left = pct + '%'
  }

  function activatePhase(pid) {
    const el = (sel) => hudRef.current && hudRef.current.querySelector(sel)
    function a(el, ...classes) { if (el) { el.style.opacity = '1'; if (classes.length) el.classList.add(...classes); else el.classList.add('active'); } return el }
    function d(el, ...classes) { if (el) { el.style.opacity = '0'; if (classes.length) el.classList.remove(...classes); else el.classList.remove('active'); } return el }

    switch (pid) {
      case 0:
        a(gridBgRef.current)
        a(scanlineCrtRef.current)
        if (flashRef.current) {
          a(flashRef.current)
          ct(() => d(flashRef.current), 300)
        }
        a(hudFrameRef.current)
        animateHudFrame()
        ct(() => { a(edgeGlowRefs.current[0], 'top') }, 200)
        ct(() => { a(edgeGlowRefs.current[1], 'right') }, 450)
        ct(() => { a(edgeGlowRefs.current[2], 'bot') }, 700)
        ct(() => { a(edgeGlowRefs.current[3], 'left') }, 950)
        ct(() => { a(badgeRef.current) }, 100)
        ct(() => {
          const rings = hudRef.current?.querySelectorAll('.wfb-pulse-ring')
          rings?.forEach(r => a(r))
        }, 150)
        break
      case 1:
        a(titleRef.current)
        break
      case 2:
        createAmbientCircles()
        break
      case 3:
        showActivityCards()
        break
      case 4:
        showMusicCards()
        break
      case 5:
        startTimerCountdown()
        break
      case 6:
        startSummary()
        break
    }
  }

  function deactivatePhase(pid) {
  }

  function animateHudFrame() {
    const container = hudFrameRef.current
    if (!container) return
    const brackets = container.querySelectorAll('.wf-corner-bracket')
    brackets.forEach(b => b.classList.add('slide-in'))
    const borderIds = ['wfb-border-top', 'wfb-border-right', 'wfb-border-bot', 'wfb-border-left']
    borderIds.forEach((id, i) => {
      ct(() => {
        const el = container.querySelector(`#${id}`)
        if (el) el.classList.add('draw')
      }, 200 + i * 250)
    })
    const divIds = ['wfb-div-v', 'wfb-div-h1', 'wfb-div-h2']
    divIds.forEach((id, i) => {
      ct(() => {
        const el = container.querySelector(`#${id}`)
        if (el) el.classList.add('draw')
      }, 1100 + i * 100)
    })
  }

  function createAmbientCircles() {
    const container = ambientRef.current
    if (!container) return
    if (container.classList.contains('active')) return
    a(container)
    const colors = ['#FFB800', '#FFD700', '#FF8C42', '#FF6B00']
    for (let i = 0; i < 16; i++) {
      const circle = document.createElement('div')
      const size = 4 + Math.random() * 8
      const x = Math.random() * 960
      const y = 200 + Math.random() * 300
      const color = colors[Math.floor(Math.random() * colors.length)]
      circle.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};border-radius:50%;opacity:0;box-shadow:0 0 ${size * 2}px ${color};animation-delay:${Math.random() * 3}s`
      container.appendChild(circle)
      ct(() => a(circle), i * 60)
    }
  }

  function showActivityCards() {
    const container = activitiesRef.current
    if (!container) return
    a(container)
    const cards = container.querySelectorAll('.wfb-activity-card')
    cards.forEach((card, i) => {
      ct(() => a(card), i * 150)
    })
  }

  function showMusicCards() {
    const container = musicRef.current
    if (!container) return
    a(container)
    const cards = container.querySelectorAll('.wfb-music-card')
    cards.forEach((card, i) => {
      ct(() => a(card), i * 150)
    })
  }

  function startTimerCountdown() {
    const container = hudRef.current
    if (!container) return
    a(container.querySelector('#wfb-timer-panel'))

    const circle = timerCircleRef.current
    const text = timerTextRef.current
    if (!circle || !text) return

    const circumference = 283
    const duration = 2000
    const totalSeconds = 300
    const startTime2 = performance.now()

    function tick(now) {
      const t = Math.min((now - startTime2) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const offset = circumference * (1 - eased)
      circle.style.strokeDashoffset = String(offset)

      const remaining = Math.round(totalSeconds * (1 - eased))
      const mins = Math.floor(remaining / 60)
      const secs = remaining % 60
      text.textContent = `${mins}:${String(secs).padStart(2, '0')}`

      if (t < 1) raf(tick)
      else {
        text.textContent = '0:00'
        ct(() => {
          const label = container.querySelector('#wfb-timer-label')
          if (label) label.textContent = 'BREAK OVER'
        }, 300)
      }
    }
    raf(tick)
  }

  function startSummary() {
    const container = hudRef.current
    if (!container) return
    a(container.querySelector('#wfb-summary-panel'))

    const textEl = summaryTextRef.current
    if (!textEl) return

    const speech = "Enjoy your break, sir. Step away, breathe deep, and recharge. The workstation will keep — I'll hold the fort. Back refreshed!"
    const words = speech.split(' ')
    let wordIdx = 0

    function typeWord() {
      if (wordIdx < words.length) {
        const wordSpan = document.createElement('span')
        wordSpan.className = 'wfb-word-highlight'
        wordSpan.textContent = words[wordIdx] + ' '
        textEl.appendChild(wordSpan)

        requestAnimationFrame(() => {
          wordSpan.style.opacity = '1'
          wordSpan.style.textShadow = '0 0 12px rgba(255,184,0,0.3)'
          ct(() => { wordSpan.style.textShadow = 'none' }, 120)
        })

        wordIdx++
        const lastChar = words[wordIdx - 1].slice(-1)
        const delay = lastChar === '.' || lastChar === ',' ? 130 : 60
        ct(typeWord, delay)
      } else {
        ct(() => {
          const footer = document.createElement('div')
          footer.style.cssText = 'margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,184,0,0.08);font-size:11px;letter-spacing:3px;color:#FFB800;text-shadow:0 0 20px rgba(255,184,0,0.3);text-align:center'
          footer.textContent = '═══ ENJOY YOUR BREAK ═══'
          textEl.parentNode.appendChild(footer)
          if (flashRef.current) {
            a(flashRef.current)
            ct(() => d(flashRef.current), 250)
          }
          ct(showIdle, 800)
        }, 600)
      }
    }

    ct(typeWord, 300)
  }

  function showIdle() {
    a(idleStateRef.current)
    ct(() => { a(idleAvatarRef.current) }, 300)
    ct(() => { a(idleGreetingRef.current) }, 600)
    ct(() => { a(idleInputRef.current) }, 900)
    ct(() => { a(idleWfBarRef.current) }, 1100)
    ct(() => {
      if (onComplete) onComplete()
    }, 2000)
  }

  function animateCounter(el, target, duration = 800, formatFn = null) {
    const s = performance.now()
    function tick(now) {
      const t = Math.min((now - s) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(eased * target)
      el.textContent = formatFn ? formatFn(current) : current
      if (t < 1) raf(tick)
    }
    raf(tick)
  }

  useEffect(() => {
    let running = true
    let rafId

    currentPhase.current = -1
    startTime.current = performance.now()

    function tick(now) {
      if (!running) return
      const elapsed = now - startTime.current
      let activePhase = -1
      for (let i = PHASES.length - 1; i >= 0; i--) {
        if (elapsed >= PHASES[i].start) { activePhase = i; break }
      }
      if (activePhase !== currentPhase.current) {
        if (currentPhase.current >= 0) deactivatePhase(currentPhase.current)
        currentPhase.current = activePhase
        if (currentPhase.current >= 0) activatePhase(currentPhase.current)
      }
      setPhaseRef(currentPhase.current, elapsed)
      if (elapsed < TOTAL_DURATION) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="wf-hud" ref={hudRef} style={{ '--warm-orange': '#FF6B00', '--warm-gold': '#FFD700', '--warm-accent': '#FF8C42' }}>
      <div className="wf-grid-bg" ref={gridBgRef}></div>
      <div className="wf-scanline" ref={scanlineCrtRef}></div>

      <div ref={flashRef} style={{ position: 'absolute', inset: 0, background: 'rgba(255,184,0,0.08)', opacity: 0, pointerEvents: 'none', zIndex: 50, transition: 'opacity 0.05s' }}></div>

      {/* HUD Frame SVG */}
      <svg ref={hudFrameRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 15, pointerEvents: 'none', opacity: 0, transition: 'opacity 0.2s' }} viewBox="0 0 960 600" preserveAspectRatio="xMidYMid meet">
        <g className="wf-corner-bracket" style={{ transform: 'translate(-60px, -60px)', opacity: 0 }}>
          <line x1="20" y1="46" x2="56" y2="46" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
          <line x1="20" y1="46" x2="20" y2="82" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
        </g>
        <g className="wf-corner-bracket" style={{ transform: 'translate(60px, -60px)', opacity: 0 }}>
          <line x1="940" y1="46" x2="904" y2="46" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
          <line x1="940" y1="46" x2="940" y2="82" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
        </g>
        <g className="wf-corner-bracket" style={{ transform: 'translate(-60px, 60px)', opacity: 0 }}>
          <line x1="20" y1="554" x2="56" y2="554" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
          <line x1="20" y1="554" x2="20" y2="518" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
        </g>
        <g className="wf-corner-bracket" style={{ transform: 'translate(60px, 60px)', opacity: 0 }}>
          <line x1="940" y1="554" x2="904" y2="554" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
          <line x1="940" y1="554" x2="940" y2="518" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
        </g>
        <line className="wf-hud-border-line" id="wfb-border-top" x1="60" y1="46" x2="900" y2="46" stroke="#FFB800" strokeWidth="1" strokeOpacity="0" strokeDasharray="900" strokeDashoffset="900"/>
        <line className="wf-hud-border-line" id="wfb-border-right" x1="940" y1="86" x2="940" y2="514" stroke="#FFB800" strokeWidth="1" strokeOpacity="0" strokeDasharray="900" strokeDashoffset="900"/>
        <line className="wf-hud-border-line" id="wfb-border-bot" x1="900" y1="554" x2="60" y2="554" stroke="#FFB800" strokeWidth="1" strokeOpacity="0" strokeDasharray="900" strokeDashoffset="900"/>
        <line className="wf-hud-border-line" id="wfb-border-left" x1="20" y1="514" x2="20" y2="86" stroke="#FFB800" strokeWidth="1" strokeOpacity="0" strokeDasharray="900" strokeDashoffset="900"/>
        <line className="wf-hud-border-line sub" id="wfb-div-v" x1="564" y1="146" x2="564" y2="376" stroke="#FFB800" strokeWidth="0.5" strokeOpacity="0" strokeDasharray="300" strokeDashoffset="300"/>
        <line className="wf-hud-border-line sub" id="wfb-div-h1" x1="24" y1="240" x2="564" y2="240" stroke="#FFB800" strokeWidth="0.5" strokeOpacity="0" strokeDasharray="300" strokeDashoffset="300"/>
        <line className="wf-hud-border-line sub" id="wfb-div-h2" x1="24" y1="308" x2="564" y2="308" stroke="#FFB800" strokeWidth="0.5" strokeOpacity="0" strokeDasharray="300" strokeDashoffset="300"/>
      </svg>

      {/* Edge Glows */}
      <div ref={el => edgeGlowRefs.current[0] = el} className="wf-edge-glow" style={{ position: 'absolute', width: 8, height: 8, background: '#FFB800', borderRadius: '50%', boxShadow: '0 0 24px #FFB800, 0 0 60px rgba(255,184,0,0.3)', opacity: 0, zIndex: 16, pointerEvents: 'none' }}></div>
      <div ref={el => edgeGlowRefs.current[1] = el} className="wf-edge-glow" style={{ position: 'absolute', width: 8, height: 8, background: '#FFB800', borderRadius: '50%', boxShadow: '0 0 24px #FFB800, 0 0 60px rgba(255,184,0,0.3)', opacity: 0, zIndex: 16, pointerEvents: 'none' }}></div>
      <div ref={el => edgeGlowRefs.current[2] = el} className="wf-edge-glow" style={{ position: 'absolute', width: 8, height: 8, background: '#FFB800', borderRadius: '50%', boxShadow: '0 0 24px #FFB800, 0 0 60px rgba(255,184,0,0.3)', opacity: 0, zIndex: 16, pointerEvents: 'none' }}></div>
      <div ref={el => edgeGlowRefs.current[3] = el} className="wf-edge-glow" style={{ position: 'absolute', width: 8, height: 8, background: '#FFB800', borderRadius: '50%', boxShadow: '0 0 24px #FFB800, 0 0 60px rgba(255,184,0,0.3)', opacity: 0, zIndex: 16, pointerEvents: 'none' }}></div>

      {/* Phase 0: BREAK Badge */}
      <div ref={badgeRef} id="wfb-break-badge" style={{ position: 'absolute', left: '50%', top: '30%', transform: 'translate(-50%, -50%)', zIndex: 20, opacity: 0, transition: 'opacity 0.3s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 160, height: 160 }}>
          <div className="wfb-pulse-ring" style={{ position: 'absolute', inset: 0, border: '2px solid #FFB800', borderRadius: '50%', opacity: 0 }}></div>
          <div className="wfb-pulse-ring" style={{ position: 'absolute', inset: 0, border: '2px solid #FFB800', borderRadius: '50%', opacity: 0, animationDelay: '0.3s' }}></div>
        </div>
        <div style={{ fontSize: 48, fontWeight: 'bold', color: '#FFB800', letterSpacing: 12, textShadow: '0 0 40px rgba(255,184,0,0.5), 0 0 80px rgba(255,184,0,0.2)', position: 'relative', zIndex: 2 }}>BREAK</div>
        <div style={{ fontSize: 12, color: 'rgba(255,184,0,0.5)', letterSpacing: 4, marginTop: 4 }}>STAND DOWN</div>
      </div>

      {/* Phase 1: Title */}
      <div ref={titleRef} id="wfb-title" style={{ position: 'absolute', left: '50%', top: '18%', transform: 'translate(-50%, -50%)', zIndex: 20, opacity: 0, transition: 'opacity 0.5s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <span style={{ fontSize: 40 }}>☕</span>
          <span style={{ fontSize: 36, fontWeight: 'bold', color: '#FFB800', letterSpacing: 8, textShadow: '0 0 30px rgba(255,184,0,0.3), 0 0 60px rgba(255,184,0,0.1)' }}>BREAK TIME</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,184,0,0.5)', letterSpacing: 4, marginTop: 8, borderTop: '1px solid rgba(255,184,0,0.08)', paddingTop: 8, width: 300, marginLeft: 'auto', marginRight: 'auto' }}>STAND DOWN — RECHARGE</div>
      </div>

      {/* Phase 2: Ambient Container */}
      <div ref={ambientRef} id="wfb-ambient" style={{ position: 'absolute', inset: 0, zIndex: 18, pointerEvents: 'none', opacity: 0, transition: 'opacity 2s' }}></div>

      {/* Phase 3: Activity Cards */}
      <div ref={activitiesRef} id="wfb-activities" style={{ position: 'absolute', left: '3%', top: '20%', width: '46%', zIndex: 20, opacity: 0, transition: 'opacity 0.4s' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,184,0,0.5)', marginBottom: 8, paddingLeft: 4 }}>▌ SUGGESTED ACTIVITIES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {ACTIVITIES.map((a, i) => (
            <div key={i} className="wfb-activity-card" style={{ background: 'rgba(14,14,32,0.9)', border: '1px solid rgba(255,184,0,0.12)', padding: 10, opacity: 0, transform: 'translateY(12px)', transition: 'opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 'bold', color: '#FFB800', letterSpacing: 1 }}>{a.title}</span>
                  <span style={{ fontSize: 8, color: 'rgba(255,184,0,0.35)', letterSpacing: 1, background: 'rgba(255,184,0,0.06)', padding: '1px 6px' }}>{a.time}</span>
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,184,0,0.5)', letterSpacing: 0.5 }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 4: Music Cards */}
      <div ref={musicRef} id="wfb-music" style={{ position: 'absolute', right: '3%', top: '20%', width: '42%', zIndex: 20, opacity: 0, transition: 'opacity 0.4s' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,184,0,0.5)', marginBottom: 8, paddingLeft: 4 }}>▌ AMBIENT SOUNDS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MUSIC_GENRES.map((m, i) => (
            <div key={i} className="wfb-music-card" style={{ background: 'rgba(14,14,32,0.9)', border: '1px solid rgba(255,184,0,0.1)', padding: '8px 10px', opacity: 0, transform: 'translateY(12px)', transition: 'opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#FFD700', letterSpacing: 1, fontWeight: 'bold', marginBottom: 1 }}>{m.genre}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,184,0,0.4)', letterSpacing: 0.5 }}>{m.desc}</div>
              </div>
              <span style={{ fontSize: 9, color: 'rgba(255,184,0,0.25)', padding: '1px 6px', border: '1px solid rgba(255,184,0,0.08)', cursor: 'pointer' }}>PLAY</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 5: Timer Panel */}
      <div id="wfb-timer-panel" style={{ position: 'absolute', left: '25%', top: '40%', width: '50%', height: 140, background: 'rgba(14,14,32,0.95)', border: '1px solid rgba(255,184,0,0.12)', zIndex: 20, opacity: 0, transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)', transform: 'translateY(16px)' }}>
        <div style={{ padding: '6px 12px', fontSize: 9, letterSpacing: 2, borderBottom: '1px solid rgba(255,184,0,0.1)', color: 'rgba(255,184,0,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11 }}>⏱</span> BREAK TIMER
        </div>
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 20, height: 'calc(100% - 28px)' }}>
          <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <svg width="90" height="90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,184,0,0.08)" strokeWidth="5"/>
              <circle ref={timerCircleRef} cx="50" cy="50" r="45" fill="none" stroke="#FFB800" strokeWidth="5" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="283" style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px', transition: 'none' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span ref={timerTextRef} style={{ fontSize: 20, fontWeight: 'bold', color: '#FFB800', letterSpacing: 2, textShadow: '0 0 15px rgba(255,184,0,0.2)' }}>5:00</span>
              <span id="wfb-timer-label" style={{ fontSize: 7, color: 'rgba(255,184,0,0.4)', letterSpacing: 2, marginTop: 2 }}>REMAINING</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#FFB800', letterSpacing: 2, marginBottom: 4, fontWeight: 'bold' }}>Time to recharge</div>
            <div style={{ fontSize: 9, color: 'rgba(255,184,0,0.5)', letterSpacing: 1, lineHeight: 1.6 }}>
              Breathe. Stretch. Hydrate.<br/>Your workstation is waiting.
            </div>
          </div>
        </div>
      </div>

      {/* Phase 6: Summary Panel */}
      <div id="wfb-summary-panel" style={{ position: 'absolute', left: '3%', bottom: '18%', width: '94%', background: 'rgba(14,14,32,0.95)', border: '1px solid rgba(255,184,0,0.1)', zIndex: 20, opacity: 0, transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)', transform: 'translateY(16px)' }}>
        <div style={{ padding: '6px 12px', fontSize: 9, letterSpacing: 2, borderBottom: '1px solid rgba(255,184,0,0.1)', color: 'rgba(255,184,0,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11 }}>💬</span> RELAXED NOTE
        </div>
        <div style={{ padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 32, height: 32, flexShrink: 0, background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>☕</div>
          <div ref={summaryTextRef} style={{ fontSize: 10, color: 'rgba(255,184,0,0.8)', lineHeight: 1.6, letterSpacing: 0.5, flex: 1 }}></div>
        </div>
      </div>

      {/* Idle State */}
      <div ref={idleStateRef} id="wfb-idle-state" style={{ position: 'absolute', inset: 0, zIndex: 25, opacity: 0, transition: 'opacity 0.6s', pointerEvents: 'none', background: 'rgba(8,8,12,0.97)' }}>
        <div style={{ position: 'absolute', top: 22, left: '5%', right: '5%', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#FFB800', fontWeight: 'bold', textShadow: '0 0 15px rgba(255,184,0,0.3)' }}>☕ SODA — BREAK MODE</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 9, letterSpacing: 1 }}>
            <span style={{ color: 'rgba(255,184,0,0.5)' }}>☀ <span style={{ color: '#FFB800' }}>30°</span></span>
            <span style={{ color: 'rgba(255,184,0,0.5)' }}>■ <span style={{ color: '#FFB800' }}>CALM</span></span>
            <span style={{ color: 'rgba(255,184,0,0.5)' }}>⏱ <span style={{ color: '#FFB800' }}>0:00</span></span>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div ref={idleAvatarRef} style={{ position: 'relative', width: 80, height: 80, background: 'rgba(255,184,0,0.02)', border: '2px solid rgba(255,184,0,0.15)', borderRadius: '50%', boxShadow: '0 0 30px rgba(255,184,0,0.06), inset 0 0 30px rgba(255,184,0,0.03)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transform: 'scale(0)', transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div style={{ width: 10, height: 8, background: '#FFB800', borderRadius: '50%', boxShadow: '0 0 12px rgba(255,184,0,0.4)' }}></div>
            <div style={{ width: 10, height: 8, background: '#FFB800', borderRadius: '50%', boxShadow: '0 0 12px rgba(255,184,0,0.4)' }}></div>
            <div style={{ position: 'absolute', bottom: 24, left: '50%', width: 28, height: 3, background: 'rgba(255,184,0,0.3)', borderRadius: 4, transform: 'translateX(-50%)' }}></div>
          </div>
          <div ref={idleGreetingRef} style={{ fontSize: 13, color: 'rgba(255,184,0,0.8)', letterSpacing: 2, textShadow: '0 0 20px rgba(255,184,0,0.15)', opacity: 0, transition: 'opacity 0.5s 0.3s' }}>"Enjoying a quiet moment... ☕"</div>
        </div>
        <div ref={idleInputRef} style={{ position: 'absolute', bottom: '8%', left: '12%', right: '12%', height: 32, border: '1px solid rgba(255,184,0,0.1)', background: 'rgba(255,184,0,0.02)', display: 'flex', alignItems: 'center', padding: '0 12px', opacity: 0, transition: 'opacity 0.4s 0.5s' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,184,0,0.3)', letterSpacing: 1 }}>▌ Take your time, sir...</span>
          <span style={{ display: 'inline-block', width: 6, height: 14, background: '#FFB800', marginLeft: 4, animation: 'wf-cursor-blink 0.53s step-end infinite' }}></span>
        </div>
        <div ref={idleWfBarRef} style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, opacity: 0, transition: 'opacity 0.3s 0.6s' }}>
          {['☕Break','🌅Morning','💻Work','⚡Startup'].map((label, i) => (
            <span key={i} style={{ fontSize: 8, letterSpacing: 1, padding: '3px 8px', border: '1px solid rgba(255,184,0,0.08)', color: 'rgba(255,184,0,0.3)', background: 'transparent' }}>{label}</span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 60, width: '80%' }}>
        <span ref={phaseLabelRef} style={{ fontSize: 10, color: 'rgba(255,184,0,0.5)', letterSpacing: 2, minWidth: 200, flexShrink: 0 }}>■ STAND DOWN — BREAK TIME</span>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div ref={timelineFillRef} style={{ height: '100%', width: '0%', background: '#FFB800', boxShadow: '0 0 8px rgba(255,184,0,0.3)', transition: 'width 0.1s linear' }}></div>
          <div ref={timelineProgressRef} style={{ position: 'absolute', top: -4, left: 0, width: 3, height: 12, background: '#FFB800', boxShadow: '0 0 10px #FFB800', transition: 'left 0.1s linear' }}></div>
        </div>
      </div>
    </div>
  )
}
