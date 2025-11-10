@echo off
echo ========================================
echo   Starting Concreexpo Frontend Server
echo ========================================
echo.

cd frontend

echo [1/2] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [2/2] Starting frontend server...
echo.
echo Server will start at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run dev

pause
