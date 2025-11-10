# 🪟 Windows Local Setup Guide - Concreexpo

Complete guide to run the Concreexpo (Wall & Flooring Management System) on your Windows machine.

---

## 📋 Prerequisites

Before starting, ensure you have these installed on your Windows system:

### 1. **Node.js** (v18 or higher)
- Download from: https://nodejs.org/
- Recommended: LTS version (v20.x)
- Verify installation:
  ```cmd
  node --version
  npm --version
  ```

### 2. **PostgreSQL** (v14 or higher)
- Download from: https://www.postgresql.org/download/windows/
- During installation, remember your **postgres password**
- Default port: `5432`
- Verify installation:
  ```cmd
  psql --version
  ```

### 3. **Git** (for cloning/updates)
- Download from: https://git-scm.com/download/win
- Verify:
  ```cmd
  git --version
  ```

### 4. **Code Editor** (Optional but recommended)
- VS Code: https://code.visualstudio.com/

---

## 🗄️ Step 1: Setup PostgreSQL Database

### Option A: Using pgAdmin (GUI)

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click on **Databases** → **Create** → **Database**
4. Database name: `flooring_db`
5. Click **Save**

### Option B: Using Command Line

1. Open **Command Prompt** or **PowerShell** as Administrator
2. Connect to PostgreSQL:
   ```cmd
   psql -U postgres
   ```
3. Enter your postgres password
4. Create database:
   ```sql
   CREATE DATABASE flooring_db;
   ```
5. Verify database created:
   ```sql
   \l
   ```
6. Exit:
   ```sql
   \q
   ```

---

## 🔧 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

Open **Command Prompt** or **PowerShell**:

```cmd
cd path\to\Concreexpo\backend
```

Example:
```cmd
cd C:\Users\YourName\Projects\Concreexpo\backend
```

### 2.2 Install Dependencies

```cmd
npm install
```

**Note**: If you encounter any errors with `bcrypt`, run:
```cmd
npm rebuild bcrypt
```

### 2.3 Configure Environment Variables

1. Open `backend\.env` file in a text editor
2. Update the following values:

```env
# Database - IMPORTANT: Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/flooring_db"

# JWT - Keep these for development (change in production)
JWT_SECRET="dev-secret-key-min-32-chars-for-local-testing-only"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="dev-refresh-secret-different-from-jwt-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# SMS Gateway (MSG91) - Optional for local testing
SMS_PROVIDER="msg91"
MSG91_AUTH_KEY="your_msg91_auth_key_from_dashboard"
MSG91_SENDER_ID="CNCEXP"
MSG91_ROUTE="4"
MSG91_TEMPLATE_ID=""
MSG91_OTP_TEMPLATE_ID=""

# Application
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Admin Settings (Initial login credentials)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin@123456"
ADMIN_PHONE="+919876543210"

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
OTP_RATE_LIMIT_MAX=5

# OTP Settings
OTP_EXPIRY_MINUTES=15
OTP_LENGTH=6
WORKER_VISIT_OTP_EXPIRY_HOURS=24
```

**IMPORTANT**: Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

Example:
```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/flooring_db"
```

### 2.4 Setup Database Schema

Run these commands in order:

```cmd
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:push

# Seed initial data (creates admin user)
npm run prisma:seed
```

### 2.5 Verify Database Setup (Optional)

Open Prisma Studio to view your database:
```cmd
npm run prisma:studio
```

This opens a browser at `http://localhost:5555` where you can see all tables and data.

### 2.6 Run Backend Server

```cmd
npm run dev
```

**Expected Output**:
```
[nodemon] starting `ts-node src/index.ts`
🚀 Server running on http://localhost:3001
✅ Database connected successfully
```

**Keep this terminal window open!**

Test backend API:
- Open browser: http://localhost:3001/api/health
- Should show: `{"status":"ok","timestamp":"..."}`

---

## 🎨 Step 3: Frontend Setup

### 3.1 Open New Terminal Window

**Important**: Keep the backend terminal running, open a NEW terminal window.

### 3.2 Navigate to Frontend Directory

```cmd
cd path\to\Concreexpo\frontend
```

Example:
```cmd
cd C:\Users\YourName\Projects\Concreexpo\frontend
```

### 3.3 Install Dependencies

```cmd
npm install
```

### 3.4 Configure Environment Variables

The frontend `.env.local` file should already be configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Concreexpo
```

**No changes needed** unless you changed the backend port.

### 3.5 Run Frontend Server

```cmd
npm run dev
```

**Expected Output**:
```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
- Ready in 2.3s
```

**Keep this terminal window open too!**

---

## 🎉 Step 4: Access the Application

### Open Your Browser

Navigate to: **http://localhost:3000**

### Default Login Credentials

Use the admin credentials from your `.env` file:

```
Email: admin@example.com
Password: Admin@123456
```

### You Should See:

✅ Login page with Concreexpo branding
✅ After login → Dashboard with statistics
✅ Sidebar navigation with all modules

---

## 🚀 Quick Start Commands

Once everything is set up, you can quickly start both servers:

### Terminal 1: Backend
```cmd
cd backend
npm run dev
```

### Terminal 2: Frontend
```cmd
cd frontend
npm run dev
```

---

## 🛠️ Troubleshooting

### Problem 1: "psql is not recognized"

**Solution**: Add PostgreSQL to PATH

1. Find PostgreSQL bin directory (usually: `C:\Program Files\PostgreSQL\15\bin`)
2. Open **System Properties** → **Environment Variables**
3. Edit **Path** variable
4. Add PostgreSQL bin path
5. Restart terminal

### Problem 2: Backend won't start - "Port 3001 already in use"

**Solution A**: Kill the process using the port
```cmd
# Find process ID
netstat -ano | findstr :3001

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Solution B**: Change backend port
- Edit `backend\.env`: `PORT=3002`
- Edit `frontend\.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3002/api`

