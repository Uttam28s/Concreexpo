@echo off
echo ========================================
echo   Concreexpo Backend - First Time Setup
echo ========================================
echo.
echo This script will:
echo 1. Install all dependencies
echo 2. Generate Prisma client
echo 3. Create database schema
echo 4. Seed initial data (admin user)
echo.
echo Make sure you have:
echo - PostgreSQL installed and running
echo - Created database 'flooring_db'
echo - Updated backend\.env with your DATABASE_URL
echo.
pause

cd backend

echo.
echo [1/4] Installing dependencies...
echo ========================================
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [2/4] Generating Prisma Client...
echo ========================================
call npm run prisma:generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma client!
    pause
    exit /b 1
)

echo.
echo [3/4] Creating database schema...
echo ========================================
call npm run prisma:push
if errorlevel 1 (
    echo ERROR: Failed to create database schema!
    echo.
    echo Common issues:
    echo - PostgreSQL is not running
    echo - Database 'flooring_db' doesn't exist
    echo - Wrong credentials in DATABASE_URL
    echo.
    echo Please check backend\.env file and PostgreSQL service.
    pause
    exit /b 1
)

echo.
echo [4/4] Seeding initial data...
echo ========================================
call npm run prisma:seed
if errorlevel 1 (
    echo ERROR: Failed to seed database!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup Completed Successfully!
echo ========================================
echo.
echo Default admin credentials:
echo Email: admin@example.com
echo Password: Admin@123456
echo.
echo Next steps:
echo 1. Double-click 'start-backend.bat' to start backend server
echo 2. Double-click 'start-frontend.bat' to start frontend server
echo 3. Open browser: http://localhost:3000
echo.
pause
