# SODA Workflow Progress & Context Log

---

## Session 5 — News Auto-Advance Removed & open_browser Tool

**Date**: 2026-06-05

### Fix 1: News auto-advance removed (was causing wrong-article briefing)

**Root cause**: The turn-boundary auto-advance (added in Session 3) fired between audio chunks within the SAME Gemini response because `_news_advance_this_turn` was reset every time `_model_is_speaking` toggled True (which happens multiple times per turn). This advanced the webview to a different article while Gemini was still describing the current one, causing narration/webview mismatch.

**Changes in `backend/soda.py`**:
- Removed all auto-advance state (`_news_auto_advance`, `_news_current_idx`, `_news_article_count`, `_news_advance_this_turn`, `_news_first_advance_done`) from `__init__`
- Removed auto-advance initialization from `get_news` handler
- Removed `_news_advance_this_turn = False` from `receive_audio` speaking turn detection
- Removed auto-advance tracking from `news_control` handler
- Removed the turn-boundary auto-advance block entirely

**Changes in `src/components/workflows/WorkflowNewsBriefing.jsx`**:
- Reduced `resetSafetyTimer()` from 60000ms → 20000ms (20s fallback instead of 60s)

### Fix 2: Web search "open link" not working

**Root cause**: `open_browser` handler existed in `soda.py:1431` but had NO tool definition — Gemini couldn't see or call it. When user said "open result 3", Gemini either did nothing or called `browse_webpage` (text extraction, no visual webview).

**Changes in `backend/external_apis.py`**:
- Added `open_browser_tool` definition after `browse_webpage_tool`:
  - `name`: "open_browser", parameters: `url` (required), `browser` (optional)
  - Description: "Open a URL in a visual floating webview window... Use when user asks to 'open', 'show', 'visit', 'go to' a link or website"

**Changes in `backend/tools.py`**:
- Imported `open_browser_tool` from `external_apis`
- Added to `tools_list`

**Changes in `backend/soda.py`** (system prompt):
- Updated line 157: Added "'open', 'show', 'visit', 'go to' any link" → `call open_browser` instruction

---
**Date**: 2026-06-05

### Bug: 1-minute response latency
**Root cause**: `len(delta) > 15` gate on line 649 accidentally moved `on_transcription`, `chat_buffer`, and `clear_audio_queue` inside the length check. Short utterances (<16 chars) didn't fire transcription emission or update conversation history, starving the Gemini session and potentially causing instability.

**Fix**: Restructured to `if delta: if len(delta) > 15: ...` — `match_with_context` is still gated by length, but `on_transcription`, `chat_buffer`, and `clear_audio_queue` always run for any non-empty delta.

### Bug: Tool call exceptions crash receive_audio
**Root cause**: `asyncio.gather(*tasks)` without `return_exceptions=True` — any single tool call exception propagated immediately, crashing `receive_audio` and triggering reconnect loops.

**Fix**: Added `return_exceptions=True` and `isinstance(result, Exception)` guard in the result loop.

### Bug: Low microphone sensitivity
**Root cause**: Raw PCM audio sent to Gemini at original volume. Quiet speech produced low-amplitude audio, reducing transcription quality. `VAD_THRESHOLD = 400` was too high for activity detection.

**Fix**: 
- Added 1.8× PCM amplification in `listen_audio()` using `array.array('h')` with hard clipping at ±32767
- Reduced `VAD_THRESHOLD` from 400 → 150

### Bug: Wrong language transcription / can't understand raw commands
**Root cause**: System prompt had weak accent handling instructions and no guidance for raw command recognition.

**Fix**: Replaced old accent/context lines (144-150) with comprehensive 7-rule block covering:
- Bengali accent → expect mixed-language transcriptions
- Ignore non-English words, focus on English keywords + context
- Treat every message as a potential action request
- Raw command recognition patterns (hard hints → soft hints → implicit needs)
- Speed mandate: respond/act within 1–2 seconds
- Extract English keywords from mixed-language transcriptions

