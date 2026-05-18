# Plainform — Project Handover

---

## About Emily

**Name:** Emily Hill, 45, Far North NZ. Partner Damian, 48.
**Family:** Amaya 13 (dyslexia, undiagnosed ADD), Niko 10 (ADHD, undiagnosed dyslexia), Ty 5 (undiagnosed ADHD and dyslexia). Emily getting ADHD diagnosed. Damian illiterate, undiagnosed ADHD and dyslexia. Whole family is neurodivergent. On the benefit 9+ years.
**Background:** 20+ years recruitment and sales. No tech background.
**Goal:** Scaleable work-from-home business. Own home. Set up for life.

## How Emily likes to work — READ THIS FIRST

- **Finish one task completely before starting another.** Do not offer two options and leave one unfinished.
- **Do not go off on tangents.** If something else comes up, note it and come back to it later.
- **Plain English only.** No jargon unless explained.
- **Keep momentum going.** Execution is the hard part — make it as simple as possible.
- **Update this file at the end of every session** so the next chat starts fresh with accurate info.

---

## What Plainform Is

A dyslexia accessibility web app. Upload any PDF or image, draw a box around any section, press Simplify, get a plain-English explanation with bullet points, checklist, and audio playback.

Built from lived experience — Emily's entire family struggles with complex paperwork.

**Business model:** Free for individuals. Sell to organisations — WINZ, IRD, insurance companies, schools, councils.

---

## Current State — What Is Built and Working

### Landing page (newly added in latest session)
- Animated demo showing the 4-step flow
- Hero section with headline, upload dropzone, Get Started button
- "How it works" 3-step section
- Dyslexia-friendly design: warm off-white background, Arial font, teal accent, high contrast
- Drag and drop file upload directly from the landing page takes user straight into the app

### Main app (the two-panel tool)
- PDF and image upload (drag & drop or browse)
- Multi-page PDF with thumbnail sidebar (150px wide, scrollable)
- Zoom controls (40%–300%) and page navigation arrows
- Rubber-band drag-to-select any region on the document
- Crop preview shows selected section before simplifying
- Bullet-point plain English output
- Numbered checklist with clickable items
- Audio: Play All / Pause / Stop + click any word to play from that point + voice selector
- Three document modes (toggle in right panel):
  - 📄 General — plain English rewrite for any form, letter, or school work
  - 📋 Business plan — coaching mode for WINZ business plan applications
  - 📚 School — explains at the child's actual reading age (not school year), with age selector: Age 5–6, Age 7–8, Age 9–10, Age 11–12
- Print (hides left panel, right panel only)
- New document button resets everything
- Checklist popup drawer
- Important Details flags (deadlines, amounts, documents needed)

---

## Tech Stack

- **Backend:** FastAPI + PyMuPDF (fitz) + Anthropic SDK → `app.py`
- **Frontend:** React + Vite → `frontend/src/App.jsx` (~870 lines)
- **AI model:** Claude Sonnet 4.6 via vision API
- **API key:** `~/Desktop/plain-english/.env` → `ANTHROPIC_API_KEY`

**To start the server:**
```bash
cd ~/Desktop/plain-english
source venv/bin/activate
python3 -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

**After any change to App.jsx:**
```bash
cd ~/Desktop/plain-english/frontend && npm run build
```
Then restart the server.

**Local address:** http://127.0.0.1:8000

---

## Key Files

| File | Purpose |
|------|---------|
| `app.py` | FastAPI backend, AI prompts, all API routes |
| `frontend/src/App.jsx` | Entire React UI including landing page (~870 lines) |
| `.env` | ANTHROPIC_API_KEY |
| `frontend/dist/` | Built frontend — rebuild after JSX changes |
| `HANDOVER.md` | This file — update at end of every session |

---

## AI Prompts (in app.py)

- `GENERAL_PROMPT` — plain English rewrite for any document
- `BUSINESS_PLAN_PROMPT` — coaching mode for WINZ/Flexi Wage business plan applications

### Business Plan Prompt
Rewritten from official WINZ/MSD sources (workandincome.govt.nz). Key facts baked in:
- Business plan is sent to an independent external assessor who checks viability
- Assessor looks for: real market demand, realistic financials, genuine understanding of the business, relevant skills, clear plan for getting customers
- Prompt now gives users the actual viability criteria — not AI roleplay guesses

---

## Session Notes — 19 May 2026 (continued)

### What was done (second session)
- **School mode added** — third mode button "📚 School" in the mode toggle
  - When selected, a reading age selector appears: Age 5–6, Age 7–8, Age 9–10, Age 11–12
  - Pick the age the child actually reads at — not their school year
  - `app.py`: Added `make_school_prompt(reading_age)` function — generates a prompt tuned to that reading level (vocabulary complexity, sentence length, example style)
  - `app.py`: `/api/simplify` endpoint detects `school_` prefix in audience_profile and calls `make_school_prompt` with the extracted age
  - `App.jsx`: `readingAge` state, updated mode toggle to 3 buttons, age selector UI, passes `school_7-8` (etc) as audience_profile
  - CSS updated: `.mode-btn:not(:last-child)` so dividers work for 3 buttons; added `.age-btn` and `.age-active` styles
- Frontend rebuilt successfully

---

## Session Notes — 19 May 2026

### What was done
- Fixed 4 broken features in `frontend/src/App.jsx`:
  1. **Thumbnail strip restored** — added JSX back to `renderLeft()` as a sibling to `.doc-viewer`. Only shows for multi-page PDFs. Clicking a thumbnail scrolls the doc viewer to that page.
  2. **Toolbar fixed at top** — moved `.page-nav` outside the scrollable `.doc-viewer` div. Restructured `renderLeft()` so the outer div uses `flexDirection: "column"`, toolbar sits at the top (never scrolls), and the thumbnail strip + doc viewer sit below in a horizontal flex row.
  3. **Rubber-band selection fixed** — added `onMouseMove`, `onMouseUp`, `onMouseLeave` to the `.doc-viewer` container div so dragging works even when cursor moves fast off a page.
  4. **Landing page demo animated** — replaced `const step = 3` with `useState(0)` + `useEffect` that cycles through steps 0→1→2→3 automatically with realistic delays.
- Frontend rebuilt successfully after changes.

### To start the server (always from Desktop version)
```bash
cd ~/Desktop/plain-english
source venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

---

## Pending Tasks — IN ORDER, ONE AT A TIME

1. **Domain** — check if plainform.co.nz is available
2. **Deploy** — Render.com config already exists in `render.yaml`

---

---

## Key Decisions Already Made

- No document type selector — replaced with simple two-button toggle (General / Business Plan)
- Client-side canvas crop — server-side had coordinate bugs, client-side is always accurate
- No guiding questions — removed, they asked things users couldn't answer
- One universal prompt for general documents instead of separate academic/government prompts
