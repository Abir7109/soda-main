"""
Enhanced memory system for SODA.
Extends user_memory.py with:
- People storage (name, relationship, traits, notes)
- Lessons learned (situation, correction, frequency)
- Conversation summaries
- Context block builder for session start injection
- Deduplicated fact storage with categories
"""
import json
import re
import time
from pathlib import Path
from datetime import datetime

MEM_DIR = Path("projects/long_term_memory").resolve()
MEM_DIR.mkdir(parents=True, exist_ok=True)
PEOPLE_PATH = MEM_DIR / "people.jsonl"
LESSONS_PATH = MEM_DIR / "lessons.jsonl"
SUMMARIES_PATH = MEM_DIR / "summaries.jsonl"
FACTS_PATH = MEM_DIR / "facts.jsonl"
MAX_ENTRIES = 200


# ── People ──

def remember_person(name, relationship="", traits="", preferences="", notes=""):
    """Store info about a person. Deduplicates by name."""
    PEOPLE_PATH.touch(exist_ok=True)
    name = name.strip()
    if not name:
        return {"success": False, "error": "Name is required"}
    entries = []
    found = False
    if PEOPLE_PATH.exists():
        with open(PEOPLE_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if entry.get("name", "").lower() == name.lower():
                    entry["relationship"] = relationship or entry.get("relationship", "")
                    entry["traits"] = traits or entry.get("traits", "")
                    entry["preferences"] = preferences or entry.get("preferences", "")
                    entry["notes"] = notes or entry.get("notes", "")
                    entry["ts"] = datetime.now().isoformat()
                    found = True
                entries.append(entry)
    if not found:
        entries.append({
            "name": name,
            "relationship": relationship,
            "traits": traits,
            "preferences": preferences,
            "notes": notes,
            "ts": datetime.now().isoformat(),
        })
    if len(entries) > MAX_ENTRIES:
        entries = entries[-MAX_ENTRIES:]
    with open(PEOPLE_PATH, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return {"success": True, "name": name, "action": "updated" if found else "created"}


def recall_person(query, limit=5):
    """Search people by name, relationship, or traits."""
    if not PEOPLE_PATH.exists():
        return {"success": True, "query": query, "matches": []}
    q = query.lower()
    matches = []
    try:
        with open(PEOPLE_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                searchable = f"{entry.get('name','')} {entry.get('relationship','')} {entry.get('traits','')} {entry.get('notes','')}".lower()
                if q in searchable:
                    matches.append(entry)
                    if len(matches) >= limit:
                        break
    except Exception as e:
        return {"success": False, "error": str(e), "matches": []}
    return {"success": True, "query": query, "count": len(matches), "matches": matches}


def recall_by_relationship(relationship, limit=5):
    """Search people whose relationship field contains the given keyword.
    e.g. recall_by_relationship('sister') matches 'sister', 'little sister', 'elder sister'.
    """
    if not PEOPLE_PATH.exists() or not relationship:
        return {"success": True, "relationship": relationship, "matches": []}
    q = relationship.lower().strip()
    matches = []
    try:
        with open(PEOPLE_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                rel = entry.get("relationship", "").lower()
                if q in rel:
                    matches.append(entry)
                    if len(matches) >= limit:
                        break
    except Exception as e:
        return {"success": False, "error": str(e), "matches": []}
    return {"success": True, "relationship": relationship, "count": len(matches), "matches": matches}


def list_people(limit=20):
    if not PEOPLE_PATH.exists():
        return []
    entries = []
    try:
        with open(PEOPLE_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    except Exception:
        return []
    return entries[-limit:]


# ── Lessons ──

def remember_lesson(situation, correction):
    """Learn from a mistake or correction. Tracks frequency."""
    LESSONS_PATH.touch(exist_ok=True)
    situation = situation.strip()
    correction = correction.strip()
    if not situation or not correction:
        return {"success": False, "error": "situation and correction are required"}
    entries = []
    found = False
    if LESSONS_PATH.exists():
        with open(LESSONS_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if entry.get("situation", "").lower() == situation.lower():
                    entry["correction"] = correction
                    entry["count"] = entry.get("count", 0) + 1
                    entry["ts"] = datetime.now().isoformat()
                    found = True
                entries.append(entry)
    if not found:
        entries.append({
            "situation": situation,
            "correction": correction,
            "count": 1,
            "ts": datetime.now().isoformat(),
        })
    if len(entries) > MAX_ENTRIES:
        entries = entries[-MAX_ENTRIES:]
    with open(LESSONS_PATH, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return {"success": True, "situation": situation, "action": "updated" if found else "created"}


def recall_lessons(query="", limit=5):
    """Search lessons by situation or correction. Empty query returns all recent."""
    if not LESSONS_PATH.exists():
        return []
    q = query.lower().strip()
    entries = []
    try:
        with open(LESSONS_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if not q or q in f"{entry.get('situation','')} {entry.get('correction','')}".lower():
                    entries.append(entry)
    except Exception:
        return []
    return entries[-limit:]


# ── Conversation Summaries ──

def save_summary(session_id, topics=None, key_decisions=None, last_exchanges=None):
    """Store a conversation summary at session end."""
    SUMMARIES_PATH.touch(exist_ok=True)
    entry = {
        "session_id": session_id,
        "topics": topics or [],
        "key_decisions": key_decisions or [],
        "last_exchanges": (last_exchanges or [])[:5],
        "ts": datetime.now().isoformat(),
    }
    entries = []
    if SUMMARIES_PATH.exists():
        with open(SUMMARIES_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    entries.append(line)
    entries.append(json.dumps(entry, ensure_ascii=False))
    if len(entries) > 50:
        entries = entries[-50:]
    with open(SUMMARIES_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(entries) + "\n")


def get_recent_summaries(limit=3):
    """Get last N conversation summaries."""
    if not SUMMARIES_PATH.exists():
        return []
    entries = []
    try:
        with open(SUMMARIES_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    except Exception:
        return []
    return entries[-limit:]


# ── Enhanced Facts (dedup on write) ──

def add_fact(key, value, category="general"):
    """Add a fact with dedup — replaces previous entry with same key."""
    from user_memory import delete_fact
    delete_fact(key)
    from user_memory import add_fact as _add_fact
    return _add_fact(key, value)


def list_memory(type="all", limit=10):
    """Unified listing across all memory stores."""
    result = {}
    if type in ("all", "facts"):
        from user_memory import list_facts
        result["facts"] = list_facts(limit=limit).get("facts", [])
    if type in ("all", "people"):
        result["people"] = list_people(limit=limit)
    if type in ("all", "lessons"):
        result["lessons"] = recall_lessons("", limit=limit)
    if type in ("all", "summaries"):
        result["summaries"] = get_recent_summaries(limit=limit)
    return result


# ── Context Block Builder ──

def build_context_block():
    """Build a memory-restoration context block for session start injection."""
    from user_memory import memory_summary, list_facts
    parts = []
    summary = memory_summary()
    profile = summary.get("profile", {})
    name = profile.get("name", "Sir")
    prefs = profile.get("preferences", {})

    parts.append("--- MEMORY RESTORED ---")
    parts.append(f"You are continuing from a previous session. Here's what you know:")

    user_line = f"USER: {name}"
    if prefs:
        pref_str = ", ".join(f"{k}={v}" for k, v in list(prefs.items())[:5])
        user_line += f" — {pref_str}"
    parts.append(user_line)

    facts = summary.get("recent_facts", [])
    if facts:
        fact_str = "; ".join(f"{f.get('key')}={f.get('value')}" for f in facts[:5])
        parts.append(f"KEY FACTS: {fact_str}")

    people = list_people(limit=3)
    if people:
        people_str = "; ".join(f"{p.get('name','')} ({p.get('relationship','')})" for p in people)
        parts.append(f"PEOPLE: {people_str}")

    lessons = recall_lessons("", limit=3)
    if lessons:
        lesson_str = "; ".join(l.get("correction", "") for l in lessons)
        parts.append(f"LESSONS: {lesson_str}")

    summaries = get_recent_summaries(limit=1)
    if summaries:
        s = summaries[0]
        topics = s.get("topics", [])
        if topics:
            parts.append(f"LAST SESSION TOPICS: {', '.join(topics[:3])}")

    try:
        from feelings_memory import FeelingsMemory
        _fm = FeelingsMemory()
        _emotional_ctx = _fm.get_context_for_session()
        if _emotional_ctx:
            parts.append(_emotional_ctx)
    except Exception:
        pass

    parts.append("Continue naturally as if no time has passed.")
    return "\n".join(parts)


# ── Passive Extraction (introductions in natural speech) ──

_RELATIONSHIPS = (
    "friend|brother|sister|cousin|colleague|coworker|boss|mom|dad|"
    "mother|father|wife|husband|partner|girlfriend|boyfriend|uncle|aunt|"
    "grandma|grandpa|neighbor|roommate|classmate|bestie|pal|buddy|"
    "homie|fiancé|fiancée|flatmate|teammate|partner"
)

_REL_PATTERN = re.compile(
    r"(?:this\s+is\s+(?:my|our)\s+(?P<rel1>" + _RELATIONSHIPS + r")\s+(?-i:(?P<name1>[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)))"
    r"|(?:meet\s+(?:(?:my|our)\s+(?P<rel2>" + _RELATIONSHIPS + r")\s+)?(?-i:(?P<name2>[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)))"
    r"|(?-i:(?P<name3>[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?))\s+is\s+(?:my|our)\s+(?P<rel3>" + _RELATIONSHIPS + r")"
    r"|(?-i:(?P<name4>[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?))\s+is\s+a(?:n)?\s+(?P<rel4>" + _RELATIONSHIPS + r")"
    r"|(?:say\s+hi\s+to\s+(?:(?:my|our)\s+(?P<rel5>" + _RELATIONSHIPS + r")\s+)?(?-i:(?P<name5>[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)))"
    r"|(?:i(?:'d)?\s+(?:want\s+(?:you\s+to\s+)?)?meet\s+(?-i:(?P<name6>[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)))"
    r"|(?:my\s+(?P<rel7>" + _RELATIONSHIPS + r")\s+(?-i:(?P<name7>[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?))\s+(?:is|has|likes|loves|hates|works|studies|said|says|told|wants|made|knows|does|will|was|were))",
    re.IGNORECASE
)


def extract_and_store_people(text):
    """
    Scan user text for introduction patterns (e.g. 'this is my friend John')
    and auto-store detected people via remember_person().
    Returns list of people stored.
    """
    if not text or not isinstance(text, str):
        return []
    stored = []
    seen_names = set()
    for match in _REL_PATTERN.finditer(text):
        name = (
            match.group("name1") or match.group("name2") or
            match.group("name3") or match.group("name4") or
            match.group("name5") or match.group("name6") or
            match.group("name7")
        )
        rel = (
            match.group("rel1") or match.group("rel2") or
            match.group("rel3") or match.group("rel4") or
            match.group("rel5") or match.group("rel7")
        )
        if name and name.lower() not in seen_names:
            seen_names.add(name.lower())
            result = remember_person(name=name, relationship=rel or "")
            if result.get("success"):
                stored.append({"name": name, "relationship": rel or "", "action": result.get("action")})
    return stored
