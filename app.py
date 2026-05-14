"""
Plain English Portal — FastAPI backend
Translates legal, financial, and policy text into 3 reading-level tiers
using Claude 3.5 Sonnet.
"""
import os
from typing import Literal

from anthropic import Anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not API_KEY:
    raise RuntimeError(
        "ANTHROPIC_API_KEY not found. Add it to ~/plain-english/.env"
    )

client = Anthropic(api_key=API_KEY)
MODEL = "claude-sonnet-4-6"

app = FastAPI(title="Plain English Portal", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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


@app.get("/")
def health():
    return {"status": "ok", "service": "Plain English Portal", "model": MODEL}


@app.post("/translate", response_model=TranslateResult)
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
        return TranslateResult(
            result=rewritten, tier=payload.tier, model=MODEL
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
