let ctx = null

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  return ctx
}

function tone({ freq = 440, duration = 0.12, type = 'sine', volume = 0.05, attack = 0.005, release = 0.05, detune = 0 } = {}) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.detune.value = detune
  const t0 = c.currentTime
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + attack)
  gain.gain.setValueAtTime(volume, t0 + duration - release)
  gain.gain.linearRampToValueAtTime(0, t0 + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.01)
}

export const Sound = {
  listening() {
    tone({ freq: 880, duration: 0.06, type: 'sine', volume: 0.03 })
  },
  thinking() {
    tone({ freq: 660, duration: 0.08, type: 'triangle', volume: 0.025 })
    setTimeout(() => tone({ freq: 880, duration: 0.08, type: 'triangle', volume: 0.025 }), 90)
  },
  toolDone() {
    tone({ freq: 1320, duration: 0.05, type: 'sine', volume: 0.04 })
    setTimeout(() => tone({ freq: 1760, duration: 0.08, type: 'sine', volume: 0.04 }), 60)
  },
  toolError() {
    tone({ freq: 220, duration: 0.18, type: 'square', volume: 0.04 })
  },
  click() {
    tone({ freq: 1800, duration: 0.02, type: 'square', volume: 0.025 })
  },
  startup() {
    tone({ freq: 440, duration: 0.08, type: 'sine', volume: 0.04 })
    setTimeout(() => tone({ freq: 660, duration: 0.08, type: 'sine', volume: 0.04 }), 100)
    setTimeout(() => tone({ freq: 880, duration: 0.12, type: 'sine', volume: 0.04 }), 200)
  },
  ready() {
    tone({ freq: 1320, duration: 0.04, type: 'triangle', volume: 0.03 })
    setTimeout(() => tone({ freq: 1760, duration: 0.06, type: 'triangle', volume: 0.03 }), 50)
  }
}

export function unlockAudio() {
  getCtx()
}

export default Sound
