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
SITE_LIVE = os.getenv("SITE_LIVE", "false").lower() == "true"

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


# ══════════════════════════════════════════════════════════════════════════════
# FILE-BASED PROMPT LOADER
# ══════════════════════════════════════════════════════════════════════════════

def load_text(relative_path: str) -> str:
    """Read a UTF-8 text file. Raises a clear error if the file is missing."""
    path = BASE_DIR / relative_path
    if not path.exists():
        raise FileNotFoundError(f"Required prompt file missing: {relative_path}")
    return path.read_text(encoding="utf-8").strip()


def load_optional_text(relative_path: str) -> str:
    """Read a UTF-8 text file, or return empty string if the file does not exist."""
    path = BASE_DIR / relative_path
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8").strip()


def build_client_context(client_name: str) -> str:
    """Load a client content pack: glossary, style notes, and exclusions."""
    glossary = load_optional_text(f"client_docs/{client_name}/glossary.csv")
    style_notes = load_optional_text(f"client_docs/{client_name}/style_notes.md")
    exclusions = load_optional_text(f"client_docs/{client_name}/exclusions.md")
    if not glossary and not style_notes and not exclusions:
        return ""
    parts = [f"CLIENT CONTENT PACK — {client_name}"]
    if style_notes:
        parts.append(f"Style notes:\n{style_notes}")
    if exclusions:
        parts.append(f"Exclusions:\n{exclusions}")
    if glossary:
        parts.append(f"Glossary:\n{glossary}")
    return "\n\n".join(parts)


def build_prompt(
    task: str,
    format_name: Optional[str] = None,
    domain: Optional[str] = None,
    client_name: Optional[str] = None,
) -> str:
    """Assemble a complete prompt from files.

    Order: non_negotiables → client context → domain rules → task prompt → format schema.

    Args:
        task:        File stem in prompts/tasks/ (e.g. "rewrite", "form_explainer", "validator")
        format_name: File stem in prompts/formats/ (e.g. "rewrite_output.json", "form_explainer_output.json")
        domain:      File stem in prompts/domains/ (e.g. "msd_benefits", "health_patient")
        client_name: Folder name in client_docs/ (e.g. "msd")
    """
    parts = [NON_NEGOTIABLES]

    # Client context (style notes, exclusions, glossary)
    if client_name:
        ctx = build_client_context(client_name)
        if ctx:
            parts.append(ctx)

    # Domain-specific rules (optional)
    if domain:
        domain_text = load_optional_text(f"prompts/domains/{domain}.md")
        if domain_text:
            parts.append(domain_text)

    # Task prompt (required)
    parts.append(load_text(f"prompts/tasks/{task}.md"))

    # Output format schema (optional)
    if format_name:
        fmt = load_optional_text(f"prompts/formats/{format_name}.md")
        if fmt:
            parts.append(fmt)

    return "\n\n".join(parts)


# ── Load core prompts from files ─────────────────────────────────────────────

NON_NEGOTIABLES = load_text("core/non_negotiables.md")
CLASSIFIER_PROMPT = load_text("prompts/tasks/classifier.md")

# Legacy aliases — inline prompts below still reference these names
SECTION_2_NEUROINCLUSIVE = NON_NEGOTIABLES
SECTION_4_ACCURACY = NON_NEGOTIABLES


# ── Assembled prompts used by API endpoints ──────────────────────────────────

GENERAL_PROMPT = build_prompt(task="rewrite", format_name="rewrite_output.json")
FORM_EXPLAINER_FULL_PROMPT = build_prompt(task="form_explainer", format_name="form_explainer_output.json")

# Legacy aliases — kept so the PROMPTS dict and simplify_alias still work
BUSINESS_PLAN_PROMPT = GENERAL_PROMPT
FORM_EXPLAINER_PROMPT = GENERAL_PROMPT


# ── Domain prompts — loaded from prompts/domains/ ────────────────────────────

DOMAIN_FILES = {
    "MSD/BENEFITS":       "msd_benefits",
    "HEALTH/PATIENT":     "health_patient",
    "LEGAL/TRIBUNAL":     "legal_tribunal",
    "CRIMINAL/LAW":       "criminal_law",
    "HS/SAFETY":          "hs_safety",
    "EMPLOYMENT/HR":      "employment_hr",
    "IRD/TAX":            "ird_tax",
    "INSURANCE/FINANCIAL": "insurance_financial",
    "PROPERTY/TENANCY":   "property_tenancy",
    "GENERAL GOVT":       "general_govt",
}

