"""
SODA IELTS Speaking Module
Manages cue cards, Part 1/2/3 sessions, real-time coaching via Gemini Live
"""

import json
import random
import time
from datetime import datetime
from pathlib import Path

SPEAKING_HISTORY = Path("backend/ielts_data/speaking_history.jsonl")

PART1_TOPICS = [
    "hometown", "work/study", "family", "hobbies", "food",
    "travel", "technology", "sports", "music", "weather",
    "shopping", "reading", "friends", "daily routine", "future plans",
    "accommodation", "transport", "art", "cinema", "health"
]

PART2_CUE_CARDS = [
    {
        "topic": "Describe a person who has influenced you",
        "points": [
            "Who this person is",
            "How you know them",
            "What qualities they have",
            "Explain how they have influenced you"
        ],
        "follow_up_part3": [
            "What qualities make a good role model?",
            "Do you think celebrities are good role models for young people?",
            "How has the concept of role models changed over the years?"
        ]
    },
    {
        "topic": "Describe a time you achieved something you were proud of",
        "points": [
            "What you achieved",
            "When you achieved it",
            "How you achieved it",
            "Explain why you were proud of it"
        ],
        "follow_up_part3": [
            "What kinds of achievements are most valued in your country?",
            "Is it important for children to learn to deal with failure?",
            "Do you think people today put too much pressure on themselves to succeed?"
        ]
    },
    {
        "topic": "Describe a place you would like to visit",
        "points": [
            "Where it is",
            "What it looks like",
            "Why you want to visit",
            "Explain what you would do there"
        ],
        "follow_up_part3": [
            "Why do people like to travel to other countries?",
            "What are the advantages and disadvantages of tourism?",
            "How has international travel changed in recent decades?"
        ]
    },
    {
        "topic": "Describe a book or film that made an impression on you",
        "points": [
            "What the book/film was",
            "When you read/watched it",
            "What it was about",
            "Explain why it made an impression on you"
        ],
        "follow_up_part3": [
            "How important is it to encourage children to read?",
            "Do you think films can teach us important life lessons?",
            "How has the film industry changed with streaming services?"
        ]
    },
    {
        "topic": "Describe a skill you have learned that is useful",
        "points": [
            "What the skill is",
            "How you learned it",
            "How long it took",
            "Explain why it is useful"
        ],
        "follow_up_part3": [
            "What skills do you think are most important in today's world?",
            "Should practical skills be taught more in schools?",
            "How has technology changed the skills people need?"
        ]
    },
    {
        "topic": "Describe an interesting conversation you had",
        "points": [
            "Who you had it with",
            "Where you were",
            "What you talked about",
            "Explain why you found it interesting"
        ],
        "follow_up_part3": [
            "How important is communication in the workplace?",
            "Do you think people communicate differently online vs. face-to-face?",
            "How can misunderstandings in communication be avoided?"
        ]
    },
    {
        "topic": "Describe a piece of technology you use often",
        "points": [
            "What it is",
            "How you use it",
            "How often you use it",
            "Explain why it is important to you"
        ],
        "follow_up_part3": [
            "How has technology changed the way we work?",
            "Are there any negative effects of people using technology too much?",
            "How do you think technology will develop in the next 20 years?"
        ]
    }
]

COMMON_MISTAKES = {
    "filler_words": ["um", "uh", "like", "you know", "sort of", "kind of", "basically"],
    "weak_openers": ["I think that", "In my opinion I think", "For me personally I"],
    "repetitive_phrases": ["because of that", "so that", "and then", "and also and"]
}

BAND_7_PHRASES = {
    "discourse_markers": [
        "Having said that,", "What's more,", "On the other hand,",
        "As far as I'm concerned,", "It goes without saying that",
        "To put it another way,", "By the same token,"
    ],
    "hedging": [
        "It's generally accepted that", "There's a tendency for",
        "It could be argued that", "To a certain extent,"
    ],
    "sophisticated_connectors": [
        "Despite the fact that", "Provided that", "Given that",
        "Whereas", "Nevertheless", "Consequently", "Subsequently"
    ]
}


