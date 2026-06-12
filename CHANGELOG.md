# SODA Changelog

## Context Refresh System (mid-conversation memory)
**Files:** `backend/soda.py`

### What
Periodic injection of conversation summary into Gemini Live API mid-session so the model doesn't forget earlier context in long conversations.

### Changes

**`AudioLoop.__init__` (lines 287-290)**
```python
self._turn_count = 0
self._context_refresh_interval = 12
self._last_refresh_turn = 0
self._exchange_history = []
```

**New method `_inject_context_refresh()` (lines 394-420)**
- Takes last 10 exchanges from `_exchange_history`
- Formats as compact summary with explicit "do NOT read this aloud" instruction
- Sends via `send_client_content(turn_complete=False)` — model absorbs silently without generating audio
- Wrapped in try/except — never crashes

**Modified `receive_audio()` after `flush_chat()` (lines 851-868)**
- Increments `_turn_count` after each completed turn
- Captures user transcription + model transcription as an entry
- Dedup check prevents duplicate entries on silent turns
- Rolling buffer capped at 30 entries
- Every 12 turns, triggers `_inject_context_refresh()` if there's data

### Safety
- Same `send_client_content(turn_complete=False)` pattern already used for reconnection context (line 656)
- No blocking operations on hot path
- Error handling prevents any crash from propagating

---

## Idle Mode with Wake Word
**Files:** `backend/soda.py`, `src/App.jsx`, `src/components/HolographicOrb.jsx`, `src/styles/main.css`

### Three-Tier Inactivity Detection

| Phase | Time | Behavior |
|---|---|---|
| Active | 0-45s | Normal operation |
| Active idle | 45s-10min | Personality quips (existing), orb dims via mood |
| Deep idle | 10min+ | B&W orb, "SODA is in Idle Mode" label, all responses suppressed, listening for wake word |

### Backend (`backend/soda.py`)

**New imports** (line 9):
```python
import re
```

**New state fields** (lines 284-285):
```python
self._idle_mode = False
self._idle_timeout = 600  # 10 minutes
```

**Modified `_idle_check_loop`** (lines 316, 326-327):
- Added `or self._idle_mode` to guard — once idle, loop does nothing
- After personality quip, checks if 10 min elapsed → calls `_enter_idle_mode()`

**New methods** (lines 344-355):
```python
async def _enter_idle_mode(self):
    # Sets flag, emits idle_mode socket event to frontend
    self._idle_mode = True
    if self.sio:
        await self.sio.emit("idle_mode", {"active": True})

async def _exit_idle_mode(self):
    # Clears flag, resets activity timer, emits idle_mode: False
    self._idle_mode = False
    self._mark_activity()
    if self.sio:
        await self.sio.emit("idle_mode", {"active": False})
```

**Modified `receive_audio()` — idle filter** (lines 759-768):
```python
if self._idle_mode:
    # Only check input transcriptions for wake word
    if response.server_content and response.server_content.input_transcription:
        transcript = response.server_content.input_transcription.text
        if re.search(r'\bsoda\b', transcript, re.IGNORECASE):
            await self._exit_idle_mode()  # Wake word detected → exit idle
            # Falls through to process the rest of this response normally
        else:
            continue  # Not a wake word, skip everything
    else:
        continue  # Skip audio data, tool calls, etc. while idle
```

### Frontend (`src/App.jsx`)

**New state** (line 476):
```jsx
const [idleMode, setIdleMode] = useState(false)
```

**Socket handler** (line 1049):
```jsx
const onIdleMode = (data) => { setIdleMode(data.active) }
socket.on('idle_mode', onIdleMode)
```

**Orb prop** (line 1404):
```jsx
<HolographicOrb size={orbSize} micLevel={orbMicLevel} mood={personalityMood} idle={idleMode} />
```

**Idle label** (lines 1406-1408):
```jsx
{idleMode && (
    <div className="idle-label">SODA is in Idle Mode</div>
)}
```

**Status text** (line 1453):
```jsx
{idleMode ? 'idle' : (connectionStatus === 'connected' ? 'ready' : 'connecting...')}
```

### Orb Visual (`src/components/HolographicOrb.jsx`)

**Prop added** (line 108): `idle = false`

**Zero mic level when idle** (lines 189-191):
```jsx
if (props.idle) {
    state.currentMicLevel = 0
}
```

**CSS filter override** (lines 380-384):
```jsx
filter: idle
    ? 'grayscale(100%) drop-shadow(0 0 15px rgba(128,128,128,0.2))'
    : (isSpeaking ? SPEAKING_PALETTE.dropShadow : (...))
```

### CSS (`src/styles/main.css`)

**`.idle-label`** (lines 1331-1356):
- Positioned above orb (same pattern as `.thought-bubble`)
- Dim text color, subtle 3s pulse animation
- Blurred backdrop, non-interactive

---

## Notepad Bug Fixes
**Files:** `backend/soda.py`

### Bug 1 (CRITICAL): notepad_open didn't open
**Line:** ~1217 (notepad_open handler)
**Fix:** Added `"id": f"np_{fc.id}"` to socket emit payload
**Root cause:** Frontend `onOpenNotepad` checks `if (!data || !data.id) return` — was missing the `id` field

### Bug 2 (CRITICAL): notepad_read never returned
**Line:** ~1240 (notepad_read handler)
**Fix:** Changed `"request_id"` → `"id"` in socket emit payload
**Root cause:** Frontend reads `data.id` to match response, but payload had `request_id`

