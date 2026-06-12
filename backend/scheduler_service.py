"""
Natural-language task scheduler for SODA.
Parses human-readable time expressions, stores tasks in JSON,
and fires them by injecting text into the Gemini session.

Supported expressions:
  "every day at 9am" / "daily at 09:00"
  "every monday at 14:30"
  "every weekday at 8am"
  "every 30 minutes" / "every 2 hours"
  "tomorrow at 8am"
  "in 10 minutes"
  "at 3pm"
"""

import json
import re
import time
import uuid
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from logger import log

SCHED_DIR = Path("projects/long_term_memory").resolve()
SCHED_DIR.mkdir(parents=True, exist_ok=True)
SCHED_PATH = SCHED_DIR / "scheduled_tasks.json"

DAY_NAMES = {
    "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
    "friday": 4, "saturday": 5, "sunday": 6,
    "mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6,
}


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


def _parse_time_str(tstr):
    """Parse '9am', '09:00', '14:30', '3pm', '8:15am' into (hour, minute)."""
    tstr = tstr.strip().lower().replace(" ", "")
    m = re.match(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?', tstr)
    if not m:
        return None
    hour = int(m.group(1))
    minute = int(m.group(2)) if m.group(2) else 0
    meridiem = m.group(3)
    if meridiem == "pm" and hour < 12:
        hour += 12
    elif meridiem == "am" and hour == 12:
        hour = 0
    if hour < 0 or hour > 23 or minute < 0 or minute > 59:
        return None
    return (hour, minute)


def _parse_schedule(expr):
    """Parse a human-readable schedule expression.
    Returns a dict with 'type': 'cron'|'interval'|'oneshot' and parsed fields,
    or None if unparseable.
    """
    expr = expr.strip().lower()

    # Interval: "every X seconds/minutes/hours"
    m = re.match(r'every\s+(\d+)\s*(second|minute|hour)s?', expr)
    if m:
        num = int(m.group(1))
        unit = m.group(2)
        multiplier = {"second": 1, "minute": 60, "hour": 3600}
        return {"type": "interval", "seconds": num * multiplier[unit]}

    # "every day at X" / "daily at X" / "every weekday at X"
    m = re.match(r'(?:every\s+)?(?:day|daily)(?:\s+at\s+(.+))?', expr)
    if m:
        tstr = m.group(1)
        if tstr:
            parsed = _parse_time_str(tstr)
            if parsed:
                return {"type": "cron", "minute": parsed[1], "hour": parsed[0], "dow": -1}

    m = re.match(r'(?:every\s+)?weekday(?:\s+at\s+(.+))?', expr)
    if m:
        tstr = m.group(1)
        if tstr:
            parsed = _parse_time_str(tstr)
            if parsed:
                return {"type": "cron", "minute": parsed[1], "hour": parsed[0], "dow": list(range(5))}

    # "every monday at X" / "every tuesday at X"
    for day_name, day_num in DAY_NAMES.items():
        m = re.match(r'(?:every\s+)?' + day_name + r'(?:\s+at\s+(.+))?', expr)
        if m:
            tstr = m.group(1)
            if tstr:
                parsed = _parse_time_str(tstr)
                if parsed:
                    return {"type": "cron", "minute": parsed[1], "hour": parsed[0], "dow": [day_num]}

    # "tomorrow at X"
    m = re.match(r'tomorrow(?:\s+at\s+(.+))?', expr)
    if m:
        tstr = m.group(1)
        if tstr:
            parsed = _parse_time_str(tstr)
            if parsed:
                now = datetime.now()
                target = now.replace(hour=parsed[0], minute=parsed[1], second=0, microsecond=0) + timedelta(days=1)
                return {"type": "oneshot", "timestamp": target.timestamp()}

    # "in X minutes/hours/seconds"
    m = re.match(r'in\s+(\d+)\s*(minute|hour|second)s?', expr)
    if m:
        num = int(m.group(1))
        unit = m.group(2)
        multiplier = {"second": 1, "minute": 60, "hour": 3600}
        return {"type": "oneshot", "timestamp": time.time() + num * multiplier[unit]}

    # "at X" (today, or tomorrow if already passed)
    m = re.match(r'at\s+(.+)', expr)
    if m:
        parsed = _parse_time_str(m.group(1))
        if parsed:
            now = datetime.now()
            target = now.replace(hour=parsed[0], minute=parsed[1], second=0, microsecond=0)
            if target <= now:
                target += timedelta(days=1)
            return {"type": "oneshot", "timestamp": target.timestamp()}

    return None


def _calculate_next_fire(parsed):
    """Given a parsed schedule dict, calculate the next fire timestamp."""
    now = time.time()
    now_dt = datetime.now()

    if parsed["type"] == "interval":
        return now + parsed["seconds"]

    if parsed["type"] == "oneshot":
        return parsed["timestamp"]

    if parsed["type"] == "cron":
        minute = parsed["minute"]
        hour = parsed["hour"]
        dow = parsed["dow"]

        base = now_dt.replace(hour=hour, minute=minute, second=0, microsecond=0)
        for day_offset in range(8):
            candidate = base + timedelta(days=day_offset)
            if candidate.timestamp() <= now:
                continue
            if dow == -1:
                return candidate.timestamp()
            if isinstance(dow, list) and candidate.weekday() in dow:
                return candidate.timestamp()
        return now + 86400

    return now + 86400


def create_task(action_text, schedule, label=None):
    """Create a scheduled task. Returns dict with task data or error."""
    if not action_text or not action_text.strip():
        return {"success": False, "error": "action_text is required"}
    if not schedule or not schedule.strip():
        return {"success": False, "error": "schedule expression is required"}

    parsed = _parse_schedule(schedule.strip())
    if not parsed:
        return {"success": False, "error": f"Could not parse schedule: '{schedule}'. "
                "Try formats like 'every day at 9am', 'every monday at 14:30', "
                "'every 30 minutes', 'tomorrow at 8am', 'in 10 minutes'."}

    task = {
        "id": uuid.uuid4().hex[:8],
        "action_text": action_text.strip(),
        "label": (label or action_text.strip())[:60],
        "schedule": schedule.strip(),
        "parsed": parsed,
        "next_fire": _calculate_next_fire(parsed),
        "created": datetime.now().isoformat(),
        "enabled": True,
    }
    items = _load()
    items.append(task)
    _save(items)
    return {"success": True, "task": task}


def list_tasks():
    """List all scheduled tasks with enriched next-fire info."""
    items = _load()
    now = time.time()
    enriched = []
    for t in items:
        e = dict(t)
        e["seconds_until_fire"] = max(0, int(e["next_fire"] - now))
        e["next_fire_readable"] = datetime.fromtimestamp(e["next_fire"]).strftime("%Y-%m-%d %H:%M")
        enriched.append(e)
    return {"success": True, "count": len(enriched), "tasks": enriched}


def delete_task(task_id):
    """Delete a scheduled task by ID."""
    items = _load()
    kept = [t for t in items if t["id"] != task_id]
    if len(kept) == len(items):
        return {"success": False, "error": f"No task with id '{task_id}'"}
    _save(kept)
    return {"success": True, "deleted": task_id}


def due_tasks():
    """Return tasks that are due. Updates next_fire for recurring tasks."""
    items = _load()
    now = time.time()
    due = []
    kept = []
    for t in items:
        if not t.get("enabled", True):
            kept.append(t)
            continue
        if t["next_fire"] <= now:
            due.append(t)
            if t["parsed"]["type"] in ("cron", "interval"):
                t["next_fire"] = _calculate_next_fire(t["parsed"])
                kept.append(t)
        else:
            kept.append(t)
    if due:
        _save(kept)
    return due


async def scheduler_loop(sio, audio_loop, interval=30):
    """Background task: poll for due tasks and inject into Gemini session."""
    log.info(f"[SCHEDULER] Started (poll every {interval}s)")
    while True:
        try:
            await asyncio.sleep(interval)
            due = due_tasks()
            for task in due:
                log.info(f"[SCHEDULER] Firing task: {task['id']} - {task['label']}")
                if audio_loop and hasattr(audio_loop, 'inject_text'):
                    await audio_loop.inject_text(task["action_text"])
                elif sio:
                    await sio.emit("status", {
                        "msg": f"[Scheduled] {task['label']}"
                    })
        except asyncio.CancelledError:
            log.info("[SCHEDULER] Stopped")
            raise
        except Exception as e:
            log.error(f"[SCHEDULER] Loop error: {e}")
            await asyncio.sleep(interval)
