# SkillSwap - Production Deployment Guide

Complete guide for deploying your SkillSwap application to production.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Local Testing
- [ ] Both frontend and backend run locally without errors
- [ ] Can sign up and create an account
- [ ] Can add skills and save them
- [ ] Can find matches with other test users
- [ ] Can send and receive messages
- [ ] Logout works and clears authentication
- [ ] All error messages display properly
- [ ] App is responsive on mobile

### Code & Config
- [ ] Remove console.log statements (optional, nice-to-have)
- [ ] Verify all environment variables are configured
- [ ] Check sensitive data is not hardcoded
- [ ] Review security settings in backend
- [ ] Test with different browsers
- [ ] Check for console errors in DevTools

### Database
- [ ] MongoDB Atlas account created
- [ ] Cluster deployed
- [ ] User created with proper permissions
- [ ] Network access configured (IP whitelist)
- [ ] Connection string tested

---

## Backend Deployment

### Option 1: Deploy to Railway (Recommended)

Railway is the easiest for Node.js + MongoDB projects.

#### Step 1: Prepare Repository
```bash
# Ensure backend/.env is NOT in git
echo "backend/.env" >> .gitignore

# Push to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your SkillSwap repository
4. Select the root directory
5. Choose Node.js environment

#### Step 3: Configure Environment Variables
In Railway project settings, add:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap?retryWrites=true&w=majority
DB_NAME=skillswap
FRONTEND_URL=https://skillswap.vercel.app
JWT_SECRET=<generate-random-64-character-string>
```

To generate JWT_SECRET:
```bash
# On Mac/Linux
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online tool: https://www.uuidgenerator.net/
```

#### Step 4: Configure Start Script
In `backend/package.json`, verify:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "16"
  }
}
```

#### Step 5: Deploy
- Railway automatically deploys when you push to GitHub
- Monitor deployment in Railway dashboard
- Once deployed, copy the Railway URL (e.g., `https://skillswap-backend.up.railway.app`)

---

### Option 2: Deploy to Render

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up and connect your GitHub account

#### Step 2: Create Web Service
1. Click **"+ New"** → **"Web Service"**
2. Select your GitHub repo
3. Configure:
   - **Name:** skillswap-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Region:** Choose closest to users

#### Step 3: Add Environment Variables
Click **"Environment"** and add:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap?retryWrites=true&w=majority
DB_NAME=skillswap
FRONTEND_URL=https://skillswap.vercel.app
JWT_SECRET=<your-64-char-secret>
```

#### Step 4: Deploy
- Render deploys automatically
- Monitor in Render dashboard
- Copy the deployed URL

---

### Option 3: Deploy to Heroku

#### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu/Linux
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Login & Create App
```bash
heroku login

heroku create skillswap-backend

# Or for existing app:
heroku git:remote -a skillswap-backend
```

#### Step 3: Set Environment Variables
```bash
heroku config:set PORT=5000
heroku config:set MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/skillswap?retryWrites=true&w=majority"
heroku config:set DB_NAME=skillswap
heroku config:set FRONTEND_URL=https://skillswap.vercel.app
heroku config:set JWT_SECRET=<your-64-char-secret>
```

#### Step 4: Deploy
```bash
git push heroku main
```

#### Step 5: View Logs
```bash
heroku logs --tail
```

---

## Frontend Deployment

### Deploy to Vercel (Recommended)

#### Step 1: Build Locally
```bash
npm run build
# Should complete without errors
```

#### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"Import Project"**
4. Select your repository
5. Configure:
   - **Framework:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

#### Step 3: Add Environment Variables
In Vercel project settings, add:
```env
NEXT_PUBLIC_API_URL=https://skillswap-backend.up.railway.app
```

(Replace with your actual backend URL from Railway/Render/Heroku)

#### Step 4: Deploy
- Click **"Deploy"**
- Vercel deploys automatically
- Your app will be at `https://skillswap.vercel.app` (or your custom domain)

#### Step 5: Automatic Deployments
Every push to main branch auto-deploys to production.

---

### Alternative: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. **"Add new site"** → **"Import an existing project"**
3. Select your repository
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Add environment variables:
   ```env
   NEXT_PUBLIC_API_URL=your-backend-url
   ```
6. Deploy

---

## MongoDB Atlas Setup

If you haven't already configured MongoDB Atlas:

#### Step 1: Create Cluster
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create a new project
4. Create a cluster:
   - **Cluster Tier:** M0 (free)
   - **Cloud Provider:** AWS/Azure/GCP (pick closest)
   - **Region:** Choose closest to users
5. Wait for cluster to deploy (5-10 minutes)

#### Step 2: Create Database User
1. Go to **"Database Access"**
2. **"Add New Database User"**
3. Enter username and password
4. **"Add User"**

#### Step 3: Configure IP Whitelist
1. Go to **"Network Access"**
2. **"Add IP Address"**
3. For testing: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific IPs of your servers
5. **"Confirm"**

#### Step 4: Get Connection String
1. Click **"Connect"** on cluster
2. Choose **"Connect your application"**
3. Copy connection string
4. Replace `<password>` with your database user password
5. Replace `myFirstDatabase` with `skillswap`

