# Plainly — Project Handover

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

## What Plainly Is

A web app that turns any confusing document into plain English. Upload a PDF or image, draw a box around any section, press Simplify, get a plain-English explanation with bullet points, checklist, and audio playback.

Built from lived experience — Emily's entire family struggles with complex paperwork:
- **Niko, 10** — gets Year 6 worksheets he can't decode. Sits there and falls behind.
- **Amaya, 13** — dyslexia, won't put her hand up. Quietly struggles through documents she can't process.
- **Emily** — tried to apply for the WINZ self-employment grant. It's a 50-page business plan. Near impossible to navigate.

**Product name:** Plainly (was "Plainform")
**Domain target:** tryplainly.co.nz

---

## Business Model — Confirmed

- **Free for end users** — always. No premium tier, no upsell.
- **White-label B2B** — organisations pay a licence fee to put their name on it. Plainly runs the backend.
- **Target customers:** Schools, community law centres, Citizens Advice Bureau, insurance brokers, immigration advisers, GP practices, small councils — organisations that deal with complex documents daily and can make a buying decision without a committee.
- **Do NOT lead with WINZ/IRD/big govt** — they have IT teams, procurement red tape, 12–18 month buying cycles. Approach them only after you have proven traction with smaller orgs.

## Investment Strategy — Confirmed

1. Get 2–3 paying customers first (even $200/month) — proof people will pay
2. Apply for Callaghan Innovation grant (non-dilutive, doesn't take equity)
3. With revenue + grant, polish the product
4. Then approach investors from a position of strength

---

## Design Language — Current (as of 25 May 2026)

Purple / lavender palette with rounded corners:

- **Fonts:** Lexend (headings + body), Open Sans (fallback body). Loaded from Google Fonts.
- **Accent colour:** Purple `#8c52ff`, hover `#7a3ef0`
- **Light accents:** `#EDE9FE` (purple light), `#F5F3FF` (purple pale)
- **Backgrounds:** `#FAFAFA` (main off-white), `#FFF9F0` (cream, reader default), hero gradient (lavender/pink/warm yellow)
- **Text colours:** `#1F2937` (dark), `#4B5563` (mid), `#6B7280` (soft)
- **Borders:** `#E5E7EB` (light grey)
- **Corners:** Rounded — 8px, 12px, 16px. Pill buttons use `border-radius: 999px`
- **Logo:** `logo-plainly.png` in `frontend/public/`
- **App page panels:** Left panel (document) has subtle border, right panel (result) has subtle border. Both inside a rounded outer shell with shadow.

**NOTE:** The old design (terracotta `#bf5030`, Playfair Display, Atkinson Hyperlegible, sand banding `#ede4d4`, square corners) is GONE. Do not reference it.

---

## Current State — What Is Built and Working

### Landing page
- Nav bar: Plainly logo, Home, How it works, For schools, Pricing, Resources, Reader settings button, Log in, Get started
- Hero section: gradient background (lavender/pink/yellow), badge "Free · No sign-up · No data stored", headline "Any document. Plain and simple.", subtitle, CTA button, trust badges
- Demo card: mini split-view showing a tenancy agreement clause on the left and plain English version on the right
- Feature cards (4): Simplify documents, Made for students and schools, Accessible for everyone, Safe supportive and private
- CTA section: "Because everyone deserves to feel in the loop"
- Footer: privacy messaging
- Reader settings bar: text size (4 options), font (Lexend/Open Sans/Arial), spacing (3 options), background tint (cream/blue/lilac/grey), reset button — settings now actually work on landing page text

### B2B landing page (`frontend/public/b2b.html`)
- Standalone HTML served at `/b2b.html`
- Pricing: Starter $299/mo · Organisation $699/mo · Enterprise custom

### App page (the two-panel tool)
- Top nav: Plainly logo (links home), nav links, Reader settings button, Load new document button
- Progress steps: Upload → Settings → Result
- Reader settings bar: same as landing page, works on result text
- **Left panel (document):**
  - PDF and image upload (drag & drop or browse)
  - Multi-page PDF with thumbnail sidebar
  - Zoom controls and page navigation
  - Rubber-band drag-to-select any region on the document
  - Auto-simplifies when selection is drawn
- **Right panel (result):**
  - Reading support card (collapsible): year level slider, reading level slider
  - Crop preview: shows what you selected from the document
  - "Plain-English version" label
  - Listen controls: play/pause, stop, voice selector, speed control (0.5x/0.75x/1x/1.25x)
  - Simplified text with clickable words (click to play from that word, current word highlighted yellow)
  - Important details: deadlines, amounts, documents needed (with icons)
  - Checklist: "What you need to do" with tickable checkboxes
  - Prompts & examples (expandable)
  - Print button
- Three document modes: General / Business Plan / School (with reading age)
- Text-to-speech reads all sections (simplified text + important details + checklist) with Chrome keepalive fix

---

## Tech Stack

- **Backend:** FastAPI + PyMuPDF (fitz) + Anthropic SDK → `app.py`
- **Frontend:** React + Vite → `frontend/src/App.jsx`
- **AI model:** Claude Sonnet 4.6 via vision API
- **API key:** `~/Desktop/plain-english/.env` → `ANTHROPIC_API_KEY`
- **Deploy:** Render.com — `render.yaml` already configured, auto-deploys from GitHub on push to `main`
- **GitHub:** `emilyhill27-jpg/plain-english-portal`

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

**To deploy:** `git add frontend/src/App.jsx && git commit -m "..." && git push origin main`
Do NOT add `frontend/dist/` — it's in .gitignore. Render rebuilds from source.

**Local address:** http://127.0.0.1:8000

---

## Key Files

| File | Purpose |
|------|---------|
| `app.py` | FastAPI backend, AI prompts, all API routes |
| `frontend/src/App.jsx` | Entire React UI — landing page + app page |
| `.env` | ANTHROPIC_API_KEY |
| `frontend/dist/` | Built frontend — rebuild after JSX changes |
| `frontend/public/b2b.html` | B2B landing page (standalone) |
| `frontend/public/logo-plainly.png` | Site logo |
| `HANDOVER.md` | This file — update at end of every session |
| `CLAUDE.md` | Quick reference loaded into every conversation |

---

## Pending Tasks — IN ORDER, ONE AT A TIME

1. **Business Plan prompt** — currently uses AI-generated WINZ criteria, not official. Could mislead vulnerable users. Fix before going public.
2. **Domain** — check if tryplainly.co.nz is available
3. **First paying customer** — approach one school, community org, or adviser. Don't wait for it to be perfect.

---

## Key Decisions Already Made

- Product name is **Plainly** (not Plainform)
- Business model is **white-label B2B** — always free to end users, organisations pay licence
- Do not sell to big government first — start with small orgs who can decide fast
- Get paying customers before approaching investors
- Apply for Callaghan Innovation grant as non-dilutive first funding
- Design: purple/lavender palette, Lexend font, rounded corners (NOT terracotta/Playfair/sand banding — that was the old design)
- Client-side canvas crop (not server-side — coordinate bugs)
- No guiding questions — removed
- One universal general prompt, not separate academic/government prompts
