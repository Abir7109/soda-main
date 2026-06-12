"""
feelings.py — Emotional intelligence engine for SODA
No regex detection. Gemini understands emotions naturally.
This file provides: emotional taxonomy, strategy mapping,
response guidance, and the EmpathyEngine for context building.
"""

import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class EmotionalIntensity(Enum):
    MILD = 1
    MODERATE = 2
    STRONG = 3
    SEVERE = 4


class EmotionalCategory(Enum):
    GRIEF = "grief"
    HEARTBREAK = "heartbreak"
    ANXIETY = "anxiety"
    DEPRESSION = "depression"
    ANGER = "anger"
    LONELINESS = "loneliness"
    SHAME = "shame"
    EXHAUSTION = "exhaustion"
    CONFUSION = "confusion"
    DISAPPOINTMENT = "disappointment"
    JOY = "joy"
    EXCITEMENT = "excitement"
    PRIDE = "pride"
    RELIEF = "relief"
    GRATITUDE = "gratitude"
    LOVE = "love"
    NEUTRAL = "neutral"
    UNKNOWN = "unknown"


class SupportStrategy(Enum):
    SILENT_PRESENCE = "silent_presence"
    ACTIVE_LISTENING = "active_listening"
    VALIDATION = "validation"
    COMFORT = "comfort"
    DISTRACTION = "distraction"
    PRACTICAL_HELP = "practical_help"
    CHALLENGE_GENTLY = "challenge_gently"
    CELEBRATE = "celebrate"
    CHECK_IN = "check_in"


@dataclass
class EmotionalSignal:
    category: EmotionalCategory
    intensity: EmotionalIntensity
    confidence: float = 0.9
    trigger_phrase: str = ""
    context_clues: list[str] = field(default_factory=list)
    timestamp: float = field(default_factory=time.time)


@dataclass
class EmotionalState:
    primary: EmotionalSignal
    strategy: SupportStrategy
    secondary: Optional[EmotionalSignal] = None
    needs_immediate_attention: bool = False
    is_asking_for_help: bool = False
    is_ongoing: bool = False


STRATEGY_MAP = {
    (EmotionalCategory.GRIEF, EmotionalIntensity.SEVERE):   SupportStrategy.ACTIVE_LISTENING,
    (EmotionalCategory.GRIEF, EmotionalIntensity.STRONG):   SupportStrategy.ACTIVE_LISTENING,
    (EmotionalCategory.GRIEF, EmotionalIntensity.MODERATE): SupportStrategy.VALIDATION,

    (EmotionalCategory.HEARTBREAK, EmotionalIntensity.SEVERE):   SupportStrategy.COMFORT,
    (EmotionalCategory.HEARTBREAK, EmotionalIntensity.STRONG):   SupportStrategy.ACTIVE_LISTENING,
    (EmotionalCategory.HEARTBREAK, EmotionalIntensity.MODERATE): SupportStrategy.VALIDATION,

    (EmotionalCategory.DEPRESSION, EmotionalIntensity.SEVERE):   SupportStrategy.SILENT_PRESENCE,
    (EmotionalCategory.DEPRESSION, EmotionalIntensity.STRONG):   SupportStrategy.COMFORT,
    (EmotionalCategory.DEPRESSION, EmotionalIntensity.MODERATE): SupportStrategy.VALIDATION,

    (EmotionalCategory.ANXIETY, EmotionalIntensity.SEVERE):   SupportStrategy.COMFORT,
    (EmotionalCategory.ANXIETY, EmotionalIntensity.STRONG):   SupportStrategy.ACTIVE_LISTENING,
    (EmotionalCategory.ANXIETY, EmotionalIntensity.MODERATE): SupportStrategy.VALIDATION,

    (EmotionalCategory.ANGER, EmotionalIntensity.STRONG):   SupportStrategy.ACTIVE_LISTENING,
    (EmotionalCategory.ANGER, EmotionalIntensity.MODERATE): SupportStrategy.VALIDATION,
    (EmotionalCategory.ANGER, EmotionalIntensity.MILD):     SupportStrategy.CHALLENGE_GENTLY,

    (EmotionalCategory.LONELINESS, EmotionalIntensity.SEVERE):   SupportStrategy.COMFORT,
    (EmotionalCategory.LONELINESS, EmotionalIntensity.STRONG):   SupportStrategy.ACTIVE_LISTENING,
    (EmotionalCategory.LONELINESS, EmotionalIntensity.MODERATE): SupportStrategy.VALIDATION,

    (EmotionalCategory.SHAME, EmotionalIntensity.STRONG):   SupportStrategy.CHALLENGE_GENTLY,
    (EmotionalCategory.SHAME, EmotionalIntensity.MODERATE): SupportStrategy.VALIDATION,

    (EmotionalCategory.EXHAUSTION, EmotionalIntensity.STRONG):   SupportStrategy.COMFORT,
    (EmotionalCategory.EXHAUSTION, EmotionalIntensity.MODERATE): SupportStrategy.PRACTICAL_HELP,

    (EmotionalCategory.DISAPPOINTMENT, EmotionalIntensity.STRONG):   SupportStrategy.VALIDATION,
    (EmotionalCategory.DISAPPOINTMENT, EmotionalIntensity.MODERATE): SupportStrategy.ACTIVE_LISTENING,

    (EmotionalCategory.JOY, EmotionalIntensity.STRONG):       SupportStrategy.CELEBRATE,
    (EmotionalCategory.EXCITEMENT, EmotionalIntensity.MODERATE): SupportStrategy.CELEBRATE,
    (EmotionalCategory.PRIDE, EmotionalIntensity.MODERATE):   SupportStrategy.CELEBRATE,
}


