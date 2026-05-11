import os
import json
import re
import uuid
import base64
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent / '.env', override=True)
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import anthropic
import fitz  # PyMuPDF
import httpx
from typing import Optional

app = FastAPI(title="Plain English")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

app.mount("/static", StaticFiles(directory="static"), name="static")

# Temporary in-memory PDF store (session_id -> pdf_bytes)
_pdf_store: dict = {}


@app.get("/")
async def root():
    with open("static/index.html") as f:
        return HTMLResponse(f.read())


# ─── PDF helpers ────────────────────────────────────────────

def store_pdf(pdf_bytes: bytes) -> str:
    sid = str(uuid.uuid4())[:12]
    _pdf_store[sid] = pdf_bytes
    # Keep store from growing unbounded
    if len(_pdf_store) > 50:
        oldest = list(_pdf_store.keys())[0]
        del _pdf_store[oldest]
    return sid


def extract_pdf_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for page in doc:
        text = page.get_text("text")
        if text.strip():
            pages.append(text)
    doc.close()
    full_text = "\n\n".join(pages)
    full_text = re.sub(r'\n{3,}', '\n\n', full_text)
    full_text = re.sub(r'[ \t]{2,}', ' ', full_text)
    full_text = re.sub(r'(\w)-\n(\w)', r'\1\2', full_text)
    return full_text.strip()


def render_pdf_pages(pdf_bytes: bytes) -> list:
    """Render each PDF page as a base64 JPEG image."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for i, page in enumerate(doc):
        mat = fitz.Matrix(1.5, 1.5)  # 108 DPI — clear but not huge
        pix = page.get_pixmap(matrix=mat)
        # Convert to JPEG bytes
        img_bytes = pix.tobytes("jpeg")
        img_b64 = base64.b64encode(img_bytes).decode()
        pages.append({
            "page": i,
            "width": pix.width,
            "height": pix.height,
            "orig_width": page.rect.width,
            "orig_height": page.rect.height,
            "image": f"data:image/jpeg;base64,{img_b64}",
        })
    doc.close()
    return pages


def find_positions(pdf_bytes: bytes, questions: list) -> dict:
    """
    Find bounding boxes for each question in the PDF using text block matching.
    Returns {question_id: {page, x, y, w, h}} — all as % of page size.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    # Extract all text blocks with their bounding boxes from every page
    all_blocks = []
    for page_num, page in enumerate(doc):
        pw, ph = page.rect.width, page.rect.height
        # "blocks" gives (x0,y0,x1,y1,text,block_no,block_type)
        for b in page.get_text("blocks"):
            if b[6] == 0 and b[4].strip():  # text blocks only
                all_blocks.append({
                    "page": page_num,
                    "x0": b[0], "y0": b[1],
                    "x1": b[2], "y1": b[3],
                    "text": b[4].strip(),
                    "pw": pw, "ph": ph,
                })

    positions = {}

    for q in questions:
        qid   = str(q.get("id") or q.get("_num", ""))
        needle = (q.get("original") or "").strip()
        if not needle or not qid:
            continue

        found = False

        # ── Pass 1: search_for the first 5 words (fast, exact) ──
        first_words = " ".join(needle.split()[:5])
        if len(first_words) >= 4:
            for page_num, page in enumerate(doc):
                rects = page.search_for(first_words)
                if rects:
                    r  = rects[0]
                    pw = page.rect.width
                    ph = page.rect.height
                    positions[qid] = {
                        "page": page_num,
                        "x": round(r.x0 / pw * 100, 2),
                        "y": round(r.y0 / ph * 100, 2),
                        "w": round(max((r.x1 - r.x0) / pw * 100, 20), 2),
                        "h": round(max((r.y1 - r.y0) / ph * 100, 2.0), 2),
                    }
                    found = True
                    break

        if found:
            continue

        # ── Pass 2: word-set overlap against extracted text blocks ──
        stop = {"the","and","for","are","you","your","this","that",
                "with","have","from","not","but","they","what","when"}
        needle_words = {
            w.lower().strip(".,?:;()[]\"'")
            for w in needle.split()
            if len(w) > 2 and w.lower() not in stop
        }
        if not needle_words:
            continue

        best_score = 0.0
        best_block = None

        for blk in all_blocks:
            blk_words = {
                w.lower().strip(".,?:;()[]\"'")
                for w in blk["text"].split()
            }
            overlap = len(needle_words & blk_words)
            score   = overlap / len(needle_words)
            if score > best_score:
                best_score = score
                best_block = blk

        if best_block and best_score >= 0.3:
            pw, ph = best_block["pw"], best_block["ph"]
            positions[qid] = {
                "page": best_block["page"],
                "x":    round(best_block["x0"] / pw * 100, 2),
                "y":    round(best_block["y0"] / ph * 100, 2),
                "w":    round(max((best_block["x1"] - best_block["x0"]) / pw * 100, 20), 2),
                "h":    round(max((best_block["y1"] - best_block["y0"]) / ph * 100, 2.0), 2),
            }

    doc.close()
    return positions


