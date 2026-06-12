"""
SODA IELTS Core Engine
Handles band scoring, session management, and Gemini prompt construction
"""

import json
import os
import time
from datetime import datetime
from pathlib import Path

IELTS_DATA_DIR = Path("backend/ielts_data")
IELTS_DATA_DIR.mkdir(parents=True, exist_ok=True)

WRITING_BAND_DESCRIPTORS = {
    "task_achievement": {
        9: "Fully addresses all parts of the task. Presents a fully developed position",
        8: "Sufficiently addresses all parts. Presents a well-developed response",
        7: "Addresses all parts though some may be more fully covered",
        6: "Addresses all parts though some inadequately",
        5: "Addresses the task only partially",
        4: "Responds to the task only in a minimal way"
    },
    "coherence_cohesion": {
        9: "Uses cohesion in a way that attracts no attention. Skillfully manages paragraphing",
        8: "Sequences information and ideas logically. Manages paragraphing well",
        7: "Logically organises information. Uses a range of cohesive devices appropriately",
        6: "Arranges information coherently. Uses cohesive devices effectively but rigidly",
        5: "Presents information with some organisation. Uses cohesive devices but may be faulty",
        4: "Presents information but does not progress. Uses some basic cohesive devices"
    },
    "lexical_resource": {
        9: "Uses a wide range of vocabulary with very natural and sophisticated control",
        8: "Uses a wide range of vocabulary fluently and flexibly to convey precise meanings",
        7: "Uses sufficient range of vocabulary to allow some flexibility and precision",
        6: "Uses an adequate range of vocabulary for the task",
        5: "Uses a limited range of vocabulary but this minimally meets the task requirements",
        4: "Uses only basic vocabulary which may be used repetitively"
    },
    "grammatical_range": {
        9: "Uses a wide range of structures with full flexibility and accuracy",
        8: "Uses a wide range of structures. Most sentences are error-free",
        7: "Uses a variety of complex structures. Produces frequent error-free sentences",
        6: "Uses mix of simple and complex sentence forms. Makes some errors",
        5: "Uses only a limited range of structures. Attempts complex sentences but with errors",
        4: "Uses only a very limited range of structures with only rare use of subordinate clauses"
    }
}

SPEAKING_BAND_DESCRIPTORS = {
    "fluency_coherence": {
        9: "Speaks fluently with only rare repetition or self-correction",
        8: "Speaks fluently with only occasional repetition or self-correction",
        7: "Speaks at length without noticeable effort. May deviate from topic",
        6: "Is willing to speak at length though may lose coherence at times",
        5: "Usually maintains flow of speech but uses repetition",
        4: "Cannot respond without noticeable pauses. Limited ability to link ideas"
    },
    "lexical_resource": {
        9: "Uses vocabulary with full flexibility and precision in all topics",
        8: "Uses a wide vocabulary resource readily and flexibly",
        7: "Uses vocabulary resource flexibly to discuss a variety of topics",
        6: "Has a wide enough vocabulary to discuss topics at length",
        5: "Manages to talk about familiar and unfamiliar topics but uses limited vocabulary",
        4: "Can talk about familiar topics but can only convey basic meaning on unfamiliar topics"
    },
    "grammatical_range": {
        9: "Uses a wide range of structures with full flexibility and accuracy",
        8: "Uses a wide range of structures flexibly. Most utterances are error-free",
        7: "Uses a range of complex structures with some flexibility",
        6: "Uses mix of simple and complex structures, makes errors",
        5: "Produces basic sentence forms with reasonable accuracy",
        4: "Can produce basic sentence forms and some correct simple sentences"
    },
    "pronunciation": {
        9: "Uses a full range of pronunciation features with precision and subtlety",
        8: "Uses a wide range of pronunciation features. Sustained, flexible use",
        7: "Shows all positive features of Band 6. Easy to understand throughout",
        6: "Uses a range of pronunciation features. Generally easy to understand",
        5: "Shows all positive features of Band 4. Is generally intelligible",
        4: "Uses a limited range of pronunciation features. Attempts to control features"
    }
}


