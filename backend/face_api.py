"""
Async HTTP client for face encoding.
Tries local MediaPipe server first (fast, no network), falls back to Railway.

Endpoints:
  POST /encode  — upload image → returns {"embedding": [floats]} or {"error": "..."}
"""
import os
import httpx

LOCAL_URL = "http://127.0.0.1:8001"
RAILWAY_URL = os.getenv("FACE_API_URL", "")
LOCAL_TIMEOUT = 10
RAILWAY_TIMEOUT = 120


async def _post(url, image_bytes, timeout):
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(
            f"{url}/encode",
            files={"file": ("frame.jpg", image_bytes, "image/jpeg")},
        )
        resp.raise_for_status()
        return resp.json()


async def encode_face(image_bytes) -> dict:
    # Try local server first (sub-millisecond network, MediaPipe is fast)
    try:
        return await _post(LOCAL_URL, image_bytes, LOCAL_TIMEOUT)
    except (httpx.ConnectError, httpx.TimeoutException):
        pass  # fall through to Railway

    # Fall back to Railway
    if not RAILWAY_URL:
        return {"error": "No face server available (local down, no RAILWAY_URL set)"}

    try:
        return await _post(RAILWAY_URL, image_bytes, RAILWAY_TIMEOUT)
    except httpx.TimeoutException:
        return {"error": "Face encoding service timed out"}
    except httpx.HTTPStatusError as e:
        return {"error": f"Face service error: {e.response.status_code}"}
    except Exception as e:
        return {"error": repr(e)}
