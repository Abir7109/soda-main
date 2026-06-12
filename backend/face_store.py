"""
Local face embedding storage.
Stores face embeddings (512-d from insightface or 1434-d from MediaPipe) and does local comparison.
Embeddings never leave this machine — only anonymous vectors are stored.
"""
import json
import numpy as np
from pathlib import Path
from datetime import datetime

STORE_DIR = Path("projects/long_term_memory").resolve()
STORE_DIR.mkdir(parents=True, exist_ok=True)
FACES_PATH = STORE_DIR / "faces.jsonl"
MATCH_THRESHOLD = 0.6  # Euclidean distance threshold (matches face_recognition default)


def _l2_distance(a, b):
    return float(np.linalg.norm(np.array(a) - np.array(b)))


def _load():
    if not FACES_PATH.exists():
        return []
    entries = []
    with open(FACES_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return entries


def _save(entries):
    with open(FACES_PATH, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def store_face(name, embedding):
    name = name.strip()
    if not name or not embedding:
        return {"success": False, "error": "name and embedding are required"}
    entries = _load()
    found = False
    for entry in entries:
        if entry.get("name", "").lower() == name.lower():
            entry["embedding"] = embedding
            entry["ts"] = datetime.now().isoformat()
            found = True
            break
    if not found:
        entries.append({
            "name": name,
            "embedding": embedding,
            "ts": datetime.now().isoformat(),
        })
    _save(entries)
    return {"success": True, "name": name, "action": "updated" if found else "created"}


def recognize_face(embedding, threshold=MATCH_THRESHOLD):
    if not embedding:
        return {"name": None, "message": "No embedding provided"}
    entries = _load()
    if not entries:
        return {"name": None, "message": "No faces in memory"}
    best_name = None
    best_distance = float("inf")
    for entry in entries:
        dist = _l2_distance(embedding, entry["embedding"])
        if dist < best_distance:
            best_distance = dist
            best_name = entry["name"]
    if best_name and best_distance <= threshold:
        return {"name": best_name, "distance": round(best_distance, 4)}
    return {"name": None, "message": "Face not recognized", "distance": round(best_distance, 4)}


def list_faces():
    entries = _load()
    return [{"name": e["name"], "ts": e.get("ts", "")} for e in entries]


def delete_face(name):
    entries = _load()
    filtered = [e for e in entries if e.get("name", "").lower() != name.lower()]
    if len(filtered) == len(entries):
        return {"success": False, "message": f"No face named '{name}' found"}
    _save(filtered)
    return {"success": True, "message": f"Forgot face: {name}"}


def face_count():
    return len(_load())
