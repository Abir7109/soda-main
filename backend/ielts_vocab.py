"""
SODA IELTS Vocabulary System
Tracks learned words, collocations, topic-specific word banks
"""

import json
from datetime import datetime
from pathlib import Path

VOCAB_FILE = Path("backend/ielts_data/vocabulary.jsonl")

ACADEMIC_WORD_LIST = [
    "analyse", "approach", "area", "assess", "assume", "authority",
    "available", "benefit", "concept", "consist", "context", "constitute",
    "contract", "data", "define", "derive", "distribute", "economy",
    "environment", "establish", "estimate", "evident", "export", "factor",
    "finance", "formula", "function", "identify", "impact", "income",
    "indicate", "individual", "interpret", "involve", "issue", "labour",
    "legal", "legislate", "major", "method", "occur", "percent",
    "period", "policy", "principle", "procedure", "process", "require",
    "research", "respond", "role", "section", "significant", "similar",
    "source", "specific", "structure", "theory", "vary"
]

TOPIC_VOCAB = {
    "education": {
        "nouns": ["curriculum", "pedagogy", "literacy", "attainment", "tuition",
                  "scholarship", "faculty", "syllabus", "assessment", "dropout"],
        "verbs": ["enrol", "graduate", "specialise", "pursue", "attain"],
        "adjectives": ["compulsory", "vocational", "tertiary", "remedial", "extracurricular"],
        "collocations": ["higher education", "academic achievement", "learning outcomes",
                         "critical thinking", "lifelong learning"]
    },
    "technology": {
        "nouns": ["automation", "digitalisation", "algorithm", "innovation",
                  "cybersecurity", "artificial intelligence", "infrastructure"],
        "verbs": ["transform", "revolutionise", "implement", "integrate", "disrupt"],
        "adjectives": ["cutting-edge", "sophisticated", "obsolete", "groundbreaking"],
        "collocations": ["rapid advancement", "technological breakthrough",
                         "digital divide", "data privacy", "online platform"]
    },
    "environment": {
        "nouns": ["ecosystem", "biodiversity", "carbon footprint", "deforestation",
                  "renewable energy", "sustainability", "conservation", "emissions"],
        "verbs": ["preserve", "deplete", "contaminate", "mitigate", "offset"],
        "adjectives": ["sustainable", "catastrophic", "irreversible", "ecological"],
        "collocations": ["climate change", "global warming", "greenhouse gases",
                         "environmental impact", "natural resources"]
    },
    "health": {
        "nouns": ["healthcare", "obesity", "sedentary", "nutrition", "epidemic",
                  "wellbeing", "mortality", "prevention", "diagnosis"],
        "verbs": ["alleviate", "combat", "diagnose", "prescribe", "monitor"],
        "adjectives": ["chronic", "contagious", "preventable", "therapeutic"],
        "collocations": ["mental health", "physical activity", "unhealthy diet",
                         "life expectancy", "medical treatment"]
    },
    "society": {
        "nouns": ["inequality", "urbanisation", "migration", "demographics",
                  "community", "isolation", "multiculturalism", "poverty"],
        "verbs": ["integrate", "marginalise", "advocate", "segregate", "coexist"],
        "adjectives": ["diverse", "cohesive", "vulnerable", "prosperous"],
        "collocations": ["social mobility", "aging population", "gender equality",
                         "standard of living", "social welfare"]
    }
}

BAND_VOCABULARY_EXAMPLES = {
    "band_5_to_6": {
        "good": "beneficial / advantageous / commendable",
        "bad": "detrimental / adverse / unfavourable",
        "big": "substantial / considerable / significant",
        "small": "minimal / negligible / marginal",
        "many": "numerous / a plethora of / an abundance of",
        "show": "demonstrate / illustrate / highlight",
        "think": "argue / contend / assert / maintain",
        "say": "claim / state / emphasise / acknowledge",
        "help": "facilitate / contribute to / enhance",
        "problem": "challenge / obstacle / issue / drawback"
    },
    "band_6_to_7": {
        "important": "paramount / crucial / indispensable / vital",
        "increase": "escalate / surge / proliferate / soar",
        "decrease": "plummet / dwindle / diminish / decline sharply",
        "cause": "trigger / precipitate / give rise to / bring about",
        "result in": "culminate in / lead to / contribute to",
        "advantage": "merit / benefit / positive aspect",
        "disadvantage": "drawback / downside / limitation / pitfall"
    }
}


class IELTSVocabTracker:
    """Tracks learned vocabulary and provides revision."""

    def __init__(self):
        self.vocab_file = VOCAB_FILE
        self._ensure_file()

    def _ensure_file(self):
        VOCAB_FILE.parent.mkdir(parents=True, exist_ok=True)

    def add_word(self, word: str, definition: str, example: str,
                 topic: str = "general", source: str = "session"):
        word_lower = word.lower().strip()
        if self._word_exists(word_lower):
            return {"status": "duplicate", "word": word_lower, "message": f"'{word}' is already in your vocabulary bank"}
        entry = {
            "timestamp": datetime.now().isoformat(),
            "word": word_lower,
            "definition": definition,
            "example_sentence": example,
            "topic": topic,
            "source": source,
            "review_count": 0,
            "last_reviewed": None,
            "confidence": 0
        }
        with open(self.vocab_file, "a") as f:
            f.write(json.dumps(entry) + "\n")
        return {"status": "added", "word": word_lower, "message": f"'{word}' added to your vocabulary bank"}

    def _word_exists(self, word: str) -> bool:
        if not self.vocab_file.exists():
            return False
        word_lower = word.lower().strip()
        with open(self.vocab_file) as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    if entry.get("word") == word_lower:
                        return True
                except Exception:
                    pass
        return False

    def get_words_for_topic(self, topic: str) -> dict:
        topic_lower = topic.lower()
        if topic_lower in TOPIC_VOCAB:
            return {
                "topic": topic,
                "vocabulary": TOPIC_VOCAB[topic_lower],
                "band_upgrades": BAND_VOCABULARY_EXAMPLES
            }
        return {
            "topic": topic,
            "vocabulary": {},
            "message": f"No curated list for '{topic}'. Available: {list(TOPIC_VOCAB.keys())}"
        }

    def get_flashcard_session(self, count: int = 10) -> list:
        if not self.vocab_file.exists():
            return []

        all_words = []
        with open(self.vocab_file) as f:
            for line in f:
                try:
                    all_words.append(json.loads(line.strip()))
                except Exception:
                    pass

        all_words.sort(key=lambda w: (
            w.get("confidence", 0),
            w.get("review_count", 0)
        ))
        return all_words[:count]

    def get_upgrade_suggestions(self, text: str) -> list:
        suggestions = []
        text_lower = text.lower()
        for band_level, upgrades in BAND_VOCABULARY_EXAMPLES.items():
            for basic_word, better_words in upgrades.items():
                if f" {basic_word} " in f" {text_lower} ":
                    suggestions.append({
                        "word_found": basic_word,
                        "alternatives": better_words,
                        "level": band_level
                    })
        return suggestions

    def get_full_vocab_bank(self) -> list:
        if not self.vocab_file.exists():
            return []
        words = []
        with open(self.vocab_file) as f:
            for line in f:
                try:
                    words.append(json.loads(line.strip()))
                except Exception:
                    pass
        return words