### Bug 3 (MINOR): leaked future in notepad_write
**Line:** ~1222 (notepad_write handler)
**Fix:** Removed leaked `_pending_notepad_reads[fc.id] = asyncio.Future()`

### Bug 4 (MINOR): notepad_open tab field name
**Line:** ~1220 (notepad_open handler)
**Fix:** Normalized tab field from `name` → `title`

---

## System Prompt Updates
**Files:** `backend/soda.py`

### Humor Addition (line ~200)
Added SERIOUS HUMOR paragraph — Gemini drops deadpan/dark humor one-liners during casual chat

### Camera Anti-Hallucination (lines 132-140)
Replaced weak camera instruction with explicit "NEVER fabricate visual details; say 'I can't see clearly' if unsure"

### Honest Feedback Personality (lines 190-199)
Replaced "caring, brotherly, protective" with honest older brother tone — directly point out flaws, never flatter

---

## Camera Base64 Fix
**Files:** `backend/soda.py`

**Line:** ~405 (`send_video` method)
**Fix:** Added base64 decode before `types.Blob`:
```python
raw = base64.b64decode(msg["data"]) if isinstance(msg["data"], str) else msg["data"]
```
**Root cause:** Camera sends base64 string, but Gemini SDK expects raw bytes

---

## Workbase Project Tracking System
**Files:** `backend/workbase.py`, `backend/tools.py`, `backend/soda.py`, `src/components/workflows/WorkbaseShowcase.jsx`, `src/components/workflows/index.js`, `backend/workbase/projects/*/context.md`

### What
Centralized project tracking for the user's external software projects (AI AUTORESPONDER, Guardian ANTI THEFT, Hajj Kafela, WordsNest). 4 Gemini-callable tools + HUD animation workflow.

### Backend (`backend/workbase.py`)
- `Workbase` class with `list_projects()`, `get_project_status(name)`, `save_progress(name, entry)`, `import_project(folder_path)` methods
- Persistent index at `workbase/index.json`, project context stored in `workbase/projects/{name}/context.md`
- 4 tool declarations: `workbase_list`, `workbase_get`, `workbase_save_progress`, `workbase_import`

### Tool Wiring (`backend/tools.py` + `backend/soda.py`)
- Imported tools from `workbase` module, registered in `tools_list`
- `AudioLoop.__init__` gets `self.workbase = None` field for lazy initialization
- 4 handlers in `_dispatch_tool` — workbase_import triggers `workflow_start` with `workflow: "workbase-showcase"`

### Workflow (`src/components/workflows/WorkbaseShowcase.jsx`)
- 7-phase HUD animation (4000ms total) following WorkflowProjectReview pattern
- Phases: INIT → HOLOGRAPHIC DISPLAY → DATABASE CONNECTION → PROJECT CARDS → DETAIL ANALYSIS → INTEL REPORT → IDLE
- Registered in `WORKFLOW_MAP` as `'workbase-showcase'`

### Pre-Imported Projects
- 4 context files with full descriptions, tech stacks, architecture, and next steps

---

## Workbase Context + Comparison System
**Files:** `backend/workbase.py`, `backend/tools.py`, `backend/soda.py`

### What
Per-project conversation context saving, progress comparison, and Gemini-powered suggestions. Gemini can now remember what was discussed about each project across sessions and intelligently suggest next steps.

### New Tools
| Tool | Purpose | When Called |
|---|---|---|
| `workbase_save_context` | Save conversation summary per project | Gemini auto-calls after meaningful project discussion + user can say "save context" |
| `workbase_compare` | Compare current state vs last context, returns full data for Gemini analysis | When user asks "what's new" or "any suggestions" |

### Backend Changes (`backend/workbase.py`)
- **New fields** `last_context`, `last_context_time` — stored in `index.json` per project
- **`save_context(name, context)`** — persists conversation summary + timestamp
- **`compare_progress(name)`** — gathers context.md, last_context, progress_log, folder snapshot, and suggestions into structured JSON for Gemini to analyze
- **`_generate_suggestions(p)`** — extracts Next Steps from context.md + generic hints based on project state
- **`_read_folder_snapshot(path)`** — reads top-level file listing + up to 3 priority files (README, package.json, etc.) for context
- **`get_project_status()`** now includes `last_context`, `last_context_time`, `suggestions` fields
- **`_scan_projects_dir()`** fixed: section-aware parsing (tracks `## Tech Stack` section, stops at `## Next Steps`), multi-line `## Description` reading
- **`import_project()`** fixed: same section-aware parsing + adds `last_context`/`last_context_time` to entries
- **`index.json`** cleaned: tech_stack no longer polluted with Next Steps items

### Bug Fixes
- `_scan_projects_dir` tech_stack pollution: Next Steps items were parsed as tech_stack items
- `_scan_projects_dir` description parsing: `## Description` (multi-line) was not being read, leaving all descriptions empty
- `import_project` same two bugs fixed

---

## Startup Tool Guard
**Files:** `backend/server.py` + `backend/soda.py`

**server.py:231** — Changed start message from "Do NOT call get_news" to "Do NOT call any tools during this greeting"
**soda.py:227** — Added `get_weather` to the "Do NOT call during greetings" tool list

---

## How to Run
```bash
py -3.11 server.py   # Backend (port 8000)
npm run dev           # Frontend + Electron
```
