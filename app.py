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


# ── Shared rule sections ──────────────────────────────────────────────────────
# These are prepended to specific prompts to enforce neuroinclusive output
# and accuracy guardrails. See each prompt for which sections it uses.

SECTION_2_NEUROINCLUSIVE = """
=== NEUROINCLUSIVE TEXT AND STRUCTURAL DESIGN RULES ===
These rules ensure output is accessible to people with dyslexia, autism (takiwātanga), ADHD, and other cognitive disabilities. Follow every rule in every response.

2.1 Literal and Predictable Language
- Use only literal, direct language. Every phrase must be interpretable exactly as written.
- No irony, no humour, no sarcasm, no metaphors, no idioms, no figures of speech.
- No vague phrases like "in due course," "at your earliest convenience," or "moving forward."

2.2 Predictable and Consistent Structure
- Every output follows the same order: purpose, then action required, then detail, then where to find more information.
- Headings must come before the content they describe. Never bury a heading inside a paragraph.
- Use the same heading formats consistently throughout the output.

2.3 Manage Cognitive Load
- Limit bullet and numbered lists to a maximum of 5 items. If a list has more than 5, break it into sub-lists with their own heading.
- Break complex instructions into numbered steps. Each step is one action.
- Keep paragraphs to a maximum of 3 to 4 short sentences.
- Use a blank line between every paragraph.

2.4 Typography That Works for Dyslexic Readers
- Never output text in ALL CAPITAL LETTERS.
- Never use underlines except for actual hyperlinks.
- Never use italics for emphasis. Use bold instead.
- Bold can be used sparingly to highlight key words or numbers, but do not bold entire sentences.

2.5 Alignment and Spacing
- Always left-align text. Never use right-justified or fully-justified text.
- Use 1.5 line spacing minimum.
- Maintain consistent white space around all elements.
- Limit line length to approximately 60 characters.

2.6 Visual Clarity
- No text over background images, watermarks, or patterned backgrounds.
- Ensure high contrast between text and background.
- Do not use colour as the only way to convey meaning.

2.7 Definitions for Complex Words
- When a complex word must stay (legal term, form field name, service name), keep it and immediately define it in plain English in the next sentence.
- Example: "You must complete a statutory declaration. A statutory declaration is a written statement that you sign in front of a witness to say it is true."

2.8 Explicit Instructions
- Give clear, direct instructions in imperative form: "Write your full name." "Sign at the bottom."
- For each instruction, say where the user can find the information needed.
- Flag common mistakes. Example: "Common mistake: do not use a nickname here. Use your full legal name."
"""

SECTION_4_ACCURACY = """
=== NON-NEGOTIABLE ACCURACY AND PRESERVATION RULES ===
These rules override everything else. If there is a conflict, this section wins.

4.1 Never Drop, Summarise Away, or Compress Away Information
- Do not shorten text by a fixed percentage. Rewrite for clarity, not word count reduction.
- Every date, deadline, amount, fee, threshold, condition, exception, and eligibility criterion must appear in the output.
- If one sentence has multiple conditions, split into multiple short sentences. Keep all conditions.
- When in doubt, include the detail rather than leaving it out.

4.2 Preserve Structure and Order
- Maintain the original order of sections, headings, paragraphs, and fields.
- For forms, go field by field from top to bottom. Never skip or rearrange fields.
- Keep original heading structure so users can map back to the original.

4.3 Define Terms Inline
- When a complex term cannot be replaced, keep it and immediately define it in plain English.
- Always expand acronyms on first use (e.g., "MSD (the Ministry of Social Development)").

4.4 Name the Actor in Every Action
- Every sentence describing an action must name who does it. Use "you" for the reader, "we" for the agency.
- Never leave an action floating without a named actor.

4.5 Be Honest About Scope
- If the document is a plain English version of a longer original, say so upfront.
- End every output with a "Where to find more information" section.

4.6 Do Not Add Advice, Speculation, or Assumptions
- Only restate what is already in the original document.
- Do not tell people what they are eligible for or what they should do beyond the original instructions.
- If something is unclear, flag it: "[This is unclear. Contact the agency for clarification.]"

4.7 Output Structure Requirements
- Start with a one-sentence purpose.
- Break body content into short paragraphs with clear headings.
- Use bullet points for lists.
- End with "Where to find more information."
"""


# ── Prompt 1: GENERAL_PROMPT (uses Section 2 + Section 4) ────────────────────

GENERAL_PROMPT = SECTION_2_NEUROINCLUSIVE + SECTION_4_ACCURACY + """You help people with dyslexia understand any document — government forms, benefit applications, school worksheets, tenancy agreements, letters, or contracts.

Do not shorten text — rewrite for clarity. When in doubt, include the detail.

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
• Do NOT cut or merge points — rewrite all of them in plain English

Checklist for TYPE A: what the person needs to think about to answer well
Checklist for TYPE B: only real actions from this section, or ["No action needed — read and understand this section"]
Flags: only deadlines, amounts, or documents visible in THIS image."""


