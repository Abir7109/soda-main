import json
import uuid
import subprocess
import sys
from pathlib import Path
from datetime import datetime, timedelta

SCHED_DIR = Path("projects/long_term_memory").resolve()
SCHED_DIR.mkdir(parents=True, exist_ok=True)
SCHED_PATH = SCHED_DIR / "schedules.json"

def _load():
    if not SCHED_PATH.exists():
        return []
    try:
        with open(SCHED_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save(items):
    with open(SCHED_PATH, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)

def _parse_relative_date(s):
    today = datetime.now().date()
    s = s.lower().strip()

    # "in X days" / "in X day"
    import re
    m = re.match(r'in\s+(\d+)\s+days?\s*', s)
    if m:
        return (today + timedelta(days=int(m.group(1)))).isoformat()

    # "next week"
    if s == "next week":
        return (today + timedelta(days=7)).isoformat()

    # "next monday", "next tuesday", etc.
    days_map = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6,
    }
    m = re.match(r'(next\s+)?(' + '|'.join(days_map.keys()) + r')$', s)
    if m:
        target = days_map[m.group(2)]
        days_ahead = target - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        return (today + timedelta(days=days_ahead)).isoformat()

    return None

def _parse_date(date_str):
    today = datetime.now().date()
    s = date_str.lower().strip()
    if s in ("today", "now"):
        return today.isoformat()
    if s == "tomorrow":
        return (today + timedelta(days=1)).isoformat()
    if s == "day after tomorrow":
        return (today + timedelta(days=2)).isoformat()
    try:
        dt = datetime.fromisoformat(s)
        return dt.date().isoformat()
    except:
        pass
    try:
        dt = datetime.strptime(s, "%Y-%m-%d")
        return dt.date().isoformat()
    except:
        pass
    try:
        dt = datetime.strptime(s, "%d/%m/%Y")
        return dt.date().isoformat()
    except:
        pass
    rel = _parse_relative_date(s)
    if rel:
        return rel
    return s

def _register_windows_task(schedule):
    if sys.platform != "win32":
        return
    sid = schedule["id"]
    task_name = f"SODA_Schedule_{sid}"
    title = schedule["title"]
    sched_time = schedule.get("time", "09:00") or "09:00"
    sched_date = schedule.get("date", "")
    if not sched_date:
        return
    date_fmt = sched_date.replace("-", "/")
    ps_cmd = (
        f'powershell -WindowStyle Hidden -Command "'
        f'Add-Type -AssemblyName System.Windows.Forms; '
        f'$n = New-Object System.Windows.Forms.NotifyIcon; '
        f'$n.Icon = [System.Drawing.SystemIcons]::Information; '
        f'$n.BalloonTipIcon = \'Info\'; '
        f'$n.BalloonTipTitle = \'SODA Schedule\'; '
        f'$n.BalloonTipText = \'{title} at {sched_time}\'; '
        f'$n.Visible = $true; '
        f'$n.ShowBalloonTip(30000); '
        f'Start-Sleep 30; '
        f'$n.Dispose()"'
    )
    try:
        subprocess.run(
            ["schtasks", "/create", "/tn", task_name, "/tr", ps_cmd,
             "/sc", "ONCE", "/st", sched_time, "/sd", date_fmt, "/f"],
            capture_output=True, timeout=15
        )
    except Exception as e:
        print(f"[SCHEDULES] Failed to register Windows task: {e}")

def _unregister_windows_task(sid):
    if sys.platform != "win32":
        return
    task_name = f"SODA_Schedule_{sid}"
    try:
        subprocess.run(
            ["schtasks", "/delete", "/tn", task_name, "/f"],
            capture_output=True, timeout=10
        )
    except Exception as e:
        print(f"[SCHEDULES] Failed to unregister Windows task: {e}")

def set_schedule(title, date, time="", details=""):
    items = _load()
    sid = uuid.uuid4().hex[:8]
    parsed_date = _parse_date(date)
    schedule = {
        "id": sid,
        "title": title,
        "date": parsed_date,
        "time": time,
        "details": details,
        "created_at": datetime.now().isoformat(),
    }
    items.append(schedule)
    _save(items)
    _register_windows_task(schedule)
    return {"success": True, "schedule": schedule}

def list_schedules():
    items = _load()
    items.sort(key=lambda x: x.get("date", "") + x.get("time", ""))
    return {"success": True, "count": len(items), "schedules": items}

def delete_schedule(sid):
    items = _load()
    kept = [it for it in items if it["id"] != sid]
    if len(kept) == len(items):
        return {"success": False, "error": f"No schedule with id {sid}"}
    _save(kept)
    _unregister_windows_task(sid)
    return {"success": True, "deleted": sid}