### Files Modified

#### `backend/soda.py`
- **Line 649**: Fixed `len(delta)` indentation — transcription/chat_buffer now runs for ALL deltas, not just >15 chars
- **Line 711**: `asyncio.gather(*tasks, return_exceptions=True)` + `isinstance(result, Exception)` guard
- **Lines 396-403**: Added 1.8× PCM amplification via `array.array('h')` with ±32767 clipping
- **Line 75**: `VAD_THRESHOLD = 400` → `150`
- **Lines 144-163**: Replaced weak accent handling with comprehensive 7-rule instruction block
- **Line 8**: Added `import array`

---
**Date**: 2026-06-05

### Changes

#### `backend/soda.py`
- **Auto-advance on turn boundary**: Added 5 state variables (`_news_auto_advance`, `_news_current_idx`, `_news_article_count`, `_news_advance_this_turn`, `_news_first_advance_done`) in `__init__`
- **`get_news` handler**: Activates auto-advance mode (`_news_auto_advance = True`, resets count to `len(articles)`)
- **`news_control` handler**: Tracks explicit advances by Gemini (`_news_first_advance_done`, `_news_advance_this_turn`, `_news_current_idx`); resets `_news_auto_advance = False` on `close`
- **`receive_audio`**: Resets `_news_advance_this_turn = False` at start of each new speaking turn (when `_model_is_speaking` becomes True)
- **Turn boundary logic** (after `async for` loop completes): If auto-advance active and first advance done and no explicit advance this turn, emits `news_briefing_control({action: "goto", index})` with explicit index to keep frontend/backend in sync; emits `complete` for last article

#### `backend/workflow_intent.py`
- **Removed `CONTEXT_WINDOW_SIZE` pruning**: `feed()` no longer limits context entries by count — only prunes by 60s timeout. All historical context preserved for intent matching.

### Design Decisions
- **Turn boundary over `play_audio` timeout** (for auto-advance): Turn boundary is a definitive end-of-response signal; no risk of mid-article audio gaps (0.5s pause in speech) causing false positives
- **Explicit `goto` with index** over relative `next`: Prevents frontend/backend index drift
- **`_news_first_advance_done` gate**: Prevents auto-advance during intro preamble (before Gemini calls first `news_control(next)`)
- **`_news_advance_this_turn` guard**: Prevents double-advance when Gemini already called `news_control(next)` in the same turn

---
**Date**: 2026-06-05

### Bug: Briefing interrupted by greeting
- **Root cause**: `news_control(complete/close)` emitted `stop_audio`, which killed the entire `AudioLoop` (not just mute playback), destroying the Gemini session mid-briefing
- **Fix**: Removed `stop_audio` from `news_control` handler — frontend `stopAudio()` (AudioContext.close) is sufficient for cleanup

### Bug: Exit button not working reliably
- **Root cause**: CSS animation delay (`animation-delay: 1s`) on `.wfn-exit-btn` and `opacity` transitions prevented click registration during early phases
- **Fix**: Removed animation delay, set `opacity: 1` and `z-index: 9999` at all times

### Bug: Window remains open after clicking exit (Issue 3)
- **Root cause**: `onClosePanel("all")` only cleared 4 panel states (terminal, search, fileOutput, infoPanel), leaving 14+ panels/tool windows visible
- **Fix**: Added all missing panel clears in both `panel: "all"` case and `onComplete` callback

### Bug: Universal command latency (Issue 4)
- **Root cause 1 (4a)**: `match_with_context` ran on every incremental transcription delta (even single-word fragments), triggering full intent matching + workflow data collection per partial utterance
- **Root cause 2 (4b)**: `workflow_data.collect()` made async network calls with no timeouts (weather: 2 sequential calls, github: sync blocking)
- **Root cause 3 (4c)**: `CONTEXT_WINDOW_SIZE = 5` iterated 5 context entries per match attempt — unnecessary for intent detection
- **Root cause 4 (4d)**: Tool calls processed sequentially in a `for` loop — independent I/O-bound calls serialized

