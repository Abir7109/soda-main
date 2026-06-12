"""
Play history for SODA Spotify integration.
Remembers what was played and enables repeat playback from similar queries.
"""

import json
import os
import re
from datetime import datetime
from logger import log

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "play_history.json")
MAX_ENTRIES = 100


def load_history():
    try:
        if os.path.isfile(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        log.warning(f"[PlayHistory] Failed to load: {e}")
    return []


def save_history(entries):
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(entries[-MAX_ENTRIES:], f, indent=2, ensure_ascii=False)
    except Exception as e:
        log.warning(f"[PlayHistory] Failed to save: {e}")


def _tokenize(text):
    return set(re.findall(r"[a-zA-Z0-9]+", text.lower()))


def find_similar(query, min_overlap=1):
    """
    Find the best matching previous play by word overlap.
    Returns the history entry dict or None.
    """
    entries = load_history()
    if not entries:
        return None
    q_tokens = _tokenize(query)
    if not q_tokens:
        return None

    best = None
    best_score = 0

    for entry in entries:
        title = entry.get("title", "")
        t_tokens = _tokenize(title)
        if not t_tokens:
            continue
        overlap = len(q_tokens & t_tokens)
        if overlap > best_score:
            best_score = overlap
            best = entry
        elif overlap == best_score and best_score > 0:
            if entry.get("play_count", 0) > best.get("play_count", 0):
                best = entry

    if best_score >= min_overlap:
        log.info(f"[PlayHistory] Found match '{best['title']}' (overlap={best_score}) for query '{query}'")
        return best

    log.info(f"[PlayHistory] No match for '{query}' (best overlap={best_score})")
    return None


def record_play(query, window_title):
    """
    Save a successful play to history.
    Updates play_count if the same title was played before.
    """
    entries = load_history()
    now = datetime.now().isoformat()

    title = window_title.strip()
    if not title or " - " not in title:
        title = query

    for entry in entries:
        if entry.get("title") == title:
            entry["play_count"] = entry.get("play_count", 0) + 1
            entry["query"] = query
            entry["last_played"] = now
            save_history(entries)
            log.info(f"[PlayHistory] Updated '{title}' (play_count={entry['play_count']})")
            return

    entries.insert(0, {
        "query": query,
        "title": title,
        "play_count": 1,
        "first_played": now,
        "last_played": now,
    })
    save_history(entries)
    log.info(f"[PlayHistory] Recorded '{title}'")
