import os
import asyncio
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

LANGUAGE_CODES = {
    "en": "English",
    "bn": "Bengali",
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "ar": "Arabic",
    "pt": "Portuguese",
    "ru": "Russian",
    "ta": "Tamil",
    "te": "Telugu",
    "mr": "Marathi",
    "gu": "Gujarati",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "th": "Thai",
    "vi": "Vietnamese",
    "id": "Indonesian",
    "ms": "Malay",
    "tr": "Turkish",
    "it": "Italian",
    "nl": "Dutch",
    "pl": "Polish",
    "sv": "Swedish",
    "da": "Danish",
    "no": "Norwegian",
    "fi": "Finnish",
    "el": "Greek",
    "he": "Hebrew",
    "cs": "Czech",
    "ro": "Romanian",
    "hu": "Hungarian",
    "uk": "Ukrainian"
}

class TranslationAgent:
    def __init__(self):
        self.client = None
        self.user_native_lang = os.getenv("USER_NATIVE_LANG", "en")
        self.model = "gemini-2.0-flash"
        if GEMINI_API_KEY:
            try:
                self.client = genai.Client(http_options={"api_version": "v1beta"}, api_key=GEMINI_API_KEY)
            except Exception as e:
                print(f"[TranslationAgent] Failed to init Gemini client: {e}")
        else:
            print("[TranslationAgent] No GEMINI_API_KEY set. Translation disabled.")
    
    def detect_language(self, text):
        if not text or len(text.strip()) < 2:
            return "en"

        text_sample = text[:100]

        tamil_chars = len([c for c in text_sample if '\u0B80' <= c <= '\u0BFF'])
        telugu_chars = len([c for c in text_sample if '\u0C00' <= c <= '\u0C7F'])
        bengali_chars = len([c for c in text_sample if '\u0980' <= c <= '\u09FF'])
        hindi_chars = len([c for c in text_sample if '\u0900' <= c <= '\u097F'])
        kannada_chars = len([c for c in text_sample if '\u0C80' <= c <= '\u0CFF'])
        malayalam_chars = len([c for c in text_sample if '\u0D00' <= c <= '\u0D7F'])
        gujarati_chars = len([c for c in text_sample if '\u0A80' <= c <= '\u0AFF'])
        arabic_chars = len([c for c in text_sample if '\u0600' <= c <= '\u06FF'])
        thai_chars = len([c for c in text_sample if '\u0E00' <= c <= '\u0E7F'])
        chinese_chars = len([c for c in text_sample if '\u4E00' <= c <= '\u9FFF'])
        japanese_chars = len([c for c in text_sample if '\u3040' <= c <= '\u30FF'])
        korean_chars = len([c for c in text_sample if '\uAC00' <= c <= '\uD7AF'])
        cyrillic_chars = len([c for c in text_sample if '\u0400' <= c <= '\u04FF'])

        threshold = 0.15  # Lower threshold for better detection
        text_len = max(len(text_sample), 1)

        # Check all Indian languages first
        if tamil_chars > text_len * threshold:
            return "ta"
        elif telugu_chars > text_len * threshold:
            return "te"
        elif bengali_chars > text_len * threshold:
            return "bn"
        elif hindi_chars > text_len * threshold:
            return "hi"
        elif kannada_chars > text_len * threshold:
            return "kn"
        elif malayalam_chars > text_len * threshold:
            return "ml"
        elif gujarati_chars > text_len * threshold:
            return "gu"
        elif arabic_chars > text_len * threshold:
            return "ar"
        elif thai_chars > text_len * threshold:
            return "th"
        elif chinese_chars > text_len * threshold:
            return "zh"
        elif japanese_chars > text_len * threshold:
            return "ja"
        elif korean_chars > text_len * threshold:
            return "ko"
        elif cyrillic_chars > text_len * threshold:
            return "ru"

        return "en"
    
    async def detect_language_async(self, text):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.detect_language, text)
    
    def translate_to_english(self, text, source_lang=None):
        if not source_lang:
            source_lang = self.detect_language(text)
        
        if source_lang == "en":
            return text, "en"
        
        if not self.client:
            return text, source_lang
        
        source_name = LANGUAGE_CODES.get(source_lang, source_lang)
        
        prompt = f"""Translate the following {source_name} text to English. 
Only output the translation, nothing else.

Text: {text}"""
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=[prompt]
            )
            translated = response.text.strip()
            return translated, source_lang
        except Exception as e:
            print(f"[TranslationAgent] Error translating to English: {e}")
            return text, source_lang
    
    async def translate_to_english_async(self, text, source_lang=None):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.translate_to_english, text, source_lang)
    
    def translate_from_english(self, text, target_lang=None):
        if not target_lang:
            target_lang = self.user_native_lang
        
        if target_lang == "en":
            return text
        
        if not self.client:
            return text
        
        target_name = LANGUAGE_CODES.get(target_lang, target_lang)
        
        prompt = f"""Translate the following English text to {target_name}.
Only output the translation, nothing else.

Text: {text}"""
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=[prompt]
            )
            translated = response.text.strip()
            return translated
        except Exception as e:
            print(f"[TranslationAgent] Error translating from English: {e}")
            return text
    
    async def translate_from_english_async(self, text, target_lang=None):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.translate_from_english, text, target_lang)
    
    def set_native_language(self, lang_code):
        if lang_code in LANGUAGE_CODES:
            self.user_native_lang = lang_code
            return True
        return False
    
    def get_native_language(self):
        return self.user_native_lang
    
    def get_language_name(self, code=None):
        if code is None:
            code = self.user_native_lang
        return LANGUAGE_CODES.get(code, code)

translation_agent = TranslationAgent()