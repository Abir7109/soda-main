"""
Local OS tools for SODA - clipboard, screenshot, process list, active window.
All stdlib + already-installed deps (mss). No new pip packages.
Cross-platform: Windows uses ctypes/PowerShell/tasklist; Linux uses xclip/xdotool/ps.
"""
import os
import sys
import time
import json
import shutil
import platform
import subprocess
from pathlib import Path
from datetime import datetime

CLIPBOARD_DIR = Path("projects/clipboard")
CLIPBOARD_DIR.mkdir(parents=True, exist_ok=True)


def _run(cmd, timeout=10, shell=False):
    """Run a subprocess, return (returncode, stdout, stderr)."""
    try:
        r = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout, shell=shell
        )
        return r.returncode, r.stdout, r.stderr
    except subprocess.TimeoutExpired:
        return -1, "", f"Command timed out after {timeout}s"
    except Exception as e:
        return -1, "", str(e)


# ============ CLIPBOARD ============

def clipboard_read() -> dict:
    """Read text content from the system clipboard."""
    if sys.platform == "win32":
        try:
            cmd = ["powershell", "-NoProfile", "-NonInteractive", "-Command", "Get-Clipboard -Raw"]
            rc, out, err = _run(cmd, timeout=8)
            if rc != 0:
                return {"success": False, "error": err or "Get-Clipboard failed", "text": ""}
            text = out.rstrip("\r\n")
            return {"success": True, "text": text, "length": len(text)}
        except Exception as e:
            return {"success": False, "error": str(e), "text": ""}
    else:
        if shutil.which("xclip"):
            rc, out, err = _run(["xclip", "-selection", "clipboard", "-o"], timeout=5)
            return {"success": rc == 0, "text": out, "error": err if rc != 0 else ""}
        if shutil.which("xsel"):
            rc, out, err = _run(["xsel", "--clipboard", "--output"], timeout=5)
            return {"success": rc == 0, "text": out, "error": err if rc != 0 else ""}
        if shutil.which("pbpaste"):
            rc, out, err = _run(["pbpaste"], timeout=5)
            return {"success": rc == 0, "text": out, "error": err if rc != 0 else ""}
        return {"success": False, "error": "No clipboard tool found (install xclip/xsel/pbpaste)", "text": ""}


def clipboard_write(text: str) -> dict:
    """Write text to the system clipboard."""
    if not isinstance(text, str):
        text = str(text)
    if sys.platform == "win32":
        try:
            proc = subprocess.Popen(
                ["powershell", "-NoProfile", "-NonInteractive", "-Command", "$input | Set-Clipboard"],
                stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            )
            try:
                _, stderr_b = proc.communicate(input=text.encode("utf-8"), timeout=8)
            except subprocess.TimeoutExpired:
                proc.kill()
                return {"success": False, "error": "clipboard write timed out", "length": 0}
            if proc.returncode != 0:
                err = stderr_b.decode("utf-8", errors="replace") if stderr_b else "unknown"
                return {"success": False, "error": err, "length": 0}
            return {"success": True, "length": len(text)}
        except Exception as e:
            return {"success": False, "error": str(e), "length": 0}
    else:
        if shutil.which("xclip"):
            p = subprocess.Popen(["xclip", "-selection", "clipboard"], stdin=subprocess.PIPE)
            p.communicate(text.encode("utf-8"), timeout=5)
            return {"success": p.returncode == 0, "length": len(text)}
        if shutil.which("xsel"):
            p = subprocess.Popen(["xsel", "--clipboard", "--input"], stdin=subprocess.PIPE)
            p.communicate(text.encode("utf-8"), timeout=5)
            return {"success": p.returncode == 0, "length": len(text)}
        if shutil.which("pbcopy"):
            p = subprocess.Popen(["pbcopy"], stdin=subprocess.PIPE)
            p.communicate(text.encode("utf-8"), timeout=5)
            return {"success": p.returncode == 0, "length": len(text)}
        return {"success": False, "error": "No clipboard tool found"}


