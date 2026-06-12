# S.O.D.A. Tactical HUD — Project Summary

## Overview

**S.O.D.A.** (Special Operations Digital Assistant) is a voice-controlled AI desktop assistant with a tactical holographic HUD interface. It runs as an Electron + React frontend with a Python FastAPI backend, connected via Socket.IO. The assistant uses Google's Gemini 2.5 Flash Native Audio (Live API) for voice conversations, tool calling, and real-time audio streaming.

**Author**: Rahikul Makhtum Abir (RM Abir)

---

## Architecture

```
Electron Window (main.js)
  └─ Vite Dev Server (React SPA on :5173)
       └─ Backend Socket.IO Client
            └─ Python FastAPI Server (uvicorn on :8000)
                 └─ Google Gemini Live API (WebSocket)
```

### Frontend (React + Vite + TailwindCSS)
- **`src/App.jsx`** — Main application component. Manages all panel states, socket event handlers, audio playback via Web Audio API, tool result routing.
- **`src/services/SocketService.js`** — Socket.IO client singleton (connects to `localhost:8000`)
- **`src/services/SoundService.js`** — UI sound effects (listening, thinking, tool done, error, startup) via Web Audio API oscillators
- **`src/services/WebviewActionService.js`** — Singleton for managing webview instances
- **`src/contexts/PanelSpaceContext.jsx`** — Auto-positioning system for slide panels to avoid overlap

### Backend (Python FastAPI)
- **`backend/server.py`** — Socket.IO server (`~1084 lines`). Handles all frontend events: `start_audio`, `stop_audio`, `force_tool`, `user_input`, `shutdown`, settings management, reminders, face frame responses, Telegram bot integration. On startup, launches `AudioLoop` with a time-of-day greeting.
- **`backend/soda.py`** — Core audio loop (`~1182 lines`). `AudioLoop` class connects to Gemini Live API, manages bidirectional audio streaming, tool dispatch for all 88 tools, echo suppression, and socket event emissions for HUD animations.
- **`backend/tools.py`** — All 88 tool declarations in Gemini `function_declarations` format (`~1075 lines`)
- **`backend/external_apis.py`** — API integrations: weather (Open-Meteo), IP geolocation, exchange rates, news (NewsData), dictionary, Wikipedia, web search (Brave + DuckDuckGo fallback), webpage fetching (trafilatura), file browser (PowerShell)
- **`backend/system_app.py`** — System application launcher (terminal commands, URL opening)
- **`backend/system_control.py`** — System settings control
- **`backend/system_local.py`** — Local system operations (clipboard, screenshot via MSS, processes via PowerShell, active window)
- **`backend/screen_vision.py`** — Screen analysis via Gemini Vision API
- **`backend/screen_control.py`** — Mouse/keyboard control via PyAutoGUI
- **`backend/user_memory.py`** — User fact storage and recall
- **`backend/memory_store.py`** — Long-term memory (people, lessons, facts)
- **`backend/reminders.py`** — In-memory reminder scheduler
- **`backend/schedules.py`** — Calendar/schedule management with Windows Task Scheduler fallback
- **`backend/code_runner.py`** — Sandboxed Python/JS code execution
- **`backend/face_store.py`** — Face recognition storage (name/embedding)
- **`backend/github_tools.py`** — GitHub CLI integration (repos, PRs, issues)
- **`backend/vercel_tools.py`** — Vercel CLI integration (deploy, projects)
- **`backend/netlify_tools.py`** — Netlify CLI integration (sites, deploys)
- **`backend/task_planner.py`** — Multi-step task planning and tracking
- **`backend/website_agent.py`** — Headless browser website interaction agent
- **`backend/telegram_bot.py`** — Telegram bot for remote messaging/file sending
- **`backend/translation_agent.py`** — User native language translation support
- **`backend/project_manager.py`** — Multi-project workspace management
- **`backend/face_server_local.py`** — Local face landmark detection server (MediaPipe)

---

## Audio Pipeline

