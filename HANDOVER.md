# Plainly — Project Handover
> Full detail file. For the quick-reference, use CLAUDE.md.
> Last updated: 31 May 2026

---

## SESSION LOG — 31 May 2026

Major credibility and UX overhaul based on Emily's thorough site review.

### P0 fixes — credibility (all done)
1. **Duplicate header killed** — app page had two stacked navs (marketing + stepper). Removed the marketing nav from the app page. Now one clean stepper nav only.
2. **Nav consistent across all pages** — Home | How it works | For organisations | Technology | About us + Reader support + Try it free. Same links, same logo (44px), same style on landing page, organisations.html, technology.html, and all new pages. Removed broken "For schools" (anchor) and "Log in" (went nowhere).
3. **Real footer on every page** — dark background, Plainly logo, "Built in Aotearoa New Zealand", links to Privacy, Terms, Security, Pilot programme, Contact. Copyright 2026. Replaced the old emoji footer.
4. **All emojis replaced with SVG icons** — every emoji used as a UI element (📄🎒🛡️💜✅🔒👥📝) replaced with clean Lucide-style inline SVGs throughout landing page and app page.
5. **Pilot page created** (`frontend/public/pilot.html`) — hero, who we're looking for (schools, community orgs, councils, property managers), what you get / what we ask / what success looks like / no risk cards, contact form using FormSubmit.co → hello@tryplainly.co.nz.
6. **Privacy, Terms, Security pages created** — `frontend/public/privacy.html`, `terms.html`, `security.html`. Clean, plain-English content. Privacy covers NZ Privacy Act 2020. Security covers data handling, AI provider (Anthropic), data residency, WCAG 2.2 AA.

### Bug fixes (all done)
7. **PDF loading speed** — first page renders at 150 DPI (full quality for selection), remaining pages at 96 DPI (thumbnails). Faster upload for multi-page documents.
8. **Selection highlight visible** — selection box now has 4px purple border, glow shadow, and "Selected area" label. Much more visible than the old 2px faint box.
9. **TTS fixed** — added 80ms delay between cancel and speak (fixes Safari dropping the speak call). Voice loading retries up to 5 times. Keep-alive interval reduced to 5s. Better error logging.
10. **Form explainer processes ALL pages** — was only doing the current page. Now loops through every page of a multi-page PDF with progress: "Explaining page 3 of 12…". Results show "Page 1", "Page 2" etc. section headers. Gather-first items deduplicated across pages.
11. **Page highlight syncs left panel** — as you scroll through form explain results on the right, the left panel auto-scrolls to the matching page. Pulsing purple overlay with "Reading this page →" label. Click any page header on the right to jump.
12. **Print layout fixed** — document images no longer split across printed pages (page-break-inside: avoid). Each page section starts on a new printed sheet. Thumbnails, toolbars, and overlays hidden in print.
13. **Click any word for definition** — in form explain results, every word is clickable. Click → popup with plain-English definition + example + "Read it to me" button. Uses Claude API (`POST /api/v1/define-word`). Click anywhere else to close.

### AI prompt overhaul (all done)
14. **Two shared rule sections added to app.py:**
    - `SECTION_2_NEUROINCLUSIVE` — 8 sub-rules for dyslexia/ADHD/autism-accessible output (literal language, predictable structure, cognitive load limits, typography rules, spacing, visual clarity, inline definitions, explicit instructions)
    - `SECTION_4_ACCURACY` — 7 sub-rules that override everything (never drop info, preserve structure, define terms inline, name the actor, be honest about scope, no speculation, output structure requirements)
15. **GENERAL_PROMPT** — prepended Section 2 + Section 4. Added "Do not shorten text — rewrite for clarity."
16. **BUSINESS_PLAN_PROMPT** — commented out. Deprecated. Falls back to GENERAL_PROMPT.
17. **FORM_EXPLAINER_PROMPT** (old one) — commented out. Deprecated. Replaced by FORM_EXPLAINER_FULL_PROMPT.
18. **FORM_EXPLAINER_FULL_PROMPT** — prepended Section 2 + Section 4. Added field order, accuracy, and no-advice rules.
19. **DYSLEXIA_BUTTON_PROMPT** — prepended Section 2. Added "Never use all capitals, italics, or underlines."
20. **WORKSHEET_TRANSLATE_PROMPT_TEMPLATE** — prepended Section 4. Added "Never fill in blank fields" and "Preserve exact field order."
21. **make_school_prompt** — prepended Section 2. Reading-age logic unchanged.
22. **Backend max_tokens** — form explain increased from 4000 → 8000 tokens per page.

