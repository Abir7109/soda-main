"""
SODA IELTS Writing Module
Essay submission, band scoring, detailed feedback
"""

import json
import random
import time
from datetime import datetime
from pathlib import Path

WRITING_HISTORY = Path("backend/ielts_data/writing_history.jsonl")

TASK2_PROMPTS = [
    {
        "type": "opinion",
        "prompt": (
            "Some people believe that university education should be free for all students, "
            "while others argue that students should pay tuition fees. "
            "Discuss both views and give your own opinion."
        ),
        "keywords": ["education", "university", "tuition fees", "funding", "government"]
    },
    {
        "type": "problem_solution",
        "prompt": (
            "In many countries, the number of people choosing to live alone has increased "
            "significantly in recent years. "
            "What are the reasons for this trend? What are the advantages and disadvantages?"
        ),
        "keywords": ["individualism", "urbanization", "loneliness", "independence", "social"]
    },
    {
        "type": "agree_disagree",
        "prompt": (
            "Technology has made it possible for people to work from home. "
            "This has more advantages than disadvantages. "
            "To what extent do you agree or disagree?"
        ),
        "keywords": ["remote work", "productivity", "work-life balance", "isolation", "flexibility"]
    },
    {
        "type": "discussion",
        "prompt": (
            "Some people think that environmental problems are too big for individuals to "
            "solve, while others believe that it is up to individuals, not governments, "
            "to take action. Discuss both views and give your opinion."
        ),
        "keywords": ["environment", "climate change", "individual responsibility", "policy", "sustainability"]
    },
    {
        "type": "advantages_disadvantages",
        "prompt": (
            "Many cities around the world are growing quickly. "
            "What problems does rapid urbanization cause? "
            "How can these problems be solved?"
        ),
        "keywords": ["urbanization", "infrastructure", "housing", "pollution", "migration"]
    }
]

TASK1_ACADEMIC_PROMPTS = [
    {
        "type": "bar_chart",
        "description": (
            "The bar chart below shows the percentage of people in different age groups "
            "who used social media platforms daily in the UK in 2022."
        ),
        "data_summary": (
            "18-24: 89%, 25-34: 78%, 35-44: 65%, 45-54: 51%, 55-64: 38%, 65+: 22%"
        )
    },
    {
        "type": "line_graph",
        "description": (
            "The graph below shows the number of international tourists visiting "
            "three countries between 2000 and 2020."
        ),
        "data_summary": (
            "France: steady at ~80M; Thailand: rose from 10M to 40M; "
            "UAE: rose from 5M to 21M"
        )
    }
]

ESSAY_STRUCTURE_TEMPLATES = {
    "opinion": [
        "Introduction: Paraphrase + clear thesis (your opinion)",
        "Body 1: First reason supporting your view + example",
        "Body 2: Second reason + example OR concession + counter",
        "Conclusion: Restate thesis + broader implication"
    ],
    "discussion": [
        "Introduction: Paraphrase + outline statement (both views + your opinion)",
        "Body 1: First viewpoint + reasons + example",
        "Body 2: Second viewpoint + reasons + example",
        "Body 3 (optional): Your opinion if not covered above",
        "Conclusion: Summarize + your final position"
    ],
    "problem_solution": [
        "Introduction: Paraphrase + outline (causes/solutions)",
        "Body 1: Causes with explanation",
        "Body 2: Solutions with explanation",
        "Conclusion: Summary + outlook"
    ],
    "advantages_disadvantages": [
        "Introduction: Paraphrase + outline",
        "Body 1: Advantages with examples",
        "Body 2: Disadvantages with examples",
        "Conclusion: Balanced summary + opinion if asked"
    ]
}

HIGH_SCORING_PHRASES = {
    "introduction": [
        "It is a widely held belief that...",
        "There is ongoing debate regarding...",
        "In recent decades, there has been a notable shift in...",
        "The question of whether... has sparked considerable discussion."
    ],
    "adding_argument": [
        "Furthermore,", "What is more,", "In addition to this,",
        "Beyond this,", "A further consideration is that,"
    ],
    "contrasting": [
        "However,", "Nevertheless,", "Despite this,",
        "Notwithstanding the above,", "On the contrary,"
    ],
    "giving_examples": [
        "For instance,", "A case in point is", "This is exemplified by",
        "To illustrate,", "Consider, for example,"
    ],
    "conclusion": [
        "In conclusion,", "To sum up,", "On balance,",
        "Having considered both perspectives,",
        "All things considered,"
    ]
}


