# Plainly — Claude Working Memory

> Read this at the start of every session. Full detail lives in HANDOVER.md.

---

## Who I'm working with

**Emily Hill**, 45, Far North NZ. 20+ years recruitment/sales, no tech background. Whole family is neurodivergent (ADHD, dyslexia). Building a work-from-home business. Goal: own home, set up for life.

## How Emily likes to work — NON-NEGOTIABLE

- **Finish one task completely before starting another**
- **No jargon** — plain English only, explain anything technical
- **No tangents** — note it, come back later
- **Keep momentum** — execution is the hard part, make it simple
- **Update HANDOVER.md at the end of every session**

---

## The Project: Plainly

A web app that turns confusing documents into plain English. Upload a PDF or image, draw a box around any section, press Simplify — get plain-English output with bullet points, checklist, and audio playback.

**Built from lived experience.** Emily's family can't navigate complex paperwork: WINZ forms, school worksheets, IRD notices.

- **Product name:** Plainly (previously "Plainform" — always use Plainly)
- **Domain target:** tryplainly.co.nz
- **Repo:** `emilyhill27-jpg/plain-english-portal` (GitHub)
- **Deployed:** Render.com (auto-deploys on push to `main`)
- **Local folder:** `~/Desktop/plain-english`

---

## Business model — locked in

- **Always free for end users** — no exceptions
- **White-label B2B** — organisations pay licence ($299–$699/mo)
- **Target first:** Schools, community law, CAB, insurance brokers, GP practices, small councils — small orgs who can decide fast
- **Do NOT pitch big govt first** (WINZ/IRD) — too slow, 12–18 month cycles
- **Funding path:** 2–3 paying customers → Callaghan Innovation grant → polish → then investors

---

## Tech stack

| Layer | Details |
|-------|---------|
| Backend | FastAPI + PyMuPDF + Anthropic SDK → `app.py` |
| Frontend | React + Vite → `frontend/src/App.jsx` |
| AI | Claude Sonnet 4.6 (vision API) |
| Deploy | Render.com — `render.yaml` configured |

**Start locally:**
```bash
cd ~/Desktop/plain-english
source venv/bin/activate
python3 -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
Frontend: `cd frontend && npm run dev` → http://localhost:5173

**After JSX changes:** `cd frontend && npm run build` then push to deploy.

---

## Design system — what the site ACTUALLY looks like now

- **Fonts:** Lexend (headings + body) + Open Sans (fallback body)
- **Accent:** Purple `#8c52ff`, hover `#7a3ef0`
- **Light accents:** Purple light `#EDE9FE`, purple pale `#F5F3FF`
- **Backgrounds:** Off-white `#FAFAFA` (main), cream `#FFF9F0` (reader default), hero gradient (lavender → pink → warm yellow)
- **Text:** Dark grey `#1F2937`, mid `#4B5563`, soft `#6B7280`
- **Borders:** Light grey `#E5E7EB`
- **Rounded corners** — 8px/12px/16px radius, pill buttons (border-radius: 999px)
- **No sand banding** — clean white/off-white backgrounds
- **Logo:** `logo-plainly.png` in `frontend/public/`

---

## What's built and working

- Landing page: nav, hero with gradient background, demo card (tenancy agreement example), feature cards, CTA section, footer
- Reader settings bar: text size, font, spacing, background tint — works on both landing page and app page
- App page: PDF/image upload, multi-page PDF with thumbnail sidebar, drag-to-select region, crop preview on right panel, plain English output, checklist with tick boxes, important details (deadlines/amounts/documents)
- Audio: play/pause/stop, voice selector, speed control (0.5x/0.75x/1x/1.25x), click any word to play from there, word highlighting
- Three document modes: General / Business Plan / School (with reading age slider)
- Reading support panel (collapsible): year level slider, reading level slider
- Print button
- B2B landing page (`frontend/public/b2b.html`) — pricing at $299/$699/custom

---

## Pending tasks (in order — one at a time)

1. **Business Plan prompt** — uses AI-guessed WINZ criteria. Fix with official criteria before going public.
2. **Domain** — check if tryplainly.co.nz is available
3. **First paying customer** — one school, CAB, or adviser. Don't wait for perfect.

---

## Reference docs (in plain-english/docs/)

- `Plain Form - Summary.pdf` — early product summary
- `business-plan-template.pdf` — WINZ business plan template
- `What if we offered for free .textClipping` — early thinking on pricing model

---

## Key decisions already made — don't re-debate these

- Product name = **Plainly**
- B2B white-label model, free for end users
- Purple/lavender palette with Lexend font (NOT terracotta/Playfair — that was the old design)
- Client-side canvas crop (server-side had coordinate bugs)
- No guiding questions (removed — users couldn't answer them)
- One universal general prompt, not separate academic/government versions
- Start small orgs, not big government