### Status
All changes built locally. NOT yet committed or pushed to GitHub/Render.

---

## EMAIL SIGNATURE & BRANDING (30 May 2026)

Created Emily's Plainly email signature.
- **Final pick:** Option 1 — horizontal layout, logo left + purple divider + name/title/contacts right.
- **Details used:** Emily Hill · Founder · hello@tryplainly.co.nz · 021 468 719 · tryplainly.co.nz.
- **Brand tokens:** purple `#7c3aed`, near-black `#1F2937`, grey `#4B5563`; Arial/Liberation Sans for email reliability.
- **Files on Desktop:** `Plainly Email Signature.html` (clickable links, for Gmail signature box) and `Plainly Email Signature.jpg` (462×132, image version — no clickable links). Logo pulled live from `https://tryplainly.co.nz/logo-plainly.png`.
- **Open idea (not done):** a "P" icon/badge mark for social avatars + favicon; and a hybrid signature (logo image + clickable text lines).

---

## PROJECT FOLDER TIDY (30 May 2026)

The `plain-english` folder was tidied. Root went from 24 items to 14.
- **Deleted:** `.DS_Store`, an empty stray folder (` MASTER_CATALOGUE.md` with a leading space), and `b2b-landing.html` (exact duplicate of `frontend/public/b2b.html`).
- **Archived into `_archive/`** (kept, not deleted): `HANDOVER 2.md` (old version), `_OUTDATED-PLAINLY-CONTEXT.md`, `COWORK_SETUP_LOG.md`, `COWORK_TASK.md`, `dyslexia-button-demo.html`, `.backup-20260515-1029/`.
- **Untouched (essential):** `app.py`, `frontend/`, `static/` (referenced by app.py), `docs/`, `venv/`, `node_modules/`, `CLAUDE.md`, `HANDOVER.md`, `MASTER_CATALOGUE.md`, all config.
- **`.gitignore` fix:** added root `/node_modules/` (was previously not ignored).

---

## DESKTOP LAYOUT (set up 29 May 2026)

Emily's desktop was cleared so it only holds Plainly things. Keep it this way.

**On the Desktop, only these stay:**
- `plain-english/` — this project (code + memory files)
- `Plainly - Design Screenshots/` — was "plainly (10) 2", renamed for clarity (8 PNGs)
- `test-worksheet.pdf` — worksheet-converter test file
- `⭐ START HERE.md` — Emily's ADHD-friendly desktop map + routine guide
- `Filed - Not Plainly/` — everything non-Plainly, sorted into subfolders (Audio, Images, Video, Artwork, Old Desktop, Other Folders, Review Me, Documents). ~2,700 files, nothing deleted.

The outdated `PLAINLY-CONTEXT_2.md` was moved off the Desktop into this folder as
`_OUTDATED-PLAINLY-CONTEXT.md`. Source of truth remains `CLAUDE.md`.

**~1,893 music files (17 GB) live in `Filed - Not Plainly/`. Emily chose to keep them filed, NOT delete.**

To re-tidy the desktop later, Emily says: *"Clear my desktop — keep only Plainly, file the rest like last time."*

---

## DOWNLOADS CLEANUP (29 May 2026)

The Downloads folder was cleared the same way as the Desktop. It now holds only two folders:
- `Plainly - from Downloads/` — Plainly assets gathered to review later (NOT merged into the project): `plainly/`, `plainly_logo/`, `Content For Plainly Video/`, `plainly-neuroinclusive-guidelines.pdf`, `brand-landing-page.html`, `brand-calculator.html`.
- `Filed - Downloads/` — everything else, sorted: Images (78), Documents (45), Installers (7), Personal (8 — incl. the **Bank Statements** folder, kept clearly labelled), Review Me (3).

