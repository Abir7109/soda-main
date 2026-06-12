import asyncio
import os
import re
import signal
import subprocess
import sys
from logger import log


NGROK_DOMAIN = "sulfonyl-preeruptively-uriah.ngrok-free.dev"

async def find_ngrok():
    for path_dir in os.environ.get("PATH", "").split(os.pathsep):
        stripped = path_dir.strip().strip('"')
        if not stripped or not os.path.isdir(stripped):
            continue
        for name in ("ngrok.exe", "ngrok.cmd", "ngrok"):
            full = os.path.join(stripped, name)
            if os.path.isfile(full) and os.access(full, os.X_OK):
                return full

    known = [
        os.path.expanduser("~\\AppData\\Roaming\\npm\\ngrok.cmd"),
        os.path.expanduser("~\\AppData\\Roaming\\npm\\ngrok.exe"),
        os.path.expanduser("~\\AppData\\Roaming\\npm\\ngrok"),
        os.path.expanduser("~\\AppData\\Local\\ngrok\\ngrok.exe"),
        "C:\\Program Files\\ngrok\\ngrok.exe",
    ]
    for candidate in known:
        try:
            if os.path.isfile(candidate):
                return candidate
        except Exception:
            pass

    return None


async def start_ngrok_tunnel(port=8000, domain=NGROK_DOMAIN):
    ngrok_path = await find_ngrok()
    if not ngrok_path:
        log.warning("ngrok not found. Install from https://ngrok.com/download")
        return None, None

    log.info(f"Starting ngrok tunnel using: {ngrok_path}")

    try:
        proc = await asyncio.create_subprocess_exec(
            ngrok_path, "http", str(port), "--url", domain,
            "--log=stdout",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        )
    except Exception as e:
        log.error(f"Failed to start ngrok: {e}")
        return None, None

    url_pattern = re.compile(r"url=https://[a-zA-Z0-9.-]+")
    public_url = None

    async def read_output():
        nonlocal public_url
        while True:
            try:
                line = await asyncio.wait_for(proc.stdout.readline(), timeout=30)
                if not line:
                    break
                text = line.decode(errors="replace").strip()
                if text:
                    log.debug(f"[ngrok] {text}")
                match = url_pattern.search(text)
                if match:
                    public_url = match.group(0).replace("url=", "")
            except asyncio.TimeoutError:
                break
            except Exception:
                break

    asyncio.create_task(read_output())

    for attempt in range(15):
        await asyncio.sleep(1)
        if public_url:
            log.info(f"ngrok tunnel active at: {public_url}")
            return public_url, proc

    log.warning("ngrok started but no URL received within 15s")
    return None, proc


async def stop_tunnel(proc):
    if proc is None:
        return
    try:
        if sys.platform == "win32":
            proc.send_signal(signal.CTRL_BREAK_EVENT)
        else:
            proc.terminate()
        try:
            await asyncio.wait_for(proc.wait(), timeout=5)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
        log.info("ngrok tunnel stopped")
    except Exception as e:
        log.error(f"Error stopping tunnel: {e}")
