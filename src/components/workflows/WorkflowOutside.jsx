import { useEffect, useRef, useCallback } from 'react'

const WFO_PHASES = [
  { id: 0, name: 'HUD BOOT',                start: 0,    dur: 250  },
  { id: 1, name: 'WEATHER REPORT',          start: 250,  dur: 950  },
  { id: 2, name: 'ESSENTIAL GEAR',          start: 1200, dur: 1000 },
  { id: 3, name: 'AWAITING DESTINATION',    start: 2200, dur: Infinity },
]

const TOTAL_DURATION = 999999

const GEAR_ITEMS = [
  { emoji: '\u231A', label: 'Watch' },
  { emoji: '\uD83D\uDC5B', label: 'Moneybag' },
  { emoji: '\uD83D\uDCF1', label: 'Phone' },
  { emoji: '\uD83C\uDFA7', label: 'Headphones' },
]

function weatherLabel(code) {
  if (code == null) return '--'
  if (code === 0 || code === 1) return 'CLEAR SKIES'
  if (code <= 3) return 'PARTLY CLOUDY'
  if (code <= 48) return 'FOGGY'
  if (code <= 55) return 'LIGHT RAIN'
  if (code <= 67) return 'RAIN'
  if (code <= 77) return 'SNOW'
  if (code <= 82) return 'RAIN SHOWERS'
  if (code <= 99) return 'THUNDERSTORM'
  return 'MIXED'
}

function weatherEmoji(code, isDay) {
  if (code == null) return '\u2601\uFE0F'
  if (code === 0 || code === 1) return isDay ? '\u2600\uFE0F' : '\uD83C\uDF19'
  if (code <= 3) return '\u26C5'
  if (code <= 48) return '\uD83C\uDF2B\uFE0F'
  if (code <= 55) return '\uD83C\uDF26\uFE0F'
  if (code <= 67) return '\uD83C\uDF27\uFE0F'
  if (code <= 77) return '\uD83C\uDF28\uFE0F'
  if (code <= 82) return '\uD83C\uDF26\uFE0F'
  return '\u26C8\uFE0F'
}

function weatherAnimClass(code, isDay) {
  if (code == null) return ''
  if (code === 0 || code === 1) return isDay ? 'wfo-sun' : 'wfo-moon'
  if (code <= 3) return 'wfo-cloud'
  if (code <= 48) return 'wfo-fog'
  if (code <= 55) return 'wfo-drizzle'
  if (code <= 67) return 'wfo-rain'
  if (code <= 77) return 'wfo-snow'
  if (code <= 82) return 'wfo-showers'
  return 'wfo-storm'
}

