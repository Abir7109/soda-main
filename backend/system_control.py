import subprocess
import platform
import time
import shutil
import re

try:
    import pyautogui
    pyautogui.FAILSAFE = True
    pyautogui.PAUSE = 0.05
    _PYAUTOGUI = True
except ImportError:
    _PYAUTOGUI = False

try:
    import pyperclip
    _PYPERCLIP = True
except ImportError:
    _PYPERCLIP = False

_OS = platform.system()

def volume_up():
    if _OS == "Windows":
        for _ in range(3): pyautogui.press("volumeup")
    else:
        subprocess.run(["osascript", "-e", "set volume output volume (output volume of (get volume settings) + 10)"], capture_output=True)

def volume_down():
    if _OS == "Windows":
        for _ in range(3): pyautogui.press("volumedown")
    else:
        subprocess.run(["osascript", "-e", "set volume output volume (output volume of (get volume settings) - 10)"], capture_output=True)

def volume_mute():
    pyautogui.press("volumemute")

def brightness_up():
    if _OS == "Windows":
        try:
            subprocess.run(["powershell", "-Command", 
                "(Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, [math]::Min(100, (Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightness).CurrentBrightness + 10))"],
                capture_output=True, timeout=5)
        except: pass

def brightness_down():
    if _OS == "Windows":
        try:
            subprocess.run(["powershell", "-Command", 
                "(Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, [math]::Max(0, (Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightness).CurrentBrightness - 10))"],
                capture_output=True, timeout=5)
        except: pass


def volume_set(percent):
    """Set system volume to an exact percentage (0-100). Uses pycaw if available, falls back to PowerShell COM."""
    pct = max(0, min(100, int(percent)))
    try:
        from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
        from comtypes import CLSCTX_ALL
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume = interface.QueryInterface(IAudioEndpointVolume)
        volume.SetMasterVolumeLevelScalar(pct / 100.0, None)
        return True
    except ImportError:
        pass
    except Exception:
        pass
    try:
        subprocess.run([
            "powershell", "-NoProfile", "-Command",
            "$v=(New-Object -ComObject 'MMDeviceEnumerator').GetDefaultAudioEndpoint(0,1).Activate([Guid]'{D13FF16C-3C6D-49A0-B98C-0AC4D1C5F10C}',1,$null);$v.SetMasterVolumeLevelScalar(" + str(pct / 100.0) + ",$null)"
        ], capture_output=True, timeout=5)
        return True
    except Exception:
        return False


def brightness_set(percent):
    """Set display brightness to an exact percentage (0-100) using WMI."""
    pct = max(0, min(100, int(percent)))
    if _OS == "Windows":
        try:
            subprocess.run([
                "powershell", "-Command",
                f"(Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, {pct})"
            ], capture_output=True, timeout=5)
            return True
        except Exception:
            pass
    return False


def close_app():
    if _OS == "Darwin": pyautogui.hotkey("command", "q")
    else: pyautogui.hotkey("alt", "f4")

def close_window():
    if _OS == "Darwin": pyautogui.hotkey("command", "w")
    else: pyautogui.hotkey("ctrl", "w")

def minimize_window():
    if _OS == "Windows": pyautogui.hotkey("win", "down")

def maximize_window():
    if _OS == "Windows": pyautogui.hotkey("win", "up")

def full_screen():
    pyautogui.press("f11")

def show_desktop():
    if _OS == "Windows": pyautogui.hotkey("win", "d")

def switch_window():
    if _OS == "Darwin": pyautogui.hotkey("command", "tab")
    else: pyautogui.hotkey("alt", "tab")

def open_task_manager():
    if _OS == "Windows": pyautogui.hotkey("ctrl", "shift", "esc")

def screenshot():
    if _OS == "Windows":
        pyautogui.hotkey("win", "shift", "s")

def lock_screen():
    if _OS == "Windows": pyautogui.hotkey("win", "l")

def open_file_explorer():
    if _OS == "Windows": pyautogui.hotkey("win", "e")

def open_settings():
    if _OS == "Windows": pyautogui.hotkey("win", "i")

def restart_computer():
    if _OS == "Windows": subprocess.run(["shutdown", "/r", "/t", "30"], capture_output=True)

def shutdown_computer():
    if _OS == "Windows": subprocess.run(["shutdown", "/s", "/t", "0", "/f"], capture_output=True)

