# Fitness App - Local Development Setup

This guide will help you set up and run the fitness app locally for development and testing.

## Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas account)
- Google Gemini API key

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd fitness-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB

```bash
# On macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# On Ubuntu/Linux
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# Verify MongoDB is running
mongosh
# You should see a MongoDB shell prompt
# Type: exit
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Create a database user with a password
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/fitness-app`)

## Step 3: Configure Environment Variables

### Frontend Configuration

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:3000
```

### Backend Configuration

Create `.env` file in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fitness-app
GOOGLE_API_KEY=your_actual_api_key_here
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Get Google Gemini API Key

1. Go to https://aistudio.google.com/
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste it into `backend/.env` as `GOOGLE_API_KEY`

## Step 4: Start the Backend

In a new terminal, from the repo root:

```bash
cd backend
npm start
```

You should see:

```
Connected to MongoDB
Server is running on http://localhost:3000
Environment: development
```

### Test Backend Health

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "fitness-app-backend",
  "environment": "development",
  "uptime": 12.345
}
```

## Step 5: Start the Frontend

In another terminal, from the repo root:

```bash
npm run dev
```

You should see:

```
VITE v6.0.11  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

## Step 6: Test the Full Flow

### 6.1 Register a New User

1. Open http://localhost:5173/register
2. Fill in the form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `TestPassword123`
   - Confirm Password: `TestPassword123`
3. Click "Sign Up"
4. You should be redirected to the profile form

### 6.2 Create a Health Profile

1. Fill in the profile form with your health data
2. Click "Generate Health Plan"
3. Wait for the AI to generate your plan (30-60 seconds)
4. You should see the generated health plan in the dashboard

### 6.3 Test Plan Retrieval

In your browser console, run:

```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:3000/ai/plans', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

You should see your saved health plans.

### 6.4 Test Login

1. Logout (click logout button)
2. Go to http://localhost:5173/login
3. Login with credentials from step 6.1
4. Verify you can access your profile and plans

## Step 7: Verify Database Storage

### Using MongoDB CLI

```bash
# Connect to MongoDB
mongosh

# Switch to the database
use fitness-app

# Check users
db.users.find()

# Check profiles
db.profiles.find()

# Check health plans
db.healthplans.find()

# Exit
exit
```

## Common Issues & Troubleshooting

### MongoDB Connection Failed

**Error:** `Failed to start server: MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
- Make sure MongoDB is running: `brew services list` (macOS) or `systemctl status mongodb` (Linux)
- Start MongoDB: `brew services start mongodb-community` or `sudo systemctl start mongodb`
- If using Atlas, check your connection string is correct

### Google API Key Error

**Error:** `GOOGLE_API_KEY is required`

**Solution:**
- Get your API key from https://aistudio.google.com/
- Add it to `backend/.env` as `GOOGLE_API_KEY`

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
- Change PORT in `backend/.env` to a different port (e.g., 3001)
- Or kill the process: `lsof -ti:3000 | xargs kill -9`

### CORS Errors

**Error:** `CORS blocked for origin: http://localhost:5173`

**Solution:**
- Make sure `ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:5173`
- Restart the backend after changing .env

### API Calls Returning 401

**Error:** `Unauthorized. No token provided`

**Solution:**
- Make sure you're logged in (token should be in localStorage)
- Try clearing localStorage and logging in again: `localStorage.clear()`

## Development Tips

### Hot Reload

- Frontend: Changes to React files are auto-reloaded (Vite HMR)
- Backend: Uses `--watch` flag for auto-restart on file changes

### Debugging Backend

Add console logs or use a debugger:

```bash
node --inspect server.js
```

Then open `chrome://inspect` in Chrome.

### Testing API Endpoints

Use curl or a tool like Postman:

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123","firstName":"Test"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}'

# Get profiles (with token)
curl -X GET http://localhost:3000/profiles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

Once you've verified the local setup works:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Create a pull request
5. Deploy to staging/production (see DEPLOYMENT.md)

## Getting Help

- Check the backend logs: Look at the terminal where you ran `npm start`
- Check the frontend console: Open browser DevTools (F12) and look at the Console tab
- Check MongoDB: Use `mongosh` to verify data is being stored
- Check API responses: Use browser Network tab to see API calls and responses
