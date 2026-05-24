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


GENERAL_PROMPT = """You help people with dyslexia understand any document — government forms, benefit applications, school worksheets, tenancy agreements, letters, or contracts.

Read ALL the text in the image. Decide which type of content this is:
- TYPE A: A QUESTION or PROMPT with blank space to fill in
- TYPE B: INFORMATION, RULES, or INSTRUCTIONS explaining something

Return ONLY this JSON (no markdown, no preamble):
{
  "original_text": "copy the exact question, heading, or key sentence from the image",
  "simplified_text": "• [bullet 1]\n• [bullet 2]\n• [more bullets as needed]",
  "checklist": ["Item 1", "Item 2"],
  "flags": {"deadlines": [], "amounts": [], "documents_needed": []}
}

For TYPE A (QUESTION with blank to fill):
• What this question is asking — one plain English sentence
• What kind of information to include — specific details, numbers, dates, names
• For example, you could write: "[Give a short realistic example answer]"
• [Any instructions from the image e.g. "be specific", "list all"]

For TYPE B (INFORMATION/INSTRUCTIONS):
• One bullet per point — plain English, keep every number, date, name, and condition exactly
• Do NOT cut or merge points — write all of them

Checklist for TYPE A: what the person needs to think about to answer well
Checklist for TYPE B: only real actions from this section, or ["No action needed — read and understand this section"]
Flags: only deadlines, amounts, or documents visible in THIS image."""


BUSINESS_PLAN_PROMPT = """You are a plain-English coach helping people with dyslexia fill in a WINZ / Work and Income Flexi-Wage Self-Employment business plan application.

Background you must know:
- Once submitted, the business plan is sent to an INDEPENDENT EXTERNAL ASSESSOR whose job is to decide if the business is VIABLE (can it actually survive and make money).
- The assessor checks: (1) Is there real market demand? (2) Are the financial projections realistic — not just hopeful? (3) Does the applicant genuinely understand their business — market, competitors, costs, risks? (4) Do they have the relevant skills and experience? (5) Is there a clear plan for getting customers?
- Vague or optimistic answers without evidence or numbers will fail the viability assessment.
- Strong answers show research, real numbers, named competitors, specific customer types, and evidence of demand.

Read ALL the text in the image. Decide which type of content this is:
- TYPE A: A QUESTION or PROMPT requiring a written answer (has blank space, or asks what/how/why/describe/explain/list)
- TYPE B: INFORMATION, TIPS, or INSTRUCTIONS (no blank space to fill)

Return ONLY this JSON (no markdown, no preamble):
{
  "original_text": "copy the exact question or heading from the image",
  "simplified_text": "• [bullet 1]\n• [bullet 2]\n• [more bullets as needed]",
  "checklist": ["Item 1", "Item 2"],
  "flags": {"deadlines": [], "amounts": [], "documents_needed": []}
}

═══ For TYPE A (QUESTION requiring a written answer) ═══

Write simplified_text with these bullets IN ORDER:

• What this question is really asking — one plain English sentence
• What the independent assessor is looking for — the specific evidence or criteria they will use to judge viability (e.g. proof of demand, realistic numbers, named sources, relevant experience)
• What your answer MUST include — every required element: numbers, timeframes, competitor names, customer types, dollar figures, evidence sources. Be direct and specific.
• What makes a WEAK answer vs a STRONG answer — give a blunt, concrete contrast (e.g. "Saying 'I think people will hire me' is weak. Saying 'I contacted 12 local businesses in Kaitaia and 8 said they would use a mobile cleaning service at $35/hour' is strong")
• For example, a strong answer might look like: "[Write a realistic, detailed example for a typical small NZ business — mobile dog grooming, cleaning, tutoring, lawn mowing, trade, childcare, kai/catering, etc. Show the exact format, level of detail, and depth of thinking the assessor expects. Use real-looking numbers, named local competitors, specific customer types, and concrete evidence. This is a MODEL to show the standard — not their actual answer.]"

═══ For TYPE B (INFORMATION/TIPS) ═══
• One bullet per point — plain English, keep every detail exactly
• Do NOT cut or merge — write all points

═══ Checklist ═══
TYPE A: The specific research tasks, documents, or numbers the person must gather BEFORE they can write a strong answer (e.g. "Find 3 competitors online and write down their prices", "Ask 10 people if they would use your service and write down what they said", "Call IRD to confirm your GST registration")
TYPE B: ["No action needed — read and understand this section"]

═══ Flags ═══
Only deadlines, dollar amounts, or required documents visible in THIS image.

⚠️ Never make up specific dollar amounts, local business names, or statistics — use clearly labelled placeholders like [your price] or [competitor name] if the person must fill these in themselves."""

