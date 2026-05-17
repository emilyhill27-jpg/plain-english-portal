# Plain English Portal — Master Catalogue

A running log of major changes, sessions, and project state.

---

## Session: 2026-05-15 — Production Wiring to Claude Sonnet 4.6

**Outcome:** Full stack live and verified end-to-end.

**Files Modified:**
- `app.py` — Rewrote FastAPI backend with Anthropic SDK integration, CORS for Vite, three-tier prompt instructions (ELEMENTARY / HIGHSCHOOL / ADULT), structured Pydantic request/response models.
- `frontend/src/App.jsx` — Rewrote UI with accessible textarea, fieldset-based tier selector, aria-live result region, loading/error states.
- `frontend/src/StateStore.js` — Replaced with zero-dependency `useSyncExternalStore` global state hook.

**Dependencies Added (in venv):** `anthropic`, `python-dotenv`.

**Backups of Prior Versions:** `~/plain-english/.backup-2026-05-15-*/`

**Verified Working State:**
- `GET /` returns health JSON with correct status string.
- `POST /translate` with sample legalese + `tier: ELEMENTARY` returns child-friendly rewrite.
- Both servers run cleanly side-by-side inside the virtual environment directory.


---

## Session: 2026-05-15 (cleanup) — Orphan removal

Removed `frontend/src/components/` and `frontend/src/prompts.js` after confirming no live imports remain.
Frontend source tree is now: App.jsx, StateStore.js, main.jsx, index.css, assets/.
Committed separately from the wiring change for a clean revert path.


---

## Session: 2026-05-15 (deploy prep) — Single-service Render architecture

Restructured for Option A: one Render web service serving both FastAPI and the built Vite frontend.

**render.yaml**
- Build now runs pip install plus cd frontend && npm ci && npm run build.
- Pinned PYTHON_VERSION=3.11.9 and NODE_VERSION=20.11.1.
- Added healthCheckPath: /api/health.

**app.py**
- All API routes namespaced under /api/ (/api/health, /api/translate).
- Mounts /assets to serve Vite's hashed bundles from frontend/dist/assets.
- Catch-all GET serves frontend/dist/index.html for SPA routing, with /api/* 404 guard.

**frontend/src/StateStore.js**
- Calls /api/translate (was /translate).
- API_BASE reads import.meta.env.VITE_API_BASE, empty string in production (same-origin).

**frontend/.env.development**
- VITE_API_BASE=http://127.0.0.1:8000 for local dev where frontend and backend are on different ports.

**Local prod-build smoke test:** Passed completely with unified routing loop.


---

## Session: 2026-05-15 (final) — Render Live Deployment Verified

Successfully deployed the unified Option A single-service container to production.
Pushed clean source code branch to GitHub: https://github.com
Live Deployment URL: https://onrender.com

**Production Architecture State Verified:**
- `GET /api/health` returns status "ok" and verifies compiled frontend dist directory state.
- `GET /` successfully routes requests directly to the production React Single Page Application (SPA).
- `POST /api/translate` processes complex terminology requests using the Claude Sonnet 4.6 engine.

---

## Session: 2026-05-17 — v2 working end-to-end on MSD Jobseeker form

**Outcome:** Renaming product to Plainform. Core form companion flow with accessible dyslexia output, audio playback, and guiding questions is now functional.

**Notes:**
- v2 working end-to-end on MSD Jobseeker form.
- Renaming product to Plainform.
- Next phase: drag-to-select region, landing page, document categories.

