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

