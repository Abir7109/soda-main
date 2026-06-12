import { useEffect, useRef } from 'react'
import socket from '../../services/SocketService'

const TITLE_TEXT = 'IELTS SPEAKING TEST'
const LISTEN_DURATION = 20

export default function WorkflowIELTSSpeaking({ data, onComplete }) {
  const hudRef = useRef(null)
  const els = useRef({})
  const dataRef = useRef(data)
  const rafId = useRef(null)
  const typingId = useRef(null)
  const fadeId = useRef(null)
  const completeTimer = useRef(null)
  const currentPart = useRef(0)
  const phaseStart = useRef(0)
  const subPhase = useRef(null)
  const speakingActivated = useRef(false)
  const completeFired = useRef(false)
  const lastTimerStr = useRef('')
  const emittedExpiry = useRef({})
  dataRef.current = data

  function sh(el) { if (el) el.classList.add('active') }
  function hi(el) { if (el) el.classList.remove('active') }

  function hideAllParts() {
    hi(els.current.part1); hi(els.current.part2); hi(els.current.part3); hi(els.current.complete)
  }

  function showPart(part) {
    hideAllParts()
    if (part === 1) sh(els.current.part1)
    else if (part === 2) sh(els.current.part2)
    else if (part === 3) sh(els.current.part3)
    else if (part === 0) sh(els.current.complete)
  }

  function setDotActive(part) {
    const dots = els.current.timelineDots
    if (!dots) return
    for (let i = 0; i < dots.length; i++) dots[i].classList.remove('active')
    const active = hudRef.current?.querySelector('.wf-is-timeline-dot.p' + part)
    if (active) active.classList.add('active')
  }

  function activatePart(part) {
    const e = els.current
    const cd = dataRef.current?.data
    showPart(part)
    sh(e.speakingIndicator)
    sh(e.timer)

    if (part === 1) {
      if (e.phaseLabel) e.phaseLabel.textContent = 'LISTENING'
      if (cd?.topic && e.topicLabel) e.topicLabel.textContent = cd.topic
      if (e.part1Questions) {
        e.part1Questions.innerHTML = ''
        const qs = cd?.questions || []
        qs.forEach((q, i) => {
          const item = document.createElement('div')
          item.className = 'wf-is-question-item'
          item.textContent = '\u25b8 ' + q
          e.part1Questions.appendChild(item)
          setTimeout(() => item.classList.add('active'), i * 200 + 200)
        })
      }
      setDotActive(1)
    }

    if (part === 2) {
      if (e.phaseLabel) e.phaseLabel.textContent = 'PREPARATION'
      if (cd?.topic && e.cueTopic) e.cueTopic.textContent = cd.topic
      if (e.bulletList) {
        e.bulletList.innerHTML = ''
        const pts = cd?.bullet_points || []
        pts.forEach((p, i) => {
          const item = document.createElement('div')
          item.className = 'wf-is-bullet-item'
          item.textContent = '\u2022 ' + p
          e.bulletList.appendChild(item)
          setTimeout(() => item.classList.add('active'), i * 200 + 200)
        })
      }
      speakingActivated.current = false
      setDotActive(2)
    }

    if (part === 3) {
      if (e.phaseLabel) e.phaseLabel.textContent = 'LISTENING'
      if (e.part3Questions) {
        e.part3Questions.innerHTML = ''
        const qs = cd?.questions || []
        qs.forEach((q, i) => {
          const item = document.createElement('div')
          item.className = 'wf-is-question-item'
          item.textContent = '\u25b8 ' + q
          e.part3Questions.appendChild(item)
          setTimeout(() => item.classList.add('active'), i * 200 + 200)
        })
      }
      setDotActive(3)
    }

    phaseStart.current = performance.now()
    subPhase.current = null
    emittedExpiry.current = {}
  }

  function updateTimer(remaining, label) {
    const e = els.current
    if (!e.timerValue || !e.timerLabel) return
    const m = Math.floor(remaining / 60)
    const s = Math.floor(remaining % 60)
    const str = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
    if (str !== lastTimerStr.current) {
      e.timerValue.textContent = str
      lastTimerStr.current = str
    }
    if (e.timerLabel.textContent !== (label || '')) {
      e.timerLabel.textContent = label || ''
    }
  }

  function emitTimerExpired(part) {
    if (emittedExpiry.current[part]) return
    emittedExpiry.current[part] = true
    const cd = dataRef.current?.data || {}
    socket.emit('speaking_timer_expired', {
      part,
      topic: cd.topic || '',
      questions: cd.questions || cd.bullet_points || []
    })
    if (part === 3) {
      completeTimer.current = setTimeout(() => {
        if (!completeFired.current) finalizeComplete()
      }, 8000)
    }
  }

  function finalizeComplete() {
    if (completeFired.current) return
    completeFired.current = true
    const e = els.current
    hideAllParts()
    sh(e.complete)
    hi(e.speakingIndicator)
    hi(e.timer)
    hi(e.phaseLabel)
    completeTimer.current = setTimeout(() => {
      if (onComplete) onComplete()
    }, 3000)
  }

  function getSpeakDuration(cd, cp) {
    if (cp === 1) return cd.time_limit_seconds || 240
    if (cp === 2) return (cd.prep_time_seconds || 60) + (cd.speak_time_seconds || 120)
    if (cp === 3) return cd.time_limit_seconds || 300
    return 240
  }

  useEffect(() => {
    const e = {}
    e.grid = hudRef.current?.querySelector('.wf-is-grid')
    e.scanline = hudRef.current?.querySelector('.wf-is-scanline')
    e.title = hudRef.current?.querySelector('.wf-is-title')
    e.titleText = hudRef.current?.querySelector('.wf-is-title .text')
    e.titleCursor = hudRef.current?.querySelector('.wf-is-title .cursor')
    e.timelineBar = hudRef.current?.querySelector('.wf-is-timeline-bar')
    e.part1 = hudRef.current?.querySelector('.wf-is-part1')
    e.part2 = hudRef.current?.querySelector('.wf-is-part2')
    e.part3 = hudRef.current?.querySelector('.wf-is-part3')
    e.topicLabel = hudRef.current?.querySelector('.wf-is-topic-label')
    e.part1Questions = hudRef.current?.querySelector('.wf-is-part1-questions')
    e.cueTopic = hudRef.current?.querySelector('.wf-is-cue-topic')
    e.bulletList = hudRef.current?.querySelector('.wf-is-bullet-list')
    e.part3Questions = hudRef.current?.querySelector('.wf-is-part3-questions')
    e.timer = hudRef.current?.querySelector('.wf-is-timer')
    e.timerLabel = hudRef.current?.querySelector('.wf-is-timer-label')
    e.timerValue = hudRef.current?.querySelector('.wf-is-timer-value')
    e.phaseLabel = hudRef.current?.querySelector('.wf-is-phase-label')
    e.speakingIndicator = hudRef.current?.querySelector('.wf-is-speaking-indicator')
    e.speakingDot = hudRef.current?.querySelector('.wf-is-speaking-indicator .wf-is-dot')
    e.complete = hudRef.current?.querySelector('.wf-is-complete')
    e.timelineDots = hudRef.current?.querySelectorAll('.wf-is-timeline-dot')
    els.current = e

    sh(e.grid)
    fadeId.current = setTimeout(() => sh(e.scanline), 400)
    sh(e.title)
    sh(e.timelineBar)

    if (e.titleText) {
      e.titleText.textContent = ''
      let idx = 0
      function typeTitle() {
        if (idx < TITLE_TEXT.length) {
          e.titleText.textContent += TITLE_TEXT[idx]
          idx++
          typingId.current = setTimeout(typeTitle, 55)
        } else if (e.titleCursor) {
          e.titleCursor.classList.add('done')
        }
      }
      typingId.current = setTimeout(typeTitle, 300)
    }

    function tick(now) {
      const newPart = dataRef.current?.data?.part || 0

      if (newPart !== currentPart.current) {
        currentPart.current = newPart
        if (newPart > 0) activatePart(newPart)
      }

      const cp = currentPart.current
      if (cp > 0 && !completeFired.current) {
        const cd = dataRef.current?.data || {}
        const elapsed = (now - phaseStart.current) / 1000
        const e = els.current

        if (cp === 2) {
          const prepTime = cd.prep_time_seconds || 60
          const speakTime = cd.speak_time_seconds || 120
          if (!emittedExpiry.current[2]) {
            if (elapsed < prepTime) {
              if (subPhase.current !== 'prep') {
                subPhase.current = 'prep'
                speakingActivated.current = false
                if (e.phaseLabel) e.phaseLabel.textContent = 'PREPARATION'
              }
              updateTimer(prepTime - elapsed, 'PREPARATION')
            } else if (elapsed < prepTime + speakTime) {
              if (subPhase.current !== 'speak') {
                subPhase.current = 'speak'
                speakingActivated.current = true
                if (e.phaseLabel) e.phaseLabel.textContent = 'SPEAKING'
                if (e.speakingDot) e.speakingDot.classList.add('recording')
              }
              updateTimer(prepTime + speakTime - elapsed, 'SPEAKING')
            } else {
              updateTimer(0, 'TIME UP')
              if (e.phaseLabel) e.phaseLabel.textContent = 'EVALUATING...'
              emitTimerExpired(2)
            }
          }
        } else {
          const speakDuration = getSpeakDuration(cd, cp)
          if (!emittedExpiry.current[cp]) {
            if (elapsed < LISTEN_DURATION) {
              if (subPhase.current !== 'listen') {
                subPhase.current = 'listen'
                speakingActivated.current = false
                if (e.speakingDot) e.speakingDot.classList.remove('recording')
                if (e.phaseLabel) e.phaseLabel.textContent = 'LISTENING'
              }
              updateTimer(speakDuration, 'SPEAKING')
            } else {
              const speakElapsed = elapsed - LISTEN_DURATION
              const remaining = speakDuration - speakElapsed
              if (remaining > 0) {
                if (subPhase.current !== 'speak') {
                  subPhase.current = 'speak'
                  speakingActivated.current = true
                  if (e.phaseLabel) e.phaseLabel.textContent = 'SPEAKING'
                  if (e.speakingDot) e.speakingDot.classList.add('recording')
                }
                updateTimer(remaining, 'SPEAKING')
              } else {
                updateTimer(0, 'TIME UP')
                if (e.phaseLabel) e.phaseLabel.textContent = 'EVALUATING...'
                emitTimerExpired(cp)
              }
            }
          }
        }
      }

      if (!completeFired.current) {
        rafId.current = requestAnimationFrame(tick)
      }
    }

    rafId.current = requestAnimationFrame(tick)

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      if (typingId.current) clearTimeout(typingId.current)
      if (fadeId.current) clearTimeout(fadeId.current)
      if (completeTimer.current) clearTimeout(completeTimer.current)
    }
  }, [])

  return (
    <div className="wf-is-hud" ref={hudRef}>
      <div className="wf-is-grid"></div>
      <div className="wf-is-scanline"></div>

      <div className="wf-is-title"><span className="text"></span><span className="cursor"></span></div>

      <div className="wf-is-part1">
        <div className="wf-is-badge">PART 1 \u00b7 INTERVIEW</div>
        <div className="wf-is-topic-label"></div>
        <div className="wf-is-part1-questions"></div>
      </div>

      <div className="wf-is-part2">
        <div className="wf-is-badge">PART 2 \u00b7 LONG TURN</div>
        <div className="wf-is-cue-topic"></div>
        <div className="wf-is-bullet-list"></div>
      </div>

      <div className="wf-is-part3">
        <div className="wf-is-badge">PART 3 \u00b7 DISCUSSION</div>
        <div className="wf-is-part3-questions"></div>
      </div>

      <div className="wf-is-timer">
        <div className="wf-is-timer-label">PREPARATION</div>
        <div className="wf-is-timer-value">01:00</div>
      </div>

      <div className="wf-is-phase-label">LISTENING</div>

      <div className="wf-is-speaking-indicator">
        <div className="wf-is-dot"></div>
        <span>SPEAKING</span>
      </div>

      <div className="wf-is-timeline-bar">
        <div className="wf-is-timeline-dot p1">P1</div>
        <div className="wf-is-timeline-line"></div>
        <div className="wf-is-timeline-dot p2">P2</div>
        <div className="wf-is-timeline-line"></div>
        <div className="wf-is-timeline-dot p3">P3</div>
      </div>

      <div className="wf-is-complete">
        <div className="wf-is-complete-icon">{'\u2713'}</div>
        <div className="wf-is-complete-text">TEST COMPLETE</div>
        <div className="wf-is-complete-sub">Evaluating your responses...</div>
      </div>
    </div>
  )
}