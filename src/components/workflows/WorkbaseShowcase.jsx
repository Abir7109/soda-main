import { useEffect, useRef, useCallback } from 'react'

const PHASES = [
  { id: 0, name: 'WORKBASE INITIALIZED',       start: 0,    dur: 308  },
  { id: 1, name: 'HOLOGRAPHIC DISPLAY ACTIVATE', start: 308,  dur: 308  },
  { id: 2, name: 'DATABASE CONNECTION',          start: 615, dur: 308  },
  { id: 3, name: 'PROJECT CARDS CASCADE',       start: 923, dur: 923 },
  { id: 4, name: 'DETAIL ANALYSIS',             start: 1846, dur: 923 },
  { id: 5, name: 'INTEL REPORT',                start: 2769, dur: 615 },
  { id: 6, name: 'IDLE',                        start: 3385, dur: 615 },
]

const TOTAL_DURATION = 4000

const DEFAULT_PROJECTS = [
  { name: 'ai-autoresponder', display_name: 'AI AUTORESPONDER', tech_stack: ['Next.js', 'Prisma', 'PostgreSQL'], status: 'Production', description: 'Multi-platform AI auto-responder with 20+ downloads', progress_count: 0 },
  { name: 'guardian-anti-theft', display_name: 'Guardian ANTI THIEF', tech_stack: ['Kotlin', 'Firebase', 'MVVM'], status: 'Production', description: 'Android anti-theft security app with admin panel', progress_count: 0 },
  { name: 'hajj-kafela', display_name: 'Hajj Kafela', tech_stack: ['React', 'Express', 'MongoDB'], status: 'Production', description: 'Hajj/Umrah booking platform serving 40 clicks/day', progress_count: 0 },
  { name: 'wordsnest', display_name: 'WordsNest', tech_stack: ['Kotlin', 'Firebase', 'ML Kit'], status: 'Production', description: 'IELTS vocabulary app with OCR scanning', progress_count: 0 },
]