### Fixes Applied

#### `backend/soda.py`
- **4a**: Added `len(delta) > 15` gate before `match_with_context` — skips word fragments
- **4d**: Refactored tool call loop to use `asyncio.gather(*tasks)` — parallelizes independent tool dispatch

#### `backend/workflow_data.py`
- **4b**: Added `asyncio.wait_for(timeout=2.0)` to `_get_weather` (both `get_ip_info` and `get_weather` calls)
- **4b**: Reduced `_get_network_latency` timeout from 5s to 2s
- **4b**: Made `_get_github` async with `asyncio.to_thread` + 2s timeout (was synchronous, blocking event loop)

#### `backend/workflow_intent.py`
- **4c**: Reduced `CONTEXT_WINDOW_SIZE` from 5 to 2

#### `src/App.jsx`
- **Issue 3**: Added all missing panel clears to `panel: "all"` and `onComplete`

#### `src/components/workflows/WorkflowNewsBriefing.jsx`
- **Issue 2**: Added `useEffect` with `keydown` listener for `Escape` key → calls `handleExit()`

#### `src/styles/workflows.css`
- **Issue 2**: Exit button: removed animation delay, set immediate `opacity: 1` and `z-index: 9999`

---
**Date**: 2026-06-05

### Bug 1: Double Greeting

**Root cause**: `React.StrictMode` double-mount unmounts the component and calls `socket.disconnect()` in cleanup, killing the AudioLoop. The re-mount creates a new `start_audio` → new AudioLoop → second greeting.

**Fixes in `src/App.jsx`**:
- Added `connectGuardRef` (`useRef(false)`) — `onConnect` checks this ref and only emits `start_audio` once
- `connectGuardRef` resets to `false` on real disconnect (for actual reconnections)
- **Removed `socket.disconnect()` from cleanup** — prevents StrictMode from killing AudioLoop between mounts. Socket stays connected across component re-mounts, so `connect` event never fires twice

### Bug 2: News Workflow Auto-Trigger

**Root cause**: `SCORE_THRESHOLD = 3` in `workflow_intent.py` — a single keyword match (each = +3 pts) fires a workflow. Combined with partial utterance matching on incremental speech deltas (soda.py:644), even ambient noise snippets can trigger.

**Fixes in `backend/workflow_intent.py`**:
- `SCORE_THRESHOLD` raised from **3 → 6** (now requires 2+ keyword/regex matches or a phrase match)
- Added `MIN_UTTERANCE_LENGTH = 8` — filters out partials and noise shorter than 8 chars
- `match_with_context` now returns `None` early if `len(text) < MIN_UTTERANCE_LENGTH`

### Bug 3: Learned Keywords Feedback Loop

**Root cause**: Every auto-trigger adds words to `trigger_memory.json`, which gets injected back into the intent matcher via `inject_into_matcher()`, making future false positives more likely.

**Fixes in `backend/soda.py`**:
- **Removed** `self.wf_memory.inject_into_matcher(workflow_intent.intent_matcher)` — learned keywords are no longer injected
- The intent matcher's `learned_keywords` stays empty (`{}`), breaking the feedback loop
- Trigger recording still happens (for analytics) but never affects matching

### Bug 4: Gemini Calling Tools Unprompted

**Root cause**: System prompt said "When the user asks about news... call get_news immediately" — too broad, Gemini called it even during normal chat.

**Fixes in `backend/soda.py` (system prompt)**:
- Changed to "Only call get_news if the user EXPLICITLY asks for news"
- Added "Do NOT call it proactively during greetings or general conversation"
- Tightened `show_memory` prompt: added "Do NOT call this proactively"

---
**Date**: 2026-06-05

### Files Modified