def type_text(text, press_enter=False):
    if _PYPERCLIP:
        pyperclip.copy(text)
        time.sleep(0.1)
        pyautogui.hotkey("ctrl", "v")
    else:
        pyautogui.write(text, interval=0.03)
    if press_enter:
        time.sleep(0.1)
        pyautogui.press("enter")

def press_key(key):
    pyautogui.press(key)

def hotkey(*keys):
    pyautogui.hotkey(*keys)

def click(x=None, y=None, button="left"):
    if x is not None and y is not None:
        pyautogui.click(x, y, button=button)
    else:
        pyautogui.click(button=button)

def scroll(amount):
    pyautogui.scroll(amount)

_APP_ALIASES = {
    "chrome": "chrome",
    "google chrome": "chrome",
    "firefox": "firefox",
    "edge": "msedge",
    "brave": "brave",
    "vscode": "code",
    "visual studio code": "code",
    "terminal": "wt",
    "cmd": "cmd.exe",
    "notepad": "notepad.exe",
    "explorer": "explorer.exe",
    "file explorer": "explorer.exe",
    "settings": "ms-settings:",
    "calculator": "calc.exe",
    "paint": "mspaint.exe",
    "discord": "Discord",
    "telegram": "Telegram",
    "whatsapp": "WhatsApp",
    "teams": "msteams",
    "zoom": "Zoom",
    "word": "winword",
    "excel": "excel",
    "powerpoint": "powerpnt",
    "obsidian": "Obsidian",
    "notion": "Notion",
}

def open_application(app_name):
    app_lower = app_name.lower().strip()
    exe_name = _APP_ALIASES.get(app_lower, app_name)
    
    if _OS == "Windows":
        if shutil.which(exe_name):
            subprocess.Popen(exe_name, shell=True)
            time.sleep(2)
            return f"Opened {app_name}"
        
        try:
            pyautogui.press("win")
            time.sleep(0.5)
            pyautogui.write(app_name, interval=0.05)
            time.sleep(0.8)
            pyautogui.press("enter")
            time.sleep(2)
            return f"Opened {app_name}"
        except Exception as e:
            return f"Could not open {app_name}: {e}"
    
    return f"Opening {app_name}..."

def computer_settings_action(action, value=None):
    action = action.lower().replace(" ", "_").replace("-", "_")
    
    actions = {
        "volume_up": lambda: volume_up() or "Volume increased",
        "volume_down": lambda: volume_down() or "Volume decreased",
        "mute": lambda: volume_mute() or "Volume muted",
        "brightness_up": lambda: brightness_up() or "Brightness increased",
        "brightness_down": lambda: brightness_down() or "Brightness decreased",
        "close_app": lambda: close_app() or "Closed application",
        "close_window": lambda: close_window() or "Closed window",
        "minimize": lambda: minimize_window() or "Minimized window",
        "maximize": lambda: maximize_window() or "Maximized window",
        "full_screen": lambda: full_screen() or "Full screen",
        "show_desktop": lambda: show_desktop() or "Showing desktop",
        "switch_window": lambda: switch_window() or "Switched window",
        "task_manager": lambda: open_task_manager() or "Opened task manager",
        "screenshot": lambda: screenshot() or "Screenshot taken",
        "lock_screen": lambda: lock_screen() or "Screen locked",
        "file_explorer": lambda: open_file_explorer() or "Opened file explorer",
        "open_settings": lambda: open_settings() or "Opened settings",
        "restart": lambda: restart_computer() or "Computer will restart in 30 seconds",
        "shutdown": lambda: shutdown_computer() or "Computer will shutdown in 30 seconds",
    }
    
    if action == "volume_set" and value is not None:
        ok = volume_set(value)
        return f"Volume set to {value}%" if ok else f"Failed to set volume to {value}%"

    if action == "brightness_set" and value is not None:
        ok = brightness_set(value)
        return f"Brightness set to {value}%" if ok else f"Failed to set brightness to {value}%"
    
    if action == "type_text" and value:
        return type_text(value, press_enter=False)
    
    if action == "press_key" and value:
        return press_key(value) or f"Pressed {value}"
    
    if action == "scroll_up":
        return scroll(300) or "Scrolled up"
    
    if action == "scroll_down":
        return scroll(-300) or "Scrolled down"
    
    if action == "open_app" and value:
        return open_application(value)
    
    if action in actions:
        return actions[action]()
    
    return f"Unknown action: {action}"