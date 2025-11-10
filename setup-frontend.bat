@echo off
echo ========================================
echo   Concreexpo Frontend - First Time Setup
echo ========================================
echo.
echo This script will install all frontend dependencies.
echo.
pause

cd frontend

echo.
echo Installing dependencies...
echo ========================================
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup Completed Successfully!
echo ========================================
echo.
echo Frontend is ready to run!
echo.
echo Next steps:
echo 1. Make sure backend is running (start-backend.bat)
echo 2. Double-click 'start-frontend.bat' to start frontend
echo 3. Open browser: http://localhost:3000
echo.
pause
