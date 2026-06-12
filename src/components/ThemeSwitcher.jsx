import { useEffect, useState } from 'react'
import Sound from '../services/SoundService'
import { Palette } from 'lucide-react'

const THEMES = [
  {
    id: 'tactical',
    label: 'Tactical Cyan',
    vars: { '--color-soda-cyan': '#00fbfb', '--color-soda-amber': '#ffe2ab', '--color-soda-bg': '#04080B' }
  },
  {
    id: 'amber',
    label: 'CRT Amber',
    vars: { '--color-soda-cyan': '#ffb000', '--color-soda-amber': '#fff0a0', '--color-soda-bg': '#0c0800' }
  },
  {
    id: 'matrix',
    label: 'Matrix',
    vars: { '--color-soda-cyan': '#00ff66', '--color-soda-amber': '#ccff99', '--color-soda-bg': '#001008' }
  },
  {
    id: 'cyber',
    label: 'Cyber Magenta',
    vars: { '--color-soda-cyan': '#ff00ff', '--color-soda-amber': '#00fbfb', '--color-soda-bg': '#0a0010' }
  }
]

const STORAGE_KEY = 'soda-theme'

function applyTheme(theme) {
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
}

function getSavedTheme() {
  try {
    const id = localStorage.getItem(STORAGE_KEY)
    return THEMES.find(t => t.id === id) || THEMES[0]
  } catch {
    return THEMES[0]
  }
}

export default function ThemeSwitcher() {
  const [current, setCurrent] = useState(getSavedTheme())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    applyTheme(current)
    try { localStorage.setItem(STORAGE_KEY, current.id) } catch {}
  }, [current])

  const choose = (theme) => {
    Sound.click()
    setCurrent(theme)
    setOpen(false)
  }

  return (
    <div className="theme-switcher">
      <button
        className="theme-switcher-btn"
        onClick={() => { Sound.click(); setOpen(o => !o) }}
        title="Switch theme"
      >
        <Palette size={12} />
      </button>
      {open && (
        <div className="theme-switcher-menu">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-option ${t.id === current.id ? 'is-active' : ''}`}
              onClick={() => choose(t)}
            >
              <span className="theme-swatch" style={{ background: t.vars['--color-soda-cyan'] }} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