### Microphone Input → Gemini (listen_audio)
1. PyAudio reads 16kHz mono PCM chunks (`CHUNK_SIZE=512`) from selected mic device
2. VAD threshold (`800`) — only sends audio when RMS exceeds threshold
3. If model is speaking (`_model_is_speaking`), audio chunks are silently discarded (echo suppression)
4. Audio + optional camera frames are placed on `out_queue` → `send_realtime()` sends to Gemini

### Gemini Output → Speaker (receive_audio + play_audio)
1. `receive_audio()` receives 24kHz PCM chunks from Gemini
2. Sets `_model_is_speaking = True`, clears mic out queue (`_clear_out_queue()`) to stop sending user audio mid-response
3. Audio data put on `audio_in_queue`
4. `play_audio()` reads from queue → emits to frontend via `audio_data` socket event
5. **Frontend (`playPcmBytes`)** creates a Web Audio API `BufferSource` for each chunk, scheduled sequentially via `audioNextTime` for gap-free playback
6. When audio stops (timeout), `_model_is_speaking = False`

### Audio Config
- **Send**: 16000 Hz, 16-bit mono
- **Receive**: 24000 Hz, 16-bit mono
- **Chunk size**: 512 samples
- **VAD threshold**: 800 RMS
- **Playback**: Frontend Web Audio API ONLY (no backend PyAudio output)

---

## All 88 Tools

### File Operations (4)
1. `write_file` — Write content to file
2. `read_file` — Read file content
3. `list_files` — List directory with PowerShell, emits `file_list` event
4. `create_folder` — Create directory

### Terminal & Execution (3)
5. `execute_command` — Run system command (open apps)
6. `terminal_execute` — Run terminal command, emits `command_output` event
7. `run_code` — Sandboxed Python/JavaScript execution

### Web & Search (5)
8. `web_search_live` — Brave/DuckDuckGo search, emits `search_results`
9. `browse_webpage` — Fetch webpage via trafilatura, emits `webpage_content`
10. `show_search_results` — Re-display last search, emits `search_results`
11. `search_web` — Open default browser search
12. `search_youtube` — Open YouTube search

### External APIs (6)
13. `get_weather` — Open-Meteo weather (geocode + forecast)
14. `get_ip_info` — IP geolocation via ip-api.com
15. `get_exchange_rate` — Currency conversion via exchangerate.host
16. `get_news` — NewsData.io headlines
17. `define_word` — DictionaryAPI.dev definitions
18. `get_wikipedia_summary` — Wikipedia API summaries

### System Info & Control (5)
19. `get_system_status` — CPU/RAM/disk/battery via psutil, emits `tool_result`
20. `close_window` — Kill process by name via taskkill
21. `control_system` — Computer settings (volume, brightness, etc.)
22. `list_processes` — Running processes via PowerShell
23. `get_active_window` — Focused window title

### Clipboard & Screenshot (3)
24. `clipboard_read` — Read clipboard text
25. `clipboard_write` — Write text to clipboard
26. `screenshot` — Full-screen capture via MSS

### Screen Control — Mouse (4)
27. `mouse_click` — Click at coordinates (button + clicks)
28. `mouse_move` — Smooth cursor movement
29. `mouse_scroll` — Scroll wheel
30. `mouse_drag` — Click-drag between coordinates

### Screen Control — Keyboard (2)
31. `keyboard_type` — Type text at cursor
32. `keyboard_press` — Press key combo (ctrl+c, alt+tab, etc.)

### Window Management (8)
33. `window_focus` — Bring window to front
34. `window_list` — List all visible windows
35. `window_move` — Move/resize window
36. `go_to_sleep` — Minimize window + stop monitoring
37. `wake_up` — Restore from sleep
38. `go_background` — Minimize but stay listening
39. `come_back` — Restore from background
40. `shutdown_soda` — Full termination, emits `shutdown`

### Screen Analysis (2)
41. `analyze_screen` — Gemini vision screen analysis
42. `read_screen_text` — OCR via Gemini vision

### User Memory (10)
43. `remember_fact` — Store key-value fact
44. `recall_facts` — Search stored facts
45. `get_user_profile` — Get profile + recent facts
46. `set_preference` — Set user preference
47. `forget_fact` — Delete fact by key
48. `list_memory` — List all stored items
49. `remember_person` — Store person info (name, relationship, traits, etc.)
50. `recall_person` — Search people
51. `remember_lesson` — Store learned lesson from mistakes
52. `remember_face` — Associate face with name

