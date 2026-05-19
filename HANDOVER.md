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

## Current State — What Is Built and Working

### Landing page
- Full editorial landing page built from Emily's Canva HTML export
- Sections: hero with live demo card, scrolling ticker, stats bar (851K / 26% / 1 in 5 / 15–20%), How it works (3 steps), What Plainly reads (3 cards), School module feature, AI/technology section, Promises strip, CTA, Footer
- Live demo card: tabs for WINZ letter / IRD notice / School form — shows before/after plainification
- Drag-and-drop file upload on hero goes straight into the app
- All CTA buttons connect to the app

### App page (the two-panel tool)
- PDF and image upload (drag & drop or browse)
- Multi-page PDF with thumbnail sidebar
- Zoom controls and page navigation
- Rubber-band drag-to-select any region on the document
- Crop preview shows selected section
- Bullet-point plain English output
- Numbered checklist with clickable items
- Audio: Play All / Pause / Stop + click any word to play from that point + voice selector
- Three document modes:
  - 📄 General — plain English rewrite for any document
  - 📋 Business plan — coaching mode for WINZ business plan applications
  - 📚 School — explains at the child's actual reading age (Age 5–6, 7–8, 9–10, 11–12)
- Print, New document, Checklist drawer

### Design system (both pages now match)
- **Fonts:** Playfair Display (headings/logo) + Atkinson Hyperlegible (body)
- **Accent colour:** Terracotta `#bf5030`
- **Backgrounds:** Warm cream `#f6f0e6`, warm white `#fdfaf5`
- **Text:** Near-black `#1c1710`
- **No black backgrounds** — dark sections use forest sage `#3D5C40`
- **Square corners** — no pill buttons, no heavy border-radius
- App page nav matches landing page nav exactly (Playfair Display "Plain**ly**" logo, cream bg, terracotta accent)

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
| `HANDOVER.md` | This file — update at end of every session |

---

## Pending Tasks — IN ORDER, ONE AT A TIME

1. **App page polish** — Emily noted buttons don't flow properly, app page aesthetic needs to be tighter match to landing page. She's having a think overnight, pick this up next session.
2. **Push to GitHub / deploy** — not yet pushed since the big redesign. Run build + push when app page polish is done.
3. **Business Plan prompt** — currently uses AI-generated WINZ criteria, not official. Could mislead vulnerable users. Fix before going public.
4. **Domain** — check if tryplainly.co.nz is available
5. **First paying customer** — approach one school, community org, or adviser. Don't wait for it to be perfect.

---

## Key Decisions Already Made

- Product name is **Plainly** (not Plainform)
- Business model is **white-label B2B** — always free to end users, organisations pay licence
- Do not sell to big government first — start with small orgs who can decide fast
- Get paying customers before approaching investors
- Apply for Callaghan Innovation grant as non-dilutive first funding
- No black backgrounds anywhere in the UI
- Design: Playfair Display + Atkinson Hyperlegible, terracotta accent, cream/warm palette, square corners
- Client-side canvas crop (not server-side — coordinate bugs)
- No guiding questions — removed
- One universal general prompt, not separate academic/government prompts