VALID_CATEGORIES = list(DOMAIN_FILES.keys()) + ["OTHER"]

CATEGORY_LABELS = {
    "MSD/BENEFITS": "Work & Income / Benefits",
    "HEALTH/PATIENT": "Health / Medical",
    "LEGAL/TRIBUNAL": "Legal / Tribunal",
    "CRIMINAL/LAW": "Criminal Law",
    "HS/SAFETY": "Health & Safety",
    "EMPLOYMENT/HR": "Employment / HR",
    "IRD/TAX": "IRD / Tax",
    "INSURANCE/FINANCIAL": "Insurance / Financial",
    "PROPERTY/TENANCY": "Property / Tenancy",
    "GENERAL GOVT": "General Government",
    "OTHER": "General Document",
}


def get_skill_prompt(category: str) -> str:
    """Return a rewrite prompt for a category, with domain rules if available."""
    domain = DOMAIN_FILES.get(category)
    if domain:
        return build_prompt(task="rewrite", format_name="rewrite_output.json", domain=domain)
    return GENERAL_PROMPT


CLIENT_DOCS = {
    "MSD/BENEFITS": "msd",
}


def get_form_explain_prompt(category: str) -> str:
    """Return a form explainer prompt with domain rules and client docs if available."""
    domain = DOMAIN_FILES.get(category) if category and category != "OTHER" else None
    client = CLIENT_DOCS.get(category) if category else None
    if domain or client:
        return build_prompt(
            task="form_explainer",
            format_name="form_explainer_output.json",
            domain=domain,
            client_name=client,
        )
    return FORM_EXPLAINER_FULL_PROMPT


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

    return SECTION_2_NEUROINCLUSIVE + f"""You help children understand school worksheets and other documents. This child reads at the level of {level}.

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


WORKSHEET_TRANSLATE_PROMPT_TEMPLATE = SECTION_4_ACCURACY + """You are a worksheet translator for schools. Your job is to translate an entire worksheet from English into {language}.

Look at this worksheet image carefully. It contains text, and may contain images, diagrams, tables, numbered questions, fill-in-the-blank fields, or other visual elements.

Translate ALL text on the worksheet into {language}. Keep the same structure and order as the original.

Rules:
- Translate every piece of text: headings, instructions, questions, labels, captions, footnotes, everything
- Keep numbers, dates, and proper nouns (names of people, places, brands) as they are
- For fill-in-the-blank lines or boxes, keep them as blank lines: _______________
- Never fill in blank fields — leave them blank
- Preserve the exact field order and structure of the original
- If there is an image or diagram, describe it briefly in square brackets in {language}, e.g. [diagram of a plant cell]
- Keep the same numbering (1, 2, 3... or a, b, c...)
- If there are tables, preserve the table structure using clear formatting
- Keep any mathematical equations or formulas exactly as they are
- Match the tone — if the original is friendly and casual, the translation should be too

Return ONLY this JSON (no markdown, no preamble):
{{
  "title": "The translated title or heading of the worksheet",
  "original_language": "English",
  "target_language": "{language}",
  "sections": [
    {{
      "type": "heading|instruction|question|table|image_note|text",
      "original": "Original English text",
      "translated": "Translated text in {language}",
      "number": null
    }}
  ]
}}

Go through the worksheet top to bottom, left to right. Every piece of text gets its own section entry. For questions, include the question number in the "number" field. For images, use type "image_note" and describe what the image shows."""


PROMPTS = {
    "ACADEMIC":        GENERAL_PROMPT,
    "GOVERNMENT":      GENERAL_PROMPT,
    "UNIVERSAL":       GENERAL_PROMPT,
    "BUSINESS_PLAN":   BUSINESS_PLAN_PROMPT,
    "FORM_EXPLAINER":  FORM_EXPLAINER_PROMPT,
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
        # First page at full DPI for selection; rest at lower DPI for faster loading
        dpi = 150 if i == 0 else 96
        pix = page.get_pixmap(dpi=dpi)
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
    if "form_explainer" in profile_lower or "form-explainer" in profile_lower:
        context_type = "FORM_EXPLAINER"
    elif "business" in profile_lower or "plan" in profile_lower or "flexi" in profile_lower:
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


DYSLEXIA_BUTTON_PROMPT = SECTION_2_NEUROINCLUSIVE + """You help children with dyslexia understand school worksheets.

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
- Never use all capitals, italics, or underlines in output
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


