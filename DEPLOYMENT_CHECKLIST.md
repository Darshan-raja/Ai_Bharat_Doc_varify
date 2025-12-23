# GitHub Deployment Checklist for Ai_Bharat_Doc_varify

## ✅ Project Status Overview

### Current Git Status
- **Branch:** master
- **Status:** Up to date with origin/master
- **Uncommitted changes:** 
  - `frontend/.gitignore` (modified)
  - `index.html` (deleted)
- **Untracked files:**
  - `ANALYSIS.md`

---

## 🔴 CRITICAL ISSUES TO FIX

### 1. **Hardcoded JWT Secret in Production**
**Location:** [backend/middlewares/Auth.js](backend/middlewares/Auth.js) and [backend/middlewares/AdminAuth.js](backend/middlewares/AdminAuth.js)

**Issue:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 
  (process.env.NODE_ENV !== 'production' ? 'dev_jwt_secret_change_me' : undefined);
```

**Problem:** Fallback to hardcoded secret string in production is a SECURITY RISK.

**Fix:** 
- Add `JWT_SECRET` to your GitHub Secrets or deployment environment variables
- Remove the hardcoded fallback for production
- Keep only development fallback

---

### 2. **Deleted index.html - Not Tracked**
**Issue:** `index.html` at root level was deleted but needs to be either:
- Removed from git tracking if no longer needed
- Restored if it's required

**Fix:**
```bash
git rm index.html
git commit -m "Remove root index.html"
```

---

### 3. **Missing .env.example File**
**Issue:** No `.env.example` file to document required environment variables

**Required Environment Variables:**
```
# Backend
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Frontend (if applicable)
VITE_API_URL=production_api_url
```

**Action:** Create [.env.example](../backend/.env.example) in backend folder with all required variables

---

## ⚠️ IMPORTANT CHECKS

### 4. **Frontend Build Configuration**
**Status:** ✓ Good
- [vite.config.js](frontend/vite.config.js) exists
- Build scripts configured: `build` and `build:dev`
- ESLint installed but needs TypeScript support (see ANALYSIS.md)

**Recommendation:** Fix ESLint TypeScript configuration before deploying

---

### 5. **Backend Configuration**
**Status:** ✓ Good
- Express server properly configured
- CORS settings with development fallback
- Environment-based configuration

**Issues to verify:**
- MongoDB URI is set in deployment environment
- All external API endpoints configured

---

### 6. **.gitignore Files**
**Status:** ✓ Good

**Backend .gitignore:**
- ✓ `.env` ignored
- ✓ `node_modules/` ignored
- ✓ `dist/` ignored
- ✓ `logs/` ignored

**Frontend .gitignore:**
- ✓ `.env` ignored
- ✓ `node_modules` ignored
- ✓ `dist` ignored
- ✓ Editor configs ignored

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment Steps

- [ ] **Fix JWT Secret Issue** - Remove hardcoded fallback in Auth middleware
- [ ] **Commit Pending Changes**
  ```bash
  git add .
  git rm index.html
  git commit -m "Cleanup: remove deleted index.html and update gitignore"
  ```

- [ ] **Add .env.example** - Document all required environment variables
  
- [ ] **Fix ESLint Configuration** - Add TypeScript support as noted in ANALYSIS.md
  
- [ ] **Verify Dependencies**
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```

- [ ] **Backend Dependencies** - All required packages present:
  - ✓ Express, Mongoose, JWT, Bcrypt
  - ✓ CORS, Dotenv, Nodemailer
  - ✓ Multer for file uploads
  - ✓ Axios for API calls

- [ ] **Frontend Dependencies** - All React/TypeScript packages present:
  - ✓ React Router, TanStack Query
  - ✓ Shadcn UI components
  - ✓ Tailwind CSS configured
  - ✓ Vite build tool

### For GitHub

- [ ] **Create .gitignore at root** (if needed) to prevent `node_modules` at root level
- [ ] **Add GitHub Secrets** for production:
  - `MONGO_URI` - MongoDB connection string
  - `JWT_SECRET` - Secure random JWT secret
  - Any other API keys or credentials

- [ ] **Update README.md** with:
  - Project description
  - Setup instructions
  - Environment variables required
  - Deployment instructions

### For Deployment Platform (Vercel, Render, etc.)

- [ ] **Backend Service Setup**
  - Set Node environment variables
  - Configure MongoDB connection
  - Set JWT_SECRET

- [ ] **Frontend Setup**
  - Configure build command: `npm run build`
  - Configure start command (if needed)
  - Set API endpoint environment variable

---

## 🔒 Security Checklist

- [ ] **No Hardcoded Secrets** - Verify no API keys in code
- [ ] **Environment Variables** - All sensitive data in env variables
- [ ] **.gitignore Complete** - No `.env` files in git
- [ ] **JWT Secret** - Unique strong secret for production
- [ ] **CORS Configured** - Only allow trusted origins in production
- [ ] **Dependencies Secure** - Run `npm audit` in both directories

---

## 📦 Package Verification

### Backend (package.json)
```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.18.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^3.0.2",
    "dotenv": "^17.2.3",
    "cors": "^2.8.5",
    "cookie-parser": "^1.4.7",
    "multer": "^2.0.2",
    "nodemailer": "^7.0.6",
    "axios": "^1.11.0",
    "node-fetch": "^3.3.2"
  }
}
```

### Frontend (package.json)
- ✓ Has build scripts: `build`, `build:dev`, `preview`
- ✓ Uses Vite as bundler
- ✓ Has TypeScript support
- ✓ Includes Shadcn UI components
- ✓ Includes React Router for navigation
- ✓ Includes TanStack Query for data fetching

---

## 🚀 Next Steps

1. **Fix the critical issues** (JWT Secret, deleted file)
2. **Create .env.example** in backend
3. **Update ESLint configuration** for TypeScript
4. **Create comprehensive README.md**
5. **Push all changes** to GitHub
6. **Set up deployment** on chosen platform
7. **Configure environment variables** on deployment platform

---

## 📝 Notes

- The project uses MongoDB - ensure it's accessible from your deployment environment
- Frontend is a React + TypeScript + Vite app
- Backend is Node.js Express with ES modules (`"type": "module"`)
- ML folder contains Python projects (forge detection and OCR API) - ensure separate deployment if needed
- Make sure all API endpoints are accessible from production frontend URL
