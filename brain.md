# SODA Brain

## Hosting Info

### Backend
- **GitHub Repo**: https://github.com/Abir7109/SODA_BACKEND.git
- **Render URL**: https://soda-backend-sar2.onrender.com
- **Docker**: `Dockerfile` → `start.sh` → `uvicorn backend.server:app_socketio --host 0.0.0.0 --port ${PORT:-8000}`

### Frontend
- **Netlify Project Name**: Soda-hud
- **Netlify Site**: auto-generated URL from Netlify dashboard
- **Deploy via**: Netlify CLI (`netlify deploy --prod --dir=dist`)

## Git Remotes
- `origin` → `https://github.com/Abir7109/soda-main.git` (full project)
- `soda-backend` → `https://github.com/Abir7109/SODA_BACKEND.git` (backend-only for Render)

## Deploy Instructions

### Frontend (Netlify)
```powershell
npm run build
netlify deploy --prod --dir=dist
```

### Backend (Render)
```powershell
git add .
git commit -m "description"
git push soda-backend main
```
Render auto-deploys from SODA_BACKEND main branch. Settings:
- Build command: none (Dockerfile)
- Start command: `./start.sh`
- Port: 8000
- Health check path: `/`

## Environment Variables (Render)
Set in Render dashboard:
- `GEMINI_API_KEY` — required
- `BRAVE_SEARCH_API_KEY` — optional (DuckDuckGo fallback)

## Files Changed in This Session
| File | Change |
|------|--------|
| `backend/soda.py:389` | System prompt: force verbal response after tools, handle multi-commands |
| `backend/soda.py:1033-1064` | `play_audio()`: reset `silent_ticks` when tools finish (`_tools_running` True→False transition) |
| `backend/soda.py:1332-1336` | `receive_audio()`: keep `_model_is_speaking=True` after `send_tool_response()` |
| `AGENTS.md:124-131` | Updated audio pipeline docs with `_tools_running` guard + `silent_ticks` reset behavior |