def detect_doc_type(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ['ministry', 'government', 'msd', 'winz', 'benefit',
                             'application form', 'grant', 'inland revenue', 'ird', 'acc']):
        return 'government_form'
    elif any(w in t for w in ['business plan', 'executive summary', 'market analysis',
                               'financial projections', 'competitive analysis', 'swot']):
        return 'business_plan'
    elif any(w in t for w in ['agreement', 'contract', 'parties', 'whereas',
                               'hereby', 'shall', 'indemnify', 'liability', 'termination']):
        return 'contract'
    return 'general'


# ─── Prompts ────────────────────────────────────────────────

QUESTION_PROMPTS = {
    'government_form': """You are helping someone with dyslexia understand a New Zealand government form.

Identify EVERY question, field, checkbox, and section that requires a response.

For each one return a JSON object with these exact keys:
- "id": integer starting at 1
- "original": the exact text from the form (copy it word for word, keep it short — the question text only, not surrounding instructions)
- "plain_english": what they're actually asking, explained like you're talking to a smart 12-year-old (2-3 clear sentences, no jargon)
- "example": a very specific, realistic example — name a real thing (e.g. "Write: John Smith" not just "your name")
- "why_they_ask": one simple sentence explaining why the government needs this
- "tips": practical advice — format to use, documents to have ready, what happens if you leave it blank (1-2 sentences)
- "required": true if mandatory, false if optional

Return ONLY a valid JSON array. No text before or after.""",

    'business_plan': """You are helping a small business owner in New Zealand complete a business plan.

Identify every section, heading, and question.

For each one return a JSON object with these exact keys:
- "id": integer starting at 1
- "original": the exact heading or question text (short — just the heading/question itself)
- "plain_english": what they're really being asked to write about (3-4 sentences, plain language)
- "example": a detailed realistic example written AS IF it were a real answer for a small NZ business — write 4-6 sentences of actual example content
- "why_they_ask": why banks or grant providers need this (1-2 sentences)
- "tips": what makes a strong answer here (2-3 sentences)
- "common_mistakes": what people usually get wrong (1-2 sentences)
- "required": true/false

Return ONLY a valid JSON array. Nothing before [ or after ].""",

    'contract': """You are helping someone understand a legal contract before they sign it.

Identify every clause, obligation, right, and important term.

For each one return a JSON object with these exact keys:
- "id": integer starting at 1
- "original": the exact clause text (keep to first 100 chars if very long)
- "plain_english": what this clause means in everyday language (2-3 sentences, no legal terms)
- "what_you_agree_to": specifically what you are committing to (1-2 sentences)
- "watch_out_for": any risk or important detail to be aware of (1-2 sentences)
- "example": a real-world scenario showing how this clause would play out
- "can_negotiate": true if typically negotiable, false if standard

Return ONLY a valid JSON array. Nothing before [ or after ].""",

    'general': """You are helping someone understand a complex document.

Identify every question, requirement, and important point.

For each one return a JSON object:
- "id": integer starting at 1
- "original": the exact text (keep short — just the key phrase)
- "plain_english": what this means in simple language (2-3 sentences)
- "example": a helpful specific example
- "tips": practical guidance (1-2 sentences)
- "required": true/false

Return ONLY a valid JSON array. Nothing before [ or after ]."""
}

