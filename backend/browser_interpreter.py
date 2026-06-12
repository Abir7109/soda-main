import asyncio
import io
import os
import sys
from contextlib import redirect_stdout
from pathlib import Path

from logger import get_logger

logger = get_logger("browser_interpreter")


def _load_api_key():
    key = os.environ.get("GOOGLE_AI_STUDIO_KEY") or os.environ.get("GEMINI_API_KEY")
    if key:
        os.environ["GEMINI_API_KEY"] = key
        return True
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip().strip('"').strip("'")
                if k in ("GOOGLE_AI_STUDIO_KEY", "GEMINI_API_KEY"):
                    os.environ["GEMINI_API_KEY"] = v
                    return True
    return False


def _init_interpreter():
    if not _load_api_key():
        logger.warning("No GEMINI_API_KEY or GOOGLE_AI_STUDIO_KEY found in env or .env")
    try:
        from interpreter import interpreter
        interpreter.llm.model = "gemini/gemini-2.5-flash"
        interpreter.os = True
        interpreter.vision = True
        interpreter.auto_run = True
        return interpreter
    except ImportError:
        logger.error("open-interpreter not installed. Run: pip install open-interpreter")
        return None
    except Exception as e:
        logger.error(f"Failed to init Open Interpreter: {e}")
        return None


_interpreter = None


def _get_interpreter():
    global _interpreter
    if _interpreter is None:
        _interpreter = _init_interpreter()
    return _interpreter


def _run_chat(command: str) -> str:
    interp = _get_interpreter()
    if interp is None:
        return "ERROR: Open Interpreter not available"
    try:
        with redirect_stdout(io.StringIO()):
            result = interp.chat(command)
        return str(result or "")
    except Exception as e:
        logger.error(f"Interpreter chat failed: {e}")
        return f"ERROR: {e}"


class BrowserInterpreter:
    def __init__(self, sio):
        self.sio = sio

    async def run(self, command: str) -> str:
        logger.info(f"Interpreter: {command[:80]}")
        return await asyncio.to_thread(_run_chat, command)

    async def open_url(self, url: str, builder_name: str) -> str:
        return await self.run(
            f"Open Google Chrome and go to {url}. "
            f"Wait for the page to load completely."
        )

    async def click_prompt_area(self, builder_name: str) -> str:
        return await self.run(
            f"Look at the {builder_name} page on screen. "
            f"Find the large text input area where I type a website description prompt. "
            f"It's usually a big textarea in the center of the page. "
            f"Click on it to focus it."
        )

    async def press_enter(self) -> str:
        import pyautogui
        pyautogui.press('enter')
        return "Enter pressed"

    async def open_local_file(self, filepath: str) -> str:
        path = filepath.replace('\\', '/')
        file_url = f"file:///{path}"
        return await self.run(
            f"Open Google Chrome and navigate to {file_url}. "
            f"Wait for the page to load completely."
        )

    async def check_build_status(self, builder_name: str) -> str:
        return await self.run(
            f"Look at the {builder_name} page on my screen. "
            f"Is the website being built, is there a finished preview, "
            f"is it asking me to sign in, or is there an error? "
            f"Reply with one word only: BUILDING, COMPLETE, SIGN_IN, or ERROR. "
            f"Then on a new line give a one-sentence description of what you see."
        )
