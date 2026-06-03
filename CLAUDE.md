# Plainly — Claude Working Memory
> Drop this file into any Claude Chat, Cowork, or Code session to get started.
> Last updated: 4 June 2026

> **Major update (4 June 2026):** Form explainer parallelised (12 pages now ~60-90s instead of ~10min). App.jsx split into presentational components. All 6 rulebook gaps fixed (domain rules, legislation, 3 new sectors, validator UI, page-anchored output). Full site copy aligned to B2B model — Plainly-branded by default, not white-label. All pages updated and pushed live.

> **Email signature (30 May 2026):** Option 1 — logo + purple divider + Emily Hill / Founder / hello@tryplainly.co.nz / 021 468 719 / tryplainly.co.nz. On Desktop: `.html` (clickable) and `.jpg` (image).

> **Desktop note (29 May 2026):** Emily's desktop is Plainly-only: `plain-english/`, `Plainly - Design Screenshots/`, `test-worksheet.pdf`, `⭐ START HERE.md`, `Filed - Not Plainly/`.

---

## Who I'm working with

**Emily Hill**, 45, Far North NZ. 20+ years recruitment/sales, no tech background. Whole family is neurodivergent (ADHD, dyslexia). Building a work-from-home business. Goal: own home, set up for life.

**Emily's partner:** Damian, 48 — illiterate, undiagnosed ADHD and dyslexia.
**Kids:** Amaya 13 (dyslexia, undiagnosed ADD), Niko 10 (ADHD, undiagnosed dyslexia), Ty 5 (undiagnosed ADHD and dyslexia).

---

## How Emily likes to work — NON-NEGOTIABLE

- **Finish one task completely before starting another**
- **No jargon** — plain English only, explain anything technical
- **No tangents** — note it, come back later
- **Keep momentum** — execution is the hard part, make it simple
- **Update HANDOVER.md at the end of every session**

---

## The Project: Plainly

A web app that turns confusing documents into plain English. Upload a PDF or image, draw a box around any section — get a plain-English explanation with bullet points, checklist, and audio playback.

Built from lived experience: Emily's family can't navigate complex paperwork — WINZ forms, school worksheets, IRD notices.

| Detail | Value |
|--------|-------|
| Product name | **Plainly** (was "Plainform" — always say Plainly) |
| Domain | **tryplainly.co.nz** ✅ Registered ✅ DNS pointed to Render ✅ Added to Render dashboard — check browser to confirm live |
| Live URL | **https://plain-english-portal.onrender.com** |
| GitHub repo | `emilyhill27-jpg/plain-english-portal` |
| Local folder | `~/Desktop/plain-english` |
| Deployed on | Render.com (auto-deploys on push to `main`) |

---

## Business Model — Locked In

- **Always free for end users** — no exceptions, no upsells
- **B2B organisation licences** — organisations pay a licence fee (pricing TBD)
- **Plainly-branded by default** — not white-label. Optional co-branding available where appropriate
- **Plainly handles support** — organisations do not field software/product questions
- **Approved document sets** — orgs select supported document types from a predefined list, not upload files
- **Target first:** Schools, community law, CAB, insurance brokers, GP practices, small councils — small orgs who can decide fast
- **Do NOT pitch big government first** (WINZ/IRD) — too slow, 12–18 month cycles
- **Funding path:** 2–3 paying customers → Callaghan Innovation grant → polish → then investors

---

## Tech Stack

| Layer | Details |
|-------|---------|
| Backend | FastAPI + PyMuPDF + Anthropic SDK → `app.py` |
| Frontend | React + Vite → `frontend/src/App.jsx` |
| AI | Claude Sonnet 4.6 (vision API) |
| TTS | Browser-native speechSynthesis (zero API cost) |
| Deploy | Render.com — `render.yaml` configured |

