# Google AI Studio Prompt — Soda Tool Animation

## Goal
Generate a single-file React component for a Soda HUD tool animation. The component must show **both** an animated visual state **and** a real data display — not just decorative motion.

---

## Template

```jsx
export default function ToolAnimation({ status = 'running', data = null }) {
  // status: 'pending' | 'running' | 'done' | 'error'
  // data: see per-tool shapes below

  // === STATE DECODING ===
  const isError = status === 'error'
  const isDone = status === 'done'
  const isRunning = status === 'pending' || status === 'running'
  const stroke = isError ? '#ffb4ab' : '#00fbfb'

  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      background: 'rgba(4, 8, 11, 0.6)',
      borderRadius: 12,
      overflow: 'hidden',
      border: `1px solid ${stroke}22`,
      fontFamily: "'Space Grotesk', 'JetBrains Mono', monospace",
    }}>
      {/* === ANIMATION ZONE (top ~55%) === */}
      <div style={{
        height: '55%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Animated SVG — rings, particles, gauges, etc. */}
        <svg viewBox="0 0 200 120" style={{ width: '100%', maxHeight: '100%' }}>
          {/* ... animated SVG elements using `stroke` color */}
          {/* When running: animated loaders, scanning, pulsing */}
          {/* When done: snap to data-driven visuals */}
        </svg>
      </div>

      {/* === DATA ZONE (bottom ~45%) === */}
      <div style={{
        height: '45%',
        padding: '8px 12px',
        borderTop: `1px solid ${stroke}15`,
        display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        {/* Data rows rendered from `data` */}
        {/* Each row: label + value, compact monospace */}
      </div>

      {/* Error overlay */}
      {isError && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(4,8,11,0.85)', color: '#ffb4ab', fontSize: 11, fontFamily: 'JetBrains Mono' }}>
          Error
        </div>
      )}
    </div>
  )
}
```

---

## Per-Tool Specifications

### 1. `get_system_status` — System Status Animation

**Purpose**: Show CPU, RAM, disk, battery, and system info in a compact dashboard.

**Layout**:
```
┌──────────────────────────────────┐
│   ┌─────┐   ┌─────┐             │  ← Animation Zone (55%)
│   │ 45% │   │ 72% │             │     Two ring gauges side by side
│   │ CPU │   │ RAM │             │     Below disk: [████░░░░] 48%
│   └─────┘   └─────┘             │     Battery: 🔋 85% (if present)
│   ────────────────────────────  │
│   OS  Windows 10.0.22631       │  ← Data Zone (45%)
│   Host DESKTOP-ABC123           │     Compact key-value rows
│   CPU  8 cores · 4.2 GHz       │     Right-aligned values
│   RAM  16.0 / 31.2 GB          │     Monospace, cyan on dark
│   Disk 120.5 / 476.0 GB        │
│   Py   3.11.4                   │
└──────────────────────────────────┘
```

**Data shape** (fields available in `data`):
```
{
  cpu_percent: number (0-100),
  ram_percent: number (0-100),
  ram_total_gb: number,
  ram_used_gb: number,
  disk_percent: number (0-100),
  disk_total_gb: number,
  disk_used_gb: number,
  cpu_count: number,
  os: string,           // "Windows", "Linux", "Darwin"
  os_version: string,
  hostname: string,
  machine: string,
  python: string,
  battery_percent: number | null,
  battery_charging: boolean | null,
  gpu_percent: number | null,
}
```

**Behavior by status**:
- **running**: Show two pulsing ring outlines + scanning sweep line + "[···]" placeholder rows
- **done**: Rings animate to real percentages with stroke-dashoffset transition (1s ease-out), data fades in row by row (stagger 0.06s each)
- **error**: Red overlay, `#ffb4ab` color, show error message if `data.error` exists

**Design rules**:
- All colors use the `stroke` variable (cyan `#00fbfb` normally, red `#ffb4ab` on error)
- Secondary text at 0.4-0.5 opacity, primary values at 0.75-0.9 opacity
- Ring gauges: outer circle `strokeOpacity=0.1`, fill arc `strokeOpacity=0.7`, center text bold Space Grotesk
- Data rows: left label at 0.4 opacity, right value at 0.75 opacity, 9px font, `display: flex; justify-content: space-between`
- No rounded corners on the outer container (Soda convention)
- Background: `rgba(4, 8, 11, 0.6)` with 1px border at `stroke` + 13% opacity
- Transition everything: `transition: all 0.4s ease-out`
- No SMIL `<animate>`, no `<filter>`, no external dependencies
- Max 50 SVG elements, max 20 divs

