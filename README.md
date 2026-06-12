# S.O.D.A v2

Voice-first AI desktop assistant with real-time vision, project memory, and tool calling.

## Quick Start

```bash
# 1. Install Python packages (Python 3.11 required for voice)
pip install -r requirements.txt

# 2. Install Node packages
npm install

# 3. Add your Gemini API key (get at https://aistudio.google.com/app/apikey)
echo GEMINI_API_KEY=your_key_here > .env

# 4. (Optional) Add a Brave Search API key for live web search
#    Get a free key at https://api.search.brave.com/app/dashboard
#    Falls back to DuckDuckGo HTML scraping if unset.
echo BRAVE_SEARCH_API_KEY=your_brave_key_here >> .env

# 4. Run
npm run dev
```

Opens the Electron HUD (Vite dev server at http://localhost:5173).

---

## Voice Setup

Voice requires Python 3.11 (3.11.x). PyAudio has Windows wheels only for 3.11.

If you are on Python 3.12 / 3.14 or voice is not working:

1. Install Python 3.11 from https://www.python.org/downloads/release/python-31115/
   (check "Add python.exe to PATH" during install)
2. Create a venv:
   ```powershell
   py -3.11 -m venv venv
   venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. Run `npm run dev`

Or run `setup_voice.bat` for a guided setup.

---

## Architecture

- **Backend** (`backend/`) — FastAPI + Socket.IO on `:8000`. Live audio, Gemini Live
  session, project memory, and tool dispatch.
- **Frontend** (`src/`) — React HUD built with Vite. Renders inside Electron.

Backend can be started standalone:

```bash
py -3.11 server.py
```

---

## Commands

```bash
npm run dev      # Vite dev server + Electron window
npm run build    # Build frontend to dist/
npm run electron # Run Electron against dist/
```

---

## Known Limitations

- **`web_search_live` without `BRAVE_SEARCH_API_KEY`**: Falls back to DuckDuckGo HTML
  scraping, which is rate-limited (~1 query / 3 seconds) and may break if DDG changes
  their HTML. Get a free Brave key (2,000 queries/month) at
  https://api.search.brave.com/app/dashboard for reliable results.
- **Model is overly cautious about mutating tools** (write_file, send_whatsapp,
  terminal_execute). It may say it will run the tool without actually emitting a function
  call. Two workarounds: (1) tell the model to "just do it" and watch the confirmation
  modal, (2) use `force_tool` socket event from the HUD's dev tools to bypass the model.
  See `src/services/SocketService.js` for the emit shape.
- **Voice requires Python 3.11** — PyAudio has no official wheels for 3.12/3.14.

## Power-User Socket API

Emit `force_tool` from any client to bypass the model and run a tool directly:

```js
socket.emit('force_tool', {
  tool: 'terminal_execute',
  args: { command: 'dir', timeout: 5 }
})
// Listen for:
socket.on('command_output', (data) => { /* {command, output, success, forced} */ })
socket.on('tool_result',    (data) => { /* {tool, result, forced}           */ })
```

Supported: `terminal_execute`, `web_search_live`, `get_weather`, `get_news`,
`get_wikipedia_summary`, `get_system_status`, `control_system`, `open_browser`, `open_app`.

---

**Built by Rahikul Makhtum Abir**
