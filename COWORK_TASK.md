# TASK FOR CLAUDE COWORKER — LOCAL ENVIRONMENT SETUP & VERIFICATION

## Objective
Run local project initialization, verify all configuration layers, and output an official execution log file.

## Instructions for Claude Coworker
1. Read this file and execute the steps below in sequence.
2. If any step fails, stop immediately and record the exact terminal error.
3. Upon completion, write a detailed log summary to a new file named `COWORK_SETUP_LOG.md`.

## Step 0 — Compile Frontend Assets
- Navigate to the frontend directory: `frontend/`
- Install dependencies: `npm ci`
- Build the production files: `npm run build`
- Confirm that the directory `frontend/dist/` was successfully created.

## Step 1 — Verify Environment Configuration
- Check for the existence of the `.env` file in the root folder.
- Confirm it contains a valid `ANTHROPIC_API_KEY` variable.

## Step 2 — Start and Test the Backend Server
- Activate the Python virtual environment: `source venv/bin/activate`
- Start the server: `python -m uvicorn app:app --host 127.0.0.1 --port 8000`
- Ping the internal health route via curl: `curl -s http://127.0.0`
- Verify that `"frontend_built": true` is returned in the JSON payload.

## Required Output Log
Create `COWORK_SETUP_LOG.md` in the root folder with this format:
- [ ] Step 0 Status (Pass/Fail + Build output snippet)
- [ ] Step 1 Status (Pass/Fail)
- [ ] Step 2 Status (Pass/Fail + Health JSON output snippet)
