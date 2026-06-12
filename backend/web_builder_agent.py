import json
import asyncio
from enum import Enum
from typing import Optional
from google import genai

class WebsiteType(Enum):
    PORTFOLIO = "portfolio"
    LANDING_PAGE = "landing_page"
    ECOMMERCE = "ecommerce"
    BLOG = "blog"
    SAAS = "saas"
    RESTAURANT = "restaurant"
    AGENCY = "agency"
    DOCUMENTATION = "documentation"
    EVENT = "event"
    NONPROFIT = "nonprofit"
    REAL_ESTATE = "real_estate"
    EDUCATION = "education"
    OTHER = "other"

class BuilderPlatform(Enum):
    AI_STUDIO = "ai_studio"

QUESTION_TREE = {
    "universal": [
        {
            "id": "website_type",
            "question": "What type of website do you want? For example: portfolio, landing page, online store, blog, SaaS app, restaurant site, or something else?",
            "extract_key": "type",
            "required": True
        },
        {
            "id": "website_name",
            "question": "What's the name or brand for this website?",
            "extract_key": "name",
            "required": True
        },
        {
            "id": "website_purpose",
            "question": "In one sentence, what's the main goal? What should visitors do when they land on it?",
            "extract_key": "purpose",
            "required": True
        },
    ],
}

BUILDER_CONFIGS = {
    BuilderPlatform.AI_STUDIO: {
        "name": "Google AI Studio",
        "url": "https://aistudio.google.com/prompts/new_chat",
        "strengths": ["best Gemini models", "direct code output", "free tier available"],
    },
}

DEFAULTS_BY_TYPE = {
    "portfolio": {
        "design_style": "Modern and minimal with a clean, professional feel",
        "colors": "Dark navy (#1a1a2e) with warm accent (#e94560) and light text (#f5f5f5)",
        "sections": "Hero with name/title, project showcase grid, about me, skills, contact",
        "layout": "Full-width hero, card-based project grid, two-column about section",
    },
    "landing_page": {
        "design_style": "Bold and conversion-focused with clear visual hierarchy",
        "colors": "Clean white (#ffffff) with brand blue (#2563eb) and dark text (#1e293b)",
        "sections": "Hero with CTA, feature highlights, social proof/testimonials, pricing, FAQ",
        "layout": "Single-page scroll with sticky header, alternating sections, prominent CTA buttons",
    },
    "ecommerce": {
        "design_style": "Clean and shoppable with strong product focus",
        "colors": "Warm neutral (#f8f5f0) with forest green (#2d6a4f) and dark text (#1a1a1a)",
        "sections": "Hero banner, product grid with filters, category showcase, featured products, newsletter",
        "layout": "Masonry product grid, sidebar filters, quick-add cards, seamless checkout flow",
    },
    "saas": {
        "design_style": "Modern tech-forward with dashboard aesthetics",
        "colors": "Dark mode (#0f172a) with accent gradient (#6366f1 to #8b5cf6)",
        "sections": "Hero, features grid, how-it-works, pricing tiers, testimonials, dashboard mockup",
        "layout": "Split-screen hero, icon-based feature cards, tiered pricing table, interactive demo section",
    },
    "restaurant": {
        "design_style": "Warm and appetizing with rich food photography",
        "colors": "Warm beige (#faf3e0) with terracotta (#c75b39) and dark brown (#3e2723)",
        "sections": "Hero with food imagery, menu/categories, about the chef, location/map, reservations",
        "layout": "Full-width hero with parallax, tabbed menu, gallery grid, embedded map, reservation form",
    },
    "blog": {
        "design_style": "Clean editorial with excellent typography and readability",
        "colors": "Pure white (#ffffff) with charcoal (#1a1a1a) and accent (#6366f1)",
        "sections": "Featured posts, category grid, article list with excerpts, newsletter signup, author sidebar",
        "layout": "Magazine-style grid, card-based article layout, sticky sidebar, infinite scroll",
    },
    "agency": {
        "design_style": "Premium and trustworthy with bold typography",
        "colors": "Deep charcoal (#1e1e2f) with gold accent (#d4a373) and off-white (#f8f9fa)",
        "sections": "Hero, services, case studies/work, team, process, testimonials, contact",
        "layout": "Full-width sections, case study cards with hover effects, team photo grid, timeline process",
    },
}

FALLBACK_DEFAULTS = {
    "design_style": "Modern and clean with excellent visual hierarchy",
    "colors": "White (#ffffff) with slate blue (#475569) and accent (#3b82f6)",
    "sections": "Hero, features, about, contact",
    "layout": "Clean single-page layout with smooth scroll sections",
}