class IELTSSpeakingSession:
    """Manages a complete IELTS speaking practice session."""

    def __init__(self, engine):
        self.engine = engine
        self.session_id = f"speaking_{int(time.time())}"
        self.part = 1
        self.cue_card = None
        self.transcript_log = []
        self.start_time = time.time()
        self.scores = {}

    def get_part1_question(self, topic: str = None) -> dict:
        if not topic:
            topic = random.choice(PART1_TOPICS)

        questions = self._generate_part1_questions(topic)
        return {
            "part": 1,
            "topic": topic,
            "questions": questions,
            "time_limit_seconds": 240,
            "instructions": (
                "Answer naturally as in a real interview. Aim for 2-3 sentences "
                "per answer — not too short, not over-explained. Use varied vocabulary."
            )
        }

    def _generate_part1_questions(self, topic: str) -> list:
        question_templates = {
            "hometown": [
                "Where are you from originally?",
                "What do you like most about your hometown?",
                "Has your hometown changed much in recent years?"
            ],
            "work/study": [
                "Do you work or are you a student?",
                "What do you enjoy most about your work/studies?",
                "Would you like to change your job or field of study in the future?"
            ],
            "technology": [
                "How important is technology in your daily life?",
                "What kind of technology do you use most often?",
                "Do you think young people use technology too much?"
            ],
            "food": [
                "What kind of food do you enjoy eating?",
                "Do you prefer eating at home or in restaurants?",
                "Has your diet changed much since you were a child?"
            ]
        }
        return question_templates.get(topic, [
            f"How important is {topic} to you?",
            f"How often do you think about {topic}?",
            f"Has your attitude to {topic} changed as you've got older?"
        ])

    def get_part2_cue_card(self) -> dict:
        self.cue_card = random.choice(PART2_CUE_CARDS)
        self.part = 2
        return {
            "part": 2,
            "topic": self.cue_card["topic"],
            "bullet_points": self.cue_card["points"],
            "prep_time_seconds": 60,
            "speak_time_seconds": 120,
            "instructions": (
                "You have 1 minute to prepare. Then speak for 1-2 minutes. "
                "Cover all bullet points. Use the preparation time to make brief notes."
            )
        }

    def get_part3_questions(self) -> dict:
        if not self.cue_card:
            self.cue_card = random.choice(PART2_CUE_CARDS)
        return {
            "part": 3,
            "questions": self.cue_card["follow_up_part3"],
            "time_limit_seconds": 300,
            "instructions": (
                "Give detailed, analytical answers. Show abstract thinking. "
                "Use discourse markers and sophisticated vocabulary."
            )
        }

    def analyze_response_prompt(self, transcript: str, part: int,
                                 question: str) -> str:
        return f"""You are a certified IELTS examiner with 10+ years experience.
Evaluate this IELTS Speaking Part {part} response using the OFFICIAL 4-criteria band scoring system.

QUESTION: {question}
CANDIDATE RESPONSE: {transcript}

Provide your evaluation in this EXACT JSON format:
{{
  "band_scores": {{
    "fluency_coherence": <1-9>,
    "lexical_resource": <1-9>,
    "grammatical_range": <1-9>,
    "pronunciation": <estimate based on text markers: hesitations, self-corrections>
  }},
  "overall_band": <average, rounded to nearest 0.5>,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": [
    {{
      "issue": "specific problem identified in the response",
      "example_from_response": "exact quote from their answer",
      "better_version": "improved version of that exact sentence",
      "band_impact": "This change would move you from Band X to Band Y"
    }}
  ],
  "vocabulary_feedback": {{
    "repetitions_found": ["word1", "word2"],
    "suggested_upgrades": [
      {{"used": "good", "better": "commendable", "best": "exemplary"}},
      {{"used": "important", "better": "significant", "best": "paramount"}}
    ]
  }},
  "grammar_errors": [
    {{
      "error": "exact error quoted",
      "correction": "corrected version",
      "type": "tense/article/preposition/subject-verb agreement etc"
    }}
  ],
  "band7_tip": "The single most impactful change to reach Band 7",
  "filler_words_count": <number of um/uh/like detected>,
  "word_count": <approximate word count>
}}

Be a strict but fair examiner. Do not inflate scores. Be specific with quotes."""

    def save_session(self, band_scores: dict):
        entry = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "duration_seconds": int(time.time() - self.start_time),
            "band_scores": band_scores,
            "transcript_log": self.transcript_log
        }
        with open(SPEAKING_HISTORY, "a") as f:
            f.write(json.dumps(entry) + "\n")
        self.engine.record_band_score(
            "speaking",
            band_scores.get("overall_band", 0),
            band_scores
        )
