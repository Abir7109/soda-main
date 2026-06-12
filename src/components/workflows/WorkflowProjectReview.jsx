import { useEffect, useRef, useCallback } from 'react'
import { activate, deactivate } from './workflowUtils'

const TOTAL_DURATION = 6500

const PHASES = [
  { id: 0, name: 'INTEL LINK ESTABLISHED',       start: 0,    dur: 500  },
  { id: 1, name: 'HOLOGRAPHIC DISPLAY ACTIVATE',  start: 500,  dur: 500  },
  { id: 2, name: 'GITHUB CONNECTION HANDSHAKE',   start: 1000, dur: 500  },
  { id: 3, name: 'REPOSITORY CARDS CASCADE',      start: 1500, dur: 1500 },
  { id: 4, name: 'STATS VISUALIZATIONS RENDER',   start: 3000, dur: 1500 },
  { id: 5, name: 'RADAR SWEEP + SCAN COMPLETE',   start: 4500, dur: 1000 },
  { id: 6, name: 'INTEL REPORT \u2014 STANDBY',   start: 5500, dur: Infinity },
]

const DEFAULT_REPOS = [
  { rank: '\uD83E\uDD47', name: 'soda-ai-agent',    stars: 142, lang: '\uD83D\uDC0D', desc: 'AI assistant framework',     status: 'Active', cls: 'gold' },
  { rank: '\uD83E\uDD48', name: 'portfolio-site',   stars: 89,  lang: '\u269B',        desc: 'Personal site & blog',       status: 'Active', cls: 'silver' },
  { rank: '\uD83E\uDD49', name: 'react-components', stars: 45,  lang: '\u269B',        desc: 'Shared UI component library', status: 'Idle',   cls: 'bronze' },
  { rank: '#4', name: 'python-utils',     stars: 23,  lang: '\uD83D\uDC0D', desc: '', status: 'Idle' },
  { rank: '#5', name: 'cli-tools',        stars: 12,  lang: '\uD83E\uDD80', desc: '', status: 'Active' },
  { rank: '#6', name: 'dotfiles',         stars: 8,   lang: '\uD83D\uDCDC', desc: '', status: 'Idle' },
]

const RADAR_BARS = [12, 8, 25, 15, 40, 22, 55, 30, 68, 42, 80, 55, 92, 70, 45, 35, 60, 28, 50, 18, 72, 48, 85, 62, 38, 20, 65, 32, 75, 50]

function getRepos(data) {
  if (data?.github?.repos && data.github.repos.length > 0) {
    return data.github.repos.map((r, i) => ({
      rank: i === 0 ? '\uD83E\uDD47' : i === 1 ? '\uD83E\uDD48' : i === 2 ? '\uD83E\uDD49' : `#${i + 1}`,
      name: r.name || 'repo-' + i,
      stars: r.stargazerCount || r.stars || 0,
      desc: r.description || '',
      lang: r.primaryLanguage?.emoji || r.lang || '\uD83D\uDCDC',
      status: r.isArchived ? 'Idle' : 'Active',
      cls: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '',
    }))
  }
  return DEFAULT_REPOS
}

function getTotalStars(repos) {
  return repos.reduce((s, r) => s + r.stars, 0)
}

function getScanData(data) {
  const ps = data?.project_scan
  return {
    files: ps?.files ?? 142,
    lines: ps?.lines ?? 12847,
    todos: ps?.todos ?? 14,
    fixmes: ps?.fixmes ?? 3,
    quality_score: ps?.quality_score ?? 82,
    project_dir: ps?.project_dir ?? 'soda-ai-agent',
  }
}

function getCommits(data) {
  return data?.git_local?.total_commits || data?.git_local?.recent_commits?.length || 847
}

function getBranch(data) {
  return data?.git_local?.branch || 'main'
}

function getPing(data) {
  return data?.network?.ping_ms
}

function getQualityLabel(score) {
  return score >= 80 ? 'GOOD' : score >= 50 ? 'FAIR' : 'POOR'
}