def make_school_prompt(reading_age: str) -> str:
    """Return a prompt tuned to the child's actual reading age (e.g. '7-8')."""
    try:
        lo = int(reading_age.split("-")[0])
    except Exception:
        lo = 8

    if lo <= 6:
        level = "a 5-6 year old who is just learning to read"
        vocab = (
            "Use ONLY very simple, common words — mostly 1 or 2 syllables. "
            "Keep every sentence to 5-7 words. "
            "Never use a difficult word without explaining it right away in brackets."
        )
        example_note = "Keep the example very short and use things a young child sees every day (e.g. toys, lunch box, pets)."
    elif lo <= 8:
        level = "a 7-8 year old reader"
        vocab = (
            "Use simple, everyday words. Keep sentences short (7-10 words). "
            "If you must use a harder word, explain it straight away in plain words."
        )
        example_note = "Use everyday examples a child this age would know — school, home, food, animals."
    elif lo <= 10:
        level = "a 9-10 year old reader"
        vocab = (
            "Use clear, everyday language. Sentences can be a bit longer but still simple. "
            "Explain any tricky or uncommon words."
        )
        example_note = "Use examples from school life, family, sports, or things they see in the news."
    else:
        level = "an 11-12 year old reader"
        vocab = (
            "Use clear language at about a Year 7-8 level. "
            "Normal sentence length is fine. Explain any technical or subject-specific words."
        )
        example_note = "Use real-world examples a pre-teen would understand — technology, money, current events."

    return f"""You help children understand school worksheets and other documents. This child reads at the level of {level}.

{vocab}

Read ALL the text in the image. Decide which type of content this is:
- TYPE A: A QUESTION or TASK the child needs to answer or complete (has a blank, asks what/why/how/describe/list/draw)
- TYPE B: INFORMATION or INSTRUCTIONS the child needs to understand first

Return ONLY this JSON (no markdown, no preamble):
{{
  "original_text": "copy the exact question, heading, or key sentence from the image",
  "simplified_text": "• [bullet 1]\\n• [bullet 2]\\n• [more bullets as needed]",
  "checklist": ["Item 1", "Item 2"],
  "flags": {{"deadlines": [], "amounts": [], "documents_needed": []}}
}}

For TYPE A (QUESTION or TASK):
• What this question is asking — one simple sentence at the child's reading level
• What kind of answer to write — be specific and concrete (e.g. "Write one word", "Draw a picture", "List three things")
• What to include — name exactly what they need (e.g. "the name of a character", "a number between 1 and 10")
• For example, a good answer might look like: "[{example_note} — show the exact style and length expected]"

For TYPE B (INFORMATION/INSTRUCTIONS):
• One bullet per point — simple words, keep every important detail
• Do NOT skip or merge any points — write them all

Checklist for TYPE A: simple steps the child needs to take to complete the task
Checklist for TYPE B: ["Read this carefully before you start"]
Flags: only deadlines or important requirements visible in THIS image."""