class IELTSEngine:
    """Central IELTS session state and scoring logic."""

    def __init__(self, sio=None):
        self.sio = sio
        self.progress_file = IELTS_DATA_DIR / "progress.json"
        self.band_scores_file = IELTS_DATA_DIR / "band_scores.jsonl"
        self._loaded = False
        self.progress = None

    def _ensure_loaded(self):
        if not self._loaded:
            self._load_progress()
            self._loaded = True

    def _load_progress(self):
        if self.progress_file.exists():
            with open(self.progress_file) as f:
                self.progress = json.load(f)
        else:
            self.progress = {
                "target_band": 7.0,
                "exam_date": None,
                "total_sessions": 0,
                "speaking_sessions": 0,
                "writing_sessions": 0,
                "reading_sessions": 0,
                "listening_sessions": 0,
                "average_bands": {
                    "speaking": None,
                    "writing": None,
                    "reading": None,
                    "listening": None,
                    "overall": None
                },
                "streak_days": 0,
                "last_session_date": None,
                "weak_areas": [],
                "strong_areas": []
            }
            self._save_progress()

    def _save_progress(self):
        with open(self.progress_file, "w") as f:
            json.dump(self.progress, f, indent=2)

    def record_band_score(self, module: str, band: float, sub_scores: dict = None):
        self._ensure_loaded()
        entry = {
            "timestamp": datetime.now().isoformat(),
            "module": module,
            "band": band,
            "sub_scores": sub_scores or {}
        }
        with open(self.band_scores_file, "a") as f:
            f.write(json.dumps(entry) + "\n")

        self._update_average(module, band)
        self._update_streak()
        counter = f"{module}_sessions"
        if counter in self.progress:
            self.progress[counter] += 1
        self._save_progress()

    def _update_average(self, module: str, new_band: float):
        current = self.progress["average_bands"].get(module)
        if current is None:
            self.progress["average_bands"][module] = new_band
        else:
            self.progress["average_bands"][module] = round(
                0.3 * new_band + 0.7 * current, 1
            )

        module_keys = ["speaking", "writing", "reading", "listening"]
        bands = [self.progress["average_bands"].get(k) for k in module_keys
                 if self.progress["average_bands"].get(k) is not None]
        if bands:
            self.progress["average_bands"]["overall"] = round(
                sum(bands) / len(bands), 1
            )
        self._analyze_areas(bands, module_keys)

    def _analyze_areas(self, bands: list, module_keys: list):
        target = self.progress.get("target_band", 7.0)
        gaps = []
        for k in module_keys:
            v = self.progress["average_bands"].get(k)
            if v is not None:
                gaps.append((k, target - v))
        gaps.sort(key=lambda x: x[1], reverse=True)
        self.progress["weak_areas"] = [g[0] for g in gaps[:2] if g[1] > 0]
        self.progress["strong_areas"] = [g[0] for g in gaps[-2:] if g[1] <= 0]

    def _update_streak(self):
        today = datetime.now().date().isoformat()
        last = self.progress.get("last_session_date")
        if last == today:
            return
        if last:
            from datetime import date, timedelta
            last_date = date.fromisoformat(last)
            if (date.today() - last_date).days == 1:
                self.progress["streak_days"] += 1
            elif (date.today() - last_date).days > 1:
                self.progress["streak_days"] = 1
        else:
            self.progress["streak_days"] = 1
        self.progress["last_session_date"] = today
        self.progress["total_sessions"] += 1

    def get_dashboard_data(self) -> dict:
        self._ensure_loaded()
        history = []
        if self.band_scores_file.exists():
            with open(self.band_scores_file) as f:
                lines = f.readlines()
            for line in lines[-20:]:
                try:
                    history.append(json.loads(line.strip()))
                except Exception:
                    pass

        days_until_exam = None
        if self.progress.get("exam_date"):
            from datetime import date
            exam = date.fromisoformat(self.progress["exam_date"])
            days_until_exam = (exam - date.today()).days

        return {
            "progress": self.progress,
            "history": history,
            "days_until_exam": days_until_exam,
            "target_band": self.progress["target_band"]
        }

    def set_exam_date(self, date_str: str):
        self._ensure_loaded()
        self.progress["exam_date"] = date_str
        self._save_progress()

    def set_target_band(self, band: float):
        self._ensure_loaded()
        self.progress["target_band"] = band
        self._save_progress()

    def build_ielts_system_prompt_addon(self) -> str:
        self._ensure_loaded()
        p = self.progress
        avg = p["average_bands"]
        target = p["target_band"]
        exam_date = p.get("exam_date", "not set")

        days_msg = ""
        if exam_date != "not set":
            from datetime import date
            try:
                days_left = (date.fromisoformat(exam_date) - date.today()).days
                days_msg = f"Exam is in {days_left} days."
            except Exception:
                pass

        return f"""
=== IELTS PREP CONTEXT ===
Target Band: {target} | Exam Date: {exam_date}. {days_msg}
Current Average Bands:
  Speaking: {avg.get('speaking') or 'Not assessed yet'}
  Writing:  {avg.get('writing') or 'Not assessed yet'}
  Reading:  {avg.get('reading') or 'Not assessed yet'}
  Listening:{avg.get('listening') or 'Not assessed yet'}
  Overall:  {avg.get('overall') or 'Not assessed yet'}
Streak: {p['streak_days']} day(s)
Weak areas: {', '.join(p['weak_areas']) or 'Not identified yet'}
Strong areas: {', '.join(p['strong_areas']) or 'Not identified yet'}

=== IELTS SPEAKING TEST PROTOCOL ===
The result field of ielts_speaking_start and ielts_speaking_evaluate
contains the EXACT text you must speak aloud. Read it word for word
in a natural interviewer voice. Do NOT change, summarize, or rephrase.
=================================

As SODA, you are also a certified IELTS coach. When the user asks for IELTS 
help, use the appropriate ielts_* tools. Always be specific about what band 
their response achieves and what exact changes would move them up one band.
Give actionable, examiner-level feedback — not vague encouragement.
=========================
"""
