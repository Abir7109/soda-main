"""
feelings_memory.py — Persistent emotional history for SODA

Stores emotional episodes, tracks patterns, and retrieves
relevant history for context-aware emotional support.

Storage: projects/long_term_memory/feelings.jsonl
         projects/long_term_memory/emotional_profile.json
"""

import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Optional

from feelings import EmotionalCategory, EmotionalIntensity


MEMORY_DIR = Path("projects/long_term_memory").resolve()
FEELINGS_FILE = MEMORY_DIR / "feelings.jsonl"
PROFILE_FILE = MEMORY_DIR / "emotional_profile.json"

EPISODE_RELEVANCE_DAYS = 7
SAME_CATEGORY_COOLDOWN_HOURS = 2
MIN_STORE_INTENSITY = EmotionalIntensity.MODERATE


@dataclass
class EmotionalEpisode:
    id: str
    timestamp: float
    category: str
    intensity: str
    summary: str
    trigger_phrase: str = ""
    resolution: Optional[str] = None
    resolution_timestamp: Optional[float] = None
    follow_up_count: int = 0
    last_follow_up: Optional[float] = None
    notes: list[str] = None

    def __post_init__(self):
        if self.notes is None:
            self.notes = []

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def from_dict(d):
        return EmotionalEpisode(**d)

    @property
    def days_ago(self):
        return int((time.time() - self.timestamp) / 86400)

    @property
    def is_resolved(self):
        return self.resolution is not None

    @property
    def is_recent(self):
        return self.days_ago <= EPISODE_RELEVANCE_DAYS

    @property
    def needs_follow_up(self):
        if self.is_resolved:
            return False
        if self.intensity in ("MILD",):
            return False
        if self.days_ago > EPISODE_RELEVANCE_DAYS:
            return False
        if self.last_follow_up:
            hours_since = (time.time() - self.last_follow_up) / 3600
            if hours_since < 24:
                return False
        return True


@dataclass
class EmotionalProfile:
    baseline_mood: str = "neutral"
    common_stressors: list[str] = None
    common_joys: list[str] = None
    support_preferences: dict = None
    total_episodes: int = 0
    episodes_by_category: dict = None
    average_intensity: float = 2.0
    last_low_point: Optional[float] = None
    is_night_owl: bool = False
    shares_proactively: bool = True
    fastest_recovery_days: Optional[int] = None
    average_recovery_days: Optional[float] = None

    def __post_init__(self):
        if self.common_stressors is None:
            self.common_stressors = []
        if self.common_joys is None:
            self.common_joys = []
        if self.episodes_by_category is None:
            self.episodes_by_category = {}
        if self.support_preferences is None:
            self.support_preferences = {
                "prefers_listening_first": True,
                "welcomes_gentle_challenge": False,
                "likes_distraction": False,
                "wants_practical_help": True,
            }

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def from_dict(d):
        return EmotionalProfile(**d)