### Face Recognition (1)
53. `recognize_face` — Match face against stored embeddings

### Reminders & Scheduling (7)
54. `set_reminder` — One-shot or recurring reminder
55. `list_reminders` — All active reminders
56. `cancel_reminder` — Cancel by ID
57. `set_schedule` — Calendar event + Windows Task Scheduler fallback, emits `open_schedule`
58. `list_schedules` — All saved schedules
59. `delete_schedule` — Delete schedule by ID
60. `show_calendar` — Open schedule visualization, emits `open_schedule`

### Notepad (3)
61. `notepad_open` — Open floating notepad, emits `open_notepad`
62. `notepad_write` — Write to notepad tab
63. `notepad_read` — Read notepad tab content

### File Viewer (1)
64. `view_file` — View file in floating window, emits `view_file_content`

### Webview (1)
65. `webview_action` — Control webview (click, type, scroll, navigate, JS), emits `webview_action`

### Website Builder (1)
66. `website` — Full website generation pipeline, emits `website_update`

### Browser (2)
67. `open_browser` — Open URL in floating webview, emits `open_url`
68. `open_app` — Launch app, emits `open_url` with `app://` protocol

### GitHub (6)
69. `github_list_repos` — List repos
70. `github_create_repo` — Create repo
71. `github_get_repo` — Get repo details
72. `github_create_pr` — Create pull request
73. `github_list_issues` — List issues
74. `github_create_issue` — Create issue

### Vercel (4)
75. `vercel_list_projects` — List Vercel projects
76. `vercel_deploy` — Deploy to Vercel
77. `vercel_list_deployments` — List deployments
78. `vercel_get_deployment` — Get deployment details

### Netlify (5)
79. `netlify_list_sites` — List Netlify sites
80. `netlify_get_site` — Get site details
81. `netlify_deploy` — Deploy to Netlify
82. `netlify_create_site` — Create empty site
83. `netlify_list_deploys` — List deploys

### Telegram (4)
84. `send_telegram_message` — Text message via Telegram bot
85. `send_telegram_file` — Send file (auto-zips folders, max 50MB)
86. `search_and_send_telegram` — Search web + send results as markdown file
87. `send_whatsapp` — WhatsApp message
88. `send_discord` — Discord message

### Meta Tools (5)
- `show_tools` — Animated tool showcase, emits `tool_showcase`
- `show_agents` — List sub-agents
- `close_panel` — Close HUD panels, emits `close_panel`
- `plan_tasks` — Create multi-step task plan
- `update_task` / `cancel_plan` / `get_plan` — Task plan management

---

## Socket.IO Event Map

### Backend → Frontend (26 events)

| Event | Payload | Purpose |
|-------|---------|---------|
| `status` | `{msg, greeting?}` | Connection/status updates |
| `auth_status` | `{authenticated: true}` | Auto-auth |
| `audio_data` | `{data: [bytes]}` | Playback audio PCM |
| `mic_level` | `{level: 0-1}` | Orb voice visualization |
| `transcription` | `{text, sender}` | Speech-to-text display |
| `tool_confirmation_request` | `{id, tool, args}` | Start orb SVG animation |
| `tool_result` | `{tool, result}` | Complete tool animation + route panel |
| `tool_showcase` | `{tools: [names]}` | Animated tool grid |
| `search_results` | `{query, results}` | Search results panel (right) |
| `webpage_content` | `{url, content, images}` | Webpage summary panel (bottom) |
| `command_output` | `{command, output, success}` | Terminal panel (left) |
| `file_list` | `{path, items, searchQuery}` | File browser panel (bottom) |
| `view_file_content` | `{payload}` | File viewer floating window |
| `close_panel` | `{panel}` | Close specific panel or stack |
| `open_url` | `{url}` | Webview floating window |
| `open_schedule` | `{schedule, all_schedules}` | Schedule/calendar window |
| `open_notepad` | `{tabs}` | Notepad floating window |
| `website_update` | `{action, url, result, generating?, html?, title?}` | Website builder windows |
| `webview_action` | `{id, action, params}` | Execute action in webview |
| `window_minimize` | `{}` | Minimize Electron window |
| `window_restore` | `{}` | Restore Electron window |
| `window_control` | `{action}` | General window control |
| `shutdown` | `{}` | Close entire app |
| `error` | `{msg}` | Error notification |
| `project_update` | `{project}` | Project context update |
| `settings` | `{tool_permissions, camera_flipped, user_native_lang}` | Settings sync |

