# Serveo Tunnel + Mobile Sub-Screen Wiring

## Part 1: Add Serveo Tunnel to backend

### `backend/tunnel.py` — Add BEFORE `find_cloudflared()`

```python
SERVEO_SUBDOMAIN = "soda-remote"

async def find_ssh():
    """Search PATH for SSH binary."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "where", "ssh",
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        paths = stdout.decode().strip().split("\n")
        if paths and paths[0].strip():
            return paths[0].strip()
    except Exception:
        pass
    for candidate in ["ssh.exe", "C:\\Windows\\System32\\OpenSSH\\ssh.exe"]:
        if os.path.isfile(candidate):
            return candidate
    return None

async def start_serveo_tunnel(port=8000, subdomain=SERVEO_SUBDOMAIN):
    """Start SSH tunnel via serveo.net for persistent public URL."""
    ssh_path = await find_ssh()
    if not ssh_path:
        log.warning("SSH not found. Serveo tunnel unavailable.")
        return None, None

    log.info(f"Starting Serveo tunnel using: {ssh_path}")

    known_hosts_dir = os.path.dirname(os.path.expanduser("~/.ssh/known_hosts"))
    if not os.path.isdir(known_hosts_dir):
        try: os.makedirs(known_hosts_dir, exist_ok=True)
        except Exception: pass

    try:
        proc = await asyncio.create_subprocess_exec(
            ssh_path,
            "-o", "StrictHostKeyChecking=no",
            "-o", "ServerAliveInterval=30",
            "-o", "ServerAliveCountMax=3",
            "-o", "ExitOnForwardFailure=yes",
            "-R", f"{subdomain}:80:localhost:{port}",
            "serveo.net",
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        )
    except Exception as e:
        log.error(f"Failed to start serveo: {e}")
        return None, None

    url_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.serveo\.net")
    public_url = None

    async def read_output():
        nonlocal public_url
        while True:
            try:
                line = await asyncio.wait_for(proc.stdout.readline(), timeout=30)
                if not line: break
                text = line.decode(errors="replace").strip()
                if text: log.debug(f"[serveo] {text}")
                match = url_pattern.search(text)
                if match: public_url = match.group(0)
            except asyncio.TimeoutError: break
            except Exception: break

    asyncio.create_task(read_output())

    for attempt in range(25):
        await asyncio.sleep(1)
        if public_url:
            log.info(f"Serveo tunnel active at: {public_url}")
            return public_url, proc

    log.warning("Serveo tunnel started but no URL received within 25s")
    return None, proc
```

### `backend/server.py` — Replace tunnel startup (lines 77-87)

Change from:
```python
if MOBILE_SECRET:
    from tunnel import start_tunnel
    try:
        url, tunnel_proc = await start_tunnel(port=8000)
        if url:
            print(f"[MOBILE] SODA Remote accessible at: {url}")
            print(f"[MOBILE] Share this URL with your phone app")
        else:
            print(f"[MOBILE] Tunnel failed to start. Install cloudflared for remote access.")
    except Exception as e:
        log.warning(f"Tunnel startup failed: {e}")
```

Change to:
```python
if MOBILE_SECRET:
    from tunnel import start_serveo_tunnel, start_tunnel
    try:
        url, tunnel_proc = await start_serveo_tunnel(port=8000)
        if url:
            print(f"[MOBILE] SODA Remote accessible at: {url}")
            print(f"[MOBILE] This URL is PERSISTENT — set it once on your phone")
        else:
            print(f"[MOBILE] Serveo tunnel failed. Falling back to cloudflared...")
            url, tunnel_proc = await start_tunnel(port=8000)
            if url:
                print(f"[MOBILE] SODA Remote accessible at: {url}")
            else:
                print(f"[MOBILE] All tunnels failed. Install ssh or cloudflared.")
    except Exception as e:
        log.warning(f"Tunnel startup failed: {e}")
```

---

## Part 2: Wire ConnectionScreen into App.js

### `D:\soda\soda-remote\App.js` — Replace entire file

```jsx
import React, { useState } from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import MainScreen from './src/screens/MainScreen'
import ConnectionScreen from './src/screens/ConnectionScreen'

export default function App() {
  const [connected, setConnected] = useState(false)

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#04080B" />
      {connected ? (
        <MainScreen onDisconnect={() => setConnected(false)} />
      ) : (
        <ConnectionScreen onConnected={() => setConnected(true)} />
      )}
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#04080B' },
})
```

---

## Part 3: Wire Sub-Screens to Backend

### Common pattern for all 8 screens (add to each sub-screen):

At the top:
```js
import socketService from '../../services/SocketService'
```

Then use:
```js
socketService.emit('mobile_force_tool', { tool: 'tool_name', args: { ... } })
```

### TouchpadScreen (`subs/TouchpadScreen.js`)

Fire `mouse_move` on drag and `mouse_click` on button press:

Replace `onPanResponderMove` callback to also call:
```js
socketService.emit('mobile_force_tool', {
  tool: 'mouse_move',
  args: { x: screenX, y: screenY, duration: 0.1 }
})
```

Replace `fireClick` to also call:
```js
socketService.emit('mobile_force_tool', {
  tool: 'mouse_click',
  args: { x: 0, y: 0, button: btn.toLowerCase(), clicks: 1 }
})
```

### KeyboardScreen (`subs/KeyboardScreen.js`)

On "SEND TO PC" button press, replace with:
```js
socketService.emit('mobile_force_tool', {
  tool: 'keyboard_type',
  args: { text: text, interval: 0.02 }
})
```

### TerminalScreen (`subs/TerminalScreen.js`)

In `execute()`, replace demo output with:
```js
socketService.emit('mobile_force_tool', {
  tool: 'terminal_execute',
  args: { command: cmd, timeout: 15 }
})
```
And listen for `command_output` event.

### VolumeScreen (`subs/VolumeScreen.js`)

On level change (slider, +/- buttons, preset tap), call:
```js
socketService.emit('mobile_force_tool', {
  tool: 'control_system',
  args: { action: 'volume_set', value: level }
})
```
On mute toggle:
```js
socketService.emit('mobile_force_tool', {
  tool: 'control_system',
  args: { action: 'mute', value: '' }
})
```

### BrightnessScreen (`subs/BrightnessScreen.js`)

On level change:
```js
socketService.emit('mobile_force_tool', {
  tool: 'control_system',
  args: { action: 'brightness_set', value: level }
})
```

### ScreenshotScreen (`subs/ScreenshotScreen.js`)

On snap:
```js
socketService.emit('mobile_force_tool', {
  tool: 'screenshot',
  args: {}
})
```
Listen for `screenshot_taken` event:
```js
useEffect(() => {
  const handler = (data) => {
    setCaptures(prev => [`${data.path.split('\\').pop()} @ ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 5))
  }
  socketService.on('screenshot_taken', handler)
  return () => socketService.off('screenshot_taken', handler)
}, [])
```

### FileBrowserScreen (`subs/FileBrowserScreen.js`)

On mount and when path changes, call:
```js
socketService.emit('mobile_force_tool', {
  tool: 'list_files',
  args: { path: '/' + path.join('/') }
})
```
Listen for `file_list` event and update `items` state.

### AppLauncherScreen (`subs/AppLauncherScreen.js`)

On app card press:
```js
socketService.emit('mobile_force_tool', {
  tool: 'open_app',
  args: { app_name: app.name }
})
```

---

## Build

After all changes:
```bash
cd D:\soda\soda-remote\android
.\gradlew assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
```