#### `src/components/workflows/WorkflowNewsBriefing.jsx`
- **Import**: Added `WebviewActionService` import
- **Added refs**: `safetyTimerRef`, `ctrlArticleIdxRef`, `showcaseActiveRef`, `WEBVIEW_ID` constant
- **Issue 1 (Sync)**:
  - Removed 20s auto-advance `useEffect` (was competing with backend `news_control`)
  - Replaced with 60s safety-net timer (`resetSafetyTimer()`) — backend-driven advancement
  - Timer resets on every `news_control(next/goto)` event
  - Timer starts when Phase 4 (SHOWCASE) activates, cleared on unmount/complete
- **Issue 2 (Interactivity)**:
  - Webview registered with `WebviewActionService.register(WEBVIEW_ID, wv)` on creation
  - Unregistered on webview swap or component unmount
- **Issue 3 (Exit button)**:
  - Added `handleExit` callback → calls `onComplete()` + clears safety timer
  - Added `⊠ EXIT` button in JSX (top-right, below live tag)
- **Issue 4 (SODA control)**:
  - Added `webview_action` socket listener in component (routes to `WebviewActionService`)
  - Handles: click, type, scroll, scrollTo, getContent, getUrl, goBack, goForward, navigate, waitForLoad, executeJS
  - Emits `webview_action_result` back to backend
- **Fixed stale ref**: Replaced `autoAdvanceRef` with `safetyTimerRef` in cleanup useEffect

#### `src/styles/workflows.css`
- Added `pointer-events: auto` to `.wfn-showcase-panel`, `.wfn-webview`, `.wfn-showcase-nav`, `.wfn-nav-btn`
- Added `.wfn-exit-btn` styles (red HUD-styled exit button, fades in after 1s)

#### `src/App.jsx`
- **Issue 5 (Clean close)**:
  - Added `stopAudio()` function (closes AudioContext, resets audio timing)
  - Modified `onComplete` callback: calls `stopAudio()` + clears terminal/search/file/info panels
  - Added `socket.on('stop_audio', stopAudio)` handler for backend-driven audio stop
  - Proper cleanup: `socket.off('stop_audio', stopAudio)` in useEffect return

#### `backend/external_apis.py`
- Updated `get_news_tool` description: Phase 5 now says "FIRST call news_control(next), THEN describe" — fixes sync by making advancement precede narration
- Updated `news_control_tool` description: Changed from "describe → next → describe" to "next → describe → next → describe"
- Added `close` action to `news_control_tool` action list

#### `backend/soda.py`
- `news_control` handler: When `action == "close"` emits `stop_audio` + `close_panel({panel: "all"})`
- When `action == "complete"` also emits `stop_audio`

---

## Session 5 — News Auto-Advance Removed & open_browser Tool

**Date**: 2026-06-05

### Fix 1: News auto-advance removed (was causing wrong-article briefing)

**Root cause**: The turn-boundary auto-advance (added in Session 3) fired between audio chunks within the SAME Gemini response because `_news_advance_this_turn` was reset every time `_model_is_speaking` toggled True (multiple times per turn). This advanced the webview to a different article while Gemini was still describing the current one.

**Changes in `backend/soda.py`**:
- Removed all auto-advance state (`_news_auto_advance`, `_news_current_idx`, `_news_article_count`, `_news_advance_this_turn`, `_news_first_advance_done`) from `__init__`
- Removed auto-advance initialization from `get_news` handler
- Removed `_news_advance_this_turn = False` from `receive_audio` speaking turn detection
- Removed auto-advance tracking from `news_control` handler
- Removed the turn-boundary auto-advance block entirely

**Changes in `src/components/workflows/WorkflowNewsBriefing.jsx`**:
- Reduced `resetSafetyTimer()` from 60000ms → 20000ms

### Fix 2: Web search "open link" not working

**Root cause**: `open_browser` handler existed in `soda.py:1431` but had NO tool definition — Gemini couldn't see or call it.

**Changes in `backend/external_apis.py`**:
- Added `open_browser_tool` definition after `browse_webpage_tool` with `url` (required) + `browser` (optional)