### Frontend → Backend (18 events)

| Event | Payload | Purpose |
|-------|---------|---------|
| `start_audio` | `{device_index?, device_name?, muted?}` | Start audio pipeline |
| `stop_audio` | — | Stop audio pipeline |
| `pause_audio` / `resume_audio` | — | Mute/unmute mic |
| `user_input` | `{text}` | Text chat input |
| `announce` | `{text}` | TTS-only announcement |
| `video_frame` | `{image}` | Camera frame from frontend |
| `confirm_tool` | `{id, confirmed}` | Tool confirmation response |
| `force_tool` | `{tool, args}` | Admin tool execution |
| `shutdown` | — | Graceful shutdown |
| `get_settings` / `update_settings` | — | Settings CRUD |
| `close_panel` | `{panel}` | Close panel by name |
| `notepad_save` | `{filename, content}` | Save notepad to file |
| `notepad_read_result` | `{id, ...}` | Notepad read response |
| `control_window` | `{action}` | Window min/max/close |
| `create_folder` | `{path}` | Create folder from UI |
| `webview_action_result` | `{id, action, result}` | Webview action callback |
| `face_frame_response` | `{id, image}` | Face capture response |
| `save_memory` / `upload_memory` | `{messages}` / `{memory}` | Long-term memory |

---

## Frontend Panels & Positions

| Panel | Direction | Content Type | Auto-dismiss |
|-------|-----------|-------------|--------------|
| **Terminal** | Left | `command_output` events | 5 seconds |
| **Search Results** | Right | `search_results` events | Never |
| **File/Clipboard/Code Output** | Bottom | `tool_result` for write/read/clipboard/code/screenshot | 5 seconds |
| **Info (weather, news, API)** | Top | `tool_result` for weather/news/dictionary/wiki/IP | 5 seconds |
| **Tool Output** | Bottom | Generic tool results | 5 seconds |
| **Webpage Summary** | Bottom | `webpage_content` events | 5 seconds |
| **File Browser** | Bottom | `file_list` events | Never (user picks file) |
| **Tool Showcase** | Right | `tool_showcase` events | After animation |
| **Weather Panel** | Specialized | `tool_result` weather | Via close_panel |
| **News Panel** | Specialized | `tool_result` news | Via close_panel |
| **Currency Panel** | Specialized | `tool_result` exchange | Via close_panel |
| **Process Panel** | Specialized | `tool_result` processes | Via close_panel |
| **Network Panel** | Specialized | `tool_result` IP info | Via close_panel |
| **GitHub Panel** | Specialized | `tool_result` GitHub data | Via close_panel |
| **Deploy Panel** | Specialized | `tool_result` Vercel/Netlify | Via close_panel |
| **Floating Windows** | Free | Webview, Notepad, Schedule, File Viewer, Website Preview, Websmith Console | Via close_panel |

### Panel Auto-Offset System (PanelSpaceContext)
- Top panels: shift right (`+160px`) to avoid center orb
- Bottom panels: shift right (`+200px`)
- Floating windows: `findFreeFloatPosition` to avoid left/right panel zones

---

## Issues Fixed

### Audio Echo / Double-Playback (CRITICAL)
- **Problem**: User heard a chorus/flange effect — voice seemed to have "multiple copies" with delay
- **Root Cause**: Both backend (PyAudio `stream.write()`) and frontend (Web Audio API `playPcmBytes()`) were playing the same audio simultaneously. The slight timing offset between the two outputs created a comb-filter/chorus effect
- **Fix**: Removed backend PyAudio playback entirely. Audio is only played via the frontend's Web Audio API path (`audio_data` socket event → `playPcmBytes()`)

