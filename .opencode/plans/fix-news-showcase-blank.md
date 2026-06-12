# Fix: News Showcase Blank — Applied

## Root Cause
`ctrlArticleIdx` initialized to `-1` → article panel renders `null` until `setCtrlArticleIdx(0)` fires at phase 4 (20s). But phase 4's state update likely never executes because the component remounts mid-animation (resetting `startTime.current` and restarting the tick loop).

## Changes Applied

### `src/components/workflows/WorkflowNewsBriefing.jsx`

**1. `useState(-1)` → `useState(0)`** (line 38)
Article panel pre-renders invisible on mount (`.wfn-showcase { opacity: 0 }`). Phase 4 adds `active` class → `opacity: 1` → content already there. No tick-loop dependency.

**2. Mount/unmount logger** (line 83-86)
```jsx
useEffect(() => {
  console.log('[NewsBriefing] MOUNT', Date.now())
  return () => console.log('[NewsBriefing] UNMOUNT', Date.now())
}, [])
```
Detects if component remounts during the 20s animation window.

## Running
```bash
# Terminal 1 — Frontend (Vite dev server)
npm run dev

# Terminal 2 — Backend (FastAPI + Socket.IO on :8000)
cd backend && py -3.11 server.py
```

## Test
Ask for news. Watch console for:
- `[NewsBriefing] MOUNT` — component mounts
- `[NewsBriefing] UNMOUNT` — component unmounts (if this appears before 20s, the tick restarts)
- At 20s: showcase should fade in with article title, description, and "OPEN IN BROWSER" button
