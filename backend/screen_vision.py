"""
Screen vision tools: capture the screen, send to Gemini Flash with a prompt,
return the model's text analysis. Uses the regular (non-Live) Gemini API.
"""
import os
import base64
import time
import asyncio
from pathlib import Path
from datetime import datetime
from PIL import Image
import io

VISION_DIR = Path("projects/clipboard").resolve()
VISION_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_VISION_MODEL = "gemini-2.0-flash"


async def capture_screenshot() -> bytes | None:
    cap = _capture_screenshot_bytes()
    if cap:
        return cap[0]
    return None


def _capture_screenshot_bytes() -> tuple[bytes, int, int] | None:
    """Take a screenshot, return (raw_bytes, width, height) or None on error."""
    try:
        import mss
        with mss.mss() as sct:
            monitor = sct.monitors[1]
            img = sct.grab(monitor)
            png_bytes = mss.tools.to_png(img.rgb, img.size)
            return png_bytes, img.size[0], img.size[1]
    except Exception as e:
        print(f"[screen_vision] screenshot failed: {e}")
        return None


def _save_screenshot(png_bytes: bytes) -> str:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    p = VISION_DIR / f"vision_{ts}.png"
    p.write_bytes(png_bytes)
    return str(p)


def _resize_if_large(png_bytes: bytes, max_dim: int = 1024) -> tuple[bytes, int, int]:
    """Resize PNG to keep one side under max_dim. Returns (jpeg_bytes, w, h)."""
    try:
        img = Image.open(io.BytesIO(png_bytes))
        img = img.convert("RGB")
        w, h = img.size
        if max(w, h) > max_dim:
            if w >= h:
                new_w = max_dim
                new_h = int(h * max_dim / w)
            else:
                new_h = max_dim
                new_w = int(w * max_dim / h)
            img = img.resize((new_w, new_h), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return buf.getvalue(), img.size[0], img.size[1]
    except Exception as e:
        print(f"[screen_vision] resize failed: {e}")
        return png_bytes, 0, 0


def _get_genai_client():
    """Lazy-init the google-genai client. Uses GEMINI_API_KEY from env."""
    try:
        from google import genai
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return None
        return genai.Client(api_key=api_key)
    except ImportError:
        return None
    except Exception as e:
        print(f"[screen_vision] client init failed: {e}")
        return None


async def analyze_screen(prompt: str = "Describe what is on the screen in detail.", model: str = DEFAULT_VISION_MODEL, screenshot: bytes | None = None) -> dict:
    """
    Capture the screen, send to Gemini vision with `prompt`, return text analysis.
    Use cases: 'what's on my screen', 'summarize the page', 'read the error', 'describe the UI'.
    If `screenshot` is provided (raw PNG bytes), skips the internal screen capture.
    """
    if screenshot is not None:
        png_bytes = screenshot
    else:
        cap = _capture_screenshot_bytes()
        if not cap:
            return {"success": False, "error": "Screenshot capture failed"}
        png_bytes, w, h = cap

    jpeg_bytes, rw, rh = _resize_if_large(png_bytes, max_dim=1024)
    saved_path = _save_screenshot(png_bytes)

    client = _get_genai_client()
    if not client:
        return {"success": False, "error": "GEMINI_API_KEY not set or google-genai not installed", "screenshot": saved_path}

    b64 = base64.b64encode(jpeg_bytes).decode("ascii")

    t0 = time.time()
    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=model,
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": "image/jpeg", "data": b64}}
                    ]
                }
            ]
        )
        text = response.text or ""
        elapsed_ms = int((time.time() - t0) * 1000)
        return {
            "success": True,
            "prompt": prompt,
            "model": model,
            "analysis": text,
            "screenshot": saved_path,
            "width": rw,
            "height": rh,
            "elapsed_ms": elapsed_ms,
        }
    except Exception as e:
        return {"success": False, "error": str(e), "screenshot": saved_path}


async def read_screen_text(model: str = DEFAULT_VISION_MODEL) -> dict:
    """
    Capture the screen and ask Gemini to extract ALL visible text.
    Use cases: 'read the screen', 'OCR this', 'copy text from screen', 'what does the error say'.
    """
    return await analyze_screen(
        prompt=(
            "Read all the text visible on this screen. Output it as a clean transcription: "
            "preserve structure (headings, bullet points, code blocks) but skip UI chrome like "
            "menus, toolbars, and window borders. If there's an error message, include it verbatim. "
            "If there's no readable text, say 'No text visible'."
        ),
        model=model,
    )
