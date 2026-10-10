# Fitness App

A personalized fitness and wellness planning app that helps users create a profile, generate a tailored AI-powered health plan, and manage saved plans securely.

## Overview

This project is designed to help users:

- create a personal fitness profile
- enter their health, goal, and lifestyle information
- generate a customized health plan using Google Gemini AI
- securely save and retrieve their plans
- access protected routes only when authenticated

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- shadcn-style UI components

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Google Generative AI
- Rate limiting and CORS protections

## Project Structure

```bash
fitness-app/
├── src/                        # Frontend application
│   ├── components/            # UI screens and components
│   ├── lib/                   # API client utilities
│   ├── App.jsx                # App routing and protected routes
│   └── main.jsx               # Frontend entry point
├── backend/                   # Node.js backend
│   ├── models/                # MongoDB schemas
│   ├── middleware/            # Auth middleware
│   ├── routers/               # Auth, profile, and AI routes
│   ├── utils/                 # Logger and error helpers
│   ├── .env.example           # Example backend env config
│   ├── package.json           # Backend dependencies/scripts
│   └── server.js              # Backend entry point
├── .env.example               # Example frontend env config
├── README.md                  # Project overview and setup
├── SETUP.md                   # Local setup instructions
├── DEPLOYMENT.md              # Production deployment guide
├── VALIDATION.md              # End-to-end validation checklist
├── package.json               # Frontend package config
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── index.html                 # Frontend HTML shell
└── public/                    # Static assets
```

## Quick Start

### 1. Install dependencies

```bash
npm install
cd backend
npm install
cd ..
```

### 2. Configure environment variables

#### Frontend

```bash
cp .env.example .env
```

Edit `.env`:

```bash
VITE_API_URL=http://localhost:3000
```

#### Backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```bash
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fitness-app
GOOGLE_API_KEY=your_google_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRY=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Start MongoDB

Make sure MongoDB is running locally or use a MongoDB Atlas URI in `backend/.env`.

### 4. Start the backend

```bash
cd backend
npm start
```

### 5. Start the frontend

In a second terminal:

```bash
npm run dev
```

### 6. Open the app

Visit:

```bash
http://localhost:5173
```

### 7. Register and use the app

- Create an account
- Login
- Fill in fitness profile
- Generate AI health plan
- View saved plan history

## Authentication

The app uses JWT-based authentication for protected routes.

Protected routes include:

- `/info`
- `/dashboard`
- `/ai/generate`
- `/profiles`
- `/ai/plans`

Unauthenticated users are redirected to `/login`.

## API Overview

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

### Profiles
- `GET /profiles`
- `POST /profiles`
- `GET /profiles/:id`
- `PUT /profiles/:id`
- `DELETE /profiles/:id`

### AI / Health Plans
- `POST /ai/generate`
- `GET /ai/plans`
- `GET /ai/plans/:id`
- `DELETE /ai/plans/:id`

### Health Check
- `GET /health`

## Production Notes

Before production deployment:

- set real environment variables
- restrict CORS to production domains only
- use a secure JWT secret
- ensure MongoDB Atlas or managed Mongo is configured
- verify Gemini API access and quotas
- protect AI routes behind authentication and rate limits
- consider using a separate backend host and frontend host
- enable monitoring and error tracking

## Helpful Docs

- `SETUP.md` — local development setup
- `DEPLOYMENT.md` — production deployment guide
- `VALIDATION.md` — end-to-end validation checklist

## Security Notes

The app includes:

- password hashing before storage
- JWT-based route protection
- CORS restrictions
- rate limiting on auth and AI routes
- input validation for profile data
- request size limits

## Potential Future Improvements

- email verification
- password reset flow
- two-factor authentication
- role-based access control
- plan sharing and export improvements
- Redis caching for AI responses
- analytics and user tracking
- advanced monitoring (Sentry, Datadog, UptimeRobot)

## License

This project is provided as a codebase for educational and development use. Update the license as needed for your production environment.
