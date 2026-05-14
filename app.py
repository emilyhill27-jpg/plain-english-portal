"""
Plain English Portal — FastAPI backend
Translates legal, financial, and policy text into 3 reading-level tiers
using Claude Sonnet 4.6.
Production: also serves the built Vite frontend from the same origin.
"""
import os
from pathlib import Path
from typing import Literal

from anthropic import Anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent

# Force explicit absolute path lookup for the local .env configuration file
load_dotenv(dotenv_path=BASE_DIR / ".env")

API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not API_KEY:
    raise RuntimeError(
        "ANTHROPIC_API_KEY not found. Set it in .env locally or as a Render secret."
    )

client = Anthropic(api_key=API_KEY)
MODEL = "claude-sonnet-4-6"
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

app = FastAPI(title="Plain English Portal", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Tier = Literal["ELEMENTARY", "HIGHSCHOOL", "ADULT"]

TIER_INSTRUCTIONS = {
    "ELEMENTARY": (
        "Rewrite the text so a 9-year-old can understand it. "
        "Use short sentences (max 10 words), simple words, and concrete examples. "
        "Replace every legal or financial jargon term with a plain alternative. "
        "Use active voice. Output ONLY the rewritten text — no preamble, no notes."
    ),
    "HIGHSCHOOL": (
        "Rewrite the text at roughly a 9th-grade reading level. "
        "Keep all legally important meaning, but use plain modern English. "
        "Use clear short paragraphs and active voice. "
        "Output ONLY the rewritten text — no preamble, no notes."
    ),
    "ADULT": (
        "Rewrite the text at a clear adult reading level. "
        "Preserve precise legal meaning while removing unnecessary jargon, "
        "archaic phrasing, and run-on sentences. "
        "Output ONLY the rewritten text — no preamble, no notes."
    ),
}

SYSTEM_PROMPT = (
    "You are an accessibility translator for the Plain English Portal. "
    "Your job is to make legal, financial, and contract language understandable "
    "for people of different reading abilities. "
    "Never add disclaimers, opinions, apologies, or commentary."
)


class TranslatePayload(BaseModel):
    text: str = Field(..., min_length=1, max_length=20000)
    tier: Tier


class TranslateResult(BaseModel):
    result: str
    tier: Tier
    model: str


# --- API routes (all under /api/) -------------------------------------------

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Plain English Portal",
        "model": MODEL,
        "frontend_built": FRONTEND_DIST.exists(),
    }


@app.post("/api/translate", response_model=TranslateResult)
def translate(payload: TranslatePayload):
    instruction = TIER_INSTRUCTIONS[payload.tier]
    try:
        message = client.messages.create(
            model=MODEL,
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"{instruction}\n\nTEXT TO REWRITE:\n{payload.text}",
                }
            ],
        )
        rewritten = message.content[0].text.strip()
        return TranslateResult(result=rewritten, tier=payload.tier, model=MODEL)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")


# --- Static frontend serving -----------------------------------------------

if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=str(assets_dir)),
            name="assets",
        )

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
        return {
            "status": "dev_mode",
            "message": (
                "frontend/dist/ not found. In local dev, use Vite at "
                "http://localhost:5173. To produce a prod build, run "
                "`cd frontend && npm run build`."
            ),
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
