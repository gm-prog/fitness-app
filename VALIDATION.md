# End-to-End Validation Guide

This document guides you through validating the entire fitness app system locally.

## Pre-Validation Checklist

- [ ] MongoDB is running locally or connection string is ready
- [ ] All environment variables are set (.env files in place)
- [ ] Backend dependencies installed: `cd backend && npm install`
- [ ] Frontend dependencies installed: `npm install`
- [ ] Google Gemini API key is valid and has quota

## Step 1: Start Backend

```bash
cd backend
npm start
```

**Expected Output:**
```
[timestamp] INFO: Server Configuration { port: 3000, env: development, allowedOrigins: [...] }
[timestamp] INFO: Connected to MongoDB
[timestamp] INFO: Server is running on http://localhost:3000
[timestamp] INFO: Health check: http://localhost:3000/health
```

**Validation:**

```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "service": "fitness-app-backend",
#   "environment": "development",
#   "uptime": 12,
#   "memory": {...}
# }
```

✅ Checkpoint 1: Backend is running and responding to health checks

## Step 2: Start Frontend

In a new terminal:

```bash
npm run dev
```

**Expected Output:**
```
VITE v6.0.11 ready in 123 ms
➜  Local:   http://localhost:5173/
```

**Validation:**
- Open http://localhost:5173 in browser
- You should see the landing page with blue gradient design
- Check browser console for any errors (F12 > Console)

✅ Checkpoint 2: Frontend is running and accessible

## Step 3: Test User Registration

**Flow:**
1. Click "Start Your Journey Now" on landing page
2. You should see login page
3. Click "Sign Up" button
4. Fill registration form:
   ```
   First Name: John
   Last Name: Doe
   Email: john.test@example.com
   Password: TestPassword123
   Confirm Password: TestPassword123
   ```
5. Click "Sign Up"

**Expected Result:**
- Form submits
- A brief loading state appears
- Redirected to profile form
- localStorage should contain "authToken"

**Validation in Browser Console:**
```javascript
localStorage.getItem('authToken')
// Should return a long JWT token, not null
```

**Validation in Backend Logs:**
```
Registration successful
User created with ID: ...
Token generated
```

**Validation in MongoDB:**
```bash
mongosh
use fitness-app
db.users.findOne({ email: 'john.test@example.com' })
```

You should see the user document with email, first name, last name.

✅ Checkpoint 3: User registration works and data is persisted

## Step 4: Test Profile Creation

**Flow:**
1. You should be on the profile form
2. Pre-populated fields should be visible (Samrat Dey example data)
3. Click "Generate Health Plan" at bottom

**Expected Result:**
- Loading state appears
- AI starts generating the plan (takes 30-60 seconds)
- A dashboard appears with the generated plan
- Plan is visible in 5 tabs: Introduction, Dietary Plan, Exercise Plan, Sleep Cycle, Monitoring

**Validation in Backend Logs:**
```
Generating content for section: Introduction
Generating content for section: Dietary Plan
Generating content for section: Exercise Plan
Generating content for section: Sleep Cycle
Generating content for section: Monitoring
Health plan generated and saved successfully
```

**Validation in MongoDB:**
```bash
mongosh
use fitness-app
db.profiles.findOne()
db.healthplans.findOne()
```

You should see both profile and health plan documents.

✅ Checkpoint 4: Plan generation and persistence works

## Step 5: Test Plan Retrieval

**Flow:**
1. From dashboard, click "Create New Plan"
2. You should stay on profile form
3. Generate another plan
4. On the new dashboard, check browser console

**Validation in Browser Console:**
```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:3000/ai/plans', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('Plans:', data);
  console.log('Total plans:', data.total);
  console.log('First plan:', data.plans[0]);
});
```

**Expected Result:**
- Returns array of plans for the user
- Should show 2 plans (since you generated 2)
- Each plan has: id, userId, content, generatedAt, etc.

✅ Checkpoint 5: Plan retrieval from database works

