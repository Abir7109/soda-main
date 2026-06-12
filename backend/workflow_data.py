"""
Collects real-time data for workflow HUD animations.
Called by start_workflow tool before emitting to frontend.
"""
import asyncio
import json
import platform
import sys
import os
import socket
import time
from datetime import datetime, date
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from logger import log
import github_tools
import task_planner


_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

async def collect():
    data = {
        "time": _get_time(),
        "system": await _get_system(),
        "weather": await _get_weather(),
        "tasks": _get_tasks(),
        "github": await _get_github(),
        "git_local": _get_git_local(),
        "project_scan": await _get_local_project_stats(),
        "active_window": _get_active_window(),
        "schedule": _get_today_schedules(),
        "reminders": _get_reminders_count(),
        "network": await _get_network_latency(),
    }
    return data


def _get_time():
    now = datetime.now()
    return {
        "iso": now.isoformat(),
        "date": now.strftime("%A, %B %d, %Y"),
        "time_12h": now.strftime("%I:%M %p").lstrip("0"),
        "time_24h": now.strftime("%H:%M"),
        "hour": now.hour,
        "minute": now.minute,
        "day": now.strftime("%A"),
        "month": now.strftime("%B"),
        "year": now.year,
    }


async def _get_system():
    try:
        from external_apis import get_system_status
        status = await get_system_status()
        if isinstance(status, dict) and status:
            return status
    except Exception as e:
        log.warning(f"workflow_data: system status failed: {e}")
    return {}


def _get_tasks():
    try:
        plan = task_planner.get_active_plan()
        if isinstance(plan, dict) and "error" not in plan:
            return plan
    except Exception as e:
        log.warning(f"workflow_data: tasks failed: {e}")
    return {"tasks": [], "status": "none"}


async def _get_github():
    result = {"repos": [], "prs": [], "issues": []}
    try:
        r = await asyncio.wait_for(
            asyncio.to_thread(github_tools.list_repos), timeout=2.0
        )
        if isinstance(r, dict) and r.get("success") and r.get("output"):
            try:
                repos = json.loads(r["output"])
                result["repos"] = repos if isinstance(repos, list) else []
            except json.JSONDecodeError:
                pass
    except asyncio.TimeoutError:
        log.warning(f"workflow_data: github repos timed out")
    except Exception as e:
        log.warning(f"workflow_data: github repos failed: {e}")
    return result


def _get_git_local():
    try:
        import subprocess
        r = subprocess.run(
            ["git", "log", "--oneline", "-5", "--no-decorate"],
            capture_output=True, text=True, timeout=5, shell=True,
        )
        recent = [line.strip() for line in r.stdout.strip().split("\n") if line.strip()] if r.returncode == 0 else []
        branch_r = subprocess.run(
            ["git", "branch", "--show-current"],
            capture_output=True, text=True, timeout=5, shell=True,
        )
        branch = branch_r.stdout.strip() if branch_r.returncode == 0 else "unknown"
        count_r = subprocess.run(
            ["git", "rev-list", "--count", "HEAD"],
            capture_output=True, text=True, timeout=5, shell=True,
        )
        total_commits = int(count_r.stdout.strip()) if count_r.returncode == 0 else 0
        return {"branch": branch, "recent_commits": recent, "total_commits": total_commits}
    except Exception as e:
        log.warning(f"workflow_data: git local failed: {e}")
    return {}


_SCANNED_EXTENSIONS = {'.py', '.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md', '.yml', '.yaml', '.sh', '.bat', '.ps1', '.sql', '.xml', '.env.example'}
_SKIP_DIRS = {'node_modules', '.git', '__pycache__', 'dist', '.venv', 'venv', '.opencode', 'assets', 'build', '.next', 'public'}

_scan_cache = None
_scan_cache_time = 0
_SCAN_CACHE_TTL = 30

def _scan_filesystem_sync():
    total_files = 0
    total_lines = 0
    todo_count = 0
    fixme_count = 0
    file_breakdown = {}

    root = _PROJECT_ROOT
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in _SKIP_DIRS]
        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in _SCANNED_EXTENSIONS:
                continue
            fpath = os.path.join(dirpath, fname)
            try:
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                line_count = len(lines)
                total_files += 1
                total_lines += line_count
                file_breakdown[ext] = file_breakdown.get(ext, 0) + 1
                for line in lines:
                    low = line.lower()
                    if 'fixme' in low:
                        fixme_count += 1
                    elif 'todo' in low:
                        todo_count += 1
            except (IOError, OSError):
                pass

    todo_density = (todo_count + fixme_count) / max(total_lines, 1) * 1000
    quality_score = max(0, min(100, round(100 - todo_density * 8)))
    quality_score = max(quality_score, 15)

    return {
        "files": total_files,
        "lines": total_lines,
        "todos": todo_count,
        "fixmes": fixme_count,
        "quality_score": quality_score,
        "project_dir": os.path.basename(root),
        "file_types": file_breakdown,
    }