**Changes in `backend/tools.py`**:
- Imported `open_browser_tool` from `external_apis`
- Added to `tools_list` (also restored 80+ accidentally deleted tool entries)

**Changes in `backend/soda.py`** (system prompt):
- Added "'open', 'show', 'visit', 'go to' any link → call `open_browser`" instruction

---

## Session 6 — User Audio Dropped During Model Speech + Chunk Size Latency

**Date**: 2026-06-05

### Root Cause #1: User audio silently dropped while model speaks

**The bug**: `_model_is_speaking = True` caused `listen_audio()` to `continue` (skip mic read entirely). Combined with `_clear_queues()` dropping pending audio chunks, user speech during model output was completely lost. The only receive window was a 0.5s timeout gap — forcing 4-5 repetitions.

**Fix**: Buffer user audio during model speech instead of dropping it.
- Added `self._audio_buffer = []` in `__init__`
- `listen_audio()`: When `_model_is_speaking`, still read mic, apply 1.8× amplification, compute RMS+mic level, and if `rms > VAD_THRESHOLD` append chunk to `_audio_buffer`
- When `_model_is_speaking` transitions True→False (tracked via local `_was_model_speaking`), flush all buffered chunks to `audio_queue`
- `_clear_queues()` also clears `_audio_buffer` so stale buffered speech is dropped when model starts a new turn

### Root Cause #2: Tiny audio chunks created massive latency

**The bug**: `CHUNK_SIZE = 512` at 16kHz = 32ms per chunk. A 3-second utterance generated ~94 chunks, each requiring a separate network send to Gemini Live API, creating huge overhead.

**Fix**: `CHUNK_SIZE = 512 → 4096` (256ms per chunk). 3-second utterance now sends ~12 chunks instead of ~94.

### Fix 3: Reduce model-speaking dead-time

**Change**: `play_audio()` timeout `0.5s → 0.2s` — user speech gets through 300ms faster after model finishes.

### Fix 4: Context safety valve

**Change**: Added `MAX_CONTEXT_CHARS = 5000` to `workflow_intent.py`. When total context text exceeds 5K chars, oldest entries are pruned (keeping ~125 most recent). Prevents unbounded growth while respecting user's "no hard entry cap" preference.

---

## Session 7 — Search Narration Fix + External Browser Separation

**Date**: 2026-06-05

### Problem: Gemini narrated search results aloud + opened URLs in external browser

**Symptoms**:
- After "search for X", Gemini read the entire results list aloud (wasting time)
- User had to repeat "open result" commands 4-5 times
- URLs opened in system browser AND internal webview simultaneously

### Changes

#### `backend/soda.py` — open_browser handler
- **Before**: Always called `system_app.open_url()` (external browser) AND emitted `open_url` socket event (internal webview)
- **After**: 
  - Default (`external=false`): Only emits `open_url` (internal webview only)
  - When `external=true`: Calls `system_app.open_url()` (external browser) + emits `window_minimize` (auto background) + emits `open_url`
  - New param `external` (BOOLEAN, default false)

#### `backend/soda.py` — system prompt
- Replaced generic "use web_search_live to find it" with a 7-step SEARCH WORKFLOW block:
  1. Call web_search_live → results displayed visually
  2. Do NOT read/summarize results aloud
  3. Say "I found X results, sir. Which one should I open?" and stop
  4. Wait for user to pick by number
  5. Call open_browser with chosen URL
  6. Call browse_webpage to fetch page content
  7. Summarize the PAGE content (not the search list)

#### `backend/external_apis.py` — 3 tool descriptions updated
- `web_search_live_tool`: "Do NOT narrate, read aloud, or summarize results. Simply say 'I found X results' and ask which number to open."
- `browse_webpage_tool`: "Use AFTER user picks a result and you've opened via open_browser. Summarize the PAGE CONTENT, not the search results."
- `open_browser_tool`: "Opens in internal webview by default. Set external=true only if user explicitly says 'open in Chrome' or names a browser. When external=true, SODA auto-goes to background."

---



