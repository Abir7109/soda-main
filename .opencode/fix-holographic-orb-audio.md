# Fix: HolographicOrb socket listeners broke audio playback

## Root Cause
The HolographicOrb component rewrite in `src/components/HolographicOrb.jsx` added
`import socket from '../services/SocketService'` and registered socket listeners:

```javascript
socket.on('mic_level', onMic)
socket.on('audio_data', onAud)
```

This caused a runtime JavaScript error that propagated through React's
`AnimationErrorBoundary`, collapsing the entire React tree into a fallback UI
(showing just "SODA" text). Since `playPcmBytes` in App.jsx lives inside the same
React tree, audio playback died entirely.

## Symptoms
- SODA backend works perfectly (verified via `test_flow.py`):
  - `mic_level` events flow (mic is capturing)
  - `audio_data` events flow (Gemini responds with speech)
  - `transcription` events flow (Gemini transcribes user input)
- Frontend shows minimal UI (just "SODA" text) or orb appears but no audio plays
- The user hears nothing from SODA even though the server is responding

## Fix
Reverted `HolographicOrb.jsx` to a self-contained canvas component with no
external dependencies beyond React:
- Removed `import socket from '../services/SocketService'`
- Removed all `socket.on('mic_level', ...)` / `socket.off(...)` calls
- Removed all reactive state variables (`spk`, `spkG`, `lstP`, `micSm`, `beat`)
- Removed speaking/listening animation branches (ring bursts, radial spokes, flash)
- Core sphere wireframe + particles + glow + scan lines remain, driven purely by
  internal ph-based sine waves (no external input)

## Files Changed
- `src/components/HolographicOrb.jsx` — 334 lines → 253 lines, self-contained

## Verification
Run `py -3.11 temp/test_flow.py` while `server.py` is running.
Expected output includes:
```
RECV [mic_level] {'level': 0.xx}       ← mic is capturing
RECV [audio_data] <audio: N bytes>     ← Gemini is responding
RECV [transcription] {'sender': ...}   ← Gemini transcribes
```

## Future Enhancement
If mic_level visualization is desired in the orb, add it with a SINGLE listener
at a time and test audio playback between each addition to isolate breakage.
The safe pattern is to keep socket listeners in App.jsx (where audio playback
lives) and pass data down as props rather than importing socket directly in
child components.