RESPONSE_GUIDANCE = {
    SupportStrategy.SILENT_PRESENCE: {
        "tone": "quiet, warm, unhurried",
        "do": [
            "acknowledge the weight of what they said before anything else",
            "use short sentences — don't flood them with words",
            "let silence be okay — don't rush to fill it",
            "use their exact words back to them",
        ],
        "avoid": [
            "silver linings or 'at least' statements",
            "advice or solutions",
            "comparisons to others' pain",
            "questions that require effort to answer",
        ],
    },
    SupportStrategy.ACTIVE_LISTENING: {
        "tone": "focused, present, genuinely curious about their experience",
        "do": [
            "reflect back what you heard before asking anything",
            "ask one question at a time — never two",
            "follow their thread, don't redirect",
            "show you actually processed what they said",
        ],
        "avoid": [
            "generic questions like 'how does that make you feel'",
            "pivoting to advice too soon",
            "making it about you or SODA's experience",
        ],
    },
    SupportStrategy.VALIDATION: {
        "tone": "warm, affirming, grounding",
        "do": [
            "explicitly name that their feelings make sense",
            "normalize without minimizing",
            "be specific about WHY it makes sense to feel that way",
        ],
        "avoid": [
            "toxic positivity",
            "telling them they 'shouldn't' feel something",
            "rushing past the validation to advice",
        ],
    },
    SupportStrategy.COMFORT: {
        "tone": "warm, close, gentle — like a friend sitting next to them",
        "do": [
            "remind them they're not alone in this",
            "small, specific observations about their strength",
            "remind them that right now is not forever",
        ],
        "avoid": [
            "empty affirmations ('you've got this!')",
            "future-casting too much",
            "making it about resilience or growth (not the time)",
        ],
    },
    SupportStrategy.CELEBRATE: {
        "tone": "genuinely delighted, matching their energy",
        "do": [
            "match their excitement — don't be flat",
            "be specific about what you're celebrating",
            "ask them to tell you more",
        ],
        "avoid": [
            "dampening with caveats",
            "pivoting to 'what's next' too fast",
        ],
    },
    SupportStrategy.CHECK_IN: {
        "tone": "caring, remembering, personal",
        "do": [
            "reference the specific thing from before",
            "keep it natural",
            "let them set the tone for how much to discuss",
        ],
        "avoid": [
            "making them feel surveilled",
            "being too heavy-handed about the follow-up",
        ],
    },
}


class EmpathyEngine:

    def build_emotional_context(self, state, emotional_history=None, user_name=None):
        name = user_name or "them"
        guidance = RESPONSE_GUIDANCE.get(state.strategy, {})
        parts = [
            "═══ EMOTIONAL CONTEXT ═══",
            f"The user is experiencing: {state.primary.category.value.upper()} "
            f"(intensity: {state.primary.intensity.name})",
            "",
            f"Response strategy: {state.strategy.value.upper().replace('_', ' ')}",
        ]
        if guidance.get("tone"):
            parts.append(f"Tone: {guidance['tone']}")
        if guidance.get("do"):
            parts.append("Do:")
            parts.extend(f"  \u2022 {item}" for item in guidance["do"])
        if guidance.get("avoid"):
            parts.append("Avoid:")
            parts.extend(f"  \u2022 {item}" for item in guidance["avoid"])

        if emotional_history:
            relevant = [ep for ep in emotional_history[-5:] if ep.get("category") == state.primary.category.value]
            if relevant:
                last = relevant[-1]
                days_ago = int((time.time() - last.get("timestamp", time.time())) / 86400)
                time_str = "earlier today" if days_ago == 0 else "yesterday" if days_ago == 1 else f"{days_ago} days ago"
                parts.extend(["", f"\U0001f4cd Memory: {name} went through something similar {time_str}.",
                              "You can reference this naturally if it feels right."])

        if state.needs_immediate_attention:
            parts.extend(["", "\u26a0\ufe0f THIS MAY BE A CRISIS MOMENT.",
                          "Do NOT skip past this. Acknowledge their pain fully."])

        parts.extend(["", "═══ END EMOTIONAL CONTEXT ═══"])
        return "\n".join(parts)

    def build_checkin_prompt(self, past_episode, user_name=None):
        category = past_episode.get("category", "difficult time")
        summary = past_episode.get("summary", "what you were going through")
        days_ago = int((time.time() - past_episode.get("timestamp", time.time())) / 86400)
        time_str = "earlier today" if days_ago == 0 else "yesterday" if days_ago == 1 else f"{days_ago} days ago"
        return (
            f"\u2554\u2550 CHECK-IN MODE \u2550\u2557\n"
            f"You remember that {user_name or 'they'} was dealing with "
            f"{category} {time_str}.\nSummary: {summary}\n\n"
            f"Check in naturally: 'Hey, I've been thinking about what you said {time_str}...'\n"
            f"Keep it light. Let them set the depth.\n"
            f"\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"
        )

    def get_strategy(self, category, intensity_name):
        try:
            cat = EmotionalCategory(category)
            imap = {"MILD": EmotionalIntensity.MILD, "MODERATE": EmotionalIntensity.MODERATE,
                    "STRONG": EmotionalIntensity.STRONG, "SEVERE": EmotionalIntensity.SEVERE}
            intensity = imap.get(intensity_name, EmotionalIntensity.MODERATE)
            return STRATEGY_MAP.get((cat, intensity), SupportStrategy.ACTIVE_LISTENING)
        except Exception:
            return SupportStrategy.ACTIVE_LISTENING

    def get_guidance_for_strategy(self, strategy):
        return RESPONSE_GUIDANCE.get(strategy, {})