## Step 6: Test Protected Routes

**Flow:**
1. Clear localStorage: `localStorage.clear()` in console
2. Try to navigate directly to http://localhost:5173/info

**Expected Result:**
- Redirected to /login
- Cannot access protected pages without token

**Validation:**
```javascript
localStorage.getItem('authToken')
// Should return null
```

✅ Checkpoint 6: Protected routes work correctly

## Step 7: Test Login

**Flow:**
1. You should be on login page
2. Enter credentials:
   ```
   Email: john.test@example.com
   Password: TestPassword123
   ```
3. Click "Login"

**Expected Result:**
- Loading state appears
- Redirected to profile form
- authToken is in localStorage

**Validation in Backend Logs:**
```
User login successful
LastLogin updated
Token generated
```

✅ Checkpoint 7: Login works correctly

## Step 8: Test Logout

**Flow:**
1. From any authenticated page, click "Logout" button

**Expected Result:**
- Redirected to /login
- authToken is removed from localStorage
- Cannot access protected pages

✅ Checkpoint 8: Logout works correctly

## Step 9: Test Rate Limiting

**Test API rate limits:**

```bash
# Try to login 6 times rapidly
for i in {1..6}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"TestPassword123"}'
  echo "\nAttempt $i"
done
```

**Expected Result:**
- First 5 requests succeed/fail normally
- 6th request returns: `{"error": "Too many authentication attempts..."}`

✅ Checkpoint 9: Rate limiting is working

## Step 10: Test CORS

**Test from different origin (if possible):**

Create a test HTML file with:

```html
<script>
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
</script>
```

If opened from a different origin:
- Should succeed if localhost:5173 is in ALLOWED_ORIGINS
- Should fail if not in ALLOWED_ORIGINS

✅ Checkpoint 10: CORS is properly configured

## Step 11: Test Error Handling

**Test invalid token:**

```bash
curl -X GET http://localhost:3000/profiles \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Result:**
```json
{"error": "Unauthorized. Invalid or expired token."}
```

**Test missing authentication:**

```bash
curl -X GET http://localhost:3000/profiles
```

**Expected Result:**
```json
{"error": "Unauthorized. No token provided."}
```

✅ Checkpoint 11: Error handling is correct

## Final Validation Summary

If all 11 checkpoints pass:

✅ **User registration and authentication works**
✅ **Profile creation and storage works**
✅ **AI plan generation works**
✅ **Database persistence works**
✅ **Protected routes work**
✅ **Login/Logout works**
✅ **Rate limiting works**
✅ **CORS is configured**
✅ **Error handling works**
✅ **Health checks work**
✅ **End-to-end flow is validated**

## Production Validation

When deploying to production, repeat these steps with:
- Production environment variables
- Production database (MongoDB Atlas)
- Production API URLs
- Production domain names

## Troubleshooting

If any checkpoint fails, check:

1. **Backend logs** - Run with `npm start` and watch for errors
2. **Frontend console** - F12 > Console tab
3. **Network tab** - F12 > Network tab to see API calls
4. **MongoDB** - Check if data is being saved: `mongosh` commands
5. **Environment variables** - Verify .env files are correct
6. **Ports** - Ensure 3000 and 5173 are not in use
7. **API key** - Verify Google Gemini API key is valid

## Performance Validation

Optional checks for production readiness:

```bash
# Check backend memory usage
curl http://localhost:3000/health | jq .memory

# Check response times
time curl http://localhost:3000/health

# Load test (requires Apache Bench)
ab -n 100 -c 10 http://localhost:3000/health
```

## Security Validation

- [ ] No hardcoded secrets in code
- [ ] Environment variables are used for all sensitive data
- [ ] JWT tokens expire after 7 days
- [ ] Passwords are hashed before storage
- [ ] CORS is restricted to allowed origins only
- [ ] Rate limiting is enabled
- [ ] Input validation is working
- [ ] Database queries use parameterized queries (Mongoose)