### Problem 3: Frontend won't start - "Port 3000 already in use"

**Solution**: Next.js will automatically ask to use port 3001. Type `Y` to accept.

Or manually change port:
```cmd
# Windows CMD
set PORT=3002 && npm run dev

# PowerShell
$env:PORT=3002; npm run dev
```

### Problem 4: "DATABASE_URL environment variable not found"

**Solution**:
1. Ensure `backend\.env` file exists
2. Check `DATABASE_URL` is correctly set
3. Restart the backend server

### Problem 5: Database connection error

**Solution**:
1. Check PostgreSQL is running:
   - Open **Services** (Win + R → `services.msc`)
   - Find "postgresql-x64-15" (or your version)
   - Ensure it's **Running**
2. Verify database exists:
   ```cmd
   psql -U postgres -c "\l"
   ```
3. Check DATABASE_URL format:
   ```
   postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
   ```

### Problem 6: "bcrypt" build errors on Windows

**Solution**:
```cmd
npm install -g windows-build-tools
cd backend
npm rebuild bcrypt
```

### Problem 7: Prisma errors

**Solution**: Reset and regenerate
```cmd
cd backend
npx prisma generate
npx prisma db push --force-reset
npm run prisma:seed
```

### Problem 8: "Cannot find module" errors

**Solution**: Clean install
```cmd
# Backend
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

# Frontend
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Problem 9: SMS not working

**Solution**: This is normal for local development!
- MSG91 requires valid API credentials
- For testing, you can skip SMS features
- Or sign up at https://msg91.com/ and add credentials to `.env`

---

## 📱 Testing the Application

### 1. Login Test
- Go to http://localhost:3000
- Login with admin credentials
- Should redirect to dashboard

### 2. Create a Client
- Click **Clients** in sidebar
- Click **Add Client**
- Fill form and save
- Verify client appears in list

### 3. Create an Engineer
- Click **Engineers** in sidebar
- Click **Add Engineer**
- Fill form and save
- Verify engineer can login with their credentials

### 4. Check Dashboard
- Go to **Dashboard**
- Should see statistics updating
- Charts should display

### 5. Test Materials
- Click **Materials** → **Categories**
- Add a category
- Click **Materials** → **All Materials**
- Add a material

---

## 🔄 Daily Development Workflow

### Starting Work
```cmd
# Terminal 1: Start Backend
cd C:\path\to\Concreexpo\backend
npm run dev

# Terminal 2: Start Frontend
cd C:\path\to\Concreexpo\frontend
npm run dev
```

### Stopping Work
- Press `Ctrl + C` in both terminal windows
- Type `Y` to confirm

### Database Management
```cmd
# View database in GUI
cd backend
npm run prisma:studio

# Reset database (WARNING: Deletes all data!)
npx prisma db push --force-reset
npm run prisma:seed
```

---

## 🎯 Next Steps

Once everything is running:

1. **Explore Features**: Test all modules (Clients, Engineers, Materials, etc.)
2. **Setup MSG91**: Add SMS credentials if you want to test OTP features
3. **Customize**: Update branding, colors, or features as needed
4. **Deploy**: When ready, deploy to production (see README.md)

---

## 📚 Useful Resources

- **Backend API Docs**: `BACKEND_API_TESTING.md`
- **Project Status**: `PROJECT_STATUS.md`
- **Quick Start**: `QUICK_START.md`
- **Main README**: `README.md`
- **MSG91 Setup**: `backend/MSG91_SETUP.md`

---

## 💡 Tips for Windows Development

### Use PowerShell instead of CMD
- Better terminal experience
- Supports more commands
- Color output

### Install Windows Terminal (Recommended)
- Download from Microsoft Store
- Tabbed interface (run backend + frontend in same window)
- Better fonts and colors

### Use nodemon for auto-restart
- Already configured in `backend/package.json`
- Server auto-restarts when you save files

### Keep terminals organized
- Terminal 1: Backend (label it)
- Terminal 2: Frontend (label it)
- Terminal 3: Database/Testing

---

## ❓ Need Help?

### Common Issues
1. Check both servers are running
2. Check database connection
3. Check .env files are properly configured
4. Check console for error messages

### Logs Location
- **Backend logs**: Terminal where backend is running
- **Frontend logs**: Browser console (F12)
- **Database logs**: PostgreSQL logs folder

### Quick Health Check
```cmd
# Test backend
curl http://localhost:3001/api/health

# Or open in browser
http://localhost:3001/api/health

# Test frontend
http://localhost:3000
```

---

## ✅ Success Checklist

- [ ] Node.js installed (v18+)
- [ ] PostgreSQL installed and running
- [ ] Database `flooring_db` created
- [ ] Backend dependencies installed
- [ ] Backend `.env` configured with correct DATABASE_URL
- [ ] Database schema created (`prisma:push`)
- [ ] Database seeded with admin user
- [ ] Backend running on http://localhost:3001
- [ ] Frontend dependencies installed
- [ ] Frontend running on http://localhost:3000
- [ ] Can login with admin credentials
- [ ] Dashboard displays correctly

---

**🎉 Congratulations! Your Concreexpo development environment is ready!**

If you encounter any issues not covered here, check the error message in the terminal and search for it in the troubleshooting section.
