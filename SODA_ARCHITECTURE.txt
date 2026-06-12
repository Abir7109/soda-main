# SODA Project Architecture Documentation

**SODA (Super Optimized Design Assistant)** - A sophisticated AI-powered desktop assistant with voice interaction, system control, and workflow automation.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Structure](#backend-structure)
4. [Frontend Structure & UI](#frontend-structure--ui)
5. [Electron Wrapper](#electron-wrapper)
6. [Key Systems](#key-systems)
7. [Workbase Project Tracking](#workbase-project-tracking)
8. [Idle Mode](#idle-mode)
9. [Context Refresh System](#context-refresh-system)
10. [Configuration](#configuration)
11. [Development Workflow](#development-workflow)
12. [Important Conventions](#important-conventions)
13. [File Structure Summary](#file-structure-summary)
14. [Critical Implementation Details](#critical-implementation-details)
15. [Troubleshooting](#troubleshooting)
16. [Future Enhancement Areas](#future-enhancement-areas)

---

## Project Overview

SODA is a desktop AI assistant that:
- Interacts via voice using Google Gemini Live API
- Controls the Windows system (mouse, keyboard, windows, apps)
- Browses the web and performs searches
- Manages files and executes code
- Remembers facts, people, and lessons
- Generates websites via the Websmith agent
- Integrates with GitHub, Vercel, Netlify, Telegram

**Tech Stack:**
- Backend: Python 3.11, FastAPI, Socket.IO, Gemini Live API
- Frontend: React 18, Vite, Tailwind CSS, Socket.IO Client
- Desktop: Electron
- Audio: Web Audio API (frontend), PyAudio (backend)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Electron Main Process                 │
│  (main.js) - Window management, backend startup, cleanup    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                                 │
┌───────▼────────┐            ┌─────────▼─────────┐
│  React Frontend │            │  Python Backend  │
│  (App.jsx)      │◄──Socket.IO──►│  (server.py)     │
│  - Audio I/O    │   :8000       │  - AudioLoop     │
│  - Panels       │            │  - Tool Dispatch │
│  - Animations   │            │  - Memory Store  │
└─────────────────┘            └────────┬─────────┘
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                    ┌─────────▼────────┐   ┌───────▼────────┐
                    │  Gemini Live API  │   │  External APIs  │
                    │  (voice I/O)      │   │  (weather, etc) │
                    └───────────────────┘   └─────────────────┘
```

---

## Backend Structure

### Core Files

**`backend/server.py`**
- FastAPI + Socket.IO server
- Handles client connections/disconnections
- Manages `AudioLoop` lifecycle
- Dispatches tool calls with confirmation flow
- Loads/saves settings and permissions
- Graceful shutdown handling

**`backend/soda.py`**
- `AudioLoop` class - core interaction engine
- Manages microphone input and audio output
- Interfaces with Gemini Live API
- Handles transcription and tool calls
- Integrates personality engine
- System prompt construction via `_build_system_prompt()`

**`backend/external_apis.py`**
- Implementations for external API calls
- Weather, IP info, exchange rates, news, dictionary, Wikipedia
- Web search and webpage browsing
- File operations (list, open, view)
- Notepad interactions
- Telegram messaging
- Tool schema definitions

**`backend/tools.py`**
- Centralized tool schema aggregation
- Imports tools from `external_apis.py` and other modules
- Provides `tools_list` for Gemini API
- Includes 40+ tool definitions

### Memory & Personality

**`backend/memory_store.py`**
- Long-term memory management
- Storage in `projects/long_term_memory/`
- People, lessons, conversation summaries, facts
- JSONL file format with deduplication
- `build_context_block()` for session start injection

**`backend/user_memory.py`**
- User profile and preferences
- Fact storage and search
- Conversation history (rolling buffer, max 200)
- `memory_summary()` for quick overview

**`backend/personality.py`**
- `MoodState` class for emotional tracking
- `PersonalityEngine` for quip selection
- Predefined quip pools (idle, tool_success, tool_failure, etc.)
- Template substitution for dynamic responses
- History tracking to avoid repetition

### Workflow System

**`backend/workflow_intent.py`**
- `WorkflowIntentMatcher` class
- Identifies user intent for workflow triggering
- Uses phrases, keywords, and regex patterns
- Context window for improved accuracy
- Cooldown mechanism to prevent rapid re-triggering

**`backend/workflow_data.py`**
- Collects real-time data for workflow HUD animations
- System status, weather, tasks, GitHub activity
- Local Git status, active window, schedules
- Network latency measurement

### Screen Control

**`backend/screen_vision.py`**
- Screen capture using `mss`
- Image resizing and optimization
- Gemini Vision API integration
- OCR and text extraction
- `analyze_screen()` for screen description

**`backend/screen_control.py`**
- Mouse control: click, move, scroll, drag (pyautogui)
- Keyboard control: type, press hotkeys
- Window management: focus, list, move/resize (win32gui/win32con)

### System Control

**`backend/system_control.py`**
- Volume and brightness control
- Window actions (minimize, maximize, close)
- System actions (lock, restart, shutdown)
- Application launching
- Text input and hotkey execution

**`backend/system_local.py`**
- Clipboard read/write (cross-platform)
- Screenshot capture
- Process listing
- Active window detection
- Uses stdlib + mss (no new pip packages)

**`backend/system_app.py`**
- Terminal command execution with timeout
- Application launching (cross-platform aliases)
- Web search and URL opening
- YouTube search
- WhatsApp/Telegram/Discord messaging via desktop automation

### Task & Project Management

**`backend/task_planner.py`**
- Multi-step task tracking
- TODO items with status (pending/running/done/failed)
- Plan creation and updates
- History tracking

**`backend/project_manager.py`**
- Project context management
- File listing and content reading
- Chat history logging
- Workspace: `projects/` directory

### Scheduling

**`backend/reminders.py`**
- One-shot and recurring reminders
- Background asyncio task for polling
- Socket.IO event emission on fire
- Storage: `projects/long_term_memory/reminders.json`

**`backend/schedules.py`**
- Schedule management with Windows Task Scheduler integration
- Date parsing (today, tomorrow, etc.)
- Notification via PowerShell

### Integrations

**`backend/github_tools.py`**
- GitHub CLI wrapper
- Repo listing, creation, PR/issue management

**`backend/vercel_tools.py`**
- Vercel CLI wrapper
- Project listing, deployment, environment variables

**`backend/netlify_tools.py`**
- Netlify CLI wrapper
- Site management, deployment

**`backend/telegram_bot.py`**
- Background thread for Telegram bot
- python-telegram-bot integration
- Message forwarding to Socket.IO
- File sending capability

### Code Execution

**`backend/code_runner.py`**
- Python/JavaScript code execution sandbox
- Temporary directory isolation
- Timeout handling
- Environment variable stripping for security

### Website Generation

**`backend/website_agent.py`**
- Websmith agent for website generation
- 7-stage thinking pipeline (analyze, brainstorm, design, develop, review, refine)
- Multi-pass quality assurance
- Design system knowledge base (philosophies, palettes, fonts)
- Gemini 2.5 Flash integration

### Utilities

**`backend/logger.py`**
- Logging setup with rotation
- Separate files for main, debug, and errors
- Global exception hooks

---

## Frontend Structure & UI

### Layout Architecture

SODA's UI is a single-page application built around a **center-anchored HUD paradigm**:

```
┌─────────────────────────────────────────────────────┐
│  ┌──────────────┐                   ┌──────────────┐│
│  │ SlidePanel   │                   │ SlidePanel   ││
│  │ (left)       │    ┌───────┐      │ (right)      ││
│  │              │    │  Orb  │      │              ││
│  │              │    │       │      │              ││
│  │              │    └───────┘      │              ││
│  │              │  CameraCapture    │              ││
│  └──────────────┘                   └──────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │           SlidePanel (bottom)                    ││
│  │  Status Bar  |  Mic Level  |  Idle Indicator    ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────┐         ┌─────────────────────────┐│
│  │ FloatingWindow │       │  WorkflowOverlay        ││
│  │ (draggable)    │       │  (full-screen HUD)      ││
│  └─────────────────┘       └─────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Key layout rules:**
- **Center orb** (`HolographicOrb`) is always visible — the visual focal point
- **Slide panels** enter from left/right/top/bottom on demand, positioned by `PanelSpaceContext`
- **Floating windows** are draggable, glassmorphism-styled overlays for persistent content
- **Workflow overlays** are full-screen phased animations that render above everything
- **Camera capture** renders as a small picture-in-picture overlay near the orb
- **Idle mode** applies `grayscale(100%)` filter to the orb and shows a status label

### Component Tree

```
<App>
  ├── <FloatingWindow> (×N, position-managed)
  ├── <SlidePanel> (×N, left/right/top/bottom)
  ├── <CameraCapture>
  │   └── <WorkflowOverlay>
  │       └── <WorkflowComponent> (lazy-loaded)
  ├── <HolographicOrb> (center, always mounted)
  ├── <Notepad>
  ├── <ScheduleWindow>
  ├── <WebsitePreview>
  └── <WebsmithConsole> / <WebsmithDesignSpec>
```

### Core Components

**`src/App.jsx`** (~1680 lines)
- Root component — socket.IO event hub for the entire UI
- Panel state management: `showPanel`, `panelType`, `panelMode` control which panels are open
- Audio playback via `AudioContext` (`playPcmBytes()`)
- Workflow overlay lifecycle: `workflow` state + refs for auto-dismiss timers
- Idle mode: `idleMode` state, `onIdleMode` socket handler
- Error boundaries: `<RootErrorBoundary>` wraps all animation components
- Status text reflects state: listening/thinking/processing/idle
- Socket events handled: `audio_data`, `transcription`, `status`, `tool_confirmation_request`, `window_control`, `project_update`, `settings`, `error`, `command_output`, `search_results`, `tool_result`, `auth_status`, `open_url`, `webview_action`, `close_panel`, `workflow_start`, `news_briefing_control`, `stop_audio`, `web_builder_status`, `web_builder_progress`, `idle_mode`

**`src/components/HolographicOrb.jsx`**
- Canvas-based animated visualization — the visual centerpiece
- 7 mood-based color palettes: neutral, playful, tired, curious, smug, serious, excited
- States: idle (grayscale + slow pulse), listening (cyan glow), thinking (pulsing amber), speaking (expanding rings)
- Mic level reactivity: concentric rings pulse with input amplitude
- Particle system: floating dots with organic motion
- Gradient transitions between mood states
- `idle` prop: zeroes `currentMicLevel`, applies CSS grayscale filter, dims shadow
- Canvas redraw at ~30fps via `requestAnimationFrame`

**`src/components/CameraCapture.jsx`**
- Periodic 640x480 camera frames via `getUserMedia()`
- Frames sent as base64 over Socket.IO (`video_frame` event)
- Renders as small picture-in-picture overlay
- Face recognition frame dispatch
- Transparent click-through when not active

**`src/components/FloatingWindow.jsx`**
- Draggable, resizable window with glassmorphism backdrop
- Title bar with close/minimize buttons
- Content slot for pluggable panels
- Used for: file output, webpage preview, deployment logs

**`src/components/SlidePanel.jsx`**
- Animated slide-in panel with configurable direction (left, right, top, bottom)
- Staggered entrance animation with cubic-bezier easing
- Auto-positioned by `PanelSpaceContext` to avoid overlap
- Close button + click-outside-to-dismiss
- Content slot renders specialized panel components

**`src/components/Notepad.jsx`**
- Multi-tab text editor
- Create/open/save files
- Controlled by backend via Socket.IO (`open_notepad`, `notepad_write`, `notepad_read`)

**`src/components/WebsitePreview.jsx`**
- `<iframe>`-based preview for generated websites
- Sandboxed rendering
- Resize handle for responsive testing

**`src/components/WebsmithConsole.jsx`**
- Real-time display of the WebBuilder agent's thinking pipeline
- 7-stage progress tracker (analyze → brainstorm → design → develop → review → refine)
- Animated thought bubbles

**`src/components/WebsmithDesignSpec.jsx`**
- Visual design specification panel
- Color palette swatches, typography samples, spacing grid
- Generated by WebBuilder during the design phase

**`src/components/ScheduleWindow.jsx`**
- Schedule creation/edit form
- Date/time picker with natural language parsing
- Recurring event configuration

**`src/components/chat/ChatBar.jsx`**
- Text input bar at bottom of screen
- Send button + voice toggle
- Appears in idle state of workflow overlays

### Panel System (16 Specialized Panels)

Located in `src/components/panels/`. Each maps to a specific tool category:

| Panel | Triggered By | Content |
|---|---|---|
| `SearchResultsPanel` | `web_search_live` | Search result cards with title/URL/snippet |
| `FileOutputPanel` | `open_file`, `view_file` | File content with syntax highlighting |
| `InfoPanel` | `get_weather`, `get_ip_info`, `get_exchange_rate` | Compact info cards |
| `ToolOutputPanel` | Any tool execution | Formatted tool result |
| `WebpageSummaryPanel` | `browse_webpage` | Extracted page content |
| `FileBrowserPanel` | `list_files` | Directory tree with search + new folder button |
| `ToolShowcasePanel` | `show_tools` | Grid of available tool cards |
| `WeatherPanel` | `get_weather` (detail) | Extended weather forecast |
| `NewsPanel` | `get_news` | Article list with headlines |
| `SystemStatusPanel` | `get_system_status` | CPU/RAM/disk gauges |
| `CurrencyPanel` | `get_exchange_rate` | Currency conversion table |
| `ProcessListPanel` | `list_processes` | Running process table with kill |
| `NetworkInfoPanel` | `get_ip_info` | Network interface details |
| `TaskTerminalPanel` | `terminal_execute`, `execute_command` | Terminal output with ANSI colors |
| `GitHubPanel` | `github_list_repos` | Repo cards with star counts |
| `DeployPanel` | `vercel_list_deployments`, `netlify_list_deploys` | Deployment status timeline |

**Panel behavior:**
- Panels auto-stack by direction — `PanelSpaceContext` tracks visible panels and applies offsets
- Panels slide in with 300ms cubic-bezier animation
- Click outside or press Escape to dismiss
- Only one panel per direction can be open at a time (new one replaces the old)
- Bottom panels shift right (+200px) to avoid the center orb zone
- Top panels shift right (+160px) for the same reason
- Floating windows use `findFreeFloatPosition()` to avoid overlapping with panel zones

### Workflow Overlay System (13 Components)

Located in `src/components/workflows/`. These are full-screen phased HUD animations triggered by `workflow_start` socket events.

**Architecture:**

```
workflows/
├── index.js                   # WORKFLOW_MAP registry + getWorkflowComponent()
├── WorkflowOverlay.jsx        # Container — 60s auto-dismiss, Suspense lazy loading
├── WorkflowStartup.jsx        # System boot sequence
├── WorkflowMorning.jsx        # Morning briefing
├── WorkflowOutside.jsx        # Leaving-home checklist
├── WorkflowProjectReview.jsx  # GitHub code review (7 phases, 4000ms)
├── WorkflowSession.jsx        # Focus session start
├── WorkflowEndOfDay.jsx       # End-of-day summary
├── WorkflowHealthCheck.jsx    # System health scan
├── WorkflowMeeting.jsx        # Meeting prep
├── WorkflowDeployCheck.jsx    # Deployment readiness
├── WorkflowCodeReview.jsx     # Code quality analysis
├── WorkflowBreakTime.jsx      # Break reminder
├── WorkflowMemoryView.jsx     # Memory database (eager-loaded, stateful)
├── WorkflowNewsBriefing.jsx   # News with Electron webview (eager-loaded)
└── WorkbaseShowcase.jsx      # Project portfolio (7 phases, 4000ms)
```

**Animation engine pattern (all lazy-loaded HUD components):**
1. Define `PHASES` array with `{id, name, start, dur}` — total ~4000ms
2. `~40 useRef` hooks for DOM element references
3. Helper functions `a(el)` (show) / `d(el)` (hide) — opacity + CSS classes
4. `raf()` / `ct()` wrappers for `requestAnimationFrame` + `setTimeout` with cleanup
5. `activatePhase(pid)` switch — dispatches per-phase logic
6. `requestAnimationFrame` tick loop tracks elapsed time, activates phases
7. Cleanup on unmount: clears all timeouts + cancels animation frames
8. Phase label + timeline bar at bottom of screen
9. Transition to idle state → `onComplete()` callback → overlay dismisses

**Two stateful (eager-loaded) workflows:**
- `WorkflowNewsBriefing` — manages Electron `<webview>` for article browsing
- `WorkflowMemoryView` — interactive memory browser with search/delete

### Visual Design System

**CSS Custom Properties (`src/styles/main.css`):**

```css
:root {
  --soda-bg: #0a0a0f;           /* Near-black background */
  --soda-surface: #12121a;      /* Slightly lighter for panels */
  --soda-border: #1e1e2e;       /* Subtle border */
  --soda-text: #e0e0e0;         /* Primary text */
  --soda-muted: #666680;        /* Muted/secondary text */
  --soda-accent: #00f0ff;       /* Cyan primary accent */
  --soda-accent2: #ff00aa;      /* Magenta secondary accent */
  --soda-success: #00ff88;      /* Green for success states */
  --soda-warning: #ffaa00;      /* Amber for warnings */
  --soda-error: #ff3355;        /* Red for errors */
  --soda-info: #4488ff;         /* Blue for info */
}
```

**Workflow-specific tokens (in `workflows.css`):**
```css
--wf-cyan: #00f0ff;
--wf-green: #00ff88;
--wf-amber: #ffaa00;
--wf-red: #ff3355;
--wf-blue: #4488ff;
--wf-panel-bg: rgba(0, 240, 255, 0.02);
--wf-grid: rgba(0, 240, 255, 0.04);
```

**Typography:**
- Space Grotesk (headings, HUD labels)
- JetBrains Mono (code, terminal output)
- Fira Code (alternative code font)
- All sizes in px/rem, with letter-spacing for HUD aesthetic

**Design Philosophy:**
- Dark background (`#0a0a0f`) with cyan (`#00f0ff`) primary accent
- Glassmorphism panels (`rgba(0, 240, 255, 0.02)` backgrounds + translucent borders)
- No rounded corners — sharp, tactical aesthetic
- Monospace/geometric fonts for HUD feel
- Subtle scanlines and grid backgrounds for workflow overlays
- CSS `drop-shadow` and `box-shadow` for glow effects (never `blur()` directly)

### Animations

**`src/components/animations/`** — Lazy-loaded tool-specific animations:
- Categories: system, file, web, media, device, github, vercel, netlify, telegram, terminal, code, memory, tools, messaging
- Each is a React component that renders an animated icon/micro-interaction
- Played inside panels when tools execute

**Motion patterns used:**
- Slide in: `translateY(12px) → translateY(0)` with 400ms cubic-bezier(0.16,1,0.3,1)
- Fade in: `opacity 0 → 1` (300-500ms)
- Scale bounce: `scale(0) → scale(1)` with 500ms cubic-bezier(0.34,1.56,0.64,1)
- Counter fill: animated number counting up via `requestAnimationFrame`
- Pulse: subtle scale oscillation for active states
- Scanline: horizontal bar sweep across full screen
- Flash: quick opacity burst for state transitions
- Typing: per-character reveal at 10ms intervals

### Audio Visualization

- **HolographicOrb** reacts to mic level (amplitude data from `getUserMedia` via Socket.IO)
- **SoundService** plays short Web Audio API tones for interaction feedback:
  - Listening: soft low sine wave
  - Thinking: rising chime
  - Tool done: confirm tone
  - Tool error: alert tone
  - Startup: boot sequence
- Audio playback in `App.jsx` uses `AudioContext.decodeAudioData()` + `createBufferSource()`
- PCM chunks from backend decoded to Float32 and scheduled with `audioNextTime` for gapless playback

### Services

**`src/services/SocketService.js`**
- Singleton Socket.IO client
- Backend URL: `http://localhost:8000`
- Auto-reconnection with exponential backoff
- Used by all components for real-time communication

**`src/services/SoundService.js`**
- Synthesized Web Audio API tones (no audio files)
- Pre-configured oscillator settings per sound type
- Volume control via master gain node

**`src/services/WebviewActionService.js`**
- Manages Electron `<webview>` element lifecycle
- Actions: click, type, scroll, getContent, getUrl, goBack, goForward, navigate, waitForLoad, executeJS
- Singleton pattern with register/unregister lifecycle

### Contexts

**`src/contexts/PanelSpaceContext.jsx`**
- Provides `registerPanel(direction)` / `unregisterPanel(direction)`
- `getOffset(direction)` → `{offsetX, offsetY}` for auto-positioning
- Tracks visible panels to prevent overlap:
  - Top panels: +160px X offset (right of center orb)
  - Bottom panels: +200px X offset (right of left panel zone)
  - Floating windows: `findFreeFloatPosition()` avoids both left/right panel zones

### Styles

**`src/styles/main.css`**
- All CSS custom properties (design tokens)
- Tailwind CSS v3 utility classes (compiled via PostCSS)
- Panel slide animations, terminal styles, floating window glassmorphism
- Workflow HUD keyframes (pulse, flash, scanline, cursor-blink, panel-glow)
- Custom scrollbar: thin, dark, cyan-accented
- Idle mode: `.idle-label` with 3s pulse animation, positioned above orb
- HolographicOrb transitions: grayscale filter for idle, drop-shadow for active
- No rounded corners anywhere — consistent sharp aesthetic

---

## Electron Wrapper

### Main Process

**`electron/main.js`**
- BrowserWindow creation (1920x1080)
- Backend startup (Python 3.11 required)
- Vite dev server detection (ports 5173-5183)
- Fallback to dist build
- Camera/microphone permission handling
- IPC handlers for window controls
- Port cleanup on quit
- Backend health check before window creation

### Preload Script

**`electron/preload.js`**
- Context bridge for IPC
- Exposes: minimize, maximize, close, restore
- Window control event listener

---

## Key Systems

### Audio Pipeline

**Flow:**
1. Frontend: Microphone input via `getUserMedia()`
2. Backend: `AudioLoop.listen_audio()` captures audio
3. Backend: Sends to Gemini Live API via `send_realtime_input()`
4. Backend: Receives audio chunks from Gemini
5. Backend: Emits `audio_data` events to frontend
6. Frontend: `playPcmBytes()` plays via Web Audio API

**Configuration:**
- Sample rate: 24000 Hz
- Server-side VAD enabled (automatic_activity_detection)
- Echo-safe buffering during model speech
- No client-side activity signals (server handles VAD)

### Tool Confirmation Flow

1. Backend receives tool call from Gemini
2. Backend emits `tool_confirmation_request` to frontend
3. Frontend shows confirmation panel (if not auto-allowed)
4. User confirms or denies
5. Frontend emits `tool_confirmation` response
6. Backend executes tool or cancels
7. Backend emits `tool_result` with output

### Socket.IO Events

**Backend → Frontend:**
- `connect`, `disconnect`, `status`
- `audio_data` - PCM audio chunks
- `transcription` - Real-time transcription
- `tool_confirmation_request` - Tool confirmation needed
- `tool_result` - Tool execution result
- `command_output` - Terminal command output
- `search_results` - Web search results
- `workflow_start` - Launch workflow HUD
- `news_briefing_control` - Navigate news articles
- `stop_audio` - Stop audio playback
- `agent_thought` - Websmith agent thoughts
- `website_spec` - Website design specification
- `reminder_fired` - Reminder triggered
- `auth_status` - Authentication status (always authenticated)

**Frontend → Backend:**
- `start_audio` - Begin audio loop
- `tool_confirmation` - Confirm/deny tool
- `webview_action_result` - Webview action result
- `video_frame` - Camera frame capture
- `client_log` - Frontend error logging

### Memory System

**Storage Locations:**
- `projects/long_term_memory/user_profile.json` - User profile
- `projects/long_term_memory/facts.jsonl` - Key-value facts
- `projects/long_term_memory/people.jsonl` - People information
- `projects/long_term_memory/lessons.jsonl` - Lessons learned
- `projects/long_term_memory/summaries.jsonl` - Conversation summaries
- `projects/long_term_memory/reminders.json` - Reminders
- `projects/long_term_memory/schedules.json` - Schedules
- `projects/long_term_memory/history.jsonl` - Chat history

**Context Injection:**
- `build_context_block()` aggregates profile, facts, people, lessons
- Injected into system prompt on session start

### Workflow System

**Triggering:**
- `WorkflowIntentMatcher.match_with_context()` analyzes user input
- Uses phrases, keywords, and regex patterns
- Context window improves accuracy
- Cooldown prevents rapid re-triggering

**Available Workflows:**
- startup, morning, outside, end-of-day, news-briefing, memory-view
- And 11+ animated workflow components

**HUD Animation:**
- `WorkflowOverlay` renders active workflow
- Multi-phase animations with progress tracking
- Auto-dismiss after completion

### Websmith Website Generation

**Pipeline:**
1. Deep Analysis - Understand intent, goals, audience
2. Creative Brainstorm - Generate design directions
3. Design Reasoning - Color theory, typography, spacing
4. Architectural Planning - Component tree, layout grid
5. Development - Generate HTML/CSS/JS code
6. Quality Review - 7-dimensional self-critique
7. Refinement - Polish based on review

**Quality Dimensions:**
- Structure, Style, Interactivity, Accessibility, SEO, Performance, Semantics

**Design System:**
- 8 design philosophies (glassmorphism, neumorphism, brutalism, etc.)
- 14 color palettes
- 15 font pairings
- 40+ component library

---

## Workbase Project Tracking

### Overview
Workbase is a permanent project indexing and tracking system that monitors the user's real-world software projects (AI AUTORESPONDER, Guardian ANTI THEFT, Hajj Kafela, WordsNest) — separate from the lightweight `ProjectManager` session system.

```
                          ┌──────────────────────┐
                          │   Gemini Live API     │
                          │  calls workbase_*     │
                          └──────────┬───────────┘
                                     │
                          ┌──────────▼───────────┐
                          │   _dispatch_tool()   │
                          │  6 workbase handlers │
                          └──────────┬───────────┘
                                     │
                          ┌──────────▼───────────┐
                          │     Workbase class   │
                          │  backend/workbase.py │
                          └──────────┬───────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
    ┌─────────▼─────────┐  ┌────────▼────────┐  ┌─────────▼─────────┐
    │  workbase/         │  │  workbase/       │  │  Socket.IO emit   │
    │  index.json        │  │  projects/       │  │  workflow_start   │
    │  (metadata + logs) │  │  {name}/         │  │  → WorkbaseShowcase│
    └───────────────────┘  │  context.md       │  └───────────────────┘
                           └─────────────────┘
```

### Data Flow

**Import:** `workbase_import(folder_path)` → scans for context.md/README.md → extracts description + tech stack → creates `workbase/projects/{name}/context.md` → adds to `index.json` → emits `workflow_start` to trigger showcase animation

**Query:** `workbase_get(project_name)` → reads `index.json` entry + `context.md` → returns structured JSON with suggestions

**Progress:** `workbase_save_progress(project_name, entry)` → appends to `progress_log[]` in `index.json` with timestamp

**Compare:** `workbase_compare(project_name)` → gathers context.md + last_context + progress_log + folder snapshot → returns to Gemini for analysis and suggestions

**Save Context:** `workbase_save_context(project_name, context)` → Gemini auto-calls after discussing a project → stores in `last_context` + `last_context_time` for cross-session continuity

### File Structure

```
backend/workbase/
├── index.json                 # Master index — all project metadata + progress logs
└── projects/
    ├── ai-autoresponder/
    │   └── context.md         # Full project summary
    ├── guardian-anti-theft/
    │   └── context.md
    ├── hajj-kafela/
    │   └── context.md
    └── wordsnest/
        └── context.md
```

### Index Schema (`index.json`)

```json
{
  "projects": [{
    "name": "safe-folder-name",
    "display_name": "AI AUTORESPONDER",
    "description": "Project description from context.md",
    "tech_stack": ["Next.js", "Prisma", "PostgreSQL"],
    "status": "Tracked | Production | Development",
    "folder_path": "D:\\AI AUTORESPONDER",
    "last_context": "Last conversation summary saved here",
    "last_context_time": "2026-06-07 02:36:13",
    "progress_log": [
      {"timestamp": "2026-06-07", "entry": "Fixed authentication bug"}
    ]
  }]
}
```

### Context File Format (`context.md`)

```markdown
# Project Name

## Description
One-paragraph summary

## Tech Stack
- Technology 1
- Technology 2

## Status
Production / Development / Maintenance

## Architecture
Description of architecture

## Next Steps
- Step 1
- Step 2

## Folder
D:\path\to\project
```

### 6 Gemini-Callable Tools

| Tool | Arguments | Returns |
|---|---|---|
| `workbase_list` | (none) | All project names + statuses |
| `workbase_get` | `project_name` | Full context + progress + suggestions |
| `workbase_save_progress` | `project_name`, `entry` | Confirmation |
| `workbase_import` | `folder_path` | Scans folder, creates entry, triggers animation |
| `workbase_save_context` | `project_name`, `context` | Saves conversation summary + timestamp |
| `workbase_compare` | `project_name` | Full comparison data for Gemini analysis |

### Suggestion Engine
- `workbase_get` and `workbase_compare` include a `suggestions[]` field
- Sources: Next Steps from `context.md`, generic hints (no progress → start tracking, generic status → define), Gemini analysis of `compare_progress` return data
- Gemini reads the structured comparison output and naturally suggests next steps in conversation

---

## Idle Mode

### Overview
After 10 minutes of inactivity, SODA enters idle mode: the orb goes grayscale, audio responses are suppressed, and a wake word detector listens for "SODA", "Hey SODA", or "OK SODA" to resume.

```
User inactive for 600s
        │
        ▼
┌──────────────────┐     ┌──────────────────────┐
│ _enter_idle_mode │────►│ Orb: grayscale(100%) │
│                  │     │ Mic level: zero      │
│  soda.py:285-295 │     │ Label: "Idle Mode"   │
└──────────────────┘     │ Audio: suppressed    │
        │                └──────────────────────┘
        │
   [User says "SODA"]
        │
        ▼
┌──────────────────┐     ┌──────────────────────┐
│ _exit_idle_mode  │────►│ Orb: full color      │
│                  │     │ Audio: resumed        │
│  soda.py:297-304 │     │ Response: natural     │
└──────────────────┘     │ (no chime/alert)      │
                        └──────────────────────┘
```

### Implementation
- **`AudioLoop.__init__`**: `_idle_mode=False`, `_idle_timeout=600`
- **`_idle_check_loop`**: Completely skipped when `_idle_mode=True` — no personality quips
- **`_enter_idle_mode()`**: Sets flag, emits `idle_mode: {enabled: true}` to frontend
- **`_exit_idle_mode()`**: Clears flag, emits `idle_mode: {enabled: false}`, sets `_last_activity=time.time()`
- **`receive_audio()`**: At top of response loop — when idle, `continue` skips ALL processing except wake word check via `re.search(r'\bsoda\b', transcript, re.IGNORECASE)`
- Wake is **silent** — no chime or alert, SODA just starts responding naturally
- Wake word false positives ("baking soda") are an accepted tradeoff

### Frontend Visuals
- `HolographicOrb` receives `idle` prop → sets `currentMicLevel=0`, CSS `filter: grayscale(100%)`
- `App.jsx` renders `.idle-label` "SODA is in Idle Mode" above the orb with 3s pulse animation
- Status text changes to "idle"

### Backend Settings
- Controlled by SETTINGS dict in `server.py`:
  - `_idle_enabled` (default: True)
  - `_idle_threshold` (default: 45s — backend idle, separate from 600s user idle)

---

## Context Refresh System

### Overview
Prevents Gemini Live API from forgetting earlier context in long conversations by periodically injecting a conversation summary mid-session.

### Why This Is Needed
The Gemini Live API's `system_instruction` is fixed at session connect — it cannot be changed mid-session. Without context refresh, the model loses track of what was said more than ~20 turns ago.

### Implementation

**`AudioLoop.__init__`** adds:
- `_turn_count = 0` — tracks completed user+model exchanges
- `_context_refresh_interval = 12` — inject every 12 turns
- `_last_refresh_turn = 0` — prevents re-triggering
- `_exchange_history = []` — rolling buffer (max 30 entries) of recent exchanges

**`_inject_context_refresh()`**:
1. Takes last 10 exchanges from `_exchange_history`
2. Formats as compact summary with "do NOT read this aloud" instruction
3. Sends via `send_client_content(turn_complete=False)` — model absorbs silently without generating audio or creating a new turn
4. Wrapped in try/except — never crashes the session

**In `receive_audio()` after `flush_chat()`**:
1. Increments `_turn_count`
2. Captures `{user_transcription, model_text}` as an exchange entry
3. Dedup check prevents duplicate entries on silent/model-only turns
4. Every 12 turns, calls `_inject_context_refresh()` if there's exchange data

### Key Details
- Uses `turn_complete=False` (same pattern as existing reconnect context injection)
- Model absorbs the summary silently without generating audio
- Rolling buffer is append-only, truncated to 30 entries
- Dedup uses `(user_text, model_text[-40:])` tuple as a fingerprint

### Python Dependencies (`requirements.txt`)
```
fastapi
uvicorn
python-socketio
python-multipart
google-genai
python-telegram-bot
aiohttp
opencv-python
pyaudio
pillow
mss
httpx>=0.28.0
python-dotenv
trafilatura
```

### Node Dependencies (`package.json`)
```json
{
  "dependencies": {
    "lucide-react": "^0.300.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.7.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "concurrently": "^8.2.2",
    "electron": "^28.2.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.0",
    "wait-on": "^7.2.0"
  }
}
```

### Environment Variables
- `GEMINI_API_KEY` - Google AI Studio API key (required)
- `BOT_TOKEN` - Telegram bot token (optional)
- `TELEGRAM_USER_ID` - Telegram user ID for authorization (optional)
- `GOOGLE_AI_STUDIO_KEY` - Alternative for Websmith (optional)

### Vite Configuration (`vite.config.js`)
- React plugin
- Build output: `dist/`
- Path alias: `@` → `./src`
- Dev server port: 5173

### Tailwind Configuration (`tailwind.config.js`)
- Content: `./src/**/*.{js,ts,jsx,tsx}`
- Custom colors: soda-bg, soda-accent, soda-text, etc.
- Custom fonts: Space Grotesk, JetBrains Mono, Fira Code

---

## Development Workflow

### Starting Development
```bash
npm run dev
```
This starts:
1. Python backend on port 8000 (using Python 3.11)
2. Face server (if present)
3. Vite dev server on port 5173
4. Electron with GPU disabled

### Building for Production
```bash
npm run build
```
Builds React app to `dist/` directory.

### Running Production Build
```bash
npm run electron
```
Launches Electron with production build.

### Backend Only
```bash
cd backend
py -3.11 server.py
```
Starts FastAPI + Socket.IO server on port 8000.

### Important Notes
- **Python Version**: Must use Python 3.11 (default Python 3.12+ crashes server.py)
- **Port Conflicts**: Backend uses 8000, Vite uses 5173-5183
- **Cleanup**: Electron kills ports on quit to prevent conflicts

---

## Important Conventions

### Socket.IO Events
See `AGENTS.md` for complete event list. Key patterns:
- Backend emits events for all state changes
- Frontend emits user actions and confirmations
- Tool results routed to specialized panels based on tool type

### Audio Pipeline
- Use `send_realtime_input()` for live audio (faster, no ordering guarantees)
- Server-side VAD enabled (no client activity signals)
- Echo-safe buffering during model speech
- Sample rate: 24000 Hz

### Tool Permissions
- Some tools require user confirmation (write_file, send_whatsapp, etc.)
- Settings stored in backend for auto-allow preferences
- Confirmation panel shows tool name, arguments, and allow/deny buttons

### Panel Positioning
- Use `PanelSpaceContext` for auto-positioning
- Panels avoid overlap by checking visible directions
- Top panels shift right (+160px) to avoid center orb
- Bottom panels shift right (+200px) to avoid left panel zone

### Error Handling
- Frontend has error boundaries for animation components
- Root error boundary catches unhandled errors
- Errors logged to backend via `client_log` event
- Backend has global exception hooks

### Memory Storage
- Use JSONL format for append-only storage
- Deduplicate entries on write
- Limit entries (200 for history, 200 for facts, etc.)
- Build context block for session start injection

### Code Style
- Backend: Python with type hints where applicable
- Frontend: React functional components with hooks
- CSS: Tailwind utility classes + custom properties
- No inline styles in production code
- Semantic naming conventions

---

## File Structure Summary

```
soda/
├── backend/
│   ├── server.py              # FastAPI + Socket.IO server
│   ├── soda.py                # AudioLoop, Gemini integration
│   ├── external_apis.py       # External API implementations
│   ├── tools.py               # Tool schema aggregation (50+ tools)
│   ├── workbase.py            # Workbase project tracking (6 tools)
│   ├── workbase/              # Index + project context files
│   │   ├── index.json
│   │   └── projects/
│   │       ├── ai-autoresponder/context.md
│   │       ├── guardian-anti-theft/context.md
│   │       ├── hajj-kafela/context.md
│   │       └── wordsnest/context.md
│   ├── memory_store.py        # Long-term memory
│   ├── user_memory.py         # User profile & facts
│   ├── personality.py         # Personality engine
│   ├── workflow_intent.py     # Workflow triggering
│   ├── workflow_data.py       # Workflow data collection
│   ├── workflow_memory.py     # Workflow memory retrieval
│   ├── screen_vision.py       # Screen capture & OCR
│   ├── screen_control.py      # Mouse/keyboard/window control
│   ├── system_control.py      # System control functions
│   ├── system_local.py        # Local OS tools
│   ├── system_app.py          # App launching & web search
│   ├── reminders.py           # Reminder scheduler
│   ├── schedules.py           # Schedule management
│   ├── code_runner.py         # Code execution sandbox
│   ├── github_tools.py        # GitHub CLI wrapper
│   ├── vercel_tools.py        # Vercel CLI wrapper
│   ├── netlify_tools.py       # Netlify CLI wrapper
│   ├── web_builder_agent.py   # WebBuilder interview agent
│   ├── web_builder_orchestrator.py # Website generation orchestrator
│   ├── project_manager.py     # Lightweight session project manager
│   ├── task_planner.py        # Task planning
│   ├── telegram_bot.py        # Telegram integration
│   ├── face_store.py          # Face recognition storage
│   ├── face_api.py            # Face recognition API
│   ├── browser_interpreter.py # Browser automation
│   ├── translation_agent.py   # Translation (legacy)
│   ├── logger.py              # Logging setup
│   ├── logs/                  # Log files
│   └── projects/
│       └── long_term_memory/  # Memory storage (8 JSONL files)
├── src/
│   ├── App.jsx                # Main application (~1680 lines, socket event hub)
│   ├── main.jsx               # React entry point
│   ├── components/
│   │   ├── HolographicOrb.jsx # Canvas-based animated orb (center visual)
│   │   ├── CameraCapture.jsx  # Camera frame capture (PiP overlay)
│   │   ├── FloatingWindow.jsx # Draggable glassmorphism window
│   │   ├── SlidePanel.jsx     # Animated slide-in panel (4 directions)
│   │   ├── Notepad.jsx        # Multi-tab text editor
│   │   ├── WebsitePreview.jsx # iframe website preview
│   │   ├── WebsmithConsole.jsx # WebBuilder agent thoughts
│   │   ├── WebsmithDesignSpec.jsx # Design specification display
│   │   ├── ScheduleWindow.jsx # Schedule management form
│   │   ├── chat/
│   │   │   └── ChatBar.jsx    # Text input bar
│   │   ├── animations/        # Tool-specific micro-animations (15 categories)
│   │   ├── panels/            # 16 specialized slide panels
│   │   └── workflows/         # 13 HUD workflow overlay components
│   ├── services/
│   │   ├── SocketService.js   # Socket.IO singleton client
│   │   ├── SoundService.js    # Web Audio API synthesized tones
│   │   └── WebviewActionService.js # Electron webview automation
│   ├── contexts/
│   │   └── PanelSpaceContext.jsx # Auto-positioning panel manager
│   └── styles/
│       ├── main.css           # Design tokens, Tailwind, panel styles
│       └── workflows.css      # Workflow HUD keyframes + variables
├── electron/
│   ├── main.js                # Electron main process
│   └── preload.js             # IPC bridge
├── dist/                      # Production build output
├── package.json               # Node dependencies
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── requirements.txt           # Python dependencies
└── AGENTS.md                  # Development standards
```

---

## Critical Implementation Details

### Gemini Live API Integration
- Model: `gemini-2.5-flash-native-audio-latest`
- Audio format: 16-bit PCM, 24000 Hz
- System instruction: Built via `_build_system_prompt()`
- Tool definitions: Passed via `tools_list`
- Server-side VAD: Enabled with sensitivity 0.5

### Audio Playback (Frontend)
- Web Audio API with `AudioContext`
- PCM to Float32 conversion
- Scheduling with `audioNextTime` for seamless playback
- Sample rate: 24000 Hz (matches backend)

### Screen Capture
- Uses `mss` library for cross-platform screenshots
- Primary monitor: `sct.monitors[1]`
- PNG output with `mss.tools.to_png()`
- Resizing for Gemini Vision API limits

### Window Control (Windows)
- `win32gui` for window enumeration and control
- `win32con` for window state constants
- `pyautogui` as fallback for mouse/keyboard
- Window finding by title substring match

### File Operations
- Absolute paths required
- Binary files handled with base64 encoding
- Directory listing recursive
- File size limits for context building

### Webview Automation
- Electron `<webview>` tag requires `webviewTag: true`
- Actions executed via `executeJavaScript()`
- Service manages webview lifecycle
- Wait for load before executing actions

---

## Troubleshooting

### Backend Won't Start
- Check Python version (must be 3.11)
- Verify `GEMINI_API_KEY` is set
- Check port 8000 availability
- Review logs in `backend/logs/`

### Frontend Won't Connect
- Verify backend is running on port 8000
- Check Socket.IO client configuration
- Review browser console for errors

### Audio Not Working
- Check microphone permissions
- Verify Web Audio API support
- Check sample rate (24000 Hz)
- Review audio pipeline logs

### Electron Window Blank
- Check Vite dev server is running
- Verify dist build exists
- Review Electron main process logs
- Check webview permissions

---

## Future Enhancement Areas

- Workbase: auto-detect project folder changes (git diff, new files) and notify
- Workbase: Gemini-powered progress report generation via scheduled context check-ins
- Context refresh: make interval adaptive based on conversation complexity
- Idle mode: customizable wake word per user
- Idle mode: background project scanning during idle time
- Panel system: panel stacking with tab-bar for multiple panels per direction
- Workflow overlays: interactive elements (buttons, sliders) inside HUD animations
- Audio: implement barge-in/interruption (currently mic is muted during playback)
- Audio: frontend-side VAD for lower latency
- Memory: vector/semantic search for fact retrieval (beyond keyword)
- Screen: real-time screen streaming to Gemini (beyond periodic screenshots)
- Websmith: expanded component library with more design philosophies
- Deployment: Railway, Render, AWS integration tools
- Error recovery: session resumption after crash without losing context
- Camera: object detection and real-time scene description
- Android: remote companion app for mobile notifications and mic input

---

**Last Updated:** June 7, 2026
**Project Version:** 2.1.0
**Maintainer:** RM Abir