class WebBuilderAgent:
    def __init__(self, sio, gemini_client=None):
        self.sio = sio
        self.gemini_client = gemini_client
        self.session_data = {}
        self.current_question_index = 0
        self.question_queue = []
        self.interview_phase = "not_started"
        self.selected_builder = BuilderPlatform.AI_STUDIO
        self.generated_prompt = None
        self.build_status = "idle"

    def start_interview(self):
        self.session_data = {}
        self.interview_phase = "universal"
        self.question_queue = list(QUESTION_TREE["universal"])
        self.current_question_index = 0
        first_q = self.question_queue[0]
        return first_q["question"]

    def process_answer(self, answer: str) -> dict:
        if self.current_question_index < len(self.question_queue):
            current_q = self.question_queue[self.current_question_index]
            self.session_data[current_q["extract_key"]] = answer
            if self.current_question_index == 0:
                detected_type = self._resolve_website_type(answer)
                self.session_data["resolved_type"] = detected_type
                self._apply_defaults(detected_type)
        self.current_question_index += 1
        if self.current_question_index >= len(self.question_queue):
            self.interview_phase = "complete"
            return {"status": "interview_complete", "question": None, "question_id": "done", "progress": 1.0}
        next_q = self.question_queue[self.current_question_index]
        return {"status": "next_question", "question": next_q["question"], "question_id": next_q["id"], "progress": self.current_question_index / len(self.question_queue)}

    def _apply_defaults(self, website_type: str):
        defaults = DEFAULTS_BY_TYPE.get(website_type, FALLBACK_DEFAULTS)
        for key, value in defaults.items():
            self.session_data[key] = value

    def _resolve_website_type(self, answer: str) -> str:
        answer_lower = answer.lower()
        type_keywords = {
            "portfolio": ["portfolio", "personal site", "my work", "showcase"],
            "landing_page": ["landing", "launch", "product page", "coming soon", "waitlist"],
            "ecommerce": ["store", "shop", "ecommerce", "e-commerce", "sell", "products"],
            "blog": ["blog", "articles", "writing", "posts", "journal"],
            "saas": ["saas", "software", "app", "dashboard", "platform", "tool"],
            "restaurant": ["restaurant", "cafe", "food", "menu", "bakery", "coffee"],
            "agency": ["agency", "studio", "firm", "consultancy", "consulting"],
            "documentation": ["docs", "documentation", "wiki", "knowledge base"],
            "event": ["event", "conference", "wedding", "meetup", "festival"],
            "nonprofit": ["nonprofit", "charity", "ngo", "foundation", "cause"],
            "real_estate": ["real estate", "property", "housing", "apartment", "rental"],
            "education": ["education", "course", "school", "tutorial", "learning"],
        }
        for wtype, keywords in type_keywords.items():
            if any(kw in answer_lower for kw in keywords):
                return wtype
        return "other"

    async def generate_builder_prompt(self) -> str:
        meta_prompt = f"""You are an expert front-end developer. Generate a complete, production-quality single-page HTML website based on the following requirements.

CLIENT REQUIREMENTS:
{json.dumps(self.session_data, indent=2)}

RULES:
1. Output ONLY the raw HTML code. No explanations, no markdown formatting, no code blocks.
2. Include ALL CSS embedded in a <style> tag in the <head>.
3. Include ALL JavaScript embedded in a <script> tag at the end of <body>.
4. Use Google Fonts for typography.
5. Make it fully responsive with CSS media queries.
6. Include smooth scroll and subtle animations.
7. Use realistic placeholder text and free images (picsum.photos).
8. Include proper SEO meta tags and Open Graph tags.
9. Ensure WCAG accessibility attributes.
10. The page must look polished and professional.

Generate the COMPLETE self-contained HTML file."""
        try:
            client = self.gemini_client or genai.Client()
            response = await client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=meta_prompt,
            )
            self.generated_prompt = response.text.strip()
            return self.generated_prompt
        except Exception:
            self.generated_prompt = self._build_fallback_html()
            return self.generated_prompt

    def compose_ai_studio_prompt(self) -> str:
        d = self.session_data
        parts = [
            f"Build a {d.get('type', 'modern')} website called \"{d.get('name', 'My Website')}\".",
            f"\nGoal: {d.get('purpose', 'Professional web presence')}",
            f"\nDesign Style: {d.get('design_style', 'Modern and clean')}",
            f"\nColor Scheme: {d.get('colors', 'Professional palette')}",
            f"\nSections: {d.get('sections', 'Hero, about, features, contact')}",
            f"\nLayout: {d.get('layout', 'Modern single-page layout')}",
        ]
        skip_keys = {'type', 'name', 'purpose', 'resolved_type'}
        for key, value in d.items():
            if key not in skip_keys and value:
                readable_key = key.replace('_', ' ').title()
                parts.append(f"\n{readable_key}: {value}")
        parts.append("\n\nGenerate a single complete HTML file with embedded CSS and JavaScript. Make it responsive, accessible, and production-ready.")
        return "\n".join(parts)

    def _build_fallback_html(self) -> str:
        d = self.session_data
        name = d.get('name', 'My Website')
        style = d.get('design_style', 'Modern')
        sections = d.get('sections', 'Hero, about, features, contact')
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{name}</title>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: 'Inter', sans-serif; background: #fff; color: #333; line-height: 1.6; }}
.container {{ max-width: 1200px; margin: 0 auto; padding: 0 20px; }}
.hero {{ min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }}
h1 {{ font-size: 3rem; margin-bottom: 1rem; }}
p {{ font-size: 1.2rem; opacity: 0.9; }}
</style>
</head>
<body>
<section class="hero">
<div class="container">
<h1>{name}</h1>
<p>A {style} website with: {sections}</p>
</div>
</section>
</body>
</html>"""

    def get_builder_url(self) -> str:
        return BUILDER_CONFIGS[self.selected_builder]["url"]

    def get_builder_config(self) -> dict:
        return BUILDER_CONFIGS[self.selected_builder]

    def get_session_summary(self) -> dict:
        return {
            "session_data": self.session_data,
            "selected_builder": self.selected_builder.value if self.selected_builder else None,
            "builder_url": self.get_builder_url() if self.selected_builder else None,
            "prompt_generated": self.generated_prompt is not None,
            "prompt_length": len(self.generated_prompt) if self.generated_prompt else 0,
            "interview_phase": self.interview_phase,
        }