SUMMARY_PROMPTS = {
    'government_form': """Explain this government form in plain English for someone with dyslexia.
Use short sentences. Simple words. Structure with these headings:

## What is this form?
## What you need before you start
## Step by step — what to do
## Important things to know
## Words explained

Form:
""",
    'business_plan': """Explain this business plan document in plain English.
Use short sentences. Simple words. Structure with these headings:

## What is this document?
## What you are being asked to create
## How to approach this
## What makes a strong answer
## Business words explained

Document:
""",
    'contract': """Explain this contract in plain English for a non-lawyer.
Use short sentences. No legal jargon. Structure with these headings:

## What is this contract?
## What you are agreeing to
## Your rights
## Important dates and deadlines
## Red flags to watch for
## Questions to ask before signing

Contract:
""",
    'general': """Convert this document to plain English.
Short sentences. Simple words.

## What this document is about
## Key points
## What you need to do
## Important information

Document:
"""
}


# ─── API Routes ─────────────────────────────────────────────

@app.post("/api/extract")
async def extract_document(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
):
    doc_text = ""
    session_id = None

    if file and file.filename:
        content = await file.read()
        name = file.filename.lower()
        if name.endswith(".pdf"):
            try:
                doc_text = extract_pdf_text(content)
                session_id = store_pdf(content)
            except Exception as e:
                raise HTTPException(400, f"Could not read this PDF: {e}. Try copying and pasting the text instead.")
        else:
            doc_text = content.decode("utf-8", errors="replace")

    elif url and url.strip():
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30) as http:
                resp = await http.get(url.strip())
                resp.raise_for_status()
                ct = resp.headers.get("content-type", "")
                if "pdf" in ct or url.lower().endswith(".pdf"):
                    doc_text = extract_pdf_text(resp.content)
                    session_id = store_pdf(resp.content)
                else:
                    doc_text = resp.text
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(400, f"Could not load that URL: {e}")

    elif text and text.strip():
        doc_text = text.strip()

    else:
        raise HTTPException(400, "Please upload a file, paste text, or enter a URL.")

    if len(doc_text.strip()) < 50:
        raise HTTPException(
            400,
            "Could not read enough text from this document. It may be a scanned image PDF. "
            "Try copying and pasting the text from the document instead."
        )

    doc_type = detect_doc_type(doc_text)

    return {
        "text": doc_text[:20000],
        "doc_type": doc_type,
        "session_id": session_id,
        "has_pdf": session_id is not None,
    }


def extract_text_blocks(pdf_bytes: bytes) -> list:
    """Return text blocks with normalized bounding boxes (0–1) per page."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    all_blocks = []
    for page_num, page in enumerate(doc):
        pw, ph = page.rect.width, page.rect.height
        for b in page.get_text("blocks"):
            if b[6] == 0 and b[4].strip():  # text blocks only
                all_blocks.append({
                    "page": page_num,
                    "x0": round(b[0] / pw, 4),
                    "y0": round(b[1] / ph, 4),
                    "x1": round(b[2] / pw, 4),
                    "y1": round(b[3] / ph, 4),
                    "text": b[4].strip(),
                })
    doc.close()
    return all_blocks


@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a PDF → returns session_id (for page images) and text blocks."""
    content = await file.read()
    try:
        session_id = store_pdf(content)
        blocks = extract_text_blocks(content)
        pages = render_pdf_pages(content)
        page_sizes = [{"width": p["width"], "height": p["height"]} for p in pages]
        return {"session_id": session_id, "blocks": blocks, "page_sizes": page_sizes}
    except Exception as e:
        raise HTTPException(400, f"Could not read PDF: {e}")


@app.post("/api/ocr")
async def ocr_image(file: UploadFile = File(...)):
    content = await file.read()
    media_type = file.content_type or "image/jpeg"
    if media_type not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
        raise HTTPException(400, "Please upload a JPG, PNG, or WebP image.")

    b64 = base64.b64encode(content).decode()

    try:
        msg = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=4000,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": media_type, "data": b64},
                    },
                    {
                        "type": "text",
                        "text": (
                            "Extract all the text from this worksheet image exactly as it appears. "
                            "Preserve the structure: headings, questions, labels, and any fill-in fields. "
                            "Output plain text only — no markdown, no commentary."
                        ),
                    },
                ],
            }],
        )
        return {"text": msg.content[0].text}
    except Exception as e:
        raise HTTPException(500, f"OCR failed: {e}")


