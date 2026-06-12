"""
SODA IELTS Reading Module
Generates passages, creates questions, evaluates answers
"""

import json
import random
from datetime import datetime
from pathlib import Path

READING_HISTORY = Path("backend/ielts_data/reading_history.jsonl")

QUESTION_TYPES = [
    "true_false_not_given",
    "yes_no_not_given",
    "multiple_choice",
    "matching_headings",
    "sentence_completion",
    "summary_completion",
    "short_answer"
]

READING_PASSAGES = [
    {
        "title": "The Science of Sleep",
        "text": """Sleep is a fundamental biological necessity that affects virtually every system in
the human body. While scientists once believed that sleep was merely a passive state
of unconsciousness, modern research has revealed it to be a highly active and
essential process for physical and mental restoration.

During sleep, the brain cycles through several distinct stages, each serving
different functions. The rapid eye movement (REM) stage, for instance, is
particularly associated with memory consolidation and emotional processing.
Research conducted at Harvard Medical School found that students who slept
after learning new material performed significantly better on tests than those
who remained awake.

The consequences of chronic sleep deprivation extend far beyond simple tiredness.
Prolonged insufficient sleep has been linked to increased risk of cardiovascular
disease, obesity, type 2 diabetes, and compromised immune function. Furthermore,
cognitive impairment resulting from sleep loss can be as severe as that caused
by alcohol intoxication.

Despite the clear importance of adequate sleep, modern society appears to be
in the grip of a widespread sleep epidemic. According to the World Health
Organisation, two-thirds of adults in developed nations fail to obtain the
recommended eight hours of sleep per night. This phenomenon has been attributed
to numerous factors including artificial lighting, digital device usage before
bedtime, and demanding work schedules.""",
        "questions": [
            {
                "type": "true_false_not_given",
                "question": "Scientists have always understood sleep to be an active process.",
                "answer": "FALSE",
                "explanation": "The passage states scientists 'once believed' it was passive — implying this was the old view."
            },
            {
                "type": "true_false_not_given",
                "question": "REM sleep plays a role in how memories are stored.",
                "answer": "TRUE",
                "explanation": "Directly stated: 'REM stage is particularly associated with memory consolidation.'"
            },
            {
                "type": "true_false_not_given",
                "question": "The Harvard study involved more than 500 participants.",
                "answer": "NOT GIVEN",
                "explanation": "No information about the number of participants is provided."
            },
            {
                "type": "sentence_completion",
                "question": "Prolonged lack of sleep has been associated with conditions such as cardiovascular disease and ___.",
                "answer": "obesity / type 2 diabetes",
                "explanation": "Listed in the third paragraph."
            }
        ]
    },
    {
        "title": "Microplastics in the Environment",
        "text": """Microplastics — particles of plastic less than five millimetres in diameter — have
emerged as one of the most pervasive environmental contaminants of the modern era.
These tiny fragments are found in virtually every ecosystem on Earth, from the
deepest ocean trenches to the peaks of remote mountain ranges.

The primary sources of microplastics are the degradation of larger plastic items
and the direct release of micro-sized plastics from products such as synthetic
clothing fibres, tyres, and personal care products containing microbeads. When
synthetic fabrics are washed, thousands of microscopic fibres are released per
wash cycle, many of which pass through wastewater treatment systems and enter
waterways.

Research has demonstrated that microplastics are readily ingested by marine
organisms, from microscopic zooplankton to large marine mammals. These particles
can cause physical damage to digestive systems, interfere with feeding behaviour,
and act as vectors for other toxic chemicals. The particles accumulate through the
food chain in a process known as biomagnification, meaning that organisms at
higher trophic levels are exposed to greater concentrations.

The implications for human health remain an active area of research. Microplastics
have been detected in human blood, lung tissue, and even placental tissue.
While the full health impacts are not yet established, scientists are concerned
about potential inflammatory responses and the ability of plastics to carry
endocrine-disrupting chemicals into the body.""",
        "questions": [
            {
                "type": "multiple_choice",
                "question": "What does the passage say about synthetic clothing?",
                "options": [
                    "A. It is the sole source of microplastics in water",
                    "B. It releases fibres during washing that can enter waterways",
                    "C. It has been banned in several countries",
                    "D. It contains microbeads that are harmless"
                ],
                "answer": "B",
                "explanation": "Paragraph 2 directly states synthetic fibres are released during washing and enter waterways."
            },
            {
                "type": "true_false_not_given",
                "question": "Biomagnification means that apex predators accumulate less plastic than smaller animals.",
                "answer": "FALSE",
                "explanation": "The passage states organisms at higher trophic levels are exposed to GREATER concentrations."
            }
        ]
    }
]

