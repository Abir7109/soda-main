"""
Persistent reminder scheduler for SODA.
- One-shot reminders: fire once at a specific time, then auto-remove
- Recurring reminders: fire on an interval (in seconds)
- Background asyncio task: every 30s, check due reminders, emit sio event

Storage: projects/long_term_memory/reminders.json
"""
import json
import time
import asyncio
import uuid
from pathlib import Path
from datetime import datetime

REM_DIR = Path("projects/long_term_memory").resolve()
REM_DIR.mkdir(parents=True, exist_ok=True)
REMINDERS_PATH = REM_DIR / "reminders.json"


def _load() -> list:
    if not REMINDERS_PATH.exists():
        return []
    try:
        with open(REMINDERS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _save(items: list) -> None:
    with open(REMINDERS_PATH, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)


def _next_id() -> str:
    return uuid.uuid4().hex[:8]


def set_reminder(message: str, fire_at: str = None, in_seconds: int = None, recurring_seconds: int = None) -> dict:
    """
    Schedule a reminder.
    - fire_at: ISO timestamp ('2026-06-03T15:30:00') for one-shot
    - in_seconds: how many seconds from now to fire (one-shot)
    - recurring_seconds: interval in seconds for a recurring reminder
    """
    if not message or not message.strip():
        return {"success": False, "error": "Empty message"}
    message = message.strip()

    if recurring_seconds is not None and recurring_seconds > 0:
        rid = _next_id()
        item = {
            "id": rid, "message": message, "recurring": True,
            "interval_s": int(recurring_seconds),
            "next_fire": time.time() + int(recurring_seconds),
            "created": datetime.now().isoformat(),
        }
        items = _load()
        items.append(item)
        _save(items)
        return {"success": True, "id": rid, "reminder": item}

    target = None
    if fire_at:
        try:
            dt = datetime.fromisoformat(fire_at)
            target = dt.timestamp()
        except Exception as e:
            return {"success": False, "error": f"Bad fire_at format (use ISO 8601): {e}"}
    elif in_seconds is not None and in_seconds > 0:
        target = time.time() + int(in_seconds)
    else:
        return {"success": False, "error": "Provide fire_at, in_seconds, or recurring_seconds"}

    rid = _next_id()
    item = {
        "id": rid, "message": message, "recurring": False,
        "next_fire": target, "created": datetime.now().isoformat(),
    }
    items = _load()
    items.append(item)
    _save(items)
    return {"success": True, "id": rid, "reminder": item}


def list_reminders() -> dict:
    items = _load()
    enriched = []
    now = time.time()
    for it in items:
        e = dict(it)
        e["seconds_until_fire"] = max(0, int(e["next_fire"] - now))
        enriched.append(e)
    return {"success": True, "count": len(enriched), "reminders": enriched}


def cancel_reminder(rid: str) -> dict:
    items = _load()
    kept = [it for it in items if it["id"] != rid]
    if len(kept) == len(items):
        return {"success": False, "error": f"No reminder with id {rid!r}"}
    _save(kept)
    return {"success": True, "cancelled": rid, "remaining": len(kept)}


def cancel_all_reminders() -> dict:
    items = _load()
    n = len(items)
    _save([])
    return {"success": True, "cancelled": n}


def due_reminders() -> list:
    """Return reminders that are due and update their next_fire (recurring) or remove them."""
    items = _load()
    now = time.time()
    due = []
    kept = []
    for it in items:
        if it["next_fire"] <= now:
            due.append(it)
            if it.get("recurring") and it.get("interval_s"):
                it["next_fire"] = now + it["interval_s"]
                it["last_fired"] = datetime.now().isoformat()
                kept.append(it)
        else:
            kept.append(it)
    if due:
        _save(kept)
    return due


async def reminder_loop(sio, interval: int = 30):
    """Background task: poll every `interval` seconds, fire due reminders via sio."""
    print(f"[REMINDERS] Scheduler started (poll every {interval}s)")
    while True:
        try:
            await asyncio.sleep(interval)
            due = due_reminders()
            for r in due:
                payload = {
                    "id": r["id"],
                    "message": r["message"],
                    "recurring": r.get("recurring", False),
                    "fired_at": datetime.now().isoformat(),
                }
                print(f"[REMINDERS] Firing: {r['id']} - {r['message'][:60]}")
                try:
                    await sio.emit('reminder_fired', payload)
                except Exception as e:
                    print(f"[REMINDERS] emit failed: {e}")
        except asyncio.CancelledError:
            print("[REMINDERS] Scheduler stopped")
            raise
        except Exception as e:
            print(f"[REMINDERS] Loop error: {e}")
            await asyncio.sleep(interval)
