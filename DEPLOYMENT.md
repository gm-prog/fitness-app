# Deployment Guide

This guide covers deploying the fitness app to production.

## Pre-Deployment Checklist

- [ ] All tests pass
- [ ] Code reviewed and merged to main
- [ ] Environment variables configured for production
- [ ] CORS origins restricted to production domains
- [ ] JWT_SECRET is a long, random, secure string
- [ ] MONGO_URI points to production database
- [ ] GOOGLE_API_KEY is valid and has sufficient quota
- [ ] Rate limiting is enabled
- [ ] Database backups are configured
- [ ] Monitoring/logging is set up
- [ ] Health check endpoint is working

## Architecture Overview

The app consists of two services:

1. **Frontend (React + Vite)**
   - Static site hosting (Vercel, Netlify, GitHub Pages, etc.)
   - Environment: VITE_API_URL points to backend API

2. **Backend (Node.js + Express)**
   - API server hosting (Render, Railway, Heroku, etc.)
   - Environment: MongoDB URI, Google API key, JWT secret, CORS origins

## Option 1: Vercel (Frontend) + Render (Backend)

This is the recommended setup for most projects.

### Step 1: Prepare Repository

```bash
# Make sure you're on the main branch
git checkout main
git pull origin main

# Verify builds work locally
npm run build
cd backend && npm install && cd ..
```

### Step 2: Deploy Backend to Render

1. Go to https://render.com
2. Sign up/login with GitHub
3. Click "New +" > "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name:** `fitness-app-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free tier to start

6. Add Environment Variables:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `GOOGLE_API_KEY`: Your Google API key
   - `JWT_SECRET`: Generate a random string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `JWT_EXPIRY`: `7d`
   - `ALLOWED_ORIGINS`: Your frontend URL(s)

7. Click "Deploy"
8. Wait for deployment to complete
9. Note your backend URL (e.g., `https://fitness-app-backend.onrender.com`)

### Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New" > "Project"
4. Select your fitness-app repo
5. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL from Step 2 (e.g., `https://fitness-app-backend.onrender.com`)

7. Click "Deploy"
8. Wait for deployment to complete
9. Your frontend is live at the Vercel URL

### Step 4: Test Production

```bash
# Test backend health
curl https://fitness-app-backend.onrender.com/health

# Visit frontend
https://your-project.vercel.app
```

## Option 2: Railway (Full Stack)

Railway handles both frontend and backend in one place.

### Step 1: Prepare Repository Structure

Railway needs specific directory structure. You may need to adjust your repo layout.

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Sign up/login
3. Click "New Project" > "Deploy from GitHub"
4. Select your repo
5. Railway will auto-detect the Node.js backend
6. Add services:
   - **MongoDB** (via Railway's data service)
   - **Node.js backend** (automatic)
   - **Static site** (for frontend, may need custom setup)

7. Configure Environment Variables for backend service
8. Deploy

## Option 3: Self-Hosted (VPS)

If you want full control, use a VPS like DigitalOcean, Linode, or AWS EC2.

### Prerequisites

- VPS with Ubuntu 20.04+
- SSH access
- Domain name (optional but recommended)

### Step 1: Set Up Server

```bash
# SSH into your VPS
ssh root@your_vps_ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Install Nginx (as reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 2: Deploy Application

```bash
# Clone repository
cd /home/ubuntu
git clone <your-repo-url> fitness-app
cd fitness-app

# Install dependencies
npm install
cd backend && npm install && cd ..

# Build frontend
npm run build

# Create .env files
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Start backend with PM2
cd backend
pm2 start server.js --name "fitness-app-api"
pm2 save
cd ..
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/fitness-app`:

```nginx
upstream api {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend static files
    location / {
        root /home/ubuntu/fitness-app/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://api/health;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/fitness-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Set Up HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Step 5: Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Production Environment Variables

Make sure to set these in your production environment:

```bash
# Backend
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fitness-app
GOOGLE_API_KEY=your_production_api_key
JWT_SECRET=your_long_random_secure_string_here
JWT_EXPIRY=7d
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Frontend (if needed)
VITE_API_URL=https://your-api-domain.com
```

## Monitoring & Maintenance

### Health Checks

Regularly test your health endpoint:

```bash
curl https://your-api-domain.com/health
```

### Logs

- **Vercel:** Dashboard > Logs tab
- **Render:** Dashboard > Logs tab
- **Railway:** Dashboard > Logs tab
- **Self-hosted:** `pm2 logs` or check `/var/log/nginx/error.log`

### Backups

- **MongoDB Atlas:** Automatic backups (paid plan)
- **Self-hosted MongoDB:** Configure backup scripts

### Monitoring Services

Consider adding:

- Sentry (error tracking): https://sentry.io
- New Relic (performance): https://newrelic.com
- UptimeRobot (uptime monitoring): https://uptimerobot.com

## Troubleshooting

### Backend won't start

- Check logs: `pm2 logs`
- Verify environment variables
- Check database connection
- Check API key validity

### CORS errors

- Verify ALLOWED_ORIGINS includes your frontend domain
- Restart backend after changing .env

### Database issues

- Check MongoDB connection string
- Verify IP whitelist in MongoDB Atlas
- Check database user permissions

### Slow performance

- Check database query performance
- Enable caching
- Use a CDN for frontend
- Scale horizontally (more instances)

## Scaling to Production

For higher traffic:

1. **Database:** Move to dedicated MongoDB cluster with read replicas
2. **Backend:** Deploy multiple instances behind load balancer
3. **Frontend:** Use CDN (Cloudflare, CloudFront)
4. **Caching:** Add Redis for API response caching
5. **Rate Limiting:** Adjust limits based on traffic

## Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] Environment variables secured (no hardcoded secrets)
- [ ] JWT_SECRET is strong and random
- [ ] Database backups automated
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Dependencies kept up to date
- [ ] Security headers set (consider helmet.js)
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using Mongoose)
