"""
Plain English Portal v2 - Form Companion Backend
Upload PDF/image, drag a region, get simplified text + checklist via Claude vision.
"""
import base64
import json
import os
import uuid
from pathlib import Path
from typing import Literal, Optional

import fitz
from anthropic import Anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env", override=True)

API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not API_KEY:
    raise RuntimeError("ANTHROPIC_API_KEY not found in .env")

client = Anthropic(api_key=API_KEY)
MODEL = "claude-sonnet-4-6"
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

ACTIVE_SESSIONS: dict = {}
MAX_SESSIONS = 50

ContextType = Literal["ACADEMIC", "GOVERNMENT"]

app = FastAPI(title="Plain English Portal v2", version="2.0.0")

_S = "http"
_C = "://"
_DH = "127.0.0.1"
_DN = "localhost"
_DP = "5173"
ALLOWED_ORIGINS = [_S + _C + _DN + ":" + _DP, _S + _C + _DH + ":" + _DP]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def evict_old_sessions():
    while len(ACTIVE_SESSIONS) > MAX_SESSIONS:
        oldest = next(iter(ACTIVE_SESSIONS))
        ACTIVE_SESSIONS.pop(oldest, None)


ACADEMIC_PROMPT = """You are the Plain English Portal helping a student or parent understand a school worksheet.
Your job:
1. Read the visible text in the image (perform OCR).
2. Rewrite at a 6th-grade reading level. Short sentences (max 12 words). Simple words. Active voice.
3. Add 2-3 guiding hints to help the student think it through. Do NOT give the answer.
4. Give a clear step-by-step checklist of what they should do.

Return ONLY valid JSON, no markdown fences, no preamble:
{"original_text": "...", "simplified_text": "...", "guiding_questions": ["..."], "checklist": ["..."]}"""

GOVERNMENT_PROMPT = """You are the Plain English Portal helping a New Zealander understand a government or compliance form.
Your job:
1. Read visible text. Respect column boundaries.
2. Rewrite at 6th-grade level. Short sentences. Active voice.
3. Extract a checklist of what the person needs to do or provide.
4. Flag deadlines, dollar amounts, and required documents.

Return ONLY valid JSON, no markdown fences, no preamble:
{"original_text": "...", "simplified_text": "...", "guiding_questions": ["..."], "checklist": ["..."], "flags": {"deadlines": [], "amounts": [], "documents_needed": []}}"""

PROMPTS = {"ACADEMIC": ACADEMIC_PROMPT, "GOVERNMENT": GOVERNMENT_PROMPT}


class UploadResponse(BaseModel):
    session_id: str
    context_type: ContextType
    pages: list


class SimplifyRequest(BaseModel):
    session_id: str
    page_num: int
    bbox: dict = Field(...)


class SimplifyResponse(BaseModel):
    original_text: str
    simplified_text: str
    guiding_questions: list
    checklist: list
    flags: Optional[dict] = None


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Plain English Portal v2",
        "model": MODEL,
        "active_sessions": len(ACTIVE_SESSIONS),
        "frontend_built": FRONTEND_DIST.exists(),
    }


@app.post("/api/v1/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...), context_type: ContextType = Form(...)):
    contents = await file.read()
    session_id = "sess_" + uuid.uuid4().hex[:12]
    try:
        filetype = "pdf" if file.filename.lower().endswith(".pdf") else None
        doc = fitz.open(stream=contents, filetype=filetype)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not read file: " + str(e))
    pages = []
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        b64 = base64.b64encode(pix.tobytes("png")).decode("ascii")
        pages.append({"page_num": i, "width": pix.width, "height": pix.height, "image_base64": b64})
    doc.close()
    ACTIVE_SESSIONS[session_id] = {"context_type": context_type, "pages": pages, "filename": file.filename}
    evict_old_sessions()
    return UploadResponse(session_id=session_id, context_type=context_type, pages=pages)


@app.post("/api/v1/simplify", response_model=SimplifyResponse)
async def simplify_region(req: SimplifyRequest):
    session = ACTIVE_SESSIONS.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Please upload again.")
    page_data = next((p for p in session["pages"] if p["page_num"] == req.page_num), None)
    if not page_data:
        raise HTTPException(status_code=404, detail="Page not found")
    img_bytes = base64.b64decode(page_data["image_base64"])
    img_doc = fitz.open(stream=img_bytes, filetype="png")
    img_page = img_doc[0]
    bb = req.bbox
    rect = fitz.Rect(
        max(0, bb["x"]), max(0, bb["y"]),
        min(page_data["width"], bb["x"] + bb["width"]),
        min(page_data["height"], bb["y"] + bb["height"]),
    )
    if rect.is_empty or rect.width < 5 or rect.height < 5:
        raise HTTPException(status_code=400, detail="Selected area is too small")
    cropped_pix = img_page.get_pixmap(clip=rect)
    cropped_b64 = base64.b64encode(cropped_pix.tobytes("png")).decode("ascii")
    img_doc.close()
    prompt_text = PROMPTS[session["context_type"]]
    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": cropped_b64}},
                    {"type": "text", "text": prompt_text},
                ],
            }],
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            for chunk in raw.split("```"):
                chunk = chunk.strip()
                if chunk.startswith("json"):
                    chunk = chunk[4:].strip()
                if chunk.startswith("{"):
                    raw = chunk
                    break
        parsed = json.loads(raw)
        return SimplifyResponse(
            original_text=parsed.get("original_text", ""),
            simplified_text=parsed.get("simplified_text", ""),
            guiding_questions=parsed.get("guiding_questions", []),
            checklist=parsed.get("checklist", []),
            flags=parsed.get("flags"),
        )
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail="Could not parse Claude reply: " + str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail="Claude error: " + str(e))