**Deleted this session (irreversible, done at Emily's request):**
- Movies: *Ginny & Georgia S02* and *The Croods: A New Age*.
- Exact duplicate files (numbered/"copy" versions of the same PDFs/JPGs, a duplicate Chrome installer).
- Old PlainForm: `Plainform - Old/`, the PlainForm HTML export + `_files`, `Copy of Plain Form - Summary.docx`.
- Outdated Plainly text/versions: `PLAINLY-CONTEXT.md` / `_1` / `_2`, `plainly.zip`, `plainly-landing-v2.html`, `plainly-page3-v2.html` (+ dup), `plainly-research-report.html`, the Master Document HTML export, the "Hidden Cost of Complexity" research-report HTML export.
- Plainly **assets** (logo, neuroinclusive guidelines PDF, video content) were KEPT, not deleted.

---

## WHERE THINGS LIVE — Read This First

| File | What it is | When to use it |
|------|-----------|----------------|
| `CLAUDE.md` | Quick-reference — load into every Claude session | **Start of every session** — drag into Claude Chat, or open in Cowork |
| `HANDOVER.md` | This file — full project detail | When you need the full story, or at end of session to update |
| `MASTER_CATALOGUE.md` | Session history — what was built and when | To look back at what changed and when |
| `app.py` | Backend code — all AI prompts and API routes | When working on the backend |
| `frontend/src/App.jsx` | Frontend code — the entire React app | When working on the UI |
| `.env` | Your Anthropic API key | Never share, never commit to GitHub |

**At the end of every session, say:** *"Update HANDOVER.md and CLAUDE.md with today's decisions."*
Claude will update both files. Save them. Done.

**The PLAINLY-CONTEXT_2.md file on your Desktop is outdated — ignore it. Use CLAUDE.md instead.**

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
**Live URL:** https://plain-english-portal.onrender.com
**GitHub:** emilyhill27-jpg/plain-english-portal
**Local folder:** ~/Desktop/plain-english

---

## Business Model — Confirmed

- **Free for end users** — always. No premium tier, no upsell.
- **White-label B2B** — organisations pay a licence fee to put their name on it. Plainly runs the backend. **Pricing: TBD — not confirmed yet.**
- **Target customers:** Schools, community law centres, Citizens Advice Bureau, insurance brokers, immigration advisers, GP practices, small councils — organisations that deal with complex documents daily and can make a buying decision without a committee.
- **Do NOT lead with WINZ/IRD/big govt** — they have IT teams, procurement red tape, 12–18 month buying cycles. Approach them only after you have proven traction with smaller orgs.

## Investment Strategy — Confirmed

1. Get 2–3 paying customers first (even $200/month) — proof people will pay
2. Apply for Callaghan Innovation grant (non-dilutive, doesn't take equity)
3. With revenue + grant, polish the product
4. Then approach investors from a position of strength

---

## Design Language — Current (as of 26 May 2026)

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
- Nav bar: Plainly logo, Home, How it works, For organisations, Technology, About us, Reader support button, Try it free button
- Hero section: gradient background (lavender/pink/yellow), badge with lock SVG icon, headline, CTA button, trust badges with SVG icons
- Demo card: mini split-view showing a tenancy agreement clause on the left and plain English version on the right
- Feature cards (4) with SVG icons: Simplify documents, Made for students and schools, Accessible for everyone, Safe supportive and private
- CTA section
- Dark footer with links: Privacy, Terms, Security, Pilot programme, Contact, copyright, email
- Reader settings bar: text size (4 options), font (Lexend/Open Sans/Arial), spacing (3 options)

### Organisations page (`frontend/public/organisations.html`)
- Standalone HTML page, full purple/Lexend design with reader support toolbar
- **Sections in order:**
  1. Hero: "Because everyone deserves to understand what they're reading"
  2. Plain language built in Aotearoa (standards bar + proof bar with NZ stats)
  3. Plain Language Act (legislation block with repeal notice)
  4. Who it's built for (6 cards: govt, schools, health, community, legal, HR)
  5. What we solve (3 value props: reduce calls, meet standards, include everyone)
  6. How it works (3 steps: branding, deploy, users get plain language)
  7. White-label (split layout with demo mockup)
  8. Pricing ($299/$699/custom)
  9. CTA + Footer

### Technology page (`frontend/public/technology.html`)
- Standalone HTML page, full purple/Lexend design with reader support toolbar
- Hero: "Built for real accessibility. Not just compliance."
- Features section with cards:
  - Text to speech (featured full-width card with visual demo of play/stop/speed/highlighting)
  - Side-by-side translation (featured full-width card with split-pane mockup)
  - Personalised reading level
  - WCAG and neuroinclusive reading toolbar
- Neuroinclusive design section (dark background): TTS, visual comfort, structure/spacing
- Anthropic AI badge
- CTA + Footer

### App page (the two-panel tool) — CRITICAL: NO MODE TOGGLE

- **Browser tab title:** "Plainly | Understand forms and documents in plain English"
- Top nav: Plainly logo, nav links (Home, How it works, For organisations, Technology, About us), Reader support button, Load new document button
- Reader settings bar: text size, font, spacing
- **Left panel (document):**
  - PDF and image upload (drag & drop or browse)
  - Multi-page PDF with thumbnail sidebar
  - Zoom controls and page navigation (centred)
  - Rubber-band drag-to-select any region
- **Right panel — three tool buttons (NOT modes):**
  1. **Simplify** — draw a box, converts selection to plain English + prompts/examples + checklist + important details.
  2. **Explain this form** — processes ALL pages of a multi-page PDF, goes through every field and explains what it's asking, where to find the info, what to gather. Shows progress ("Explaining page 3 of 12…"), page section headers, title, "gather first" list, every field with label/explanation/tip, flags, print button, other tools. Left panel highlights which page is being read. Click any word for a plain-English definition popup. Backend: `POST /api/v1/explain-form` (per page), `POST /api/v1/define-word` (word lookup)
  3. **Translate** — shows language picker (30 languages: te reo Māori, Samoan, Tongan, Mandarin, etc.), translates full page preserving structure. Backend: `POST /api/v1/translate-worksheet`, `GET /api/v1/translate/languages`
- **Tool buttons stay visible** — after results load, "Other tools" section at bottom shows remaining tools
- Reading support card (collapsible): year level slider, reading level slider — shows for Simplify and Form Explain results
- Listen controls: play/pause, stop, voice selector (grouped by region with flags), speed control (0.5x/0.75x/1x/1.25x) on its own row. Default: Google US English Female. Works for all three tools.
- Simplified text with clickable words (click to play from that word, current word highlighted)
- Important details: deadlines, amounts, documents needed
- Checklist: "What you need to do" with tickable checkboxes
- **Print: shows BOTH panels side by side** — original document on left, explanation on right. Person prints it out and fills in the form with the guide beside them.
- **Independent panel scrolling** — left document panel and right result panel each scroll on their own. Nav stays fixed at top. `<main>` element styled with `flex: 1; overflow: hidden;` to prevent page-level scrolling.

### B2B landing page (`frontend/public/b2b.html`)
- Old terracotta design — NOT current design. Needs updating or removing.
- Pricing: Starter $299/mo, Organisation $699/mo, Enterprise custom

---

## Tech Stack

- **Backend:** FastAPI + PyMuPDF (fitz) + Anthropic SDK → `app.py`
- **Frontend:** React + Vite → `frontend/src/App.jsx` (single-file, ~2100 lines)
- **AI model:** Claude Sonnet 4.6 via vision API
- **TTS:** Browser-native `speechSynthesis` — zero API cost
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

**To deploy:** `git add [files] && git commit -m "..." && git push origin main`
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
| `frontend/public/organisations.html` | Organisations landing page (standalone) |
| `frontend/public/technology.html` | Technology page (standalone) |
| `frontend/public/b2b.html` | Old B2B page (terracotta design — outdated) |
| `frontend/public/pilot.html` | Pilot programme page with contact form |
| `frontend/public/privacy.html` | Privacy policy page |
| `frontend/public/terms.html` | Terms of use page |
| `frontend/public/security.html` | Security and data handling page |
| `frontend/public/logo-plainly.png` | Site logo |
| `HANDOVER.md` | This file — update at end of every session |
| `CLAUDE.md` | Quick reference loaded into every conversation |

---

## Pending Tasks — IN ORDER, ONE AT A TIME

1. **Commit and push** — all 31 May changes built locally. NOT yet pushed to GitHub/Render.
2. **First paying customer** — approach one school, community org, or adviser. Pilot page is ready to send. Don't wait for it to be perfect.
3. **Usage tracking/analytics** — log metadata per org (doc count, reading level, timestamp). No document content stored. Shows which docs get simplified most. Feedback loop for customers. This is what makes the product sticky.
4. **Additional tools** — contract red-flagger, worksheet leveller, policy checker, parent letter writer. All use same Claude backend.
5. **About us page** — nav link exists (`#about`) but no page built yet.
6. **Update or remove b2b.html** — still has old terracotta design. organisations.html now covers this.
7. **Logo swap** ✅ Done (26 May 2026)
8. **Domain** ✅ Done (26 May 2026)
9. **P0 site fixes** ✅ Done (31 May 2026) — nav, footer, emojis, pilot page, privacy/terms/security
10. **AI prompt overhaul** ✅ Done (31 May 2026) — neuroinclusive + accuracy rules on all prompts
11. **Form explainer multi-page** ✅ Done (31 May 2026) — processes all pages, highlights, word definitions

---

## Key Decisions Already Made — DO NOT RE-DEBATE

- Product name is **Plainly** (not Plainform)
- Business model is **white-label B2B** — always free to end users, organisations pay licence
- Do not sell to big government first — start with small orgs who can decide fast
- Get paying customers before approaching investors
- Apply for Callaghan Innovation grant as non-dilutive first funding
- Design: purple/lavender palette, Lexend font, rounded corners (NOT terracotta/Playfair/sand banding — that was the old design)
- Client-side canvas crop (not server-side — coordinate bugs)
- No guiding questions — removed
- **ONE universal prompt — NO MODES** (no Business Plan mode, no School mode, no mode toggle)
- Three tool BUTTONS: Simplify, Explain this form, Translate — these are actions, not modes
- Reading level slider adjusts complexity (not separate prompts)
- Print shows both panels side by side (original form + explanation)
- Start small orgs, not big government
- TTS uses browser-native speechSynthesis (zero API cost)
- Nav tabs: Home, How it works, For organisations, Technology, About us (NO Pricing or Resources)

---

## Business Strategy (26 May 2026)

**Three customer objections and answers:**

1. **"You don't store data — how do you track/bill?"** → Store metadata only (doc count, pages, mode, timestamp). No content. Billing + usage dashboard without touching their files.

2. **"It's a plaster — you're not fixing the root cause"** → Build a feedback loop: track which documents get simplified most. Show the org which docs are failing. That's not a plaster — it's a diagnostic tool.

3. **"Why not just use ChatGPT?"** → ChatGPT doesn't give: neuroinclusive reading environment, TTS, reader support toolbar, white-label branding, usage dashboard, feedback loop, WCAG compliance, or a tool the whole team can use.

**Feature expansion ideas (all same Claude backend):**
- Contract red-flagger, worksheet leveller, policy compliance checker, form explainer (done), parent letter writer, translate (done)

---

## Session Log — 29 May 2026

**Desktop organisation (Cowork session):**
- Cleared 612 desktop items down to Plainly-only.
- Created `Filed - Not Plainly/` with sorted subfolders; moved ~2,700 files in (nothing deleted).
- Renamed "plainly (10) 2" → "Plainly - Design Screenshots".
- Created `⭐ START HERE.md` — desktop map, tool guide (Chat vs Cowork vs Code), save-location rules, and the every-time Plainly routine.
- Moved outdated `PLAINLY-CONTEXT_2.md` into project folder as `_OUTDATED-PLAINLY-CONTEXT.md`.
- Emily chose to KEEP ~1,893 music files (17 GB) filed rather than delete.

---

## Session Log — 28 May 2026

**What was fixed:**

1. **Browser tab title** — changed from "frontend" to "Plainly | Understand forms and documents in plain English" (`frontend/index.html`)
2. **Form explainer rendering** — `handleFormExplain` was setting `formExplainResult` but the right panel only rendered `result` (from Simplify). Added a full rendering branch for form explain results: title, "gather first" checklist, every field explained with label/explanation/tip, important details (flags), print button, "Other tools" section, TTS controls.
3. **Translate rendering** — was checking `docMode === "translate" && translateResult` but `handleTranslate` never set `docMode`. Fixed both: (a) `handleTranslate` now sets `setDocMode("translate")`, (b) rendering checks `translateResult` directly (no `docMode` dependency).
4. **Independent panel scrolling** — `<main>` element had no CSS, breaking the flex chain from `.app-shell` (100vh). Added `main { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }` so nav stays fixed and panels scroll independently.
5. **TTS for form explain** — added `formExplainResult` to `speechInfo` useMemo so play/stop works for form explanations.
6. **Reading support card** — now shows for both `result` (Simplify) and `formExplainResult` (Explain this form), not just Simplify.

**Status:** All changes built locally. NOT yet committed or pushed.
