"""
Railway-deployed face encoding service.
STATELESS — accepts a JPEG image, returns a 512-d face embedding vector.
"""
import os, traceback
import numpy as np
from io import BytesIO
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

app = FastAPI(title="SODA Face Encoder")

_analysis = None
_init_error = None

def _get_analysis():
    global _analysis, _init_error
    if _analysis is not None:
        return _analysis
    if _init_error:
        raise RuntimeError(_init_error)
    try:
        import insightface
        from insightface.app import FaceAnalysis
        a = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
        a.prepare(ctx_id=0, det_size=(640, 640))
        _analysis = a
        return _analysis
    except Exception as e:
        _init_error = str(e) + "\n" + traceback.format_exc()
        raise


@app.post("/encode")
async def encode(file: UploadFile = File(...)):
    contents = await file.read()
    if not contents:
        return {"error": "Empty file"}
    try:
        img = Image.open(BytesIO(contents)).convert("RGB")
    except Exception:
        return {"error": "Could not decode image"}
    try:
        model = _get_analysis()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Model init failed: {_init_error or str(e)}"})
    try:
        faces = model.get(np.array(img))
        if not faces:
            return {"error": "No face detected"}
        return {"embedding": faces[0].normed_embedding.tolist()}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Inference failed: {e}"})


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": _analysis is not None}