IELTS_TIMING = {
    "academic_reading": {
        "total_minutes": 60,
        "passages": 3,
        "questions_each": 13,
        "tip": "Spend 20 minutes per passage. Skim the passage first, then read questions."
    }
}

READING_STRATEGIES = {
    "skimming": "Read headings, first/last sentences of paragraphs to get the gist. 2-3 mins per passage.",
    "scanning": "Look for specific information: names, dates, numbers. Don't read every word.",
    "true_false_not_given": [
        "NOT GIVEN means the information is not in the text — not that it's false",
        "Match statements to paragraphs first before answering",
        "Be careful with absolute words: always, never, all, none",
        "If you cannot find the information anywhere, it's NOT GIVEN"
    ],
    "matching_headings": [
        "Read all headings before matching",
        "Focus on the main idea of each paragraph, not details",
        "Watch out for distractors — headings that mention details but miss the main point",
        "Eliminate obviously wrong headings first"
    ],
    "sentence_completion": [
        "Identify the type of word needed: noun, verb, adjective",
        "Read around the gap in the original text",
        "Use NO MORE THAN the word limit specified",
        "Words must come exactly from the passage"
    ]
}


class IELTSReadingSession:
    """Manages IELTS reading practice sessions."""

    def __init__(self, engine):
        self.engine = engine

    def get_passage(self, topic: str = None) -> dict:
        if topic:
            passages = [p for p in READING_PASSAGES
                       if topic.lower() in p["title"].lower()]
            passage = passages[0] if passages else random.choice(READING_PASSAGES)
        else:
            passage = random.choice(READING_PASSAGES)

        return {
            "title": passage["title"],
            "text": passage["text"],
            "question_count": len(passage["questions"]),
            "questions": [
                {
                    "number": i + 1,
                    "type": q["type"],
                    "question": q["question"],
                    "options": q.get("options"),
                }
                for i, q in enumerate(passage["questions"])
            ],
            "time_suggested_minutes": 20,
            "strategies": READING_STRATEGIES
        }

    def check_answers(self, passage_title: str, answers: dict) -> dict:
        passage = next(
            (p for p in READING_PASSAGES if p["title"] == passage_title), None
        )
        if not passage:
            return {"error": "Passage not found"}

        results = []
        correct = 0
        for i, q in enumerate(passage["questions"]):
            user_ans = answers.get(str(i + 1), "").strip().upper()
            correct_ans = q["answer"].strip().upper()
            is_correct = user_ans == correct_ans
            if is_correct:
                correct += 1
            results.append({
                "question_number": i + 1,
                "type": q["type"],
                "question": q["question"],
                "your_answer": answers.get(str(i + 1), "Not answered"),
                "correct_answer": q["answer"],
                "is_correct": is_correct,
                "explanation": q["explanation"]
            })

        total = len(passage["questions"])
        score_pct = (correct / total) * 100 if total else 0
        if score_pct >= 90:
            band = 8.5
        elif score_pct >= 80:
            band = 7.5
        elif score_pct >= 70:
            band = 6.5
        elif score_pct >= 60:
            band = 6.0
        elif score_pct >= 50:
            band = 5.5
        else:
            band = 5.0

        self.engine.record_band_score("reading", band)
        return {
            "score": correct,
            "total": total,
            "percentage": round(score_pct, 1),
            "estimated_band": band,
            "results": results
        }

    def get_strategy_guide(self, question_type: str) -> dict:
        strategy = READING_STRATEGIES.get(question_type, [])
        return {
            "question_type": question_type,
            "strategies": strategy if isinstance(strategy, list) else [strategy]
        }
