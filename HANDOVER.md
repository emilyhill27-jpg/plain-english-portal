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
- Nav bar: Plainly logo, Home, How it works, For organisations, Technology, About us, Reader support button
- Hero section: gradient background (lavender/pink/yellow), badge, headline, CTA button, trust badges
- Demo card: mini split-view showing a tenancy agreement clause on the left and plain English version on the right
- Feature cards (4): Simplify documents, Made for students and schools, Accessible for everyone, Safe supportive and private
- CTA section
- Footer
- Reader settings bar: text size (4 options), font (Lexend/Open Sans/Comic Sans), spacing (3 options)

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

### App page (the two-panel tool)
- Top nav: Plainly logo, nav links (Home, How it works, For organisations, Technology, About us), Reader support button, Load new document button
- Reader settings bar: text size, font, spacing
- **Left panel (document):**
  - PDF and image upload (drag & drop or browse)
  - Multi-page PDF with thumbnail sidebar
  - Zoom controls and page navigation (centred)
  - Rubber-band drag-to-select any region
  - Auto-simplifies when selection is drawn
- **Right panel (result):**
  - Reading support card (collapsible): year level slider, reading level slider
  - Crop preview
  - Listen controls: play/pause, stop, voice selector (grouped by region with flags), speed control (0.5x/0.75x/1x/1.25x) on its own row
  - Default voice: Google US English Female
  - Simplified text with clickable words (click to play from that word, current word highlighted)
  - Important details: deadlines, amounts, documents needed
  - Checklist: "What you need to do" with tickable checkboxes
  - Print button
- Five document modes: General / Business Plan / School (with reading age) / Form Explainer / Translate
- **Worksheet Translator:** upload any worksheet, pick from 30 languages (te reo Māori, Samoan, Tongan, Mandarin, etc.), translates the full page preserving structure (headings, questions, instructions, blank lines). Shows original text underneath each translated section. Print button included. Backend endpoints: `POST /api/v1/translate-worksheet`, `GET /api/v1/translate/languages`

### B2B landing page (`frontend/public/b2b.html`)
- Old terracotta design — NOT current design. Needs updating or removing.
- Pricing: Starter $299/mo, Organisation $699/mo, Enterprise custom

---

## Tech Stack

- **Backend:** FastAPI + PyMuPDF (fitz) + Anthropic SDK → `app.py`
- **Frontend:** React + Vite → `frontend/src/App.jsx` (single-file, ~1900 lines)
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
| `frontend/public/logo-plainly.png` | Site logo |
| `HANDOVER.md` | This file — update at end of every session |
| `CLAUDE.md` | Quick reference loaded into every conversation |

---

## Pending Tasks — IN ORDER, ONE AT A TIME

1. **Usage tracking/analytics dashboard** — log metadata (doc count, pages, mode, reading level, timestamp) per org. No document content stored. This is what makes the product sticky and proves value to paying customers. Shows orgs which documents keep getting simplified (feedback loop).
2. **Additional tools to build into the platform** — contract red-flagger (highlights risky clauses), worksheet leveller (rewrite at different year levels), policy compliance checker (readability score + rewrite suggestions), form explainer, parent letter writer. All use same Claude API backend.
3. **Logo swap** — Emily has purple/black and purple/white Plainly logos in Google. Need to download and replace across all pages once available.
4. **Business Plan prompt** — currently uses AI-generated WINZ criteria, not official. Fix with official criteria before going public.
5. **Domain** — check if tryplainly.co.nz is available
6. **First paying customer** — approach one school, community org, or adviser. Don't wait for it to be perfect.
7. **About us page** — nav link exists (`#about`) but no page built yet.
8. **Update b2b.html** — still has old terracotta design. Either update to purple/Lexend or remove (organisations.html now covers this).

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
- TTS uses browser-native speechSynthesis (zero API cost per use)
- Nav tabs: Home, How it works, For organisations, Technology, About us (NO "Pricing" or "Resources" tabs)

---

## Business Strategy Thinking (26 May 2026)

Emily identified three potential objections from customers and the answers:

**"You don't store data — how do you track/bill?"**
→ Store metadata only (doc count, pages, mode, timestamp). No content. Gives billing data + usage dashboard without touching their files.

**"It's a plaster — you're not fixing the root cause"**
→ Build a feedback loop: track which documents get simplified most. Show the org: "Your tenancy agreement was simplified 94 times this month." Now they know which docs are failing. Plainly fixes it now AND shows them what to rewrite. That's not a plaster — it's a diagnostic tool.

**"Why not just use ChatGPT?"**
→ ChatGPT doesn't give: neuroinclusive reading environment, TTS, reader support toolbar, white-label branding, usage tracking dashboard, feedback loop showing which docs are broken, WCAG compliance, or a tool the whole team can use without AI knowledge.

**Feature expansion ideas (all use same Claude backend, zero extra infrastructure):**
- Contract red-flagger (highlights risky clauses with plain-English explanation)
- Worksheet leveller (same worksheet at multiple reading levels)
- Policy compliance checker (readability score + rewrite suggestions)
- Form explainer (explains every field in plain English)
- Parent letter writer (bullet points → professional letter)
- Meeting notes → action items

These turn Plainly from a single tool into a toolbox — justifies the subscription and keeps people logging in daily.