SUPPORTED_LANGUAGES = [
    "te reo Māori", "Samoan", "Tongan", "Cook Islands Māori", "Niuean", "Fijian",
    "Hindi", "Mandarin Chinese", "Cantonese Chinese", "Korean", "Japanese",
    "Tagalog", "Thai", "Vietnamese", "Khmer", "Burmese",
    "Arabic", "Somali", "Amharic", "Swahili",
    "Spanish", "Portuguese", "French", "German", "Italian", "Dutch",
    "Russian", "Ukrainian", "Polish",
    "Afrikaans",
]


@app.get("/api/v1/translate/languages")
def list_languages():
    return {"languages": SUPPORTED_LANGUAGES}


@app.post("/api/v1/translate-worksheet")
async def translate_worksheet(
    file: UploadFile = File(...),
    target_language: str = Form(...),
    page_num: int = Form(1),
):
    if target_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {target_language}")

    raw_bytes = await file.read()
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()

    if ext in ("jpg", "jpeg", "png", "webp"):
        img_b64 = base64.b64encode(raw_bytes).decode("ascii")
        media_type = "image/png" if ext == "png" else f"image/{ext}"
    else:
        pdf_doc = fitz.open(stream=raw_bytes, filetype="pdf")
        page_index = max(0, page_num - 1)
        if page_index >= len(pdf_doc):
            page_index = len(pdf_doc) - 1
        page = pdf_doc[page_index]
        pix = page.get_pixmap(dpi=150)
        img_b64 = base64.b64encode(pix.tobytes("png")).decode("ascii")
        media_type = "image/png"
        pdf_doc.close()

    prompt_text = WORKSHEET_TRANSLATE_PROMPT_TEMPLATE.format(language=target_language)
    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=4000,
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
        return parsed
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail="Could not parse Claude reply: " + str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail="Claude error: " + str(e))


@app.post("/api/v1/classify")
async def classify_document(
    file: UploadFile = File(...),
    page_num: int = Form(1),
):
    """Classify a document into a category and return the category + label."""
    raw_bytes = await file.read()
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()

    if ext in ("jpg", "jpeg", "png", "webp"):
        img_b64 = base64.b64encode(raw_bytes).decode("ascii")
        media_type = "image/png" if ext == "png" else f"image/{ext}"
    else:
        pdf_doc = fitz.open(stream=raw_bytes, filetype="pdf")
        page_index = max(0, page_num - 1)
        if page_index >= len(pdf_doc):
            page_index = len(pdf_doc) - 1
        page = pdf_doc[page_index]
        pix = page.get_pixmap(dpi=150)
        img_b64 = base64.b64encode(pix.tobytes("png")).decode("ascii")
        media_type = "image/png"
        pdf_doc.close()

    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=50,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": img_b64}},
                    {"type": "text", "text": CLASSIFIER_PROMPT},
                ],
            }],
        )
        category = msg.content[0].text.strip().upper()
        # Normalise: if the model returned something close, match it
        if category not in VALID_CATEGORIES:
            for vc in VALID_CATEGORIES:
                if vc in category or category in vc:
                    category = vc
                    break
            else:
                category = "OTHER"
        return {
            "category": category,
            "label": CATEGORY_LABELS.get(category, "General Document"),
            "categories": [{"value": c, "label": CATEGORY_LABELS[c]} for c in VALID_CATEGORIES],
        }
    except Exception as e:
        return {"category": "OTHER", "label": "General Document",
                "categories": [{"value": c, "label": CATEGORY_LABELS[c]} for c in VALID_CATEGORIES],
                "error": str(e)}


class ValidateRequest(BaseModel):
    original_text: str
    draft_output: str
    is_form: bool = False
    category: str = ""


