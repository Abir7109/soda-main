# SODA Tactical HUD - Holographic Orb Setup & Integration Guide

Welcome to the **SODA Tactical HUD** integration guide. The central centerpiece of this module is the highly reactive, bilingual **Holographic Orb**. It is designed as a lightweight, performant, standalone visualizer component rendering on HTML5 Canvas 2D to represent agent activity states, capture ambient frequency signals, and visualize voice interactions.

---

## 🎨 Visual Philosophy & Aesthetic
SODA's visual signature is framed around a dense, high-frequency kinetic energy vortex matching our tactical military cockpit spec:
* **Energetic Helix Swirl**: Rotating double-helix flame-tips and composite gases flowing inward, emulating a sucking portal.
* **Blinding Hot Centerpiece**: Pure white core fusion flare pulsating organically based on breathing variables and sound frequencies.
* **Holographic Grid Overlays**: Extremely transparent orbital boundary marks and rotating calibration rings providing precision targeting aesthetics.
* **Plasma Solar Halo**: A gorgeous boundary perimeter characterized by high-frequency ripples reacting and exploding with sparkles as voice/sound amplitude shifts.

---

## 🚀 Component API Specification

The `HolographicOrb` is designed as a fully controlled React functional component inside `/src/components/HolographicOrb.tsx`.

```typescript
import HolographicOrb from './components/HolographicOrb';

<HolographicOrb 
  size={420}            // Width/Height boundary in pixels
  micLevel={micLevel}   // 0.0 to 1.0 normalized microphone sound amplitude
  isSpeaking={false}    // True when Gemini agent is speaking (shifts to violet purple)
  isListening={true}    // True when capture conduit is hot (glow pulsates)
  lang="en"             // "en" or "bn" (Automatic status bar localization)
/>
```

### Prop Definitions:
1. **`size`** *(number, default: 400)*: Controls the canvas aspect ratio footprint. Highly optimized for high-density physical displays using `devicePixelRatio`.
2. **`micLevel`** *(number, default: 0)*: Expects a normalized float amplitude strictly between `0.0` and `1.0`. Directly drives the physical wave deformation, solar plasma flares, particle speed, and breathing frequency.
3. **`isSpeaking`** *(boolean, default: false)*: Set to `true` when the Gemini model is talking back. The system immediately color shifts from ice-cyan to reactive ultraviolet/violet purple, slows base rotation, and switches to deep breathing rhythms.
4. **`isListening`** *(boolean, default: false)*: Set to `true` when the microphone capture is hot but there's no sound, triggering sub-harmonic shimmer animation ticks (showing the mic is live).
5. **`lang`** *("en" | "bn", default: "en")*: Automatic translation of tactical feedback subtitles:
   * **Listening State**: English: `"Listening"` | Bengali: `"শুনছি"`
   * **Speaking State**: English: `"Speaking"` | Bengali: `"বলছি"`
   * **Idle State**: English: `"Idle"` | Bengali: `"অপেক্ষা"`

---

## 🎙️ Real-time Web Audio Capture Integration
The orb accepts real-time physical microphone signals inside `App.tsx` by instantiating an `AudioContext` loop to capture surrounding noise/speech sounds.

### Integration Pipeline Flow:
1. **Initialize Audio Feed**:
   ```typescript
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
   const audioContext = new AudioContext();
   const analyser = audioContext.createAnalyser();
   analyser.fftSize = 256;
   const source = audioContext.createMediaStreamSource(stream);
   source.connect(analyser);
   ```
2. **Retrieve Amplitude**:
   ```typescript
   const dataArray = new Uint8Array(analyser.frequencyBinCount);
   analyser.getByteFrequencyData(dataArray);
   let sum = 0;
   for (let i = 0; i < dataArray.length; i++) {
     sum += dataArray[i];
   }
   const average = sum / dataArray.length;
   const normalizedValue = Math.min(1.0, (average / 110) * 1.5);
   ```
3. **Feed Upstream**:
   Directly bind the computed `normalizedValue` to the `micLevel` prop. The internal canvas loops automatically interpolate and smooth the transition, creating the kinetic "bounce" effect.

---

## 🛠️ Optimization & Engineering Directives
To fit SODA's real-time standards, the component strictly respects several engineering rules:
* **Strict Anti-Lag**: No React `useState` triggers are set inside the animation render steps. All kinetic states, phases, scanline movements, and particles are calculated directly in `useRef` states inside the `requestAnimationFrame` thread.
* **No Memory Leaks**: On unmount, all recursive animation handles are terminated with `cancelAnimationFrame` to maintain lightweight frame execution.
* **Canvas 2D Only**: Bypasses any WebGL or Three.js dependencies, running on ultra-lightweight standard HTML5 canvas rendering contexts.