### Model Voice — Alien/Glitchy Output
- **Problem**: S.O.D.A. sounded metallic, glitchy, or "alien"
- **Root Cause**: Using `models/gemini-2.5-flash-native-audio-preview-12-2025` (preview model) with `Charon` voice. The preview model didn't properly support male/female voice selection
- **Fix**: Switched to `models/gemini-2.5-flash-native-audio-latest` (GA model) which correctly supports all voice options including `Charon`

### Tool Confirmation Hang
- **Problem**: When the model called a tool that wasn't pre-approved, `receive_audio()` awaited a `Future` that never resolved (frontend confirmation dialog didn't respond), hanging the entire audio loop
- **Fix**: All tools auto-approved by default (`SETTINGS["tool_permissions"] = {}`). The `_dispatch_tool` is called immediately without awaiting confirmation. `tool_confirmation_request` is emitted for animation only — not blocking

### show_tools Crash
- **Problem**: `show_tools` handler crashed because it treated `tools_list` as a flat list, but its actual structure is `[{"function_declarations": [...]}]`
- **Fix**: Added proper unwrapping: `tools_list[0]["function_declarations"] if isinstance(tools_list[0], dict) and "function_declarations" in tools_list[0] else tools_list`

### Missing Frontend Socket Events
- **Problem**: Many tools didn't emit the specific events the frontend expected, so panels never appeared. E.g., `web_search_live` emitted nothing for `search_results`, `terminal_execute` emitted nothing for `command_output`
- **Fix**: Every tool handler now emits the correct frontend event (see Socket.IO Event Map above)

### Wrong Event Names
- **Problem**: Some tools emitted the wrong event name. E.g., `view_file` emitted `open_viewer` (not a registered listener), `shutdown_soda` emitted `window_control` instead of `shutdown`
- **Fix**: Corrected to `view_file_content` and `shutdown` respectively

### Missing Animation Events
- **Problem**: The frontend animation system requires both `tool_confirmation_request` (start animation) and `tool_result` (complete animation) for every tool call. Without `tool_confirmation_request`, the SVG overlay on the orb never appeared
- **Fix**: Every tool dispatch in `receive_audio()` now emits `tool_confirmation_request` first, then `_dispatch_tool`, then `tool_result`

---

## Known Remaining Issues

### Audio Glitches
1. **Occasional popping/crackling**: May be from non-aligned chunk boundaries in Web Audio API scheduling. The `audioNextTime` scheduling can drift if chunks arrive late
2. **Silence detection too aggressive**: VAD threshold of 800 may clip quieter speech. User may need to speak loudly
3. **No input device enumeration feedback**: Frontend doesn't show which mic is selected; user must know device index

### Tool Dispatch Limitations
4. **No tool argument validation**: If Gemini sends invalid args (wrong types, missing required fields), the Python handler crashes with an unhandled exception
5. **force_tool duplicates logic**: Both `server.py` (`force_tool` handler) and `soda.py` (`_dispatch_tool`) have separate implementations of the same tool logic for some tools. Changes must be made in both places
6. **No tool timeout**: If a tool hangs (e.g., network request), the entire audio loop is blocked

### Frontend Limitations
7. **Panel stacking**: Multiple panels of the same type can't stack — new data replaces old. E.g., two rapid `search_results` events: only the second is visible
8. **No scroll persistence**: File browser resets scroll position when re-opened
9. **Auto-dismiss timer**: 5-second dismiss is hardcoded in multiple places, not configurable
10. **No audio waveform visualization**: Only `mic_level` (single float) is visualized; no frequency spectrum

### Backend Stability
11. **No graceful Gemini reconnection**: If the Gemini WebSocket drops, `AudioLoop.run()` retries with exponential backoff, but the `send_realtime()`/`receive_audio()` tasks may not restart cleanly
12. **Face recognition is coupled to frontend**: `recognize_face`/`remember_face` in `force_tool` request a frame from the frontend via `request_face_frame` event, then wait with a 5s timeout. If frontend doesn't respond, the tool hangs
13. **No audio device hot-swap**: The mic device is selected at startup and cannot be changed without restarting the audio loop

### Security
14. **No authentication**: Any client on the network can connect to port 8000 and control the system
15. **force_tool restricted to localhost only**: By design, but the check is in Python — bypassable by spoofing the socket transport