# ============ SCREENSHOT ============

def take_screenshot() -> dict:
    """Take a full-screen screenshot. Saves to projects/clipboard/screenshot_<ts>.png."""
    try:
        import mss
        import mss.tools
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_path = CLIPBOARD_DIR / f"screenshot_{ts}.png"
        with mss.mss() as sct:
            monitor = sct.monitors[1]
            img = sct.grab(monitor)
            mss.tools.to_png(img.rgb, img.size, output=str(out_path))
        size = out_path.stat().st_size
        return {
            "success": True,
            "path": str(out_path.resolve()),
            "width": img.size[0],
            "height": img.size[1],
            "size_bytes": size,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# ============ PROCESS LIST ============

def list_processes(limit: int = 10, sort_by: str = "memory") -> dict:
    """List running processes. On Windows uses tasklist, on Linux uses ps."""
    if sys.platform == "win32":
        rc, out, err = _run(["tasklist", "/FO", "CSV", "/NH"], timeout=10)
        if rc != 0:
            return {"success": False, "error": err, "processes": []}
        processes = []
        for line in out.strip().split("\n"):
            parts = [p.strip().strip('"') for p in line.split('","')]
            if len(parts) >= 5:
                name, pid, session, session_num, mem = parts[0], parts[1], parts[2], parts[3], parts[4]
                mem_kb = 0
                try:
                    mem_kb = int(mem.replace(",", "").replace(" K", "").replace(",", ""))
                except Exception:
                    pass
                processes.append({
                    "name": name, "pid": pid, "memory_kb": mem_kb,
                    "session": session, "session_num": session_num,
                })
    else:
        rc, out, err = _run(["ps", "-eo", "pid,pcpu,pmem,comm", "--sort=-pmem"], timeout=10)
        if rc != 0:
            return {"success": False, "error": err, "processes": []}
        processes = []
        for i, line in enumerate(out.strip().split("\n")):
            if i == 0:
                continue
            parts = line.split(None, 3)
            if len(parts) >= 4:
                try:
                    processes.append({
                        "pid": int(parts[0]), "cpu_percent": float(parts[1]),
                        "memory_percent": float(parts[2]), "name": parts[3],
                    })
                except Exception:
                    pass

    if sort_by == "memory":
        processes.sort(key=lambda p: p.get("memory_kb", 0) or p.get("memory_percent", 0), reverse=True)
    return {"success": True, "count": len(processes), "processes": processes[:limit]}


# ============ ACTIVE WINDOW ============

def get_active_window() -> dict:
    """Get the title of the currently focused window."""
    if sys.platform == "win32":
        try:
            import ctypes
            from ctypes import wintypes
            user32 = ctypes.windll.user32
            hwnd = user32.GetForegroundWindow()
            length = user32.GetWindowTextLengthW(hwnd) + 1
            user32.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, wintypes.INT]
            user32.GetWindowTextW.restype = wintypes.INT
            buf = ctypes.create_unicode_buffer(length)
            user32.GetWindowTextW(hwnd, buf, length)
            return {"success": True, "title": buf.value, "hwnd": hwnd}
        except Exception as e:
            return {"success": False, "error": str(e), "title": ""}
    else:
        if shutil.which("xdotool"):
            rc, out, err = _run(["xdotool", "getactivewindow", "getwindowname"], timeout=3)
            return {"success": rc == 0, "title": out.strip(), "error": err if rc != 0 else ""}
        if shutil.which("xprop"):
            rc, out, err = _run(["xprop", "-root", "_NET_ACTIVE_WINDOW"], timeout=3)
            return {"success": rc == 0, "title": out.strip(), "error": err if rc != 0 else ""}
        return {"success": False, "error": "No window-detection tool found (install xdotool)", "title": ""}
