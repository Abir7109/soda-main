# Revert to Server-Side VAD

## Problem
Client-controlled VAD (`activity_start`/`activity_end` signals) is broken. `send_realtime_input(activity_start=...)` calls silently crash the session, killing the audio pipeline (both input AND output).

## Changes

### 1. `run()` config — Restore server-side VAD
**File:** `backend/soda.py` lines 622-627
**Current:**
```python
realtime_input_config=types.RealtimeInputConfig(
    automatic_activity_detection=types.AutomaticActivityDetection(
        disabled=True,
    ),
    turn_coverage=types.TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
),
```
**Replace with:**
```python
realtime_input_config=types.RealtimeInputConfig(
    automatic_activity_detection=types.AutomaticActivityDetection(
        start_of_speech_sensitivity=0.5,
        end_of_speech_sensitivity=0.5,
        prefix_padding_ms=500,
        silence_duration_ms=1000,
    ),
),
```

### 2. `__init__` — Remove `control_queue` and `_activity_end`
**File:** `backend/soda.py` lines 245-247
**Current:**
```python
self._audio_buffer = []
self.control_queue = asyncio.Queue()
self._activity_end = asyncio.Event()
self.session = None
```
**Replace with:**
```python
self._audio_buffer = []
self.session = None
```

### 3. `_clear_queues` — Remove `control_queue` drain and `_activity_end.clear()`
**File:** `backend/soda.py` lines 266-275
**Current:**
```python
def _clear_queues(self):
    try:
        while self.video_queue and not self.video_queue.empty():
            self.video_queue.get_nowait()
        while self.control_queue and not self.control_queue.empty():
            self.control_queue.get_nowait()
        self._activity_end.clear()
        self._audio_buffer.clear()
    except Exception:
        pass
```
**Replace with:**
```python
def _clear_queues(self):
    try:
        while self.video_queue and not self.video_queue.empty():
            self.video_queue.get_nowait()
        self._audio_buffer.clear()
    except Exception:
        pass
```

### 4. `send_audio` — Simplify to plain audio sending
**File:** `backend/soda.py` lines 366-389
**Current:**
```python
async def _maybe_send_activity_start(self):
    while not self.control_queue.empty():
        signal = self.control_queue.get_nowait()
        if signal == "activity_start":
            await self.session.send_realtime_input(activity_start=types.ActivityStart())

async def send_audio(self):
    while True:
        try:
            await self._maybe_send_activity_start()

            try:
                msg = await asyncio.wait_for(self.audio_queue.get(), timeout=0.1)
                await self._maybe_send_activity_start()
                await self.session.send_realtime_input(audio=types.Blob(data=msg["data"], mime_type=msg["mime_type"]))
            except asyncio.TimeoutError:
                pass

            if self._activity_end.is_set() and self.audio_queue.empty():
                await self.session.send_realtime_input(activity_end=types.ActivityEnd())
                self._activity_end.clear()
        except Exception as e:
            log.error(f"send_audio error: {e}")
            await asyncio.sleep(0.1)
```
**Replace with:**
```python
async def send_audio(self):
    while True:
        try:
            try:
                msg = await asyncio.wait_for(self.audio_queue.get(), timeout=0.1)
                await self.session.send_realtime_input(audio=types.Blob(data=msg["data"], mime_type=msg["mime_type"]))
            except asyncio.TimeoutError:
                pass
        except Exception as e:
            log.error(f"send_audio error: {e}")
            await asyncio.sleep(0.1)
```

### 5. `listen_audio` — Remove all activity_start/activity_end signaling
**File:** `backend/soda.py` lines 470-496
**Current:**
```python
if _was_model_speaking:
    _was_model_speaking = False
    if self._audio_buffer:
        if not is_speaking:
            is_speaking = True
            self.control_queue.put_nowait("activity_start")
        for chunk in self._audio_buffer:
            await self.audio_queue.put(chunk)
        log.info(f"Flushed {len(self._audio_buffer)} buffered audio chunks from model-speech period")
        self._audio_buffer.clear()

if rms > VAD_THRESHOLD:
    self._mark_activity()
    silence_start = None
    if not is_speaking:
        is_speaking = True
        self.control_queue.put_nowait("activity_start")
        if self._latest_image_payload and self.video_queue:
            await self.video_queue.put(self._latest_image_payload)
else:
    if is_speaking:
        if silence_start is None:
            silence_start = time.time()
        elif time.time() - silence_start > SILENCE_DURATION:
            is_speaking = False
            silence_start = None
            self._activity_end.set()
```
**Replace with:**
```python
if _was_model_speaking:
    _was_model_speaking = False
    if self._audio_buffer:
        for chunk in self._audio_buffer:
            await self.audio_queue.put(chunk)
        log.info(f"Flushed {len(self._audio_buffer)} buffered audio chunks from model-speech period")
        self._audio_buffer.clear()

if rms > VAD_THRESHOLD:
    self._mark_activity()
    silence_start = None
    if not is_speaking:
        is_speaking = True
        if self._latest_image_payload and self.video_queue:
            await self.video_queue.put(self._latest_image_payload)
else:
    if is_speaking:
        if silence_start is None:
            silence_start = time.time()
        elif time.time() - silence_start > SILENCE_DURATION:
            is_speaking = False
            silence_start = None
```

## Preservation
- Keep `send_audio` try/except (was a good robustness fix)
- Keep `audio_in_queue` purge removal (no regressions)
- Keep `_clear_queues` — audio_queue NOT cleared (preserves pending user audio)