@app.post("/api/v1/reset/{session_id}")
def reset_session(session_id: str):
    ACTIVE_SESSIONS.pop(session_id, None)
    return {"status": "reset", "session_id": session_id}


# --- Alias routes without the /v1/ prefix (thin wrappers) -----------------
@app.post("/api/upload", response_model=UploadResponse)
async def upload_alias(file: UploadFile = File(...), context_type: ContextType = Form(...)):
    """Alias for POST /api/v1/upload"""
    return await upload_document(file=file, context_type=context_type)


@app.post("/api/simplify", response_model=SimplifyResponse)
async def simplify_alias(
    file: UploadFile = File(...),
    audience_profile: str = Form(...),
    page_num: int = Form(1),
):
    """Single-shot: upload file + simplify page in one request (used by the built frontend)."""
    # Map audience_profile string → ACADEMIC or GOVERNMENT prompt
    profile_lower = audience_profile.lower()
    if any(kw in profile_lower for kw in ("curriculum", "school", "year", "level")):
        context_type = "ACADEMIC"
    else:
        context_type = "GOVERNMENT"

    raw_bytes = await file.read()
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()

    # Convert to PNG page image
    if ext in ("jpg", "jpeg", "png", "webp"):
        img_b64 = base64.b64encode(raw_bytes).decode("ascii")
        media_type = "image/png" if ext == "png" else f"image/{ext}"
    else:
        # Treat as PDF
        pdf_doc = fitz.open(stream=raw_bytes, filetype="pdf")
        page_index = max(0, page_num - 1)
        if page_index >= len(pdf_doc):
            page_index = len(pdf_doc) - 1
        page = pdf_doc[page_index]
        pix = page.get_pixmap(dpi=150)
        img_b64 = base64.b64encode(pix.tobytes("png")).decode("ascii")
        media_type = "image/png"
        pdf_doc.close()

    prompt_text = PROMPTS[context_type]
    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": img_b64}},
                    {"type": "text", "text": prompt_text},
                ],
            }],
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            for chunk in raw.split("```"):
                chunk = chunk.strip()
                if chunk.startswith("json"):
                    chunk = chunk[4:].strip()
                if chunk.startswith("{"):
                    raw = chunk
                    break
        parsed = json.loads(raw)
        return SimplifyResponse(
            original_text=parsed.get("original_text", ""),
            simplified_text=parsed.get("simplified_text", ""),
            guiding_questions=parsed.get("guiding_questions", []),
            checklist=parsed.get("checklist", []),
            flags=parsed.get("flags"),
        )
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail="Could not parse Claude reply: " + str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail="Claude error: " + str(e))


@app.post("/api/reset/{session_id}")
def reset_alias(session_id: str):
    """Alias for POST /api/v1/reset/{session_id}"""
    return reset_session(session_id)


@app.post("/api/checklist")
async def checklist_alias(file: UploadFile = File(...), audience_profile: Optional[str] = Form("general_adult")):
    """Alias placeholder for POST /api/v1/checklist — not implemented in this backend.

    Returning 501 so the frontend receives a clear signal until a v1 handler exists.
    """
    raise HTTPException(status_code=501, detail="Checklist endpoint not implemented on this server.")



if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        candidate = FRONTEND_DIST / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def dev_root():
        return {"status": "dev_mode", "message": "Run npm run build then restart uvicorn"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=_DH, port=8000, reload=True)