**To start the app locally:**
```bash
cd ~/Desktop/plain-english
source venv/bin/activate
python3 -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
Frontend: `cd frontend && npm run dev` → http://localhost:5173

**After any JSX change:** `cd frontend && npm run build` then push to deploy.

**To deploy:** `git add [files] && git commit -m "message" && git push origin main`

---

## Design System — What the Site Actually Looks Like

- **Fonts:** Lexend (headings + body) + Open Sans (fallback). Loaded from Google Fonts.
- **Accent:** Purple `#8c52ff`, hover `#7a3ef0`
- **Light accents:** `#EDE9FE` (purple light), `#F5F3FF` (purple pale)
- **Backgrounds:** `#FAFAFA` (main off-white), `#FFF9F0` (cream, reader default), hero gradient (lavender → pink → warm yellow)
- **Text:** `#1F2937` (dark), `#4B5563` (mid), `#6B7280` (soft)
- **Borders:** `#E5E7EB` (light grey)
- **Corners:** Rounded — 8px/12px/16px. Pill buttons use `border-radius: 999px`
- **Logo:** `logo-plainly.png` in `frontend/public/`

**⚠️ OLD DESIGN IS GONE:** Terracotta `#bf5030`, Playfair Display, Atkinson Hyperlegible, sand banding — do not reference these.

---

## What's Built and Working

**Landing page:** Nav (Home, How it works, For organisations, Technology, About us, Reader support, Try it free), hero with gradient, demo card (tenancy agreement example), feature cards with SVG icons, CTA, dark footer (Privacy, Terms, Security, Pilot programme, Contact), reader settings bar

**Browser tab title:** "Plainly | Understand forms and documents in plain English"

**Three tools (NOT modes — there is NO mode toggle):**
1. **Simplify** — draw a box on the document → plain English + prompts/examples + checklist + important details + reading level support
2. **Explain this document** — processes ALL pages of a multi-page PDF in parallel with progress. Shows: page section headers, title, "gather first" list, every field with section heading + original text + explanation + tip, important details, quality check button, print button, TTS. Left panel highlights and auto-scrolls to matching page. Click any word for a plain-English definition popup + "Read it to me". Backend: `POST /api/v1/explain-form` (per page, parallel), `POST /api/v1/define-word` (word lookup), `POST /api/v1/validate` (quality check)
3. **Translate** — 30 languages (te reo Māori, Samoan, Tongan, Mandarin, etc.), translates full page. Backend: `POST /api/v1/translate-worksheet`

**After results load:** "Other tools" section at bottom shows remaining tool buttons — they never disappear.

**Other features:** Audio playback (play/pause/stop, voice selector, speed control, click any word), reading support panel (year level + reading level sliders), print view (original doc + explanation side by side), independent panel scrolling (left doc panel and right result panel scroll separately, nav stays fixed)

**Standalone pages:**
- `frontend/public/organisations.html` — B2B landing page (current purple design)
- `frontend/public/technology.html` — Technology page (current purple design)
- `frontend/public/pilot.html` — Pilot programme page with contact form
- `frontend/public/privacy.html` — Privacy policy
- `frontend/public/terms.html` — Terms of use
- `frontend/public/security.html` — Security and data handling
- `frontend/public/b2b.html` — OLD terracotta design, needs updating or removing

**Nav tabs (all pages):** Home | How it works | For organisations | Technology | About us
**Footer (all pages):** Privacy | Terms | Security | Pilot programme | Contact | © 2026 Plainly

---

## Neuroinclusive Design — What's Actually Built

This is not just about *who* the app is for. The app is designed from the ground up to be neuroinclusive. These are the specific features and rules.

### Reader Settings Bar (user controls their own experience)

