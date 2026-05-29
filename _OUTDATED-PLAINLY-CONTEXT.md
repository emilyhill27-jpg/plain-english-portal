# PLAINLY — Master Context File
> Drop this file at the start of any Claude Chat, Cowork, or Code session.
> Last updated: May 2026

---

## What Plainly Is

A free New Zealand web application that simplifies any complex document into plain English.

**The single rule:** We simplify documents into plain English. We do not rewrite, advise, interpret, or add opinion. Only the words of the document — made clear.

**Tagline:** Any document. In plain English. Free.

**URL (when live):** plainly.nz / plainform.co.nz

---

## The Three Modules

| Module | What it does |
|---|---|
| **Document Translator** | Simplifies WINZ, IRD, ACC, insurance policies, tenancy agreements, contracts, hospital paperwork, court documents into plain English |
| **Form Completion Guide** | Takes any government or official form and provides step-by-step prompts explaining what each question is asking and what a correct answer looks like |
| **School Worksheet Converter** | Simplifies any school worksheet to a child's **actual reading level** — not their year group. Same learning objective, accessible language |

---

## Who It's For

- Disabled New Zealanders (851,000 — 17% of population)
- Neurodivergent people: ADHD (5–7% of NZ), dyslexia (1 in 10), autism (1 in 100)
- Adults reading at literacy Level 1 or below (26% of NZ adults — OECD 2023)
- English as a second language speakers
- Parents of neurodivergent children navigating school and WINZ systems
- Anyone who has ever read an official letter twice and still felt lost

**Design principle:** Neurodivergent-first. Low stimulation. No pop-ups. No dark patterns.

---

## Brand & Design

| Element | Value |
|---|---|
| Primary font | Playfair Display (serif) — headings |
| Body font | Atkinson Hyperlegible — designed for dyslexic readers |
| Cream | `#f6f0e6` |
| Dark ink | `#1c1710` |
| Terracotta | `#bf5030` (primary accent) |
| Gold | `#b07c20` (secondary detail) |
| Line/border | `#ddd0bb` |
| Style | Editorial magazine — warm, clean, accessible |
| Logo | "Plain" in solid ink + "ly" in terracotta |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| AI | Anthropic Claude API — `claude-haiku-4-5` model |
| File uploads | Multer |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Hosting (planned) | Render.com |

**Local dev:**
```bash
cd ~/Downloads/formplain
npm start
# Open localhost:3000
```

**File structure:**
```
~/Downloads/formplain/
  server/
    index.js        ← backend + API calls
  public/
    index.html      ← frontend
  .env              ← API key lives here (never commit)
```

---

## Business Model

| Tier | Who | Price |
|---|---|---|
| Individual | Any NZ resident | Free — always |
| B2B Standard | Community law centres, social workers, disability orgs, schools | $99–$499/month |
| Enterprise / Govt | Government agencies, DHBs, large insurers | Custom licensing |

**Key pitch:** NZ's Plain Language Act 2022 was repealed in April 2025. Government is stepping back from document accessibility. Plainly steps forward. This is both a social mission and a compliance gap no one else is filling.

---

## Assets Built (as of May 2026)

| Asset | File / Location | Status |
|---|---|---|
| Research report | `plainly-research-report.html` | ✅ Complete |
| Pitch deck | Canva — ID: `DAHKGi8gbFQ` | ✅ Saved |
| One-pager | `plainly-one-pager.html` | ✅ Complete |
| Landing page v2 | `plainly-landing-v2.html` | ✅ Complete |
| B2B proposal template | — | ⏳ Not started |
| School module (app) | — | ⏳ In planning |

**Canva pitch deck edit link:** https://www.canva.com/d/NHt5_9eSGymg1w0

---

## Known Bugs / Open Issues

1. **Frontend rendering bug** — AI returns results successfully but explanation cards do not display on screen. Backend is working. Issue is in the frontend JS rendering logic in `public/index.html`.

---

## Immediate Next Priorities (in order)

1. Fix frontend rendering bug (cards not displaying)
2. Deploy to Render.com
3. Register domains at Metaname.co.nz
4. Trademark application at iponz.govt.nz
5. Build school module
6. Build B2B proposal template

---

## Key Rules — Apply in Every Session

- ❌ Never say "rewrite" → ✅ Always say "simplify into plain English"
- ❌ Never use US statistics without labelling them **(US)** and adding NZ context
- ❌ Never add advice, opinion, or interpretation to document output
- ✅ Neurodivergent-first in all design decisions
- ✅ Free for individuals — no exceptions, no upsells
- ✅ Privacy by design — no document storage, session-only processing

---

## Legislative Context

- **Plain Language Act 2022** — required 69 NZ government agencies to use accessible language
- **April 2025** — National Government repealed the Act (passed first reading 1 April 2025)
- **Impact** — removes all statutory obligations for plain language in public documents
- **Opportunity** — government stepping back = Plainly steps forward. Strong public interest narrative.

---

## End-of-Session Routine

At the end of each working session, say to Claude:

> *"Update the context file with today's decisions."*

Claude will generate a fresh version of this file with:
- Any new assets or files built
- Bugs fixed or added
- Priorities reordered
- Rules or decisions added

**Save the updated file over this one. Keep one version. Always current.**

---

## How to Use This File

| Tool | How to load it |
|---|---|
| **Claude Chat** | Drag the file into the chat at the start of the session |
| **Claude Cowork** | Open the file in Cowork before starting tasks |
| **Claude Code** | Run: `cat PLAINLY-CONTEXT.md` or drag into the Code window |

---

*This file is the single source of truth for the Plainly project.*
*One file. Always current. Works everywhere.*