@app.post("/api/v1/validate")
async def validate_output(req: ValidateRequest):
    """Run the Plainly validator: check draft output against original for accuracy."""
    form_note = " This was a form explainer — check that it goes field by field in order." if req.is_form else ""
    sector_rules = ""
    if req.category == "MSD_BENEFITS":
        sector_rules = "\n\n" + load_text("prompts/tasks/validator_msd.md")
        ctx = build_client_context("msd")
        if ctx:
            sector_rules = "\n\n" + ctx + sector_rules
    prompt = NON_NEGOTIABLES + "\n\n" + load_text("prompts/tasks/validator.md") + sector_rules + f"""
Now validate this output.{form_note}

ORIGINAL DOCUMENT:
{req.original_text}

DRAFT PLAIN-ENGLISH OUTPUT:
{req.draft_output}

Return ONLY this JSON (no markdown):
{{
  "pass": true or false,
  "missing_information": ["list of anything omitted from the original"],
  "added_information": ["list of anything added that is not in the original"],
  "order_problems": ["list of structure or order issues"],
  "language_problems": ["list of accessibility or clarity issues"],
  "corrected_version": "the corrected plain-English version (only if fail)"
}}"""
    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=8000,
            messages=[{"role": "user", "content": prompt}],
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
        return json.loads(raw)
    except Exception as e:
        raise HTTPException(status_code=502, detail="Validation error: " + str(e))


class DefineWordRequest(BaseModel):
    word: str
    context: str = ""


@app.post("/api/v1/define-word")
async def define_word(req: DefineWordRequest):
    """Define a word in plain English, suitable for someone with dyslexia."""
    word = req.word.strip()
    if not word or len(word) > 100:
        raise HTTPException(status_code=400, detail="Invalid word")
    context_hint = f' The word appears in this sentence: "{req.context}"' if req.context else ""
    prompt = (
        f'Define the word "{word}" in plain English for someone with dyslexia or low literacy.{context_hint}\n\n'
        "Rules:\n"
        "- Use simple, everyday words.\n"
        "- Keep the definition to 1-2 short sentences.\n"
        "- If the word has multiple meanings, pick the one that fits the context.\n"
        "- Give one short example of how the word is used.\n\n"
        'Return ONLY this JSON (no markdown):\n'
        '{"word": "the word", "definition": "plain English definition", "example": "example sentence"}'
    )
    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
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
        return json.loads(raw)
    except Exception as e:
        raise HTTPException(status_code=502, detail="Could not define word: " + str(e))


@app.post("/api/v1/explain-form")
async def explain_form(
    file: UploadFile = File(...),
    page_num: int = Form(1),
    category: str = Form(""),
):
    raw_bytes = await file.read()
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()

    if ext in ("jpg", "jpeg", "png", "webp"):
        img_b64 = base64.b64encode(raw_bytes).decode("ascii")
        media_type = "image/png" if ext == "png" else f"image/{ext}"
    else:
        pdf_doc = fitz.open(stream=raw_bytes, filetype="pdf")
        page_index = max(0, page_num - 1)
        if page_index >= len(pdf_doc):
            page_index = len(pdf_doc) - 1
        page = pdf_doc[page_index]
        pix = page.get_pixmap(dpi=150)
        img_b64 = base64.b64encode(pix.tobytes("png")).decode("ascii")
        media_type = "image/png"
        pdf_doc.close()

    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=8000,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": img_b64}},
                    {"type": "text", "text": get_form_explain_prompt(category) if category else FORM_EXPLAINER_FULL_PROMPT},
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


COMING_SOON_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Plainly | Coming Soon</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Lexend', sans-serif;
    background: #f7f8fa;
    color: #1a2332;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }
  .container {
    text-align: center;
    max-width: 480px;
  }
  .logo {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }
  .logo span { color: #2563eb; }
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1rem;
    line-height: 1.7;
    color: #4b5563;
    margin-bottom: 1.5rem;
  }
  a {
    color: #2563eb;
    text-decoration: none;
  }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="container">
  <div class="logo">Plain<span>ly</span></div>
  <h1>Coming soon</h1>
  <p>We're building something new. Plainly helps organisations explain complex documents in plain language.</p>
  <p>Questions? <a href="mailto:hello@tryplainly.co.nz">hello@tryplainly.co.nz</a></p>
</div>
</body>
</html>"""

if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        # Coming soon gate — show placeholder unless SITE_LIVE=true
        if not SITE_LIVE and not full_path.startswith("portal"):
            from fastapi.responses import HTMLResponse
            return HTMLResponse(COMING_SOON_HTML)
        candidate = FRONTEND_DIST / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=_DH, port=8000, reload=True)