class IELTSWritingAnalyzer:
    """Analyzes and scores IELTS writing submissions."""

    def __init__(self, engine):
        self.engine = engine

    def get_random_task2(self) -> dict:
        task = random.choice(TASK2_PROMPTS)
        return {
            "task": "Task 2",
            "type": task["type"],
            "prompt": task["prompt"],
            "time_allowed": "40 minutes",
            "minimum_words": 250,
            "structure_guide": ESSAY_STRUCTURE_TEMPLATES.get(task["type"], []),
            "key_vocabulary": task["keywords"]
        }

    def get_random_task1(self, test_type: str = "academic") -> dict:
        if test_type == "academic":
            task = random.choice(TASK1_ACADEMIC_PROMPTS)
            return {
                "task": "Task 1",
                "type": task["type"],
                "description": task["description"],
                "data": task["data_summary"],
                "time_allowed": "20 minutes",
                "minimum_words": 150,
                "tips": [
                    "Start with an overview paragraph — describe the main trend",
                    "Select and compare key data — don't list every number",
                    "Use approximation language: approximately, roughly, around",
                    "Use appropriate vocabulary: peaked, plateaued, declined sharply"
                ]
            }

    def build_evaluation_prompt(self, essay: str, task_prompt: str,
                                 task_type: str) -> str:
        word_count = len(essay.split())
        return f"""You are a senior IELTS examiner with expertise in writing assessment.
Evaluate this IELTS Writing Task 2 essay using the OFFICIAL IELTS band descriptors.

TASK PROMPT: {task_prompt}
ESSAY TYPE: {task_type}
WORD COUNT: {word_count}
CANDIDATE ESSAY:
---
{essay}
---

Provide your evaluation in this EXACT JSON format:
{{
  "word_count": {word_count},
  "band_scores": {{
    "task_achievement": <1-9>,
    "coherence_cohesion": <1-9>,
    "lexical_resource": <1-9>,
    "grammatical_range": <1-9>
  }},
  "overall_band": <average rounded to nearest 0.5>,
  "task_achievement_feedback": {{
    "addressed_all_parts": <true/false>,
    "position_clear": <true/false>,
    "fully_developed": <true/false>,
    "comments": "specific feedback"
  }},
  "coherence_feedback": {{
    "paragraph_structure": "feedback on structure",
    "cohesive_devices_used": ["list of devices found"],
    "missing_elements": ["what's missing"],
    "comments": "specific feedback"
  }},
  "vocabulary_analysis": {{
    "sophisticated_words_used": ["list of good vocab found"],
    "overused_words": ["words used too many times"],
    "errors": [
      {{"wrong": "collocation used", "correct": "correct collocation"}}
    ],
    "upgrade_suggestions": [
      {{"used": "simple word", "academic_alternative": "sophisticated word"}}
    ]
  }},
  "grammar_analysis": {{
    "error_count": <number>,
    "errors": [
      {{
        "original": "exact sentence with error",
        "corrected": "corrected sentence",
        "error_type": "tense/article/preposition/agreement/word form"
      }}
    ],
    "sentence_variety": "feedback on sentence structure variety"
  }},
  "specific_improvements": [
    {{
      "priority": 1,
      "area": "which criterion",
      "issue": "specific problem",
      "before": "exact text from essay",
      "after": "improved version",
      "band_gain": "from X to Y"
    }}
  ],
  "model_introduction": "Write a Band 8+ introduction for this exact prompt",
  "overall_comment": "2-3 sentence examiner summary",
  "band7_checklist": [
    "specific thing 1 to do to reach Band 7",
    "specific thing 2",
    "specific thing 3"
  ]
}}

Be a strict, honest examiner. Do not inflate scores. Quote directly from the essay."""

    def save_writing_session(self, essay: str, prompt: str,
                              evaluation: dict, task_type: str):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "task_type": task_type,
            "prompt": prompt,
            "essay": essay,
            "evaluation": evaluation,
            "overall_band": evaluation.get("overall_band", 0)
        }
        with open(WRITING_HISTORY, "a") as f:
            f.write(json.dumps(entry) + "\n")
        self.engine.record_band_score(
            "writing",
            evaluation.get("overall_band", 0),
            evaluation.get("band_scores", {})
        )
