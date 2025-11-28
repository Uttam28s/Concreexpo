# Complete Deployment Guide - Concreexpo Application

This guide provides step-by-step instructions to deploy your **Concreexpo** application (Frontend + Backend + Database) completely free using modern cloud platforms.

## 🎯 Recommended Stack (100% Free)

- **Frontend (Next.js)**: Vercel
- **Backend (Node.js/Express)**: Railway
- **Database (PostgreSQL)**: Neon

### Why This Stack?
- ✅ **Vercel**: Created by Next.js team, zero-config deployment, automatic SSL, global CDN
- ✅ **Railway**: Easy Node.js deployment, $5 free credit monthly, auto-deploy from Git
- ✅ **Neon**: Serverless PostgreSQL, 0.5GB free storage, perfect for small-medium apps

---

## 📋 Prerequisites

1. **GitHub Account** (free) - [Sign up here](https://github.com)
2. **Vercel Account** (free) - [Sign up here](https://vercel.com)
3. **Railway Account** (free) - [Sign up here](https://railway.app)
4. **Neon Account** (free) - [Sign up here](https://neon.tech)

---

## 🗄️ Step 1: Setup Database (Neon PostgreSQL)

### 1.1 Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Click **"Sign Up"** and sign in with GitHub
3. Click **"Create Project"**

### 1.2 Create Database
1. **Project Name**: `concreexpo-db`
2. **Region**: Choose closest to your users (e.g., `US East (Ohio)`)
3. **PostgreSQL Version**: `16` (or latest)
4. Click **"Create Project"**

### 1.3 Get Connection String
1. After project creation, you'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
2. **Copy this connection string** - you'll need it for the backend

### 1.4 Test Connection (Optional)
You can test the connection using any PostgreSQL client or Prisma Studio.

---

## 🚂 Step 2: Deploy Backend (Railway)

### 2.1 Prepare Backend for Deployment

#### 2.1.1 Create `railway.json` (Optional - for Railway config)
Create `backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 2.1.2 Update `backend/package.json`
Ensure you have a `start` script:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "postinstall": "prisma generate"
  }
}
```

#### 2.1.3 Create `backend/.dockerignore` (Optional)
```
node_modules
dist
.env
.env.local
.git
```

### 2.2 Push Backend to GitHub
1. Initialize git in backend folder (if not already):
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub (e.g., `concreexpo-backend`)

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/concreexpo-backend.git
   git branch -M main
   git push -u origin main
   ```

### 2.3 Deploy on Railway

1. **Sign in to Railway**
   - Go to [https://railway.app](https://railway.app)
   - Click **"Login"** and sign in with GitHub

2. **Create New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your `concreexpo-backend` repository
   - Railway will automatically detect it's a Node.js project

3. **Add Environment Variables**
   - Click on your project
   - Go to **"Variables"** tab
   - Add the following variables:

   ```env
   # Database
   DATABASE_URL=your_neon_connection_string_here

   # Server
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend.vercel.app

   # JWT Secrets (generate strong random strings)
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-random-string
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret-random-string
   JWT_REFRESH_EXPIRES_IN=30d

   # SMS (MSG91)
   SMS_PROVIDER=msg91
   MSG91_AUTH_KEY=your_msg91_auth_key
   MSG91_SENDER_ID=CNCEXP
   MSG91_ROUTE=4
   MSG91_TEMPLATE_ID=your_template_id
   MSG91_OTP_TEMPLATE_ID=your_otp_template_id

   # Admin Credentials
   ADMIN_EMAIL=admin@wallfloor.com
   ADMIN_PASSWORD=Admin@123456
   ADMIN_PHONE=+919876543210

   # Rate Limiting (optional)
   RATE_LIMIT_WINDOW=900000
   RATE_LIMIT_MAX=100
   OTP_RATE_LIMIT_MAX=5

   # OTP Settings (optional)
   OTP_EXPIRY_MINUTES=15
   OTP_LENGTH=6
   WORKER_VISIT_OTP_EXPIRY_HOURS=24
   ```

   **Important**: Replace placeholder values with your actual values!

4. **Generate JWT Secrets** (if you don't have them):
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32

   # On Windows (PowerShell):
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

5. **Run Database Migrations**
   - Railway will automatically run `npm install` and `npm run build`
   - After deployment, you need to run Prisma migrations
   - Go to **"Deployments"** tab → Click on the latest deployment
   - Click **"View Logs"** → Click **"Open Shell"**
   - Run:
     ```bash
     npx prisma migrate deploy
     npx prisma db seed
     ```

6. **Get Backend URL**
   - After deployment, Railway will provide a URL like: `https://your-app.up.railway.app`
   - Copy this URL - you'll need it for the frontend

---

## 🎨 Step 3: Deploy Frontend (Vercel)

### 3.1 Prepare Frontend for Deployment

#### 3.1.1 Update API URL
The frontend already uses `NEXT_PUBLIC_API_URL` environment variable, which is perfect!

#### 3.1.2 Push Frontend to GitHub
1. Initialize git in frontend folder (if not already):
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub (e.g., `concreexpo-frontend`)

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/concreexpo-frontend.git
   git branch -M main
   git push -u origin main
   ```

### 3.2 Deploy on Vercel

1. **Sign in to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Click **"Sign Up"** and sign in with GitHub

2. **Import Project**
   - Click **"Add New Project"**
   - Select your `concreexpo-frontend` repository
   - Vercel will auto-detect Next.js settings

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./frontend` (if repo contains both frontend/backend, otherwise leave empty)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**
   - Click **"Environment Variables"**
   - Add the following:

   ```env
   # Backend API URL
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api

   # Feature Flags (optional - all default to true)
   NEXT_PUBLIC_FEATURE_DASHBOARD=true
   NEXT_PUBLIC_FEATURE_APPOINTMENTS=true
   NEXT_PUBLIC_FEATURE_INVENTORY=true
   NEXT_PUBLIC_FEATURE_WORKER_COUNTS=true
   NEXT_PUBLIC_FEATURE_REPORTS=true
   NEXT_PUBLIC_FEATURE_CLIENTS=true
   NEXT_PUBLIC_FEATURE_ENGINEERS=true
   NEXT_PUBLIC_FEATURE_MATERIALS=true
   NEXT_PUBLIC_FEATURE_SETTINGS=true
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (usually 2-3 minutes)
   - Vercel will provide a URL like: `https://concreexpo-frontend.vercel.app`

### 3.3 Update Backend CORS Settings

1. Go back to Railway
2. Update `FRONTEND_URL` environment variable:
   ```env
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. Railway will automatically redeploy

---

## 🔄 Step 4: Update Frontend API URL

After getting your backend URL, update the frontend environment variable:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_API_URL` to your Railway backend URL
5. Redeploy (or it will auto-redeploy on next push)

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend
1. Visit: `https://your-backend.up.railway.app/api/health` (if you have a health endpoint)
2. Or test with: `https://your-backend.up.railway.app/api/auth/login` (should return an error, not 404)

### 5.2 Test Frontend
1. Visit your Vercel URL: `https://your-frontend.vercel.app`
2. Try logging in with admin credentials
3. Verify all features work

### 5.3 Test Database
- Use Prisma Studio or any PostgreSQL client to verify data

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- **Solution**: Check Railway logs for errors
- Ensure all environment variables are set
- Verify `DATABASE_URL` is correct

**Problem**: Database connection failed
- **Solution**: 
  - Verify Neon connection string
  - Ensure database is not paused (Neon pauses inactive databases)
  - Check if IP restrictions are enabled in Neon

**Problem**: Prisma migrations failing
- **Solution**: Run migrations manually in Railway shell:
  ```bash
  npx prisma migrate deploy
  ```

### Frontend Issues

**Problem**: API calls failing
- **Solution**: 
  - Verify `NEXT_PUBLIC_API_URL` is correct
  - Check CORS settings in backend
  - Ensure backend is running

**Problem**: Build failing
- **Solution**: 
  - Check Vercel build logs
  - Ensure all dependencies are in `package.json`
  - Verify Node.js version compatibility

---

## 📊 Alternative Free Hosting Options

### Frontend Alternatives

#### Option 2: Netlify
- **Free Tier**: 100GB bandwidth, 300 build minutes/month
- **Steps**: Similar to Vercel, import from GitHub
- **URL**: [https://netlify.com](https://netlify.com)

#### Option 3: Cloudflare Pages
- **Free Tier**: Unlimited bandwidth, unlimited builds
- **Steps**: Connect GitHub repo, auto-deploy
- **URL**: [https://pages.cloudflare.com](https://pages.cloudflare.com)

### Backend Alternatives

#### Option 2: Render
- **Free Tier**: 750 hours/month, spins down after 15min inactivity
- **Steps**: 
  1. Sign up at [https://render.com](https://render.com)
  2. New → Web Service → Connect GitHub
  3. Select repo, set build: `npm install && npm run build`
  4. Start command: `npm start`
- **Note**: Free tier has cold starts (first request takes ~30s)

#### Option 3: Fly.io
- **Free Tier**: 3 shared-cpu VMs, 3GB persistent volumes
- **Steps**: 
  1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
  2. `fly launch` in backend directory
  3. Follow prompts
- **URL**: [https://fly.io](https://fly.io)

### Database Alternatives

#### Option 2: Supabase
- **Free Tier**: 500MB database, 2GB bandwidth
- **Steps**: 
  1. Sign up at [https://supabase.com](https://supabase.com)
  2. Create project
  3. Get connection string from Settings → Database
- **Note**: Includes additional features (Auth, Storage, etc.)

#### Option 3: Railway PostgreSQL
- **Free Tier**: Included with Railway $5 credit
- **Steps**: 
  1. In Railway project, click "+ New"
  2. Select "Database" → "PostgreSQL"
  3. Railway provides connection string automatically

#### Option 4: Render PostgreSQL
- **Free Tier**: 90 days free, then $7/month
- **Steps**: 
  1. In Render dashboard, New → PostgreSQL
  2. Get connection string from dashboard

---

## 💰 Cost Breakdown (Free Tier Limits)

### Vercel (Frontend)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Preview deployments

### Railway (Backend)
- ✅ $5 free credit/month (~500 hours)
- ✅ Auto-deploy from Git
- ✅ Custom domains
- ⚠️ Credit expires monthly

### Neon (Database)
- ✅ 0.5GB storage
- ✅ Unlimited projects
- ✅ Automatic backups
- ⚠️ Database pauses after 7 days inactivity (auto-resumes on request)

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT secrets** - Generate random 32+ character strings
3. **Enable CORS properly** - Only allow your frontend domain
4. **Use HTTPS** - All platforms provide SSL automatically
5. **Regular backups** - Neon provides automatic backups
6. **Monitor usage** - Check Railway credits and Neon storage

---

## 📈 Scaling Beyond Free Tier

When you outgrow free tiers:

1. **Vercel Pro**: $20/month - More bandwidth, team features
2. **Railway Pro**: $20/month - More credits, better performance
3. **Neon Pro**: $19/month - More storage, better performance

---

## 🎉 Success Checklist

- [ ] Database created on Neon
- [ ] Backend deployed on Railway
- [ ] Database migrations run successfully
- [ ] Backend environment variables configured
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variables configured
- [ ] CORS updated in backend
- [ ] Application tested and working
- [ ] Admin user can login
- [ ] All features functional

---

## 📞 Support Resources

- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [https://docs.railway.app](https://docs.railway.app)
- **Neon Docs**: [https://neon.tech/docs](https://neon.tech/docs)
- **Prisma Docs**: [https://www.prisma.io/docs](https://www.prisma.io/docs)

---

## 🚀 Quick Start Commands

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production Deployment
1. Push code to GitHub
2. Railway auto-deploys backend
3. Vercel auto-deploys frontend
4. Done! 🎉

---

**Last Updated**: December 2024
**Maintained By**: Concreexpo Development Team

