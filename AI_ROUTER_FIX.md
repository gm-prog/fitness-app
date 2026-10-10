# AI router: Gemini / `GOOGLE_API_KEY` fix

## What was found in this repository

Searched **every object on every branch** (`main`, `feature/auth-and-persistence`,
`deploy-readiness-fixes`) for `HUGGINGFACE_API_KEY` and any Hugging Face client:

- `HUGGINGFACE_API_KEY` — **does not exist anywhere** in the repository.
- The only Hugging Face reference in the whole object database is one unused
  dependency line in `backend/package.json` on `feature/auth-and-persistence`:
  `"@huggingface/inference": "^3.0.0"`. No source file imports it.
- `backend/routers/ai.js` already used `@google/generative-ai` + `GOOGLE_API_KEY`
  on `main` and on all branches.

So the Hugging Face router is **local-only drift** — it is not committed to
GitHub on any branch. The real defect on the committed code was that the Gemini
client was built with **no config validation**, so a missing `GOOGLE_API_KEY`
surfaced only as an opaque `fetch failed` at request time, swallowed into the
per-section fallback text (the API still returned HTTP 200).

## What was fixed here (already committed)

| File | Change |
| --- | --- |
| `backend/routers/ai.js` | Validate `GOOGLE_API_KEY` at load time and fail fast with a clear message (value never logged). Guard `response.text()` (it throws on blocked/empty candidates). Stop logging the full prompt/profile payload. Response shape unchanged. |
| `backend/server.js` | Resolve `.env` from an absolute path so config loads regardless of the cwd the server is started from. Clear message instead of passing `undefined` to `mongoose.connect()`. |
| `backend/package.json` | `"main"` now points at `server.js`; added `start` / `dev` scripts. |
| `backend/routers/ai.auth-persistence.dropin.js` | Copy-ready Gemini router for the **auth + persistence** architecture. See below. |

`backend/.gitignore` is **unchanged** and still excludes `.env`. No `.env` is
tracked, and no secret value was added to any file.

## Applying this to your local tree

### Step 1 — Confirm which shape your local router has

Run these in your local repo. **Do not paste `backend/.env` anywhere.**

```bash
git status --short
git log --oneline -3
grep -n "require(" backend/routers/ai.js
grep -n "HuggingFace\|huggingface\|HUGGINGFACE" backend/routers/ai.js backend/package.json
grep -n "authMiddleware\|models/HealthPlan" backend/routers/ai.js
```

### Step 2 — Pick the right replacement

**A. Router has NO auth and NO persistence** (only `POST /ai/generate`):

```bash
git fetch origin arena/39219f74-fitness-app
git checkout origin/arena/39219f74-fitness-app -- backend/routers/ai.js backend/server.js backend/package.json
```

The frontend reads `result.content` (`src/components/InfoPage.jsx`), and the
router still returns `{ content, sections, generatedSections }`.

**B. Router requires `../middleware/auth` and/or `../models/HealthPlan`:**

```bash
cp backend/routers/ai.auth-persistence.dropin.js backend/routers/ai.js
rm backend/routers/ai.auth-persistence.dropin.js
```

This keeps `authMiddleware`, `HealthPlan` persistence, `GET /ai/plans`,
`GET /ai/plans/:id` and `DELETE /ai/plans/:id`, and keeps the response shape
`{ message, plan: { id, content, sections, generatedSections, generatedAt } }`
that the auth-branch frontend reads (`response.plan.content`, `response.plan.id`).

### Step 3 — Drop the dead Hugging Face dependency (variant B only)

```bash
cd backend
npm uninstall @huggingface/inference
```

### Step 4 — Verify

```bash
cd backend && npm install

# 1. Missing key -> clear error at startup (must NOT print any key value)
env -u GOOGLE_API_KEY node -e "require('./routers/ai.js')"

# 2. Boot with your real .env from the backend directory
npm start

# 3. Smoke test
curl -s -X POST http://localhost:3000/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"{\"name\":\"Test\",\"age\":\"30\"}"}'
```

## Outstanding items (reported, not changed)

- **MongoDB**: nothing in the repo validates that `MONGO_URI` points at a
  reachable server. `server.js` now warns clearly if the variable is absent, but
  a wrong/unreachable URI still fails asynchronously at connect time. Verify
  separately with `mongosh "$MONGO_URI"`.
- **`backend/.env`** is absent from this sandbox (it is gitignored, so it is not
  cloned). It was never read, written, or committed here.
- **Frontend API base URL** is hardcoded to `http://localhost:3000` in
  `src/components/InfoPage.jsx` on this branch. Fine locally; if you deploy,
  move it to `import.meta.env.VITE_API_URL` as `feature/auth-and-persistence`
  does in `src/lib/apiClient.js`.
- **Pre-existing lint errors**: `npx eslint .` reports ~50 pre-existing
  `react/prop-types` errors in `src/components/ui/*` plus two config-file
  warnings. Unrelated to this fix; left untouched.