export default function WorkbaseShowcase({ data, onComplete }) {
  const tids = useRef([])
  const rafs = useRef([])
  const hudRef = useRef(null)
  const phaseLabelRef = useRef(null)
  const timelineFillRef = useRef(null)
  const gridBgRef = useRef(null)
  const scanlineRef = useRef(null)
  const flashOverlayRef = useRef(null)
  const intelFlashRef = useRef(null)
  const titleBarRef = useRef(null)
  const hudFrameRef = useRef(null)
  const cornerRefs = useRef([])
  const edgeGlowRefs = useRef([])
  const panelConnectRef = useRef(null)
  const panelCardsRef = useRef(null)
  const panelDetailRef = useRef(null)
  const panelSummaryRef = useRef(null)
  const cardsBodyRef = useRef(null)
  const cardsTotalRef = useRef(null)
  const detailNameRef = useRef(null)
  const detailTechRef = useRef(null)
  const detailStatusRef = useRef(null)
  const detailDescRef = useRef(null)
  const dbIconRef = useRef(null)
  const dbLatencyRef = useRef(null)
  const dbRecordsRef = useRef(null)
  const dbStatusRef = useRef(null)
  const summaryTextRef = useRef(null)
  const summaryGridRef = useRef(null)
  const idleStateRef = useRef(null)
  const idleAvatarRef = useRef(null)
  const idleGreetingRef = useRef(null)
  const idleInputRef = useRef(null)
  const idleWfBarRef = useRef(null)
  const idleCountRef = useRef(null)
  const currentPhase = useRef(-1)
  const startTime = useRef(0)

  function a(el, ...classes) { if (el) { el.style.opacity = '1'; if (classes.length) el.classList.add(...classes); else el.classList.add('active'); } return el }
  function d(el, ...classes) { if (el) { el.style.opacity = '0'; if (classes.length) el.classList.remove(...classes); else el.classList.remove('active'); } return el }

  const ct = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms)
    tids.current.push(id)
    return id
  }, [])

  const raf = useCallback((fn) => {
    const id = requestAnimationFrame(fn)
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
    if (phaseLabelRef.current) phaseLabelRef.current.textContent = '\u25A0 ' + phase.name
    const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100)
    if (timelineFillRef.current) timelineFillRef.current.style.width = pct + '%'
  }

  function animateCounter(el, target, duration = 800) {
    const s = performance.now()
    function tick(now) {
      const t = Math.min((now - s) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      el.textContent = Math.round(eased * target)
      if (t < 1) raf(tick)
      else el.textContent = target
    }
    raf(tick)
  }

  function activatePhase(pid) {
    switch (pid) {
      case 0:
        if (gridBgRef.current) a(gridBgRef.current)
        if (scanlineRef.current) a(scanlineRef.current)
        if (intelFlashRef.current) a(intelFlashRef.current)
        break
      case 1:
        if (titleBarRef.current) a(titleBarRef.current)
        if (hudFrameRef.current) a(hudFrameRef.current)
        animateFrame()
        break
      case 2:
        if (panelConnectRef.current) {
          a(panelConnectRef.current)
          panelConnectRef.current.style.animation = 'wf-panel-glow 3s ease-in-out infinite'
        }
        animateDatabase()
        break
      case 3:
        if (panelCardsRef.current) {
          a(panelCardsRef.current)
          panelCardsRef.current.style.animation = 'wf-panel-glow 3s ease-in-out infinite'
        }
        buildProjectCards()
        break
      case 4:
        if (panelDetailRef.current) {
          a(panelDetailRef.current)
          panelDetailRef.current.style.animation = 'wf-panel-glow 3s ease-in-out infinite'
        }
        showDetail()
        break
      case 5:
        startSummary()
        break
      case 6:
        transitionToIdle()
        break
    }
  }

  function animateFrame() {
    cornerRefs.current.forEach((c, i) => {
      ct(() => { if (c) a(c, 'slide-in') }, i * 80)
    })
    ct(() => { if (edgeGlowRefs.current[0]) a(edgeGlowRefs.current[0]) }, 300)
    ct(() => { if (edgeGlowRefs.current[1]) a(edgeGlowRefs.current[1]) }, 550)
    ct(() => { if (edgeGlowRefs.current[2]) a(edgeGlowRefs.current[2]) }, 800)
    ct(() => { if (edgeGlowRefs.current[3]) a(edgeGlowRefs.current[3]) }, 1050)
  }

  function animateDatabase() {
    ct(() => {
      if (dbIconRef.current) a(dbIconRef.current)
      if (dbLatencyRef.current) dbLatencyRef.current.textContent = '7ms'
      if (dbRecordsRef.current) {
        const count = projects.length
        animateCounter(dbRecordsRef.current, count, 800)
      }
      if (dbStatusRef.current) {
        dbStatusRef.current.textContent = '\u25CF ONLINE'
        dbStatusRef.current.style.color = 'var(--wf-green)'
      }
    }, 400)
  }

  const projects = data?.projects && data.projects.length > 0
    ? data.projects
    : DEFAULT_PROJECTS

  function buildProjectCards() {
    const body = cardsBodyRef.current
    if (!body) return

    projects.forEach((proj, i) => {
      const card = document.createElement('div')
      card.style.cssText = 'opacity:0;transform:translateY(8px);transition:opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1);padding:5px 8px;margin-bottom:4px;background:rgba(0,240,255,0.02);border:1px solid rgba(0,240,255,0.06);display:flex;align-items:center;gap:6px'
      card.innerHTML = `
        <span style="width:16px;height:16px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;background:rgba(var(--wf-cyan-rgb,0,240,255),0.06);border:1px solid rgba(0,240,255,0.08)">${i + 1}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:9;color:var(--wf-cyan);letter-spacing:1;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${proj.display_name || proj.name}</div>
          <div style="font-size:7;color:rgba(0,240,255,0.35);letter-spacing:0.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${proj.description || ''}</div>
        </div>
        <span style="font-size:7;padding:1px 4px;border:1px solid rgba(0,240,255,0.1);color:${proj.status === 'Production' ? 'var(--wf-green)' : 'var(--wf-amber)'};letter-spacing:1">${proj.status || 'Tracked'}</span>
      `
      body.appendChild(card)
      ct(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)' }, i * 120)
    })

    if (cardsTotalRef.current) cardsTotalRef.current.textContent = String(projects.length)
  }

  function showDetail() {
    if (detailNameRef.current) {
      const names = projects.map(p => p.display_name || p.name)
      let i = 0
      const interval = setInterval(() => {
        if (detailNameRef.current) detailNameRef.current.textContent = names[i % names.length]
        i++
        if (i >= names.length) clearInterval(interval)
      }, 400)
      tids.current.push(interval)
    }

    const allTech = [...new Set(projects.flatMap(p => p.tech_stack || []))]
    if (detailTechRef.current) detailTechRef.current.textContent = allTech.slice(0, 6).join(' \u00B7 ') + (allTech.length > 6 ? ` +${allTech.length - 6}` : '')

    const prodCount = projects.filter(p => p.status === 'Production').length
    if (detailStatusRef.current) detailStatusRef.current.textContent = prodCount + '/' + projects.length + ' in production'

    if (detailDescRef.current) {
      const descriptions = projects.map(p => p.description || '').filter(Boolean)
      detailDescRef.current.textContent = descriptions.join(' \u2022 ') || 'All projects loaded and tracked.'
    }
  }

  function startSummary() {
    if (panelSummaryRef.current) a(panelSummaryRef.current)

    const textEl = summaryTextRef.current
    if (!textEl) return
    textEl.innerHTML = ''

    const prodCount = projects.filter(p => p.status === 'Production').length
    const techSet = new Set(projects.flatMap(p => p.tech_stack || []))
    const summary = `Workbase active. ${projects.length} projects tracked, ${prodCount} in production across ${techSet.size} technologies.`

    for (let i = 0; i < summary.length; i++) {
      const span = document.createElement('span')
      span.style.cssText = 'opacity:0;transition:opacity 0.02s'
      span.textContent = summary[i] === ' ' ? '\u00A0' : summary[i]
      textEl.appendChild(span)
    }

    const chars = textEl.querySelectorAll('span')
    chars.forEach((c, i) => {
      ct(() => c.style.opacity = '1', i * 10)
    })

    const grid = summaryGridRef.current
    if (grid) {
      const items = [
        '\u2605 ' + projects.length + ' Projects',
        '\u2705 ' + prodCount + ' Production',
        '\uD83D\uDD25 ' + techSet.size + ' Technologies',
        '\uD83D\uDCCA Status: NOMINAL',
      ]
      items.forEach((s, i) => {
        const el = document.createElement('span')
        el.style.cssText = 'font-size:8px;color:rgba(0,240,255,0.5);letter-spacing:1px;opacity:0;transform:translateX(-6px);transition:opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)'
        el.textContent = s
        grid.appendChild(el)
        ct(() => { el.style.opacity = '1'; el.style.transform = 'translateX(0)' }, 800 + i * 150)
      })
    }

    ct(() => transitionToIdle(), 2000)
  }

  function transitionToIdle() {
    const panels = [panelConnectRef, panelCardsRef, panelDetailRef, panelSummaryRef]
    panels.forEach(p => {
      if (p.current) {
        d(p.current)
        p.current.style.animation = ''
      }
    })
    if (titleBarRef.current) d(titleBarRef.current)
    if (hudFrameRef.current) d(hudFrameRef.current)
    if (scanlineRef.current) d(scanlineRef.current)
    if (gridBgRef.current) d(gridBgRef.current)
    if (intelFlashRef.current) d(intelFlashRef.current)

    if (idleStateRef.current) a(idleStateRef.current)
    if (idleCountRef.current) idleCountRef.current.textContent = String(projects.length)

    ct(() => { if (idleAvatarRef.current) a(idleAvatarRef.current) }, 300)
    ct(() => { if (idleGreetingRef.current) a(idleGreetingRef.current) }, 600)
    ct(() => { if (idleInputRef.current) a(idleInputRef.current) }, 800)
    ct(() => { if (idleWfBarRef.current) a(idleWfBarRef.current) }, 1000)

    ct(() => { if (onComplete) onComplete() }, 2000)
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
    <div className="wf-hud" ref={hudRef}>
      <div className="wf-grid-bg" ref={gridBgRef}></div>
      <div className="wf-scanline" ref={scanlineRef}></div>

      <div ref={flashOverlayRef} style={{position:'absolute',inset:0,background:'rgba(0,240,255,0.06)',opacity:0,pointerEvents:'none',zIndex:50,animation:'wf-hud-flash 0.25s ease-out forwards'}}></div>

      <div ref={intelFlashRef} style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:30,opacity:0,pointerEvents:'none',animation:'wf-hud-flash 0.5s ease-out forwards'}}>
        <div style={{fontSize:22,fontWeight:'bold',letterSpacing:6,color:'var(--wf-cyan)',textShadow:'0 0 40px rgba(0,240,255,0.4), 0 0 80px rgba(0,240,255,0.15)',whiteSpace:'nowrap'}}>
          &#9670; WORKBASE INITIALIZED
        </div>
      </div>

      <div ref={titleBarRef} style={{position:'absolute',left:40,top:20,zIndex:20,opacity:0,transition:'opacity 0.3s'}}>
        <span style={{fontSize:14,marginRight:8}}>&#9670;</span>
        <span style={{fontSize:13,fontWeight:'bold',letterSpacing:4,color:'var(--wf-cyan)',textShadow:'0 0 20px rgba(0,240,255,0.25)'}}>WORKBASE</span>
        <div style={{fontSize:9,letterSpacing:3,color:'rgba(0,240,255,0.35)',marginTop:4}}>PROJECT TRACKING SYSTEM</div>
      </div>

      <svg ref={hudFrameRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:15,pointerEvents:'none',opacity:0,transition:'opacity 0.2s'}} viewBox="0 0 960 600" preserveAspectRatio="xMidYMid meet">
        <g ref={el => cornerRefs.current[0] = el} className="wf-corner" style={{transform:'translate(-60px,-60px)',opacity:0}}>
          <line x1="16" y1="40" x2="52" y2="40" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="16" y1="40" x2="16" y2="76" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g ref={el => cornerRefs.current[1] = el} className="wf-corner" style={{transform:'translate(60px,-60px)',opacity:0}}>
          <line x1="944" y1="40" x2="908" y2="40" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="944" y1="40" x2="944" y2="76" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g ref={el => cornerRefs.current[2] = el} className="wf-corner" style={{transform:'translate(-60px,60px)',opacity:0}}>
          <line x1="16" y1="560" x2="52" y2="560" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="16" y1="560" x2="16" y2="524" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g ref={el => cornerRefs.current[3] = el} className="wf-corner" style={{transform:'translate(60px,60px)',opacity:0}}>
          <line x1="944" y1="560" x2="908" y2="560" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="944" y1="560" x2="944" y2="524" stroke="var(--wf-cyan)" strokeWidth="2" strokeLinecap="round"/>
        </g>
      </svg>

      <div ref={el => edgeGlowRefs.current[0] = el} style={{position:'absolute',top:40,left:52,width:8,height:8,borderRadius:'50%',background:'var(--wf-cyan)',boxShadow:'0 0 20px var(--wf-cyan), 0 0 40px rgba(0,240,255,0.3)',opacity:0,zIndex:16,pointerEvents:'none',transition:'opacity 0.3s'}}></div>
      <div ref={el => edgeGlowRefs.current[1] = el} style={{position:'absolute',top:84,right:16,width:8,height:8,borderRadius:'50%',background:'var(--wf-cyan)',boxShadow:'0 0 20px var(--wf-cyan), 0 0 40px rgba(0,240,255,0.3)',opacity:0,zIndex:16,pointerEvents:'none',transition:'opacity 0.3s'}}></div>
      <div ref={el => edgeGlowRefs.current[2] = el} style={{position:'absolute',bottom:40,right:52,width:8,height:8,borderRadius:'50%',background:'var(--wf-cyan)',boxShadow:'0 0 20px var(--wf-cyan), 0 0 40px rgba(0,240,255,0.3)',opacity:0,zIndex:16,pointerEvents:'none',transition:'opacity 0.3s'}}></div>
      <div ref={el => edgeGlowRefs.current[3] = el} style={{position:'absolute',bottom:84,left:16,width:8,height:8,borderRadius:'50%',background:'var(--wf-cyan)',boxShadow:'0 0 20px var(--wf-cyan), 0 0 40px rgba(0,240,255,0.3)',opacity:0,zIndex:16,pointerEvents:'none',transition:'opacity 0.3s'}}></div>

      <div ref={panelConnectRef} className="wf-panel" style={{position:'absolute',left:'2.5%',top:'8.7%',width:'95%',height:'13.3%',background:'var(--wf-panel-bg)',border:'1px solid rgba(0,240,255,0.1)',boxShadow:'0 0 10px rgba(0,240,255,0.03), inset 0 0 10px rgba(0,240,255,0.02)',opacity:0,zIndex:20,transition:'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',transform:'translateY(12px)'}}>
        <div style={{padding:'6px 10px',fontSize:8,letterSpacing:2,borderBottom:'1px solid rgba(0,240,255,0.08)',color:'rgba(0,240,255,0.6)',display:'flex',alignItems:'center',gap:5}}>
          <span style={{fontSize:10}}>&#128279;</span> WORKBASE CONNECTION
        </div>
        <div style={{padding:'8px 10px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,height:36}}>
            <div style={{flex:1,height:2,background:'linear-gradient(90deg, transparent, var(--wf-cyan), transparent)',opacity:0.3}}></div>
            <div ref={dbIconRef} style={{display:'flex',alignItems:'center',gap:6,opacity:0,transform:'scale(0)',transition:'opacity 0.3s cubic-bezier(0.34,1.56,0.64,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1)'}}>
              <span style={{fontSize:16}}>&#9673;</span>
              <span style={{fontSize:11,fontWeight:'bold',letterSpacing:2,color:'var(--wf-cyan)'}}>WORKBASE ENGINE</span>
              <span style={{fontSize:16}}>&#9673;</span>
            </div>
            <div style={{flex:1,height:2,background:'linear-gradient(90deg, transparent, var(--wf-cyan), transparent)',opacity:0.3}}></div>
          </div>
          <div style={{display:'flex',gap:14,marginTop:4,paddingTop:4,borderTop:'1px solid rgba(0,240,255,0.04)'}}>
            <div style={{fontSize:9,color:'rgba(0,240,255,0.4)',letterSpacing:1}}>&#8597; Latency: <span ref={dbLatencyRef} style={{color:'var(--wf-cyan)'}}>--</span></div>
            <div style={{fontSize:9,color:'rgba(0,240,255,0.4)',letterSpacing:1}}>&#128202; Projects: <span ref={dbRecordsRef} style={{color:'var(--wf-cyan)'}}>--</span></div>
            <div style={{fontSize:9,color:'rgba(0,240,255,0.4)',letterSpacing:1}}>&#128273; Status: <span ref={dbStatusRef} style={{color:'var(--wf-amber)'}}>&#9679; PENDING</span></div>
          </div>
        </div>
      </div>

      <div ref={panelCardsRef} className="wf-panel" style={{position:'absolute',left:'2.5%',top:'24.3%',width:'47%',height:'38.3%',background:'var(--wf-panel-bg)',border:'1px solid rgba(0,240,255,0.1)',boxShadow:'0 0 10px rgba(0,240,255,0.03), inset 0 0 10px rgba(0,240,255,0.02)',opacity:0,zIndex:20,transition:'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',transform:'translateY(12px)'}}>
        <div style={{padding:'6px 10px',fontSize:8,letterSpacing:2,borderBottom:'1px solid rgba(0,240,255,0.08)',color:'rgba(0,240,255,0.6)',display:'flex',alignItems:'center',gap:5}}>
          <span style={{fontSize:10}}>&#128187;</span> PROJECT INDEX
        </div>
        <div style={{padding:'8px 10px',overflow:'auto',maxHeight:'calc(100% - 30px)'}}>
          <div ref={cardsBodyRef}></div>
          <div style={{marginTop:4,paddingTop:4,borderTop:'1px solid rgba(0,240,255,0.06)',fontSize:8,color:'rgba(0,240,255,0.4)',display:'flex',gap:12}}>
            Total Projects: <span ref={cardsTotalRef} style={{color:'var(--wf-cyan)'}}>--</span>
          </div>
        </div>
      </div>

      <div ref={panelDetailRef} className="wf-panel" style={{position:'absolute',left:'51.5%',top:'24.3%',width:'46%',height:'38.3%',background:'var(--wf-panel-bg)',border:'1px solid rgba(0,240,255,0.1)',boxShadow:'0 0 10px rgba(0,240,255,0.03), inset 0 0 10px rgba(0,240,255,0.02)',opacity:0,zIndex:20,transition:'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',transform:'translateY(12px)'}}>
        <div style={{padding:'6px 10px',fontSize:8,letterSpacing:2,borderBottom:'1px solid rgba(0,240,255,0.08)',color:'rgba(0,240,255,0.6)',display:'flex',alignItems:'center',gap:5}}>
          <span style={{fontSize:10}}>&#128269;</span> DETAIL ANALYSIS
        </div>
        <div style={{padding:'8px 10px'}}>
          <div style={{marginBottom:6}}>
            <div style={{fontSize:7,color:'rgba(0,240,255,0.3)',letterSpacing:1,marginBottom:2}}>PROJECTS ROTATING</div>
            <div ref={detailNameRef} style={{fontSize:16,fontWeight:'bold',color:'var(--wf-cyan)',letterSpacing:2,textShadow:'0 0 10px rgba(0,240,255,0.15)',minHeight:24}}></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1px 8px',fontSize:8,marginBottom:6}}>
            <div style={{color:'rgba(0,240,255,0.4)',letterSpacing:1}}>&#128736; Tech: <span ref={detailTechRef} style={{color:'rgba(0,240,255,0.7)',fontSize:7,lineHeight:1.4,display:'inline-block',wordBreak:'break-all'}}></span></div>
            <div style={{color:'rgba(0,240,255,0.4)',letterSpacing:1}}>&#128200; Status: <span ref={detailStatusRef} style={{color:'var(--wf-green)'}}></span></div>
          </div>
          <div style={{marginTop:4,paddingTop:4,borderTop:'1px solid rgba(0,240,255,0.04)',display:'flex',alignItems:'center',gap:6,fontSize:8}}>
            <span style={{color:'rgba(0,240,255,0.4)',letterSpacing:1}}>DESCRIPTION</span>
            <div ref={detailDescRef} style={{flex:1,fontSize:8,color:'rgba(0,240,255,0.6)',lineHeight:1.4,letterSpacing:0.5}}></div>
          </div>
        </div>
      </div>

      <div ref={panelSummaryRef} className="wf-panel" style={{position:'absolute',left:'2.5%',top:'65%',width:'95%',height:'18.3%',background:'var(--wf-panel-bg)',border:'1px solid rgba(0,240,255,0.1)',boxShadow:'0 0 10px rgba(0,240,255,0.03), inset 0 0 10px rgba(0,240,255,0.02)',opacity:0,zIndex:20,transition:'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',transform:'translateY(12px)'}}>
        <div style={{padding:'6px 10px',fontSize:8,letterSpacing:2,borderBottom:'1px solid rgba(0,240,255,0.08)',color:'rgba(0,240,255,0.6)',display:'flex',alignItems:'center',gap:5}}>
          <span style={{fontSize:10}}>&#128172;</span> INTEL SUMMARY
        </div>
        <div style={{padding:'8px 10px'}}>
          <div style={{display:'flex',gap:8,padding:'6px 8px',marginBottom:6,background:'rgba(0,240,255,0.02)',border:'1px solid rgba(0,240,255,0.05)'}}>
            <div style={{width:28,height:28,flexShrink:0,background:'rgba(0,240,255,0.04)',border:'1px solid rgba(0,240,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>&#9670;</div>
            <div ref={summaryTextRef} style={{fontSize:10,color:'rgba(0,240,255,0.7)',lineHeight:1.5,letterSpacing:0.5,flex:1}}></div>
          </div>
          <div ref={summaryGridRef} style={{display:'flex',gap:10,flexWrap:'wrap'}}></div>
        </div>
      </div>

      <div ref={idleStateRef} style={{position:'absolute',inset:0,zIndex:25,opacity:0,transition:'opacity 0.5s',pointerEvents:'none'}}>
        <div style={{position:'absolute',top:20,left:40,right:40,display:'flex',alignItems:'center'}}>
          <span style={{fontSize:11,letterSpacing:4,color:'var(--wf-cyan)',fontWeight:'bold',textShadow:'0 0 15px rgba(0,240,255,0.3)'}}>&#9650; WORKBASE</span>
          <div style={{marginLeft:'auto',display:'flex',gap:14,fontSize:9,letterSpacing:1}}>
            <span>&#9733; <span ref={idleCountRef} style={{color:'var(--wf-cyan)'}}>--</span> projects</span>
            <span>&#9632; <span style={{color:'var(--wf-cyan)'}}>NOMINAL</span></span>
            <span>&#128202; <span style={{color:'var(--wf-cyan)'}}>TRACKING</span></span>
          </div>
        </div>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
          <div ref={idleAvatarRef} style={{position:'relative',width:72,height:72,margin:'0 auto 14px',background:'rgba(0,240,255,0.02)',border:'2px solid rgba(0,240,255,0.12)',boxShadow:'0 0 24px rgba(0,240,255,0.04), inset 0 0 24px rgba(0,240,255,0.02)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transform:'scale(0)',transition:'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div style={{width:9,height:13,background:'var(--wf-cyan)',borderRadius:'50%',boxShadow:'0 0 10px rgba(0,240,255,0.3)'}}></div>
            <div style={{width:9,height:13,background:'var(--wf-cyan)',borderRadius:'50%',boxShadow:'0 0 10px rgba(0,240,255,0.3)'}}></div>
            <div style={{position:'absolute',bottom:18,left:'50%',width:20,height:2,background:'rgba(0,240,255,0.3)',transform:'translateX(-50%)'}}></div>
          </div>
          <div ref={idleGreetingRef} style={{fontSize:12,color:'rgba(0,240,255,0.7)',letterSpacing:2,textShadow:'0 0 15px rgba(0,240,255,0.1)',opacity:0,transition:'opacity 0.4s 0.3s'}}>"Project database indexed, sir. All entries nominal."</div>
        </div>
        <div ref={idleInputRef} style={{position:'absolute',bottom:44,left:100,right:100,height:28,border:'1px solid rgba(0,240,255,0.08)',background:'rgba(0,240,255,0.015)',display:'flex',alignItems:'center',padding:'0 10px',opacity:0,transition:'opacity 0.4s 0.4s'}}>
          <span style={{fontSize:9,color:'rgba(0,240,255,0.25)',letterSpacing:1}}>&#9612; Awaiting project command...</span>
          <span style={{display:'inline-block',width:5,height:12,background:'var(--wf-cyan)',marginLeft:3,animation:'wf-cursor-blink 0.53s step-end infinite'}}></span>
        </div>
        <div ref={idleWfBarRef} style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',display:'flex',gap:6,opacity:0,transition:'opacity 0.3s 0.5s'}}>
          {['\uD83D\uDCC1List','\uD83D\uDD0DSearch','\uD83D\uDD04Refresh','\uD83D\uDCCBExport'].map((label, i) => (
            <span key={i} style={{fontSize:7,letterSpacing:1,padding:'2px 6px',border:'1px solid rgba(0,240,255,0.06)',color:'rgba(0,240,255,0.25)',background:'transparent'}}>{label}</span>
          ))}
        </div>
      </div>

      <div style={{position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',display:'flex',alignItems:'center',gap:12,zIndex:60}}>
        <span ref={phaseLabelRef} style={{fontSize:10,color:'rgba(0,240,255,0.5)',letterSpacing:2,minWidth:200}}>&#9632; WORKBASE</span>
        <div style={{flex:1,height:4,width:200,background:'rgba(0,240,255,0.06)',border:'1px solid rgba(0,240,255,0.06)',position:'relative',overflow:'hidden'}}>
          <div ref={timelineFillRef} style={{height:'100%',width:'0%',background:'var(--wf-cyan)',transition:'width 0.1s linear'}}></div>
        </div>
      </div>
    </div>
  )
}