| Setting | Options | Default |
|---------|---------|---------|
| Text size | Standard (16px) / Medium (18px) / Large (20px) / Extra-large (23px) | Standard |
| Line spacing | Standard (1.6) / Relaxed (1.8) / Extra-relaxed (2.1) | Standard |
| Font | Lexend / Open Sans / Arial (Simple) | Lexend |
| Background tint | Cream (#FFF9F0) / Blue (#EFF6FF) / Lilac (#F3E8FF) / Grey (#F3F4F6) | Cream |
| Extra spacing | Toggle on/off (increases padding and gaps throughout) | Off |

**Why these choices matter:**
- **Lexend** — designed specifically to reduce visual stress and improve reading speed for people with dyslexia and reading difficulties
- **Background tints** — off-white/cream reduces the glare of a pure white screen, which causes strain for many neurodivergent readers
- **Line spacing 1.6+** — minimum line height used throughout. Tight text is a barrier for ADHD and dyslexic readers
- **Extra spacing toggle** — for people who need more visual breathing room

### Audio / TTS (Text-to-Speech)
- Play/pause/stop controls
- Click any word in the result to start reading from that word
- Current word is highlighted as it reads
- Voice selector (grouped by region, with flags)
- Speed control: 0.5× / 0.75× / 1× / 1.25×
- Default voice: Google US English Female
- Zero API cost — uses browser-native speechSynthesis

### Reading Level (adjusts AI output complexity)
- Year level slider — matches output to a child's actual year level
- Reading level slider — adjusts complexity of the plain English output
- These change what the AI produces, not just how it displays

### Output Structure (every Simplify result)
- Plain English paragraphs
- Prompts and examples
- Checklist: "What you need to do" with tickable checkboxes
- Important details: deadlines, amounts, documents required

### Accessibility Standards — What We Build To

**WCAG 2.2 AA** (Web Content Accessibility Guidelines)
The international standard for web accessibility. Level AA is the legally recognised benchmark. Key requirements relevant to Plainly:
- Colour contrast minimum 4.5:1 for normal text, 3:1 for large text
- Text must be resizable up to 200% without breaking layout
- All functions must be usable by keyboard (not mouse-only)
- No content that flashes more than 3 times per second
- Clear labels on all form fields and buttons
- Language of page declared in code (so screen readers know)

**COGA** (Cognitive Accessibility Guidelines — W3C)
The second standard — specifically for people with cognitive and learning disabilities: ADHD, dyslexia, autism, low literacy. This is the one most directly relevant to Plainly. Key principles:
- Make it easy to find what you need — clear navigation, no hidden menus
- Use plain, understandable content — short sentences, common words
- Use familiar patterns — don't surprise the user with unexpected layouts
- Help users avoid and fix mistakes — clear error messages, no gotchas
- Support personalisation — let users control their own reading experience
- Reduce cognitive load — one thing at a time, clear structure

Both standards are published by the **W3C** (World Wide Web Consortium).
The technology page states: *"Designed to WCAG 2.2 AA and COGA cognitive accessibility standards throughout."*

**This means:** Any new feature or design change must be checked against both standards before going live.

**Audit status (26 May 2026):** axe-core audit run on live site — 32 passes, 3 violations fixed:
- ✅ Purple darkened from `#8c52ff` → `#7c3aed` (contrast now passes 4.5:1)
- ✅ Demo card grey text darkened (was 2.23 and 2.53 — now pass)
- ✅ `<main>` landmark added to both landing page and app page

### Design Rules — Non-Negotiable
- ❌ No pop-ups
- ❌ No dark patterns
- ❌ No ads
- ❌ No document storage — session only, nothing saved
- ✅ Low stimulation — clean, quiet layout
- ✅ High contrast text on all backgrounds
- ✅ Rounded corners — reduces visual harshness
- ✅ Consistent layout — no surprises

---

## AI Prompt Architecture (as of 4 June 2026)

**Four-layer rulebook:**
1. **Non-Negotiables** (`core/non_negotiables.md`) — 15 rules loaded into every prompt
2. **Domain Vocabulary** (`prompts/domains/*.md`) — sector-specific terms + governing NZ legislation
3. **Sector Rules** — S3.x rules per domain (vocabulary, output format, "no advice" guardrail)
4. **Compliance Check** (`prompts/tasks/validator.md`) — connected to UI via "Check quality" button

**11 sector categories (all with domain files):**
MSD/Benefits, Health/Patient, Legal/Tribunal, Criminal/Law, HS/Safety, Employment/HR, IRD/Tax, Insurance/Financial, Property/Tenancy, General Govt, Other (catch-all)

**Prompt assembly:** `build_prompt()` in app.py assembles: non_negotiables → client docs → domain rules → task prompt → output format. Both Simplify and Explain this document now load domain rules.

**Client docs:** Only MSD has client docs so far (`client_docs/msd/exclusions.md`, `style_notes.md`). Add more as clients come on.

**Page-anchored output:** Form explainer prompt requires `section_heading` and `original_text` fields — each explanation quotes the original document text.

---

## CRITICAL — NO MODES

There is NO mode toggle. No Business Plan mode. No School mode. These are gone.
- ONE universal prompt handles everything
- Reading level slider adjusts complexity
- Three action buttons (Simplify / Explain this form / Translate) — not modes, just different tools

---

## Pending Tasks — In Order, One at a Time

1. **First paying customer** — approach one school, community org, or adviser. Pilot page is ready to send.
2. **Fix frontend timeout** — parallel requests can hit 90s timeout on long documents. Options: increase timeout, batch pages in groups of 3-4, or both.
3. **Usage tracking/analytics** — log metadata per org (doc count, reading level, timestamp). No document content stored.
4. **Write sector-specific compliance checks** — Layer 4 validator is generic. Needs per-sector rules for each of the 11 categories.
5. **About us page** — nav link exists but no page built yet
6. **Remove b2b.html** — old terracotta design, fully replaced by organisations.html
7. **Additional tools** — contract red-flagger, worksheet leveller, policy checker, parent letter writer
8. **Logo swap** ✅ Done (26 May 2026)
9. **Domain** ✅ Done (26 May 2026)
10. **P0 site fixes** ✅ Done (31 May 2026)
11. **AI prompt overhaul** ✅ Done (31 May 2026)
12. **Form explainer multi-page + word definitions** ✅ Done (31 May 2026)
13. **Explain/Translate/scrolling bugs** ✅ Done (3 June 2026)
14. **Parallel form explainer** ✅ Done (4 June 2026)
15. **Component split** ✅ Done (4 June 2026)
16. **Rulebook gaps 1-6** ✅ Done (4 June 2026)
17. **B2B site copy overhaul** ✅ Done (4 June 2026)
18. **Trust pages alignment** ✅ Done (4 June 2026)
19. **Language consistency** ✅ Done (4 June 2026)

---

## Key Decisions Already Made — Do Not Re-Debate

- Product name = **Plainly**
- B2B white-label model, always free for end users
- Purple/lavender palette with Lexend font (NOT terracotta/Playfair — that was old)
- Client-side canvas crop (server-side had coordinate bugs)
- No guiding questions (removed — users couldn't answer them)
- ONE universal prompt — NO separate modes
- Three tool BUTTONS not modes: Simplify, Explain this document, Translate
- Start small orgs, not big government
- TTS = browser-native speechSynthesis (zero API cost)
- Nav: Home, How it works, For organisations, Technology, About us (no Pricing or Resources)

---

## Where Things Live — File Guide

| File | What it is | Where |
|------|-----------|-------|
| `CLAUDE.md` | **This file** — quick-reference, load into every session | `~/Desktop/plain-english/CLAUDE.md` |
| `HANDOVER.md` | Full detail — everything about the project | `~/Desktop/plain-english/HANDOVER.md` |
| `MASTER_CATALOGUE.md` | Session history log — what was built when | `~/Desktop/plain-english/MASTER_CATALOGUE.md` |
| `app.py` | Backend — all AI prompts and API routes | `~/Desktop/plain-english/app.py` |
| `App.jsx` | Frontend — state, handlers, API calls, layout | `~/Desktop/plain-english/frontend/src/App.jsx` |
| `FormExplainResult.jsx` | Visual — document explainer result display (safe to restyle) | `~/Desktop/plain-english/frontend/src/` |
| `SimplifyResult.jsx` | Visual — simplify result display (safe to restyle) | `~/Desktop/plain-english/frontend/src/` |
| `TranslateResult.jsx` | Visual — translate result display (safe to restyle) | `~/Desktop/plain-english/frontend/src/` |
| `ListenControls.jsx` | Visual — shared TTS play/pause/speed controls | `~/Desktop/plain-english/frontend/src/` |
| `prompts/domains/*.md` | 10 sector domain files with legislation + rules | `~/Desktop/plain-english/prompts/domains/` |
| `core/non_negotiables.md` | 15 non-negotiable rules loaded into every prompt | `~/Desktop/plain-english/core/` |
| `.env` | API key (never share, never commit to GitHub) | `~/Desktop/plain-english/.env` |

**At the end of every session, say to Claude:**
> *"Update HANDOVER.md and CLAUDE.md with today's decisions."*

Claude will update both files. Save them. That's it — you're ready for next time.

**PLAINLY-CONTEXT_2.md on your Desktop is now outdated — ignore it. Use this file instead.**