export default function WorkflowOutside({ data, onComplete }) {
  const tids = useRef([])
  const rafs = useRef([])
  const hudRef = useRef(null)
  const phaseLabelRef = useRef(null)
  const timelineFillRef = useRef(null)
  const gridBgRef = useRef(null)
  const scanlineRef = useRef(null)
  const flashOverlayRef = useRef(null)
  const titleBarRef = useRef(null)

  const panelWeatherRef = useRef(null)
  const weatherIconRef = useRef(null)
  const tempRef = useRef(null)
  const conditionRef = useRef(null)
  const metricRefs = useRef([])

  const panelGearRef = useRef(null)
  const gearItemRefs = useRef([])

  const panelDestRef = useRef(null)
  const scanRingRef = useRef(null)
  const destTextRef = useRef(null)

  const currentPhase = useRef(-1)
  const startTime = useRef(0)

  const ct = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms)
    tids.current.push(id)
    return id
  }, [])

  useEffect(() => {
    return () => {
      tids.current.forEach(clearTimeout)
      rafs.current.forEach(cancelAnimationFrame)
    }
  }, [])

  function a(el, ...classes) { if (el) { el.style.opacity = '1'; el.classList.add(...(classes.length ? classes : ['active'])) } }
  function d(el) { if (el) { el.style.opacity = '0'; el.classList.remove('active') } }

  function setPhaseRef(p, elapsed) {
    const phase = WFO_PHASES.find(p2 => p2.id === p) || WFO_PHASES[0]
    if (phaseLabelRef.current) phaseLabelRef.current.textContent = '\u25A0 ' + phase.name
    const pct = Math.min((elapsed / 4500) * 100, 100)
    if (timelineFillRef.current) timelineFillRef.current.style.width = pct + '%'
  }

  function activatePanel(ref) {
    if (ref.current) a(ref.current)
  }

  function animateFrame() {
    const container = hudRef.current
    if (!container) return
    const corners = container.querySelectorAll('.wf-corner')
    corners.forEach((c, i) => {
      ct(() => { c.style.animation = 'wf-bracket-slide 0.4s cubic-bezier(0.16,1,0.3,1) forwards'; c.style.opacity = '1' }, i * 60)
    })
    const borders = container.querySelectorAll('.wf-border-line')
    borders.forEach((b, i) => {
      const dur = b.classList.contains('sub') ? '0.3s' : '0.5s'
      const anim = b.classList.contains('sub') ? 'wf-sub-line-draw' : 'wf-line-draw'
      ct(() => { b.style.animation = anim + ' ' + dur + ' linear forwards' }, 150 + i * 80)
    })
    ct(() => { if (titleBarRef.current) a(titleBarRef.current) }, 100)
  }

  function animateWeather() {
    const w = data?.weather || {}
    const code = w.weather_code
    const isDay = w.is_day !== false
    const temp = w.temperature != null ? Math.round(w.temperature) : '--'
    const condition = weatherLabel(code)
    const emoji = weatherEmoji(code, isDay)
    const animClass = weatherAnimClass(code, isDay)

    if (weatherIconRef.current) {
      weatherIconRef.current.textContent = emoji
      if (animClass) weatherIconRef.current.className = 'wfo-weather-icon ' + animClass
    }
    if (conditionRef.current) conditionRef.current.textContent = condition

    if (tempRef.current) {
      tempRef.current.innerHTML = ''
      const str = String(temp)
      for (let i = 0; i < str.length; i++) {
        const span = document.createElement('span')
        span.className = 'wfo-temp-digit'
        span.textContent = str[i]
        span.style.opacity = '0'
        span.style.transform = 'translateY(12px) scale(0.6)'
        tempRef.current.appendChild(span)
      }
      const digits = tempRef.current.querySelectorAll('.wfo-temp-digit')
      digits.forEach((c, i) => {
        ct(() => {
          c.style.opacity = '1'
          c.style.transform = 'translateY(0) scale(1)'
        }, i * 70)
      })
      const deg = document.createElement('span')
      deg.className = 'wfo-temp-deg'
      deg.textContent = '\u00B0'
      tempRef.current.appendChild(deg)
    }

    ct(() => {
      const locEl = hudRef.current?.querySelector('#wfo-location')
      if (locEl && w.location) locEl.textContent = w.location.toUpperCase()
    }, 200)

    const metrics = [
      { label: 'FEELS LIKE', value: w.feels_like != null ? Math.round(w.feels_like) + '\u00B0C' : '--' },
      { label: 'HUMIDITY', value: w.humidity != null ? w.humidity + '%' : '--' },
      { label: 'WIND', value: w.wind_speed != null ? w.wind_speed + ' km/h' : '--' },
      { label: 'PRECIPITATION', value: w.precipitation != null ? Math.round(w.precipitation) + '%' : '--' },
    ]
    metrics.forEach((m, i) => {
      ct(() => {
        const el = metricRefs.current[i]
        if (!el) return
        const labelEl = el.querySelector('.wfo-metric-label')
        const valEl = el.querySelector('.wfo-metric-val')
        if (labelEl) labelEl.textContent = m.label
        if (valEl) valEl.textContent = m.value
        a(el)
      }, 300 + i * 100)
    })
  }

  function animateGearItems() {
    gearItemRefs.current.forEach((ref, i) => {
      ct(() => {
        if (!ref) return
        a(ref)
        const check = ref.querySelector('.wfo-gear-check')
        if (check) {
          ct(() => check.classList.add('checked'), 250)
        }
      }, i * 160)
    })
  }

  function activateDestination() {
    if (scanRingRef.current) scanRingRef.current.classList.add('active')
    if (destTextRef.current) {
      const text = 'WHERE ARE YOU HEADING, SIR?'
      destTextRef.current.innerHTML = ''
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span')
        span.className = 'wfo-dest-char'
        span.textContent = text[i] === ' ' ? '\u00A0' : text[i]
        destTextRef.current.appendChild(span)
      }
      const chars = destTextRef.current.querySelectorAll('.wfo-dest-char')
      chars.forEach((c, i) => {
        ct(() => c.classList.add('revealed'), i * 30)
      })
    }
  }

  function activatePhase(pid) {
    switch (pid) {
      case 0:
        if (gridBgRef.current) a(gridBgRef.current)
        if (scanlineRef.current) a(scanlineRef.current)
        if (flashOverlayRef.current) {
          a(flashOverlayRef.current)
          ct(() => d(flashOverlayRef.current), 250)
        }
        animateFrame()
        break
      case 1:
        activatePanel(panelWeatherRef)
        animateWeather()
        break
      case 2:
        activatePanel(panelGearRef)
        animateGearItems()
        break
      case 3:
        activatePanel(panelDestRef)
        activateDestination()
        break
    }
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
      for (let i = WFO_PHASES.length - 1; i >= 0; i--) {
        if (elapsed >= WFO_PHASES[i].start) { activePhase = i; break }
      }
      if (activePhase !== currentPhase.current) {
        currentPhase.current = activePhase
        if (currentPhase.current >= 0) activatePhase(currentPhase.current)
      }
      setPhaseRef(currentPhase.current, elapsed)
      if (elapsed < TOTAL_DURATION) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => { running = false; if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  const w = data?.weather || {}
  const tempDisplay = w.temperature != null ? Math.round(w.temperature) : '--'
  const locName = w.location ? w.location.toUpperCase() : '--'

  return (
    <div className="wf-hud" ref={hudRef}>
      <div className="wfo-frame-wrap">
        <div className="wfo-frame-inner">

          <div className="wf-grid-bg" ref={gridBgRef}></div>
          <div className="wf-scanline" ref={scanlineRef}></div>

          <div ref={flashOverlayRef} style={{position:'absolute',inset:0,background:'rgba(0,240,255,0.06)',opacity:0,pointerEvents:'none',zIndex:50}}></div>

          <div ref={titleBarRef} style={{position:'absolute',left:'3.75%',top:'2.667%',zIndex:25,opacity:0,transition:'opacity 0.3s'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:13,fontWeight:'bold',letterSpacing:4,color:'var(--wf-cyan)',textShadow:'0 0 20px rgba(0,240,255,0.25)'}}>&#9670; FIELD DEPLOYMENT</span>
              <span style={{fontSize:8,letterSpacing:2,color:'rgba(0,240,255,0.35)',background:'rgba(0,240,255,0.04)',border:'1px solid rgba(0,240,255,0.06)',padding:'2px 8px'}}>OUTSIDE</span>
            </div>
          </div>

          <div style={{position:'absolute',right:'3.75%',top:'3%',zIndex:25,display:'flex',gap:16,alignItems:'center',opacity:0,transition:'opacity 0.3s'}} ref={el => ct(() => { if (el) el.style.opacity = '1' }, 80)}>
            <span style={{fontSize:9,letterSpacing:2,color:'rgba(0,240,255,0.4)'}}>
              <span style={{color:'var(--wf-cyan)'}}>{tempDisplay}\u00B0</span>
              <span style={{marginLeft:8}} id="wfo-location">{locName}</span>
            </span>
          </div>

          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:15,pointerEvents:'none',opacity:0,transition:'opacity 0.2s'}} viewBox="0 0 960 600" preserveAspectRatio="xMidYMid meet" ref={el => ct(() => { if (el) el.style.opacity = '1' }, 50)}>
            <g className="wf-corner" style={{transform:'translate(-60px,-60px)',opacity:0}}>
              <line x1="16" y1="40" x2="52" y2="40" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="40" x2="16" y2="76" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
            </g>
            <g className="wf-corner" style={{transform:'translate(60px,-60px)',opacity:0}}>
              <line x1="944" y1="40" x2="908" y2="40" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="944" y1="40" x2="944" y2="76" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
            </g>
            <g className="wf-corner" style={{transform:'translate(-60px,60px)',opacity:0}}>
              <line x1="16" y1="560" x2="52" y2="560" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="560" x2="16" y2="524" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
            </g>
            <g className="wf-corner" style={{transform:'translate(60px,60px)',opacity:0}}>
              <line x1="944" y1="560" x2="908" y2="560" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="944" y1="560" x2="944" y2="524" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
            </g>
            <line className="wf-border-line" x1="60" y1="46" x2="900" y2="46" stroke="var(--wf-cyan)" strokeWidth="1" strokeOpacity="0" strokeDasharray="900" strokeDashoffset="900"/>
            <line className="wf-border-line" x1="939" y1="86" x2="939" y2="514" stroke="var(--wf-cyan)" strokeWidth="1" strokeOpacity="0" strokeDasharray="900" strokeDashoffset="900"/>
            <line className="wf-border-line" x1="900" y1="554" x2="60" y2="554" stroke="var(--wf-cyan)" strokeWidth="1" strokeOpacity="0" strokeDasharray="900" strokeDashoffset="900"/>
            <line className="wf-border-line" x1="20" y1="514" x2="20" y2="86" stroke="var(--wf-cyan)" strokeWidth="1" strokeOpacity="0" strokeDasharray="900" strokeDashoffset="900"/>
            <line className="wf-border-line sub" x1="454" y1="42" x2="454" y2="270" stroke="var(--wf-cyan)" strokeWidth="0.5" strokeOpacity="0" strokeDasharray="300" strokeDashoffset="300"/>
            <line className="wf-border-line sub" x1="692" y1="42" x2="692" y2="270" stroke="var(--wf-cyan)" strokeWidth="0.5" strokeOpacity="0" strokeDasharray="300" strokeDashoffset="300"/>
          </svg>

          <div style={{position:'absolute',top:'8.667%',right:'2.5%',bottom:'7.333%',left:'2.5%',display:'flex',flexDirection:'column'}}>
            <div style={{flex:1,display:'flex',gap:14}}>
              <div ref={panelWeatherRef} className="wfo-panel" style={{flex:1.4,opacity:0,transform:'translateY(12px)',transition:'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)'}}>
                <div style={{padding:'8px 12px',fontSize:8,letterSpacing:2,borderBottom:'1px solid rgba(0,240,255,0.08)',color:'rgba(0,240,255,0.5)',display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:10,color:'var(--wf-cyan)',textShadow:'0 0 6px rgba(0,240,255,0.3)'}}>&#9672;</span> WEATHER REPORT</div>
                <div style={{padding:'10px 14px',display:'flex',gap:16,alignItems:'center'}}>
                  <div ref={weatherIconRef} className="wfo-weather-icon" style={{fontSize:48,width:72,height:72,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,240,255,0.02)',border:'1px solid rgba(0,240,255,0.06)',borderRadius:'50%',flexShrink:0}}>&#x2601;</div>
                  <div style={{flex:1}}>
                    <div ref={tempRef} className="wfo-temp-display" style={{fontSize:36,fontWeight:'bold',color:'var(--wf-cyan)',textShadow:'0 0 24px rgba(0,240,255,0.3)',lineHeight:1,letterSpacing:2,display:'flex',alignItems:'baseline'}}>{tempDisplay}</div>
                    <div ref={conditionRef} className="wfo-condition" style={{fontSize:9,letterSpacing:3,color:'rgba(0,240,255,0.5)',marginTop:4}}>--</div>
                  </div>
                </div>
                <div style={{padding:'0 14px 10px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px 12px'}}>
                  {[0,1,2,3].map(i => (
                    <div key={i} ref={el => metricRefs.current[i] = el} className="wfo-metric" style={{display:'flex',alignItems:'center',gap:6,padding:'3px 6px',background:'rgba(0,240,255,0.015)',border:'1px solid rgba(0,240,255,0.04)',fontSize:9,letterSpacing:1,opacity:0,transform:'translateX(-6px)',transition:'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)'}}>
                      <span className="wfo-metric-label" style={{color:'rgba(0,240,255,0.4)',minWidth:60}}></span>
                      <span className="wfo-metric-val" style={{color:'var(--wf-cyan)',marginLeft:'auto',fontWeight:'bold',textShadow:'0 0 8px rgba(0,240,255,0.2)'}}></span>
                    </div>
                  ))}
                </div>
              </div>

              <div ref={panelGearRef} className="wfo-panel" style={{flex:1,opacity:0,transform:'translateY(12px)',transition:'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)'}}>
                <div style={{padding:'8px 12px',fontSize:8,letterSpacing:2,borderBottom:'1px solid rgba(0,240,255,0.08)',color:'rgba(0,240,255,0.5)',display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:10,color:'var(--wf-green)',textShadow:'0 0 6px rgba(0,255,136,0.3)'}}>&#10003;</span> ESSENTIAL GEAR</div>
                <div style={{padding:'8px 12px'}}>
                  {GEAR_ITEMS.map((item, i) => (
                    <div key={i} ref={el => gearItemRefs.current[i] = el} className="wfo-gear-item" style={{display:'flex',alignItems:'center',padding:'5px 8px',marginBottom:4,background:'rgba(0,240,255,0.02)',border:'1px solid rgba(0,240,255,0.05)',fontSize:10,letterSpacing:1,gap:8,opacity:0,transform:'translateX(14px)',transition:'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s, border-color 0.3s'}}>
                      <span style={{fontSize:14,width:20,textAlign:'center'}}>{item.emoji}</span>
                      <span style={{flex:1,color:'rgba(0,240,255,0.7)'}}>{item.label}</span>
                      <span className="wfo-gear-check" style={{fontSize:9,padding:'2px 8px',border:'1px solid rgba(0,240,255,0.1)',color:'rgba(0,240,255,0.25)',background:'transparent',transition:'all 0.3s'}}>&#10003;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div ref={panelDestRef} className="wfo-panel" style={{flex:'none',height:90,opacity:0,transform:'translateY(12px)',transition:'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)'}}>
              <div style={{padding:'6px 12px',fontSize:8,letterSpacing:2,borderBottom:'1px solid rgba(0,240,255,0.08)',color:'rgba(0,240,255,0.5)',display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:10,color:'var(--wf-amber)',textShadow:'0 0 6px rgba(255,184,0,0.3)'}}>&#9673;</span> DESTINATION INPUT</div>
              <div style={{display:'flex',alignItems:'center',gap:20,padding:'8px 16px'}}>
                <div className="wfo-scan-ring-wrap" style={{position:'relative',width:40,height:40,flexShrink:0}}>
                  <svg viewBox="0 0 48 48" style={{width:'100%',height:'100%'}}>
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(0,240,255,0.08)" strokeWidth="1"/>
                    <circle ref={scanRingRef} cx="24" cy="24" r="20" fill="none" stroke="var(--wf-cyan)" strokeWidth="1.5" strokeOpacity="0" strokeDasharray="125" strokeDashoffset="125" className="wfo-scan-ring"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div ref={destTextRef} className="wfo-dest-text" style={{fontSize:13,letterSpacing:3,color:'rgba(0,240,255,0.7)',textShadow:'0 0 15px rgba(0,240,255,0.15)',minHeight:20}}></div>
                  <div style={{marginTop:6,display:'flex',alignItems:'center',gap:4}}>
                    <span style={{fontSize:8,color:'rgba(0,240,255,0.4)',letterSpacing:1}}>AWAITING INPUT</span>
                    <span style={{display:'inline-block',width:4,height:10,background:'var(--wf-cyan)',marginLeft:2,animation:'wfo-cursor-blink 0.53s step-end infinite',boxShadow:'0 0 6px rgba(0,240,255,0.4)'}}></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{position:'absolute',bottom:'2.667%',left:'50%',transform:'translateX(-50%)',display:'flex',alignItems:'center',gap:12,zIndex:60}}>
            <span ref={phaseLabelRef} style={{fontSize:9,color:'rgba(0,240,255,0.5)',letterSpacing:2,minWidth:180}}>&#9632; HUD BOOT</span>
            <div style={{flex:1,height:3,width:'18.75%',background:'rgba(0,240,255,0.06)',border:'1px solid rgba(0,240,255,0.06)',position:'relative',overflow:'hidden'}}>
              <div ref={timelineFillRef} style={{height:'100%',width:'0%',background:'var(--wf-cyan)',transition:'width 0.1s linear'}}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