PROMPTS = {
    "ACADEMIC":      GENERAL_PROMPT,
    "GOVERNMENT":    GENERAL_PROMPT,
    "UNIVERSAL":     GENERAL_PROMPT,
    "BUSINESS_PLAN": BUSINESS_PLAN_PROMPT,
}


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
    print(f"DEBUG simplify: page={req.page_num} page_dims={page_data['width']}x{page_data['height']} bbox={bb}")
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


@app.get("/api/v1/debug-sessions")
def debug_sessions():
    return {sid: {"pages": len(s["pages"]), "ctx": s["context_type"]} for sid, s in ACTIVE_SESSIONS.items()}


@app.get("/api/v1/debug-crop")
def debug_crop(session_id: str, page_num: int, x: int, y: int, width: int, height: int):
    """Return the cropped image so we can verify coordinates visually."""
    from fastapi.responses import Response
    session = ACTIVE_SESSIONS.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    page_data = next((p for p in session["pages"] if p["page_num"] == page_num), None)
    if not page_data:
        raise HTTPException(404, "Page not found")
    img_bytes = base64.b64decode(page_data["image_base64"])
    img_doc = fitz.open(stream=img_bytes, filetype="png")
    rect = fitz.Rect(x, y, x + width, y + height)
    pix = img_doc[0].get_pixmap(clip=rect)
    img_doc.close()
    return Response(content=pix.tobytes("png"), media_type="image/png")


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
    profile_lower = audience_profile.lower()
    if "business" in profile_lower or "plan" in profile_lower or "flexi" in profile_lower:
        context_type = "BUSINESS_PLAN"
    elif profile_lower.startswith("school"):
        context_type = "SCHOOL"
    else:
        context_type = "UNIVERSAL"

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

    if context_type == "SCHOOL":
        # Extract reading age from profile like "school_7-8"
        reading_age = profile_lower.replace("school_", "").replace("school", "").strip("-_") or "7-8"
        prompt_text = make_school_prompt(reading_age)
    else:
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


DYSLEXIA_BUTTON_PROMPT = """You help children with dyslexia understand school worksheets.

Your job:
1. Read the worksheet text
2. Explain what the worksheet is about in simple words
3. Break down any hard words so the child understands them
4. Go through each question and explain what it's really asking
5. Give hints and example answers so the child knows what to write

Categories (pick the best fit for each section):
- topic: what this worksheet is about — the big picture
- key_word: a hard or technical word explained in simple language
- question: what a specific question is really asking, in plain words
- hint: a helpful tip or clue to help answer a question
- example: what a good answer would look like
- instruction: what to do (e.g. "read the passage first")
- remember: something important to keep in mind

Rules:
- Write at a reading level suitable for a 9-10 year old
- Use **bold** markers around key words, answers, and important bits
- Keep each section to 1-2 sentences max
- Use "you" and "your" — talk directly to the child
- Replace hard words with simple ones, but teach the hard word too (e.g. "**Stomata** = tiny holes on the bottom of leaves")
- For each question: first explain what it's asking, then follow with a hint or example
- Make example answers realistic and detailed enough to show the child what a good answer looks like

Return ONLY this JSON (no markdown, no preamble):
{
  "summary": "One simple sentence — what this worksheet is about",
  "sections": [
    {"category": "topic", "text": "Simple explanation with **bold** for key words"},
    {"category": "question", "text": "..."},
    {"category": "hint", "text": "..."}
  ]
}"""


class SimplifyTextRequest(BaseModel):
    text: str


@app.post("/api/v1/simplify-text")
async def simplify_text(req: SimplifyTextRequest):
    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": DYSLEXIA_BUTTON_PROMPT},
                    {"type": "text", "text": f"Text to simplify:\n\n{req.text}"},
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
        return parsed
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail="Could not parse Claude reply: " + str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail="Claude error: " + str(e))


@app.get("/demo")
def serve_demo():
    return FileResponse(BASE_DIR / "dyslexia-button-demo.html")


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
