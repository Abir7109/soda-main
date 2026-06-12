import { useEffect, useRef, useCallback } from 'react'

const PHASES = [
  { id: 0, name: 'BOOT SEQUENCE',    start: 0,     dur: 2000 },
  { id: 1, name: 'LOADING MODULES',  start: 2000,  dur: 2000 },
  { id: 2, name: 'TEST RULES',       start: 4000,  dur: 2500 },
  { id: 3, name: 'COUNTDOWN',         start: 6500,  dur: 2000 },
  { id: 4, name: 'BEGIN',            start: 8500,  dur: Infinity },
]

const TITLE_TEXT = 'IELTS MOCK TEST'
const BOOT_LINES = [
  'INITIALIZING TEST ENVIRONMENT...',
  'LOADING EXAM MODULES...',
  'CALIBRATING TIMING SYSTEMS...',
  'ALL SYSTEMS NOMINAL',
]

export default function WorkflowIELTSMock({ data, onComplete }) {
  const tids = useRef([])
  const rafs = useRef([])
  const hudRef = useRef(null)
  const currentPid = useRef(-1)
  const startTime = useRef(0)
  const titleIdx = useRef(0)
  const bootIdx = useRef(0)
  const countdownVal = useRef(3)
  const dataRef = useRef(data)
  dataRef.current = data

  const ct = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay)
    tids.current.push(id)
    return id
  }, [])

  useEffect(() => {
    return () => {
      tids.current.forEach(clearTimeout)
      rafs.current.forEach(cancelAnimationFrame)
    }
  }, [])

  const e = (sel) => hudRef.current && hudRef.current.querySelector(sel)

  function show(el) { if (el) el.classList.add('active') }
  function hide(el) { if (el) el.classList.remove('active') }

  function startTitleType() {
    const el = e('.wf-im-title .text')
    if (!el) return
    el.textContent = ''
    titleIdx.current = 0
    function type() {
      if (titleIdx.current < TITLE_TEXT.length) {
        el.textContent += TITLE_TEXT[titleIdx.current]
        titleIdx.current++
        ct(type, 50)
      } else {
        const cur = e('.wf-im-title .cursor')
        if (cur) cur.classList.add('done')
      }
    }
    ct(type, 200)
  }

  function startBootSequence() {
    const el = e('.wf-im-boot-text')
    if (!el) return
    bootIdx.current = 0
    function nextLine() {
      if (bootIdx.current < BOOT_LINES.length) {
        el.textContent = BOOT_LINES[bootIdx.current]
        bootIdx.current++
        ct(nextLine, 400)
      }
    }
    ct(nextLine, 300)
  }

  function startCountdown() {
    const el = e('.wf-im-countdown-num')
    if (!el) return
    countdownVal.current = 3
    el.textContent = '3'
    show(e('.wf-im-countdown'))
    function tick() {
      countdownVal.current--
      if (countdownVal.current > 0) {
        el.textContent = String(countdownVal.current)
        ct(tick, 700)
      } else {
        el.textContent = 'GO!'
        el.classList.add('go')
      }
    }
    ct(tick, 700)
  }

  function activatePhase(pid) {
    currentPid.current = pid
    const mod = dataRef.current?.data?.module || 'full'
    switch (pid) {
      case 0:
        show(e('.wf-im-grid'))
        ct(() => show(e('.wf-im-scanline')), 400)
        show(e('.wf-im-title'))
        startTitleType()
        show(e('.wf-im-boot'))
        startBootSequence()
        break
      case 1:
        hide(e('.wf-im-boot'))
        show(e('.wf-im-loader'))
        break
      case 2:
        hide(e('.wf-im-loader'))
        show(e('.wf-im-rules'))
        const m = e('.wf-im-rules-module')
        if (m) m.textContent = 'MODULE: ' + mod.toUpperCase()
        const rules = [
          'Answer all questions',
          'Watch the time — no pauses',
          'Speak clearly and at natural pace',
          'Use a range of vocabulary',
        ]
        const rl = e('.wf-im-rules-list')
        if (rl) {
          rl.innerHTML = ''
          rules.forEach((r, i) => {
            const li = document.createElement('div')
            li.className = 'wf-im-rule-item'
            li.textContent = '■ ' + r
            rl.appendChild(li)
            ct(() => li.classList.add('active'), i * 200)
          })
        }
        break
      case 3:
        hide(e('.wf-im-rules'))
        startCountdown()
        break
      case 4:
        hide(e('.wf-im-countdown'))
        show(e('.wf-im-go'))
        ct(() => { if (onComplete) onComplete() }, 2000)
        break
    }
  }

  useEffect(() => {
    startTime.current = performance.now()
    currentPid.current = -1

    function tick(now) {
      const elapsed = now - startTime.current
      const pid = PHASES.reduce((acc, p) => (elapsed >= p.start ? p.id : acc), 0)
      if (pid !== currentPid.current) {
        activatePhase(pid)
      }
      if (pid < 4) {
        rafs.current.push(requestAnimationFrame(tick))
      }
    }
    rafs.current.push(requestAnimationFrame(tick))

    return () => {
      tids.current.forEach(clearTimeout)
      rafs.current.forEach(cancelAnimationFrame)
      tids.current = []
      rafs.current = []
    }
  }, [])

  return (
    <div className="wf-im-hud" ref={hudRef}>
      <div className="wf-im-grid"></div>
      <div className="wf-im-scanline"></div>

      <div className="wf-im-title"><span className="text"></span><span className="cursor"></span></div>

      <div className="wf-im-boot">
        <div className="wf-im-boot-label">BOOT SEQUENCE</div>
        <div className="wf-im-boot-text"></div>
      </div>

      <div className="wf-im-loader">
        <div className="wf-im-load-label">LOADING TEST MODULES<span>.</span><span>.</span><span>.</span></div>
        <div className="wf-im-load-bar"><div className="wf-im-load-fill"></div></div>
      </div>

      <div className="wf-im-rules">
        <div className="wf-im-rules-module">MODULE: FULL</div>
        <div className="wf-im-rules-title">TEST RULES</div>
        <div className="wf-im-rules-list"></div>
      </div>

      <div className="wf-im-countdown">
        <div className="wf-im-countdown-label">TEST BEGINS IN</div>
        <div className="wf-im-countdown-num">3</div>
      </div>

      <div className="wf-im-go">
        <div className="wf-im-go-text">BEGIN MOCK TEST</div>
        <div className="wf-im-go-sub">Good luck — you've got this</div>
      </div>
    </div>
  )
}
