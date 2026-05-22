@echo off
REM Content Moderation AI - Quick Start Script (Windows)

echo.
echo ========================================
echo   Content Moderation AI - Quick Start
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not installed!
    echo Download from: https://python.org
    pause
    exit /b 1
)

echo [1/5] Checking Python...
python --version

REM Create virtual environment
if not exist venv (
    echo.
    echo [2/5] Creating virtual environment...
    python -m venv venv
) else (
    echo [2/5] Virtual environment exists
)

REM Activate virtual environment
echo.
echo [3/5] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo.
echo [4/5] Installing dependencies...
pip install -q -r requirements.txt

REM Start backend
echo.
echo [5/5] Starting backend...
echo.
echo ========================================
echo   Backend starting on http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo   Press CTRL+C to stop
echo ========================================
echo.

python main.py

pause
