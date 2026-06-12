import asyncio
import re
import time
from pathlib import Path
from typing import Optional

from web_builder_agent import WebBuilderAgent, BUILDER_CONFIGS
from browser_interpreter import BrowserInterpreter
from logger import get_logger

logger = get_logger("web_builder_orchestrator")


class WebBuilderOrchestrator:
    def __init__(self, sio, gemini_client=None):
        self.sio = sio
        self.agent = WebBuilderAgent(sio, gemini_client)
        self.browser = BrowserInterpreter(sio)
        self.state = "idle"
        self._build_task: Optional[asyncio.Task] = None
        self._build_started = False

    async def start_website_project(self) -> dict:
        self._build_started = False
        self.state = "interviewing"
        first_question = self.agent.start_interview()
        await self.sio.emit("web_builder_status", {
            "phase": "interview_started",
            "message": "Starting website project interview...",
        })
        return {"result": first_question}

    async def process_answer(self, answer: str) -> dict:
        if self._build_started or self.state in ("preparing", "monitoring", "complete"):
            return {"result": "Already working on it! Just wait a moment."}
        result = self.agent.process_answer(answer)
        if result["status"] == "interview_complete":
            self._build_started = True
            self.state = "preparing"
            asyncio.create_task(self._prepare_and_build())
            return {"result": "On it! Opening Lovable now to build your website. Just sit tight."}
        return {"result": result["question"]}

    async def _prepare_and_build(self):
        self.state = "preparing"
        builder_config = BUILDER_CONFIGS[self.agent.selected_builder]
        builder_name = builder_config["name"]
        await self.sio.emit("web_builder_status", {
            "phase": "generating_website",
            "message": "Generating your website with Gemini...",
            "builder": builder_name,
        })
        html_code = await self.agent.generate_builder_prompt()
        await self.sio.emit("web_builder_status", {
            "phase": "code_ready",
            "message": f"Website code generated! ({len(html_code)} chars). Opening {builder_name}...",
        })
        self._build_task = asyncio.create_task(
            self._run_build_automation(builder_config, html_code)
        )

    async def _run_build_automation(self, builder_config: dict, html_code: str):
        builder_name = builder_config["name"]
        try:
            # 1. Save HTML to output directory
            website_name = self.agent.session_data.get("name", "my-website")
            sanitized = re.sub(r'[^\w\s-]', '', website_name).strip().lower()
            sanitized = re.sub(r'[\s-]+', '-', sanitized)
            output_dir = Path(__file__).resolve().parent.parent / "output" / f"site-{sanitized}"
            output_dir.mkdir(parents=True, exist_ok=True)
            html_path = output_dir / "index.html"
            html_path.write_text(html_code, encoding="utf-8")
            await self.sio.emit("web_builder_status", {
                "phase": "saved_html",
                "message": f"Website saved to {html_path}",
            })

            # 2. Open AI Studio
            await self.sio.emit("web_builder_status", {
                "phase": "opening_ai_studio", "message": f"Opening {builder_name}..."
            })
            await self.browser.open_url(builder_config["url"], builder_name)
            await asyncio.sleep(3)

            # 3. Compose and paste NL prompt into AI Studio
            nl_prompt = self.agent.compose_ai_studio_prompt()
            await self.sio.emit("web_builder_status", {
                "phase": "pasting_prompt", "message": f"Pasting prompt into AI Studio ({len(nl_prompt)} chars)..."
            })
            import pyperclip
            pyperclip.copy(nl_prompt)
            await asyncio.sleep(0.2)
            import pyautogui
            pyautogui.hotkey('ctrl', 'v')
            await asyncio.sleep(0.5)

            # 4. Submit
            await self.sio.emit("web_builder_status", {
                "phase": "submitting", "message": "Submitting prompt to Gemini..."
            })
            await self.browser.press_enter()
            await asyncio.sleep(1)

            # 5. Open local HTML in browser for preview
            await self.browser.open_local_file(str(html_path))

            # 6. Done
            self.state = "complete"
            await self.sio.emit("web_builder_status", {
                "phase": "complete",
                "message": f"Website '{website_name}' is ready! AI Studio is generating the code in your browser. The local file has been opened for preview.",
                "file_path": str(html_path),
            })
        except asyncio.CancelledError:
            self.state = "cancelled"
            await self.sio.emit("web_builder_status", {"phase": "cancelled", "message": "Website building was cancelled."})
        except Exception as e:
            logger.error(f"Build automation failed: {e}")
            self.state = "error"
            await self._emit_failure(str(e))

    async def _emit_failure(self, message: str):
        await self.sio.emit("web_builder_status", {"phase": "error", "message": message, "timestamp": time.time()})

    def get_session_summary(self) -> dict:
        return self.agent.get_session_summary()

    async def check_build_status(self) -> dict:
        return {"state": self.state, "build_running": self._build_task is not None and not self._build_task.done()}