---

### 2. `get_weather` — Weather Animation

**Layout**:
```
┌──────────────────────────────────┐
│       ☀️                         │  ← Animation Zone
│   25°C   Feels like 23°C        │     Sun with animated rays / cloud drift
│   ────────────────────────────  │
│   Location  Tokyo, Japan        │  ← Data Zone
│   Humidity  68%                 │
│   Wind      12.5 km/h           │
│   Pressure  1013 hPa            │
│   Sunrise   05:32               │
└──────────────────────────────────┘
```

**Data shape**:
```
{
  temperature: number,
  feels_like: number,
  humidity: number,
  wind_speed: number,
  wind_direction: string,
  pressure: number,
  location: string,
  description: string,
  icon: string,   // weather code
  sunrise: string,
  sunset: string,
}
```

---

### 3. `terminal_execute` — Terminal Animation

**Layout**:
```
┌──────────────────────────────────┐
│  >_ npm run build                │  ← Animation Zone
│  ═══░▒▓████████░░░ 45%          │     Terminal window frame with scan
│  10:24:32 [info] starting...     │     Animated progress bar
│  ────────────────────────────  │
│  $ npm run build                 │  ← Data Zone
│  exit 0                          │     Command, exit code, duration
│  3 files changed, +120/-15       │     First output line
└──────────────────────────────────┘
```

**Data shape**:
```
{
  command: string,
  output: string,
  success: boolean,
  duration_ms: number,
}
```

---

### 4. `web_search_live` — Search Results Animation

**Layout**:
```
┌──────────────────────────────────┐
│  🔍                             │  ← Animation Zone
│  ┌──────────────────────────┐   │     Animated magnifier + orbiting dots
│  │ Result 1 title here...   │   │     Scrollable result previews
│  │ Result 2 title here...   │   │
│  └──────────────────────────┘   │
│  ────────────────────────────  │
│  Query  "latest AI news"        │  ← Data Zone
│  Results  8 found               │     Query, count, top result domain
│  Top     arstechnica.com         │
└──────────────────────────────────┘
```

**Data shape**:
```
{
  query: string,
  results: Array<{ title, url, snippet }>,
}
```

---

### 5. `list_files` — File Browser Animation

**Layout**:
```
┌──────────────────────────────────┐
│  📂 📄 📄 📂 📄                   │  ← Animation Zone
│  src/                            │     Folder icon with flying file particles
│    ├─ components/                │     Animated tree reveal
│    ├─ App.jsx                    │
│    └─ index.css                  │
│  ────────────────────────────  │
│  Path   D:\soda\src              │  ← Data Zone
│  Items  12 (3 folders)           │     Path, count, selection hint
│  Size   2.4 MB                   │
└──────────────────────────────────┘
```

**Data shape**:
```
{
  path: string,
  items: Array<{ name: string, type: 'file'|'folder', size: number, modified: string }>,
}
```

---

## General Design Rules (ALL tools)

1. **Two-zone layout**: Top 55% = animation/visual, Bottom 45% = data rows. Never deviate.
2. **Data drives the visual**: When `isDone`, gauges, counters, and meters must render **actual values** from `data`, not placeholders.
3. **Running state**: Show animated skeleton/progress (pulse, sweep, orbit, scan). No data rows — show dimmed `[···]` lines instead.
4. **Error state**: Full red overlay with `#ffb4ab`, error message centered.
5. **Colors**: Use the `stroke` variable everywhere. Cyan `#00fbfb` or red `#ffb4ab`. Never hardcode other colors.
6. **Typography**: `Space Grotesk` for numbers/headings, `JetBrains Mono` for code/paths. 9-11px in data zone.
7. **Opacity hierarchy**: Labels 0.4, values 0.75-0.9, decorative elements 0.1-0.3.
8. **Animations**: CSS `@keyframes` only (no SMIL `<animate>`, no `<filter>`). Transitions: `0.4s ease-out`.
9. **Background**: `rgba(4, 8, 11, 0.6)` with `1px solid ${stroke}22` border. No rounded corners on outer container.
10. **Spacing**: Data rows `padding: 2px 0`, section divider `1px solid ${stroke}15`.
11. **No external deps**: No imports besides `React`. Inline all styles.
12. **Responsive**: Use percentage-based heights (55%/45%), SVG `viewBox` for visuals, flexbox for data zone.
13. **Single file**: Everything in one `export default function` — no helper components, no CSS imports.
