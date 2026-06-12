"""
Local face encoding server using MediaPipe FaceLandmarker.
Runs as a separate process on port 8001 — no insightface/ONNX bloat.
Downloads model on first run (~3.7MB), then instant forever.
"""
import uvicorn
import numpy as np
import os
from fastapi import FastAPI, UploadFile, File

app = FastAPI(title="SODA Local Face Server")
landmarker = None

MODEL_PATH = os.path.expanduser("~/.mediapipe/models/face_landmarker.task")
NOSE_TIP = 1
LEFT_EYE = 33
RIGHT_EYE = 263


def _get_landmarker():
    global landmarker
    if landmarker is not None:
        return landmarker
    from mediapipe.tasks.python import vision
    landmarker = vision.FaceLandmarker.create_from_model_path(MODEL_PATH)
    return landmarker


@app.get("/health")
async def health():
    return {"status": "ok", "model_exists": os.path.exists(MODEL_PATH), "landmarker_loaded": landmarker is not None}


@app.post("/encode")
async def encode(file: UploadFile = File(...)):
    import cv2
    from mediapipe import Image as mp_Image, ImageFormat

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"error": "Invalid image data"}

    lm = _get_landmarker()
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    mp_img = mp_Image(image_format=ImageFormat.SRGB, data=rgb)
    result = lm.detect(mp_img)

    if not result.face_landmarks or len(result.face_landmarks) == 0:
        return {"error": "No face detected"}

    landmarks = result.face_landmarks[0]
    h, w = img.shape[:2]
    pts = np.array([(lm.x * w, lm.y * h, lm.z * w) for lm in landmarks], dtype=np.float64)

    # Normalize: center at nose tip, scale by inter-ocular distance
    nose = pts[NOSE_TIP]
    left_eye = pts[LEFT_EYE]
    right_eye = pts[RIGHT_EYE]
    inter_ocular = np.linalg.norm(left_eye - right_eye)
    if inter_ocular < 1e-6:
        inter_ocular = 1.0

    normalized = (pts - nose) / inter_ocular
    embedding = normalized.flatten().tolist()

    return {"embedding": embedding, "dims": len(embedding)}


if __name__ == "__main__":
    print("Starting SODA Local Face Server on port 8001...")
    print(f"Model: {MODEL_PATH} ({os.path.getsize(MODEL_PATH) if os.path.exists(MODEL_PATH) else 'missing'} bytes)")
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="info")
