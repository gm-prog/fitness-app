# Fitness App

A fitness and health planning app that collects user profile data and uses Gemini AI to generate a personalized workout, nutrition, and lifestyle plan.

## Tech stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- AI: Google Gemini
- Database: MongoDB via Mongoose

## Project structure

- `src/` — frontend React app
- `backend/` — API server and AI endpoint
- `public/` — static assets

## Local setup

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Copy the example files and update values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Required variables:

- `VITE_API_URL` — frontend URL for backend API, typically `http://localhost:3000`
- `PORT` — backend port, default `3000`
- `MONGO_URI` — MongoDB connection string
- `GOOGLE_API_KEY` — Google Gemini API key
- `ALLOWED_ORIGINS` — comma-separated origins for CORS, e.g. `http://localhost:5173,http://localhost:3000`

### 4. Run the backend

```bash
cd backend
npm start
```

### 5. Run the frontend

From the repo root:

```bash
npm run dev
```

## Production deployment notes

- Do not hardcode `localhost` in frontend API calls.
- Use environment variables for all runtime config.
- Protect the `/ai/generate` endpoint behind auth and rate limiting.
- Store user profile and generated plans in MongoDB, not only in React route state.
- Use secure API keys and restrict CORS to trusted domains.

## Main routes

- `/` — landing page
- `/info` — user onboarding form
- `/dashboard` — generated health dashboard
- `/health` — backend health check endpoint
- `/ai/generate` — AI health-plan generation endpoint

## Notes

This project is a polished prototype and requires environment setup and production hardening before being treated as a production-ready service.