@app.post("/api/to-markdown")
async def pdf_to_markdown(file: UploadFile = File(...)):
    content = await file.read()
    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as e:
        raise HTTPException(400, f"Could not read PDF: {e}")

    pages_md = []
    for page in doc:
        md = page.get_text("markdown")
        if md.strip():
            pages_md.append(md.strip())
    doc.close()

    if not pages_md:
        raise HTTPException(400, "No readable text found in this PDF.")

    return {"markdown": "\n\n---\n\n".join(pages_md)}


@app.get("/api/render/{session_id}")
async def render_pdf(session_id: str):
    pdf_bytes = _pdf_store.get(session_id)
    if not pdf_bytes:
        raise HTTPException(404, "Session not found — please re-upload the document.")
    try:
        pages = render_pdf_pages(pdf_bytes)
        return {"pages": pages}
    except Exception as e:
        raise HTTPException(500, f"Could not render PDF: {e}")


@app.post("/api/locate")
async def locate_questions(request: Request):
    body = await request.json()
    session_id = body.get("session_id")
    questions = body.get("questions", [])

    if not session_id:
        return {"positions": {}}

    pdf_bytes = _pdf_store.get(session_id)
    if not pdf_bytes:
        return {"positions": {}}

    try:
        positions = find_positions(pdf_bytes, questions)
        return {"positions": positions}
    except Exception as e:
        return {"positions": {}}


@app.post("/api/questions")
async def get_questions(request: Request):
    body = await request.json()
    doc_text = body.get("text", "")
    doc_type = body.get("doc_type", "general")

    if not doc_text:
        raise HTTPException(400, "No text provided")

    prompt = QUESTION_PROMPTS.get(doc_type, QUESTION_PROMPTS["general"])

    def generate():
        buffer = ""
        depth = 0
        obj_start = None
        q_count = 0

        try:
            with client.messages.stream(
                model="claude-opus-4-7",
                max_tokens=16000,
                messages=[{"role": "user", "content": prompt + "\n\nDocument:\n" + doc_text[:15000]}],
            ) as stream:
                for chunk in stream.text_stream:
                    buffer += chunk
                    i = 0
                    while i < len(buffer):
                        ch = buffer[i]
                        if ch == '{':
                            if depth == 0:
                                obj_start = i
                            depth += 1
                        elif ch == '}':
                            depth -= 1
                            if depth == 0 and obj_start is not None:
                                obj_str = buffer[obj_start:i + 1]
                                try:
                                    obj = json.loads(obj_str)
                                    q_count += 1
                                    obj['id'] = obj.get('id', q_count)
                                    yield f"data: {json.dumps(obj)}\n\n"
                                except Exception:
                                    pass
                                buffer = buffer[i + 1:]
                                i = -1
                                obj_start = None
                        i += 1

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/simplify")
async def simplify_text(request: Request):
    body = await request.json()
    text = body.get("text", "").strip()
    system = body.get("system", "").strip()

    if not text:
        raise HTTPException(400, "No text provided")

    def generate():
        try:
            kwargs = dict(
                model="claude-opus-4-7",
                max_tokens=1000,
                messages=[{"role": "user", "content": "Rewrite this in plain English:\n\n" + text}],
            )
            if system:
                kwargs["system"] = system
            with client.messages.stream(**kwargs) as stream:
                for chunk in stream.text_stream:
                    yield f"data: {json.dumps({'text': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/summary")
async def get_summary(request: Request):
    body = await request.json()
    doc_text = body.get("text", "")
    doc_type = body.get("doc_type", "general")

    if not doc_text:
        raise HTTPException(400, "No text provided")

    prompt = SUMMARY_PROMPTS.get(doc_type, SUMMARY_PROMPTS["general"])

    def generate():
        try:
            with client.messages.stream(
                model="claude-opus-4-7",
                max_tokens=3000,
                messages=[{"role": "user", "content": prompt + doc_text[:15000]}],
            ) as stream:
                for chunk in stream.text_stream:
                    yield f"data: {json.dumps({'text': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