# DEPRECATED — retired WINZ Flexi-Wage helper. Not in use.
# BUSINESS_PLAN_PROMPT = """You are a plain-English coach helping people with dyslexia fill in a WINZ / Work and Income Flexi-Wage Self-Employment business plan application.
#
# Background you must know:
# - Once submitted, the business plan is sent to an INDEPENDENT EXTERNAL ASSESSOR whose job is to decide if the business is VIABLE (can it actually survive and make money).
# - The assessor checks: (1) Is there real market demand? (2) Are the financial projections realistic — not just hopeful? (3) Does the applicant genuinely understand their business — market, competitors, costs, risks? (4) Do they have the relevant skills and experience? (5) Is there a clear plan for getting customers?
# - Vague or optimistic answers without evidence or numbers will fail the viability assessment.
# - Strong answers show research, real numbers, named competitors, specific customer types, and evidence of demand.
#
# Read ALL the text in the image. Decide which type of content this is:
# - TYPE A: A QUESTION or PROMPT requiring a written answer (has blank space, or asks what/how/why/describe/explain/list)
# - TYPE B: INFORMATION, TIPS, or INSTRUCTIONS (no blank space to fill)
#
# Return ONLY this JSON (no markdown, no preamble):
# {
#   "original_text": "copy the exact question or heading from the image",
#   "simplified_text": "• [bullet 1]\n• [bullet 2]\n• [more bullets as needed]",
#   "checklist": ["Item 1", "Item 2"],
#   "flags": {"deadlines": [], "amounts": [], "documents_needed": []}
# }
#
# For TYPE A (QUESTION requiring a written answer):
# • What this question is really asking — one plain English sentence
# • What the independent assessor is looking for
# • What your answer MUST include
# • What makes a WEAK answer vs a STRONG answer
# • For example, a strong answer might look like: "[realistic example]"
#
# For TYPE B (INFORMATION/TIPS):
# • One bullet per point — plain English, keep every detail exactly
#
# Checklist for TYPE A: specific research tasks to gather BEFORE writing
# Checklist for TYPE B: ["No action needed — read and understand this section"]
#
# Flags: only deadlines, dollar amounts, or required documents visible in THIS image.
#
# Never make up specific dollar amounts, local business names, or statistics."""
BUSINESS_PLAN_PROMPT = GENERAL_PROMPT  # Fallback — uses the general prompt if somehow called

# DEPRECATED — use FORM_EXPLAINER_FULL_PROMPT instead, which includes neuroinclusive rules and accuracy guardrails.
# FORM_EXPLAINER_PROMPT = """You help people understand blank forms — government applications, school enrolment forms,
# ACC claims, tax forms, tenancy agreements, consent forms, or any document with fields to fill in.
#
# Your job is to go through EVERY field, checkbox, and section visible in the image and explain in plain English:
# - What it's asking for
# - What kind of information to put there
# - Where to find that information if it's not obvious
# - Any common mistakes to avoid
#
# Read ALL the text in the image. Look at every label, field, checkbox, dropdown, and instruction.
#
# Return ONLY this JSON (no markdown, no preamble):
# {
#   "original_text": "The form title or heading visible in the image",
#   "simplified_text": "• [field-by-field explanations as bullets]",
#   "checklist": ["Item 1", "Item 2"],
#   "flags": {"deadlines": [], "amounts": [], "documents_needed": []}
# }
#
# For simplified_text, write one or more bullets per field/section in this format:
# • **[Field name or label]** — What this is asking for in plain English.
#
# Rules:
# - Go through the form TOP TO BOTTOM, LEFT TO RIGHT — don't skip any field
# - If a field says something like "IRD number" or "NSN", explain what that is and where to find it
# - If there are checkboxes, explain what each option means and when to tick it
# - If there's fine print or conditions, explain what they actually mean
# - Use plain language a 12-year-old could understand
# - Keep every explanation to 1-2 sentences max
# - If a section says "Office use only" or similar, say "Skip this — the office fills this in, not you"
#
# For the checklist: list everything the person needs to GATHER BEFORE they can fill in this form
# For flags: only deadlines, dollar amounts, or documents/ID mentioned in THIS image."""
FORM_EXPLAINER_PROMPT = GENERAL_PROMPT  # Fallback — uses the general prompt if somehow called


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


FORM_EXPLAINER_FULL_PROMPT = SECTION_2_NEUROINCLUSIVE + SECTION_4_ACCURACY + """You help people understand forms — government applications, school enrolment forms, ACC claims, tax forms, tenancy agreements, consent forms, or any document with fields to fill in.

Look at this form image carefully. Go through EVERY field, checkbox, section, and instruction from top to bottom, left to right.

For each field or section, explain:
- What it's asking for in plain English
- What kind of information to put there
- Where to find that information if it's not obvious
- Any common mistakes to avoid

Return ONLY this JSON (no markdown, no preamble):
{{
  "title": "The form title or heading",
  "fields": [
    {{
      "type": "field|checkbox|section|instruction|office_only",
      "label": "The exact label or text from the form",
      "explanation": "What this is asking for in plain English — 1-2 sentences",
      "tip": "Where to find the answer, or a common mistake to avoid (or null if obvious)",
      "number": null
    }}
  ],
  "gather_first": ["Thing to gather before starting, e.g. Find your IRD number — on any letter from IRD"],
  "flags": {{"deadlines": [], "amounts": [], "documents_needed": []}}
}}

Rules:
- Go through every field in the exact order it appears in the original form. Do not skip, merge, or reorder any fields.
- Never drop any condition, deadline, amount, or requirement.
- Do not give advice about what to put — only explain what the field is asking and where to find the answer.
- Go TOP TO BOTTOM, LEFT TO RIGHT — don't skip ANY field
- For fields like "IRD number" or "NSN", explain what it is and where to find it
- For checkboxes, explain what each option means and when to tick it
- For fine print or conditions, explain what they actually mean
- If a section says "Office use only", set type to "office_only" and explanation to "Skip this — the office fills this in, not you"
- Use plain language a 12-year-old could understand
- Keep every explanation to 1-2 sentences max
- For gather_first: list everything the person needs to have ready BEFORE they start filling in (documents, numbers, details)
- For flags: only deadlines, amounts, or documents visible in THIS image"""


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
                    {"type": "text", "text": FORM_EXPLAINER_FULL_PROMPT},
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
