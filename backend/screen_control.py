import subprocess
import platform
import time
import os

try:
    import pyautogui
    pyautogui.FAILSAFE = True
    pyautogui.PAUSE = 0.1
    _PYAUTOGUI = True
except ImportError:
    _PYAUTOGUI = False

try:
    import win32gui
    import win32con
    import win32api
    _WIN32 = True
except ImportError:
    _WIN32 = False

_OS = platform.system()

def _require_pyautogui():
    if not _PYAUTOGUI:
        raise RuntimeError("pyautogui not available. Install with: pip install pyautogui")
    if _OS != "Windows":
        raise RuntimeError("Screen control is currently Windows-only")

def _require_win32():
    if not _WIN32:
        raise RuntimeError("win32api not available. Install with: pip install pywin32")

def _find_window(title, partial=True):
    _require_win32()
    matches = []
    def enum_cb(hwnd, _matches):
        if win32gui.IsWindowVisible(hwnd):
            text = win32gui.GetWindowText(hwnd)
            if partial and title.lower() in text.lower():
                _matches.append((hwnd, text))
            elif not partial and text == title:
                _matches.append((hwnd, text))
        return True
    win32gui.EnumWindows(enum_cb, matches)
    return matches[0][0] if matches else None

# ═══════════════════════════════════════════
#  MOUSE CONTROL
# ═══════════════════════════════════════════

def click_at(x, y, button="left", clicks=1):
    return mouse_click(x, y, button=button, clicks=clicks)

def mouse_click(x, y, button="left", clicks=1):
    _require_pyautogui()
    pyautogui.click(x, y, button=button, clicks=clicks)
    return {"result": f"Clicked {button} at ({x}, {y})"}

def mouse_move(x, y, duration=0.3):
    _require_pyautogui()
    pyautogui.moveTo(x, y, duration=duration)
    return {"result": f"Moved mouse to ({x}, {y})"}

def mouse_scroll(amount):
    _require_pyautogui()
    pyautogui.scroll(amount)
    direction = "down" if amount > 0 else "up"
    return {"result": f"Scrolled {direction} by {abs(amount)}"}

def mouse_drag(start_x, start_y, end_x, end_y, duration=0.5):
    _require_pyautogui()
    pyautogui.moveTo(start_x, start_y)
    pyautogui.drag(end_x - start_x, end_y - start_y, duration=duration)
    return {"result": f"Dragged from ({start_x}, {start_y}) to ({end_x}, {end_y})"}

def mouse_position():
    _require_pyautogui()
    x, y = pyautogui.position()
    return {"x": x, "y": y}

# ═══════════════════════════════════════════
#  KEYBOARD CONTROL
# ═══════════════════════════════════════════

def type_text(text, interval=0.05):
    return keyboard_type(text, interval=interval)

def keyboard_type(text, interval=0.05):
    _require_pyautogui()
    pyautogui.typewrite(text, interval=interval)
    return {"result": f"Typed text ({len(text)} chars)"}

def press_key(key):
    return keyboard_press([key])

def hotkey(*keys):
    return keyboard_press(list(keys))

def keyboard_press(keys):
    _require_pyautogui()
    if isinstance(keys, str):
        keys = keys.split("+") if "+" in keys else [keys]
    pyautogui.hotkey(*keys)
    return {"result": f"Pressed: {'+'.join(keys)}"}

# ═══════════════════════════════════════════
#  WINDOW MANAGEMENT
# ═══════════════════════════════════════════

def window_focus(title):
    hwnd = _find_window(title)
    if not hwnd:
        return {"error": f"Window '{title}' not found"}
    _require_win32()
    if win32gui.IsIconic(hwnd):
        win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
    win32gui.SetForegroundWindow(hwnd)
    time.sleep(0.2)
    return {"result": f"Focused window: {title}"}

def window_list():
    _require_win32()
    windows = []
    def enum_cb(hwnd, _windows):
        if win32gui.IsWindowVisible(hwnd):
            text = win32gui.GetWindowText(hwnd)
            if text.strip():
                _windows.append({"title": text})
        return True
    win32gui.EnumWindows(enum_cb, windows)
    return {"windows": windows, "count": len(windows)}

def window_move(title, x, y, width=None, height=None):
    hwnd = _find_window(title)
    if not hwnd:
        return {"error": f"Window '{title}' not found"}
    _require_win32()
    if width and height:
        win32gui.MoveWindow(hwnd, x, y, width, height, True)
        return {"result": f"Moved/resized '{title}' to ({x},{y}) {width}x{height}"}
    else:
        win32gui.SetWindowPos(hwnd, 0, x, y, 0, 0,
                             win32con.SWP_NOSIZE | win32con.SWP_NOZORDER)
        return {"result": f"Moved '{title}' to ({x},{y})"}