class FeelingsMemory:

    def __init__(self):
        MEMORY_DIR.mkdir(parents=True, exist_ok=True)
        self._episodes: list[EmotionalEpisode] = []
        self._profile: EmotionalProfile = EmotionalProfile()
        self._load()

    # ─── Load / Save ──────────────────────────────────────

    def _load(self):
        if FEELINGS_FILE.exists():
            with open(FEELINGS_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            self._episodes.append(EmotionalEpisode.from_dict(json.loads(line)))
                        except Exception:
                            pass
        if PROFILE_FILE.exists():
            try:
                with open(PROFILE_FILE, "r", encoding="utf-8") as f:
                    self._profile = EmotionalProfile.from_dict(json.load(f))
            except Exception:
                self._profile = EmotionalProfile()

    def _save_episode(self, episode):
        with open(FEELINGS_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(episode.to_dict()) + "\n")

    def _save_all_episodes(self):
        with open(FEELINGS_FILE, "w", encoding="utf-8") as f:
            for ep in self._episodes:
                f.write(json.dumps(ep.to_dict()) + "\n")

    def _save_profile(self):
        with open(PROFILE_FILE, "w", encoding="utf-8") as f:
            json.dump(self._profile.to_dict(), f, indent=2)

    # ─── Core Operations ──────────────────────────────────

    def store_episode(self, state, summary, additional_context=""):
        if state.primary.intensity.value < MIN_STORE_INTENSITY.value:
            return None

        positive_categories = {
            EmotionalCategory.JOY, EmotionalCategory.EXCITEMENT,
            EmotionalCategory.RELIEF, EmotionalCategory.GRATITUDE,
        }
        if (state.primary.category in positive_categories
                and state.primary.intensity.value < EmotionalIntensity.STRONG.value):
            return None

        if self._is_in_cooldown(state.primary.category):
            return None

        episode_id = f"ep_{int(time.time())}_{state.primary.category.value}"
        episode = EmotionalEpisode(
            id=episode_id,
            timestamp=time.time(),
            category=state.primary.category.value,
            intensity=state.primary.intensity.name,
            summary=summary,
            trigger_phrase=state.primary.trigger_phrase,
            notes=[additional_context] if additional_context else [],
        )
        self._episodes.append(episode)
        self._save_episode(episode)
        self._update_profile(state)
        return episode

    def mark_resolved(self, episode_id, resolution="resolved naturally"):
        for ep in self._episodes:
            if ep.id == episode_id:
                ep.resolution = resolution
                ep.resolution_timestamp = time.time()
                self._save_all_episodes()
                recovery_days = int((time.time() - ep.timestamp) / 86400)
                if (self._profile.fastest_recovery_days is None
                        or recovery_days < self._profile.fastest_recovery_days):
                    self._profile.fastest_recovery_days = recovery_days
                prev = self._profile.average_recovery_days
                if prev is None:
                    self._profile.average_recovery_days = float(recovery_days)
                else:
                    self._profile.average_recovery_days = (prev + recovery_days) / 2
                self._save_profile()
                return True
        return False

    def add_note_to_episode(self, episode_id, note):
        for ep in self._episodes:
            if ep.id == episode_id:
                ep.notes.append(f"[{time.strftime('%Y-%m-%d')}] {note}")
                self._save_all_episodes()
                return True
        return False

    def record_follow_up(self, episode_id):
        for ep in self._episodes:
            if ep.id == episode_id:
                ep.follow_up_count += 1
                ep.last_follow_up = time.time()
                self._save_all_episodes()
                return

    # ─── Retrieval ────────────────────────────────────────

    def get_recent_episodes(self, days=7, category=None, include_resolved=True):
        cutoff = time.time() - (days * 86400)
        results = [ep for ep in self._episodes if ep.timestamp >= cutoff]
        if category:
            results = [ep for ep in results if ep.category == category.value]
        if not include_resolved:
            results = [ep for ep in results if not ep.is_resolved]
        return sorted(results, key=lambda e: e.timestamp, reverse=True)

    def get_active_episodes(self):
        return [ep for ep in self._episodes if not ep.is_resolved and ep.is_recent]

    def get_episodes_needing_followup(self):
        return [ep for ep in self._episodes if ep.needs_follow_up]

    def find_similar_episodes(self, category, limit=3):
        matching = [ep for ep in self._episodes if ep.category == category.value]
        return sorted(matching, key=lambda e: e.timestamp, reverse=True)[:limit]

    def get_context_for_session(self):
        active = self.get_active_episodes()
        needs_followup = self.get_episodes_needing_followup()
        if not active and not needs_followup:
            return ""

        lines = ["\u2500\u2500 Emotional Memory \u2500\u2500"]
        if active:
            lines.append("Unresolved emotional episodes:")
            for ep in active[:3]:
                days_str = ("today" if ep.days_ago == 0
                            else "yesterday" if ep.days_ago == 1
                            else f"{ep.days_ago} days ago")
                lines.append(f"  \u2022 [{ep.category}] {ep.summary} ({days_str})")
                if ep.notes:
                    lines.append(f"    Notes: {ep.notes[-1]}")

        if needs_followup:
            lines.append("")
            lines.append("Episodes that may warrant a gentle check-in:")
            for ep in needs_followup[:2]:
                lines.append(f"  \u2022 {ep.summary} [{ep.id}]")

        if self._profile.common_stressors:
            lines.append("")
            lines.append(f"Known stressors: {', '.join(self._profile.common_stressors[:3])}")

        if self._profile.support_preferences.get("prefers_listening_first"):
            lines.append("Support preference: listens first, advice only when asked")

        lines.append("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")
        return "\n".join(lines)

    def get_profile_summary(self):
        p = self._profile
        lines = [f"Baseline mood: {p.baseline_mood}", f"Total episodes tracked: {p.total_episodes}"]
        if p.common_stressors:
            lines.append(f"Common stressors: {', '.join(p.common_stressors)}")
        if p.common_joys:
            lines.append(f"Common joys: {', '.join(p.common_joys)}")
        if p.average_recovery_days:
            lines.append(f"Average recovery time: {p.average_recovery_days:.1f} days")
        return "\n".join(lines)

    def export_for_gemini(self, limit=10):
        recent = self.get_recent_episodes(days=30)[:limit]
        return [{
            "id": ep.id, "category": ep.category, "intensity": ep.intensity,
            "summary": ep.summary, "days_ago": ep.days_ago,
            "resolved": ep.is_resolved, "resolution": ep.resolution,
        } for ep in recent]

    # ─── Profile Updates ──────────────────────────────────

    def _update_profile(self, state):
        self._profile.total_episodes += 1
        cat_key = state.primary.category.value
        self._profile.episodes_by_category[cat_key] = self._profile.episodes_by_category.get(cat_key, 0) + 1
        current_avg = self._profile.average_intensity
        new_val = float(state.primary.intensity.value)
        self._profile.average_intensity = (
            (current_avg * (self._profile.total_episodes - 1) + new_val) / self._profile.total_episodes
        )
        if state.primary.intensity == EmotionalIntensity.SEVERE:
            self._profile.last_low_point = time.time()
        self._save_profile()

    def _is_in_cooldown(self, category):
        cutoff = time.time() - (SAME_CATEGORY_COOLDOWN_HOURS * 3600)
        for ep in reversed(self._episodes):
            if ep.timestamp < cutoff:
                break
            if ep.category == category.value:
                return True
        return False

    def add_known_stressor(self, stressor):
        if stressor not in self._profile.common_stressors:
            self._profile.common_stressors.append(stressor)
            self._save_profile()

    def add_known_joy(self, joy):
        if joy not in self._profile.common_joys:
            self._profile.common_joys.append(joy)
            self._save_profile()