---

## Environment Variables Summary

### Frontend Production (.env on Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend Production
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillswap?retryWrites=true&w=majority
DB_NAME=skillswap
FRONTEND_URL=https://skillswap.vercel.app
JWT_SECRET=<64-character-random-string>
```

---

## Post-Deployment Verification

### Test Backend
```bash
# Health check
curl https://your-backend-url.com/health

# Should return: {"status":"OK"}
```

### Test Frontend
1. Open your frontend URL in browser
2. Go through the full user flow:
   - Sign up new account
   - Add skills
   - Create another account with different skills
   - Verify both see each other as matches
   - Test messaging between accounts
   - Test logout and login

### Check Production Logs

**Railway:**
- Dashboard → Project → Logs tab

**Render:**
- Dashboard → Service → Logs tab

**Heroku:**
```bash
heroku logs --tail -a skillswap-backend
```

**Vercel:**
- Dashboard → Deployments → View Logs

### Monitor Performance
- Check page load times
- Monitor API response times
- Watch for database connection issues
- Monitor error rates

---

## Security Checklist for Production

### Before Going Live
- [ ] JWT_SECRET is a strong 64+ character random string
- [ ] Database credentials are secure and unique
- [ ] FRONTEND_URL is set to actual frontend URL
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS origins restricted to frontend URL only
- [ ] No console.log() statements logging sensitive data
- [ ] Database backups configured
- [ ] Error pages don't expose sensitive information
- [ ] Rate limiting enabled on API (optional)
- [ ] Monitoring and alerting configured

### Database Security
- [ ] IP whitelist configured (not 0.0.0.0/0 for production)
- [ ] Database user has minimal required permissions
- [ ] Encryption at rest enabled
- [ ] Regular backups configured
- [ ] Connection using TLS/SSL

### API Security
- [ ] All sensitive operations require authentication
- [ ] Input validation on all endpoints
- [ ] CORS headers configured properly
- [ ] Rate limiting configured
- [ ] DDoS protection enabled (Vercel/Railway provide this)

---

## Custom Domain Setup (Optional)

### For Vercel Frontend
1. Go to Vercel project settings
2. **"Domains"**
3. **"Add Domain"**
4. Enter your domain
5. Add DNS records (Vercel provides instructions)
6. Wait for DNS propagation (can take 24-48 hours)

### For Backend Domain
Update environment variables:
```env
FRONTEND_URL=https://your-domain.com
```

---

## Troubleshooting Deployment

### "MongoDB connection failed"
```
❌ Error: ECONNREFUSED
```
- Check MONGO_URI is correct
- Verify IP whitelist allows your server IP
- Check username/password are correct
- Ensure cluster is running

### "CORS error in frontend"
```
❌ Access to XMLHttpRequest blocked by CORS policy
```
- Check FRONTEND_URL is set correctly in backend
- Ensure frontend URL matches exactly (include https://)
- Restart backend after changing FRONTEND_URL

### "Port already in use"
```
❌ Error: listen EADDRINUSE :::5000
```
- Change PORT to different number
- Or kill process using port:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

### "Environment variables not loading"
- Verify variables are set in platform dashboard (not local .env)
- Restart service after adding variables
- Check variable names are exact (case-sensitive)
- Verify NEXT_PUBLIC_ prefix for frontend vars

### "Database migrations not running"
- The app creates collections and indexes automatically
- Check backend logs for connection confirmation
- First signup will create users collection
- No manual migrations needed

---

## Monitoring & Maintenance

### Set Up Monitoring
1. **Error tracking:** Sentry or LogRocket
2. **Performance monitoring:** New Relic or DataDog
3. **Uptime monitoring:** Uptime Robot or Freshping
4. **Log aggregation:** Papertrail or ELK stack

### Regular Maintenance
- Weekly: Check logs for errors
- Monthly: Review database performance
- Quarterly: Update dependencies
- Annually: Security audit

### Scaling Considerations
As users grow:
- **Database:** Upgrade MongoDB cluster tier
- **Backend:** Add horizontal scaling/load balancing
- **Frontend:** Already scales automatically on Vercel
- **Cache:** Add Redis for session/data caching
- **CDN:** Enable Vercel's built-in CDN

---

## Rollback Procedure

If issues arise after deployment:

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click **"Promote to Production"**

### Railway/Render
1. Go to Deployments
2. Select previous stable version
3. Redeploy

### Heroku
```bash
heroku releases
heroku rollback
```

---

## Continuous Integration

### GitHub Actions Setup (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16
      - run: npm install
      - run: npm run lint
      - run: npm run build
```

---

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)

---

## Final Checklist

Before announcing launch:
- [ ] All features tested in production
- [ ] Error handling verified
- [ ] Database backups working
- [ ] Monitoring configured
- [ ] Team access configured
- [ ] Documentation updated
- [ ] Customer support ready
- [ ] Analytics configured

---

**Congratulations! Your app is now in production! 🚀**

Monitor logs regularly and enjoy serving your users!

For issues, refer to troubleshooting section or check deployment platform docs.
