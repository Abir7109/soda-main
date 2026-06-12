"""
Persistent user memory for SODA.
- Profile: name, preferences, favorite things
- Facts: key-value facts the user tells SODA to remember
- History: last N user/model exchanges (rolling buffer)
- Recall: search facts by keyword

Storage: projects/long_term_memory/user_profile.json
         projects/long_term_memory/facts.jsonl  (append-only)
         projects/long_term_memory/history.jsonl
"""
import json
import time
from pathlib import Path
from datetime import datetime

MEM_DIR = Path("projects/long_term_memory").resolve()
MEM_DIR.mkdir(parents=True, exist_ok=True)
PROFILE_PATH = MEM_DIR / "user_profile.json"
FACTS_PATH = MEM_DIR / "facts.jsonl"
HISTORY_PATH = MEM_DIR / "history.jsonl"

DEFAULT_PROFILE = {
    "name": "Sir",
    "creator": "RM Abir",
    "nationality": "Bangladeshi Bengali",
    "favorite_color": None,
    "timezone": None,
    "wake_word": "soda",
    "language": "en",
    "preferences": {},
    "created": datetime.now().isoformat(),
    "updated": datetime.now().isoformat(),
}


def _load_profile() -> dict:
    if not PROFILE_PATH.exists():
        return dict(DEFAULT_PROFILE)
    try:
        with open(PROFILE_PATH, "r", encoding="utf-8") as f:
            return {**DEFAULT_PROFILE, **json.load(f)}
    except Exception:
        return dict(DEFAULT_PROFILE)


def _save_profile(profile: dict) -> None:
    profile["updated"] = datetime.now().isoformat()
    with open(PROFILE_PATH, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2, ensure_ascii=False)


def get_profile() -> dict:
    return _load_profile()


def set_profile_field(field: str, value) -> dict:
    """Update a top-level profile field (name, favorite_color, etc.)"""
    p = _load_profile()
    if field in DEFAULT_PROFILE or field == "preferences":
        p[field] = value
        _save_profile(p)
        return {"success": True, "field": field, "value": value, "profile": p}
    return {"success": False, "error": f"Unknown field: {field!r}. Allowed: {list(DEFAULT_PROFILE.keys())}"}


def set_preference(key: str, value) -> dict:
    p = _load_profile()
    p.setdefault("preferences", {})[key] = value
    _save_profile(p)
    return {"success": True, "key": key, "value": value}


def add_fact(key: str, value: str) -> dict:
    """Remember a fact about the user."""
    FACTS_PATH.touch(exist_ok=True)
    entry = {
        "key": key.strip().lower(),
        "value": value.strip(),
        "ts": datetime.now().isoformat(),
    }
    with open(FACTS_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return {"success": True, "key": entry["key"], "value": entry["value"], "ts": entry["ts"]}


def search_facts(query: str, limit: int = 5) -> dict:
    """Search facts by keyword (case-insensitive substring match on key or value)."""
    if not FACTS_PATH.exists():
        return {"success": True, "query": query, "matches": []}
    q = query.lower()
    matches = []
    try:
        with open(FACTS_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if q in entry.get("key", "").lower() or q in entry.get("value", "").lower():
                    matches.append(entry)
                    if len(matches) >= limit:
                        break
    except Exception as e:
        return {"success": False, "error": str(e), "matches": []}
    return {"success": True, "query": query, "count": len(matches), "matches": matches}


def list_facts(limit: int = 50) -> dict:
    if not FACTS_PATH.exists():
        return {"success": True, "count": 0, "facts": []}
    facts = []
    try:
        with open(FACTS_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
        for line in lines[-limit:]:
            line = line.strip()
            if not line:
                continue
            try:
                facts.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    except Exception as e:
        return {"success": False, "error": str(e), "facts": []}
    return {"success": True, "count": len(facts), "facts": facts}


def delete_fact(key: str) -> dict:
    """Delete a fact by key. Keeps latest entry per key."""
    if not FACTS_PATH.exists():
        return {"success": False, "error": "No facts stored"}
    key = key.strip().lower()
    kept = []
    deleted = 0
    try:
        with open(FACTS_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    kept.append(line)
                    continue
                if entry.get("key", "").lower() == key:
                    deleted += 1
                else:
                    kept.append(json.dumps(entry, ensure_ascii=False))
        with open(FACTS_PATH, "w", encoding="utf-8") as f:
            f.write("\n".join(kept) + ("\n" if kept else ""))
    except Exception as e:
        return {"success": False, "error": str(e), "deleted": 0}
    return {"success": True, "key": key, "deleted": deleted}


def add_history(role: str, text: str) -> None:
    """Append an exchange to rolling history buffer (max 200)."""
    HISTORY_PATH.touch(exist_ok=True)
    entry = {
        "role": role,
        "text": text[:2000],
        "ts": datetime.now().isoformat(),
    }
    with open(HISTORY_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    try:
        with open(HISTORY_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
        if len(lines) > 200:
            with open(HISTORY_PATH, "w", encoding="utf-8") as f:
                f.writelines(lines[-200:])
    except Exception:
        pass


def search_history(query: str, limit: int = 5) -> dict:
    """Search history by keyword."""
    if not HISTORY_PATH.exists():
        return {"success": True, "query": query, "matches": []}
    q = query.lower()
    matches = []
    try:
        with open(HISTORY_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if q in entry.get("text", "").lower():
                    matches.append(entry)
                    if len(matches) >= limit:
                        break
    except Exception as e:
        return {"success": False, "error": str(e), "matches": []}
    return {"success": True, "query": query, "count": len(matches), "matches": matches}


def memory_summary() -> dict:
    """One-shot overview for the model to recall on startup."""
    p = _load_profile()
    facts = list_facts(limit=20).get("facts", [])
    return {
        "profile": p,
        "fact_count": len(facts),
        "recent_facts": facts[-5:],
    }
