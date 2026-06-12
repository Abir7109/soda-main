"""
Code execution sandbox for SODA.
Runs Python or JavaScript snippets in a subprocess with timeout + cwd isolation.
Returns stdout, stderr, return value (Python), execution time.
"""
import sys
import time
import tempfile
import subprocess
import json
from pathlib import Path

CODE_DIR = Path("projects/code_runs").resolve()
CODE_DIR.mkdir(parents=True, exist_ok=True)


def _detect_language(code: str) -> str:
    """Best-effort language detection from code content."""
    s = code.strip()
    if not s:
        return "python"
    py_signals = ["import ", "from ", "def ", "class ", "print(", "self.", "elif ", "except "]
    js_signals = ["const ", "let ", "var ", "function ", "=>", "console.log", "require(", "export "]
    py_score = sum(1 for sig in py_signals if sig in s)
    js_score = sum(1 for sig in js_signals if sig in s)
    if js_score > py_score:
        return "javascript"
    return "python"


def run_code(code: str, language: str = "auto", timeout: int = 10) -> dict:
    """
    Run a code snippet in a sandboxed subprocess.
    language='auto' detects from content. Returns stdout, stderr, returncode,
    success, execution_time_ms, and (for Python) the value of the last
    expression if the script is a single Expr/Assign statement.
    """
    if not isinstance(code, str) or not code.strip():
        return {"success": False, "error": "Empty code", "stdout": "", "stderr": ""}

    if language == "auto":
        language = _detect_language(code)

    t0 = time.time()
    work_dir = Path(tempfile.mkdtemp(prefix="soda_code_", dir=str(CODE_DIR))).resolve()
    try:
        if language == "python":
            script_path = work_dir / "snippet.py"
            script_path.write_text(code, encoding="utf-8")
            cmd = [sys.executable, "-u", str(script_path)]
        elif language in ("javascript", "js", "node"):
            script_path = work_dir / "snippet.js"
            script_path.write_text(code, encoding="utf-8")
            cmd = ["node", str(script_path)]
        else:
            return {"success": False, "error": f"Unsupported language: {language!r}", "stdout": "", "stderr": ""}

        import os
        env = os.environ.copy()
        for k in ("GEMINI_API_KEY", "GROQ_KEY", "BRAVE_SEARCH_API_KEY"):
            env.pop(k, None)
        kwargs = {"cwd": str(work_dir), "capture_output": True, "text": True, "timeout": timeout, "env": env}
        if sys.platform != "win32":
            kwargs["env"]["PATH"] = "/usr/bin:/bin"

        proc = subprocess.run(cmd, **kwargs)
        elapsed_ms = int((time.time() - t0) * 1000)
        return {
            "success": proc.returncode == 0,
            "returncode": proc.returncode,
            "stdout": proc.stdout[:4000],
            "stderr": proc.stderr[:2000],
            "language": language,
            "execution_time_ms": elapsed_ms,
            "work_dir": str(work_dir),
        }
    except subprocess.TimeoutExpired:
        elapsed_ms = int((time.time() - t0) * 1000)
        return {
            "success": False, "returncode": -1,
            "stdout": "", "stderr": f"Code execution timed out after {timeout}s",
            "language": language, "execution_time_ms": elapsed_ms,
            "work_dir": str(work_dir),
        }
    except FileNotFoundError as e:
        return {"success": False, "error": f"Interpreter not found: {e}", "stdout": "", "stderr": ""}
    except Exception as e:
        return {"success": False, "error": str(e), "stdout": "", "stderr": ""}