function buildSummaryText(data) {
  const repos = getRepos(data)
  const totalStars = getTotalStars(repos)
  const commits = getCommits(data)
  const scan = getScanData(data)
  const topRepo = repos.length > 0 ? repos[0].name : 'your project'
  const branch = getBranch(data)
  const ping = getPing(data)

  const parts = [
    `${topRepo} leads at ${totalStars} stars with ${commits} commits on ${branch}.`,
    `Code scan: ${scan.files} files, ${scan.lines.toLocaleString()} lines, ${scan.todos} TODOs, ${scan.fixmes} FIXMEs.`,
    scan.quality_score >= 80 ? 'Code quality looks solid.' : scan.quality_score >= 50 ? 'Code quality needs attention.' : 'Code quality is concerning.',
    ping !== undefined ? `Network latency ${ping}ms.` : null,
    'Standing by for next command.',
  ]
  return parts.filter(Boolean).join(' ')
}

export default function WorkflowProjectReview({ data, onComplete }) {
  const tids = useRef([])
  const rafs = useRef([])
  const hudRef = useRef(null)
  const phaseLabelRef = useRef(null)
  const timelineFillRef = useRef(null)
  const scanBarFillRef = useRef(null)
  const currentPhase = useRef(-1)
  const startTime = useRef(0)
  const dataRef = useRef(data)
  dataRef.current = data

  const ct = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay)
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

  const e = (sel) => hudRef.current && hudRef.current.querySelector(sel)

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

  function animateScanLabel(el, target, duration) {
    const s = performance.now()
    function tick(now) {
      const t = Math.min((now - s) / duration, 1)
      el.textContent = Math.floor(t * target) + '%'
      if (t < 1) raf(tick)
      else el.textContent = target + '%'
    }
    raf(tick)
  }

  function activatePhase(pid) {
    switch (pid) {
      case 0:
        activate(e('.wfr-grid-bg'))
        activate(e('.wfr-scanline'))
        activate(e('.wfr-intel-flash'))
        ct(() => deactivate(e('.wfr-intel-flash')), 500)
        break
      case 1:
        activate(e('.wfr-title-bar'))
        activate(e('.wfr-hud-frame'))
        animateFrame()
        break
      case 2:
        activate(e('.wfr-panel-connect'))
        animateGitHub()
        break
      case 3:
        activate(e('.wfr-panel-repos'))
        buildRepoCards()
        break
      case 4:
        activate(e('.wfr-panel-radar'))
        activate(e('.wfr-panel-scan'))
        buildRadar()
        animateScan()
        break
      case 5:
        completeScan()
        break
      case 6:
        startSummary()
        break
    }
  }

  function animateFrame() {
    const corners = hudRef.current?.querySelectorAll('.wfr-corner')
    corners?.forEach((c, i) => ct(() => activate(c, 'slide-in'), i * 80))
    ct(() => activate(e('.wfr-edge.top')), 300)
    ct(() => activate(e('.wfr-edge.right')), 550)
    ct(() => activate(e('.wfr-edge.bot')), 800)
    ct(() => activate(e('.wfr-edge.left')), 1050)
    const dividers = hudRef.current?.querySelectorAll('.wfr-divider')
    dividers?.forEach((d, i) => ct(() => activate(d, 'draw'), 120 + i * 120))
  }

  function animateGitHub() {
    const repos = getRepos(dataRef.current)
    const ping = getPing(dataRef.current)
    ct(() => {
      activate(e('.wfr-gh-line-l'))
      activate(e('.wfr-gh-line-r'))
    }, 100)
    ct(() => {
      activate(e('.wfr-gh-center'))
      const lat = e('.wfr-gh-latency')
      if (lat) lat.textContent = ping ? `${ping}ms` : '42ms'
      const api = e('.wfr-gh-api')
      const commits = getCommits(dataRef.current)
      if (api) api.textContent = `${commits}/${repos.length * 100}`
      const tok = e('.wfr-gh-token')
      if (tok) {
        tok.textContent = '\u25CF VERIFIED'
        tok.style.color = 'var(--wf-green)'
      }
    }, 400)
  }

  function buildRepoCards() {
    const repos = getRepos(dataRef.current)
    const container = e('.wfr-repo-cards')
    if (!container) return
    repos.forEach((repo, i) => {
      const card = document.createElement('div')
      card.className = 'wfr-repo-card' + (repo.cls ? ' ' + repo.cls : '')
      card.innerHTML = [
        '<div class="wfr-card-inner">',
        `  <span class="wfr-card-rank">${repo.rank}</span>`,
        '  <div class="wfr-card-body">',
        `    <span class="wfr-card-name">${repo.name}</span>`,
        repo.desc ? `    <span class="wfr-card-desc">${repo.desc}</span>` : '',
        '  </div>',
        `  <span class="wfr-card-stars">\u2605 <span class="wfr-star-count" data-target="${repo.stars}">0</span></span>`,
        `  <span class="wfr-card-lang">${repo.lang}</span>`,
        `  <span class="wfr-card-status ${repo.status === 'Active' ? 'green' : 'yellow'}">${repo.status === 'Active' ? '\u25CF' : '\u25CB'}</span>`,
        '</div>',
      ].filter(Boolean).join('\n')
      container.appendChild(card)
      ct(() => activate(card), i * 120)
      ct(() => {
        const count = card.querySelector('.wfr-star-count')
        if (count) animateCounter(count, repo.stars, 700)
      }, 300 + i * 120)
    })
    const totalEl = e('.wfr-repo-total-stars')
    if (totalEl) totalEl.textContent = String(getTotalStars(repos))
    const countEl = e('.wfr-repo-total-count')
    if (countEl) countEl.textContent = String(repos.length)
  }

  function buildRadar() {
    const container = e('.wfr-radar-container')
    if (!container) return
    RADAR_BARS.forEach((h, i) => {
      const bar = document.createElement('div')
      bar.className = 'wfr-radar-bar'
      const fill = document.createElement('div')
      const level = h <= 20 ? 'l1' : h <= 40 ? 'l2' : h <= 65 ? 'l3' : 'l4'
      fill.className = 'wfr-radar-fill ' + level
      bar.appendChild(fill)
      container.appendChild(bar)
      ct(() => fill.style.height = h + '%', 200 + i * 30)
    })
    const commits = getCommits(dataRef.current)
    ct(() => {
      const rc = e('.wfr-radar-commits')
      if (rc) animateCounter(rc, commits, 800)
      const rs = e('.wfr-radar-streak')
      if (rs) {
        rs.textContent = '23'
        rs.classList.add('fire')
      }
    }, 1200)
  }

  function animateScan() {
    ct(() => {
      if (scanBarFillRef.current) scanBarFillRef.current.style.width = '85%'
      const label = e('.wfr-scan-label')
      if (label) animateScanLabel(label, 85, 1200)
    }, 300)
  }

  function completeScan() {
    const scan = getScanData(dataRef.current)
    const files = e('.wfr-scan-files')
    if (files) files.textContent = String(scan.files)
    const lines = e('.wfr-scan-lines')
    const formatted = scan.lines >= 1000 ? scan.lines.toLocaleString() : String(scan.lines)
    if (lines) lines.textContent = formatted
    const todo = e('.wfr-scan-todo')
    if (todo) todo.textContent = String(scan.todos)
    const fixme = e('.wfr-scan-fixme')
    if (fixme) fixme.textContent = String(scan.fixmes)
    const qFill = e('.wfr-quality-fill')
    if (qFill) qFill.style.width = scan.quality_score + '%'
    const qScore = e('.wfr-quality-score')
    if (qScore) qScore.textContent = `${scan.quality_score}/100 ${getQualityLabel(scan.quality_score)}`
    const rp = e('.wfr-scan-path span')
    if (rp) rp.textContent = scan.project_dir + '/'
  }

  function startSummary() {
    activate(e('.wfr-panel-summary'))
    const textEl = e('.wfr-summary-text')
    if (!textEl) return

    const text = buildSummaryText(dataRef.current)
    const words = text.split(' ')
    textEl.innerHTML = ''

    let wordIdx = 0
    function typeWord() {
      if (wordIdx < words.length) {
        const span = document.createElement('span')
        span.textContent = words[wordIdx] + ' '
        span.style.cssText = 'opacity:0;transition:opacity 0.1s,text-shadow 0.1s;display:inline'
        textEl.appendChild(span)
        requestAnimationFrame(() => {
          span.style.opacity = '1'
          span.style.textShadow = '0 0 12px rgba(0,240,255,0.3)'
          ct(() => { span.style.textShadow = 'none' }, 100)
        })
        wordIdx++
        const lastChar = words[wordIdx - 1].slice(-1)
        const delay = '.!?'.includes(lastChar) ? 160 : 55
        ct(typeWord, delay)
      }
    }
    ct(typeWord, 200)

    const repos = getRepos(dataRef.current)
    const totalStars = getTotalStars(repos)
    const commits = getCommits(dataRef.current)
    const scan = getScanData(dataRef.current)
    const ping = getPing(dataRef.current)

    const grid = e('.wfr-summary-grid')
    if (grid) {
      const items = [
        `\u2605 ${totalStars} Total Stars`,
        `\u2705 ${commits} Commits`,
        `\uD83D\uDCCA Quality: ${getQualityLabel(scan.quality_score)}`,
        ping ? `\uD83D\uDD0C ${ping}ms` : null,
      ].filter(Boolean)
      items.forEach((s, i) => {
        const el = document.createElement('span')
        el.textContent = s
        grid.appendChild(el)
        ct(() => activate(el), 800 + i * 150)
      })
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
      for (let i = PHASES.length - 1; i >= 0; i--) {
        if (elapsed >= PHASES[i].start) { activePhase = i; break }
      }
      if (activePhase !== currentPhase.current) {
        currentPhase.current = activePhase
        if (currentPhase.current >= 0) activatePhase(currentPhase.current)
      }
      const phase = PHASES.find(p => p.id === currentPhase.current) || PHASES[0]
      if (phaseLabelRef.current) phaseLabelRef.current.textContent = `\u25A0 ${phase.name}`
      const pct = currentPhase.current >= 6 ? 100 : Math.min((elapsed / TOTAL_DURATION) * 100, 100)
      if (timelineFillRef.current) timelineFillRef.current.style.width = pct + '%'
      if (currentPhase.current < 6) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => { running = false; if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  return (
    <div className="wfr-wrapper">
      <div className="wfr-letterbox">
        <div className="wfr-hud" ref={hudRef}>
          <div className="wfr-grid-bg"></div>
          <div className="wfr-scanline"></div>
          <div className="wfr-flash-overlay"></div>

          <div className="wfr-intel-flash">
            <div className="wfr-intel-flash-text">&#9670; INTEL LINK ESTABLISHED</div>
          </div>

          <div className="wfr-title-bar">
            <span className="wfr-title-icon">&#9670;</span>
            <span className="wfr-title-text">COMMAND CENTER</span>
            <div className="wfr-title-sub">PROJECT INTEL OVERVIEW</div>
          </div>

          <svg className="wfr-hud-frame" viewBox="0 0 960 600" preserveAspectRatio="xMidYMid meet">
            <g className="wfr-corner" style={{transform:'translate(-60px,-60px)'}}>
              <line x1="16" y1="40" x2="52" y2="40" /><line x1="16" y1="40" x2="16" y2="76" />
            </g>
            <g className="wfr-corner" style={{transform:'translate(60px,-60px)'}}>
              <line x1="944" y1="40" x2="908" y2="40" /><line x1="944" y1="40" x2="944" y2="76" />
            </g>
            <g className="wfr-corner" style={{transform:'translate(-60px,60px)'}}>
              <line x1="16" y1="560" x2="52" y2="560" /><line x1="16" y1="560" x2="16" y2="524" />
            </g>
            <g className="wfr-corner" style={{transform:'translate(60px,60px)'}}>
              <line x1="944" y1="560" x2="908" y2="560" /><line x1="944" y1="560" x2="944" y2="524" />
            </g>
            <line className="wfr-divider" x1="478" y1="42" x2="478" y2="384" />
            <line className="wfr-divider" x1="704" y1="42" x2="704" y2="384" />
            <line className="wfr-divider" x1="16" y1="138" x2="944" y2="138" />
            <line className="wfr-divider" x1="16" y1="384" x2="944" y2="384" />
          </svg>

          <div className="wfr-edge top"></div>
          <div className="wfr-edge right"></div>
          <div className="wfr-edge bot"></div>
          <div className="wfr-edge left"></div>

          <div className="wfr-panel wfr-panel-connect">
            <div className="wfr-panel-header"><span className="wfr-panel-icon">&#128279;</span> GITHUB CONNECTION</div>
            <div className="wfr-panel-body">
              <div className="wfr-gh-row">
                <div className="wfr-gh-line wfr-gh-line-l"></div>
                <div className="wfr-gh-center">
                  <span className="wfr-gh-dot">&#9673;</span>
                  <span className="wfr-gh-name">LINKED: Abir7109</span>
                  <span className="wfr-gh-dot">&#9673;</span>
                </div>
                <div className="wfr-gh-line wfr-gh-line-r"></div>
              </div>
              <div className="wfr-gh-meta">
                <span className="wfr-gh-meta-item">&#8597; Latency: <span className="wfr-gh-latency">--</span></span>
                <span className="wfr-gh-meta-item">&#128202; API Calls: <span className="wfr-gh-api">--/--</span></span>
                <span className="wfr-gh-meta-item">&#128273; Token: <span className="wfr-gh-token">&#9679; PENDING</span></span>
              </div>
            </div>
          </div>

          <div className="wfr-panel wfr-panel-repos">
            <div className="wfr-panel-header"><span className="wfr-panel-icon">&#127942;</span> REPO RANKINGS</div>
            <div className="wfr-panel-body">
              <div className="wfr-repo-cards"></div>
              <div className="wfr-repo-total">Total Stars: <span className="wfr-repo-total-stars">0</span> | Repos: <span className="wfr-repo-total-count">--</span></div>
            </div>
          </div>

          <div className="wfr-panel wfr-panel-radar">
            <div className="wfr-panel-header"><span className="wfr-panel-icon">&#128200;</span> CONTRIBUTION RADAR</div>
            <div className="wfr-panel-body">
              <div className="wfr-radar-container"></div>
              <div className="wfr-radar-stats">
                <span className="wfr-radar-stat">This Year: <span className="wfr-radar-commits">0</span></span>
                <span className="wfr-radar-stat">Streak: <span className="wfr-radar-streak">0</span> <span className="wfr-radar-fire">&#128293;</span></span>
              </div>
            </div>
          </div>

          <div className="wfr-panel wfr-panel-scan">
            <div className="wfr-panel-header"><span className="wfr-panel-icon">&#128269;</span> CODE SCAN</div>
            <div className="wfr-panel-body">
              <div className="wfr-scan-path">&#128193; <span>soda-ai-agent/</span></div>
              <div className="wfr-scan-bar-track">
                <div className="wfr-scan-bar-fill" ref={scanBarFillRef}></div>
                <span className="wfr-scan-label">0%</span>
              </div>
              <div className="wfr-scan-grid">
                <span className="wfr-scan-item">&#128194; Files: <span className="wfr-scan-files">--</span></span>
                <span className="wfr-scan-item">&#128221; Lines: <span className="wfr-scan-lines">--</span></span>
                <span className="wfr-scan-item warn">&#9888; TODO: <span className="wfr-scan-todo">--</span></span>
                <span className="wfr-scan-item err">&#128308; FIXME: <span className="wfr-scan-fixme">--</span></span>
              </div>
              <div className="wfr-quality-row">
                <span className="wfr-quality-label">QUALITY</span>
                <div className="wfr-quality-track"><div className="wfr-quality-fill"></div></div>
                <span className="wfr-quality-score">--/100</span>
              </div>
            </div>
          </div>

          <div className="wfr-panel wfr-panel-summary">
            <div className="wfr-panel-header"><span className="wfr-panel-icon">&#128172;</span> INTEL SUMMARY</div>
            <div className="wfr-panel-body">
              <div className="wfr-summary-speech">
                <div className="wfr-summary-avatar">&#9670;</div>
                <div className="wfr-summary-text"></div>
              </div>
              <div className="wfr-summary-grid"></div>
            </div>
          </div>

          <div className="wfr-timeline-bar">
            <span className="wfr-phase-label" ref={phaseLabelRef}>&#9632; COMMAND CENTER</span>
            <div className="wfr-timeline-track"><div className="wfr-timeline-fill" ref={timelineFillRef}></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