_DEFAULT_SCAN = {
    "files": 0, "lines": 0, "todos": 0, "fixmes": 0,
    "quality_score": 80, "project_dir": os.path.basename(_PROJECT_ROOT), "file_types": {},
}
_SCAN_TIMEOUT = 5

async def _get_local_project_stats():
    global _scan_cache, _scan_cache_time
    now = time.time()
    if _scan_cache is not None and (now - _scan_cache_time) < _SCAN_CACHE_TTL:
        return _scan_cache
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(_scan_filesystem_sync),
            timeout=_SCAN_TIMEOUT,
        )
        _scan_cache = result
        _scan_cache_time = now
        return result
    except asyncio.TimeoutError:
        log.warning("workflow_data: project scan timed out (>=5s), using defaults")
        return dict(_DEFAULT_SCAN)
    except Exception as e:
        log.warning(f"workflow_data: project scan failed: {e}")
    return dict(_DEFAULT_SCAN)

def _get_active_window():
    try:
        import system_local
        r = system_local.get_active_window()
        if isinstance(r, dict):
            return r
    except Exception as e:
        log.warning(f"workflow_data: active window failed: {e}")
    return {}


_weather_cache = None
_weather_cache_time = 0
_WEATHER_CACHE_TTL = 120

async def _get_weather():
    global _weather_cache, _weather_cache_time
    now = time.time()
    if _weather_cache is not None and (now - _weather_cache_time) < _WEATHER_CACHE_TTL:
        return _weather_cache
    try:
        from external_apis import get_ip_info, get_weather
        ip_data = await asyncio.wait_for(get_ip_info(), timeout=5.0)
        if not isinstance(ip_data, dict):
            return _get_fallback_weather()
        city = ip_data.get("city") or ip_data.get("region") or ip_data.get("country")
        if not city:
            return _get_fallback_weather()
        weather = await asyncio.wait_for(get_weather(city), timeout=5.0)
        if isinstance(weather, dict) and "error" not in weather:
            weather["location"] = city
            _weather_cache = weather
            _weather_cache_time = now
            return weather
    except asyncio.TimeoutError:
        log.warning(f"workflow_data: weather timed out")
    except Exception as e:
        log.warning(f"workflow_data: weather failed: {e}")
    return _get_fallback_weather()

def _get_fallback_weather():
    return {
        "location": "Dhaka",
        "temperature": 28,
        "feels_like": 31,
        "humidity": 70,
        "wind_speed": 10,
        "wind_direction": 180,
        "weather_code": 2,
        "is_day": True,
        "precipitation": 5,
        "cloud_cover": 40,
    }


def _get_today_schedules():
    try:
        import schedules
        r = schedules.list_schedules()
        if not isinstance(r, dict) or not r.get("schedules"):
            return {"count": 0, "items": []}
        today_str = date.today().isoformat()
        today_items = [s for s in r["schedules"] if s.get("date") == today_str]
        today_items.sort(key=lambda x: x.get("time", ""))
        return {"count": len(today_items), "items": today_items}
    except Exception as e:
        log.warning(f"workflow_data: schedules failed: {e}")
    return {"count": 0, "items": []}


def _get_reminders_count():
    try:
        import reminders
        r = reminders.list_reminders()
        if isinstance(r, dict):
            return {"count": r.get("count", 0), "items": r.get("reminders", [])}
    except Exception as e:
        log.warning(f"workflow_data: reminders failed: {e}")
    return {"count": 0, "items": []}


async def _get_network_latency():
    try:
        loop = asyncio.get_event_loop()
        start = loop.time()
        _, writer = await asyncio.wait_for(
            asyncio.open_connection("8.8.8.8", 53), timeout=2
        )
        elapsed = loop.time() - start
        writer.close()
        await writer.wait_closed()
        return {"ping_ms": round(elapsed * 1000, 1), "reachable": True}
    except asyncio.TimeoutError:
        return {"ping_ms": None, "reachable": False, "error": "timeout"}
    except Exception as e:
        return {"ping_ms": None, "reachable": False, "error": str(e)}
