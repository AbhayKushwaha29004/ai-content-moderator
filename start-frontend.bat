@echo off
REM Content Moderation AI - Frontend Quick Start (Windows)

echo.
echo ========================================
echo   Content Moderation AI - Frontend
echo ========================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed!
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Checking Node.js...
node --version

REM Navigate to frontend
cd frontend

REM Install dependencies
if not exist node_modules (
    echo.
    echo [2/3] Installing dependencies...
    call npm install
) else (
    echo [2/3] Dependencies already installed
)

REM Start frontend
echo.
echo [3/3] Starting frontend...
echo.
echo ========================================
echo   Frontend starting on http://localhost:3000
echo   Backend should be running on port 8000
echo   Press CTRL+C to stop
echo ========================================
echo.

call npm start

pause
