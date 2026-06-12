import json
import re
import time
from pathlib import Path

MEM_DIR = Path("projects/long_term_memory").resolve()
MEM_DIR.mkdir(parents=True, exist_ok=True)
MEM_PATH = MEM_DIR / "trigger_memory.json"

MAX_TRIGGERS = 40
MAX_KEYWORDS_PER_WF = 20
KEYWORD_TTL_DAYS = 30
STOPWORDS = {
    "a","an","the","is","it","in","on","at","to","for","of","with","by","and",
    "or","not","no","but","if","as","so","be","do","up","my","i","you","he",
    "she","we","they","me","him","her","us","them","this","that","these",
    "those","can","will","would","could","should","may","might","am","are",
    "was","were","been","being","have","has","had","do","does","did","doing",
    "get","got","getting","go","going","went","gone","come","came","coming",
    "take","took","taking","make","made","making","see","saw","seen","let",
    "know","like","need","want","use","used","using","say","said","says",
    "ট","টি","টা","ও","ওর","ওতে","এক","একটি","কি","কে","কোন","কর","করে",
    "করা","করার","করতে","করবেন","করো","কারণ","কাছে","কখন","কিভাবে",
    "এর","এতে","এখানে","এখন","যখন","যে","যা","যার","যারা","তাই","তবে",
    "থেকে","দিয়ে","দেওয়া","নিয়ে","নেই","না","পারে","পারি","পর্যন্ত",
    "বলে","বলছি","বললেন","মধ্যে","মতো","যাওয়া","সাথে","সব","সে","তার",
    "তারা","তাদের","হতে","হচ্ছে","হয়","হবে","হল","হলো","হিসেবে",
}


class WorkflowMemory:
    def __init__(self):
        self.data = self._load()
        self._dirty = False

    def _load(self):
        if not MEM_PATH.exists():
            return {"learned": {}, "recent_triggers": []}
        try:
            with open(MEM_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"learned": {}, "recent_triggers": []}

    def save(self):
        if not self._dirty:
            return
        MEM_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(MEM_PATH, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
        self._dirty = False

    def _tokenize(self, text):
        text = text.lower().strip()
        tokens = re.findall(r"[\w\u0980-\u09FF]+", text)
        return [t for t in tokens if t not in STOPWORDS and len(t) > 1]

    def record_trigger(self, transcript, workflow_name):
        now = time.time()
        learned = self.data["learned"]
        if workflow_name not in learned:
            learned[workflow_name] = {"keywords": {}, "trigger_count": 0, "last_trigger": 0}
        wf_data = learned[workflow_name]
        wf_data["trigger_count"] += 1
        wf_data["last_trigger"] = now

        tokens = self._tokenize(transcript)
        keywords = wf_data.setdefault("keywords", {})
        for token in tokens:
            if token not in keywords:
                keywords[token] = 1
            else:
                keywords[token] += 1

        triggers = self.data.setdefault("recent_triggers", [])
        triggers.append({
            "transcript": transcript,
            "workflow": workflow_name,
            "timestamp": now,
            "tokens": tokens,
        })

        self._dirty = True
        self._prune()

    def inject_into_matcher(self, intent_matcher):
        for wf_name, wf_data in self.data["learned"].items():
            if wf_data["keywords"]:
                intent_matcher.inject_learned(wf_name, wf_data["keywords"], weight=2)

    def _prune(self):
        now = time.time()
        cutoff = now - KEYWORD_TTL_DAYS * 86400

        triggers = self.data.get("recent_triggers", [])
        triggers.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
        self.data["recent_triggers"] = triggers[:MAX_TRIGGERS]

        learned = self.data.get("learned", {})
        to_delete = []
        for wf_name, wf_data in learned.items():
            kws = wf_data.get("keywords", {})
            if wf_data.get("last_trigger", 0) < cutoff and wf_data.get("trigger_count", 0) < 3:
                to_delete.append(wf_name)
                continue
            sorted_kws = sorted(kws.items(), key=lambda x: x[1], reverse=True)
            wf_data["keywords"] = dict(sorted_kws[:MAX_KEYWORDS_PER_WF])

        for name in to_delete:
            del learned[name]

        if not learned:
            pass
        self._dirty = True
