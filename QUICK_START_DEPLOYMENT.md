# Deployment Quick Start Guide

**Your project is 90% ready! Just need to fix 1 critical security issue.**

---

## 🎯 5-Minute Quick Fix

### Step 1: Fix Auth.js (2 minutes)

**File:** `backend/middlewares/Auth.js`

**Line 4 - CHANGE THIS:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret_change_me' : undefined);
```

**TO THIS:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
```

### Step 2: Fix AdminAuth.js (2 minutes)

**File:** `backend/middlewares/AdminAuth.js`

**Line 3 - CHANGE THIS:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret_change_me' : undefined);
```

**TO THIS:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
```

### Step 3: Git Cleanup (1 minute)

```bash
git rm index.html
git add .
git commit -m "fix: secure JWT configuration and remove deleted index.html"
```

---

## 🔑 Generate Your Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output. You'll need it for:
- Local development (`.env` file)
- GitHub Secrets
- Deployment platform

---

## 🚀 Deployment Platforms

### Frontend (Choose One)

**Vercel (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Build: `npm run build`
5. Output: `dist`

**Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`

**GitHub Pages** (Free but limited)
1. Add to `frontend/vite.config.js`:
   ```javascript
   base: '/Ai_Bharat_Doc_varify/',
   ```
2. Run: `npm run build`
3. Push `dist` folder to `gh-pages` branch

### Backend (Choose One)

**Render** (Free tier available)
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Runtime: Node
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables

**Railway** (Free tier)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub
4. Add environment variables

**Vercel** (Can do both)
1. Same as frontend
2. Add serverless functions if needed

**DigitalOcean** (More control)
1. Create App Platform
2. Connect GitHub
3. Configure environment

---

## 📋 Environment Variables Needed

### Backend (Add to deployment platform)
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=<your-generated-secret>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Frontend (If needed)
```
VITE_API_URL=https://your-backend-domain.com
```

---

## ✅ Pre-Deployment Checklist

- [ ] Applied JWT fixes to both middleware files
- [ ] Generated secure JWT_SECRET
- [ ] Committed git changes: `git commit -m "fix: secure JWT configuration"`
- [ ] Pushed to GitHub: `git push origin master`
- [ ] Tested locally:
  ```bash
  cd backend
  npm install
  NODE_ENV=production JWT_SECRET=<your-secret> npm start
  ```
- [ ] No `.env` file in git: `git status | grep .env` (should be empty)
- [ ] All dependencies installed: Both `npm install` commands succeed
- [ ] Frontend builds: `npm run build` succeeds
- [ ] Backend starts: `npm start` works locally

---

## 🌐 After Deployment

### Test Your APIs
```bash
# Test backend is up
curl https://your-backend-domain.com/

# Test frontend is accessible
curl https://your-frontend-domain.com/
```

### Configure CORS
Edit `backend/server.js` line 16:
```javascript
const allowedOrigins = [
  "https://your-frontend-domain.com",
  "http://localhost:3000", // dev only
];
```

### Monitor for Errors
- Check deployment platform logs
- Setup error tracking (Sentry)
- Monitor database connections

---

## 📁 Generated Helper Files

You have 5 new documentation files:

1. **[README.md](README.md)** - Project overview & setup
2. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Detailed checklist
3. **[DEPLOYMENT_REPORT.md](DEPLOYMENT_REPORT.md)** - Full analysis
4. **[FIX_SECURITY_ISSUES.md](FIX_SECURITY_ISSUES.md)** - Code fixes explained
5. **[backend/.env.example](backend/.env.example)** - Environment template

Read them in this order for best understanding.

---

## 🆘 Common Issues & Fixes

### Backend won't start
```
Error: JWT_SECRET is not defined
```
**Fix:** Set JWT_SECRET environment variable
```bash
export JWT_SECRET=your_secret_here
npm start
```

### MongoDB connection fails
```
Error: connect ENOTFOUND mongodb.net
```
**Fix:** Verify MONGO_URI in .env is correct

### CORS errors in browser
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Fix:** Add your frontend URL to allowedOrigins in server.js

### Frontend shows blank page
**Fix:** Check browser console for errors, ensure API URL is correct

### 404 on frontend routes
**Fix:** Ensure Vercel/deployment is configured for SPA (rewrite all to index.html)

---

## 🔐 Security Reminders

✅ **DO:**
- Use strong, unique JWT_SECRET for production
- Keep .env file local only
- Use environment variables for secrets
- Regenerate secrets if exposed
- Use HTTPS everywhere
- Keep dependencies updated

❌ **DON'T:**
- Commit .env files
- Share secrets in code
- Use same secret for dev and prod
- Disable CORS in production
- Use hardcoded credentials
- Deploy without HTTPS

---

## 📞 Getting Help

### If you're stuck:

1. **Check [FIX_SECURITY_ISSUES.md](FIX_SECURITY_ISSUES.md)**
   - Has exact code changes needed
   - Testing procedures included

2. **Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**
   - Step-by-step verification
   - Pre-deployment checklist

3. **Check [DEPLOYMENT_REPORT.md](DEPLOYMENT_REPORT.md)**
   - Detailed analysis
   - Recommendations included

4. **Check [README.md](README.md)**
   - Project setup
   - API documentation
   - Troubleshooting guide

---

## 🎯 Timeline

| Step | Time | What | Status |
|------|------|------|--------|
| Fix Code | 5 min | Apply JWT security fixes | 🔴 TODO |
| Test Local | 10 min | Verify everything works | 🔴 TODO |
| Commit | 2 min | Push to GitHub | 🔴 TODO |
| Setup Platform | 15 min | Configure Vercel/Render | 🔴 TODO |
| Deploy | 10 min | Deploy frontend & backend | 🔴 TODO |
| Test Deployed | 10 min | Verify production works | 🔴 TODO |
| **TOTAL** | **52 min** | **Ready to Go Live** | 🔴 TODO |

---

## 🚀 You're Ready!

Your project is **well-structured, secure (after fix), and ready to deploy**.

**Next Action:** Apply the 5-minute fix above, then follow DEPLOYMENT_CHECKLIST.md

**Estimated time to live:** 1-2 hours

Good luck! 🎉

---

**Last updated:** December 23, 2025