### Project Management
16. **No git commits**: The project has never been committed (fresh git repo)
17. **Original backup at `E:\SODA X\backend\soda.py`**: The 100KB reference implementation with all original agents (CAD, Kasa, Ollama, etc.) — not migrated to current codebase

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron 28 (Chromium 120) |
| Frontend Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | TailwindCSS 3 + custom CSS vars |
| Icons | Lucide React |
| Real-time Transport | Socket.IO (WebSocket) |
| Backend Framework | FastAPI + Uvicorn |
| AI Model | Gemini 2.5 Flash Native Audio (GA) via `v1beta` API |
| Audio Capture | PyAudio (16kHz mono) |
| Audio Playback | Web Audio API (frontend only) |
| Screen Capture | MSS (Python) |
| Computer Vision | OpenCV + MediaPipe |
| OCR/Screen Analysis | Gemini Vision API |
| Web Scraping | httpx + trafilatura |
| Web Search | Brave Search API / DuckDuckGo |
| Deployment | GitHub CLI, Vercel CLI, Netlify CLI |
| Messaging | python-telegram-bot |
| Data Storage | JSON files (settings, memory, schedules) |

---

## Project Structure

```
D:\soda/
├── backend/
│   ├── server.py            # Socket.IO server (FastAPI)
│   ├── soda.py              # Core audio loop + tool dispatch
│   ├── tools.py             # 88 tool definitions
│   ├── external_apis.py     # API integrations
│   ├── system_app.py        # App launcher / terminal
│   ├── system_control.py    # System settings
│   ├── system_local.py      # Clipboard, screenshot, processes
│   ├── screen_vision.py     # Gemini vision analysis
│   ├── screen_control.py    # Mouse/keyboard control
│   ├── user_memory.py       # User fact storage
│   ├── memory_store.py      # Long-term memory
│   ├── reminders.py         # Reminder scheduler
│   ├── schedules.py         # Calendar/schedule management
│   ├── code_runner.py       # Code execution sandbox
│   ├── face_store.py        # Face embedding storage
│   ├── face_server_local.py # MediaPipe face server
│   ├── github_tools.py      # GitHub CLI
│   ├── vercel_tools.py      # Vercel CLI
│   ├── netlify_tools.py     # Netlify CLI
│   ├── task_planner.py      # Task planning
│   ├── website_agent.py     # Website interaction agent
│   ├── telegram_bot.py      # Telegram bot
│   ├── translation_agent.py # Translation agent
│   ├── project_manager.py   # Project workspace manager
│   └── services/
│       └── WebviewActionService.js
├── src/
│   ├── App.jsx              # Main app + all socket handlers
│   ├── main.jsx             # React entry
│   ├── services/
│   │   ├── SocketService.js # Socket.IO client
│   │   ├── SoundService.js  # UI sound effects
│   │   └── WebviewActionService.js
│   ├── contexts/
│   │   └── PanelSpaceContext.jsx
│   ├── components/
│   │   ├── HolographicOrb.jsx    # Central orb visualization
│   │   ├── SlidePanel.jsx        # Animated slide panel
│   │   ├── FloatingWindow.jsx    # Draggable floating window
│   │   ├── WebviewWindow.jsx     # Embedded webview
│   │   ├── Notepad.jsx           # Multi-tab notepad
│   │   ├── ScheduleWindow.jsx    # Calendar + analog clock
│   │   ├── WebsitePreview.jsx    # Website preview iframe
│   │   ├── WebsmithConsole.jsx   # Agent thought console
│   │   ├── WebsmithDesignSpec.jsx
│   │   ├── CameraCapture.jsx     # Camera feed
│   │   ├── SystemStatsWidget.jsx
│   │   ├── TaskAnimator.jsx      # Task animation
│   │   ├── ThemeSwitcher.jsx
│   │   ├── animations/           # SVG tool animations
│   │   └── panels/               # Specialized result panels
│   └── styles/
│       └── main.css              # All CSS + design tokens
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Context bridge
├── settings.json            # User preferences
├── package.json             # Node dependencies
├── requirements.txt         # Python dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # TailwindCSS configuration
└── postcss.config.mjs       # PostCSS configuration
```
