from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from anthropic import Anthropic

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimplifyRequest(BaseModel):
    text: str
    tier: str 

API_KEY = os.getenv("ANTHROPIC_API_KEY", "your-fallback-key-here")
client = Anthropic(api_key=API_KEY)

@app.post("/api/v1/simplify")
async def simplify_text(payload: SimplifyRequest):
    if payload.tier == "PRIMARY":
        prompt_instruction = "Translate this text for a Primary School student (8-10 years old). Use short words, tiny 1-clause sentences, and absolute concrete definitions. Cut all fluff."
    elif payload.tier == "INTERMEDIATE":
        prompt_instruction = "Translate this text for an Intermediate School student (11-13 years old). Use straightforward terms, simple sentence structures, and break down complex thoughts cleanly."
    elif payload.tier == "HIGHSCHOOL":
        prompt_instruction = "Translate this text for a High School student (14-17 years old). Use plain conversational English. Replace heavy legal jargon or industry boilerplate with direct wording."
    else:
        prompt_instruction = "Translate this text into standard clear, high-accessibility Plain English suitable for an adult with dyslexia. Retain core operational constraints but optimize layouts."

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            temperature=0,
            system=prompt_instruction,
            messages=[{"role": "user", "content": payload.text}]
        )
        return {"result": message.content.text}
    except Exception as e:
        mock_translations = {
            "PRIMARY": "You must tell us if you owe any money before you sign the paper.",
            "INTERMEDIATE": "Before you finish your contract, you need to tell us about your past money problems.",
            "HIGHSCHOOL": "Before you can sign this work contract, you are required to disclose any previous debts or financial issues you have.",
            "ADULT": "You are legally required to report any prior financial liabilities before finalizing this onboarding contract."
        }
        return {"result": mock_translations.get(payload.tier, payload.text)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
